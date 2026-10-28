"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { LeadButton } from "@/components/ui/Buttons";
import { aed, type HorizonInput, type HorizonMode, horizonDefaults, runHorizon } from "@/lib/tools/horizon";
import { Chips, HeroStat, InputGroup, InputsCard, ResultCard, Segmented, Slider, Stat, ToolHero } from "./ui";

const sizePresets = [
  { value: 1250, label: "1,250" },
  { value: 2860, label: "2,860" },
  { value: 5400, label: "5,400" },
  { value: 12182, label: "Full floor" },
  { value: 21873, label: "Duplex" },
];

const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const pct = (n: number, d = 1) => `${(n * 100).toFixed(d)}%`;
const spring = { type: "spring", stiffness: 140, damping: 22 } as const;

const phaseDot: Record<string, string> = {
  booking: "bg-accent",
  time: "bg-accent-bright",
  build: "bg-accent-soft ring-1 ring-accent/30",
  completion: "bg-ink",
};

function Legend({ mode }: { mode: HorizonMode }) {
  return (
    <span className="flex flex-wrap gap-4 text-[0.76rem] text-stone">
      <span className="flex items-center gap-2">
        <span className="size-2.5 rounded-sm bg-accent" /> Paid out
      </span>
      <span className="flex items-center gap-2">
        <span className="size-2.5 rounded-sm bg-ink" /> {mode === "occupier" ? "Rent avoided" : "Rent received"}
      </span>
      <span className="flex items-center gap-2">
        <span className="h-0.5 w-4 rounded-full bg-accent-bright" /> Net position
      </span>
    </span>
  );
}

