"use client";

import { useGSAP } from "@gsap/react";
import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";
import { LiveDot, Pill } from "@/components/ui/Kit";
import { launchFilm } from "@/lib/data/film";
import { track } from "@/lib/lead/track";
import { gsap, prefersReducedMotion, setupGsap } from "@/lib/motion/gsap";
import { useUi } from "@/lib/store";

const { chapters } = launchFilm;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function PlayGlyph({ className = "size-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 12" className={className} fill="currentColor">
      <path d="M0 0l10 6-10 6z" />
    </svg>
  );
}

function PauseGlyph({ className = "size-3" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 12" className={className} fill="currentColor">
      <path d="M0 0h3v12H0zM7 0h3v12H7z" />
    </svg>
  );
}

/**
 * The launch film on a screen that tilts upright as it scrolls in. Opens on
 * a poster with a rose-gold play button; plays with sound when the visitor
 * asks (muted only if the browser refuses). Chapters under the screen jump
 * through the film, and the last frame hands over to the lead form.
 */
export function FilmPlayer() {
  const openLead = useUi((s) => s.openLead);
  const root = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const started = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState<number>(launchFilm.duration);
  const [ended, setEnded] = useState(false);
  const shown = time > 0 || playing;

  useGSAP(
    () => {
      setupGsap();
      if (!screen.current || prefersReducedMotion()) return;
      gsap.fromTo(
        screen.current,
        { scale: 0.86, rotateX: 14, y: 50 },
        {
          scale: 1,
          rotateX: 0,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: screen.current, start: "top bottom", end: "center 58%", scrub: 0.6 },
        },
      );
    },
    { scope: root },
  );

  // Pause once the screen scrolls out of view.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && v.pause(), { threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const play = async (withSound = !muted) => {
    const v = video.current;
    if (!v) return;
    setEnded(false);
    v.muted = !withSound;
    setMuted(!withSound);
    try {
      await v.play();
    } catch {
      v.muted = true;
      setMuted(true);
      await v.play().catch(() => {});
    }
    if (!started.current) {
      started.current = true;
      track("film_play", { source: "launch-film", sound: !v.muted });
    }
  };

  const toggle = () => (playing ? video.current?.pause() : play(started.current ? !muted : true));

  const seek = (t: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(t, duration - 0.1));
    setTime(v.currentTime);
    if (!playing) play(started.current ? !muted : true);
  };

  const scrub = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * duration);
  };

  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      seek(time + (e.key === "ArrowRight" ? 5 : -5));
    }
  };

  const fullscreen = () => {
    const el = screen.current;
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
    else v?.webkitEnterFullscreen?.();
  };

  const current = chapters.reduce((at, c, i) => (time + 0.25 >= c.t ? i : at), 0);

  return (
    <div ref={root} style={{ perspective: "1400px" }}>
      <div
        ref={screen}
        className="corner relative aspect-video w-full overflow-hidden bg-graphite shadow-[0_0_0_1px_rgb(242_185_173/0.22),0_60px_120px_-40px_rgb(0_0_0/0.85),0_0_140px_-30px_rgb(212_150_138/0.35)] will-change-transform"
      >
        {/* biome-ignore lint/a11y/useMediaCaption: the film has music and on-screen titles, no dialogue */}
        <video
          ref={video}
          className="size-full bg-ink object-cover"
          poster={launchFilm.poster}
          preload="metadata"
          playsInline
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onEnded={() => {
            setEnded(true);
            setPlaying(false);
            track("film_complete", { source: "launch-film" });
          }}
        >
          <source src={launchFilm.src} type="video/mp4" />
        </video>

        {/* Poster: the premiere card */}
        {!shown && !ended && (
          <button
            type="button"
            onClick={() => play(true)}
            aria-label="Play the launch film with sound"
            className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_center,rgb(13_13_15/0.1),rgb(13_13_15/0.55))]"
          >
            <span className="relative grid size-20 place-items-center md:size-28">
              <span className="absolute inset-0 rounded-full border border-rose-bright/80 motion-safe:animate-[ripple_2.6s_cubic-bezier(0.2,0.6,0.3,1)_infinite]" />
              <span className="absolute inset-0 rounded-full border border-rose-bright/60 motion-safe:animate-[ripple_2.6s_cubic-bezier(0.2,0.6,0.3,1)_1.3s_infinite]" />
              <span className="rose-plate relative grid size-full place-items-center rounded-full text-ink shadow-[0_24px_60px_-14px_rgb(0_0_0/0.7)] transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-110">
                <PlayGlyph className="ml-1 size-5 md:size-7" />
              </span>
            </span>
            <span className="eyebrow text-[0.58rem] text-paper/90 [text-shadow:0_2px_12px_rgb(0_0_0/0.6)]">
              Play with sound · {clock(launchFilm.duration)}
            </span>
          </button>
        )}
        {!shown && !ended && (
          <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between gap-3 md:inset-x-6 md:top-6">
            <Pill tone="glass">
              <LiveDot className="text-rose-bright" /> Now showing
            </Pill>
            <span className="eyebrow hidden text-[0.54rem] text-paper/75 sm:block">{launchFilm.credit}</span>
          </div>
        )}

        {/* End card */}
        {ended && (
          <div className="absolute inset-0 grid place-items-center bg-ink/85 p-6 text-center backdrop-blur-sm">
            <div>
              <p className="display rose-metal text-[clamp(1.4rem,4vw,3.2rem)] leading-[1.05]">See it before launch</p>
              <p className="eyebrow mt-3 text-[0.58rem] text-paper/60">
                Prices and plans go to registered buyers first
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openLead({ source: "film-end" })}
                  className="rose-plate eyebrow inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-7 text-[0.62rem] text-ink transition-transform duration-500 hover:-translate-y-0.5"
                >
                  Get launch access
                </button>
                <button
                  type="button"
                  onClick={() => openLead({ source: "film-end", offer: "brochure" })}
                  className="eyebrow inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-paper/35 px-7 text-[0.62rem] text-paper transition-colors duration-300 hover:border-paper"
                >
                  Get the brochure
                </button>
                <button
                  type="button"
                  onClick={() => seek(0)}
                  className="eyebrow inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-5 text-[0.62rem] text-paper/70 transition-colors duration-300 hover:text-paper"
                >
                  ↺ Replay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        {shown && !ended && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-ink/90 to-transparent px-4 pb-3 pt-12 text-paper md:gap-4 md:px-6 md:pb-5">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-paper/15 transition-colors duration-300 hover:bg-paper/25"
            >
              {playing ? <PauseGlyph /> : <PlayGlyph className="ml-0.5 size-3" />}
            </button>
            <span className="numerals shrink-0 text-[0.62rem] tracking-[0.08em] text-paper/80">
              {clock(time)} <span className="text-paper/40">/ {clock(duration)}</span>
            </span>
            <div
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(time)}
              aria-valuetext={`${clock(time)}, ${chapters[current].label}`}
              onPointerDown={scrub}
              onKeyDown={keys}
              className="group/bar relative flex h-6 flex-1 cursor-pointer items-center"
            >
              <span className="absolute inset-x-0 h-1 rounded-full bg-paper/20" />
              <span
                className="absolute left-0 h-1 rounded-full bg-gradient-to-r from-rose to-rose-bright"
                style={{ width: `${(time / duration) * 100}%` }}
              />
              {chapters.slice(1).map((c) => (
                <span
                  key={c.t}
                  aria-hidden="true"
                  className="absolute h-2.5 w-px bg-paper/55"
                  style={{ left: `${(c.t / duration) * 100}%` }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const v = video.current;
                if (!v) return;
                v.muted = !muted;
                setMuted(!muted);
              }}
              className="eyebrow shrink-0 cursor-pointer text-[0.54rem] text-paper/85 transition-colors duration-300 hover:text-rose-bright"
            >
              {muted ? "Sound off" : "Sound on"}
            </button>
            <button
              type="button"
              onClick={fullscreen}
              aria-label="Full screen"
              className="hidden size-9 shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-300 hover:bg-paper/15 sm:grid"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.3}
              >
                <path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Chapters */}
      <ol className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:mt-5 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {chapters.map((c, i) => {
          const on = shown && i === current;
          return (
            <li key={c.t} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  seek(c.t);
                  track("film_chapter", { chapter: c.label });
                }}
                aria-current={on ? "true" : undefined}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-full py-2.5 pl-2.5 pr-4 text-left transition-[background-color,border-color,color] duration-300 ${
                  on
                    ? "rose-plate text-ink"
                    : "border border-paper/12 text-paper/70 hover:border-rose/50 hover:text-paper"
                }`}
              >
                <span
                  className={`numerals grid h-7 min-w-11 place-items-center rounded-full px-2 text-[0.56rem] tracking-[0.06em] ${
                    on ? "bg-ink text-paper" : "bg-paper/8 text-rose-bright"
                  }`}
                >
                  {clock(c.t)}
                </span>
                <span className="eyebrow whitespace-nowrap text-[0.52rem]">{c.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <dl className="mt-10 grid grid-cols-3 border-t border-paper/12 pt-6 text-center md:mt-12">
        {[
          ["Runtime", `${Math.floor(launchFilm.duration / 60)} min ${launchFilm.duration % 60} s`],
          ["Footage", launchFilm.credit],
          ["Best with", "Sound on"],
        ].map(([k, v], i) => (
          <div key={k} className={i ? "border-l border-paper/12" : ""}>
            <dt className="eyebrow text-[0.52rem] text-paper/45">{k}</dt>
            <dd className="display mt-2 text-[0.82rem] text-paper md:text-[1rem]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
