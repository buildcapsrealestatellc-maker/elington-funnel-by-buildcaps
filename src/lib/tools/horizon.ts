// Ownership Horizon: the deterministic engine behind the own-vs-rent and
// investor simulator. Pure functions only; every figure on screen comes
// from here (AI narration, when added, only explains these numbers).
//
// All results are illustrative estimates. Prices are indicative until the
// official launch price list (see lib/data/tower.ts → toVerify).

import { paymentPlan } from "@/lib/data/tower";

export type HorizonMode = "occupier" | "investor";

export type HorizonInput = {
  mode: HorizonMode;
  sqft: number;
  pricePerSqft: number;
  /** Handover year (indicative); completion assumed mid-year. */
  handoverYear: number;
  /** Years analysed after handover. */
  yearsAfter: number;
  /** Occupier: today's rent for comparable space, AED / sq ft / year. */
  rentPerSqft: number;
  /** Annual rent growth, %. */
  rentGrowth: number;
  /** Investor: expected rent at handover, AED / sq ft / year. */
  marketRentPerSqft: number;
  /** Investor: vacancy and void allowance, %. */
  vacancy: number;
  /** Annual capital growth assumption, %. */
  appreciation: number;
  serviceCharge: number;
  dldPct: number;
  adminFee: number;
  /** Booking date (defaults to today). */
  start?: Date;
};

export const horizonDefaults: HorizonInput = {
  mode: "occupier",
  sqft: 2860,
  pricePerSqft: 4750,
  handoverYear: 2031,
  yearsAfter: 7,
  rentPerSqft: 240,
  rentGrowth: 5,
  marketRentPerSqft: 260,
  vacancy: 5,
  appreciation: 4,
  serviceCharge: 24,
  dldPct: 4,
  adminFee: 4200,
};

export type Instalment = {
  label: string;
  date: Date;
  pct: number;
  amount: number;
  cumulativePct: number;
  phase: "booking" | "time" | "build" | "completion";
};

export type YearRow = {
  year: number;
  /** Purchase payments + fees + service charge paid this year. */
  ownOut: number;
  /** Occupier: rent that would be paid this year if renting (post-handover). Investor: net rent received. */
  benefit: number;
  /** Cumulative (benefit + equity gain − ownOut), i.e. the running net position. */
  net: number;
};

export type HorizonResult = {
  price: number;
  fees: number;
  schedule: Instalment[];
  duringConstruction: number;
  onCompletion: number;
  handover: Date;
  horizonYear: number;
  valueAtHorizon: number;
  years: YearRow[];
  occupier: {
    annualRentAtHandover: number;
    annualServiceCharge: number;
    /** Years of avoided rent (net of service charge) to repay the full cost. */
    paybackYears: number;
    rentPaidIfRenting: number;
    ownershipCost: number;
    advantage: number;
  };
  investor: {
    annualGrossRent: number;
    grossYield: number;
    netYield: number;
    totalIncome: number;
    irr: number | null;
  };
};

const addMonths = (d: Date, m: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
};
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
const yearsBetween = (a: Date, b: Date) => (b.getTime() - a.getTime()) / (365.25 * 86_400_000);

/** The official 70/30 plan, dated: time-based steps, then construction milestones spread to handover. */
export function buildSchedule(price: number, start: Date, handover: Date): Instalment[] {
  const timeDays = [90, 180, 240, 360];
  const buildStart = addMonths(start, 15);
  const buildEnd = addMonths(handover, -6);
  const buildSteps = paymentPlan.filter((p) => p.phase === "build");
  let cumulative = 0;
  let t = 0;
  let b = 0;
  return paymentPlan.map((p) => {
    let date = start;
    if (p.phase === "time") date = addDays(start, timeDays[t++]);
    if (p.phase === "build") {
      const f = buildSteps.length > 1 ? b++ / (buildSteps.length - 1) : 0;
      date = new Date(buildStart.getTime() + f * (buildEnd.getTime() - buildStart.getTime()));
    }
    if (p.phase === "completion") date = handover;
    cumulative += p.pct;
    return {
      label: p.when,
      date,
      pct: p.pct,
      amount: (price * p.pct) / 100,
      cumulativePct: cumulative,
      phase: p.phase,
    };
  });
}

