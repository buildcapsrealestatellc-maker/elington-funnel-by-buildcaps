"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion/gsap";

/** Floors drawn in the shaft, top to bottom. Illustrative numbers. */
const FLOORS = Array.from({ length: 12 }, (_, i) => 31 - i);
/** Where the lower deck stops; the upper deck is always one floor above. */
const STOPS = [20, 26, 30, 24, 28, 22];
const TRAVEL = 1700;
const DWELL = 2300;
const DOORS = 450;

/** Starts `run` while the element is on screen; stops it when it leaves. */
function useOnScreen<T extends HTMLElement>(run: () => () => void) {
  const ref = useRef<T>(null);
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let stop: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !stop) stop = runRef.current();
        else if (!e.isIntersecting && stop) {
          stop();
          stop = null;
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop?.();
    };
  }, []);
  return ref;
}

/** One deck of the car: a lit glass cabin whose doors part at each stop. */
function Cabin({ open, deck }: { open: boolean; deck: string }) {
  return (
    <div className="relative h-1/2 p-[3px]">
      <div className="relative size-full overflow-hidden rounded-[0.4rem] bg-[linear-gradient(180deg,#fff4ef_0%,#f3d3c9_55%,#e2ab9e_100%)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.5)]">
        {/* Passengers */}
        <span className="absolute inset-x-0 bottom-[14%] flex items-end justify-center gap-[10%]">
          {[0, 1, 2].map((p) => (
            <span key={p} className="flex flex-col items-center gap-[2px]">
              <span className="block size-[0.42rem] rounded-full bg-ink/70" />
              <span className="block h-[0.85rem] w-[0.6rem] rounded-t-full bg-ink/70" />
            </span>
          ))}
        </span>
        <span className="eyebrow absolute left-1.5 top-1 text-[0.4rem] text-ink/55">{deck}</span>
        {/* Doors */}
        <span
          className={`absolute inset-y-0 left-0 w-1/2 origin-left bg-[linear-gradient(90deg,#c9ced6,#eef1f4_60%,#b9bfc8)] shadow-[inset_-1px_0_0_rgb(13_13_15/0.25)] transition-transform duration-[450ms] ease-[var(--ease-lift)] ${
            open ? "scale-x-[0.06]" : "scale-x-100"
          }`}
        />
        <span
          className={`absolute inset-y-0 right-0 w-1/2 origin-right bg-[linear-gradient(270deg,#c9ced6,#eef1f4_60%,#b9bfc8)] shadow-[inset_1px_0_0_rgb(13_13_15/0.25)] transition-transform duration-[450ms] ease-[var(--ease-lift)] ${
            open ? "scale-x-[0.06]" : "scale-x-100"
          }`}
        />
      </div>
    </div>
  );
}

/**
 * "Lift on lift": a live section through one shaft. Two cabins share one
 * rose-gold frame and travel together; at every stop both doors open on two
 * neighbouring floors at once. Runs only while on screen; reduced motion
 * shows a single stop with the doors open.
 */
