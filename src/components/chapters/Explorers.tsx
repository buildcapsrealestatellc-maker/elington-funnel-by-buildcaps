"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { LeadButton, LinkLine } from "@/components/ui/Buttons";
import { Icon, type IconName } from "@/components/ui/Kit";
import { project, unitConfigs } from "@/lib/data/tower";
import { type MediaKey, media } from "@/lib/media";

const ease = [0.16, 1, 0.3, 1] as const;
const fmt = (n: number) => n.toLocaleString("en-US");

/* ─── Offices: zone and layout tabs, plan card, spec grid ─── */
const zonesTabs = [
  { id: "low", label: "Lower floors", floors: "L1–31" },
  { id: "high", label: "Upper floors", floors: "L36–52" },
] as const;

const tab = (active: boolean) =>
  `eyebrow cursor-pointer rounded-full border px-5 py-3 text-[0.6rem] transition-colors duration-300 ${
    active ? "border-ink bg-ink text-paper" : "border-line bg-paper text-stone hover:border-ink/40 hover:text-ink"
  }`;

export function OfficeExplorer() {
  const [zone, setZone] = useState<"low" | "high">("low");
  const configs = unitConfigs.filter((c) => c.zone === zone);
  const [configId, setConfigId] = useState(configs[0].id);
  const config = unitConfigs.find((c) => c.id === configId) ?? configs[0];
  const zoneLabel = zonesTabs.find((z) => z.id === zone)?.label;
  const size = config.min === config.max ? fmt(config.min) : `${fmt(config.min)}–${fmt(config.max)}`;

  const specs = [
    { label: "Office size", value: size, unit: "sq ft" },
    { label: "Per floor", value: config.perFloor },
    { label: "Office types", value: config.types.join(" · ") },
    { label: "Floors", value: config.floors },
    { label: "Service charge", value: `AED ${project.serviceCharge}`, unit: "/ sq ft" },
    { label: "Areas", value: config.status === "verify" ? "Indicative" : "Brochure" },
  ];

  return (
    <div>
      <div className="grid grid-cols-12 items-center gap-3 md:gap-4">
        <div role="tablist" aria-label="Floor zones" className="col-span-12 flex flex-wrap gap-2 lg:col-span-7">
          {zonesTabs.map((z) => (
            <button
              key={z.id}
              type="button"
              role="tab"
              aria-selected={zone === z.id}
              onClick={() => {
                setZone(z.id);
                setConfigId(unitConfigs.find((c) => c.zone === z.id)?.id ?? "");
              }}
              className={tab(zone === z.id)}
            >
              {z.label} <span className="ml-1 opacity-60">{z.floors}</span>
            </button>
          ))}
        </div>
        <div role="tablist" aria-label="Offices per floor" className="col-span-12 flex flex-wrap gap-2 lg:col-span-5">
          {configs.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === config.id}
              onClick={() => setConfigId(c.id)}
              className={`cursor-pointer rounded-full border px-4 py-2.5 text-[0.85rem] transition-colors duration-300 ${
                c.id === config.id
                  ? "border-accent bg-accent text-paper"
                  : "border-line bg-paper text-ink hover:border-ink/40"
              }`}
            >
              {c.perFloor}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-12 items-stretch gap-3 md:mt-4 md:gap-4">
        <div className="corner col-span-12 flex flex-col justify-between border border-line bg-paper p-4 md:p-7 lg:col-span-7">
          <div className="relative aspect-[1.414]">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={config.plan}
                className="absolute inset-0"
                initial={{ opacity: 0, x: -24, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 24, filter: "blur(6px)" }}
                transition={{ duration: 0.6, ease }}
              >
                <Image
                  src={media[config.plan as MediaKey]}
                  alt={`Typical floor plan, ${config.floors}, ${config.perFloor}`}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
            <span className="eyebrow text-[0.54rem] text-stone">Typical plan · not to scale</span>
            <span className="eyebrow text-[0.54rem] text-stone">N · Burj Khalifa view</span>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={config.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.45, ease }}
            className="corner-alt col-span-12 flex flex-col border border-line bg-paper p-6 md:p-8 lg:col-span-5"
          >
            <p className="eyebrow text-accent">
              {zoneLabel} · {config.floors}
            </p>
            <h3 className="display mt-4 text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.05] text-ink">
              {config.perFloor === "Full floor" ? "A full floor" : `${config.perFloor} per floor`}
            </h3>
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {specs.map((s) => (
                <div key={s.label} className="bg-paper px-5 py-5 transition-colors duration-300 hover:bg-mist">
                  <dt className="eyebrow text-[0.54rem] text-stone">{s.label}</dt>
                  <dd className="numerals mt-2 text-[1.05rem] text-ink">
                    {s.value}
                    {s.unit && <span className="ml-1.5 text-[0.7rem] text-stone">{s.unit}</span>}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-auto flex flex-wrap items-center gap-x-8 gap-y-5 pt-8">
              <LeadButton intent={{ source: "offices", unit: `${config.floors} ${config.perFloor}` }}>
                Get prices
              </LeadButton>
              <LinkLine action={{ tool: "spacedna" }}>Size my team</LinkLine>
            </div>
            <p className="mt-6 text-[0.78rem] leading-relaxed text-stone">
              Plans are indicative; Sheikh Zayed Road and Business Bay Metro lie to the west. Final areas per SPA.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── 70/30, as one bar ─── */
const bar = [
  { pct: 20, label: "At booking", tone: "bg-accent text-paper" },
  { pct: 20, label: "First year", tone: "bg-accent-bright text-paper" },
  { pct: 30, label: "Construction", tone: "bg-accent-soft text-ink" },
  { pct: 30, label: "On completion", tone: "bg-ink text-paper" },
];

export function PaymentBar() {
  return (
    <div>
      <div className="flex h-16 w-full gap-1 md:h-20">
        {bar.map((b, i) => (
          <motion.div
            key={b.label}
            className={`flex origin-left items-end p-3 md:p-4 ${b.tone} ${i === 0 ? "rounded-l-2xl" : ""} ${
              i === bar.length - 1 ? "rounded-r-2xl" : ""
            }`}
            style={{ flex: `${b.pct} 1 0%` }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1.1, ease, delay: i * 0.12 }}
          >
            <span className="numerals text-[1.1rem] font-light leading-none md:text-[1.5rem]">{b.pct}%</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex w-full gap-1">
        {bar.map((b) => (
          <span
            key={b.label}
            className="eyebrow text-[0.5rem] text-stone md:text-[0.56rem]"
            style={{ flex: `${b.pct} 1 0%` }}
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── The path to ownership, with a line that draws as you scroll ─── */
const steps: { n: string; icon: IconName; t: string; d: string; pct: string }[] = [
  { n: "01", icon: "key", t: "Reserve", d: "20% secures your office at booking.", pct: "20%" },
  {
    n: "02",
    icon: "calendar",
    t: "First year",
    d: "Four instalments of 5% at 90, 180, 240 and 360 days after reservation.",
    pct: "+20%",
  },
  {
    n: "03",
    icon: "tower",
    t: "Construction",
    d: "Six instalments of 5% as the tower reaches 20% to 70% completion.",
    pct: "+30%",
  },
  { n: "04", icon: "spark", t: "Handover", d: "The final 30% on completion, then the keys.", pct: "+30%" },
];

export function OwnershipSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="relative flex gap-6 md:gap-8">
      <div className="relative w-px shrink-0 self-stretch bg-line">
        <motion.div className="absolute inset-0 origin-top bg-accent" style={{ scaleY }} />
      </div>
      <ol className="flex flex-1 flex-col gap-10 md:gap-12">
        {steps.map((s) => (
          <li key={s.n}>
            <div className="flex items-center gap-4">
              <span className="numerals text-[2.6rem] font-extralight leading-none text-transparent [-webkit-text-stroke:1px_rgb(17_17_17/0.25)]">
                {s.n}
              </span>
              <span className="grid size-11 place-items-center rounded-full border border-accent/20 bg-accent/8 text-accent">
                <Icon name={s.icon} className="size-[1.1rem]" />
              </span>
              <span className="numerals ml-auto text-[1.1rem] text-accent">{s.pct}</span>
            </div>
            <div className="mt-4 h-px bg-line" />
            <h3 className="display mt-4 text-[1.05rem] text-ink">{s.t}</h3>
            <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-stone">{s.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
