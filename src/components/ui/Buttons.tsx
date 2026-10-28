"use client";

import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/ui/Kit";
import { whatsappLink } from "@/lib/data/broker";
import { track } from "@/lib/lead/track";
import { scrollToId, type ToolId, useUi } from "@/lib/store";

type Variant = "primary" | "ghost" | "light" | "outline-light" | "accent" | "rose";

const base =
  "group inline-flex min-h-12 cursor-pointer items-center justify-center gap-4 rounded-full px-7 py-3 font-display text-[0.66rem] font-medium uppercase tracking-[0.22em] [font-stretch:112%] transition-[border-color,color,box-shadow,translate] duration-500 ease-[var(--ease-cine)] disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Black pill; the accent floods in on hover.
  primary:
    "sheen bg-ink text-paper [--sheen:var(--color-accent)] hover:shadow-[0_14px_34px_-12px_color-mix(in_srgb,var(--color-accent)_60%,transparent)]",
  accent: "sheen bg-accent text-paper [--sheen:var(--color-ink)]",
  ghost: "sheen border border-current/25 text-current [--sheen:rgb(13_13_15/0.06)] hover:border-current/60",
  light: "sheen bg-paper text-ink [--sheen:var(--color-accent-soft)]",
  "outline-light": "sheen border border-paper/40 text-paper [--sheen:rgb(255_255_255/0.12)] hover:border-paper",
  // Buildcaps rose gold; ink floods in on hover.
  rose: "sheen rose-plate text-ink [--sheen:var(--color-ink)] hover:text-paper",
};

/** With an arrow the pill tucks a round badge into its right edge. */
export function buttonClass(variant: Variant = "primary", extra = "", arrow = false) {
  return `${base} ${variants[variant]} ${arrow ? "pr-1.5" : ""} ${extra}`;
}

/** ↗ in a circle; turns a quarter on hover. Used inside pills and on cards. */
export function ArrowCircle({
  className = "",
  tone = "current",
  size = "md",
}: {
  className?: string;
  tone?: "current" | "solid" | "light";
  size?: "sm" | "md";
}) {
  const tones = {
    current: "border border-current/30",
    solid: "bg-paper/15",
    light: "bg-paper text-ink",
  };
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:rotate-45 ${size === "sm" ? "size-8" : "size-9"} ${tones[tone]} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="size-3"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
      >
        <path d="M2.5 9.5l7-7M3.5 2.5h6v6" />
      </svg>
    </span>
  );
}

/** ↓ in a circle for downloads; drops a little on hover. */
export function DownloadCircle({
  className = "",
  tone = "current",
  size = "md",
}: {
  className?: string;
  tone?: "current" | "solid" | "light";
  size?: "sm" | "md";
}) {
  const tones = {
    current: "border border-current/30",
    solid: "bg-paper/15",
    light: "bg-paper text-ink",
  };
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full ${size === "sm" ? "size-8" : "size-9"} ${tones[tone]} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="size-3 transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-y-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
      >
        <path d="M6 1.5v7M2.8 5.6L6 8.8l3.2-3.2M2 10.5h8" />
      </svg>
    </span>
  );
}

