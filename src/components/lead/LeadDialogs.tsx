"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { WaveField } from "@/components/brand/Decor";
import { BerkeleyMark } from "@/components/brand/logos";
import { Pill } from "@/components/ui/Kit";
import { brochure, goldenVisa } from "@/lib/data/tower";
import { captureAttribution } from "@/lib/lead/attribution";
import { media } from "@/lib/media";
import { gsap, prefersReducedMotion, setupGsap } from "@/lib/motion/gsap";
import { useUi } from "@/lib/store";
import { BrochureCover } from "./BrochureCover";
import { LeadForm } from "./LeadForm";

function CloseButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Dialog.Close
      className={`absolute right-4 top-4 z-10 grid size-10 cursor-pointer place-items-center rounded-full border transition duration-500 hover:rotate-90 ${
        tone === "dark"
          ? "border-ink/10 bg-paper/70 text-ink/70 hover:border-ink/40 hover:text-ink"
          : "border-paper/25 text-paper/80 hover:border-paper/60 hover:text-paper"
      }`}
    >
      <span className="sr-only">Close</span>
      <svg aria-hidden="true" viewBox="0 0 14 14" className="size-3.5" stroke="currentColor" strokeWidth={1.4}>
        <path d="M1 1l12 12M13 1L1 13" />
      </svg>
    </Dialog.Close>
  );
}

/** A tick in a ring, for what-you-get lists. */
function Tick({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-current/40 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="size-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path d="M2.5 6.2l2.2 2.2 4.8-4.8" />
      </svg>
    </span>
  );
}

/** Size and page count, plus the Golden Visa line, under every brochure offer. */
function BrochureMeta({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill tone={dark ? "dark" : "line"}>
        PDF · {brochure.pages} pages · {brochure.size}
      </Pill>
      <Pill tone="accent">★ {goldenVisa.years}-year Golden Visa route</Pill>
    </div>
  );
}

