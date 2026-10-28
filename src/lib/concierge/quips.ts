// Ellis, the Concierge's face: one-line, gently sarcastic remarks about how a
// visitor is browsing. the AI model writes them when a key is configured; otherwise
// the offline pool below does. Facts come from lib/data only. Shared by the
// API route and tests; no browser or server APIs here.

import { z } from "zod";
import { goldenVisa, project } from "@/lib/data/tower";

export const quipKinds = [
  "arrive",
  "chapter",
  "fast-scroll",
  "rewind",
  "linger",
  "idle",
  "cta-hover",
  "form-closed",
  "tool-closed",
  "end",
  "returned",
  "exit",
] as const;

export type QuipKind = (typeof quipKinds)[number];

export const quipRequest = z.object({
  kind: z.enum(quipKinds),
  chapter: z.string().max(40).default(""),
  /** Seconds in the current chapter, idle seconds, or time away, by kind. */
  seconds: z.number().min(0).max(36000).optional(),
  /** What the visitor hovered, e.g. "Launch access". */
  target: z.string().max(40).optional(),
  visitSeconds: z.number().min(0).max(86400).default(0),
  chaptersSeen: z.number().int().min(0).max(60).default(0),
  /** Lines already said this visit; never repeated. */
  recent: z.array(z.string().max(200)).max(40).default([]),
});

export type QuipRequest = z.infer<typeof quipRequest>;

/** One short, true fact per chapter, for both the AI model and the offline pool. */
export const chapterFacts: Record<string, string> = {
  Overview: `${project.storeys} storeys and ${project.units} freehold offices beside Business Bay Metro`,
  Arrival: "a valet drop-off under a sculpted canopy",
  Lobby: "a double-height lobby with smart access gates",
  Architecture: "a louvered façade inspired by fabric in motion",
  Location: "four minutes by car to DIFC and Downtown, with the Metro next door",
  Market: "the district with more office sales than any other in Dubai in H1 2026",
  Amenities: "four amenity levels, 32 to 35, from co-working to a clubhouse and prayer rooms",
  Technology: `${project.lifts.doubleDeck} double-deck lifts that move ${project.lifts.passengersAtOnce} people at once`,
  "Floor plans": "offices from 1,132 sq ft up to a 12,182 sq ft full floor",
  Summit: "duplex and triplex headquarters on levels 54 to 58",
  Future: "vertiport readiness on level 60 and drone platforms on 33",
  "Payment plan": "a 70/30 plan: 20% at booking, 30% on completion",
  "Golden Visa": `a route to ${goldenVisa.years}-year UAE residency for investors who own AED ${goldenVisa.threshold / 1_000_000}M or more in property, off-plan included`,
  "AI studio": "planners that size your office and map the 70/30 payments",
  Ellington: `a design-led developer founded in ${project.developerFounded}`,
  Questions: `an anticipated service charge of AED ${project.serviceCharge} per sq ft`,
  "Launch access": "the full brochure the moment you register, then the price list and a private briefing",
};

const factFor = (chapter: string) => chapterFacts[chapter] ?? chapterFacts.Overview;

/** What happened, in words, for the prompt. */
export function describeMoment(q: QuipRequest): string {
  const where = q.chapter ? `in the "${q.chapter}" section` : "on the page";
  switch (q.kind) {
    case "arrive":
      return "The visitor has just arrived and watched the opening.";
    case "chapter":
      return `The visitor just reached the "${q.chapter}" section.`;
    case "fast-scroll":
      return `The visitor is scrolling very fast ${where}.`;
    case "rewind":
      return `The visitor scrolled back up a long way, now ${where}.`;
    case "linger":
      return `The visitor has stayed ${Math.round(q.seconds ?? 40)} seconds ${where}.`;
    case "idle":
      return `The visitor has not moved for ${Math.round(q.seconds ?? 30)} seconds ${where}.`;
    case "cta-hover":
      return `The visitor is hovering over the "${q.target ?? "Launch access"}" button without clicking.`;
    case "form-closed":
      return "The visitor opened the registration form and closed it without sending.";
    case "tool-closed":
      return `The visitor opened a planner tool and closed it after ${Math.round(q.seconds ?? 8)} seconds.`;
    case "end":
      return "The visitor reached the end of the page.";
    case "returned":
      return `The visitor came back to the tab after ${Math.round(q.seconds ?? 30)} seconds away.`;
    case "exit":
      return "The visitor's cursor is heading for the top of the window, as if about to leave.";
  }
}

