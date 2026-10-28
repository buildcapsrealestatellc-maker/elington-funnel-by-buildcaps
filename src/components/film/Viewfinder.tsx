"use client";

import { useEffect, useRef, useState } from "react";
import { useUi } from "@/lib/store";

const TOTAL_SCENES = "11";
const RUNTIME = 168; // seconds of "film" mapped onto the full scroll

function Corner({ className }: { className: string }) {
  return <span className={`absolute size-5 border-current ${className}`} />;
}

/**
 * Camera viewfinder overlay: corner brackets, scene counter and a timecode
 * that runs with the scroll. Uses difference blending so it reads on both
 * the white pages and the full-screen shots.
 */
export function Viewfinder() {
  const [scene, setScene] = useState({ n: "01", label: "Berkeley Tower" });
  const tc = useRef<HTMLSpanElement>(null);
  const overShot = useUi((s) => s.overShot);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      const secs = p * RUNTIME;
      const f = Math.floor((secs % 1) * 24);
      const s = Math.floor(secs) % 60;
      const m = Math.floor(secs / 60);
      if (tc.current) {
        tc.current.textContent = `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
      }
      const mid = window.innerHeight * 0.5;
      let current: HTMLElement | null = null;
      for (const el of document.querySelectorAll<HTMLElement>("[data-scene]")) {
        if (el.getBoundingClientRect().top <= mid) current = el;
      }
      if (current) {
        const n = current.dataset.scene ?? "01";
        const label = current.dataset.floorLabel ?? "";
        setScene((prev) => (prev.n === n ? prev : { n, label }));
      }
      // What sits under the header? Sections overlap (shots are covered by the
      // next section), so the last one spanning the header line is on top.
      let top: HTMLElement | null = null;
      for (const el of document.querySelectorAll<HTMLElement>("main > section, body > footer")) {
        const r = el.getBoundingClientRect();
        if (r.top <= 40 && r.bottom > 40) top = el;
      }
      const overShot = !!top?.dataset.scene;
      // Dark chapters also take a clear header; the HUD stays for film shots only.
      const overDark = overShot || top?.dataset.tone === "ink";
      const ui = useUi.getState();
      if (ui.overShot !== overShot) ui.setOverShot(overShot);
      if (ui.overDark !== overDark) ui.setOverDark(overDark);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-40 hidden text-white mix-blend-difference transition-opacity duration-500 md:block ${
        overShot ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-4 lg:inset-6">
        <Corner className="bottom-0 left-0 border-b border-l" />
        <Corner className="bottom-0 right-0 border-b border-r" />
      </div>
      <div className="absolute bottom-7 right-28 flex items-center gap-5 lg:bottom-9 lg:right-32">
        <span className="eyebrow text-[0.58rem]">
          SC {scene.n} / {TOTAL_SCENES}
        </span>
        <span className="h-px w-6 bg-current opacity-50" />
        <span ref={tc} className="numerals text-[0.66rem] tracking-[0.14em]">
          00:00:00:00
        </span>
      </div>
    </div>
  );
}
