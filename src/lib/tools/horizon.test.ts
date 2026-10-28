import { describe, expect, it } from "vitest";
import { buildSchedule, horizonDefaults, runHorizon, xirr } from "./horizon";

const start = new Date(2026, 9, 24);

describe("buildSchedule", () => {
  const price = 10_000_000;
  const schedule = buildSchedule(price, start, new Date(2031, 5, 30));

  it("follows the 70/30 plan and sums to the full price", () => {
    expect(schedule).toHaveLength(12);
    expect(schedule.reduce((s, i) => s + i.amount, 0)).toBeCloseTo(price);
    expect(schedule.at(-1)?.cumulativePct).toBe(100);
    expect(schedule.filter((i) => i.phase !== "completion").reduce((s, i) => s + i.pct, 0)).toBe(70);
  });

  it("dates instalments in order, ending at handover", () => {
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].date.getTime()).toBeGreaterThanOrEqual(schedule[i - 1].date.getTime());
    }
    expect(schedule.at(-1)?.date.getFullYear()).toBe(2031);
  });
});

describe("xirr", () => {
  it("recovers a known 10% annual return", () => {
    const r = xirr([
      { date: new Date(2026, 0, 1), amount: -1000 },
      { date: new Date(2027, 0, 1), amount: 1100 },
    ]);
    expect(r).not.toBeNull();
    expect(r as number).toBeCloseTo(0.1, 2);
  });

  it("returns null without both inflows and outflows", () => {
    expect(xirr([{ date: start, amount: -5 }])).toBeNull();
  });
});

describe("runHorizon", () => {
  it("prices the unit and splits 70/30", () => {
    const r = runHorizon({ ...horizonDefaults, start });
    expect(r.price).toBe(2860 * 4750);
    expect(r.duringConstruction / r.price).toBeCloseTo(0.7);
    expect(r.onCompletion / r.price).toBeCloseTo(0.3);
    expect(r.fees).toBeCloseTo(r.price * 0.04 + 4200);
  });

  it("gives a finite occupier payback when rent exceeds service charge", () => {
    const r = runHorizon({ ...horizonDefaults, start });
    expect(Number.isFinite(r.occupier.paybackYears)).toBe(true);
    expect(r.occupier.paybackYears).toBeGreaterThan(5);
    expect(r.occupier.paybackYears).toBeLessThan(40);
  });

  it("computes investor yields consistent with the inputs", () => {
    const r = runHorizon({ ...horizonDefaults, mode: "investor", start });
    expect(r.investor.grossYield).toBeCloseTo(260 / 4750, 4);
    expect(r.investor.netYield).toBeLessThan(r.investor.grossYield);
    expect(r.investor.irr).not.toBeNull();
  });

  it("covers every year from booking to the horizon", () => {
    const r = runHorizon({ ...horizonDefaults, start });
    expect(r.years[0].year).toBe(2026);
    expect(r.years.at(-1)?.year).toBe(2031 + horizonDefaults.yearsAfter);
  });
});
