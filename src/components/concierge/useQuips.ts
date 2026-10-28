"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chapterFacts, type QuipKind } from "@/lib/concierge/quips";
import { useUi } from "@/lib/store";

const SAID_KEY = "bt-ellis-said";
const MUTE_KEY = "bt-ellis-muted";
/** Never two remarks closer than this. */
const GAP = 30_000;
const MAX_PER_VISIT = 14;
const FAST_SCROLL = 3200; // px per second
const IDLE_AFTER = 32_000;

const kindCooldown: Partial<Record<QuipKind, number>> = {
  "fast-scroll": 90_000,
  rewind: 90_000,
  idle: 120_000,
  "cta-hover": 120_000,
  returned: 120_000,
  "tool-closed": 60_000,
  "form-closed": 60_000,
};
const oncePerVisit: QuipKind[] = ["arrive", "end", "exit"];

export type Quip = { id: number; text: string };

function readSaid(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(SAID_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/**
 * Watches how the visitor browses and asks Ellis for a remark at the right
 * moments: never while a form, tool, chat or dialog is open, never more often
 * than every 30 seconds, and never the same line twice in a visit.
 */
export function useQuips(present: boolean) {
  const [quip, setQuip] = useState<Quip | null>(null);
  const [muted, setMuted] = useState(false);
  const live = useRef({ present, muted });
  live.current = { present, muted };
  const st = useRef({
    startedAt: 0,
    last: 0,
    count: 0,
    busy: false,
    kindAt: {} as Partial<Record<QuipKind, number>>,
    done: new Set<string>(),
    chapters: new Set<string>(),
  });
  const hideTimer = useRef(0);

  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
    } catch {}
  }, []);

  const blocked = useCallback(() => {
    const s = useUi.getState();
    return (
      !live.current.present ||
      live.current.muted ||
      !s.introDone ||
      s.leadOpen ||
      !!s.tool ||
      s.conciergeOpen ||
      s.keypadOpen ||
      document.visibilityState !== "visible" ||
      !!document.querySelector('[role="dialog"][data-state="open"]')
    );
  }, []);

  /** Ask for a remark; resolves true if Ellis said something. */
  const trigger = useCallback(
    async (kind: QuipKind, extra: { seconds?: number; target?: string } = {}) => {
      const s = st.current;
      const now = Date.now();
      if (s.busy || s.count >= MAX_PER_VISIT || blocked()) return false;
      if (now - s.last < GAP) return false;
      if (oncePerVisit.includes(kind) && s.done.has(kind)) return false;
      const cooldown = kindCooldown[kind];
      if (cooldown && now - (s.kindAt[kind] ?? 0) < cooldown) return false;

      s.busy = true;
      try {
        const res = await fetch("/api/quip", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind,
            chapter: useUi.getState().floorLabel,
            ...extra,
            visitSeconds: s.startedAt ? (now - s.startedAt) / 1000 : 0,
            chaptersSeen: s.chapters.size,
            recent: readSaid().slice(-30),
          }),
          signal: AbortSignal.timeout(9000),
        });
        if (!res.ok) return false;
        const { line } = (await res.json()) as { line?: string };
        // Things may have changed while Ellis was thinking.
        if (!line || blocked()) return false;
        s.last = Date.now();
        s.kindAt[kind] = s.last;
        s.count++;
        if (oncePerVisit.includes(kind)) s.done.add(kind);
        try {
          sessionStorage.setItem(SAID_KEY, JSON.stringify([...readSaid(), line].slice(-60)));
        } catch {}
        setQuip({ id: s.last, text: line });
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setQuip(null), 7000 + line.length * 40);
        return true;
      } catch {
        return false;
      } finally {
        s.busy = false;
      }
    },
    [blocked],
  );

  // First appearance.
  useEffect(() => {
    if (!present || st.current.done.has("arrive")) return;
    if (!st.current.startedAt) st.current.startedAt = Date.now();
    const t = window.setTimeout(() => trigger("arrive"), 2500);
    return () => window.clearTimeout(t);
  }, [present, trigger]);

  useEffect(() => {
    const s = st.current;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const clearChapterTimers = () => {
      for (const t of timers.splice(0)) window.clearTimeout(t);
    };

    // Where they are: a remark a few seconds into a new section, and one if they linger.
    const quipped = new Set<string>();
    const lingered = new Set<string>();
    const onChapter = (label: string) => {
      clearChapterTimers();
      if (!label) return;
      s.chapters.add(label);
      if (chapterFacts[label] && !quipped.has(label)) {
        later(async () => {
          if (useUi.getState().floorLabel === label && (await trigger("chapter"))) quipped.add(label);
        }, 6000);
      }
      if (!lingered.has(label)) {
        later(async () => {
          if (useUi.getState().floorLabel === label && (await trigger("linger", { seconds: 45 }))) lingered.add(label);
        }, 45_000);
      }
    };
    onChapter(useUi.getState().floorLabel);

    // Dialogs: closing the form unsent, or a tool after a few seconds.
    let toolOpenedAt = 0;
    const unsubscribe = useUi.subscribe((now, prev) => {
      if (now.floorLabel !== prev.floorLabel) onChapter(now.floorLabel);
      if (prev.leadOpen && !now.leadOpen && !now.leadSubmitted) window.setTimeout(() => trigger("form-closed"), 700);
      if (!prev.tool && now.tool) toolOpenedAt = Date.now();
      if (prev.tool && !now.tool && toolOpenedAt) {
        const seconds = (Date.now() - toolOpenedAt) / 1000;
        if (seconds < 15) window.setTimeout(() => trigger("tool-closed", { seconds }), 700);
      }
      if (now.conciergeOpen || now.leadOpen || now.tool) setQuip(null);
    });

    // Scrolling: speed, going back up, reaching the end.
    let lastY = window.scrollY;
    let lastT = performance.now();
    let fastSamples = 0;
    let upDistance = 0;
    let upSince = 0;
    let lastInput = Date.now();
    let idleSaid = false;
    const onScroll = () => {
      const y = window.scrollY;
      const t = performance.now();
      const dy = y - lastY;
      const dt = Math.max(16, t - lastT);
      const speed = (Math.abs(dy) / dt) * 1000;
      fastSamples = speed > FAST_SCROLL ? fastSamples + 1 : 0;
      if (fastSamples >= 4) {
        fastSamples = 0;
        trigger("fast-scroll");
      }
      if (dy < 0) {
        if (!upSince || t - upSince > 4000) {
          upSince = t;
          upDistance = 0;
        }
        upDistance -= dy;
        if (upDistance > window.innerHeight * 1.6) {
          upDistance = 0;
          trigger("rewind");
        }
      }
      if (y + window.innerHeight >= document.documentElement.scrollHeight - 240) trigger("end");
      lastY = y;
      lastT = t;
      lastInput = Date.now();
      idleSaid = false;
    };

    // Going quiet.
    const onInput = () => {
      lastInput = Date.now();
      idleSaid = false;
    };
    const idleCheck = window.setInterval(() => {
      const quiet = Date.now() - lastInput;
      if (!idleSaid && quiet > IDLE_AFTER) {
        idleSaid = true;
        trigger("idle", { seconds: quiet / 1000 });
      }
    }, 4000);

    // Hovering a call to action without clicking it.
    let hoverTimer = 0;
    let hovered: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest("[data-quip]");
      if (!el || el === hovered) return;
      hovered = el;
      window.clearTimeout(hoverTimer);
      const target = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
      hoverTimer = window.setTimeout(() => trigger("cta-hover", { target }), 2800);
    };
    const onOut = (e: PointerEvent) => {
      if (hovered && !hovered.contains(e.relatedTarget as Node | null)) {
        hovered = null;
        window.clearTimeout(hoverTimer);
      }
    };
    const onClick = () => {
      hovered = null;
      window.clearTimeout(hoverTimer);
    };

    // Coming back to the tab, or heading for the exit.
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") hiddenAt = Date.now();
      else if (hiddenAt) {
        const seconds = (Date.now() - hiddenAt) / 1000;
        hiddenAt = 0;
        if (seconds > 20) window.setTimeout(() => trigger("returned", { seconds }), 1200);
      }
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 2 && !e.relatedTarget && s.startedAt && Date.now() - s.startedAt > 30_000) trigger("exit");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onInput, { passive: true });
    window.addEventListener("keydown", onInput);
    window.addEventListener("touchstart", onInput, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("mouseout", onLeave);
    return () => {
      clearChapterTimers();
      unsubscribe();
      window.clearInterval(idleCheck);
      window.clearTimeout(hoverTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onInput);
      window.removeEventListener("keydown", onInput);
      window.removeEventListener("touchstart", onInput);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [trigger]);

  const dismiss = useCallback(() => setQuip(null), []);
  const mute = useCallback(() => {
    setMuted(true);
    setQuip(null);
    try {
      localStorage.setItem(MUTE_KEY, "1");
    } catch {}
  }, []);
  const unmute = useCallback(() => {
    setMuted(false);
    try {
      localStorage.removeItem(MUTE_KEY);
    } catch {}
  }, []);

  return { quip, muted, dismiss, mute, unmute };
}
