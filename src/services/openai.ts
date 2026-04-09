import type { SurveyState, ProfileType } from "../types";

export type ClientReportResult = { clientReport: string };

/**
 * Genera el manifiesto vía el servidor (OpenAI no admite llamadas desde el navegador por CORS).
 * Requiere `npm run dev` con Express o un despliegue que exponga POST /api/generate-manifest.
 */
export async function generateClientReport(
  state: SurveyState,
  dominantProfile: ProfileType
): Promise<ClientReportResult> {
  try {
    const r = await fetch("/api/generate-manifest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surveyState: state, dominantProfile }),
    });
    const data = (await r.json()) as Partial<ClientReportResult> & {
      error?: string;
    };
    if (typeof data.clientReport === "string" && data.clientReport.length > 0) {
      return { clientReport: data.clientReport };
    }
    return {
      clientReport:
        "No se pudo generar el manifiesto. Comprueba OPENAI_API_KEY en .env y que uses el servidor de desarrollo (npm run dev).",
    };
  } catch (error) {
    console.error("generateClientReport fetch:", error);
    return {
      clientReport:
        "Error de red al generar el manifiesto. ¿Estás usando `npm run dev` (servidor Express) y no solo `vite preview`?",
    };
  }
}
