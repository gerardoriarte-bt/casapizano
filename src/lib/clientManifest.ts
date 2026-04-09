import {
  APARTMENT_SIZE_LABELS,
  type ProfileType,
  type SurveyState,
} from "../types";
import { PROFILE_DEFINITIONS, QUESTIONS } from "../data/survey";

export type ClientReportResult = { clientReport: string };

export function buildManifestPrompt(
  state: SurveyState,
  dominantProfile: ProfileType
): string {
  const profileDef = PROFILE_DEFINITIONS[dominantProfile];
  const choicesSummary = Object.entries(state.answers)
    .map(([qId, optId]) => {
      const q = QUESTIONS.find((q) => q.id === qId);
      const opt = q?.options.find((o) => o.id === optId);
      return `- [${q?.title}] Pregunta: ${q?.question} → Respuesta elegida: ${opt?.text}. Criterio de diseño: ${opt?.essentialElement}`;
    })
    .join("\n");

  const scoresLine = (Object.entries(state.scores) as [ProfileType, number][])
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const purchaseContext =
    state.alreadyPurchased === null
      ? "Compra: no indicada en el formulario."
      : state.alreadyPurchased === false
        ? state.apartmentSizeBand
          ? `Compra: aún no ha comprado (prospecto / en búsqueda). Interés aproximado en superficie: ${APARTMENT_SIZE_LABELS[state.apartmentSizeBand]}.`
          : "Compra: aún no ha comprado el apartamento (prospecto / en búsqueda)."
        : "Compra: ya compró el apartamento.";

  return `
      Eres escritor de concepto y arquitecto de experiencia para Casa Pizano (Bogotá). Tienes la encuesta completa de un cliente.

      DATOS DEL HOGAR:
      - Nombre: ${state.userName}
      - ${purchaseContext}
      - Personas que habitarán el apartamento: ${state.inhabitants}
      - Edades: ${state.ages || "no indicadas"}
      - Mascotas: ${state.pets || "ninguna indicada"}

      PERFIL DOMINANTE (matriz de puntuación): ${dominantProfile}
      Resumen de puntos por eje: ${scoresLine}
      Nota del perfil: ${profileDef.title} — ${profileDef.description} (${profileDef.identity})

      ELECCIONES TEMÁTICAS (usa esto como única fuente de verdad; no inventes preferencias que no aparezcan aquí):
      ${choicesSummary}

      TAREA — únicamente el manifiesto del cliente:

      clientReport — MANIFIESTO DEL APARTAMENTO SOÑADO (markdown ligero)
      - Español. Tono poético, evocador y preciso; NADA de catálogo de lujo genérico ni lista de marcas.
      - Máximo aproximado 160 palabras (nunca más de 200). Prioriza calidad sobre cantidad.
      - Debe sonar como el sueño concreto de SU apartamento: teje luz, silencio o encuentro, cocina, terraza, dormitorio, baño, circulación, etc. SOLO en la medida en que eso surja del RESUMEN DE ELECCIONES y de los datos del hogar.
      - Integra con sutileza quiénes viven allí (familia, edades si aportan matiz, mascotas si hay).
      - Estructura obligatoria:
        * Una sola línea de título: ## seguido de un título breve y personal (sin el nombre del perfil en el título).
        * Luego 2 o 3 párrafos cortos (sin listas con viñetas ni numeración).
        * Cierra con una sola frase corta que mencione el perfil dominante (${dominantProfile}) como eco, no como slogan publicitario.
      - No repitas textualmente las preguntas de la encuesta; tradúcelas a imágenes habitables.

      Responde ÚNICAMENTE con un JSON válido:
      { "clientReport": "..." }
    `;
}

export function extractClientReportFromMessage(
  content: string | null | undefined
): ClientReportResult {
  const text = content || "{}";
  try {
    const parsed = JSON.parse(text) as Partial<ClientReportResult>;
    const clientReport =
      typeof parsed.clientReport === "string"
        ? parsed.clientReport
        : "No se pudo generar el manifiesto.";
    return { clientReport };
  } catch {
    return { clientReport: "No se pudo interpretar la respuesta del modelo." };
  }
}
