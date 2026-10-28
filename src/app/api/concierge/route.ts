import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  isStepCount,
  safeValidateUIMessages,
  streamText,
  toUIMessageStream,
} from "ai";
import { respondOffline } from "@/lib/concierge/engine";
import { conciergeInstructions } from "@/lib/concierge/knowledge";
import { type ConciergeMessage, conciergeTools, runOfflineCall } from "@/lib/concierge/tools";
import { broker } from "@/lib/data/broker";
import { rateLimited } from "@/lib/lead/server";

export const maxDuration = 30;

const MAX_HISTORY = 14;
const MAX_CHARS = 1200;
const unavailable = `The concierge is unavailable right now. Please call or WhatsApp ${broker.phone}, or request a call back.`;

const textOf = (m: ConciergeMessage) =>
  m.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join(" ");

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(`concierge:${ip}`, 40)) {
    return Response.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const checked = await safeValidateUIMessages<ConciergeMessage>({
    messages: Array.isArray(body.messages) ? body.messages.slice(-MAX_HISTORY) : [],
    tools: conciergeTools,
  });
  if (!checked.success || checked.data.length === 0) {
    return Response.json({ error: "Invalid conversation" }, { status: 400 });
  }
  const messages = checked.data;
  const last = messages.at(-1);
  if (last?.role !== "user" || textOf(last).length > MAX_CHARS) {
    return Response.json({ error: "Please keep questions under 1,200 characters." }, { status: 400 });
  }

  // Without a key the Concierge still answers, from the brief and the same engine.
  if (!process.env.ANTHROPIC_API_KEY) return offline(textOf(last));

  const result = streamText({
    model: anthropic("claude-sonnet-5-5"),
    instructions: {
      role: "system",
      content: conciergeInstructions,
      providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
    },
    messages: await convertToModelMessages(messages),
    tools: conciergeTools,
    stopWhen: isStepCount(4),
    maxOutputTokens: 1200,
    providerOptions: { anthropic: { thinking: { type: "between_tools" }, effort: "low" } },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error("[concierge]", error);
        return unavailable;
      },
    }),
  });
}

function offline(question: string) {
  const { text, calls } = respondOffline(question);
  const stream = createUIMessageStream<ConciergeMessage>({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "start-step" });
      const id = generateId();
      writer.write({ type: "text-start", id });
      // Stream word by word so it reads like the live Concierge.
      for (const word of text.split(/(?<=\s)/)) {
        writer.write({ type: "text-delta", id, delta: word });
        await new Promise((r) => setTimeout(r, 18));
      }
      writer.write({ type: "text-end", id });
      for (const call of calls) {
        const toolCallId = generateId();
        writer.write({ type: "tool-input-available", toolCallId, toolName: call.tool, input: call.input });
        writer.write({ type: "tool-output-available", toolCallId, output: await runOfflineCall(call) });
      }
      writer.write({ type: "finish-step" });
      writer.write({ type: "finish" });
    },
    onError: () => unavailable,
  });
  return createUIMessageStreamResponse({ stream });
}
