// Single source of truth for every Berkeley Tower fact used by the funnel,
// the AI tools and the Concierge. Values marked `verify` conflict between
// sources or come from third parties: they render with an "indicative"
// label and must be confirmed by Ellington (see plan §1.2).

export type Status = "confirmed" | "verify";

export const project = {
  name: "Berkeley Tower",
  developer: "Ellington Properties",
  developerFounded: 2014,
  district: "Business Bay",
  city: "Dubai",
  address: "Sheikh Zayed Road, Business Bay, beside Business Bay Metro Station",
  grade: "Grade A",
  ownership: "Freehold",
  storeys: 60,
  officeFloors: 53,
  floorToFloor: "3.8–4.1 m",
  sellableArea: 579_681,
  units: 109,
  serviceCharge: 24, // AED per sq ft, anticipated
  lifts: { doubleDeck: 12, passengersAtOnce: 408 },
  parking: { bays: 752, valet: 6, automatedFloors: 12 },
  sustainability: "Al Sa'fat green building standards",
} as const;

export type Zone = {
  id: string;
  label: string;
  floors: string;
  description: string;
};

export const zones: Zone[] = [
  { id: "ground", label: "Arrival", floors: "G + M", description: "Drop-off, valet, double-height lobby, coffee bar" },
  { id: "low", label: "Workplace", floors: "L1–31", description: "Flexible Grade A offices, 2 to 8 per floor" },
  { id: "amenities", label: "Amenities", floors: "L32–35", description: "Work, club, wellness and prayer levels" },
  { id: "high", label: "Upper workplace", floors: "L36–52", description: "Larger plates up to a full floor" },
  { id: "summit", label: "Summit", floors: "L54–58", description: "Duplex and triplex headquarters" },
  { id: "sky", label: "Sky", floors: "L60", description: "Air-taxi vertiport readiness" },
];

export type UnitConfig = {
  id: string;
  zone: "low" | "high" | "duplex" | "triplex";
  floors: string;
  perFloor: string;
  min: number;
  max: number;
  types: string[];
  plan: string;
  status: Status;
};

export const unitConfigs: UnitConfig[] = [
  {
    id: "low-8",
    zone: "low",
    floors: "L1–31",
    perFloor: "8 offices",
    min: 1132,
    max: 1389,
    types: ["G", "H", "I", "J"],
    plan: "plan-low-8",
    status: "confirmed",
  },
  {
    id: "low-4",
    zone: "low",
    floors: "L1–31",
    perFloor: "4 offices",
    min: 2502,
    max: 2867,
    types: ["A", "F"],
    plan: "plan-low-4",
    status: "confirmed",
  },
  {
    id: "low-3",
    zone: "low",
    floors: "L1–31",
    perFloor: "3 offices",
    min: 2503,
    max: 5376,
    types: ["A", "B", "F"],
    plan: "plan-low-3",
    status: "confirmed",
  },
  {
    id: "low-2",
    zone: "low",
    floors: "L1–31",
    perFloor: "2 offices",
    min: 5401,
    max: 5409,
    types: ["B"],
    plan: "plan-low-2",
    status: "confirmed",
  },
  {
    id: "high-4",
    zone: "high",
    floors: "L36–52",
    perFloor: "4 offices",
    min: 2384,
    max: 3264,
    types: ["G", "H", "K", "L"],
    plan: "plan-high-4",
    status: "confirmed",
  },
  {
    id: "high-3",
    zone: "high",
    floors: "L36–52",
    perFloor: "3 offices",
    min: 2364,
    max: 6522,
    types: ["Q", "R", "S"],
    plan: "plan-high-3",
    status: "confirmed",
  },
  {
    id: "high-2",
    zone: "high",
    floors: "L36–52",
    perFloor: "2 offices",
    min: 5620,
    max: 5888,
    types: ["M", "N"],
    plan: "plan-high-2",
    status: "confirmed",
  },
  {
    id: "high-1",
    zone: "high",
    floors: "L36–52",
    perFloor: "Full floor",
    min: 12182,
    max: 12182,
    types: ["C"],
    plan: "plan-high-1",
    status: "verify",
  },
  {
    id: "duplex",
    zone: "duplex",
    floors: "L54–55",
    perFloor: "Duplex",
    min: 21873,
    max: 21873,
    types: ["D"],
    plan: "plan-duplex-l54",
    status: "verify",
  },
  {
    id: "triplex",
    zone: "triplex",
    floors: "L56–58",
    perFloor: "Triplex",
    min: 22191,
    max: 22191,
    types: ["E"],
    plan: "plan-triplex-l56",
    status: "verify",
  },
];

