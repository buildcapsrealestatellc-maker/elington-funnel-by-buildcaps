"use client";

import { useGSAP } from "@gsap/react";
import { type ElementType, type ReactNode, type RefObject, useRef } from "react";
import { gsap, prefersReducedMotion, SplitText, setupGsap } from "@/lib/motion/gsap";
import { useUi } from "@/lib/store";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Wait for the intro (preloader) to finish before playing. */
  afterIntro?: boolean;
  delay?: number;
};

/**
 * Plays `play` once the element enters the viewport. IntersectionObserver
 * (not ScrollTrigger positions) so long pinned shots and late-loading media
 * can never leave content stuck hidden.
 */
function onEnter(ref: RefObject<HTMLElement | null>, play: () => void) {
  const el = ref.current;
  if (!el) return () => {};
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        io.disconnect();
        play();
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** Headline reveal: lines rise out of masks. */
export function SplitReveal({ as: Tag = "h2", children, className, afterIntro, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const introDone = useUi((s) => s.introDone);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      setupGsap();
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      if (afterIntro && !introDone) return;

      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.set(el, { autoAlpha: 1 });
      gsap.set(split.lines, { yPercent: 105 });
      const stop = onEnter(ref, () =>
        gsap.to(split.lines, { yPercent: 0, duration: 1.3, stagger: 0.1, delay, ease: "expo.out" }),
      );
      return () => {
        stop();
        split.revert();
      };
    },
    { dependencies: [introDone], scope: ref },
  );

  return (
    <Tag ref={ref} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}

/** Soft rise for paragraphs and groups. `stagger` animates the direct children. */
export function FadeIn({
  as: Tag = "div",
  children,
  className,
  afterIntro,
  delay = 0,
  stagger = false,
}: RevealProps & { stagger?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const introDone = useUi((s) => s.introDone);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      setupGsap();
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      if (afterIntro && !introDone) return;
      const items = stagger ? Array.from(el.children) : [el];
      gsap.set(el, { autoAlpha: 1 });
      gsap.set(items, { autoAlpha: 0, y: 24 });
      return onEnter(ref, () =>
        gsap.to(items, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, delay, ease: "expo.out" }),
      );
    },
    { dependencies: [introDone], scope: ref },
  );

  return (
    <Tag ref={ref} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