/** The brochure's line-with-a-flick arrow, kept for text links. */
export function FlickArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 34 12"
      className={`h-3 w-8 transition-transform duration-500 ease-[var(--ease-silk)] group-hover:translate-x-1 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
    >
      <path d="M1 4.5H26.5C29 4.5 30.6 5.6 31.6 8.5" />
    </svg>
  );
}

const arrowTone: Record<Variant, "current" | "solid" | "light"> = {
  primary: "solid",
  accent: "solid",
  ghost: "current",
  light: "current",
  "outline-light": "light",
  rose: "current",
};

type LeadIntent = Parameters<ReturnType<typeof useUi.getState>["openLead"]>[0];

export function LeadButton({
  intent,
  variant = "primary",
  className = "",
  children,
  arrow = true,
}: {
  intent: LeadIntent;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  arrow?: boolean;
}) {
  const openLead = useUi((s) => s.openLead);
  return (
    <button
      type="button"
      data-quip=""
      className={buttonClass(variant, className, arrow)}
      onClick={() => openLead(intent)}
    >
      <span className="relative z-[2]">{children}</span>
      {arrow && <ArrowCircle tone={arrowTone[variant]} className="relative z-[2]" />}
    </button>
  );
}

/** The funnel's main offer: opens the form that unlocks the brochure PDF. */
export function BrochureButton({
  source,
  variant = "accent",
  className = "",
  children = "Download the brochure",
}: {
  source: string;
  variant?: Variant;
  className?: string;
  children?: ReactNode;
}) {
  const openLead = useUi((s) => s.openLead);
  return (
    <button
      type="button"
      data-quip=""
      className={buttonClass(variant, className, true)}
      onClick={() => openLead({ source, offer: "brochure" })}
    >
      <span className="relative z-[2]">{children}</span>
      <DownloadCircle tone={arrowTone[variant]} className="relative z-[2]" />
    </button>
  );
}

/** Opens a WhatsApp chat with the sales team, pre-filled with `text`. */
export function WhatsAppButton({
  source,
  text,
  variant = "ghost",
  className = "",
  children = "WhatsApp us",
}: {
  source: string;
  text?: string;
  variant?: Variant;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a
      href={whatsappLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      data-quip=""
      onClick={() => track("whatsapp_click", { source })}
      className={buttonClass(variant, className, true)}
    >
      <span className="relative z-[2]">{children}</span>
      <span
        aria-hidden="true"
        className="relative z-[2] grid size-9 shrink-0 place-items-center rounded-full bg-[#25d366] text-paper"
      >
        <WhatsAppIcon className="size-[1.05rem]" />
      </span>
    </a>
  );
}

export function OpenToolButton({
  tool,
  variant = "primary",
  className = "",
  children,
}: {
  tool: ToolId;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  const openTool = useUi((s) => s.openTool);
  return (
    <button type="button" data-quip="" className={buttonClass(variant, className, true)} onClick={() => openTool(tool)}>
      <span className="relative z-[2]">{children}</span>
      <ArrowCircle tone={arrowTone[variant]} className="relative z-[2]" />
    </button>
  );
}

export function ScrollButton({
  to,
  variant = "ghost",
  className = "",
  children,
}: {
  to: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" className={buttonClass(variant, className)} onClick={() => scrollToId(to)}>
      <span className="relative z-[2]">{children}</span>
    </button>
  );
}

export function BackToTop({ className = "" }: { className?: string }) {
  const lenis = useUi((s) => s.lenis);
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => (lenis ? lenis.scrollTo(0, { duration: 2.4 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
      className={`group grid size-12 cursor-pointer place-items-center rounded-full border border-current/25 transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-paper ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 10 16"
        className="h-4 w-2.5 transition-transform duration-500 group-hover:-translate-y-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
      >
        <path d="M5 15V1M1 5l4-4 4 4" />
      </svg>
    </button>
  );
}

type LinkAction = { lead: LeadIntent } | { tool: ToolId } | { to: string } | { ask: string };

/** Header-row text link with the pass-through underline. */
export function LinkLine({
  action,
  quiet = false,
  className = "",
  children,
}: {
  action: LinkAction;
  /** Underline only on hover, for lists of links. */
  quiet?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const openLead = useUi((s) => s.openLead);
  const openTool = useUi((s) => s.openTool);
  const openConcierge = useUi((s) => s.openConcierge);
  const run = () => {
    if ("lead" in action) openLead(action.lead);
    else if ("tool" in action) openTool(action.tool);
    else if ("ask" in action) openConcierge(action.ask || undefined);
    else scrollToId(action.to);
  };
  return (
    <button
      type="button"
      onClick={run}
      className={`${quiet ? "link-flick" : "link-line"} eyebrow cursor-pointer whitespace-nowrap text-[0.64rem] ${className}`}
    >
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="size-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
      >
        <path d="M2.5 9.5l7-7M3.5 2.5h6v6" />
      </svg>
    </button>
  );
}