/** Annualised internal rate of return for dated cash flows (bisection; null if none). */
export function xirr(flows: { date: Date; amount: number }[]): number | null {
  if (!flows.length || !flows.some((f) => f.amount > 0) || !flows.some((f) => f.amount < 0)) return null;
  const t0 = flows[0].date;
  const npv = (r: number) => flows.reduce((s, f) => s + f.amount / (1 + r) ** yearsBetween(t0, f.date), 0);
  let lo = -0.9;
  let hi = 1.5;
  if (npv(lo) * npv(hi) > 0) return null;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export function runHorizon(input: HorizonInput): HorizonResult {
  const start = input.start ?? new Date();
  const handover = new Date(input.handoverYear, 5, 30);
  const price = input.sqft * input.pricePerSqft;
  const fees = (price * input.dldPct) / 100 + input.adminFee;
  const schedule = buildSchedule(price, start, handover);
  const duringConstruction = schedule.filter((s) => s.phase !== "completion").reduce((s, i) => s + i.amount, 0);
  const onCompletion = price - duringConstruction;
  const horizonYear = input.handoverYear + input.yearsAfter;
  const horizonDate = new Date(horizonYear, 5, 30);
  const valueAtHorizon = price * (1 + input.appreciation / 100) ** yearsBetween(start, horizonDate);

  const g = input.rentGrowth / 100;
  const yearsToHandover = yearsBetween(start, handover);
  const annualRentAtHandover = input.sqft * input.rentPerSqft * (1 + g) ** yearsToHandover;
  const annualServiceCharge = input.sqft * input.serviceCharge;
  const annualGrossRent = input.sqft * input.marketRentPerSqft;
  const netRent = (yr: number) =>
    annualGrossRent * (1 + g) ** (yr - input.handoverYear) * (1 - input.vacancy / 100) - annualServiceCharge;

  // Year-by-year view from booking to the horizon.
  const years: YearRow[] = [];
  let net = 0;
  let prevValue = price;
  for (let year = start.getFullYear(); year <= horizonYear; year++) {
    let ownOut = schedule.filter((s) => s.date.getFullYear() === year).reduce((s, i) => s + i.amount, 0);
    if (year === start.getFullYear()) ownOut += fees;
    let benefit = 0;
    if (year >= input.handoverYear) {
      const part = year === input.handoverYear ? 0.5 : 1;
      ownOut += annualServiceCharge * part;
      if (input.mode === "occupier") {
        benefit = annualRentAtHandover * (1 + g) ** Math.max(0, year - input.handoverYear) * part;
      } else {
        benefit = (netRent(year) + annualServiceCharge) * part;
      }
    }
    const value = price * (1 + input.appreciation / 100) ** yearsBetween(start, new Date(year, 11, 31));
    const equityGain = value - prevValue;
    prevValue = value;
    net += benefit - ownOut + equityGain;
    years.push({ year, ownOut, benefit, net });
  }

  // Occupier: compare the post-handover period with renting.
  const rentPaidIfRenting = years.reduce((s, y) => s + (y.year >= input.handoverYear ? y.benefit : 0), 0);
  const scPaid = annualServiceCharge * (input.yearsAfter + 0.5);
  const ownershipCost = price + fees + scPaid - valueAtHorizon;
  const avoidedNet = annualRentAtHandover - annualServiceCharge;
  const paybackYears = avoidedNet > 0 ? (price + fees) / avoidedNet : Number.POSITIVE_INFINITY;

  // Investor: dated flows for IRR (purchase, yearly net rent, sale at horizon).
  const flows = [{ date: start, amount: -fees }, ...schedule.map((s) => ({ date: s.date, amount: -s.amount }))];
  for (let year = input.handoverYear + 1; year <= horizonYear; year++) {
    flows.push({ date: new Date(year, 5, 30), amount: netRent(year) });
  }
  flows.push({ date: horizonDate, amount: valueAtHorizon });
  flows.sort((a, b) => a.date.getTime() - b.date.getTime());
  const totalIncome = flows.filter((f) => f.amount > 0 && f.date < horizonDate).reduce((s, f) => s + f.amount, 0);

  return {
    price,
    fees,
    schedule,
    duringConstruction,
    onCompletion,
    handover,
    horizonYear,
    valueAtHorizon,
    years,
    occupier: {
      annualRentAtHandover,
      annualServiceCharge,
      paybackYears,
      rentPaidIfRenting,
      ownershipCost,
      advantage: rentPaidIfRenting - ownershipCost,
    },
    investor: {
      annualGrossRent,
      grossYield: annualGrossRent / price,
      netYield: (annualGrossRent * (1 - input.vacancy / 100) - annualServiceCharge) / (price + fees),
      totalIncome,
      irr: xirr(flows),
    },
  };
}

export const aed = (n: number, compact = false) => {
  if (compact) {
    if (Math.abs(n) >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
    if (Math.abs(n) >= 1_000) return `AED ${Math.round(n / 1_000)}K`;
  }
  return `AED ${Math.round(n).toLocaleString("en-US")}`;
};