export const quipInstructions = `
You are Ellis, the concierge character on the launch page for Berkeley Tower, Grade A freehold offices by Ellington Properties on Sheikh Zayed Road, Business Bay, Dubai. You watch how a visitor browses and make ONE short remark about what they just did.

Voice: dry, warm, gently sarcastic, like a sharp hotel concierge. Brand-safe for a luxury developer.

Rules:
- 6 to 18 words, one or two short sentences. Plain text: no emojis, hashtags, quotation marks or stage directions.
- Tease the behaviour, never the person. Nothing about intelligence, looks, money, nationality, age or anything personal.
- You may use one fact from the section fact you are given. Never invent numbers, prices, dates, discounts, availability or promises, and never tell anyone they qualify for a visa.
- Never repeat, paraphrase or reuse the joke of any line under "Already said".
- You may nudge lightly toward the brochure, the floor plans, the planners or registering. Never ask for personal details.
`.trim();

export function quipPrompt(q: QuipRequest): string {
  const said = q.recent.length ? q.recent.map((l) => `- ${l}`).join("\n") : "- (nothing yet)";
  return [
    `Moment: ${describeMoment(q)}`,
    `Section fact: ${factFor(q.chapter)}.`,
    `Visit so far: ${Math.round(q.visitSeconds)} seconds, ${q.chaptersSeen} sections seen.`,
    `Already said:\n${said}`,
    "Write Ellis's line.",
  ].join("\n");
}

