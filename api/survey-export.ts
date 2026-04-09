import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Reenvía el payload al webhook de Google Sheets (misma lógica que server.ts en local).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!url) {
    return res.status(200).json({ ok: true, skipped: true, reason: "webhook_not_configured" });
  }

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });
    const text = await r.text();
    if (!r.ok) {
      console.error("GOOGLE_SHEETS_WEBHOOK_URL error:", r.status, text);
      return res.status(502).json({ ok: false, error: "webhook_failed" });
    }
    return res.status(200).json({ ok: true, sent: true });
  } catch (e) {
    console.error("survey-export:", e);
    return res.status(500).json({ ok: false, error: "internal" });
  }
}
