// SpaceDNA: turns a team brief into a space requirement and ranks Berkeley
// Tower's real office types by fit. Deterministic; planning ratios are
// industry rules of thumb and shown to the visitor as such.

import { type UnitConfig, unitConfigs } from "@/lib/data/tower";

export type Workstyle = "executive" | "balanced" | "collaborative";
export type Priority = "value" | "views" | "terraces" | "prestige";

export type DnaInput = {
  headcount: number;
  /** Expected growth over three years, %. */
  growth: number;
  /** Share of the week people work remotely, %. */
  hybrid: number;
  workstyle: Workstyle;
  meetingRooms: number;
  clientFacing: boolean;
  priority: Priority;
};

export const dnaDefaults: DnaInput = {
  headcount: 18,
  growth: 30,
  hybrid: 20,
  workstyle: "balanced",
  meetingRooms: 2,
  clientFacing: true,
  priority: "views",
};

/** Net area per workstation, sq ft (desk, storage and immediate circulation). */
export const sqftPerDesk: Record<Workstyle, number> = { executive: 150, balanced: 110, collaborative: 85 };

export type Requirement = {
  desks: number;
  parts: { label: string; sqft: number }[];
  total: number;
};

export function requirement(input: DnaInput): Requirement {
  const people = input.headcount * (1 + input.growth / 100);
  // Desk sharing: a hybrid week frees roughly 60% of the remote share.
  const desks = Math.max(1, Math.ceil(people * (1 - (input.hybrid / 100) * 0.6)));
  const work = desks * sqftPerDesk[input.workstyle];
  const meeting = input.meetingRooms * 190;
  const front = input.clientFacing ? 320 : 140;
  const support = Math.round((work + meeting + front) * 0.08); // pantry, server, storage
  const parts = [
    { label: "Workstations", sqft: work },
    { label: "Meeting rooms", sqft: meeting },
    { label: input.clientFacing ? "Reception & client lounge" : "Entrance", sqft: front },
    { label: "Pantry, server & storage", sqft: support },
  ];
  const net = parts.reduce((s, p) => s + p.sqft, 0);
  // Internal walls and circulation inside the unit.
  const circulation = Math.round(net * 0.12);
  parts.push({ label: "Internal circulation", sqft: circulation });
  return { desks, parts, total: net + circulation };
}

export type Match = {
  config: UnitConfig;
  /** Representative size used for the fit (sq ft). */
  size: number;
  fit: number;
  /** Desks the unit could take in the chosen workstyle. */
  capacity: number;
  headroom: number;
  reasons: string[];
};

const zoneLabel: Record<UnitConfig["zone"], string> = {
  low: "Lower floors",
  high: "Upper floors",
  duplex: "Duplex",
  triplex: "Triplex",
};

export function rankMatches(input: DnaInput): Match[] {
  const req = requirement(input);
  const matches = unitConfigs.map((config) => {
    // Pick the unit size in this configuration closest to (but ideally above) the need.
    const size = Math.min(config.max, Math.max(config.min, req.total));
    const ratio = size / req.total;
    // Best between 1.0 and 1.2× the requirement; penalise tight and oversized fits.
    let fit =
      ratio < 1 ? 100 - (1 - ratio) * 260 : ratio <= 1.2 ? 100 - (ratio - 1) * 25 : 95 - Math.log(ratio / 1.2) * 70;
    const reasons: string[] = [];
    if (input.priority === "views" && config.zone !== "low") {
      fit += 6;
      reasons.push("Upper-floor views towards Burj Khalifa and the sea");
    }
    if (input.priority === "value" && config.zone === "low") {
      fit += 6;
      reasons.push("Lower-floor pricing for the same Grade A spec");
    }
    if (
      input.priority === "terraces" &&
      (config.zone === "duplex" || config.zone === "triplex" || config.types.some((t) => "ABC".includes(t)))
    ) {
      fit += 6;
      reasons.push("Layouts with private terraces or balconies");
    }
    if (
      input.priority === "prestige" &&
      (config.zone === "duplex" || config.zone === "triplex" || config.perFloor === "Full floor")
    ) {
      fit += 8;
      reasons.push("Single-tenant floor with its own identity");
    }
    if (ratio >= 1 && ratio <= 1.25) reasons.unshift("Fits today's team with room to grow");
    else if (ratio < 1)
      reasons.unshift(`About ${Math.round(req.total - size).toLocaleString("en-US")} sq ft short of the brief`);
    else reasons.unshift("Generous: space for faster growth or a showroom");
    const capacity = Math.floor((size * 0.78) / sqftPerDesk[input.workstyle]);
    return {
      config,
      size,
      fit: Math.max(0, Math.min(99, Math.round(fit))),
      capacity,
      headroom: capacity - req.desks,
      reasons,
    };
  });
  return matches.sort((a, b) => b.fit - a.fit);
}

export const matchTitle = (m: Match) =>
  `${zoneLabel[m.config.zone]} · ${m.config.perFloor === "Full floor" || m.config.zone === "duplex" || m.config.zone === "triplex" ? m.config.perFloor : `${m.config.perFloor} per floor`}`;