export function DoubleDeckShaft() {
  const [stop, setStop] = useState(0);
  const [open, setOpen] = useState(true);
  const [prev, setPrev] = useState(0);
  const ref = useOnScreen<HTMLDivElement>(() => {
    if (prefersReducedMotion()) return () => {};
    let i = 0;
    let timer = 0;
    const cycle = () => {
      setOpen(false);
      timer = window.setTimeout(() => {
        const next = (i + 1) % STOPS.length;
        setPrev(i);
        setStop(next);
        i = next;
        timer = window.setTimeout(() => {
          setOpen(true);
          timer = window.setTimeout(cycle, DWELL);
        }, TRAVEL);
      }, DOORS);
    };
    timer = window.setTimeout(cycle, 1200);
    return () => window.clearTimeout(timer);
  });

  const lower = STOPS[stop];
  const upper = lower + 1;
  const row = FLOORS[0] - upper; // rows from the top to the upper deck
  const goingUp = STOPS[stop] > STOPS[prev];
  const served = (f: number) => open && (f === lower || f === upper);

  return (
    <div
      ref={ref}
      className="corner relative overflow-hidden border border-paper/10 bg-graphite p-5 md:p-8"
      role="img"
      aria-label="Diagram of a double-deck lift: two cabins stacked in one frame travel together and open on two floors at each stop."
    >
      <div aria-hidden="true" className="blueprint absolute inset-0 opacity-70" />
      <div aria-hidden="true" className="glow-rose absolute -left-1/4 top-1/4 size-[30rem]" />

      <div className="relative grid grid-cols-[auto_8.5rem_1fr] gap-x-4 sm:grid-cols-[auto_11rem_1fr] md:gap-x-6 xl:grid-cols-[auto_13rem_1fr]">
        {/* Floor numbers */}
        <ol aria-hidden="true" className="grid h-[26rem] grid-rows-12 sm:h-[30rem] md:h-[33rem]">
          {FLOORS.map((f) => (
            <li
              key={f}
              className={`numerals flex items-center justify-end text-[0.62rem] tracking-[0.08em] transition-colors duration-300 ${
                served(f) ? "text-rose-bright" : "text-paper/35"
              }`}
            >
              L{f}
            </li>
          ))}
        </ol>

        {/* The shaft */}
        <div
          aria-hidden="true"
          className="relative h-[26rem] overflow-hidden rounded-[0.6rem] border border-paper/12 bg-ink/60 sm:h-[30rem] md:h-[33rem]"
        >
          {/* Landings */}
          <div className="absolute inset-0 grid grid-rows-12">
            {FLOORS.map((f) => (
              <div key={f} className="relative border-b border-paper/[0.07]">
                <span
                  className={`absolute -right-px top-1/2 h-[55%] w-1 -translate-y-1/2 rounded-l-sm transition-colors duration-300 ${
                    served(f) ? "bg-rose-bright shadow-[0_0_12px_rgb(242_185_173/0.9)]" : "bg-paper/15"
                  }`}
                />
              </div>
            ))}
          </div>
          {/* Guide rails */}
          <span className="absolute inset-y-0 left-[14%] w-px bg-paper/15" />
          <span className="absolute inset-y-0 right-[14%] w-px bg-paper/15" />

          {/* Counterweight, travelling the other way */}
          <span
            className="absolute right-[5%] h-[14%] w-[6%] rounded-sm bg-paper/20 transition-[top] ease-[var(--ease-lift)]"
            style={{ top: `${((10 - row) / 12) * 86}%`, transitionDuration: `${TRAVEL}ms` }}
          />

          {/* The car: two decks in one frame */}
          <div
            className="absolute inset-x-[18%] top-0 h-[calc(100%/6)] transition-transform ease-[var(--ease-lift)] will-change-transform"
            style={{ transform: `translateY(${row * 50}%)`, transitionDuration: `${TRAVEL}ms` }}
          >
            <span className="absolute bottom-full left-1/2 h-[600%] w-px -translate-x-1/2 bg-gradient-to-t from-rose to-rose/0" />
            <span className="absolute bottom-full left-[30%] h-[600%] w-px bg-gradient-to-t from-rose/60 to-rose/0" />
            <span className="absolute bottom-full right-[30%] h-[600%] w-px bg-gradient-to-t from-rose/60 to-rose/0" />
            <div className="relative size-full rounded-[0.55rem] border-2 border-rose bg-[#3a221d] shadow-[0_0_0_1px_rgb(13_13_15/0.6),0_0_28px_-4px_rgb(212_150_138/0.55)]">
              <span className="rose-plate absolute -top-[5px] left-1/2 h-[6px] w-[46%] -translate-x-1/2 rounded-full" />
              <Cabin open={open} deck="Upper" />
              <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-rose" />
              <Cabin open={open} deck="Lower" />
            </div>
          </div>
        </div>

        {/* Readout */}
        <div className="col-span-3 mt-6 flex flex-col justify-between gap-6 sm:col-span-1 sm:mt-0">
          <div>
            <p className="eyebrow flex items-center gap-2 text-[0.54rem] text-paper/55">
              <span
                aria-hidden="true"
                className="inline-block size-1.5 rounded-full bg-rose-bright animate-[pulse-dot_1.8s_ease-in-out_infinite]"
              />
              One shaft, two cabins
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-1">
              {[
                ["Upper deck", upper],
                ["Lower deck", lower],
              ].map(([k, f]) => (
                <div key={k} className="corner-sm border border-paper/10 bg-ink/50 px-4 py-3.5">
                  <p className="eyebrow text-[0.5rem] text-paper/50">{k}</p>
                  <p className="numerals mt-1.5 text-[clamp(1.6rem,3vw,2.5rem)] font-extralight leading-none text-paper">
                    L{f}
                  </p>
                </div>
              ))}
            </div>
            <p
              className={`eyebrow mt-5 flex items-center gap-2 text-[0.56rem] transition-colors duration-300 ${
                open ? "text-rose-bright" : "text-paper/70"
              }`}
            >
              {open ? (
                <>Doors open on two floors</>
              ) : (
                <>
                  <span aria-hidden="true">{goingUp ? "▲" : "▼"}</span> Travelling together
                </>
              )}
            </p>
          </div>
          {/* Per stop: a conventional cab against a double-deck car */}
          <div className="corner-sm border border-paper/10 bg-ink/50 p-4">
            <p className="eyebrow text-[0.5rem] text-paper/50">Floors served per stop</p>
            <div className="mt-4 flex flex-col gap-3.5">
              {[
                ["Single-deck lift", 1],
                ["Double-deck lift", 2],
              ].map(([k, n]) => (
                <div key={k} className="flex items-center justify-between gap-4">
                  <span className={`text-[0.82rem] ${n === 2 ? "text-paper" : "text-paper/55"}`}>{k}</span>
                  <span aria-hidden="true" className="flex gap-1">
                    {[0, 1].map((b) => (
                      <span
                        key={b}
                        className={`h-2.5 w-7 rounded-full ${
                          b < Number(n) ? (n === 2 ? "rose-plate" : "bg-paper/45") : "bg-paper/10"
                        }`}
                      />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[0.75rem] leading-relaxed text-paper/40">
            Illustrative section of one shaft; floor numbers are examples.
          </p>
        </div>
      </div>
    </div>
  );
}

/** A muted loop that plays only while on screen. */
export function LoopVideo({ src, poster, className = "" }: { src: string; poster: string; className?: string }) {
  const ref = useOnScreen<HTMLVideoElement>(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion()) return () => {};
    v.play().catch(() => {});
    return () => v.pause();
  });
  return <video ref={ref} className={className} src={src} poster={poster} muted loop playsInline preload="none" />;
}

/** A small shaft whose two-deck car rides up and down: the "lift on lift" sign. */
export function LiftGlyph({ className = "" }: { className?: string }) {
  const doors = "absolute inset-y-0 w-1/2 bg-[#cfd4db] motion-safe:animate-[lift-doors_6s_linear_infinite]";
  return (
    <span
      aria-hidden="true"
      className={`relative block h-28 w-12 shrink-0 overflow-hidden rounded-[0.55rem] border border-rose/35 bg-ink/70 md:h-36 md:w-14 ${className}`}
    >
      <span className="absolute inset-y-0 left-[14%] w-px bg-paper/15" />
      <span className="absolute inset-y-0 right-[14%] w-px bg-paper/15" />
      <span className="absolute inset-x-[18%] top-1 h-[40%] motion-safe:animate-[lift-ride_6s_cubic-bezier(0.65,0,0.35,1)_infinite]">
        <span className="absolute bottom-full left-1/2 h-[300%] w-px -translate-x-1/2 bg-rose/60" />
        <span className="flex size-full flex-col gap-[2px] rounded-[0.3rem] border border-rose bg-[#3a221d] p-[2px] shadow-[0_0_16px_-2px_rgb(212_150_138/0.6)]">
          {[0, 1].map((d) => (
            <span
              key={d}
              className="relative flex-1 overflow-hidden rounded-[0.15rem] bg-[linear-gradient(180deg,#fff4ef,#e2ab9e)]"
            >
              <span className={`${doors} left-0 origin-left`} />
              <span className={`${doors} right-0 origin-right`} />
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
