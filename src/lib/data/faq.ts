// Buyer questions, answered only from facts in tower.ts. Shared with the
// Concierge, so keep every answer conservative and sourced. The Concierge
// looks answers up by id, so ids must stay stable when the order changes.

export const faq = [
  {
    id: "freehold",
    q: "Can I own an office at Berkeley Tower outright?",
    a: "Yes. Offices are sold freehold in Business Bay, one of Dubai's freehold districts, so you can occupy, lease or resell. Your consultant will confirm the documents needed for you or your company.",
  },
  {
    id: "golden-visa",
    q: "Can buying a Berkeley office lead to a UAE Golden Visa?",
    a: "It can. The UAE grants a 10-year, renewable Golden Visa to investors who own property worth AED 2 million or more, and off-plan purchases from an approved developer count. Several properties can be combined, a mortgaged property can qualify with a no-objection letter from the bank, and the visa can cover your spouse, children and parents. Approval rests with ICP and the Dubai Land Department, so your consultant confirms eligibility for your office.",
  },
  {
    id: "payment",
    q: "How does the 70/30 payment plan work?",
    a: "20% at booking, four 5% instalments in the first year (90, 180, 240 and 360 days after reservation), six 5% instalments as construction moves from 20% to 70%, and the final 30% on completion. The Sales and Purchase Agreement governs the final terms.",
  },
  {
    id: "sizes",
    q: "What office sizes are available?",
    a: "From 1,132 sq ft on the lower floors (L1–31, up to eight offices per floor) to a full 12,182 sq ft floor on the upper levels (L36–52). Duplex and triplex headquarters of around 22,000 sq ft occupy levels 54 to 58. Areas are indicative until the SPA.",
  },
  {
    id: "brochure",
    q: "Where can I get the brochure?",
    a: "Right here. Leave your name and mobile and the full brochure is yours straight away: the architecture, the amenity levels, a floor plan for every office type and the payment plan. A consultant can also send it on WhatsApp.",
  },
  {
    id: "completion",
    q: "When will the tower be completed?",
    a: "Ellington will confirm the completion date with the official launch. Dates quoted elsewhere are indicative, so plan around the date in your Sales and Purchase Agreement.",
  },
  {
    id: "service-charge",
    q: "What is the service charge?",
    a: "The anticipated service charge is AED 24 per sq ft per year. The final rate is confirmed once the building is operating.",
  },
  {
    id: "access",
    q: "How will my team and clients get there?",
    a: "Berkeley Tower sits on Sheikh Zayed Road beside Business Bay Metro Station on the Red Line, about four minutes by car from DIFC and Downtown. Visitors arrive at a valet drop-off, and 752 automated bays serve occupiers.",
  },
  {
    id: "amenities",
    q: "What amenities come with the building?",
    a: "Four amenity levels: co-working and focus pods on L32, a clubhouse with terraces on L33, fitness, Pilates and spinning studios on L34, and prayer rooms on L35.",
  },
  {
    id: "price-list",
    q: "How do I get the price list?",
    a: "Register for launch access. A Berkeley consultant will send the official price list and live availability, and can arrange a private briefing. Prices published by third parties are indicative until launch.",
  },
] as const;

export type FaqId = (typeof faq)[number]["id"];
