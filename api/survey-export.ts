const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return Response.json(
        { ok: false, error: "method_not_allowed" },
        { status: 405, headers: corsHeaders }
      );
    }

    const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
    if (!url) {
      return Response.json(
        { ok: true, skipped: true, reason: "webhook_not_configured" },
        { status: 200, headers: corsHeaders }
      );
    }

    let payload: unknown = {};
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await r.text();
      if (!r.ok) {
        console.error("GOOGLE_SHEETS_WEBHOOK_URL error:", r.status, text);
        return Response.json(
          { ok: false, error: "webhook_failed" },
          { status: 502, headers: corsHeaders }
        );
      }
      return Response.json(
        { ok: true, sent: true },
        { status: 200, headers: corsHeaders }
      );
    } catch (e) {
      console.error("survey-export:", e);
      return Response.json(
        { ok: false, error: "internal" },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
