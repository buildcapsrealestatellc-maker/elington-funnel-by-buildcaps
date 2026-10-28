"use client";

import { useGSAP } from "@gsap/react";
import { type ReactNode, useRef } from "react";
import { gsap, prefersReducedMotion, setupGsap } from "@/lib/motion/gsap";

/** Draws every SVG path inside as the block scrolls through the viewport. */
export function DrawOnView({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      setupGsap();
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el.querySelectorAll("path"),
        { drawSVG: "50% 50%" },
        {
          drawSVG: "0% 100%",
          ease: "none",
          stagger: 0.004,
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 60%", scrub: 0.8 },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
