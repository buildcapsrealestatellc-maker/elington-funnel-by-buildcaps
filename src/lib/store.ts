"use client";

import type Lenis from "lenis";
import { create } from "zustand";

type LeadIntent = {
  source: string;
  /** "brochure" unlocks the PDF; the default is launch access. */
  offer?: "brochure" | "access";
  purpose?: "own-use" | "investment" | "both";
  size?: string;
  unit?: string;
};

/** A stop the lift can show when the target isn't one of the keypad destinations. */
export type LiftStop = { floor: string; num: number; label: string };
export type LiftRunner = (destinationId: string, stop?: LiftStop) => void;

export type ToolId = "spacedna" | "horizon";

type UiState = {
  lenis: Lenis | null;
  floor: number;
  floorLabel: string;
  /** True while a full-screen shot (not a white chapter) is under the header. */
  overShot: boolean;
  setOverShot: (v: boolean) => void;
  /** True over shots and dark chapters: the header drops its white backdrop. */
  overDark: boolean;
  setOverDark: (v: boolean) => void;
  setFloor: (floor: number, floorLabel: string) => void;
  liftRunner: LiftRunner | null;
  setLiftRunner: (fn: LiftRunner | null) => void;
  introDone: boolean;
  heroReady: boolean;
  setHeroReady: () => void;
  keypadOpen: boolean;
  leadOpen: boolean;
  leadIntent: LeadIntent;
  leadSubmitted: boolean;
  tool: ToolId | null;
  openTool: (tool: ToolId) => void;
  closeTool: () => void;
  setLenis: (lenis: Lenis | null) => void;
  setIntroDone: () => void;
  setKeypadOpen: (open: boolean) => void;
  openLead: (intent: LeadIntent) => void;
  closeLead: () => void;
  markLeadSubmitted: () => void;
  conciergeOpen: boolean;
  /** A question to send as soon as the Concierge opens. */
  conciergePrompt: string | null;
  openConcierge: (prompt?: string) => void;
  closeConcierge: () => void;
  takeConciergePrompt: () => string | null;
};

export const useUi = create<UiState>((set, get) => ({
  lenis: null,
  floor: 0,
  floorLabel: "Arrival",
  overShot: true,
  setOverShot: (overShot) => set({ overShot }),
  overDark: true,
  setOverDark: (overDark) => set({ overDark }),
  setFloor: (floor, floorLabel) => set({ floor, floorLabel }),
  liftRunner: null,
  setLiftRunner: (liftRunner) => set({ liftRunner }),
  introDone: false,
  heroReady: false,
  setHeroReady: () => set({ heroReady: true }),
  keypadOpen: false,
  leadOpen: false,
  leadIntent: { source: "page" },
  leadSubmitted: false,
  tool: null,
  openTool: (tool) => set({ tool }),
  closeTool: () => set({ tool: null }),
  setLenis: (lenis) => set({ lenis }),
  setIntroDone: () => set({ introDone: true }),
  setKeypadOpen: (keypadOpen) => set({ keypadOpen }),
  openLead: (leadIntent) => set({ leadOpen: true, leadIntent }),
  closeLead: () => set({ leadOpen: false }),
  markLeadSubmitted: () => set({ leadSubmitted: true }),
  conciergeOpen: false,
  conciergePrompt: null,
  openConcierge: (prompt) => set({ conciergeOpen: true, conciergePrompt: prompt ?? null }),
  closeConcierge: () => set({ conciergeOpen: false }),
  takeConciergePrompt: () => {
    const prompt = get().conciergePrompt;
    if (prompt) set({ conciergePrompt: null });
    return prompt;
  },
}));

/** Travel to a section with the lift-door transition when available. */
export function rideTo(id: string, stop?: LiftStop) {
  const runner = useUi.getState().liftRunner;
  if (runner) runner(id, stop);
  else scrollToId(id);
}

export function scrollToId(id: string, opts: { immediate?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = useUi.getState().lenis;
  if (lenis) lenis.scrollTo(el, { offset: 0, immediate: opts.immediate, duration: 1.6 });
  else el.scrollIntoView({ behavior: opts.immediate ? "instant" : "smooth" });
}
