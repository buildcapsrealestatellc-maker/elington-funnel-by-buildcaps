"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { BerkeleyMark, BerkeleyWordmark } from "@/components/brand/logos";
import { floorText } from "@/components/nav/LiftSystem";
import { DownloadCircle } from "@/components/ui/Buttons";
import { WhatsAppIcon } from "@/components/ui/Kit";
import { whatsappLink } from "@/lib/data/broker";
import { type SectionKey, sections } from "@/lib/data/sections";
import { track } from "@/lib/lead/track";
import { rideTo, useUi } from "@/lib/store";

const links = [
  { key: "overview", label: "Overview", match: "Overview" },
  { key: "location", label: "Location", match: "Location" },
  { key: "floorPlans", label: "Floor plans", match: "Floor plans" },
  { key: "paymentPlan", label: "Payment", match: "Payment plan" },
  { key: "goldenVisa", label: "Golden Visa", match: "Golden Visa" },
  { key: "aiTools", label: "AI tools", match: "AI studio" },
] as const satisfies readonly { key: SectionKey; label: string; match: string }[];

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 420, damping: 36, mass: 0.8 } as const;

const go = (key: SectionKey) => {
  const s = sections[key];
  rideTo(s.id, { floor: s.floor, num: s.num, label: s.label });
};

