"use client";

import NumberFlow from "@number-flow/react";
import { type CSSProperties, type ReactNode, useId } from "react";
import { Eyebrow } from "@/components/ui/Kit";

/* Shared building blocks for the Berkeley Intelligence tools: a dark hero
   card with live results, an inputs card, pill controls and result tiles. */

/** Dark opening card: title on the left, the live headline results on the right. */
export function ToolHero({
  eyebrow,
  title,
  line,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  line: string;
  children: ReactNode;
}) {
  return (
    <section data-tool-in="" className="corner relative overflow-hidden bg-ink p-7 text-paper md:p-10">
      <div aria-hidden="true" className="blueprint absolute inset-0" />
      <div aria-hidden="true" className="glow absolute -right-1/4 -top-2/3 size-[48rem]" />
      <div className="relative grid grid-cols-12 items-end gap-x-4 gap-y-8">
        <div className="col-span-12 lg:col-span-7">
          <Eyebrow dark>{eyebrow}</Eyebrow>
          <h2 className="display mt-6 text-[clamp(1.75rem,3.4vw,3.4rem)] leading-[1.02] [&_em]:text-accent-bright">
            {title}
          </h2>
          <p className="mt-5 max-w-xl text-[1rem] leading-[1.7] text-paper/65">{line}</p>
        </div>
        <div className="col-span-12 grid grid-cols-2 gap-3 lg:col-span-5">{children}</div>
      </div>
    </section>
  );
}

/** A live figure inside the hero card. */
export function HeroStat({
  label,
  value,
  unit,
  suffix,
  decimals = 0,
  note,
  highlight = false,
}: {
  label: string;
  value: number;
  unit?: string;
  suffix?: string;
  decimals?: number;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col justify-between gap-6 rounded-2xl border p-4 backdrop-blur-md md:p-5 ${
        highlight ? "border-accent bg-accent" : "border-paper/12 bg-paper/5"
      }`}
    >
      <p className={`eyebrow text-[0.52rem] ${highlight ? "text-paper/80" : "text-paper/55"}`}>{label}</p>
      <div>
        <p className="numerals flex items-baseline gap-1.5 leading-none text-paper">
          {unit && <span className="text-[0.75rem] tracking-[0.12em]">{unit}</span>}
          <NumberFlow
            value={Number.isFinite(value) ? value : 0}
            suffix={suffix}
            format={{ minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: true }}
            className="text-[clamp(1.55rem,2.4vw,2.35rem)] font-extralight"
          />
        </p>
        {note && (
          <p className={`mt-2 truncate text-[0.75rem] ${highlight ? "text-paper/80" : "text-paper/55"}`}>{note}</p>
        )}
      </div>
    </div>
  );
}

/** The inputs column: a white card that stays in view on desktop. */
export function InputsCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <aside
      data-tool-in=""
      className={`corner-alt flex flex-col gap-7 self-start border border-line bg-paper p-6 md:p-7 lg:sticky lg:top-28 ${className}`}
    >
      {children}
    </aside>
  );
}

/** A titled group of inputs inside the inputs card. */
export function InputGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 border-t border-line pt-6 first:border-t-0 first:pt-0">
      <p className="eyebrow text-[0.56rem] text-accent">{title}</p>
      {children}
    </div>
  );
}

/** A white card for one block of results. */
export function ResultCard({
  eyebrow,
  aside,
  className = "",
  children,
}: {
  eyebrow?: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`corner border border-line bg-paper p-6 md:p-8 ${className}`}>
      {(eyebrow || aside) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {eyebrow && <p className="eyebrow text-[0.58rem] text-stone">{eyebrow}</p>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

/** Labelled range slider with a live value pill. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v: number) => v.toLocaleString("en-US"),
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-[0.88rem] text-ink">
          {label}
        </label>
        <span className="numerals rounded-full bg-accent-soft px-3 py-1 text-[0.78rem] text-accent-deep">
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-2"
        style={{ "--p": `${pct}%` } as CSSProperties}
      />
      {hint && <p className="mt-0.5 text-[0.74rem] leading-snug text-stone">{hint}</p>}
    </div>
  );
}

/** Two-to-four option toggle, as a pill group. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[0.88rem] text-ink">{label}</legend>
      <div
        className="mt-3 grid gap-1 rounded-full bg-mist p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`eyebrow cursor-pointer truncate rounded-full px-2 py-2.5 text-[0.56rem] transition-colors duration-300 ${
              value === o.value
                ? "bg-ink text-paper shadow-[0_6px_16px_-8px_rgb(0_0_0/0.5)]"
                : "text-stone hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Preset chips, e.g. office sizes. */
export function Chips<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-[0.76rem] transition-colors duration-300 ${
            value === o.value ? "border-accent bg-accent text-paper" : "border-line text-ink hover:border-ink/40"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

type StatTone = "paper" | "ink" | "accent";

const statTones: Record<StatTone, { box: string; sub: string; value: string }> = {
  paper: { box: "border border-line bg-paper", sub: "text-stone", value: "text-ink" },
  ink: { box: "bg-ink", sub: "text-paper/60", value: "text-paper" },
  accent: { box: "bg-accent", sub: "text-paper/75", value: "text-paper" },
};

/** Result tile: label, a figure that always fits its tile, and a note. */
export function Stat({
  label,
  value,
  unit,
  suffix,
  decimals = 0,
  note,
  tone = "paper",
}: {
  label: string;
  value: number;
  /** Small unit before the figure, e.g. "AED". */
  unit?: string;
  suffix?: string;
  decimals?: number;
  note?: string;
  tone?: StatTone;
}) {
  const t = statTones[tone];
  return (
    <div className={`flex min-h-[9.5rem] min-w-0 flex-col justify-between gap-6 rounded-2xl p-5 ${t.box}`}>
      <p className={`eyebrow text-[0.54rem] ${t.sub}`}>{label}</p>
      <div className="min-w-0">
        <p className={`numerals flex items-baseline gap-1.5 leading-none ${t.value}`}>
          {unit && <span className="text-[0.72rem] tracking-[0.12em]">{unit}</span>}
          <NumberFlow
            value={Number.isFinite(value) ? value : 0}
            suffix={suffix}
            format={{ minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: true }}
            className="text-[clamp(1.45rem,2.1vw,2.1rem)] font-extralight"
          />
        </p>
        {note && <p className={`mt-2 text-[0.76rem] leading-snug ${t.sub}`}>{note}</p>}
      </div>
    </div>
  );
}