// Detail sheets from the brochure (indoor / outdoor / total, sq ft).
export const unitTypeDetails = {
  A: { indoor: 2532.96, outdoor: 327.65, total: 2860.62 },
  F: { indoor: 2368.6, outdoor: 133.69, total: 2502.29 },
  B: { indoor: 4910.6, outdoor: 461.45, total: 5372.05 },
  C: { indoor: 11595.64, outdoor: 855.84, total: 12451.48 },
  D: { indoor: 18964.29, outdoor: 2940.49, total: 21904.77 },
  E: { indoor: 14726.64, outdoor: 7363.16, total: 22090.45 },
} as const;

export type AmenityLevel = {
  floor: number;
  name: string;
  tagline: string;
  features: string[];
  images: string[];
};

export const amenityLevels: AmenityLevel[] = [
  {
    floor: 32,
    name: "Work & Recharge",
    tagline: "Space to focus, meet and reset between meetings.",
    features: ["Co-working area", "Focus pods", "The work lounge", "Social hub", "Kitchenette", "Rest & recharge room"],
    images: ["coworking-space", "rest-recharge", "coworking-lounge"],
  },
  {
    floor: 33,
    name: "Club & Play",
    tagline: "A clubhouse in the sky, with terraces over Dubai.",
    features: [
      "Clubhouse",
      "Vinyl lounge",
      "Gaming lounge",
      "Billiards & air hockey",
      "Outdoor terraces",
      "Drone delivery port",
    ],
    images: ["clubhouse", "clubhouse-terraces-night", "games-room"],
  },
  {
    floor: 34,
    name: "Move & Restore",
    tagline: "Training, studios and wellness on the 34th floor.",
    features: [
      "Fitness studio",
      "Boxing area",
      "Mind & body studio",
      "Pilates studio",
      "Spinning studio",
      "Male & female wellness",
    ],
    images: ["fitness-studio", "pilates-studio", "spinning-studio"],
  },
  {
    floor: 35,
    name: "Reflect",
    tagline: "Dedicated prayer rooms with skyline light.",
    features: ["Male prayer room", "Female prayer room", "Ablution areas", "Vista lift & feature staircase"],
    images: ["office-empty-burj-view"],
  },
];

export const intelligence = [
  { title: "Double-deck lifts", detail: "12 destination-controlled double-deck lifts move 408 people at once." },
  { title: "Destination control", detail: "Choose your floor at the gate. The system assigns the fastest cab." },
  { title: "Smart access", detail: "Lobby security gates linked to a smart access system." },
  { title: "Robotic parking", detail: "Automated storage and retrieval across 752 bays, plus 6 valet bays." },
  { title: "EV & mobility", detail: "EV charging stations and bicycle racks." },
  { title: "Every floor, considered", detail: "Smoking terraces, public washrooms and MEP provisions for every unit." },
  { title: "Sustainability", detail: "Designed to meet Al Sa'fat green building standards." },
  { title: "Always on", detail: "24/7 security, professional maintenance and reliable building systems." },
] as const;

export const driveTimes = [
  { place: "Burj Khalifa & Dubai Mall", minutes: 4 },
  { place: "DIFC", minutes: 4 },
  { place: "Dubai World Trade Centre", minutes: 5 },
  { place: "Emirates Towers & Museum of the Future", minutes: 5 },
  { place: "Dubai International Airport (DXB)", minutes: 9 },
  { place: "Dubai Design District", minutes: 9 },
  { place: "Dubai Internet City", minutes: 14 },
  { place: "Dubai Airport Free Zone (DAFZA)", minutes: 14 },
  { place: "Dubai Media City", minutes: 16 },
  { place: "Jumeirah Lake Towers", minutes: 16 },
  { place: "Dubai Science Park", minutes: 18 },
  { place: "Jebel Ali Free Zone (JAFZA)", minutes: 22 },
  { place: "Dubai Investment Park", minutes: 26 },
  { place: "Expo City Dubai", minutes: 30 },
  { place: "Al Maktoum International Airport (DWC)", minutes: 35 },
] as const;

