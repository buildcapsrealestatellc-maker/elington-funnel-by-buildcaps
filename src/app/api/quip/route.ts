import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { cleanQuip, offlineQuip, quipInstructions, quipPrompt, quipRequest } from "@/lib/concierge/quips";
import { rateLimited } from "@/lib/lead/server";

export const maxDuration = 15;

/** One line from Ellis about what the visitor just did. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(`quip:${ip}`, 30)) return Response.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = quipRequest.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const q = parsed.data;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { text } = await generateText({
        model: anthropic("claude-haiku-5-5"),
        instructions: {
          role: "system",
          content: quipInstructions,
          providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
        },
        prompt: quipPrompt(q),
        maxOutputTokens: 80,
        timeout: 8000,
        providerOptions: { anthropic: { thinking: { type: "disabled" }, effort: "low" } },
      });
      const line = cleanQuip(text);
      const repeated = q.recent.some((r) => r.toLowerCase() === line.toLowerCase());
      // Only a finished, short sentence: a cut-off or rambling line falls back.
      const words = line.split(/\s+/).length;
      const complete = /[.!?…]["”’)]?$/.test(line);
      if (line.length > 8 && words <= 24 && complete && !repeated) return Response.json({ line, source: "ai" });
    } catch (error) {
      console.error("[quip]", error);
    }
  }
  return Response.json({ line: offlineQuip(q), source: "offline" });
}
