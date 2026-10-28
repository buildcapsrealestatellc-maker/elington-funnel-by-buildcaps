"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { WaveField } from "@/components/brand/Decor";
import { BerkeleyMark } from "@/components/brand/logos";
import { destinations } from "@/lib/data/tower";
import { gsap, prefersReducedMotion, setupGsap } from "@/lib/motion/gsap";
import { rideTo, scrollToId, useUi } from "@/lib/store";

export function floorText(n: number) {
  if (n < 0.5) return "G";
  if (n < 1) return "M";
  return String(Math.round(n)).padStart(2, "0");
}

/**
 * Maps scroll position to a tower floor. Sections declare
 * `data-floor-num` and `data-floor-label`; the floor interpolates between
 * consecutive stops so the counter climbs continuously, like a lift.
 */
export function FloorTracker() {
  const setFloor = useUi((s) => s.setFloor);

  useEffect(() => {
    let raf = 0;
    let last = "";
    const measure = () => {
      raf = 0;
      const stops = Array.from(document.querySelectorAll<HTMLElement>("[data-floor-num]")).map((el) => ({
        top: el.getBoundingClientRect().top + window.scrollY,
        num: Number(el.dataset.floorNum),
        label: el.dataset.floorLabel ?? "",
      }));
      if (!stops.length) return;
      const probe = window.scrollY + window.innerHeight * 0.5;
      let i = 0;
      while (i < stops.length - 1 && stops[i + 1].top <= probe) i++;
      const a = stops[i];
      const b = stops[i + 1];
      let floor = a.num;
      if (b && probe > a.top) floor = a.num + ((b.num - a.num) * (probe - a.top)) / (b.top - a.top);
      const key = `${Math.round(floor * 2)}|${a.label}`;
      if (key !== last) {
        last = key;
        setFloor(floor, a.label);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [setFloor]);

  return null;
}

/** Right-edge lift indicator (desktop). Opens the destination keypad. */
export function FloorRail() {
  const floor = useUi((s) => s.floor);
  const label = useUi((s) => s.floorLabel);
  const setKeypadOpen = useUi((s) => s.setKeypadOpen);
  const pct = Math.min(1, Math.max(0, floor / 60));
  const stops = destinations.filter((d) => d.floor !== "★");

  return (
    <button
      type="button"
      onClick={() => setKeypadOpen(true)}
      aria-label={`Floor ${floorText(floor)}, ${label}. Open destination control`}
      className="group fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 cursor-pointer flex-col items-end gap-5 mix-blend-difference text-paper lg:flex xl:right-8"
    >
      <span className="flex flex-col items-end leading-none">
        <span className="eyebrow text-[0.62rem] opacity-70">Level</span>
        <span className="numerals mt-1 text-[2.6rem] font-extralight tracking-tight">{floorText(floor)}</span>
        <span className="eyebrow mt-2 max-w-28 text-right text-[0.6rem] opacity-80">{label}</span>
      </span>
      <span className="relative block h-[34vh] w-px bg-paper/30">
        {stops.map((d) => (
          <span
            key={d.id}
            className="absolute right-0 h-px w-2 bg-paper/50"
            style={{ bottom: `${(d.num / 60) * 100}%` }}
          />
        ))}
        <span
          className="absolute -right-[3px] size-[7px] rounded-full bg-paper transition-[bottom] duration-200 ease-out"
          style={{ bottom: `calc(${pct * 100}% - 3px)` }}
        />
      </span>
      <span className="eyebrow text-[0.58rem] opacity-60 transition-opacity group-hover:opacity-100">Select floor</span>
    </button>
  );
}

/** Destination-control keypad, modelled on the tower's real lift dispatch. */
export function DestinationKeypad() {
  const open = useUi((s) => s.keypadOpen);
  const setOpen = useUi((s) => s.setKeypadOpen);
  const [entry, setEntry] = useState("");

  const go = (id: string) => {
    setOpen(false);
    setEntry("");
    // Let the dialog close before the doors run.
    window.setTimeout(() => rideTo(id), 180);
  };

  const goToFloor = () => {
    const n = Number(entry);
    if (!Number.isFinite(n) || n < 0 || n > 60) return;
    const target = [...destinations]
      .filter((d) => d.floor !== "★")
      .reverse()
      .find((d) => d.num <= n);
    go(target?.id ?? "arrival");
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/30 backdrop-blur-sm data-[state=open]:animate-[fade-in_300ms_var(--ease-silk)]" />
        <Dialog.Content className="glass fixed left-1/2 top-1/2 z-[81] w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <Dialog.Title className="eyebrow text-accent">Destination control</Dialog.Title>
              <Dialog.Description className="display mt-2 text-3xl text-ink sm:text-4xl">
                Where would you like to go?
              </Dialog.Description>
            </div>
            <Dialog.Close className="grid size-10 shrink-0 cursor-pointer place-items-center border border-ink/10 text-ink/70 transition hover:border-ink/40 hover:text-ink">
              <span className="sr-only">Close</span>
              <svg aria-hidden="true" viewBox="0 0 14 14" className="size-3.5" stroke="currentColor" strokeWidth={1.4}>
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </Dialog.Close>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {destinations.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => go(d.id)}
                className="group flex cursor-pointer flex-col items-start gap-1 border border-ink/8 bg-paper/70 px-3 py-3 text-left transition duration-300 hover:border-accent/40 hover:bg-paper"
              >
                <span className="numerals text-2xl font-extralight text-ink transition-colors group-hover:text-accent">
                  {d.floor}
                </span>
                <span className="eyebrow text-[0.58rem] text-stone">{d.label}</span>
              </button>
            ))}
          </div>

          <form
            className="mt-5 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              goToFloor();
            }}
          >
            <label htmlFor="keypad-floor" className="eyebrow shrink-0 text-[0.62rem] text-stone">
              Or type a floor
            </label>
            <input
              id="keypad-floor"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={entry}
              onChange={(e) => setEntry(e.target.value.replace(/\D/g, ""))}
              placeholder="1–60"
              className="numerals h-11 w-full min-w-0 border border-ink/10 bg-paper px-4 text-lg font-light outline-none transition focus:border-accent/50"
            />
            <button
              type="submit"
              className="h-11 shrink-0 cursor-pointer bg-accent px-5 font-brand text-[0.7rem] font-medium uppercase tracking-[0.16em] text-paper transition hover:bg-accent-deep"
            >
              Go
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Full-screen lift doors: close, travel (the counter races to the target
 * floor), open on the destination (plan §4.3, ≤ 1.8 s).
 */
