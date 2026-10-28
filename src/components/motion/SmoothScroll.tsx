"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { prefersReducedMotion, ScrollTrigger, setupGsap } from "@/lib/motion/gsap";
import { useUi } from "@/lib/store";

// One RAF for everything: Lenis is driven by the GSAP ticker, and every
// ScrollTrigger reads Lenis' position (plan §4.2, "one scroll clock").
export function SmoothScroll() {
  const setLenis = useUi((s) => s.setLenis);

  useEffect(() => {
    const gsap = setupGsap();
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      syncTouch: false,
      autoRaf: false,
    });
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __lenis: lenis });

    // Pinned shots depend on final layout: re-measure once fonts and media land.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [setLenis]);

  return null;
}
