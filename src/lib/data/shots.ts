// The film: every cinematic shot in the funnel, with its camera path.
// Camera space: x = truck (−1 left … 1 right), y = crane (−1 down … 1 up),
// z = dolly-in (0 … ~1.5), roll in radians, focus = depth kept sharp
// (0 far … 1 near), dof = depth-of-field strength (0 = all sharp).

import type { MediaKey } from "@/lib/media";

export type CamKey = { x: number; y: number; z: number; roll: number; focus: number; dof: number };

export type ShotDef = {
  id: string;
  scene: string;
  label: string;
  floorNum: number;
  floor: string;
  image: MediaKey;
  depth: DepthKey;
  /** CSS object-position equivalent, 0–1. */
  frame: [number, number];
  /** Section height in svh. The camera runs across all of it. */
  length: number;
  /**
   * Camera path. keys[0] is the pose as the shot enters; the rest are spread
   * evenly over the scroll. The opening shot also has an intro pose first.
   */
  keys: CamKey[];
  title: string[];
  caption: string;
  tone: "light" | "dark";
};

export type DepthKey =
  | "tower-fog-dawn"
  | "drop-off-canopy"
  | "lobby-reception"
  | "terraces-night"
  | "tower-day-skyline"
  | "towers-looking-up"
  | "clubhouse-terraces-night"
  | "robotic-parking"
  | "terrace-view-night"
  | "tower-aerial-night"
  | "tower-dusk-metro";

const k = (x: number, y: number, z: number, roll = 0, focus = 0.7, dof = 0): CamKey => ({ x, y, z, roll, focus, dof });

