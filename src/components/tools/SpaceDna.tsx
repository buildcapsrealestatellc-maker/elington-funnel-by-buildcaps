"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { LeadButton } from "@/components/ui/Buttons";
import { type MediaKey, media } from "@/lib/media";
import {
  type DnaInput,
  dnaDefaults,
  matchTitle,
  type Priority,
  rankMatches,
  requirement,
  sqftPerDesk,
  type Workstyle,
} from "@/lib/tools/spacedna";
import { HeroStat, InputGroup, InputsCard, ResultCard, Segmented, Slider, Stat, ToolHero } from "./ui";

const tones = ["bg-ink", "bg-accent", "bg-accent-bright", "bg-accent-soft", "bg-line"];
const ease = [0.16, 1, 0.3, 1] as const;
const fmt = (n: number) => n.toLocaleString("en-US");

export function SpaceDna() {
  const [input, setInput] = useState<DnaInput>(dnaDefaults);
  const set =
    <K extends keyof DnaInput>(k: K) =>
    (v: DnaInput[K]) =>
      setInput((s) => ({ ...s, [k]: v }));
  const req = useMemo(() => requirement(input), [input]);
  const matches = useMemo(() => rankMatches(input), [input]);
  const [top, ...rest] = matches;
  const shortlist = [top, ...rest.slice(0, 2)];

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <ToolHero
        eyebrow="SpaceDNA · Office matchmaker"
        title={
          <>
            Find the office that fits <em>your team</em>
          </>
        }
        line="Describe your team and how it works. SpaceDNA sizes the space you need and ranks Berkeley Tower's real office types against it."
      >
        <HeroStat
          label="Space you need"
          value={req.total}
          suffix=" sq ft"
          note={`${req.desks} workstations`}
          highlight
        />
        <HeroStat label="Best fit" value={top.fit} suffix="%" note={matchTitle(top)} />
      </ToolHero>

      <div className="grid grid-cols-12 items-start gap-3 md:gap-4">
        <InputsCard className="col-span-12 lg:col-span-4">
          <InputGroup title="Your team">
            <Slider
              label="Team today"
              value={input.headcount}
              min={1}
              max={200}
              onChange={set("headcount")}
              format={(v) => `${v} people`}
            />
            <Slider
              label="Growth in 3 years"
              value={input.growth}
              min={0}
              max={150}
              step={5}
              onChange={set("growth")}
              format={(v) => `+${v}%`}
            />
            <Slider
              label="Remote working"
              value={input.hybrid}
              min={0}
              max={60}
              step={5}
              onChange={set("hybrid")}
              format={(v) => (v ? `${v}% of the week` : "Fully in office")}
            />
          </InputGroup>
          <InputGroup title="How you work">
            <Segmented<Workstyle>
              label="Workstyle"
              value={input.workstyle}
              options={[
                { value: "executive", label: "Private" },
                { value: "balanced", label: "Balanced" },
                { value: "collaborative", label: "Open" },
              ]}
              onChange={set("workstyle")}
            />
            <Slider label="Meeting rooms" value={input.meetingRooms} min={0} max={12} onChange={set("meetingRooms")} />
            <Segmented<"yes" | "no">
              label="Clients visit"
              value={input.clientFacing ? "yes" : "no"}
              options={[
                { value: "yes", label: "Often" },
                { value: "no", label: "Rarely" },
              ]}
              onChange={(v) => set("clientFacing")(v === "yes")}
            />
          </InputGroup>
          <InputGroup title="What matters most">
            <Segmented<Priority>
              label="Priority"
              value={input.priority}
              options={[
                { value: "value", label: "Value" },
                { value: "views", label: "Views" },
                { value: "terraces", label: "Terrace" },
                { value: "prestige", label: "Prestige" },
              ]}
              onChange={set("priority")}
            />
          </InputGroup>
        </InputsCard>

        <div data-tool-in="" className="col-span-12 flex flex-col gap-3 md:gap-4 lg:col-span-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            <Stat label="Workstations" value={req.desks} note={`${sqftPerDesk[input.workstyle]} sq ft each`} />
            <Stat
              label="Team in 3 years"
              value={Math.round(input.headcount * (1 + input.growth / 100))}
              suffix=" people"
              note={input.growth ? `+${input.growth}% growth planned` : "No growth planned"}
            />
            <Stat
              label="Strong matches"
              value={matches.filter((m) => m.fit >= 70).length}
              suffix={` of ${matches.length}`}
              note="Office types at 70% fit or more"
              tone="ink"
            />
          </div>

          <ResultCard eyebrow="How the space adds up">
            <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-mist">
              {req.parts.map((p, i) => (
                <motion.span
                  key={p.label}
                  className={`h-full first:rounded-l-full last:rounded-r-full ${tones[i % tones.length]}`}
                  initial={false}
                  animate={{ width: `${(p.sqft / req.total) * 100}%` }}
                  transition={{ duration: 0.7, ease }}
                />
              ))}
            </div>
            <ul className="mt-6 grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {req.parts.map((p, i) => (
                <li
                  key={p.label}
                  className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-[0.9rem]"
                >
                  <span className="flex items-center gap-3 text-ink">
                    <span className={`size-2.5 rounded-full ${tones[i % tones.length]}`} />
                    {p.label}
                  </span>
                  <span className="numerals text-stone">{fmt(p.sqft)}</span>
                </li>
              ))}
            </ul>
          </ResultCard>

          <div className="mt-2 flex items-center justify-between gap-4 px-1">
            <p className="eyebrow text-[0.58rem] text-stone">Your shortlist</p>
            <p className="text-[0.78rem] text-stone">Ranked by fit</p>
          </div>
          <ol className="flex flex-col gap-3 md:gap-4">
            <AnimatePresence initial={false} mode="popLayout">
              {shortlist.map((m, i) => (
                <motion.li
                  key={m.config.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease }}
                  className={`grid grid-cols-12 gap-4 overflow-hidden border p-4 md:p-5 ${
                    i === 0
                      ? "corner border-ink bg-paper shadow-[0_30px_60px_-40px_rgb(0_0_0/0.4)]"
                      : "corner-alt border-line bg-paper"
                  }`}
                >
                  <div className="col-span-12 flex flex-col gap-5 p-2 md:col-span-7 md:p-3">
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={`numerals grid size-9 place-items-center rounded-full text-[0.78rem] ${
                          i === 0 ? "bg-accent text-paper" : "bg-mist text-ink"
                        }`}
                      >
                        0{i + 1}
                      </span>
                      <span className="rounded-full border border-line px-3 py-1 text-[0.72rem] text-stone">
                        Level {m.config.floors.replace("L", "")}
                      </span>
                    </div>
                    <h3 className="display text-[1.3rem] leading-tight text-ink">{matchTitle(m)}</h3>
                    <div>
                      <div className="flex items-baseline justify-between text-[0.82rem]">
                        <span className="text-stone">Fit</span>
                        <span className="numerals text-accent">{m.fit}%</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-mist">
                        <motion.div
                          className="h-full rounded-full bg-accent"
                          initial={false}
                          animate={{ width: `${m.fit}%` }}
                          transition={{ duration: 0.8, ease }}
                        />
                      </div>
                    </div>
                    <dl className="grid grid-cols-3 gap-2">
                      {[
                        ["Size", fmt(m.size)],
                        ["Desks", String(m.capacity)],
                        ["Headroom", m.headroom >= 0 ? `+${m.headroom}` : String(m.headroom)],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-xl bg-mist px-3 py-2.5">
                          <dt className="eyebrow text-[0.5rem] text-stone">{k}</dt>
                          <dd className="numerals mt-1 text-[0.95rem] text-ink">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <ul className="flex flex-col gap-1.5 text-[0.88rem] text-ink">
                      {m.reasons.map((r) => (
                        <li key={r} className="flex gap-3">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                          {r}
                        </li>
                      ))}
                    </ul>
                    <LeadButton
                      intent={{
                        source: "tool-spacedna",
                        purpose: "own-use",
                        unit: `${matchTitle(m)} · ~${m.size} sq ft · team ${input.headcount}`,
                      }}
                      variant={i === 0 ? "primary" : "ghost"}
                      className="mt-1 self-start"
                    >
                      Get prices for this match
                    </LeadButton>
                  </div>
                  <div className="relative col-span-12 min-h-[14rem] overflow-hidden rounded-2xl bg-mist md:col-span-5">
                    <Image
                      src={media[m.config.plan as MediaKey]}
                      alt={`Typical plan, ${matchTitle(m)}`}
                      fill
                      sizes="(min-width: 768px) 30vw, 100vw"
                      className="object-contain p-4 mix-blend-multiply"
                    />
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>

          <p className="px-1 text-[0.74rem] leading-relaxed text-stone">
            Planning estimate using common workplace ratios; a fit-out designer will confirm layouts. Unit sizes are
            indicative and availability is confirmed at launch.
          </p>
        </div>
      </div>
    </div>
  );
}
