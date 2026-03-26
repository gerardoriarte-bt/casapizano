import { GoogleGenAI, Type } from "@google/genai";
import { SurveyState, ProfileType } from "../types";
import { PROFILE_DEFINITIONS, QUESTIONS } from "../data/survey";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateFinalImages(state: SurveyState, dominantProfile: ProfileType): Promise<string[]> {
  try {
    const profileDef = PROFILE_DEFINITIONS[dominantProfile];
    const essentialElements = Object.entries(state.answers).map(([qId, optId]) => {
      const q = QUESTIONS.find(q => q.id === qId);
      const opt = q?.options.find(o => o.id === optId);
      return opt?.essentialElement;
    }).filter(Boolean);

    // We'll generate 3 distinct images representing the habitat
    // Focusing on "espacios decorados exclusivamente" and "lujo"
    const prompts = [
      `Arquitectura y diseño de interiores de ultra-lujo en Bogotá. Vista de una zona social principal con decoración exclusiva y curaduría de arte. Estilo ${profileDef.title}. Detalles específicos: ${essentialElements.slice(0, 4).join(', ')}. Mobiliario de diseño europeo, materiales nobles, iluminación arquitectónica indirecta, atmósfera de alta gama.`,
      `Interiorismo de lujo extremo para un espacio de descanso o estudio privado. Decoración exclusiva, texturas ricas y acabados premium. Estilo ${profileDef.title}. Detalles específicos: ${essentialElements.slice(4, 8).join(', ')}. Grandes ventanales con vista a los cerros de Bogotá, materiales como mármol, madera natural y lino.`,
      `Detalle de diseño interior en un espacio de transición o área gourmet. Decoración exclusiva, enfoque en la materialidad y el detalle constructivo. Estilo ${profileDef.title}. Detalles específicos: ${essentialElements.slice(8).join(', ')}. Iluminación dramática, vegetación interior integrada, lujo contemporáneo y sofisticado.`
    ];

    const imagePromises = prompts.map(prompt => 
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
      })
    );

    const responses = await Promise.all(imagePromises);
    const imageUrls: string[] = [];

    for (const response of responses) {
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrls.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    }

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
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clientReport: { type: Type.STRING },
            architectReport: { type: Type.STRING }
          },
          required: ["clientReport", "architectReport"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating reports:", error);
    return {
      clientReport: "Error al generar el informe. Por favor intenta de nuevo.",
      architectReport: "Error al generar el informe técnico."
    };
  }
}