/** Solid WhatsApp green, with a soft ring that breathes now and then. */
function WhatsAppButton({ wide = false }: { wide?: boolean }) {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click", { source: "header" })}
      aria-label="Chat with us on WhatsApp"
      className={`group relative flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#25d366] text-white shadow-[0_8px_24px_-10px_rgb(37_211_102/0.9)] transition-[transform,background-color] duration-300 hover:scale-[1.04] hover:bg-[#1fbe5a] ${
        wide ? "px-4" : "w-10"
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#25d366] motion-safe:animate-[wa-ring_3.2s_ease-out_2s_infinite]"
      />
      <WhatsAppIcon className="relative size-[1.15rem]" />
      {wide && <span className="eyebrow relative text-[0.56rem] text-white">WhatsApp</span>}
    </a>
  );
}

/**
 * The film's command bar: one rose-gold bar with the chapters, the lift
 * readout and the two actions. It runs flush edge to edge across the top,
 * slimming once the film runs, and stays rose gold over every frame. A rose
 * line along its edge tracks the scroll. Below xl the chapters fold into a menu.
 */
export function FilmNav() {
  const floor = useUi((s) => s.floor);
  const floorLabel = useUi((s) => s.floorLabel);
  const introDone = useUi((s) => s.introDone);
  const setKeypadOpen = useUi((s) => s.setKeypadOpen);
  const openLead = useUi((s) => s.openLead);
  const reduce = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) < 8) return;
      setHidden(y > last && y > 480);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu with Escape, and whenever the visitor rides somewhere.
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const active = links.find((l) => l.match === floorLabel)?.key ?? null;
  const pill = hovered ?? active;
  const show = introDone && (!hidden || menu);

  const shadow = scrolled
    ? "shadow-[0_22px_50px_-26px_rgb(122_59_49/0.55)]"
    : "shadow-[0_10px_30px_-22px_rgb(122_59_49/0.4)]";

  const item = {
    hidden: { opacity: 0, y: -8, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
  };

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
      initial={false}
      animate={show ? { y: 0, opacity: 1 } : { y: reduce ? 0 : -110, opacity: reduce ? 0 : 1 }}
      transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 32 }}
    >
      <motion.div
        className={`pointer-events-auto relative flex items-center gap-2 overflow-hidden border-b border-rose-deep/20 text-ink transition-shadow duration-500 ${shadow}`}
        animate={{ height: scrolled ? 56 : 64 }}
        transition={{ duration: 0.6, ease: EASE }}
        initial={false}
      >
        {/* Brushed rose gold, as on the Buildcaps mark, over every frame; a soft
            highlight passes along it now and then. */}
        <span aria-hidden="true" className="rose-plate pointer-events-none absolute inset-0" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-70 motion-safe:animate-[plate-sheen_9s_ease-in-out_3s_infinite] motion-reduce:hidden"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
        />
        <motion.div
          className="relative flex w-full items-center gap-2 px-3 md:px-5 lg:px-8"
          initial="hidden"
          animate={introDone ? "show" : "hidden"}
          variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
        >
          {/* Brand */}
          <motion.button
            variants={item}
            type="button"
            onClick={() => {
              setMenu(false);
              rideTo("arrival");
            }}
            aria-label="Berkeley Tower by Ellington, back to the start"
            className="group flex h-10 shrink-0 cursor-pointer items-center gap-2.5 rounded-full px-3 transition-colors duration-300 hover:bg-current/[0.06]"
          >
            <BerkeleyMark className="h-5 w-auto transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-0.5" />
            <BerkeleyWordmark className="h-[0.95rem] w-auto" />
          </motion.button>

          <motion.span variants={item} aria-hidden="true" className="hidden h-5 w-px bg-current/15 xl:block" />

          {/* Chapters, with a pill that follows the pointer and rests on the current one */}
          <nav
            aria-label="Chapters"
            className="hidden flex-1 justify-center xl:flex"
            onMouseLeave={() => setHovered(null)}
          >
            <ul className="flex items-center gap-0.5">
              {links.map((l) => {
                const current = active === l.key;
                return (
                  <motion.li key={l.key} variants={item} className="relative">
                    {pill === l.key && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={reduce ? { duration: 0 } : SPRING}
                        className={`absolute inset-0 rounded-full bg-ink/[0.07]`}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => go(l.key)}
                      onMouseEnter={() => setHovered(l.key)}
                      onFocus={() => setHovered(l.key)}
                      onBlur={() => setHovered(null)}
                      aria-current={current ? "location" : undefined}
                      className={`eyebrow relative flex h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-[0.56rem] transition-opacity duration-300 2xl:px-4 ${
                        current || pill === l.key ? "opacity-100" : "opacity-60"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`size-1.5 rounded-full transition-[transform,opacity] duration-300 ${
                          current ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        } bg-ink`}
                      />
                      {l.label}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 xl:ml-0">
            {/* Lift readout: the floor you're on; opens the keypad */}
            <motion.button
              variants={item}
              type="button"
              onClick={() => setKeypadOpen(true)}
              aria-label={`Floors, now on ${floorText(floor)}`}
              className="hidden h-10 cursor-pointer items-center gap-2.5 rounded-full pl-3.5 pr-1 transition-colors duration-300 hover:bg-current/[0.06] md:flex"
            >
              <span className="eyebrow text-[0.52rem] opacity-60">Floor</span>
              <span className="numerals grid h-8 min-w-10 place-items-center overflow-hidden rounded-full bg-ink px-2 text-[0.64rem] tracking-[0.06em] text-paper">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={floor}
                    initial={reduce ? false : { y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduce ? undefined : { y: -12, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    {floorText(floor)}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.button>

            <motion.div variants={item} className="hidden 2xl:block">
              <WhatsAppButton wide />
            </motion.div>
            <motion.div variants={item} className="2xl:hidden">
              <WhatsAppButton />
            </motion.div>

            <motion.button
              variants={item}
              type="button"
              data-quip=""
              onClick={() => {
                setMenu(false);
                openLead({ source: "header", offer: "brochure" });
              }}
              className="group sheen hidden h-10 shrink-0 cursor-pointer items-center gap-3 rounded-full bg-ink pl-5 pr-1 text-paper shadow-[0_10px_26px_-12px_rgb(13_13_15/0.7)] [--sheen:var(--color-rose-deep)] md:flex"
            >
              <span className="eyebrow relative z-[2] text-[0.56rem]">Brochure</span>
              <DownloadCircle size="sm" tone="solid" className="relative z-[2]" />
            </motion.button>

            {/* Menu, below xl */}
            <motion.button
              variants={item}
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-controls="film-menu"
              aria-label={menu ? "Close the menu" : "Open the menu"}
              className="relative grid size-10 shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-300 hover:bg-current/[0.08] xl:hidden"
            >
              <span aria-hidden="true" className="relative block h-3 w-[1.15rem]">
                <span
                  className={`absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-transform duration-500 ease-[var(--ease-out)] ${
                    menu ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-[1.5px] rounded-full bg-current transition-[transform,width] duration-500 ease-[var(--ease-out)] ${
                    menu ? "bottom-1/2 w-full translate-y-1/2 -rotate-45" : "w-2/3"
                  }`}
                />
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll progress along the bar's bottom edge */}
        <motion.span
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-rose-deep via-[#6c3229] to-rose-deep"
        />
      </motion.div>

      {/* The menu: chapters and actions, below xl */}
      <AnimatePresence>
        {menu && (
          <motion.div
            id="film-menu"
            key="menu"
            initial={{ opacity: 0, y: -12, scale: 0.98, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="pointer-events-auto mx-3 mt-2 origin-top overflow-hidden rounded-[1.75rem_0_1.75rem_1.75rem] border border-ink/[0.07] md:mx-4 lg:mx-6 bg-white/92 p-3 text-ink shadow-[0_40px_90px_-40px_rgb(13_13_15/0.55)] backdrop-blur-2xl md:p-4 xl:hidden"
          >
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } } }}
              className="grid gap-1 sm:grid-cols-2"
            >
              {links.map((l, i) => {
                const current = active === l.key;
                return (
                  <motion.li
                    key={l.key}
                    variants={{
                      hidden: { opacity: 0, x: -12 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        go(l.key);
                      }}
                      aria-current={current ? "location" : undefined}
                      className={`group flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3.5 text-left transition-colors duration-300 ${
                        current ? "bg-rose-soft" : "hover:bg-mist"
                      }`}
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="numerals text-[0.72rem] text-rose-deep">{String(i + 1).padStart(2, "0")}</span>
                        <span className="display text-[1.15rem]">{l.label}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-stone transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.45, ease: EASE } }}
              className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 sm:grid-cols-3"
            >
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  openLead({ source: "header-menu", offer: "brochure" });
                }}
                className="col-span-2 flex h-12 cursor-pointer items-center justify-between rounded-full bg-ink pl-5 pr-1.5 text-white sm:col-span-1"
              >
                <span className="eyebrow text-[0.58rem] text-white">Get the brochure</span>
                <DownloadCircle size="sm" tone="solid" />
              </button>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { source: "header-menu" })}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25d366] text-white"
              >
                <WhatsAppIcon className="size-[1.1rem]" />
                <span className="eyebrow text-[0.58rem] text-white">WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  setKeypadOpen(true);
                }}
                className="flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full border border-line"
              >
                <span className="eyebrow text-[0.58rem]">Floor</span>
                <span className="numerals grid h-7 min-w-9 place-items-center rounded-full bg-ink px-2 text-[0.62rem] text-paper">
                  {floorText(floor)}
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
