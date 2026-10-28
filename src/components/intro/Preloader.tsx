"use client";

import { useEffect, useRef, useState } from "react";
import { BerkeleyLockup, EllingtonLogo } from "@/components/brand/logos";
import { prefersReducedMotion, setupGsap } from "@/lib/motion/gsap";
import { useUi } from "@/lib/store";

/**
 * Opening credits: "Ellington Properties presents" → the Berkeley Tower
 * title card, held until the first shot has loaded, then the white frame
 * hands over to the letterbox bars that open onto scene 01.
 * First visit only; any key, click or scroll skips ahead.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const setIntroDone = useUi((s) => s.setIntroDone);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el || document.documentElement.dataset.introSeen || prefersReducedMotion()) {
      setIntroDone();
      setGone(true);
      return;
    }
    const gsap = setupGsap();
    el.style.animation = "none";
    useUi.getState().lenis?.stop();

    const load = { p: 0 };
    const paint = () => {
      if (pct.current) pct.current.textContent = String(Math.round(load.p)).padStart(3, "0");
    };

    const credits = gsap
      .timeline()
      .fromTo(
        "[data-c1]",
        { autoAlpha: 0, letterSpacing: "0.9em" },
        { autoAlpha: 1, letterSpacing: "0.32em", duration: 1.4, ease: "expo.out" },
      )
      .fromTo("[data-c1-logo]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" }, 0)
      .to(load, { p: 72, duration: 2, ease: "power1.inOut", onUpdate: paint }, 0)
      .fromTo("[data-bar-line]", { scaleX: 0 }, { scaleX: 0.72, duration: 2, ease: "power1.inOut" }, 0)
      .to("[data-c1], [data-c1-logo]", { autoAlpha: 0, filter: "blur(8px)", duration: 0.6, ease: "power2.in" }, 1.6)
      .fromTo(
        "[data-c2]",
        { autoAlpha: 0, scale: 1.06, filter: "blur(16px)" },
        { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.4, ease: "expo.out" },
        2.0,
      )
      .fromTo(
        "[data-c2-sub]",
        { autoAlpha: 0, letterSpacing: "0.8em" },
        { autoAlpha: 1, letterSpacing: "0.32em", duration: 1.4, ease: "expo.out" },
        2.2,
      );

    let finished = false;
    const exit = () => {
      if (finished) return;
      finished = true;
      credits.progress(1);
      gsap
        .timeline({
          onComplete: () => {
            try {
              sessionStorage.setItem("bt-intro", "1");
            } catch {}
            useUi.getState().lenis?.start();
            setGone(true);
          },
        })
        .to(load, { p: 100, duration: 0.4, ease: "power2.out", onUpdate: paint })
        .to("[data-bar-line]", { scaleX: 1, duration: 0.4, ease: "power2.out" }, 0)
        .to(
          "[data-c2], [data-c2-sub], [data-meta]",
          { autoAlpha: 0, y: -16, filter: "blur(6px)", duration: 0.7, ease: "power2.in" },
          0.5,
        )
        .add(() => setIntroDone(), 1.0)
        .to(el, { autoAlpha: 0, duration: 0.5, ease: "none" }, 1.0);
    };

    const minTime = new Promise((r) => window.setTimeout(r, 3400));
    const heroReady = new Promise<void>((resolve) => {
      if (useUi.getState().heroReady) return resolve();
      const unsub = useUi.subscribe((s) => {
        if (s.heroReady) {
          unsub();
          resolve();
        }
      });
    });
    const failSafe = new Promise((r) => window.setTimeout(r, 8000));
    Promise.race([Promise.all([minTime, heroReady, document.fonts.ready]), failSafe]).then(exit);

    const skip = () => exit();
    window.addEventListener("keydown", skip, { once: true });
    el.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("wheel", skip, { once: true, passive: true });
    return () => {
      credits.kill();
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
    };
  }, [setIntroDone]);

  if (gone) return null;

  return (
    <div
      ref={root}
      data-preloader=""
      aria-hidden="true"
      className="fixed inset-0 z-[100] animate-[preloader-failsafe_600ms_ease_8.5s_forwards] bg-paper text-ink"
    >
      <div className="relative grid h-full place-items-center">
        <div className="col-start-1 row-start-1 flex flex-col items-center gap-6">
          <div data-c1-logo="" className="invisible">
            <EllingtonLogo className="h-10 w-auto text-ink" />
          </div>
          <p data-c1="" className="eyebrow invisible text-[0.7rem] text-stone">
            Presents
          </p>
        </div>
        <div className="col-start-1 row-start-1 flex flex-col items-center gap-8">
          <div data-c2="" className="invisible">
            <BerkeleyLockup className="h-36 w-auto text-ink sm:h-44" />
          </div>
          <p data-c2-sub="" className="eyebrow invisible text-[0.7rem] text-stone">
            Business Bay · Dubai
          </p>
        </div>

        <div data-meta="" className="shell absolute inset-x-0 bottom-0 flex items-center gap-6 pb-8">
          <span className="eyebrow text-[0.6rem] text-stone">Loading scene 01</span>
          <span className="relative h-px flex-1 bg-ink/10">
            <span data-bar-line="" className="absolute inset-0 origin-left bg-ink" />
          </span>
          <span ref={pct} className="numerals text-[0.8rem] tracking-[0.1em]">
            000
          </span>
        </div>
      </div>
    </div>
  );
}
