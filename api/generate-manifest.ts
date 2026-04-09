/**
 * Sin imports desde `src/`: en Vite + Vercel el bundle de `/api` a veces no resuelve
 * `../src/**` y la función revienta al cargar (500 con HTML, no JSON).
 *
 * El cliente envía `manifestPrompt` ya armado con `buildManifestPrompt`.
 */

const MAX_PROMPT_CHARS = 100_000;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type OpenAIChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

function extractClientReportFromMessage(
  content: string | null | undefined
): { clientReport: string } {
  const text = content || "{}";
  try {
    const parsed = JSON.parse(text) as Partial<{ clientReport: string }>;
    const clientReport =
      typeof parsed.clientReport === "string"
        ? parsed.clientReport
        : "No se pudo generar el manifiesto.";
    return { clientReport };
  } catch {
    return {
      clientReport: "No se pudo interpretar la respuesta del modelo.",
    };
  }
}

async function callOpenAIChat(
  apiKey: string,
  prompt: string
): Promise<{ content: string | null; httpError?: string }> {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  const raw = await r.text();
  let data: OpenAIChatCompletionResponse = {};
  try {
    data = raw ? (JSON.parse(raw) as OpenAIChatCompletionResponse) : {};
  } catch {
    return {
      content: null,
      httpError: `OpenAI devolvió un cuerpo no JSON (HTTP ${r.status}).`,
    };
  }

  if (!r.ok) {
    const msg =
      data.error?.message ||
      (typeof raw === "string" && raw.length < 500 ? raw : `HTTP ${r.status}`);
    return { content: null, httpError: msg };
  }

  const content = data.choices?.[0]?.message?.content ?? null;
  return { content };
}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
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

      const manifestPrompt =
        typeof (body as { manifestPrompt?: unknown })?.manifestPrompt ===
        "string"
          ? (body as { manifestPrompt: string }).manifestPrompt.trim()
          : "";

      if (!manifestPrompt || manifestPrompt.length > MAX_PROMPT_CHARS) {
        return Response.json(
          {
            clientReport:
              "Solicitud inválida: falta manifestPrompt o excede el tamaño permitido.",
            error: "invalid_body",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      const { content, httpError } = await callOpenAIChat(key, manifestPrompt);

      if (httpError) {
        console.error("generate-manifest OpenAI:", httpError);
        return Response.json(
          {
            clientReport:
              "No se pudo generar el manifiesto (error al contactar OpenAI). Revisa la clave, saldo y cuotas.",
            error: "openai_failed",
          },
          { status: 502, headers: corsHeaders }
        );
      }

      const result = extractClientReportFromMessage(content);
      return Response.json(result, { status: 200, headers: corsHeaders });
    } catch (e) {
      console.error("generate-manifest:", e);
      return Response.json(
        {
          clientReport:
            "No se pudo generar el manifiesto (error interno del servidor).",
          error: "internal",
        },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
