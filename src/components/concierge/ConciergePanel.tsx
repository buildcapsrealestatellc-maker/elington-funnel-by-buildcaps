"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { LiveDot } from "@/components/ui/Kit";
import type { ConciergeMessage } from "@/lib/concierge/tools";
import { broker, whatsappLink } from "@/lib/data/broker";
import { useUi } from "@/lib/store";
import { goToSection, RichText, ToolCard } from "./Cards";
import { Ellis } from "./Ellis";

const transport = new DefaultChatTransport<ConciergeMessage>({ api: "/api/concierge" });

const suggestions = [
  "Which office fits a team of 25?",
  "How does the 70/30 payment plan work?",
  "How far is DIFC?",
  "What's on the amenity levels?",
];

const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

/** Typing indicator: the lift's floor counter ticking up. */
function FloorTicker() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v % 60) + 1), 90);
    return () => clearInterval(id);
  }, []);
  return (
    <div role="status" className="flex items-center gap-3 text-stone" aria-label="The concierge is typing">
      <span className="numerals grid h-7 min-w-11 place-items-center rounded-md bg-ink px-2 text-[0.75rem] text-paper">
        L{String(n).padStart(2, "0")}
      </span>
      <span className="eyebrow text-[0.52rem]">Going up</span>
    </div>
  );
}