export function LiftDoors() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const caption = useRef<HTMLSpanElement>(null);
  const setLiftRunner = useUi((s) => s.setLiftRunner);

  useEffect(() => {
    setupGsap();
    setLiftRunner((id, stop) => {
      const dest =
        destinations.find((d) => d.id === id) ?? (stop && document.getElementById(id) ? { id, ...stop } : undefined);
      const el = root.current;
      if (!el || !dest || prefersReducedMotion()) {
        scrollToId(id, { immediate: true });
        return;
      }
      const left = el.querySelector("[data-door=left]");
      const right = el.querySelector("[data-door=right]");
      const from = { n: useUi.getState().floor };
      const lenis = useUi.getState().lenis;
      lenis?.stop();
      if (caption.current) caption.current.textContent = dest.label;

      gsap
        .timeline({
          onComplete: () => {
            lenis?.start();
            gsap.set(el, { autoAlpha: 0 });
          },
        })
        .set(el, { autoAlpha: 1 })
        .fromTo(left, { xPercent: -101 }, { xPercent: 0, duration: 0.55, ease: "lift" }, 0)
        .fromTo(right, { xPercent: 101 }, { xPercent: 0, duration: 0.55, ease: "lift" }, 0)
        .fromTo("[data-lift-readout]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 0.35)
        .to(
          from,
          {
            n: dest.num,
            duration: 0.6,
            ease: "lift",
            onUpdate: () => {
              if (counter.current) counter.current.textContent = dest.floor === "★" ? "★" : floorText(from.n);
            },
          },
          0.45,
        )
        .add(() => {
          lenis?.start();
          scrollToId(id, { immediate: true });
          lenis?.stop();
        }, 1.08)
        .to("[data-lift-readout]", { autoAlpha: 0, duration: 0.25 }, 1.15)
        .to(left, { xPercent: -101, duration: 0.7, ease: "lift" }, 1.2)
        .to(right, { xPercent: 101, duration: 0.7, ease: "lift" }, 1.2);
    });
    return () => setLiftRunner(null);
  }, [setLiftRunner]);

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-[95] overflow-hidden">
      <div data-door="left" className="absolute inset-y-0 left-0 w-1/2 -translate-x-[101%] bg-mist">
        <WaveField className="absolute inset-0 h-full w-full text-ink/[0.07]" />
        <span className="absolute inset-y-0 right-0 w-px bg-ink/15" />
      </div>
      <div data-door="right" className="absolute inset-y-0 right-0 w-1/2 translate-x-[101%] bg-mist">
        <WaveField flip className="absolute inset-0 h-full w-full text-ink/[0.07]" />
        <span className="absolute inset-y-0 left-0 w-px bg-ink/15" />
      </div>
      <div data-lift-readout="" className="invisible absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-ink">
          <BerkeleyMark className="h-8 w-auto text-ink" />
          <span ref={counter} className="numerals text-7xl font-extralight tracking-tight sm:text-8xl">
            G
          </span>
          <span ref={caption} className="eyebrow text-stone" />
        </div>
      </div>
    </div>
  );
}
