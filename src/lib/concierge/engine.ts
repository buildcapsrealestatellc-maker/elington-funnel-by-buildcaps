// Berkeley Concierge: the deterministic side. Every figure the Concierge
// shows comes from these functions (fed by lib/data), whether the AI model is
// answering or the offline responder is. Pure and shared by server and tests.

import { type FaqId, faq } from "@/lib/data/faq";
import { type SectionKey, sectionKeys, sections } from "@/lib/data/sections";
import {
  amenityLevels,
  brochure,
  driveTimes,
  paymentPlan,
  project,
  type UnitConfig,
  unitConfigs,
} from "@/lib/data/tower";
import { dnaDefaults, requirement } from "@/lib/tools/spacedna";

/* ─── Page sections the Concierge can take a visitor to (lib/data/sections) ─── */
export { type SectionKey, sectionKeys, sections };

export const planners = {
  spacedna: { name: "SpaceDNA", line: "Sizes the space your team needs and ranks Berkeley's office types against it." },
  horizon: { name: "Ownership Horizon", line: "Dates every 70/30 instalment and compares owning with renting." },
} as const;

export type PlannerKey = keyof typeof planners;

/* ─── Offices ─── */
export type OfficeMatch = {
  id: string;
  label: string;
  floors: string;
  min: number;
  max: number;
  indicative: boolean;
};

export function officeLabel(c: UnitConfig) {
  if (c.zone === "duplex") return "Duplex headquarters";
  if (c.zone === "triplex") return "Triplex headquarters";
  if (c.perFloor === "Full floor") return "Full-floor office";
  return `${c.zone === "low" ? "Lower" : "Upper"} floors · ${c.perFloor} per floor`;
}

const toMatch = (c: UnitConfig): OfficeMatch => ({
  id: c.id,
  label: officeLabel(c),
  floors: c.floors,
  min: c.min,
  max: c.max,
  indicative: c.status === "verify",
});

/** Space a team needs, using SpaceDNA's balanced defaults. */
export function sqftForTeam(teamSize: number) {
  return requirement({ ...dnaDefaults, headcount: Math.max(1, Math.round(teamSize)), growth: 0 }).total;
}

export function findOffices(input: { teamSize?: number; minSqft?: number; maxSqft?: number }) {
  const target = input.teamSize ? sqftForTeam(input.teamSize) : undefined;
  let lo = input.minSqft ?? 0;
  let hi = input.maxSqft ?? Number.POSITIVE_INFINITY;
  if (target) {
    lo = Math.max(lo, target * 0.85);
    hi = Math.min(hi, target * 1.7);
  } else if (input.minSqft && !input.maxSqft) {
    // "about 3,000 sq ft" reads as a target, not a floor
    lo = input.minSqft * 0.8;
    hi = input.minSqft * 1.35;
  }
  const centre = target ?? (Number.isFinite(hi) ? (lo + hi) / 2 : lo);
  const distance = (c: UnitConfig) => (centre < c.min ? c.min - centre : centre > c.max ? centre - c.max : 0);
  const inRange = unitConfigs.filter((c) => c.max >= lo && c.min <= hi);
  const pool = inRange.length ? inRange : [...unitConfigs];
  const matches = pool
    .sort((a, b) => distance(a) - distance(b) || a.min - b.min)
    .slice(0, 4)
    .map(toMatch);
  return { target, exact: inRange.length > 0, matches };
}

/* ─── Payment plan ─── */
export function paymentPlanFor(input: { price?: number }) {
  const sum = (phase: string) => paymentPlan.filter((p) => p.phase === phase).reduce((s, p) => s + p.pct, 0);
  const stages = [
    { label: "At booking", pct: sum("booking") },
    { label: "First year, 4 × 5%", pct: sum("time") },
    { label: "Construction, 6 × 5%", pct: sum("build") },
    { label: "On completion", pct: sum("completion") },
  ].map((s) => ({ ...s, amount: input.price ? Math.round((input.price * s.pct) / 100) : undefined }));
  return {
    stages,
    price: input.price,
    serviceCharge: project.serviceCharge,
    note: "Indicative schedule from the project brief; the Sales and Purchase Agreement governs final terms.",
  };
}

/* ─── Location ─── */
const stopWords = new Set([
  "the",
  "and",
  "for",
  "from",
  "near",
  "how",
  "far",
  "long",
  "does",
  "take",
  "get",
  "way",
  "drive",
  "minutes",
  "mins",
  "berkeley",
  "tower",
  "office",
  "dubai",
]);

