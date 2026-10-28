"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/Kit";
import { whatsappLink } from "@/lib/data/broker";
import { track } from "@/lib/lead/track";
import { prefersReducedMotion } from "@/lib/motion/gsap";
import { useUi } from "@/lib/store";
import { Ellis } from "./Ellis";
import { type Quip, useQuips } from "./useQuips";

// The chat (and the AI SDK) loads only when someone opens it.
const ConciergePanel = dynamic(() => import("./ConciergePanel").then((m) => m.ConciergePanel), { ssr: false });

/** Types a remark out, character by character. */
function useTypewriter(quip: Quip | null) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!quip) return;
    if (prefersReducedMotion()) {
      setShown(quip.text);
      return;
    }
    let i = 0;
    setShown("");
    const id = window.setInterval(() => {
      i += 1;
      setShown(quip.text.slice(0, i));
      if (i >= quip.text.length) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  }, [quip]);
  return shown;
}

/** Ellis: the Concierge's face. Watches you browse, says so, opens the chat. */
export function Concierge() {
  const open = useUi((s) => s.conciergeOpen);
  const openConcierge = useUi((s) => s.openConcierge);
  const blocked = useUi((s) => s.leadOpen || !!s.tool || s.keypadOpen);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // Appears once the hero has played, like the mobile bar.
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = shown && !open && !blocked;
  const { quip, muted, dismiss, mute, unmute } = useQuips(visible);
  const typed = useTypewriter(quip);
  const talking = !!quip && typed.length < quip.text.length;

  return (
    <>
      {mounted && <ConciergePanel open={open} />}
      <div
        className={`fixed bottom-[5.5rem] right-4 z-[45] flex flex-col items-center gap-3 transition-[opacity,translate] duration-500 ease-[var(--ease-out)] md:bottom-8 md:right-8 ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {quip && (
          <div
            key={quip.id}
            role="status"
            className="corner-sm absolute bottom-full right-0 mb-3 w-[min(19rem,calc(100vw-2rem))] animate-[dialog-in_400ms_var(--ease-out)] bg-paper p-4 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.5)] md:bottom-1 md:right-full md:mb-0 md:mr-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-[0.5rem] text-accent">Ellis · Concierge</p>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="-mr-1 -mt-1 grid size-6 cursor-pointer place-items-center rounded-full text-stone hover:text-ink"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 14 14"
                  className="size-2.5"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            </div>
            {/* Full text reserves the space; the typed text sits on top */}
            <p className="relative mt-2 text-[0.92rem] leading-snug text-ink">
              <span className="invisible">{quip.text}</span>
              <span className="absolute inset-0">{typed}</span>
            </p>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  dismiss();
                  openConcierge();
                }}
                className="eyebrow cursor-pointer text-[0.52rem] text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
              >
                Ask Ellis
              </button>
              <button
                type="button"
                onClick={mute}
                className="eyebrow cursor-pointer text-[0.52rem] text-stone hover:text-ink"
              >
                Quiet, please
              </button>
            </div>
            {/* Tail pointing at Ellis */}
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 right-6 size-3 rotate-45 bg-paper md:bottom-6 md:-right-1.5"
            />
          </div>
        )}
        {/* WhatsApp with the sales team, stacked above Ellis */}
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { source: "floating" })}
          aria-label="Chat with us on WhatsApp"
          className="group relative grid size-14 place-items-center rounded-full bg-[#25d366] text-paper shadow-[0_18px_40px_-16px_rgb(37_211_102/0.75)] transition-transform duration-500 ease-[var(--ease-out)] hover:scale-105"
        >
          <WhatsAppIcon className="size-7" />
          <span className="eyebrow pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-[0.56rem] text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
            WhatsApp us
          </span>
        </a>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              dismiss();
              openConcierge();
            }}
            aria-label="Ask Ellis, the Berkeley Concierge"
            className="group relative block size-16 cursor-pointer rounded-full shadow-[0_20px_50px_-18px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-[var(--ease-out)] hover:-rotate-6 hover:scale-105"
          >
            <Ellis talking={talking} className="size-16" />
            {/* single pulse once he has been on screen a while */}
            <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-accent-bright opacity-0 animate-[concierge-ping_1.6s_ease-out_20s_2]" />
            {!quip && (
              <span className="eyebrow pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-[0.56rem] text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
                Ask Ellis
              </span>
            )}
          </button>
          {muted && (
            <button
              type="button"
              onClick={unmute}
              aria-label="Let Ellis talk again"
              title="Let Ellis talk again"
              className="absolute -left-1 -top-1 grid size-6 cursor-pointer place-items-center rounded-full border border-line bg-paper text-stone hover:text-ink"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M3 6h2.5L9 3v10L5.5 10H3zM11.5 6l3 4M14.5 6l-3 4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
