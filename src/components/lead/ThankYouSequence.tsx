"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WaveField } from "@/components/brand/Decor";
import { BerkeleyMark } from "@/components/brand/logos";
import { ArrowCircle, buttonClass, DownloadCircle, WhatsAppButton } from "@/components/ui/Buttons";
import { broker, phoneHref } from "@/lib/data/broker";
import { brochure, goldenVisa } from "@/lib/data/tower";
import { downloadBrochure } from "@/lib/lead/brochure";
import type { Offer } from "@/lib/lead/schema";
import { track } from "@/lib/lead/track";
import { media } from "@/lib/media";
import { gsap, prefersReducedMotion, SplitText, setupGsap } from "@/lib/motion/gsap";
import { BrochureCover } from "./BrochureCover";

type LeadMemo = { firstName?: string; id?: string; at?: number; offer?: Offer; email?: string };

const steps = [
  { n: "01", title: "A consultant will WhatsApp you", body: "Usually within 15 minutes during business hours." },
  {
    n: "02",
    title: "Your price list, first",
    body: "Sent as soon as Ellington releases launch pricing and availability.",
  },
  {
    n: "03",
    title: "Your Golden Visa check",
    body: `A private briefing on plans, payments and whether your office clears the AED ${goldenVisa.threshold / 1_000_000}M ${goldenVisa.years}-year visa route.`,
  },
];

/** Thank-you (plan §8.3): the lift rides 00 → 60 and opens on the dusk terrace. */
export function ThankYouSequence() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const router = useRouter();
  const [lead, setLead] = useState<LeadMemo | null>(null);

  useEffect(() => {
    let memo: LeadMemo | null = null;
    try {
      memo = JSON.parse(sessionStorage.getItem("bt-lead") ?? "null") as LeadMemo | null;
    } catch {}
    if (!memo) {
      router.replace("/");
      return;
    }
    setLead(memo);
    // Fire the conversion once per lead (GTM picks this up for GA4 / Ads / Meta).
    const flag = `bt-conv-${memo.id ?? "x"}`;
    try {
      if (!sessionStorage.getItem(flag)) {
        track("generate_lead", { lead_id: memo.id });
        sessionStorage.setItem(flag, "1");
      }
    } catch {}
  }, [router]);

  useGSAP(
    () => {
      if (!lead) return;
      setupGsap();
      const el = root.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set("[data-door]", { autoAlpha: 0 });
        gsap.set("[data-ty]", { autoAlpha: 1 });
        return;
      }
      const n = { v: 0 };
      const split = SplitText.create("[data-ty-title]", { type: "lines", mask: "lines" });
      gsap
        .timeline({ delay: 0.2 })
        .to(n, {
          v: 60,
          duration: 1.6,
          ease: "lift",
          onUpdate: () => {
            if (counter.current) counter.current.textContent = String(Math.round(n.v)).padStart(2, "0");
          },
        })
        .to("[data-readout]", { autoAlpha: 0, y: -12, duration: 0.35 }, "+=0.15")
        .to("[data-door=l]", { xPercent: -101, duration: 1, ease: "lift" }, "<0.1")
        .to("[data-door=r]", { xPercent: 101, duration: 1, ease: "lift" }, "<")
        .fromTo("[data-bg]", { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "silk" }, "<")
        .set("[data-ty]", { autoAlpha: 1 }, "<0.4")
        .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.12 }, "<")
        .from("[data-step]", { autoAlpha: 0, y: 24, stagger: 0.08, duration: 0.8 }, "<0.4")
        .set("[data-door]", { display: "none" });
      return () => split.revert();
    },
    { dependencies: [lead], scope: root },
  );

  return (
    <div ref={root} className="relative min-h-svh overflow-hidden bg-ink text-paper">
      <div data-bg="" className="absolute inset-0">
        <Image
          src={media["terrace-view-night"]}
          alt="View from the top of Berkeley Tower towards Burj Al Arab at night"
          fill
          preload
          sizes="100vw"
          placeholder="blur"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/10" />

      <div
        data-ty=""
        className="shell relative z-10 flex min-h-svh flex-col justify-center py-28 [.js-motion_&]:invisible"
      >
        <BerkeleyMark className="h-8 w-auto self-start text-paper" />
        <p className="eyebrow mt-10 text-accent-soft">Level 60 · Request received</p>
        <h1 data-ty-title="" className="display mt-5 max-w-3xl text-display-l">
          Welcome to the top{lead?.firstName ? `, ${lead.firstName}` : ""}.
        </h1>
        <p className="mt-6 max-w-lg text-lead text-paper/80">
          Thank you for registering your interest in Berkeley Tower. Here is what happens next.
        </p>
        <div
          data-step=""
          className="corner mt-10 flex max-w-2xl items-center gap-5 border border-paper/15 bg-ink/45 p-4 pr-5 backdrop-blur-md sm:gap-7 sm:p-5"
        >
          <BrochureCover className="w-20 shrink-0 sm:w-24" sizes="6rem" />
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-[0.56rem] text-accent-soft">
              {lead?.offer === "brochure" ? "Your brochure is ready" : "Your copy of the brochure"}
            </p>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-paper/70">
              {brochure.pages} pages · PDF · {brochure.size}
              {lead?.email && (
                <span className="block text-paper/55">
                  Also sent to <span className="text-paper/85">{lead.email}</span>
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => downloadBrochure("thank-you")}
              className={buttonClass("light", "mt-4 min-h-11! py-2! text-[0.58rem]!", true)}
            >
              <span className="relative z-[2]">Download the brochure</span>
              <DownloadCircle size="sm" className="relative z-[2]" />
            </button>
          </div>
        </div>
        <ol className="mt-6 grid max-w-5xl gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} data-step="" className=" border border-paper/15 bg-ink/35 p-6 backdrop-blur-md">
              <span className="numerals text-[0.8rem] text-accent-soft">{s.n}</span>
              <p className="mt-4 text-[1.05rem]">{s.title}</p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-paper/65">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <WhatsAppButton
            source="thank-you"
            variant="light"
            text={`Hi${lead?.firstName ? `, this is ${lead.firstName}` : ""}. I've just registered for Berkeley Tower by Ellington and would like the price list and availability.`}
          >
            WhatsApp us now
          </WhatsAppButton>
          <a href={phoneHref} className={buttonClass("outline-light")}>
            Call {broker.phone}
          </a>
          <Link href="/" className={buttonClass("outline-light", "", true)}>
            <span className="relative z-[2]">Back to the tower</span>
            <ArrowCircle tone="light" className="relative z-[2]" />
          </Link>
        </div>
      </div>

      {/* Lift doors */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 hidden [.js-motion_&]:block">
        <div data-door="l" className="absolute inset-y-0 left-0 w-1/2 bg-mist">
          <WaveField className="absolute inset-0 h-full w-full text-ink/[0.07]" />
          <span className="absolute inset-y-0 right-0 w-px bg-ink/15" />
        </div>
        <div data-door="r" className="absolute inset-y-0 right-0 w-1/2 bg-mist">
          <WaveField flip className="absolute inset-0 h-full w-full text-ink/[0.07]" />
          <span className="absolute inset-y-0 left-0 w-px bg-ink/15" />
        </div>
        <div data-readout="" className="absolute inset-0 grid place-items-center text-ink">
          <div className="flex flex-col items-center gap-3">
            <span className="eyebrow text-stone">Going up</span>
            <span ref={counter} className="numerals text-8xl font-extralight tracking-tight">
              00
            </span>
            <span className="eyebrow text-accent">Berkeley Tower</span>
          </div>
        </div>
      </div>
    </div>
  );
}