/** Left column of the dialog when the visitor asked for the brochure. */
function BrochureAside() {
  return (
    <div className="relative hidden flex-col justify-between gap-8 overflow-y-auto bg-ink p-9 text-paper md:flex md:max-h-[88vh]">
      <div aria-hidden="true" className="blueprint absolute inset-0" />
      <div aria-hidden="true" className="glow absolute -right-1/2 -top-1/3 size-[34rem]" />
      <BrochureCover className="relative mx-auto mt-2 w-[min(13rem,62%)] shrink-0" sizes="13rem" />
      <div className="relative">
        <p className="display text-[1.7rem] leading-[1.08] [&_em]:text-accent-bright">
          The full <em>Berkeley</em> brochure.
        </p>
        <ul className="mt-5 flex flex-col gap-2.5">
          {brochure.contents.map((c) => (
            <li key={c} className="flex items-start gap-3 text-[0.9rem] text-paper/80">
              <Tick className="text-accent-bright" />
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <BrochureMeta dark />
        </div>
      </div>
    </div>
  );
}

/** Store-driven lead dialog used by every CTA on the page: the brochure or launch access. */
export function LeadDialog() {
  const open = useUi((s) => s.leadOpen);
  const intent = useUi((s) => s.leadIntent);
  const closeLead = useUi((s) => s.closeLead);
  const lenis = useUi((s) => s.lenis);
  const wantsBrochure = intent.offer === "brochure";

  useEffect(() => {
    if (open) lenis?.stop();
    else if (!useUi.getState().tool) lenis?.start();
  }, [open, lenis]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && closeLead()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-[3px] data-[state=open]:animate-[fade-in_400ms_var(--ease-silk)]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[81] max-h-[94dvh] overflow-y-auto rounded-t-[1.75rem] bg-paper data-[state=open]:animate-[sheet-up_600ms_var(--ease-silk)] md:inset-auto md:rounded-[1.75rem_0_1.75rem_1.75rem] md:left-1/2 md:top-1/2 md:grid md:max-h-[88vh] md:w-[min(64rem,94vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:grid-cols-[0.9fr_1.1fr] md:overflow-hidden md:data-[state=open]:animate-[dialog-in_600ms_var(--ease-silk)]">
          {wantsBrochure ? (
            <BrochureAside />
          ) : (
            <div className="relative hidden overflow-hidden md:block">
              <Image
                src={media["tower-dusk-portrait"]}
                alt="Berkeley Tower at dusk beside Business Bay Metro"
                fill
                sizes="(min-width: 768px) 30rem, 0px"
                placeholder="blur"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute inset-x-8 bottom-8 text-paper">
                <BerkeleyMark className="h-7 w-auto" />
                <p className="display mt-4 text-[2rem] leading-[1.05] [&_em]:text-accent-bright">
                  Priority access to the <em>launch</em>.
                </p>
                <p className="mt-3 max-w-xs text-[0.9rem] leading-relaxed text-paper/80">
                  Price list, floor availability, the full brochure and a private briefing with our consultants.
                </p>
              </div>
            </div>
          )}
          <div className="relative overflow-y-auto p-6 pt-14 sm:p-10 md:max-h-[88vh]">
            <CloseButton />
            <Dialog.Title className="eyebrow text-accent">
              {wantsBrochure ? "Download the brochure" : "Register your interest"}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              {wantsBrochure
                ? "Leave your name and mobile to download the Berkeley Tower brochure."
                : "Three short steps to request launch access for Berkeley Tower."}
            </Dialog.Description>
            {wantsBrochure && (
              <div className="mt-5 flex items-center gap-5">
                <BrochureCover className="w-24 shrink-0 md:hidden" sizes="6rem" />
                <div>
                  <p className="display text-[1.75rem] leading-[1.08] sm:text-[2.2rem]">
                    Your copy of the <em>brochure</em>
                  </p>
                  <p className="mt-3 max-w-md text-[0.92rem] leading-relaxed text-stone">
                    Floor plans for every office type, the amenity levels and the 70/30 plan. It downloads at once and
                    lands in your inbox.
                  </p>
                </div>
              </div>
            )}
            <div className={wantsBrochure ? "mt-8" : "mt-6"}>
              <LeadForm
                key={`${intent.source}-${intent.unit ?? ""}-${intent.offer ?? ""}`}
                variant={wantsBrochure ? "quick" : "full"}
                offer={intent.offer}
                source={intent.source}
                unit={intent.unit}
                defaultPurpose={intent.purpose}
                onSuccess={closeLead}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const POPUP_KEY = "bt-popup-at";
const WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Brochure popup (plan §8.1), the funnel's main lead magnet. Desktop: exit intent after 20 s.
 * Mobile: 55% scroll depth and 40 s dwell. Never repeats within 7 days,
 * never over another dialog, never after a lead.
 */
export function LaunchPopup() {
  const [open, setOpen] = useState(false);
  const doors = useRef<HTMLDivElement>(null);
  const lenis = useUi((s) => s.lenis);

  useEffect(() => {
    captureAttribution();
    let armed = false;
    const loadedAt = Date.now();
    try {
      const last = Number(localStorage.getItem(POPUP_KEY) ?? 0);
      if (Date.now() - last < WEEK || sessionStorage.getItem("bt-lead")) return;
    } catch {}

    const blocked = () => {
      const s = useUi.getState();
      return s.leadOpen || s.keypadOpen || s.leadSubmitted || !s.introDone || !!s.tool || s.conciergeOpen;
    };
    const fire = () => {
      if (armed || blocked()) return;
      armed = true;
      try {
        localStorage.setItem(POPUP_KEY, String(Date.now()));
      } catch {}
      setOpen(true);
      cleanup();
    };

    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 4 && !e.relatedTarget && Date.now() - loadedAt > 20_000) fire();
    };
    const onScroll = () => {
      const depth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (depth > 0.55 && Date.now() - loadedAt > 40_000) fire();
    };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) window.addEventListener("scroll", onScroll, { passive: true });
    else document.addEventListener("mouseout", onLeave);

    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    }
    return cleanup;
  }, []);

  useEffect(() => {
    if (open) lenis?.stop();
    else if (!useUi.getState().tool) lenis?.start();
  }, [open, lenis]);

  // Lift doors part to reveal the invitation.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const el = doors.current;
      if (!el || prefersReducedMotion()) return;
      setupGsap();
      gsap
        .timeline()
        .fromTo(
          el.querySelector("[data-door=l]"),
          { xPercent: 0 },
          { xPercent: -101, duration: 0.9, ease: "lift", delay: 0.15 },
        )
        .fromTo(el.querySelector("[data-door=r]"), { xPercent: 0 }, { xPercent: 101, duration: 0.9, ease: "lift" }, "<")
        .from(el.querySelectorAll("[data-pop]"), { autoAlpha: 0, y: 16, stagger: 0.07, duration: 0.7 }, "-=0.45");
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/45 backdrop-blur-[3px] data-[state=open]:animate-[fade-in_400ms_var(--ease-silk)]" />
        <Dialog.Content
          ref={doors}
          className="corner fixed left-1/2 top-1/2 z-[81] max-h-[94dvh] w-[min(33rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overflow-x-hidden bg-paper shadow-[0_40px_120px_-30px_rgb(20_20_22/0.45)]"
        >
          <div className="relative overflow-hidden bg-mist px-6 pb-6 pt-8 sm:px-8">
            <CloseButton />
            <WaveField className="absolute inset-y-0 left-0 h-full w-1/3 text-accent/15" />
            <WaveField flip className="absolute inset-y-0 right-0 h-full w-1/3 text-accent/15" />
            <div className="relative flex items-center gap-4 pr-6 sm:gap-6 sm:pr-8">
              <div data-pop="" className="w-[4.5rem] shrink-0 sm:w-[6.5rem]">
                <BrochureCover sizes="7rem" />
              </div>
              <div className="min-w-0">
                <p data-pop="" className="eyebrow text-accent">
                  Free download
                </p>
                <Dialog.Title
                  data-pop=""
                  className="display mt-3 text-[1.35rem] leading-[1.05] text-ink sm:text-[1.95rem]"
                >
                  The full <em>brochure</em>, before launch.
                </Dialog.Title>
              </div>
            </div>
            {/* Dropped on short laptop screens so the form fits without scrolling */}
            <Dialog.Description
              data-pop=""
              className="relative mt-4 text-[0.9rem] leading-relaxed text-stone [@media(max-height:820px)]:sr-only"
            >
              Every office type's floor plan, the amenity levels and the 70/30 plan. It downloads at once and lands in
              your inbox.
            </Dialog.Description>
            <div data-pop="" className="relative mt-4">
              <BrochureMeta />
            </div>
          </div>
          <div data-pop="" className="relative px-6 pb-6 pt-4 sm:px-8 sm:pb-7">
            <LeadForm variant="quick" offer="brochure" source="popup" onSuccess={() => setOpen(false)} />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden [.js-motion_&]:block">
            <div data-door="l" className="absolute inset-y-0 left-0 w-1/2 bg-mist">
              <span className="absolute inset-y-0 right-0 w-px bg-ink/15" />
            </div>
            <div data-door="r" className="absolute inset-y-0 right-0 w-1/2 bg-mist">
              <span className="absolute inset-y-0 left-0 w-px bg-ink/15" />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
