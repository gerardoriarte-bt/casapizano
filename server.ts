import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import type { ProfileType, SurveyState } from "./src/types.ts";
import {
  buildManifestPrompt,
  extractClientReportFromMessage,
} from "./src/lib/clientManifest.ts";

dotenv.config();

/**
 * POST /api/survey-export
 * Reenvía el cuerpo JSON al webhook configurado (p. ej. Google Apps Script desplegado como aplicación web).
 *
 * Cuerpo típico (lo envía el cliente tras completar la encuesta):
 * - submittedAt, userName, inhabitants, ages, pets, dominantProfile
 * - scores, answers (ids), answersHuman[{ id, title, question, optionId, optionText }]
 * - clientReport (markdown del manifiesto)
 *
 * Ejemplo mínimo de Google Apps Script (editor de Apps Script vinculado a la hoja):
 *
 * function doPost(e) {
 *   const data = JSON.parse(e.postData.contents);
 *   const sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   sh.appendRow([
 *     data.submittedAt,
 *     data.userName,
 *     data.alreadyPurchased,
 *     data.apartmentSizeLabel,
 *     data.inhabitants,
 *     data.ages,
 *     data.pets,
 *     data.dominantProfile,
 *     JSON.stringify(data.scores),
 *     JSON.stringify(data.answers),
 *     data.clientReport
 *   ]);
 *   return ContentService.createTextOutput(JSON.stringify({ ok: true }))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 *
 * Despliega → Implementación → Nueva implementación → Tipo: Aplicación web → Ejecutar como: Yo → Quién tiene acceso: Cualquiera.
 * Copia la URL en GOOGLE_SHEETS_WEBHOOK_URL.
 */
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  app.post("/api/generate-manifest", async (req, res) => {
    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) {
      return res.status(503).json({
        clientReport:
          "No se puede generar el manifiesto: falta OPENAI_API_KEY en el archivo .env del proyecto (servidor).",
        error: "missing_api_key",
      });
    }
    try {
      const body = req.body as {
        manifestPrompt?: string;
        surveyState?: SurveyState;
        dominantProfile?: ProfileType;
      };
      let prompt: string;
      if (typeof body.manifestPrompt === "string" && body.manifestPrompt.trim()) {
        prompt = body.manifestPrompt.trim();
      } else if (body.surveyState && body.dominantProfile) {
        prompt = buildManifestPrompt(body.surveyState, body.dominantProfile);
      } else {
        return res.status(400).json({
          clientReport: "Solicitud inválida: faltan datos de la encuesta.",
          error: "invalid_body",
        });
      }
      const openai = new OpenAI({ apiKey: key });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message?.content;
      const result = extractClientReportFromMessage(content);
      return res.json(result);
    } catch (e) {
      console.error("generate-manifest:", e);
      return res.status(500).json({
        clientReport:
          "No se pudo generar el manifiesto (error al contactar OpenAI). Revisa la clave, saldo y conexión.",
        error: "openai_failed",
      });
    }
  });

  app.post("/api/survey-export", async (req, res) => {
    const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
    if (!url) {
      return res.json({ ok: true, skipped: true, reason: "webhook_not_configured" });
    }
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      const text = await r.text();
      if (!r.ok) {
        console.error("GOOGLE_SHEETS_WEBHOOK_URL error:", r.status, text);
        return res.status(502).json({ ok: false, error: "webhook_failed" });
      }
      return res.json({ ok: true, sent: true });
    } catch (e) {
      console.error("survey-export:", e);
      return res.status(500).json({ ok: false, error: "internal" });
    }
  });

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
