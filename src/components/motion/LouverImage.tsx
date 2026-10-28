"use client";

import { useGSAP } from "@gsap/react";
import Image, { type StaticImageData } from "next/image";
import { useRef } from "react";
import { gsap, prefersReducedMotion, setupGsap } from "@/lib/motion/gsap";
import { useUi } from "@/lib/store";

type RevealImageProps = {
  src: StaticImageData;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** Kept for API compatibility with the earlier slat reveal; unused. */
  slats?: number;
  slatClass?: string;
  preload?: boolean;
  afterIntro?: boolean;
  parallax?: boolean;
  objectPosition?: string;
};

/**
 * Cinematic curtain reveal: the frame wipes open bottom-up while the lens
 * settles from a slow push, then drifts with scroll (optional parallax).
 */
export function LouverImage({
  src,
  alt,
  sizes,
  className = "",
  imgClassName = "",
  preload,
  afterIntro,
  parallax,
  objectPosition = "50% 50%",
}: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const introDone = useUi((s) => s.introDone);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      setupGsap();
      const img = root.querySelector("[data-img]");
      if (prefersReducedMotion()) {
        gsap.set(root, { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }
      if (afterIntro && !introDone) return;

      const reveal = () =>
        gsap
          .timeline()
          .fromTo(
            root,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" },
          )
          .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2.4, ease: "expo.out" }, 0.1);

      // IntersectionObserver rather than ScrollTrigger positions, so reveals
      // still fire when pinned shots above shift the layout.
      let io: IntersectionObserver | null = null;
      if (afterIntro) reveal();
      else {
        io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              io?.disconnect();
              reveal();
            }
          },
          { rootMargin: "0px 0px -8% 0px" },
        );
        io.observe(root);
      }

      if (parallax) {
        gsap.fromTo(
          img,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.9 },
          },
        );
      }
      return () => io?.disconnect();
    },
    { dependencies: [introDone], scope: ref },
  );

  return (
    <div ref={ref} className={`relative overflow-hidden [.js-motion_&]:[clip-path:inset(100%_0%_0%_0%)] ${className}`}>
      <div data-img="" className={`absolute will-change-transform ${parallax ? "-inset-y-[7%] inset-x-0" : "inset-0"}`}>
        <Image
          src={src}
          alt={alt}
          sizes={sizes}
          fill
          preload={preload}
          placeholder="blur"
          quality={85}
          className={`object-cover ${imgClassName}`}
          style={{ objectPosition }}
        />
      </div>
    </div>
  );
}
