"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { type ReactNode, useRef } from "react";
import type { CamKey, ShotDef } from "@/lib/data/shots";
import { depthMaps } from "@/lib/depth";
import { media } from "@/lib/media";
import { gsap, prefersReducedMotion, setupGsap } from "@/lib/motion/gsap";
import { useUi } from "@/lib/store";
import { ShotCanvas } from "./ShotCanvas";

const zero: CamKey = { x: 0, y: 0, z: 0, roll: 0, focus: 0, dof: 0 };

type ShotProps = {
  def: ShotDef;
  z: number;
  /** The opening shot: letterbox iris + time-based camera and credits. */
  opening?: boolean;
  preload?: boolean;
  /** A highlighted line under the title (the opening shot's Metro sign). */
  lead?: ReactNode;
  children?: ReactNode;
};

/**
 * A pinned, full-screen scene. Scroll drives the camera through its
 * keyframes; titles arrive like film credits; on exit the next section
 * slides over while this frame recedes ("push" transition).
 */
export function Shot({ def, z, opening, preload, lead, children }: ShotProps) {
  const root = useRef<HTMLElement>(null);
  const restPose = opening ? def.keys[1] : def.keys[0];
  const cam = useRef<CamKey>({ ...restPose });
  const offset = useRef<CamKey>({ ...zero });
  const introDone = useUi((s) => s.introDone);
  const setHeroReady = useUi((s) => s.setHeroReady);
  const img = media[def.image];
  const Heading = opening ? "h1" : "h2";

  // Scroll choreography.
  useGSAP(
    () => {
      setupGsap();
      const el = root.current;
      if (!el || prefersReducedMotion()) {
        gsap.set(el?.querySelectorAll("[data-t]") ?? [], { autoAlpha: 1 });
        return;
      }
      // The camera runs for the shot's whole life on screen: from the moment
      // it slides into view until the next section has fully covered it.
      // Timeline units: 0 = first visible, 1 = fully covered.
      const H = def.length;
      const span = opening ? H - 100 : H; // svh of scroll the timeline spans
      const coverAt = opening ? (H - 200) / span : (H - 100) / span;
      const keys = opening ? def.keys.slice(2) : def.keys.slice(1);

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: opening ? "top top" : "top bottom", end: "bottom bottom", scrub: 1.2 },
        defaults: { ease: "none" },
      });
      tl.to(cam.current, { keyframes: keys.map((k) => ({ ...k, ease: "sine.inOut" })), duration: 1 }, 0);

      if (opening) {
        tl.to("[data-bar]", { height: 0, duration: 0.14, ease: "power2.in" }, 0);
      } else {
        // Credits roll in as the shot arrives.
        tl.fromTo("[data-t]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, 0.1)
          .fromTo(
            "[data-t-line]",
            { letterSpacing: "0.32em", autoAlpha: 0, filter: "blur(12px)" },
            { letterSpacing: "-0.005em", autoAlpha: 1, filter: "blur(0px)", stagger: 0.03, duration: 0.14 },
            0.12,
          )
          .fromTo("[data-t-meta]", { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.1 }, 0.14)
          .fromTo("[data-t-side], [data-t-lead]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.2);
      }

      // Credits leave just before the next section covers the frame.
      const out = Math.max(0.3, coverAt - 0.07);
      tl.to("[data-t-line]", { autoAlpha: 0, y: -40, stagger: 0.01, duration: 0.08 }, out)
        .to("[data-t-side], [data-t-meta], [data-t-lead]", { autoAlpha: 0, duration: 0.06 }, out)
        .to("[data-media]", { scale: 0.88, yPercent: -4, duration: 1 - coverAt, ease: "power1.in" }, coverAt)
        .to("[data-dim]", { opacity: 0.55, duration: 1 - coverAt }, coverAt);
    },
    { scope: root },
  );

  // Opening: iris (letterbox) opens, camera settles, credits roll in.
  useGSAP(
    () => {
      if (!opening || !introDone) return;
      setupGsap();
      if (prefersReducedMotion()) {
        gsap.set("[data-t]", { autoAlpha: 1 });
        return;
      }
      const start = def.keys[0];
      const rest = def.keys[1];
      Object.assign(offset.current, {
        x: start.x - rest.x,
        y: start.y - rest.y,
        z: start.z - rest.z,
        roll: start.roll - rest.roll,
        dof: start.dof - rest.dof,
      });
      const seen = !!document.documentElement.dataset.introSeen;
      gsap
        .timeline()
        .to("[data-bar]", { height: "7svh", duration: seen ? 0.01 : 1.7, ease: "expo.inOut" }, 0)
        .to(offset.current, { x: 0, y: 0, z: 0, roll: 0, dof: 0, duration: 4.2, ease: "expo.out" }, 0)
        .set("[data-t]", { autoAlpha: 1 }, 0.6)
        .fromTo(
          "[data-t-meta]",
          { autoAlpha: 0, letterSpacing: "0.6em" },
          { autoAlpha: 1, letterSpacing: "0.26em", duration: 1.6, ease: "expo.out" },
          0.7,
        )
        .fromTo(
          "[data-t-line]",
          { letterSpacing: "0.4em", autoAlpha: 0, filter: "blur(14px)" },
          {
            letterSpacing: "-0.005em",
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 2.2,
            ease: "expo.out",
            stagger: 0.18,
          },
          0.85,
        )
        .fromTo(
          "[data-t-lead]",
          { autoAlpha: 0, y: 28, clipPath: "inset(0 100% 0 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0% 0 0)", duration: 1.6, ease: "expo.out" },
          1.3,
        )
        .fromTo(
          "[data-t-side] > *",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.1 },
          1.5,
        );
    },
    { dependencies: [introDone], scope: root },
  );

  const light = def.tone === "light";
  const longest = Math.max(...def.title.map((l) => l.length));
  const titleSize = longest > 12 ? "text-[clamp(1.45rem,4.6vw,5.4rem)]" : "text-[clamp(1.9rem,6.6vw,7.75rem)]";

  return (
    <section
      ref={root}
      id={def.id}
      data-floor-num={def.floorNum}
      data-floor-label={def.label}
      data-scene={def.scene}
      className="relative"
      style={{ height: `${def.length}svh`, marginBottom: "-100svh", zIndex: z }}
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-ink">
        <div data-media="" className="absolute inset-0 origin-[50%_35%] will-change-transform">
          <Image
            src={img}
            alt={`${def.label}: ${def.caption}`}
            fill
            preload={preload}
            sizes="(orientation: portrait) 230vh, 100vw"
            quality={85}
            placeholder="blur"
            className="scale-[1.08] object-cover landscape:scale-[1.2]"
            style={{ objectPosition: `${def.frame[0] * 100}% ${def.frame[1] * 100}%` }}
          />
          <ShotCanvas
            image={img}
            depth={depthMaps[def.depth].src}
            frame={def.frame}
            cam={cam}
            offset={offset}
            onReady={opening ? setHeroReady : undefined}
          />
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-[70%] ${
              light
                ? "bg-gradient-to-t from-black/70 via-black/25 to-transparent"
                : "bg-gradient-to-t from-white/85 via-white/35 to-transparent"
            }`}
          />
        </div>
        <div data-dim="" className="pointer-events-none absolute inset-0 bg-black opacity-0" />

        <div
          data-t=""
          className={`shell absolute inset-x-0 bottom-0 grid grid-cols-12 items-end gap-x-6 gap-y-6 pb-28 [.js-motion_&]:invisible ${
            opening ? "md:pb-[calc(7svh+1.75rem)]" : "md:pb-14"
          } ${light ? "text-paper" : "text-ink"}`}
        >
          <div className="col-span-12 lg:col-span-8">
            <p data-t-meta="" className="eyebrow flex items-center gap-2.5 whitespace-nowrap sm:gap-4">
              <span>SC {def.scene}</span>
              <span className="h-px w-5 bg-current opacity-50 sm:w-10" />
              <span>{def.label}</span>
              <span className="h-px w-5 bg-current opacity-50 sm:w-10" />
              <span>L {def.floor}</span>
            </p>
            {/* The opening title is the page's one h1, with the full name for search. */}
            {/* The opening title is cast in Buildcaps rose gold. */}
            <Heading className={`display mt-5 leading-[0.95] ${titleSize} ${opening ? "font-normal" : ""}`}>
              {def.title.map((line) => (
                <span key={line} className="block">
                  <span data-t-line="" className="block md:whitespace-nowrap">
                    {opening ? <span className="rose-metal-deep">{line}</span> : line}
                  </span>
                </span>
              ))}
              {opening && <span className="sr-only"> by Ellington: Grade A offices in Business Bay, Dubai</span>}
            </Heading>
            {lead && (
              <div data-t-lead="" className="mt-6 md:mt-8">
                {lead}
              </div>
            )}
          </div>
          <div
            data-t-side=""
            className="col-span-12 flex flex-col gap-6 sm:col-span-8 lg:col-span-3 lg:col-start-10 lg:pb-3"
          >
            <p className={`text-[0.95rem] leading-relaxed ${light ? "text-paper/85" : "text-ink/75"}`}>{def.caption}</p>
            {children && <div className="flex flex-wrap gap-3">{children}</div>}
          </div>
        </div>

        {opening && (
          <>
            {/* Letterbox bars, edged in rose gold where they meet the frame */}
            <div
              data-bar=""
              className="absolute inset-x-0 top-0 z-10 h-[7svh] overflow-hidden bg-paper [.js-motion_&]:h-[50svh] [html[data-intro-seen]_&]:h-[7svh]"
            >
              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-rose to-transparent" />
            </div>
            <div
              data-bar=""
              className="absolute inset-x-0 bottom-0 z-10 h-[7svh] overflow-hidden bg-paper [.js-motion_&]:h-[50svh] [html[data-intro-seen]_&]:h-[7svh]"
            >
              <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-rose to-transparent" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