export const shots: Record<string, ShotDef> = {
  hero: {
    id: "arrival",
    scene: "01",
    label: "Berkeley Tower",
    floorNum: 0,
    floor: "G",
    image: "tower-fog-dawn",
    depth: "tower-fog-dawn",
    frame: [0.58, 0.4],
    length: 360,
    // intro: tight on the crown, out of focus → settle → drift down through the fog
    keys: [
      k(0.3, 1, 1.1, 0.03, 0.9, 3),
      k(0, 0.1, 0.15, 0, 0.9, 0),
      k(-0.55, -0.25, 0.5, -0.015, 0.9, 0.2),
      k(0.45, -0.55, 0.95, 0.02, 0.9, 0.8),
      k(0, -0.85, 1.4, 0, 0.45, 1.6),
    ],
    title: ["Berkeley", "Tower"],
    caption: "Shaped by movement. A 60-storey Grade A office tower on Sheikh Zayed Road, Business Bay.",
    tone: "dark",
  },
  arrival: {
    id: "shot-arrival",
    scene: "02",
    label: "Arrival",
    floorNum: 0,
    floor: "G",
    image: "drop-off-canopy",
    depth: "drop-off-canopy",
    frame: [0.5, 0.55],
    length: 340,
    // wide and low → push in under the canopy → rise towards the copper soffit
    keys: [
      k(-0.7, -0.45, 0, -0.01, 0.5, 0),
      k(0, -0.15, 0.5, 0.008, 0.45, 0.4),
      k(0.55, 0.25, 1, -0.01, 0.4, 0.8),
      k(0.2, 0.6, 1.45, 0, 0.3, 1.2),
    ],
    title: ["Arrival"],
    caption: "Valet, drop-off and a copper canopy that welcomes every working day.",
    tone: "light",
  },
  lobby: {
    id: "lobby",
    scene: "03",
    label: "The lobby",
    floorNum: 0.5,
    floor: "M",
    image: "lobby-reception",
    depth: "lobby-reception",
    frame: [0.5, 0.5],
    length: 340,
    // slide across the hall → push to the reception → tilt up the bronze fins
    keys: [
      k(0.7, -0.35, 0, 0, 0.5),
      k(0.15, -0.1, 0.5, 0, 0.55, 0.3),
      k(-0.45, 0.25, 0.95, 0.01, 0.6, 0.6),
      k(-0.1, 0.6, 1.35, 0, 0.7, 1),
    ],
    title: ["Double-height", "lobby"],
    caption: "Marble, bronze and sculptural detailing set the tone for the floors above.",
    tone: "dark",
  },
  facade: {
    id: "facade",
    scene: "04",
    label: "The façade",
    floorNum: 5,
    floor: "05",
    image: "terraces-night",
    depth: "terraces-night",
    frame: [0.62, 0.5],
    length: 380,
    // crane from the lower terraces to the top, rolling with the seam
    keys: [
      k(-0.35, -1, 0.3, -0.025, 0.75, 0.5),
      k(0, -0.35, 0.55, 0, 0.75, 0.2),
      k(0.35, 0.35, 0.7, 0.02, 0.75, 0.2),
      k(0.1, 1, 1.05, 0, 0.75, 0.8),
    ],
    title: ["Shaped by", "movement"],
    caption: "A louvered skin inspired by the fluidity of textiles, opened by a seam of terraces.",
    tone: "light",
  },
  location: {
    id: "location",
    scene: "05",
    label: "Location",
    floorNum: 14,
    floor: "14",
    image: "tower-day-skyline",
    depth: "tower-day-skyline",
    frame: [0.5, 0.5],
    length: 360,
    // long lateral tracking shot along Sheikh Zayed Road, closing on the tower
    keys: [
      k(-1, 0, 0.15, 0, 0.7),
      k(-0.35, 0.1, 0.35, 0, 0.7),
      k(0.35, 0.1, 0.55, 0.01, 0.7, 0.2),
      k(0.9, 0.25, 0.9, 0, 0.75, 0.6),
    ],
    title: ["Business", "at the heart"],
    caption: "Beside Business Bay Metro. Four minutes to DIFC and Downtown Dubai.",
    tone: "light",
  },
  market: {
    id: "market",
    scene: "06",
    label: "The market",
    floorNum: 24,
    floor: "24",
    image: "towers-looking-up",
    depth: "towers-looking-up",
    frame: [0.5, 0.45],
    length: 320,
    // looking up between towers, rolling as the camera rises
    keys: [
      k(0, -0.7, 0, -0.07, 0.6),
      k(0, -0.15, 0.45, -0.02, 0.6, 0.2),
      k(0, 0.3, 0.85, 0.03, 0.6, 0.4),
      k(0, 0.65, 1.25, 0.07, 0.6, 0.8),
    ],
    title: ["The centre", "of ambition"],
    caption: "Business Bay led Dubai's office market by transactions in H1 2026.",
    tone: "light",
  },
  amenities: {
    id: "amenities",
    scene: "07",
    label: "Amenities",
    floorNum: 32,
    floor: "32",
    image: "clubhouse-terraces-night",
    depth: "clubhouse-terraces-night",
    frame: [0.55, 0.5],
    length: 380,
    // arc around the floating terraces, then push into the clubhouse
    keys: [
      k(0.85, 0.35, 0.1, 0.02, 0.75),
      k(0.25, 0, 0.45, 0, 0.75, 0.3),
      k(-0.4, -0.2, 0.8, -0.015, 0.7, 0.6),
      k(-0.8, -0.3, 1.25, -0.025, 0.6, 1),
    ],
    title: ["A different", "rhythm"],
    caption: "Four amenity levels, from co-working to a clubhouse floating above the city.",
    tone: "light",
  },
  technology: {
    id: "technology",
    scene: "08",
    label: "Technology",
    floorNum: 36,
    floor: "36",
    image: "robotic-parking",
    depth: "robotic-parking",
    frame: [0.5, 0.55],
    length: 340,
    // straight dolly down the robotic parking hall
    keys: [
      k(0, 0, 0, 0, 0.5),
      k(0.25, 0.1, 0.5, 0, 0.5, 0.3),
      k(-0.2, 0.2, 1, 0.01, 0.45, 0.6),
      k(0, 0.3, 1.5, 0, 0.4, 1),
    ],
    title: ["Fluid vertical", "movement"],
    caption: "Twelve double-deck lifts, smart access and robotic parking.",
    tone: "light",
  },
  summit: {
    id: "summit",
    scene: "09",
    label: "The summit",
    floorNum: 54,
    floor: "54",
    image: "terrace-view-night",
    depth: "terrace-view-night",
    frame: [0.5, 0.55],
    length: 360,
    // rack focus from the terrace rail to the horizon, drifting to Burj Al Arab
    keys: [
      k(0.35, 0.4, 0, 0, 0.9, 1.4),
      k(0, 0.1, 0.4, 0, 0.6, 0.6),
      k(-0.3, -0.1, 0.8, 0, 0.3, 0.8),
      k(-0.5, -0.2, 1.2, -0.01, 0.2, 0.6),
    ],
    title: ["The summit", "collection"],
    caption: "Duplex and triplex headquarters at the crown, with private terraces.",
    tone: "light",
  },
  future: {
    id: "future",
    scene: "10",
    label: "The future",
    floorNum: 60,
    floor: "60",
    image: "tower-aerial-night",
    depth: "tower-aerial-night",
    frame: [0.52, 0.45],
    length: 340,
    // descend from above the crown and pull out over the city
    keys: [
      k(0, 1, 1.1, 0.03, 0.8, 0.6),
      k(0, 0.4, 0.65, 0.01, 0.8, 0.2),
      k(0.35, -0.2, 0.3, -0.01, 0.8),
      k(0, -0.6, 0.05, 0, 0.8, 0.3),
    ],
    title: ["The future", "moves differently"],
    caption: "Readiness for an air-taxi vertiport at the crown and drone delivery at level 33.",
    tone: "light",
  },
  finale: {
    id: "finale",
    scene: "11",
    label: "Launch access",
    floorNum: 60,
    floor: "★",
    image: "tower-dusk-metro",
    depth: "tower-dusk-metro",
    frame: [0.5, 0.45],
    length: 300,
    // the closing pull-back to the full tower at dusk
    keys: [
      k(0.45, 0.35, 1.1, 0, 0.8, 0.6),
      k(0.1, 0.1, 0.6, 0, 0.8, 0.2),
      k(-0.2, 0, 0.3, 0, 0.8),
      k(-0.3, -0.1, 0.05, 0, 0.8),
    ],
    title: ["Your floor", "is waiting"],
    caption: "Register for priority access to the price list and live availability.",
    tone: "light",
  },
};