export function driveTimesTo(input: { place?: string }) {
  const q = input.place?.toLowerCase().trim();
  const words = q ? q.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !stopWords.has(w)) : [];
  const hits = words.length ? driveTimes.filter((d) => words.some((w) => d.place.toLowerCase().includes(w))) : [];
  return {
    matched: hits.length > 0,
    rows: (hits.length ? hits : driveTimes.slice(0, 7)).map((d) => ({ place: d.place, minutes: d.minutes })),
    metro: "Business Bay Metro Station (Red Line) is next to the tower.",
  };
}

/* ─── Amenities ─── */
export function amenitiesOn(input: { level?: number }) {
  const levels = input.level ? amenityLevels.filter((l) => l.floor === input.level) : amenityLevels;
  return {
    levels: (levels.length ? levels : amenityLevels).map((l) => ({
      floor: l.floor,
      name: l.name,
      tagline: l.tagline,
      features: [...l.features],
    })),
  };
}

/* ─── Offline responder: answers from the brief when no model is configured ─── */
export type OfflineCall =
  | { tool: "findOffices"; input: { teamSize?: number; minSqft?: number; maxSqft?: number } }
  | { tool: "paymentPlan"; input: { price?: number } }
  | { tool: "driveTimes"; input: { place?: string } }
  | { tool: "amenities"; input: { level?: number } }
  | { tool: "showSection"; input: { section: SectionKey } }
  | { tool: "openPlanner"; input: { planner: PlannerKey } }
  | { tool: "requestCallback"; input: { topic?: string } }
  | { tool: "sendBrochure"; input: Record<string, never> };

const answer = (id: FaqId) => faq.find((f) => f.id === id)?.a ?? "";

/** What the brochure card offers; unlocked through the lead form. */
export function brochureInfo() {
  return { pages: brochure.pages, size: brochure.size, contents: [...brochure.contents] };
}

function parseTeam(t: string) {
  const m =
    t.match(/(\d{1,4})\s*(?:-|\s)?\s*(?:people|persons?|staff|employees|desks|seats|heads|member)/) ??
    t.match(/team of\s*(\d{1,4})/);
  return m ? Number(m[1]) : undefined;
}

function parseSqft(t: string) {
  const m = t.match(/(\d[\d,]{2,6})\s*(?:sq\.?\s*ft|sqft|square\s*f(?:ee|oo)t|sf\b)/);
  return m ? Number(m[1].replace(/,/g, "")) : undefined;
}

function parseLevel(t: string) {
  const m = t.match(/(?:level|floor|l)\s*(3[2-5])\b/);
  return m ? Number(m[1]) : undefined;
}

const has = (t: string, re: RegExp) => re.test(t);

