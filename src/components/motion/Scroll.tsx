"use client";

import { useGSAP } from "@gsap/react";
import NumberFlow from "@number-flow/react";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, setupGsap } from "@/lib/motion/gsap";

/** Paragraph whose words light up as it scrolls through the viewport. */
export function ScrubText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      setupGsap();
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el.querySelectorAll("[data-w]"),
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: 0.6 },
        },
      );
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static sentence
        <span key={i} data-w="">
          {w}{" "}
        </span>
      ))}
    </p>
  );
}

/** Number that rolls up (NumberFlow) the first time it enters the viewport. */
export function CountUp({
  value,
  prefix,
  suffix,
  decimals = 0,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(value);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      <NumberFlow
        value={shown}
        prefix={prefix}
        suffix={suffix}
        format={{ minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: true }}
        transformTiming={{ duration: 1400, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
        spinTiming={{ duration: 1400, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
    </span>
  );
}