/** Year-by-year flows: what goes out (purchase, fees, service charge) vs what comes back. */
function FlowChart({ years }: { years: ReturnType<typeof runHorizon>["years"] }) {
  const W = 1000;
  const H = 340;
  const zero = 200;
  const max = Math.max(1, ...years.map((y) => Math.max(y.ownOut, y.benefit)));
  const slot = W / years.length;
  const bw = Math.min(30, slot * 0.38);
  const up = (v: number) => (v / max) * (zero - 24);
  const down = (v: number) => (v / max) * (H - zero - 24);
  const nets = years.map((y) => y.net);
  const nMin = Math.min(...nets);
  const nMax = Math.max(...nets);
  const ny = (v: number) => 24 + ((nMax - v) / Math.max(1, nMax - nMin)) * (H - 48);
  const line = years.map((y, i) => `${i ? "L" : "M"}${(i + 0.5) * slot} ${ny(y.net).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full" role="img" aria-label="Annual cash flows and net position">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="currentColor" strokeOpacity={0.06} />
      ))}
      <line x1={0} x2={W} y1={zero} y2={zero} stroke="currentColor" strokeOpacity={0.2} />
      {years.map((y, i) => {
        const cx = (i + 0.5) * slot;
        return (
          <g key={y.year}>
            <motion.rect
              x={cx - bw - 1}
              width={bw}
              rx={3}
              initial={false}
              animate={{ y: zero - up(y.benefit), height: up(y.benefit) }}
              transition={spring}
              className="fill-ink"
            />
            <motion.rect
              x={cx + 1}
              width={bw}
              y={zero}
              rx={3}
              initial={false}
              animate={{ height: down(y.ownOut) }}
              transition={spring}
              className="fill-accent"
            />
            <text x={cx} y={H + 22} textAnchor="middle" className="fill-stone text-[18px]">
              {String(y.year).slice(2)}
            </text>
          </g>
        );
      })}
      <motion.path
        initial={false}
        animate={{ d: line }}
        transition={spring}
        fill="none"
        stroke="var(--color-accent-bright)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OwnershipHorizon() {
  const [input, setInput] = useState<HorizonInput>(horizonDefaults);
  const set =
    <K extends keyof HorizonInput>(k: K) =>
    (v: HorizonInput[K]) =>
      setInput((s) => ({ ...s, [k]: v }));
  const r = useMemo(() => runHorizon(input), [input]);
  const occupier = input.mode === "occupier";

  const summary = occupier
    ? `At AED ${input.pricePerSqft.toLocaleString("en-US")} per sq ft, a ${input.sqft.toLocaleString("en-US")} sq ft office costs ${aed(r.price, true)}. You would pay ${aed(r.duringConstruction, true)} during construction and ${aed(r.onCompletion, true)} at handover in ${monthFmt.format(r.handover)}. From handover, owning replaces about ${aed(r.occupier.annualRentAtHandover, true)} a year of rent with ${aed(r.occupier.annualServiceCharge, true)} of service charge, so the purchase and fees are repaid by roughly ${Math.round(r.occupier.paybackYears)} years of avoided rent. By ${r.horizonYear}, including ${input.appreciation}% a year value growth, owning is ${r.occupier.advantage >= 0 ? "ahead of" : "behind"} renting by about ${aed(Math.abs(r.occupier.advantage), true)}.`
    : `At AED ${input.pricePerSqft.toLocaleString("en-US")} per sq ft and AED ${input.marketRentPerSqft} per sq ft rent, a ${input.sqft.toLocaleString("en-US")} sq ft office yields about ${pct(r.investor.grossYield)} gross and ${pct(r.investor.netYield)} net of ${input.vacancy}% vacancy, service charge and fees. Paying 70% during construction and 30% at handover, then holding to ${r.horizonYear} with ${input.appreciation}% a year value growth, the projected annual return is ${r.investor.irr === null ? "not computable" : pct(r.investor.irr)}.`;

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <ToolHero
        eyebrow={`Ownership Horizon · ${occupier ? "Own use" : "Investor"}`}
        title={
          <>
            Own or rent, mapped to the <em>70/30 plan</em>
          </>
        }
        line="Move the sliders to see your payments by date, what ownership replaces, and where you stand by the year you choose."
      >
        {occupier ? (
          <>
            <HeroStat
              label={`Net vs renting, ${r.horizonYear}`}
              unit="AED"
              value={r.occupier.advantage / 1e6}
              suffix="M"
              decimals={2}
              note="Includes value growth"
              highlight
            />
            <HeroStat
              label="Payback"
              value={r.occupier.paybackYears}
              suffix=" yrs"
              decimals={1}
              note="Of avoided rent"
            />
          </>
        ) : (
          <>
            <HeroStat
              label="Projected IRR"
              value={(r.investor.irr ?? 0) * 100}
              suffix="%"
              decimals={1}
              note={`Hold to ${r.horizonYear}`}
              highlight
            />
            <HeroStat
              label="Net yield"
              value={r.investor.netYield * 100}
              suffix="%"
              decimals={1}
              note="After vacancy and costs"
            />
          </>
        )}
      </ToolHero>

      <div className="grid grid-cols-12 items-start gap-3 md:gap-4">
        <InputsCard className="col-span-12 lg:col-span-4">
          <InputGroup title="You">
            <Segmented
              label="I am buying as"
              value={input.mode}
              options={[
                { value: "occupier", label: "Own use" },
                { value: "investor", label: "Investor" },
              ]}
              onChange={set("mode")}
            />
          </InputGroup>
          <InputGroup title="The office">
            <div className="flex flex-col gap-3">
              <Slider
                label="Office size"
                value={input.sqft}
                min={1132}
                max={22191}
                step={10}
                onChange={set("sqft")}
                format={(v) => `${v.toLocaleString("en-US")} sq ft`}
              />
              <Chips value={input.sqft} options={sizePresets} onChange={set("sqft")} />
            </div>
            <Slider
              label="Price per sq ft"
              value={input.pricePerSqft}
              min={3500}
              max={6500}
              step={50}
              onChange={set("pricePerSqft")}
              format={(v) => `AED ${v.toLocaleString("en-US")}`}
              hint="Indicative until the launch price list is released."
            />
            <Slider
              label="Handover"
              value={input.handoverYear}
              min={2029}
              max={2032}
              onChange={set("handoverYear")}
              format={String}
            />
          </InputGroup>
          <InputGroup title="The market">
            {occupier ? (
              <>
                <Slider
                  label="Your rent today"
                  value={input.rentPerSqft}
                  min={120}
                  max={400}
                  step={5}
                  onChange={set("rentPerSqft")}
                  format={(v) => `AED ${v} / sq ft`}
                  hint="Business Bay Grade A rents run around AED 220–320."
                />
                <Slider
                  label="Rent growth"
                  value={input.rentGrowth}
                  min={0}
                  max={10}
                  step={0.5}
                  onChange={set("rentGrowth")}
                  format={(v) => `${v}% / yr`}
                />
              </>
            ) : (
              <>
                <Slider
                  label="Rent at handover"
                  value={input.marketRentPerSqft}
                  min={150}
                  max={400}
                  step={5}
                  onChange={set("marketRentPerSqft")}
                  format={(v) => `AED ${v} / sq ft`}
                />
                <Slider
                  label="Vacancy allowance"
                  value={input.vacancy}
                  min={0}
                  max={20}
                  onChange={set("vacancy")}
                  format={(v) => `${v}%`}
                />
              </>
            )}
            <Slider
              label="Value growth"
              value={input.appreciation}
              min={0}
              max={8}
              step={0.5}
              onChange={set("appreciation")}
              format={(v) => `${v}% / yr`}
            />
            <Slider
              label="Years after handover"
              value={input.yearsAfter}
              min={3}
              max={15}
              onChange={set("yearsAfter")}
              format={(v) => `${v} yrs`}
            />
          </InputGroup>
        </InputsCard>

        <div data-tool-in="" className="col-span-12 flex flex-col gap-3 md:gap-4 lg:col-span-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            <Stat
              label="Total price"
              unit="AED"
              value={r.price / 1e6}
              suffix="M"
              decimals={2}
              note={`+ ${aed(r.fees, true)} DLD & admin`}
            />
            <Stat
              label="During construction"
              unit="AED"
              value={r.duringConstruction / 1e6}
              suffix="M"
              decimals={2}
              note="70% over milestones"
            />
            <Stat
              label="At handover"
              unit="AED"
              value={r.onCompletion / 1e6}
              suffix="M"
              decimals={2}
              note={monthFmt.format(r.handover)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            {occupier ? (
              <>
                <Stat
                  label="Rent avoided a year"
                  unit="AED"
                  value={r.occupier.annualRentAtHandover / 1e3}
                  suffix="K"
                  note="At handover"
                />
                <Stat
                  label="Service charge a year"
                  unit="AED"
                  value={r.occupier.annualServiceCharge / 1e3}
                  suffix="K"
                  note="Anticipated, from handover"
                />
                <Stat
                  label={`Office value, ${r.horizonYear}`}
                  unit="AED"
                  value={r.valueAtHorizon / 1e6}
                  suffix="M"
                  decimals={2}
                  note={`At ${input.appreciation}% a year growth`}
                  tone="ink"
                />
              </>
            ) : (
              <>
                <Stat label="Gross yield" value={r.investor.grossYield * 100} suffix="%" decimals={1} />
                <Stat
                  label="Rent a year"
                  unit="AED"
                  value={r.investor.annualGrossRent / 1e3}
                  suffix="K"
                  note="Gross, at handover"
                />
                <Stat
                  label={`Office value, ${r.horizonYear}`}
                  unit="AED"
                  value={r.valueAtHorizon / 1e6}
                  suffix="M"
                  decimals={2}
                  note={`At ${input.appreciation}% a year growth`}
                  tone="ink"
                />
              </>
            )}
          </div>

          <ResultCard eyebrow="Year by year" aside={<Legend mode={input.mode} />}>
            <FlowChart years={r.years} />
          </ResultCard>

          <section className="corner-alt bg-accent-soft p-6 md:p-8">
            <p className="eyebrow text-[0.58rem] text-accent-deep">In plain words</p>
            <p className="mt-4 max-w-[52rem] text-[1.02rem] leading-[1.75] text-ink">{summary}</p>
          </section>

          <ResultCard
            eyebrow="Your payment schedule"
            aside={
              <span className="rounded-full border border-line px-3 py-1 text-[0.72rem] text-stone">Indicative</span>
            }
          >
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[30rem] text-left text-[0.9rem]">
                <tbody>
                  {r.schedule.map((s) => (
                    <tr key={s.label} className="border-b border-line last:border-0 hover:bg-mist">
                      <td className="numerals w-28 px-2 py-3 text-[0.8rem] text-stone">{monthFmt.format(s.date)}</td>
                      <td className="px-2 py-3 text-ink">
                        <span className="flex items-center gap-3">
                          <span className={`size-2 shrink-0 rounded-full ${phaseDot[s.phase]}`} />
                          {s.label}
                        </span>
                      </td>
                      <td className="numerals w-14 px-2 py-3 text-right text-ink">{s.pct}%</td>
                      <td className="numerals w-28 px-2 py-3 text-right text-ink">{aed(s.amount, true)}</td>
                      <td className="numerals hidden w-16 px-2 py-3 text-right text-[0.78rem] text-stone sm:table-cell">
                        {s.cumulativePct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[0.78rem] text-stone">
              Construction milestones are spread evenly to handover for illustration; actual dates follow site progress.
            </p>
          </ResultCard>

          <section className="corner relative overflow-hidden bg-ink p-6 text-paper md:p-8">
            <div aria-hidden="true" className="glow absolute -right-1/4 -top-full size-[34rem]" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="display text-[1.1rem]">Send me this as a memo</p>
                <p className="mt-2 max-w-md text-[0.92rem] text-paper/65">
                  With the official price list as soon as it is released.
                </p>
              </div>
              <LeadButton
                variant="light"
                intent={{
                  source: "tool-horizon",
                  purpose: occupier ? "own-use" : "investment",
                  unit: `${input.sqft} sq ft @ AED ${input.pricePerSqft}/sq ft (${input.mode})`,
                }}
              >
                Send me the memo
              </LeadButton>
            </div>
          </section>
          <p className="px-1 text-[0.74rem] leading-relaxed text-stone">
            Illustrative estimates only, not financial advice. Prices, handover and payment dates are indicative; rents,
            growth and yields are assumptions you control. Financing costs and the return your capital could earn
            elsewhere are not included. The Sales and Purchase Agreement governs final terms.
          </p>
        </div>
      </div>
    </div>
  );
}
