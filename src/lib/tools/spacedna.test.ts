import { describe, expect, it } from "vitest";
import { dnaDefaults, rankMatches, requirement } from "./spacedna";

describe("requirement", () => {
  it("grows with headcount and shrinks with hybrid working", () => {
    const base = requirement(dnaDefaults).total;
    expect(requirement({ ...dnaDefaults, headcount: 40 }).total).toBeGreaterThan(base);
    expect(requirement({ ...dnaDefaults, hybrid: 60 }).total).toBeLessThan(base);
  });

  it("sums its parts", () => {
    const r = requirement(dnaDefaults);
    expect(r.parts.reduce((s, p) => s + p.sqft, 0)).toBe(r.total);
  });
});

describe("rankMatches", () => {
  it("puts a small-office configuration first for a five-person team", () => {
    const [top] = rankMatches({
      ...dnaDefaults,
      headcount: 5,
      growth: 0,
      meetingRooms: 1,
      clientFacing: false,
      priority: "value",
    });
    expect(top.config.max).toBeLessThan(3000);
  });

  it("puts a full floor or larger first for a 120-person firm", () => {
    const [top] = rankMatches({ ...dnaDefaults, headcount: 120, meetingRooms: 6, priority: "prestige" });
    expect(top.size).toBeGreaterThanOrEqual(12000);
  });

  it("returns fit scores between 0 and 99, sorted", () => {
    const m = rankMatches(dnaDefaults);
    for (let i = 1; i < m.length; i++) expect(m[i].fit).toBeLessThanOrEqual(m[i - 1].fit);
    expect(m.every((x) => x.fit >= 0 && x.fit <= 99)).toBe(true);
  });
});
