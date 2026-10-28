"use client";

// Central GSAP setup: plugins and the funnel's named eases (plan §4.2).
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

export function setupGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);
  CustomEase.create("silk", "M0,0 C0.22,1 0.36,1 1,1");
  CustomEase.create("lift", "M0,0 C0.65,0 0.35,1 1,1");
  CustomEase.create("drape", "M0,0 C0.3,0 0.2,1.06 0.55,1.02 C0.75,1 0.9,1 1,1");
  gsap.defaults({ ease: "silk", duration: 0.9 });
  registered = true;
  return gsap;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, SplitText };