export function respondOffline(question: string): { text: string; calls: OfflineCall[] } {
  const t = question.toLowerCase();
  const team = parseTeam(t);
  const sqft = parseSqft(t);
  const wantsPlans = has(t, /\bfloor ?plans?\b|\blayouts?\b/);

  if (has(t, /^(hi|hello|hey|salam|marhaba|good (morning|afternoon|evening))\b/) && t.length < 30) {
    return {
      text: "Hello, I'm the Berkeley Concierge. Ask me about office sizes, the 70/30 payment plan, the location or the amenities, and I'll show you the details.",
      calls: [],
    };
  }

  if (has(t, /\b(price|prices|pricing|cost|costs|how much|aed|per sq|psf)\b/)) {
    return {
      text: "Ellington hasn't published the official price list yet, so I can't quote a price as fact. A Berkeley consultant can send the list and live availability as soon as it opens. Meanwhile, this is how the 70/30 plan splits.",
      calls: [
        { tool: "paymentPlan", input: {} },
        { tool: "requestCallback", input: { topic: "price list" } },
      ],
    };
  }

  if (team) {
    return {
      text: `For a team of ${team}, these office types are closest to the space you'd need, using balanced workplace ratios. SpaceDNA can refine it for hybrid working, meeting rooms and growth.`,
      calls: [
        { tool: "findOffices", input: { teamSize: team } },
        { tool: "openPlanner", input: { planner: "spacedna" } },
      ],
    };
  }

  if (has(t, /\b(brochures?|catalogue|e-?brochure|pdf|download)\b/)) {
    return {
      text: "The full brochure covers the architecture, the amenity levels, a floor plan for every office type and the payment plan. Leave your name and mobile in the secure form and it's yours straight away.",
      calls: [{ tool: "sendBrochure", input: {} }],
    };
  }

  if (has(t, /\bvisas?\b|\bresiden(cy|ce)\b/)) {
    return {
      text: answer("golden-visa"),
      calls: [
        { tool: "showSection", input: { section: "goldenVisa" } },
        { tool: "requestCallback", input: { topic: "Golden Visa eligibility" } },
      ],
    };
  }

  if (
    has(
      t,
      /\b(freehold|foreigners?|nationalit\w*|eligible|eligibility|licen[cs]e|ownership)\b|can i (buy|own)|own (an|a|the) office/,
    )
  ) {
    const advice = has(t, /\blicen[cs]e\b/)
      ? " Licensing questions depend on your situation, so a consultant should confirm them with the authorities."
      : "";
    return {
      text: answer("freehold") + advice,
      calls: [{ tool: "requestCallback", input: { topic: "eligibility" } }],
    };
  }

  if (!wantsPlans && has(t, /\b(payment|payments|instal\w*|70\s*\/\s*30|plan|deposit|booking|down ?payment|eoi)\b/)) {
    return {
      text: answer("payment"),
      calls: [
        { tool: "paymentPlan", input: {} },
        { tool: "showSection", input: { section: "paymentPlan" } },
      ],
    };
  }

  if (has(t, /\b(handover|completion|completed|ready|delivery date)\b|when will/)) {
    return { text: answer("completion"), calls: [{ tool: "requestCallback", input: { topic: "completion date" } }] };
  }

  if (has(t, /\b(service charges?|maintenance fees?|running costs?)\b/)) {
    return { text: answer("service-charge"), calls: [] };
  }

  if (
    has(
      t,
      /\b(metro|location|located|where|drive|driving|commute|airport|difc|downtown|minutes|traffic|szr|sheikh zayed|dxb|mall)\b/,
    )
  ) {
    const place = t.match(/(?:to|from|near)\s+([a-z ]{3,40})/)?.[1];
    return {
      text: answer("access"),
      calls: [
        { tool: "driveTimes", input: { place } },
        { tool: "showSection", input: { section: "location" } },
      ],
    };
  }

  if (
    has(t, /\b(amenit\w*|gym|fitness|prayer|club|clubhouse|co-?working|terraces?|pilates|spinning|wellness|lounge)\b/)
  ) {
    return {
      text: answer("amenities"),
      calls: [
        { tool: "amenities", input: { level: parseLevel(t) } },
        { tool: "showSection", input: { section: "amenities" } },
      ],
    };
  }

  if (has(t, /\b(lifts?|elevators?|parking|ev|charging|smart|technology|security)\b/)) {
    return {
      text: `Berkeley has ${project.lifts.doubleDeck} destination-controlled double-deck lifts that move ${project.lifts.passengersAtOnce} people at once, smart access gates, and ${project.parking.bays} robotic parking bays plus ${project.parking.valet} valet bays.`,
      calls: [{ tool: "showSection", input: { section: has(t, /\b(lifts?|elevators?)\b/) ? "lifts" : "technology" } }],
    };
  }

  if (has(t, /\b(ellington|developer|track record)\b/)) {
    return {
      text: `Berkeley Tower is developed by ${project.developer}, a design-led Dubai developer founded in ${project.developerFounded}.`,
      calls: [{ tool: "showSection", input: { section: "developer" } }],
    };
  }

  if (has(t, /\b(vertiport|drones?|air ?taxi|evtol)\b/)) {
    return {
      text: "The crown at level 60 is designed for future air-taxi services, and level 33 has drone delivery platforms. Both depend on future operators and authority approvals.",
      calls: [{ tool: "showSection", input: { section: "future" } }],
    };
  }

  if (has(t, /\b(rent|renting|roi|yield|invest|investment|investor|return|returns|horizon|resale)\b/)) {
    return {
      text: "Ownership Horizon models owning versus renting under the 70/30 plan, year by year, and the investor yield. It's an estimate built on the project's own payment schedule.",
      calls: [{ tool: "openPlanner", input: { planner: "horizon" } }],
    };
  }

  if (
    sqft ||
    wantsPlans ||
    has(t, /\b(sizes?|sq ?ft|sqft|offices?|units?|full floor|duplex|triplex|headquarters?|hq)\b/)
  ) {
    return {
      text: sqft
        ? `These Berkeley office types sit closest to ${sqft.toLocaleString("en-US")} sq ft.`
        : answer("sizes"),
      calls: [
        { tool: "findOffices", input: sqft ? { minSqft: sqft } : {} },
        { tool: "showSection", input: { section: "floorPlans" } },
      ],
    };
  }

  if (has(t, /\b(call|phone|speak|talk|human|agent|consultant|visit|tour|whatsapp|meeting|contact)\b/)) {
    return {
      text: "A Berkeley consultant can call you back with the price list, availability and a private briefing.",
      calls: [{ tool: "requestCallback", input: { topic: "consultant" } }],
    };
  }

  return {
    text: "I can help with office sizes for your team, the 70/30 payment plan, the Golden Visa route, the location and drive times, the amenity levels and the brochure. What would you like to know?",
    calls: [],
  };
}
