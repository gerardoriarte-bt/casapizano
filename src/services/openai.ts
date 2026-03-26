import OpenAI from "openai";
import { SurveyState, ProfileType } from "../types";
import { PROFILE_DEFINITIONS, QUESTIONS } from "../data/survey";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true // Since this is a prototype running in the client
});

export async function generateFinalImages(state: SurveyState, dominantProfile: ProfileType): Promise<string[]> {
  try {
    const profileDef = PROFILE_DEFINITIONS[dominantProfile];
    const essentialElements = Object.entries(state.answers).map(([qId, optId]) => {
      const q = QUESTIONS.find(q => q.id === qId);
      const opt = q?.options.find(o => o.id === optId);
      return opt?.essentialElement;
    }).filter(Boolean);

    const prompts = [
      `Ultra-luxury interior design in Bogotá. Main social area with exclusive decoration and art curation. Style: ${profileDef.title}. Elements: ${essentialElements.slice(0, 4).join(', ')}. European design furniture, noble materials, indirect architectural lighting, high-end atmosphere. Realistic photography.`,
      `Extreme luxury interiorism for a workspace or private study. Exclusive decoration, rich textures, and premium finishes. Style: ${profileDef.title}. Elements: ${essentialElements.slice(4, 8).join(', ')}. Large windows with views of Bogotá hills, marble, natural wood, and linen. Realistic photography.`,
      `Interior design detail in a transition space or gourmet area. Exclusive decoration, focus on materiality and constructive detail. Style: ${profileDef.title}. Elements: ${essentialElements.slice(8).join(', ')}. Dramatic lighting, integrated indoor vegetation, sophisticated contemporary luxury. Realistic photography.`
    ];

    const imagePromises = prompts.map(prompt => 
      openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
      })
    );

    const responses = await Promise.all(imagePromises);
    const imageUrls = responses.map(res => res.data[0].url).filter(Boolean) as string[];

    return imageUrls;
  } catch (error) {
    console.error("Error generating final images:", error);
    return [];
  }
}

export async function generateFinalReports(state: SurveyState, dominantProfile: ProfileType) {
  try {
    const profileDef = PROFILE_DEFINITIONS[dominantProfile];
    const choicesSummary = Object.entries(state.answers).map(([qId, optId]) => {
      const q = QUESTIONS.find(q => q.id === qId);
      const opt = q?.options.find(o => o.id === optId);
      return `- ${q?.title}: ${opt?.text} (Elemento: ${opt?.essentialElement})`;
    }).join('\n');

    const prompt = `
      Eres un Arquitecto Computacional y Director de Experiencia Digital para un estudio de arquitectura de lujo en Bogotá.
      Genera dos informes basados en los resultados de una encuesta de hábitat.

      DATOS DEL CLIENTE:
      Nombre: ${state.userName}
      Habitantes: ${state.inhabitants} (${state.ages})
      Mascotas: ${state.pets}
      Perfil Dominante: ${dominantProfile}
      Definición del Perfil: ${profileDef.description} - ${profileDef.identity}
      
      RESUMEN DE ELECCIONES:
      ${choicesSummary}

      TAREA:
      1. OUTPUT 1 (VISTA CLIENTE): Un texto aspiracional, inspirador y personalizado que describa su hábitat ideal como una obra de arte habitable. Usa un tono de lujo extremo. Describe cómo su personalidad se refleja en la curaduría de materiales, mobiliario de diseño y espacios decorados exclusivamente. Incluye un encabezado con el nombre del perfil, un extracto de identidad y un párrafo narrativo que combine sus elecciones.
      2. OUTPUT 2 (INFORME TÉCNICO): Un documento estructurado para el equipo de diseño y arquitectura. Incluye datos del cliente, perfil dominante, perfiles secundarios (si aplica) y un resumen técnico de preferencias arquitectónicas y de interiorismo, listando los elementos esenciales de cada elección y sugiriendo una paleta de materiales y mobiliario de alta gama.

      Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
      {
        "clientReport": "texto aquí",
        "architectReport": "texto aquí"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0].message.content || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating reports:", error);
    return {
      clientReport: "Error al generar el informe. Por favor intenta de nuevo.",
      architectReport: "Error al generar el informe técnico."
    };
  }
}
