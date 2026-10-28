// Page sections that can be reached by the lift: the header links and the
// Concierge both use these anchors and the floor shown during the ride.

export const sections = {
  film: { id: "launch-film", label: "The film", floor: "G", num: 0 },
  overview: { id: "overview", label: "Overview", floor: "G", num: 0 },
  architecture: { id: "architecture", label: "Architecture", floor: "05", num: 8 },
  location: { id: "location-detail", label: "Location", floor: "14", num: 16 },
  market: { id: "market-detail", label: "Market", floor: "24", num: 26 },
  amenities: { id: "amenities-detail", label: "Amenities", floor: "32", num: 33 },
  lifts: { id: "double-deck-lifts", label: "Double-deck lifts", floor: "34", num: 34 },
  technology: { id: "intelligence", label: "Technology", floor: "36", num: 38 },
  floorPlans: { id: "offices", label: "Floor plans", floor: "41", num: 41 },
  summit: { id: "summit-detail", label: "Summit collection", floor: "54", num: 56 },
  future: { id: "future-detail", label: "Future-ready", floor: "60", num: 60 },
  paymentPlan: { id: "ownership", label: "Payment plan", floor: "★", num: 60 },
  goldenVisa: { id: "golden-visa", label: "Golden Visa", floor: "★", num: 60 },
  aiTools: { id: "intelligence-studio", label: "AI tools", floor: "★", num: 60 },
  developer: { id: "developer", label: "The developer", floor: "★", num: 60 },
  faq: { id: "faq", label: "Questions", floor: "★", num: 60 },
  register: { id: "register", label: "Launch access", floor: "★", num: 60 },
} as const;

export type SectionKey = keyof typeof sections;
export const sectionKeys = Object.keys(sections) as [SectionKey, ...SectionKey[]];
