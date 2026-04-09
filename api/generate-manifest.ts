import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import type { ProfileType, SurveyState } from "../src/types";
import {
  buildManifestPrompt,
  extractClientReportFromMessage,
} from "../src/lib/clientManifest";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return res.status(503).json({
      clientReport:
        "No se puede generar el manifiesto: falta OPENAI_API_KEY en las variables de entorno de Vercel (Production / Preview).",
      error: "missing_api_key",
    });
  }

  try {
    const { surveyState, dominantProfile } = (req.body || {}) as {
      surveyState?: SurveyState;
      dominantProfile?: ProfileType;
    };
    if (!surveyState || !dominantProfile) {
      return res.status(400).json({
        clientReport: "Solicitud inválida: faltan datos de la encuesta.",
        error: "invalid_body",
      });
    }

    const openai = new OpenAI({ apiKey: key });
    const prompt = buildManifestPrompt(surveyState, dominantProfile);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    const content = response.choices[0]?.message?.content;
    const result = extractClientReportFromMessage(content);
    return res.status(200).json(result);
  } catch (e) {
    console.error("generate-manifest:", e);
    return res.status(500).json({
      clientReport:
        "No se pudo generar el manifiesto (error al contactar OpenAI). Revisa la clave, saldo y conexión.",
      error: "openai_failed",
    });
  }
}
