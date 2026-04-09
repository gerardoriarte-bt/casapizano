import OpenAI from "openai";
import type { ProfileType, SurveyState } from "../src/types";
import {
  buildManifestPrompt,
  extractClientReportFromMessage,
} from "../src/lib/clientManifest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** Vercel Node runtime: firma Web estándar `export default { fetch }` (compatible con `"type": "module"`). */
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "method_not_allowed" },
        { status: 405, headers: corsHeaders }
      );
    }

    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) {
      return Response.json(
        {
          clientReport:
            "No se puede generar el manifiesto: falta OPENAI_API_KEY en las variables de entorno de Vercel (Production / Preview).",
          error: "missing_api_key",
        },
        { status: 503, headers: corsHeaders }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          clientReport: "Cuerpo de la petición inválido (se esperaba JSON).",
          error: "invalid_json",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { surveyState, dominantProfile } = (body || {}) as {
      surveyState?: SurveyState;
      dominantProfile?: ProfileType;
    };

    if (!surveyState || !dominantProfile) {
      return Response.json(
        {
          clientReport: "Solicitud inválida: faltan datos de la encuesta.",
          error: "invalid_body",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      const openai = new OpenAI({ apiKey: key });
      const prompt = buildManifestPrompt(surveyState, dominantProfile);
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message?.content;
      const result = extractClientReportFromMessage(content);
      return Response.json(result, { status: 200, headers: corsHeaders });
    } catch (e) {
      console.error("generate-manifest:", e);
      return Response.json(
        {
          clientReport:
            "No se pudo generar el manifiesto (error al contactar OpenAI). Revisa la clave, saldo y conexión.",
          error: "openai_failed",
        },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
