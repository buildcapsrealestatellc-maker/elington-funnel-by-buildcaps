"use client";

import { useEffect, useId, useRef } from "react";

/** Eye centres in the 64 × 64 drawing. */
const eyes = [
  { x: 24, y: 30 },
  { x: 40, y: 30 },
];
const REACH = 2.4;

/**
 * Ellis, the Concierge's face: a concierge in a bow tie with one eyebrow
 * permanently raised. His eyes follow the cursor, he blinks, and his mouth
 * moves while he talks.
 */
export function Ellis({ talking = false, className = "" }: { talking?: boolean; className?: string }) {
  const root = useRef<SVGSVGElement>(null);
  const pupils = useRef<(SVGGElement | null)[]>([]);
  const lids = useRef<SVGGElement>(null);
  const face = `ellis-face-${useId().replace(/:/g, "")}`;

  // Eyes follow the pointer; on touch screens they glance the way you scroll.
  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    let frame = 0;
    let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const look = () => {
      frame = 0;
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const scale = r.width / 64;
      eyes.forEach((e, i) => {
        const cx = r.left + e.x * scale;
        const cy = r.top + e.y * scale;
        const dx = target.x - cx;
        const dy = target.y - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, dist / 140) * REACH;
        const pupil = pupils.current[i];
        if (pupil)
          pupil.style.transform = `translate(${((dx / dist) * k).toFixed(2)}px, ${((dy / dist) * k).toFixed(2)}px)`;
      });
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(look);
    };
    const onMove = (e: PointerEvent) => {
      target = { x: e.clientX, y: e.clientY };
      queue();
    };
    let lastY = window.scrollY;
    const onScroll = () => {
      if (window.matchMedia("(pointer: fine)").matches) return;
      const down = window.scrollY > lastY;
      lastY = window.scrollY;
      const r = svg.getBoundingClientRect();
      target = { x: r.left - 40, y: down ? r.bottom + 120 : r.top - 120 };
      queue();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    queue();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // A blink every few seconds, sometimes a double.
  useEffect(() => {
    let timer = 0;
    const blink = (times: number) => {
      const g = lids.current;
      if (!g) return;
      g.style.transform = "scaleY(0.08)";
      window.setTimeout(() => {
        g.style.transform = "";
        if (times > 1) window.setTimeout(() => blink(times - 1), 140);
      }, 110);
    };
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          blink(Math.random() < 0.2 ? 2 : 1);
          schedule();
        },
        2400 + Math.random() * 3600,
      );
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <svg ref={root} viewBox="0 0 64 64" aria-hidden="true" className={`overflow-visible ${className}`}>
      <defs>
        <radialGradient id={face} cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#2a2c33" />
          <stop offset="100%" stopColor="#0d0d0f" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill={`url(#${face})`} />
      {/* Slicked side part */}
      <path d="M13 25c2-11 12-16 22-15 9 1 16 7 17 15-5-6-13-9-22-7-7 1-12 4-17 7z" fill="#2c2f37" />
      {/* Brows: the right one is permanently unimpressed */}
      <path d="M18.5 22.5l10 .6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M35.5 22.3l10-2.4"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        className="origin-[40px_21px] transition-transform duration-300"
        style={{ transform: talking ? "translateY(-1.6px) rotate(-6deg)" : undefined }}
      />
      <g ref={lids} className="origin-[32px_30px] transition-transform duration-100">
        {eyes.map((e, i) => (
          <g key={e.x}>
            <ellipse cx={e.x} cy={e.y} rx="5.4" ry="6" fill="#fff" />
            <g
              ref={(el) => {
                pupils.current[i] = el;
              }}
              className="transition-transform duration-150 ease-out"
            >
              <circle cx={e.x} cy={e.y + 0.4} r="2.7" fill="#2d45ff" />
              <circle cx={e.x + 0.9} cy={e.y - 0.6} r="0.8" fill="#fff" />
            </g>
          </g>
        ))}
      </g>
      {/* Smirk, or a moving mouth while he talks */}
      {talking ? (
        <ellipse cx="32.5" cy="42.5" rx="3.6" ry="2.2" fill="#fff" className="ellis-talk origin-[32.5px_42.5px]" />
      ) : (
        <path d="M26 41.5c3 2.6 7.6 2.8 12-.9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      )}
      {/* Bow tie */}
      <path d="M25.5 52.5l6.5 3-6.5 3.2zM38.5 52.5l-6.5 3 6.5 3.2z" fill="#2d45ff" />
      <circle cx="32" cy="55.6" r="1.5" fill="#7b8bff" />
    </svg>
  );
}