/** Model output to a single clean line. */
export function cleanQuip(text: string): string {
  return text
    .replace(/^[\s"'“”‘’*-]+|[\s"'“”‘’*]+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/^Ellis:\s*/i, "")
    .slice(0, 160)
    .trim();
}

/* ─── Offline pool ─────────────────────────────────────────────
   Hand-written lines per moment, chapter lines, and fact templates as a
   last resort, so a visit never hears the same line twice. */

const pool: Record<QuipKind, string[]> = {
  arrive: [
    "Welcome in. I'm Ellis. I'll be watching your scrolling, purely professionally.",
    "Hello. Sixty storeys of office, and I'm the only one here who never takes a lunch break.",
    "Ellis, concierge. I don't sell offices, I just raise an eyebrow at how you browse them.",
  ],
  chapter: [],
  "fast-scroll": [
    "Sixty storeys, and you're taking them at express-lift speed.",
    "At that pace you'll reach the crown before the lift does.",
    "Easy. The façade took longer to design than that scroll.",
    "You just skipped an amenity floor and possibly a gym membership.",
    "That was quick. Did any of it stick, or shall I recap?",
    "Scrolling like the price list is chasing you. It isn't. Yet.",
  ],
  rewind: [
    "Back up again? Something caught your eye. Rhetorical question; I saw.",
    "A second look. The building has that effect on people.",
    "Rewinding. Fair enough, it's a lot of tower to take in.",
    "Going back for seconds. I'd recommend the floor plans.",
  ],
  linger: [
    "Still on {chapter}? Take your time. I'll just stand here being decorative.",
    "You've been on {chapter} a while. Shall I bring a chair?",
    "Very thorough. {Fact}, in case you were counting.",
    "Reading every word of {chapter}. My copywriter would be thrilled.",
  ],
  idle: [
    "Still there? I'll keep looking architectural in the meantime.",
    "Taking a break? The tower isn't going anywhere. It's a tower.",
    "Quiet moment. Perfect time to picture your logo up here.",
    "I've counted the louvers twice while you were away. Lovely, all of them.",
  ],
  "cta-hover": [
    "You've hovered on {target} long enough to qualify as a tenant.",
    "Go on, click {target}. The price list doesn't bite. It might impress.",
    "That {target} button is blushing from all the attention.",
    "Hovering is free. So is clicking {target}, just saying.",
  ],
  "form-closed": [
    "Closed the form? Commitment issues. Understandable, it's a big building.",
    "No pressure. The form will wait right here, quietly judging.",
    "Fair. Even the triplex was a first draft once.",
  ],
  "tool-closed": [
    "A short planning session. The numbers don't bite, I promise.",
    "In and out already? Efficient, or allergic to spreadsheets?",
    "That planner did all the maths and you barely said thank you.",
  ],
  end: [
    "You made it to the end. Most people stop at the lobby.",
    "Bottom of the page. Even the vertiport is behind you now.",
    "That's the whole tower. The only thing left is the price list.",
  ],
  returned: [
    "Welcome back. I kept your floor warm.",
    "You're back. Checked the other towers, didn't you? It's fine.",
    "Back already. The lifts missed you. Twelve of them.",
  ],
  exit: [
    "Leaving already? The view only improves from level 54.",
    "Before you go, the price list is one short form away.",
    "Off so soon? I was just getting to the good floors.",
  ],
};

const chapterLines: Record<string, string[]> = {
  Overview: ["Sixty storeys and you're reading the intro first. Respect."],
  Architecture: ["Yes, the façade moves like silk. No, you can't iron it."],
  Location: ["Four minutes to DIFC. Shorter than most coffee queues around here."],
  Market: ["Business Bay led Dubai's office sales. You're browsing the popular kid."],
  Amenities: ["A clubhouse, studios and focus pods. Your excuses are running out."],
  Technology: ["Twelve double-deck lifts. Waiting for the lift is now a personal choice."],
  "Floor plans": ["Choosing a floor plate is like choosing a sofa. Bigger, and freehold."],
  Summit: ["Triplex headquarters, for when one floor of ambition isn't enough."],
  Future: ["A vertiport on level 60. Your commute just got ideas."],
  "Payment plan": ["70/30. The thirty waits until the keys. Very civilised."],
  "Golden Visa": [
    "An office with a ten-year residency route attached. Your co-working pass could never.",
    "Ten years of UAE residency on the table. Reading slowly is allowed here.",
  ],
  "AI studio": ["Planners that do the maths so you don't have to. You're welcome."],
  Ellington: ["Design-led since 2014. My jokes, less so."],
  Questions: ["The questions section. Ask away, I know most of the answers."],
  "Launch access": ["This is where you register. I'll look away. I won't."],
};

const openers = [
  "Not to brag, but this tower has",
  "In case it slipped past you:",
  "Quick note from your concierge:",
  "For the record, we're talking about",
  "While you're deciding, consider",
  "Small detail, big deal:",
  "Meanwhile, at Berkeley Tower:",
  "Allow me to point out",
];

const fill = (line: string, q: QuipRequest) => {
  const fact = factFor(q.chapter);
  return line
    .replaceAll("{chapter}", q.chapter || "this section")
    .replaceAll("{target}", q.target ? `"${q.target}"` : "that button")
    .replaceAll("{Fact}", fact.charAt(0).toUpperCase() + fact.slice(1));
};

/** Picks an unused line for the moment; `random` is injectable for tests. */
export function offlineQuip(q: QuipRequest, random: () => number = Math.random): string {
  const said = new Set(q.recent.map((l) => l.toLowerCase()));
  const fresh = (lines: string[]) => lines.map((l) => fill(l, q)).filter((l) => !said.has(l.toLowerCase()));
  const pick = (lines: string[]) => lines[Math.floor(random() * lines.length)];

  const own = fresh(q.kind === "chapter" ? (chapterLines[q.chapter] ?? []) : pool[q.kind]);
  if (own.length) return pick(own);

  // Then any chapter line for where they are, then fact templates across all sections.
  const local = fresh(chapterLines[q.chapter] ?? []);
  if (local.length) return pick(local);
  const facts = Object.values(chapterFacts);
  const combos = openers.flatMap((o) => facts.map((f) => `${o} ${f}.`)).filter((l) => !said.has(l.toLowerCase()));
  return combos.length ? pick(combos) : "I'm out of remarks. That has never happened before.";
}
