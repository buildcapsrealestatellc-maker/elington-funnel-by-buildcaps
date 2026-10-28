import { describe, expect, it } from "vitest";
import { broker } from "@/lib/data/broker";
import { faq } from "@/lib/data/faq";
import { toVerify } from "@/lib/data/tower";
import { driveTimesTo, findOffices, paymentPlanFor, respondOffline, sqftForTeam } from "./engine";
import { runOfflineCall } from "./tools";

const tools = (q: string) => respondOffline(q).calls.map((c) => c.tool);

describe("findOffices", () => {
  it("sizes a team and returns the closest office types first", () => {
    const { target, matches, exact } = findOffices({ teamSize: 25 });
    expect(target).toBe(sqftForTeam(25));
    expect(exact).toBe(true);
    expect(matches.length).toBeGreaterThan(0);
    const t = target ?? 0;
    const gap = (m: (typeof matches)[number]) => (t < m.min ? m.min - t : t > m.max ? t - m.max : 0);
    for (let i = 1; i < matches.length; i++) expect(gap(matches[i])).toBeGreaterThanOrEqual(gap(matches[i - 1]));
  });

  it("treats a single area as a target", () => {
    const { matches } = findOffices({ minSqft: 3000 });
    expect(matches.every((m) => m.max >= 2400 && m.min <= 4050)).toBe(true);
  });

  it("falls back to the nearest sizes when nothing is in range", () => {
    const { exact, matches } = findOffices({ minSqft: 40000, maxSqft: 45000 });
    expect(exact).toBe(false);
    expect(matches[0].id).toBe("triplex");
  });
});

describe("paymentPlanFor", () => {
  it("splits 70/30 and the amounts add up to the price", () => {
    const { stages } = paymentPlanFor({ price: 10_000_000 });
    expect(stages.map((s) => s.pct)).toEqual([20, 20, 30, 30]);
    expect(stages.reduce((s, x) => s + (x.amount ?? 0), 0)).toBe(10_000_000);
  });

  it("shows percentages only without a price", () => {
    expect(paymentPlanFor({}).stages.every((s) => s.amount === undefined)).toBe(true);
  });
});

describe("driveTimesTo", () => {
  it("finds a named place", () => {
    const r = driveTimesTo({ place: "the DIFC" });
    expect(r.matched).toBe(true);
    expect(r.rows).toEqual([{ place: "DIFC", minutes: 4 }]);
  });

  it("returns the nearest places when it can't match", () => {
    const r = driveTimesTo({ place: "mars colony" });
    expect(r.matched).toBe(false);
    expect(r.rows.length).toBe(7);
  });
});

describe("respondOffline", () => {
  it("routes payment questions to the payment card", () => {
    expect(tools("How does the 70/30 payment plan work?")).toContain("paymentPlan");
  });

  it("does not confuse floor plans with the payment plan", () => {
    const calls = respondOffline("Can you show me the floor plans?").calls;
    expect(calls.map((c) => c.tool)).not.toContain("paymentPlan");
    expect(calls).toContainEqual({ tool: "showSection", input: { section: "floorPlans" } });
  });

  it("reads a team size", () => {
    expect(respondOffline("We are a team of 30 people").calls[0]).toEqual({
      tool: "findOffices",
      input: { teamSize: 30 },
    });
  });

  it("never quotes the unconfirmed price and offers a consultant", () => {
    const r = respondOffline("What's the price per sq ft?");
    expect(r.calls.map((c) => c.tool)).toContain("requestCallback");
    expect(r.text).not.toContain(toVerify.pricePerSqFt.split(" ")[1]);
  });

  it("answers ownership eligibility and hands it to a person", () => {
    const r = respondOffline("Can I own an office as a foreigner?");
    expect(r.calls.map((c) => c.tool)).toEqual(["requestCallback"]);
    expect(r.text).toMatch(/freehold/);
  });

  it("sells the Golden Visa route without promising it", () => {
    const r = respondOffline("Do I get a golden visa if I buy here?");
    expect(r.calls).toEqual([
      { tool: "showSection", input: { section: "goldenVisa" } },
      { tool: "requestCallback", input: { topic: "Golden Visa eligibility" } },
    ]);
    expect(r.text).toMatch(/10-year/);
    expect(r.text).toMatch(/AED 2 million/);
    expect(r.text).toMatch(/consultant confirms/);
  });

  it("offers the brochure through the secure form", () => {
    for (const q of ["Can you send me the brochure?", "Is there a PDF I can download?"]) {
      expect(respondOffline(q).calls).toEqual([{ tool: "sendBrochure", input: {} }]);
    }
  });

  it("covers location and amenities", () => {
    expect(tools("How far is the airport?")).toContain("driveTimes");
    expect(tools("Is there a gym?")).toContain("amenities");
  });

  it("falls back to a menu of topics", () => {
    expect(respondOffline("asdf qwerty").calls).toEqual([]);
  });
});

describe("runOfflineCall", () => {
  it("resolves a section to its page anchor", async () => {
    expect(await runOfflineCall({ tool: "showSection", input: { section: "floorPlans" } })).toMatchObject({
      id: "offices",
      label: "Floor plans",
    });
    expect(await runOfflineCall({ tool: "showSection", input: { section: "goldenVisa" } })).toMatchObject({
      id: "golden-visa",
      label: "Golden Visa",
    });
  });

  it("routes call backs to the brokerage, with a WhatsApp chat about the topic", async () => {
    const out = (await runOfflineCall({ tool: "requestCallback", input: { topic: "Golden Visa eligibility" } })) as {
      phone: string;
      whatsapp: string;
    };
    expect(out.phone).toBe(broker.phone);
    expect(out.whatsapp).toMatch(new RegExp(`^https://wa\\.me/${broker.whatsapp}\\?text=`));
    expect(decodeURIComponent(out.whatsapp)).toContain("Golden Visa eligibility");
  });

  it("describes the brochure", async () => {
    expect(await runOfflineCall({ tool: "sendBrochure", input: {} })).toMatchObject({ pages: 71 });
  });
});

describe("faq", () => {
  it("has unique ids, so the Concierge finds every answer", () => {
    const ids = faq.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
