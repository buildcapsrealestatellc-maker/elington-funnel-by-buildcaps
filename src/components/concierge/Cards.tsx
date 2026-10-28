"use client";

import type { ReactNode } from "react";
import { ArrowCircle } from "@/components/ui/Buttons";
import { WhatsAppIcon } from "@/components/ui/Kit";
import type { ConciergeMessage } from "@/lib/concierge/tools";
import { track } from "@/lib/lead/track";
import { rideTo, useUi } from "@/lib/store";

type Part = ConciergeMessage["parts"][number];
type ToolPart = Extract<Part, { toolCallId: string }>;
type Done<T extends ToolPart["type"]> = Extract<ToolPart, { type: T; state: "output-available" }>;

const fmt = (n: number) => n.toLocaleString("en-US");
const aed = (n: number) => `AED ${fmt(n)}`;

/** On phones the chat covers the page, so actions close it first. */
function closeOnPhone() {
  if (!window.matchMedia("(min-width: 768px)").matches) useUi.getState().closeConcierge();
}

export function goToSection(out: Done<"tool-showSection">["output"]) {
  closeOnPhone();
  rideTo(out.id, { floor: out.floor, num: out.num, label: out.label });
}

function Card({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div className="corner-sm mt-2 border border-line bg-paper p-4">
      <p className="eyebrow text-[0.52rem] text-accent">{eyebrow}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Action({ onClick, children, solid = false }: { onClick: () => void; children: ReactNode; solid?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full py-1 pl-4 pr-1 font-display text-[0.56rem] font-medium uppercase tracking-[0.18em] [font-stretch:112%] transition-colors ${
        solid ? "bg-ink text-paper hover:bg-accent" : "border border-line text-ink hover:border-ink/40"
      }`}
    >
      {children}
      <ArrowCircle size="sm" tone={solid ? "solid" : "current"} />
    </button>
  );
}

function OfficesCard({ out }: { out: Done<"tool-findOffices">["output"] }) {
  const openLead = useUi((s) => s.openLead);
  return (
    <Card eyebrow={out.target ? `About ${fmt(out.target)} sq ft for your team` : "Office types"}>
      <ul className="flex flex-col divide-y divide-line">
        {out.matches.map((m) => (
          <li key={m.id} className="flex items-baseline justify-between gap-4 py-2">
            <span className="text-[0.85rem] leading-snug text-ink">
              {m.label}
              <span className="block text-[0.75rem] text-stone">{m.floors}</span>
            </span>
            <span className="numerals shrink-0 text-[0.8rem] text-ink">
              {m.min === m.max ? fmt(m.min) : `${fmt(m.min)}–${fmt(m.max)}`}
              <span className="ml-1 text-[0.62rem] text-stone">sq ft{m.indicative ? "*" : ""}</span>
            </span>
          </li>
        ))}
      </ul>
      {!out.exact && <p className="mt-2 text-[0.72rem] text-stone">No exact match, so these are the closest sizes.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Action
          solid
          onClick={() => {
            closeOnPhone();
            openLead({ source: "concierge", unit: out.matches.map((m) => m.label).join(" / ") });
          }}
        >
          Get prices
        </Action>
        <Action
          onClick={() =>
            goToSection({ section: "floorPlans", id: "offices", label: "Floor plans", floor: "41", num: 41 })
          }
        >
          Floor plans
        </Action>
      </div>
    </Card>
  );
}

const barTones = ["bg-accent", "bg-accent-bright", "bg-accent-soft", "bg-ink"];

function PaymentCard({ out }: { out: Done<"tool-paymentPlan">["output"] }) {
  return (
    <Card eyebrow={out.price ? `70/30 on ${aed(out.price)}` : "The 70/30 plan"}>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
        {out.stages.map((s, i) => (
          <span key={s.label} className={barTones[i]} style={{ flex: `${s.pct} 1 0%` }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">
        {out.stages.map((s, i) => (
          <li key={s.label} className="flex items-center justify-between gap-3 text-[0.8rem]">
            <span className="flex items-center gap-2 text-ink">
              <span className={`size-2 rounded-full ${barTones[i]} ${i === 2 ? "ring-1 ring-line" : ""}`} />
              {s.label}
            </span>
            <span className="numerals text-ink">
              {s.pct}%{s.amount ? <span className="ml-2 text-stone">{aed(s.amount)}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.7rem] leading-relaxed text-stone">
        Service charge AED {out.serviceCharge}/sq ft a year, anticipated. {out.note}
      </p>
    </Card>
  );
}

function DriveCard({ out }: { out: Done<"tool-driveTimes">["output"] }) {
  return (
    <Card eyebrow="Drive times by car">
      <ul className="flex flex-col divide-y divide-line">
        {out.rows.map((r) => (
          <li key={r.place} className="flex items-baseline justify-between gap-4 py-1.5 text-[0.82rem]">
            <span className="text-ink">{r.place}</span>
            <span className="numerals shrink-0 text-accent">{r.minutes} min</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.72rem] text-stone">{out.metro}</p>
    </Card>
  );
}

function AmenityCard({ out }: { out: Done<"tool-amenities">["output"] }) {
  return (
    <Card eyebrow="Amenity levels">
      <ul className="flex flex-col gap-2.5">
        {out.levels.map((l) => (
          <li key={l.floor}>
            <p className="text-[0.82rem] text-ink">
              <span className="numerals mr-2 text-accent">L{l.floor}</span>
              {l.name}
            </p>
            <p className="mt-0.5 text-[0.75rem] leading-relaxed text-stone">{l.features.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PlannerCard({ out }: { out: Done<"tool-openPlanner">["output"] }) {
  const openTool = useUi((s) => s.openTool);
  return (
    <Card eyebrow="Berkeley Intelligence">
      <p className="display text-[0.95rem] text-ink">{out.name}</p>
      <p className="mt-1 text-[0.8rem] leading-relaxed text-stone">{out.line}</p>
      <div className="mt-3">
        <Action
          solid
          onClick={() => {
            useUi.getState().closeConcierge();
            openTool(out.planner);
          }}
        >
          Open {out.name}
        </Action>
      </div>
    </Card>
  );
}

function CallbackCard({ out }: { out: Done<"tool-requestCallback">["output"] }) {
  const openLead = useUi((s) => s.openLead);
  return (
    <Card eyebrow="Talk to a consultant">
      <p className="text-[0.8rem] leading-relaxed text-stone">
        Price list, availability and a private briefing. Your details go through the secure form, not this chat.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Action
          solid
          onClick={() => {
            closeOnPhone();
            openLead({ source: "concierge", unit: out.topic });
          }}
        >
          Request a call back
        </Action>
        <a
          href={out.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { source: "concierge" })}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line py-1 pl-4 pr-1 font-display text-[0.56rem] font-medium uppercase tracking-[0.18em] text-ink [font-stretch:112%] hover:border-ink/40"
        >
          WhatsApp
          <span className="grid size-7 place-items-center rounded-full bg-[#25d366] text-paper">
            <WhatsAppIcon className="size-3.5" />
          </span>
        </a>
      </div>
      <a
        href={`tel:${out.phone.replace(/[^\d+]/g, "")}`}
        className="mt-3 block text-[0.75rem] text-stone hover:text-ink"
      >
        Or call {out.phone}
      </a>
    </Card>
  );
}

function BrochureCard({ out }: { out: Done<"tool-sendBrochure">["output"] }) {
  const openLead = useUi((s) => s.openLead);
  return (
    <Card eyebrow={`The brochure · ${out.pages} pages`}>
      <ul className="flex flex-col gap-1.5">
        {out.contents.map((c) => (
          <li key={c} className="flex items-center gap-2 text-[0.82rem] text-ink">
            <span className="size-1 shrink-0 rounded-full bg-accent" />
            {c}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.75rem] leading-relaxed text-stone">
        PDF, {out.size}. Your details go through the secure form, not this chat.
      </p>
      <div className="mt-3">
        <Action
          solid
          onClick={() => {
            closeOnPhone();
            openLead({ source: "concierge", offer: "brochure" });
          }}
        >
          Download the brochure
        </Action>
      </div>
    </Card>
  );
}

function SectionCard({ out }: { out: Done<"tool-showSection">["output"] }) {
  return (
    <div className="mt-2">
      <Action onClick={() => goToSection(out)}>Show {out.label}</Action>
    </div>
  );
}

/** Renders a tool part as a card, a loading line or an error. */
export function ToolCard({ part }: { part: ToolPart }) {
  if (part.state === "output-error") {
    return <p className="mt-2 text-[0.75rem] text-stone">That detail isn't available right now.</p>;
  }
  if (part.state !== "output-available") {
    return (
      <p className="mt-2 flex items-center gap-2 text-[0.75rem] text-stone">
        <span className="size-1.5 animate-[pulse-dot_1.2s_ease-in-out_infinite] rounded-full bg-accent" />
        Checking the brief…
      </p>
    );
  }
  switch (part.type) {
    case "tool-findOffices":
      return <OfficesCard out={part.output} />;
    case "tool-paymentPlan":
      return <PaymentCard out={part.output} />;
    case "tool-driveTimes":
      return <DriveCard out={part.output} />;
    case "tool-amenities":
      return <AmenityCard out={part.output} />;
    case "tool-openPlanner":
      return <PlannerCard out={part.output} />;
    case "tool-requestCallback":
      return <CallbackCard out={part.output} />;
    case "tool-showSection":
      return <SectionCard out={part.output} />;
    case "tool-sendBrochure":
      return <BrochureCard out={part.output} />;
    default:
      return null;
  }
}

/** Short model text: paragraphs, "- " bullets and **bold**. */
export function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
      seg.startsWith("**") && seg.endsWith("**") ? (
        // biome-ignore lint/suspicious/noArrayIndexKey: static split of one string
        <strong key={i} className="font-semibold">
          {seg.slice(2, -2)}
        </strong>
      ) : (
        seg
      ),
    );
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const bullets = lines.every((l) => /^\s*[-•]\s/.test(l));
        return bullets ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split of one string
          <ul key={bi} className="flex flex-col gap-1">
            {lines.map((l, li) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static split of one string
              <li key={li} className="flex gap-2">
                <span className="mt-[0.55em] size-1 shrink-0 rounded-full bg-accent" />
                <span>{inline(l.replace(/^\s*[-•]\s/, ""))}</span>
              </li>
            ))}
          </ul>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split of one string
          <p key={bi}>{inline(lines.join(" "))}</p>
        );
      })}
    </div>
  );
}
