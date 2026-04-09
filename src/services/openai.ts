import type { SurveyState, ProfileType } from "../types";
import { resolveApiUrl } from "../lib/apiBase";

export type ClientReportResult = { clientReport: string };

/**
 * Manifiesto vía POST /api/generate-manifest (Express en local, Serverless en Vercel).
 */
export async function generateClientReport(
  state: SurveyState,
  dominantProfile: ProfileType
): Promise<ClientReportResult> {
  try {
    const r = await fetch(resolveApiUrl("/api/generate-manifest"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surveyState: state, dominantProfile }),
    });

    const raw = await r.text();
    let data: Partial<ClientReportResult> & { error?: string } = {};
    try {
      data = raw ? (JSON.parse(raw) as typeof data) : {};
    } catch {
      return {
        clientReport:
          r.status === 404
            ? "No se encontró la ruta /api/generate-manifest. En Vercel, despliega de nuevo con la carpeta api/ y vercel.json actualizados."
            : `La respuesta del servidor no es JSON (${r.status}). Si usas Vercel, revisa la función api/generate-manifest y los rewrites.`,
      };
    }

    if (typeof data.clientReport === "string" && data.clientReport.length > 0) {
      return { clientReport: data.clientReport };
    }

    return {
      clientReport:
        data.error === "missing_api_key"
          ? "Falta OPENAI_API_KEY en el servidor (Vercel → Settings → Environment Variables)."
          : `No se pudo generar el manifiesto (HTTP ${r.status}). ${data.error ? `Código: ${data.error}` : ""}`.trim(),
    };
  } catch (error) {
    console.error("generateClientReport fetch:", error);
    return {
      clientReport:
        "Error de red al contactar /api/generate-manifest. Comprueba conexión, CORS y que el despliegue incluya las funciones serverless.",
    };
  }
}
