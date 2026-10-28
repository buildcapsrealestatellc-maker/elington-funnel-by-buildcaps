"use client";

import { useEffect, useState } from "react";
import { BerkeleyMark, BerkeleyWordmark, EllingtonLogo } from "@/components/brand/logos";
import { buttonClass, DownloadCircle, FlickArrow } from "@/components/ui/Buttons";
import { broker, phoneHref } from "@/lib/data/broker";
import { rideTo, useUi } from "@/lib/store";
import { floorText } from "./LiftSystem";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const floor = useUi((s) => s.floor);
  const setKeypadOpen = useUi((s) => s.setKeypadOpen);
  const openLead = useUi((s) => s.openLead);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 480 && y > lastY + 2);
      if (Math.abs(y - lastY) > 2) lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-silk)] ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${scrolled ? "bg-paper/80 shadow-[0_1px_0_rgb(20_20_22/0.06)] backdrop-blur-xl" : "bg-transparent"}`}
    >
      <div className="shell flex h-16 items-center justify-between gap-4 md:h-20">
        <button
          type="button"
          onClick={() => rideTo("arrival")}
          className="flex cursor-pointer items-center gap-4 text-ink"
          aria-label="Berkeley Tower by Ellington, back to top"
        >
          <span className="flex items-center gap-2.5 text-ink">
            <BerkeleyMark className="h-6 w-auto md:h-7" />
            <BerkeleyWordmark className="h-6 w-auto md:h-7" />
          </span>
          <span className="hidden h-8 w-px bg-ink/15 sm:block" />
          <EllingtonLogo className="hidden h-7 w-auto text-ink/80 sm:block" />
        </button>

        <nav aria-label="Primary" className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setKeypadOpen(true)}
            className="flex h-11 cursor-pointer items-center gap-3 border border-ink/12 bg-paper/60 pl-4 pr-3 text-ink transition hover:border-ink/35"
          >
            <span className="eyebrow hidden text-[0.66rem] sm:inline">Floors</span>
            <span className="numerals grid h-7 min-w-9 place-items-center bg-ink px-2 text-[0.8rem] font-medium text-paper">
              {floorText(floor)}
            </span>
          </button>
          <a
            href={phoneHref}
            className="eyebrow hidden h-11 items-center px-3 text-[0.66rem] text-ink/80 transition hover:text-ink lg:flex"
          >
            {broker.phone}
          </a>
          <button
            type="button"
            onClick={() => openLead({ source: "header" })}
            className={buttonClass("primary", "min-h-11! py-2.5! max-md:hidden")}
          >
            <span className="relative z-[2]">Launch access</span>
            <FlickArrow className="relative z-[2]" />
          </button>
        </nav>
      </div>
    </header>
  );
}

/** Thumb-reach action bar on phones, shown once the hero is passed. */
export function MobileBar() {
  const [show, setShow] = useState(false);
  const openLead = useUi((s) => s.openLead);
  const setKeypadOpen = useUi((s) => s.setKeypadOpen);
  const leadOpen = useUi((s) => s.leadOpen);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-full border border-line bg-paper/90 p-1.5 shadow-[0_24px_50px_-20px_rgb(0_0_0/0.4)] backdrop-blur-md transition-[transform,opacity] duration-500 ease-[var(--ease-cine)] md:hidden ${
        show && !leadOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[150%] opacity-0"
      }`}
    >
      <div className="grid grid-cols-[auto_auto_1fr] items-center gap-1">
        <button
          type="button"
          onClick={() => setKeypadOpen(true)}
          className="eyebrow grid h-11 cursor-pointer place-items-center rounded-full px-3.5 text-[0.58rem] text-ink transition-colors hover:bg-mist"
        >
          Floors
        </button>
        <a
          href={phoneHref}
          className="eyebrow grid h-11 place-items-center rounded-full px-3.5 text-[0.58rem] text-ink transition-colors hover:bg-mist"
        >
          Call
        </a>
        <button
          type="button"
          onClick={() => openLead({ source: "mobile-bar", offer: "brochure" })}
          className={buttonClass(
            "accent",
            "min-h-11! justify-between! whitespace-nowrap py-1! pl-5! text-[0.58rem]! tracking-[0.16em]!",
            true,
          )}
        >
          <span className="relative z-[2]">Brochure</span>
          <DownloadCircle tone="solid" size="sm" className="relative z-[2]" />
        </button>
      </div>
    </div>
  );
}