export function ConciergePanel({ open }: { open: boolean }) {
  const close = useUi((s) => s.closeConcierge);
  const lenis = useUi((s) => s.lenis);
  const { messages, sendMessage, status, error, stop, clearError, regenerate } = useChat<ConciergeMessage>({
    transport,
  });
  const [input, setInput] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const handled = useRef(new Set<string>());
  const busy = status === "submitted" || status === "streaming";

  const ask = (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    clearError();
    sendMessage({ text: q });
    setInput("");
  };

  // A question handed over from elsewhere on the page ("Ask the concierge").
  // biome-ignore lint/correctness/useExhaustiveDependencies: run only when the panel opens
  useEffect(() => {
    if (!open) return;
    const prompt = useUi.getState().takeConciergePrompt();
    if (prompt) ask(prompt);
    const t = setTimeout(() => field.current?.focus({ preventScroll: true }), 450);
    return () => clearTimeout(t);
  }, [open]);

  // On phones the panel is full screen, so freeze the page behind it.
  useEffect(() => {
    if (!open || isDesktop()) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [open, lenis]);

  // Keep the newest message in view.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run whenever messages or status change
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // On desktop, "take me to…" rides the lift there while the chat stays open.
  useEffect(() => {
    const last = messages.at(-1);
    if (last?.role !== "assistant" || !isDesktop()) return;
    for (const part of last.parts) {
      if (
        part.type === "tool-showSection" &&
        part.state === "output-available" &&
        !handled.current.has(part.toolCallId)
      ) {
        handled.current.add(part.toolCallId);
        goToSection(part.output);
      }
    }
  }, [messages]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const lastText =
    messages.at(-1)?.role === "assistant" ? messages.at(-1)?.parts.some((p) => p.type === "text") : false;

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label="Berkeley Concierge"
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(e) => e.key === "Escape" && close()}
      className={`fixed inset-0 z-[60] flex flex-col overflow-hidden bg-paper shadow-[0_40px_120px_-30px_rgb(0_0_0/0.45)] transition-[opacity,translate] duration-500 ease-[var(--ease-out)] md:inset-auto md:bottom-6 md:right-6 md:h-[min(42rem,calc(100svh-7rem))] md:w-[26rem] md:rounded-[1.75rem_0_1.75rem_1.75rem] md:border md:border-line ${
        open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      {/* Lift doors part as the panel opens */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 bg-ink transition-transform delay-100 duration-[520ms] ease-[var(--ease-cine)] ${
          open ? "-translate-x-full" : "translate-x-0"
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 bg-ink transition-transform delay-100 duration-[520ms] ease-[var(--ease-cine)] ${
          open ? "translate-x-full" : "translate-x-0"
        }`}
      />

      <header className="relative flex items-center justify-between gap-4 bg-ink px-5 py-4 text-paper">
        <div className="flex items-center gap-3">
          <Ellis className="size-11 shrink-0 rounded-full ring-1 ring-paper/15" />
          <div>
            <p className="display text-[0.85rem]">Ellis · Concierge</p>
            <p className="mt-0.5 flex items-center gap-2 text-[0.72rem] text-paper/60">
              <LiveDot className="text-accent-bright" /> Answers from the project brief
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close the concierge"
          className="grid size-10 cursor-pointer place-items-center rounded-full border border-paper/20 transition-transform duration-500 hover:rotate-90"
        >
          <svg aria-hidden="true" viewBox="0 0 14 14" className="size-3" stroke="currentColor" strokeWidth={1.4}>
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </header>

      <div
        ref={list}
        data-lenis-prevent=""
        aria-live="polite"
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-5"
      >
        <div className="flex flex-col gap-4">
          <div className="max-w-[88%] self-start rounded-2xl rounded-bl-md bg-mist px-4 py-3 text-[0.9rem] leading-relaxed text-ink">
            Ellis here, Berkeley's concierge. Ask me about office sizes, the payment plan, the location or the
            amenities. I'll answer straight, and save the sarcasm for your scrolling.
          </div>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="cursor-pointer rounded-full border border-accent/25 bg-accent-soft/50 px-3.5 py-2 text-left text-[0.8rem] text-accent-deep transition-colors hover:bg-accent-soft"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div
                key={m.id}
                className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-ink px-4 py-3 text-[0.9rem] leading-relaxed text-paper"
              >
                {m.parts.map((p) => (p.type === "text" ? p.text : null))}
              </div>
            ) : (
              <div key={m.id} className="flex max-w-[92%] flex-col self-start">
                {m.parts.map((p, i) => {
                  if (p.type === "text") {
                    return p.text.trim() ? (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: parts have no ids; order is stable
                        key={i}
                        className="rounded-2xl rounded-bl-md bg-mist px-4 py-3 text-[0.9rem] leading-relaxed text-ink"
                      >
                        <RichText text={p.text} />
                      </div>
                    ) : null;
                  }
                  if ("toolCallId" in p) return <ToolCard key={p.toolCallId} part={p} />;
                  return null;
                })}
              </div>
            ),
          )}

          {busy && !lastText && <FloorTicker />}

          {error && (
            <div className="rounded-2xl border border-line px-4 py-3 text-[0.85rem] text-ink">
              The concierge couldn't answer just now.{" "}
              <button type="button" onClick={() => regenerate()} className="cursor-pointer text-accent underline">
                Try again
              </button>{" "}
              or{" "}
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                WhatsApp {broker.phone}
              </a>
              .
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="border-t border-line px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:px-5"
      >
        <div className="flex items-end gap-2 rounded-[1.4rem] border border-line bg-paper py-1.5 pl-4 pr-1.5 focus-within:border-accent/50">
          <label htmlFor="concierge-input" className="sr-only">
            Ask the concierge
          </label>
          <textarea
            id="concierge-input"
            ref={field}
            rows={1}
            value={input}
            maxLength={1200}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            placeholder="Ask about sizes, payments, location…"
            className="max-h-28 min-h-9 flex-1 resize-none bg-transparent py-2 text-[0.9rem] text-ink outline-none placeholder:text-stone/60"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              aria-label="Stop the answer"
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-ink text-paper"
            >
              <span className="size-2.5 rounded-[2px] bg-paper" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-accent text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M6 10.5v-9M2 5.5l4-4 4 4" />
              </svg>
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-[0.66rem] text-stone">
          Prices and dates are confirmed only by a consultant. Don't share personal details here.
        </p>
      </form>
    </section>
  );
}