export const marketStats = {
  period: "H1 2026",
  source: "Cavendish Maxwell, DIFC, Dubai Chambers",
  stats: [
    { value: 2600, prefix: "~", suffix: "", label: "Office sales in Dubai", note: "+38.2% year on year" },
    { value: 814, prefix: "", suffix: "", label: "Sales in Business Bay", note: "#1 district by transactions" },
    { value: 15.8, prefix: "AED ", suffix: "bn", label: "Total office sales value", note: "+199.3% year on year" },
    { value: 14.1, prefix: "+", suffix: "%", label: "Office rental rates", note: "Year on year" },
    { value: 15.1, prefix: "+", suffix: "%", label: "Office sales prices", note: "Year on year" },
    { value: 506.2, prefix: "+", suffix: "%", label: "Off-plan office sales", note: "Transactions, year on year" },
  ],
} as const;

export const paymentPlan = [
  { pct: 20, when: "At booking", phase: "booking" },
  { pct: 5, when: "90 days after reservation", phase: "time" },
  { pct: 5, when: "180 days after reservation", phase: "time" },
  { pct: 5, when: "240 days after reservation", phase: "time" },
  { pct: 5, when: "360 days after reservation", phase: "time" },
  { pct: 5, when: "20% construction", phase: "build" },
  { pct: 5, when: "30% construction", phase: "build" },
  { pct: 5, when: "40% construction", phase: "build" },
  { pct: 5, when: "50% construction", phase: "build" },
  { pct: 5, when: "60% construction", phase: "build" },
  { pct: 5, when: "70% construction", phase: "build" },
  { pct: 30, when: "On completion", phase: "completion" },
] as const;

// Floor stops for the lift rail and the destination keypad.
export type Destination = { id: string; floor: string; label: string; num: number };

export const destinations: Destination[] = [
  { id: "arrival", floor: "G", label: "Arrival", num: 0 },
  { id: "lobby", floor: "M", label: "Lobby", num: 0.5 },
  { id: "architecture", floor: "05", label: "Architecture", num: 5 },
  { id: "location", floor: "14", label: "Location", num: 14 },
  { id: "market", floor: "24", label: "Market", num: 24 },
  { id: "amenities", floor: "32", label: "Amenities", num: 32 },
  { id: "intelligence", floor: "36", label: "Intelligence", num: 36 },
  { id: "offices", floor: "41", label: "Offices", num: 41 },
  { id: "summit", floor: "54", label: "Summit", num: 54 },
  { id: "future", floor: "60", label: "Vertiport", num: 60 },
  { id: "ownership", floor: "★", label: "Payment plan", num: 60 },
  { id: "golden-visa", floor: "★", label: "Golden Visa", num: 60 },
  { id: "intelligence-studio", floor: "★", label: "AI studio", num: 60 },
  { id: "register", floor: "★", label: "Launch access", num: 60 },
];

// UAE Golden Residency for real estate investors, from the ICP Golden
// Residency guide and the Dubai Land Department's investor service (checked
// 25 Oct 2026). The authorities decide eligibility, so copy must say so and
// never promise a visa for a specific office.
export const goldenVisa = {
  years: 10,
  /** Total purchase value in AED; one or more properties can be combined. */
  threshold: 2_000_000,
  family: "spouse, children and parents",
  checked: "October 2026",
  note: "Golden Visa approval rests with ICP and the Dubai Land Department. Eligibility depends on the purchase value and the criteria in force when you apply; your consultant confirms it for your office. Not legal advice.",
  criteria: [
    "Property worth AED 2 million or more in total, registered in the investor's name",
    "Off-plan purchases from an approved developer count",
    "Mortgaged property can qualify with a no-objection letter from the bank",
    "Health insurance for the investor and family",
  ],
  sources: [
    { label: "ICP Golden Residency guide", url: "https://icp.gov.ae/en/services/uae-golden-residency/" },
    {
      label: "Dubai Land Department, Golden Visa for investors",
      url: "https://dubailand.gov.ae/en/eservices/request-for-golden-visa-investor/",
    },
  ],
} as const;

// Ellington's official project brochure, unlocked by the lead form.
export const brochure = {
  url: process.env.NEXT_PUBLIC_BROCHURE_URL || "/brochure/berkeley-tower-brochure.pdf",
  fileName: "Berkeley-Tower-Brochure.pdf",
  pages: 71,
  size: "22 MB",
  contents: [
    "Architecture and arrival",
    "Amenity levels 32–35",
    "Floor plans for every office type",
    "The 70/30 payment plan",
  ],
} as const;

// Third-party claims, never shown as fact (plan §1.2).
export const toVerify = {
  pricePerSqFt: "AED 4,500–5,000 (indicative, channel-partner sites)",
  handover: "2031 indicative (some sources: Q1 2030)",
  eoi: "AED 100,000 EOI; close date unconfirmed",
} as const;
