"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowCircle } from "@/components/ui/Buttons";
import { Pill } from "@/components/ui/Kit";
import { amenityLevels } from "@/lib/data/tower";
import { type MediaKey, media } from "@/lib/media";
import { useUi } from "@/lib/store";

const ease = [0.16, 1, 0.3, 1] as const;

type Tile = { img: MediaKey; title: string; floor: number; shape?: "tall" | "wide" };

const tiles: Tile[] = [
  { img: "clubhouse", title: "Clubhouse", floor: 33, shape: "tall" },
  { img: "coworking-space", title: "Co-working area", floor: 32 },
  { img: "fitness-studio", title: "Fitness studio", floor: 34 },
  { img: "clubhouse-terraces-night", title: "Outdoor terraces", floor: 33, shape: "wide" },
  { img: "pilates-studio", title: "Pilates studio", floor: 34, shape: "tall" },
  { img: "rest-recharge", title: "Rest & recharge room", floor: 32 },
  { img: "games-room", title: "Gaming lounge", floor: 33 },
  { img: "coworking-lounge", title: "The work lounge", floor: 32, shape: "wide" },
  { img: "clubhouse-terraces-aerial", title: "Clubhouse terraces", floor: 33 },
  { img: "spinning-studio", title: "Spinning studio", floor: 34, shape: "wide" },
];

const filters = [0, 32, 33, 34] as const;
const levelName = (f: number) => amenityLevels.find((l) => l.floor === f)?.name ?? "";

/** L32–35 as a filterable masonry wall; any tile opens full screen. */
export function AmenityGallery() {
  const [filter, setFilter] = useState<number>(0);
  const [open, setOpen] = useState<number | null>(null);
  const lenis = useUi((s) => s.lenis);
  const shown = tiles.filter((t) => !filter || t.floor === filter);

  useEffect(() => {
    if (open === null) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [open, lenis]);

  const step = (d: number) => setOpen((i) => (i === null ? i : (i + d + shown.length) % shown.length));
  const current = open === null ? null : shown[open];

  return (
    <div>
      <div role="tablist" aria-label="Filter amenities by level" className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`eyebrow cursor-pointer rounded-full border px-5 py-3 text-[0.6rem] transition-colors duration-300 ${
              filter === f
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper text-stone hover:border-ink/40 hover:text-ink"
            }`}
          >
            {f ? `L${f} · ${levelName(f)}` : "All levels"}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="mt-8 grid auto-rows-[10.5rem] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[13rem] md:grid-cols-3 md:gap-4 lg:auto-rows-[15rem]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((t, i) => (
            <motion.button
              layout
              key={t.img}
              type="button"
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease }}
              aria-label={`Open ${t.title}, level ${t.floor}`}
              className={`group relative cursor-zoom-in overflow-hidden text-left ${i % 2 ? "corner-alt" : "corner"} ${
                t.shape === "tall" ? "row-span-2" : ""
              } ${t.shape === "wide" ? "md:col-span-2" : ""}`}
            >
              <Image
                src={media[t.img]}
                alt=""
                fill
                sizes="(min-width: 768px) 34vw, 50vw"
                placeholder="blur"
                className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.06]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
              <Pill tone="glass" className="absolute left-3 top-3 md:left-4 md:top-4">
                L{t.floor}
              </Pill>
              <ArrowCircle
                tone="light"
                className="absolute right-3 top-3 scale-75 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100 md:right-4 md:top-4"
              />
              <span className="absolute inset-x-4 bottom-4 md:inset-x-5 md:bottom-5">
                <span className="eyebrow block text-[0.55rem] text-paper/70">{levelName(t.floor)}</span>
                <span className="display mt-1.5 block text-[0.95rem] leading-tight text-paper md:text-[1.15rem]">
                  {t.title}
                </span>
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <Dialog.Root open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[85] bg-ink/92 backdrop-blur-sm animate-[fade-in_400ms_ease]" />
          <Dialog.Content
            data-lenis-prevent=""
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") step(1);
              if (e.key === "ArrowLeft") step(-1);
            }}
            className="fixed inset-0 z-[86] flex flex-col p-4 text-paper md:p-10"
          >
            <div className="flex items-center justify-between gap-4">
              <Dialog.Title className="eyebrow text-paper/80">
                {current && `L${current.floor} · ${levelName(current.floor)} — ${current.title}`}
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close"
                className="grid size-11 cursor-pointer place-items-center rounded-full border border-paper/25 transition-transform duration-500 hover:rotate-90"
              >
                <svg aria-hidden="true" viewBox="0 0 14 14" className="size-3" stroke="currentColor" strokeWidth={1.4}>
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              Amenity image viewer. Use the arrow keys to browse.
            </Dialog.Description>
            <div className="relative mt-4 flex-1">
              <AnimatePresence initial={false} mode="popLayout">
                {current && (
                  <motion.div
                    key={current.img}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease }}
                  >
                    <Image
                      src={media[current.img]}
                      alt={`${current.title}, level ${current.floor}`}
                      fill
                      sizes="100vw"
                      quality={85}
                      className="object-contain"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="numerals text-[0.8rem] text-paper/60">
                {open !== null && `${String(open + 1).padStart(2, "0")} / ${String(shown.length).padStart(2, "0")}`}
              </span>
              <div className="flex gap-2">
                {[-1, 1].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => step(d)}
                    aria-label={d < 0 ? "Previous image" : "Next image"}
                    className="grid size-12 cursor-pointer place-items-center rounded-full border border-paper/25 transition-colors hover:bg-paper hover:text-ink"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 10"
                      className={`h-2.5 w-4 ${d < 0 ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.3}
                    >
                      <path d="M0 5h15M11 1l4 4-4 4" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/** Every amenity, level by level, as tag pills. */
export function AmenityLevels() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {amenityLevels.map((l, i) => (
        <div
          key={l.floor}
          className={`flex flex-col gap-5 p-6 ${i % 2 ? "corner-alt" : "corner"} ${l.floor === 35 ? "bg-accent text-paper" : "bg-mist text-ink"}`}
        >
          <div className="flex items-baseline justify-between gap-4">
            <span className="numerals text-[2.6rem] font-extralight leading-none">{l.floor}</span>
            <span className={`eyebrow text-[0.56rem] ${l.floor === 35 ? "text-accent-soft" : "text-stone"}`}>
              Level
            </span>
          </div>
          <div>
            <h3 className="display text-[1rem]">{l.name}</h3>
            <p className={`mt-2 text-[0.88rem] leading-relaxed ${l.floor === 35 ? "text-paper/75" : "text-stone"}`}>
              {l.tagline}
            </p>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {l.features.map((f) => (
              <li
                key={f}
                className={`rounded-full border px-3 py-1.5 text-[0.75rem] ${
                  l.floor === 35 ? "border-paper/25 text-paper/85" : "border-line bg-paper text-ink/80"
                }`}
              >
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
