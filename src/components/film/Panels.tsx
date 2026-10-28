import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import buildcapsMark from "@/assets/brand/buildcaps-mark.webp";
import { TowerLines } from "@/components/brand/Decor";
import { BerkeleyLockup, EllingtonLogo } from "@/components/brand/logos";
import { AmenityGallery, AmenityLevels } from "@/components/chapters/AmenityGallery";
import { DoubleDeckShaft, LiftGlyph, LoopVideo } from "@/components/chapters/DoubleDeck";
import { OfficeExplorer, OwnershipSteps, PaymentBar } from "@/components/chapters/Explorers";
import { FaqList } from "@/components/chapters/Faq";
import { FilmPlayer } from "@/components/chapters/FilmPlayer";
import { LeadForm } from "@/components/lead/LeadForm";
import { LouverImage } from "@/components/motion/LouverImage";
import { FadeIn, SplitReveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/Scroll";
import { Tilt } from "@/components/motion/Tilt";
import {
  ArrowCircle,
  BackToTop,
  BrochureButton,
  LeadButton,
  LinkLine,
  OpenToolButton,
  ScrollButton,
  WhatsAppButton,
} from "@/components/ui/Buttons";
import {
  Eyebrow,
  FloatBadge,
  FrameMarks,
  Icon,
  IconDisc,
  type IconName,
  LiveDot,
  Marquee,
  Pill,
} from "@/components/ui/Kit";
import { broker, mapsLink, phoneHref } from "@/lib/data/broker";
import { liftLoop } from "@/lib/data/film";
import { brochure, driveTimes, goldenVisa, intelligence, marketStats, project, unitConfigs } from "@/lib/data/tower";
import { media } from "@/lib/media";
import type { ToolId } from "@/lib/store";
import { DrawOnView } from "./DrawOnView";

/* ─── Shared structure ───────────────────────────────────────────
   Every chapter sits on one 12-column grid with 16px gutters. The header
   splits 7 / 5, and two-column content uses the same split, so the title,
   the intro and the cards below share the same vertical lines. */

/** Space between a chapter header and its content. */
const body = "mt-12 lg:mt-16";
/** The shared grid for chapter content. */
const grid = "grid grid-cols-12 gap-3 md:gap-4";

type Tone = "paper" | "mist" | "ink";

type PanelProps = {
  id: string;
  num: number;
  label: string;
  z: number;
  tone?: Tone;
  /** Colour of the light on dark pages: cobalt, or rose gold for spotlights. */
  glow?: "accent" | "rose";
  className?: string;
  /** Rendered outside the padded shell, before / after the content. */
  before?: ReactNode;
  after?: ReactNode;
  children: ReactNode;
};

const panelTones: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  mist: "bg-mist text-ink",
  ink: "bg-ink text-paper",
};

/** A page of the film; covers the pinned shot before it. Grey pages carry
    the façade louvers, dark pages a blueprint grid and accent light. */
function Panel({
  id,
  num,
  label,
  z,
  tone = "paper",
  glow = "accent",
  className = "",
  before,
  after,
  children,
}: PanelProps) {
  const light = glow === "rose" ? "glow-rose" : "glow";
  return (
    <section
      id={id}
      data-floor-num={num}
      data-floor-label={label}
      data-tone={tone}
      className={`relative ${panelTones[tone]} ${className}`}
      style={{ zIndex: z }}
    >
      {tone !== "paper" && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {tone === "mist" ? (
            <div className="louvers absolute inset-0" />
          ) : (
            <>
              <div className="blueprint absolute inset-0" />
              <div className={`${light} absolute -right-[18%] -top-[25%] size-[64rem]`} />
              <div className={`${light} absolute -bottom-[35%] -left-[25%] size-[52rem] opacity-50`} />
            </>
          )}
        </div>
      )}
      {before}
      <div className="shell section-space relative">{children}</div>
      {after}
    </section>
  );
}

/** Every chapter opens the same way: index and level on a ruled line, then
    the title on the left seven columns and the intro on the right five. */
function ChapterHead({
  index,
  label,
  level,
  title,
  intro,
  action,
  dark = false,
  rose = false,
}: {
  index: string;
  label: string;
  level: string;
  title: ReactNode;
  intro?: string;
  action?: ReactNode;
  dark?: boolean;
  /** Rose-gold index and emphasis, for the spotlight chapters. */
  rose?: boolean;
}) {
  const em = rose ? "[&_em]:rose-metal" : "[&_em]:text-accent-bright";
  return (
    <div>
      <FadeIn
        className={`flex items-center justify-between gap-6 border-b pb-4 ${dark ? "border-paper/12" : "border-line"}`}
      >
        <Eyebrow dark={dark} rose={rose}>
          <span className={rose ? "text-rose-bright" : dark ? "text-accent-bright" : "text-accent"}>{index}</span>
          <span className="opacity-40">/</span>
          {label}
        </Eyebrow>
        <Pill tone={dark ? "dark" : "line"}>Level {level}</Pill>
      </FadeIn>
      <div className="mt-10 grid grid-cols-12 items-end gap-x-4 gap-y-7 lg:mt-14">
        <SplitReveal
          className={`display col-span-12 text-[clamp(1.95rem,4vw,4.25rem)] leading-[1] lg:col-span-7 ${
            dark ? `text-paper ${em}` : "text-ink"
          }`}
        >
          {title}
        </SplitReveal>
        {(intro || action) && (
          <FadeIn className="col-span-12 flex flex-col items-start gap-5 md:col-span-9 lg:col-span-5 lg:col-start-8">
            {intro && (
              <p className={`max-w-[32rem] text-[1.05rem] leading-[1.75] ${dark ? "text-paper/65" : "text-stone"}`}>
                {intro}
              </p>
            )}
            {action}
          </FadeIn>
        )}
      </div>
    </div>
  );
}

type TileTone = "mist" | "paper" | "ink" | "accent" | "graphite" | "rose";

const tileTones: Record<TileTone, { box: string; sub: string }> = {
  mist: { box: "bg-mist text-ink", sub: "text-stone" },
  paper: { box: "bg-paper text-ink", sub: "text-stone" },
  ink: { box: "bg-ink text-paper", sub: "text-paper/60" },
  accent: { box: "bg-accent text-paper [--fill:var(--color-ink)]", sub: "text-paper/70" },
  graphite: { box: "border border-paper/10 bg-graphite text-paper", sub: "text-paper/55" },
  rose: { box: "rose-plate text-ink [--fill:var(--color-ink)]", sub: "text-ink/65" },
};

/** Bento stat: label on top, big figure and note at the bottom; floods on hover. */
function StatTile({
  label,
  note,
  tone = "mist",
  compact = false,
  className = "",
  children,
}: {
  label: string;
  note?: string;
  tone?: TileTone;
  /** Smaller figure for narrow tiles. */
  compact?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const t = tileTones[tone];
  return (
    <div className={`card-fill flex min-h-[11rem] flex-col justify-between gap-8 p-6 md:p-7 ${t.box} ${className}`}>
      <p data-fill="sub" className={`eyebrow text-[0.56rem] ${t.sub}`}>
        {label}
      </p>
      <div className="min-w-0">
        <div
          data-fill="title"
          className={`numerals font-extralight leading-none ${
            compact ? "text-[clamp(1.6rem,2.6vw,2.75rem)]" : "text-[clamp(2.3rem,4vw,3.75rem)]"
          }`}
        >
          {children}
        </div>
        {note && (
          <p data-fill="sub" className={`mt-3 text-[0.82rem] leading-snug ${t.sub}`}>
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

/** Photo cell inside a bento grid, captioned bottom-left. */
function ImageTile({
  src,
  alt,
  eyebrow,
  title,
  sizes,
  className = "",
}: {
  src: StaticImageData;
  alt: string;
  eyebrow: string;
  title: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`group relative min-h-[11rem] overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        placeholder="blur"
        className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.05]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
      <span className="absolute inset-x-5 bottom-5">
        <span className="eyebrow block text-[0.54rem] text-paper/70">{eyebrow}</span>
        <span className="display mt-1.5 block text-[0.95rem] leading-tight text-paper">{title}</span>
      </span>
    </div>
  );
}

/** Icon card with a corner flood (features grids). */
function FeatureCard({
  icon,
  n,
  t,
  d,
  dark = false,
  className = "",
}: {
  icon: IconName;
  n: string;
  t: string;
  d: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`group card-fill flex flex-col gap-10 p-6 md:p-7 ${dark ? "bg-graphite" : "bg-paper"} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <IconDisc name={icon} dark={dark} />
        <span data-fill="sub" className={`numerals text-[0.75rem] ${dark ? "text-paper/45" : "text-stone"}`}>
          {n}
        </span>
      </div>
      <div>
        <h3 data-fill="title" className={`display text-[1.02rem] ${dark ? "text-paper" : "text-ink"}`}>
          {t}
        </h3>
        <p data-fill="sub" className={`mt-2.5 text-[0.92rem] leading-relaxed ${dark ? "text-paper/60" : "text-stone"}`}>
          {d}
        </p>
      </div>
    </div>
  );
}

/* ─── 00 · The film (dark chapter) ─────────────────────────────
   Straight after the opening shot, like a premiere: Ellington's launch
   film on a screen that tilts upright as it arrives. */
export function LaunchFilm({ z }: { z: number }) {
  return (
    <Panel id="launch-film" num={0} label="The film" z={z} tone="ink" glow="rose" className="pb-16 md:pb-28">
      <ChapterHead
        dark
        rose
        index="00"
        label="The film"
        level="G"
        title={
          <>
            Watch the <em>launch film</em>
          </>
        }
        intro="Two and a half minutes from Sheikh Zayed Road to the vertiport, in Ellington's own footage. Best with the sound on."
        action={<LinkLine action={{ lead: { source: "film-access" } }}>Get launch access</LinkLine>}
      />
      <div className={body}>
        <FilmPlayer />
      </div>
    </Panel>
  );
}

/* ─── 01 · Overview ──────────────────────────────────────────── */
const firstLook: { icon: IconName; t: string; d: string; highlight?: boolean }[] = [
  { icon: "tower", t: "Grade A offices", d: `${project.units} freehold offices on ${project.officeFloors} floors` },
  {
    icon: "passport",
    t: "Golden Visa route",
    d: `Own AED ${goldenVisa.threshold / 1_000_000}M+ in property, apply for ${goldenVisa.years} years`,
  },
  { icon: "metro", t: "Next to the Metro", d: "Business Bay Station, Red Line", highlight: true },
];

const ticker = [
  "Berkeley Tower",
  "Business Bay",
  `${goldenVisa.years}-year Golden Visa route`,
  "Grade A offices",
  "Sheikh Zayed Road",
  "Freehold",
  "70/30 payment plan",
  "60 storeys",
  "Lift-on-lift double-deck lifts",
  "Ellington Properties",
] as const;

export function Overview({ z }: { z: number }) {
  return (
    <Panel
      id="overview"
      num={0}
      label="Overview"
      z={z}
      before={
        <div className="shell relative z-10 -mt-14 md:-mt-24">
          <FadeIn stagger className="grid gap-3 md:grid-cols-3 md:gap-4">
            {firstLook.map((f, i) => (
              <div
                key={f.t}
                className={`group card-fill flex items-center gap-5 p-5 shadow-[0_34px_70px_-34px_rgb(0_0_0/0.5)] md:p-6 ${
                  i === 1 ? "corner-alt" : "corner"
                } ${
                  f.highlight
                    ? "bg-ink ring-1 ring-rose/40 [--fill:linear-gradient(135deg,var(--color-rose)_0%,var(--color-rose-deep)_100%)]"
                    : "bg-paper"
                }`}
              >
                {f.highlight ? (
                  <span
                    data-fill="icon"
                    className="rose-plate grid size-12 shrink-0 place-items-center rounded-full text-ink"
                  >
                    <Icon name={f.icon} />
                  </span>
                ) : (
                  <IconDisc name={f.icon} />
                )}
                <div className="min-w-0">
                  <p
                    data-fill="title"
                    className={`display ${f.highlight ? "rose-metal text-[1.02rem]" : "text-[0.92rem] text-ink"}`}
                  >
                    {f.t}
                  </p>
                  <p data-fill="sub" className={`mt-1 text-[0.85rem] ${f.highlight ? "text-paper/65" : "text-stone"}`}>
                    {f.d}
                  </p>
                </div>
              </div>
            ))}
          </FadeIn>
        </div>
      }
      after={<Marquee items={ticker} />}
    >
      <ChapterHead
        index="01"
        label="Overview"
        level="G"
        title={
          <>
            A Grade A address on <em>Sheikh Zayed Road</em>
          </>
        }
        intro="Ellington designs around the people who use a space. At Berkeley Tower that thinking enters the world of work."
        action={
          <LinkLine action={{ lead: { source: "overview-brochure", offer: "brochure" } }}>
            Download the brochure
          </LinkLine>
        }
      />
      <div className={`${body} ${grid}`}>
        <div className="relative col-span-12 lg:col-span-7">
          <LouverImage
            src={media["tower-dusk-portrait"]}
            alt="Berkeley Tower at dusk beside Business Bay Metro Station, with the Burj Khalifa behind"
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="corner aspect-[4/5] md:aspect-[16/12] lg:aspect-auto lg:h-full lg:min-h-[40rem]"
            objectPosition="50% 35%"
            parallax
          />
          <FrameMarks />
          <Pill tone="glass" className="absolute left-8 top-8 md:left-10 md:top-10">
            Grade A · Business Bay
          </Pill>
          <FloatBadge
            label="Ownership"
            value="Freehold"
            note="Occupy, lease or resell"
            className="bottom-8 left-8 md:bottom-10 md:left-10"
          />
        </div>
        <FadeIn stagger className="col-span-12 grid grid-cols-2 gap-3 md:gap-4 lg:col-span-5">
          <StatTile label="Storeys" note="GF + M + 60" className="corner">
            <CountUp value={project.storeys} />
          </StatTile>
          <StatTile label="Freehold offices" note="1,132 to 22,191 sq ft" className="corner-alt">
            <CountUp value={project.units} />
          </StatTile>
          <StatTile label="Payment plan" note="70% while it rises, 30% on completion" tone="ink" className="corner-alt">
            70/30
          </StatTile>
          <ImageTile
            src={media["metro-station"]}
            alt="Business Bay Metro Station beside the tower"
            eyebrow="Red Line"
            title="Next to the Metro"
            sizes="(min-width: 1024px) 20vw, 50vw"
            className="corner"
          />
          <div className="corner col-span-2 flex flex-col gap-7 bg-mist p-6 md:p-8">
            <p className="text-[1.02rem] leading-[1.75] text-ink">
              Sixty storeys of Grade A workspace with four floors of amenities, double-deck lifts and robotic parking.
              <span className="text-stone">
                {" "}
                Offices run from 1,132 sq ft to full floors and duplex and triplex headquarters.
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <BrochureButton source="overview" />
              <LinkLine action={{ tool: "spacedna" }}>Find my office</LinkLine>
            </div>
          </div>
        </FadeIn>
      </div>
    </Panel>
  );
}

/* ─── 02 · Architecture ──────────────────────────────────────── */
const archNotes: { icon: IconName; t: string; d: string }[] = [
  {
    icon: "louver",
    t: "Louvered skin",
    d: "Fine vertical louvers ripple across 60 storeys, inspired by fabric in motion.",
  },
  { icon: "seam", t: "The seam", d: "The façade parts along an S-shaped seam of office terraces." },
  { icon: "terrace", t: "Clubhouse terraces", d: "Cantilevered terraces at the amenity levels, 32 to 35." },
  { icon: "crown", t: "Sky crown", d: "Duplex and triplex headquarters and vertiport readiness at the top." },
];

export function Architecture({ z }: { z: number }) {
  return (
    <Panel id="architecture" num={8} label="Architecture" z={z}>
      <ChapterHead
        index="02"
        label="Architecture"
        level="05–60"
        title={
          <>
            A louvered skin that <em>moves like silk</em>
          </>
        }
        intro="The sculptural façade takes its cue from fabric in motion, introducing a new sense of movement to Dubai's skyline."
        action={<LinkLine action={{ to: "offices" }}>Explore the floors</LinkLine>}
      />
      <div className={`${body} ${grid}`}>
        <div className="col-span-12 flex flex-col gap-3 md:col-span-7 md:gap-4">
          <div className="grid gap-px overflow-hidden rounded-[1.75rem_0_1.75rem_1.75rem] border border-line bg-line sm:grid-cols-2">
            {archNotes.map((n, i) => (
              <FeatureCard key={n.t} icon={n.icon} n={`0${i + 1}`} t={n.t} d={n.d} className="min-h-[14rem]" />
            ))}
          </div>
          <FadeIn stagger className="grid grid-cols-3 gap-3 md:gap-4">
            <StatTile label="Floor to floor" note={project.floorToFloor} compact className="corner">
              4.1<span className="text-[0.45em] tracking-[0.1em]"> M</span>
            </StatTile>
            <StatTile label="Sellable area" note="Square feet" compact className="corner-alt">
              <CountUp value={580} suffix="k" />
            </StatTile>
            <StatTile label="Green building" note="Dubai's standard" tone="accent" compact className="corner">
              <span className="text-[0.62em]">Al Sa'fat</span>
            </StatTile>
          </FadeIn>
        </div>
        <FadeIn className="corner relative col-span-12 flex min-h-[30rem] items-center justify-center overflow-hidden bg-mist md:col-span-5">
          <div aria-hidden="true" className="louvers absolute inset-0" />
          <Image
            src={media["architecture-model"]}
            alt="Architectural model of Berkeley Tower showing the louvered façade and the terrace seam"
            fill
            sizes="(min-width: 768px) 38vw, 100vw"
            className="object-contain p-10 mix-blend-multiply"
          />
          <span aria-hidden="true" className="ghost absolute -bottom-3 left-4 text-[clamp(5rem,10vw,9rem)]">
            Silk
          </span>
          <FloatBadge
            label="Office floors"
            value={project.officeFloors}
            note="Plus amenity and summit levels"
            className="right-5 top-5"
          />
        </FadeIn>
      </div>
    </Panel>
  );
}

/* ─── 03 · Location ──────────────────────────────────────────── */
export function LocationDetail({ z }: { z: number }) {
  const near = driveTimes.slice(0, 7);
  const further = driveTimes.slice(7);
  return (
    <Panel id="location-detail" num={16} label="Location" z={z}>
      <ChapterHead
        index="03"
        label="Location"
        level="14"
        title={
          <>
            Four minutes to <em>DIFC</em> and Downtown
          </>
        }
        intro="On Sheikh Zayed Road, beside Business Bay Metro Station on the Red Line."
        action={<LinkLine action={{ lead: { source: "location-visit" } }}>Book a site visit</LinkLine>}
      />
      <div className={`${body} ${grid} items-start`}>
        <div className="relative col-span-12 lg:col-span-7">
          <LouverImage
            src={media["location-model"]}
            alt="Model of Business Bay showing Berkeley Tower beside the Metro, Downtown Dubai and DIFC"
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="corner aspect-[4/3] lg:aspect-[6/5]"
            objectPosition="38% 55%"
          />
          <FrameMarks />
          <div className="pointer-events-none absolute left-[33%] top-[52%]">
            <span className="absolute -left-2 -top-2 size-4 animate-ping rounded-full bg-accent/40" />
            <span className="relative block size-2 rounded-full bg-accent" />
            <Pill tone="ink" className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap">
              Berkeley Tower
            </Pill>
          </div>
          <FloatBadge
            label="Metro"
            value="Next door"
            note="Business Bay Station · Red Line"
            className="bottom-8 left-8 max-sm:hidden md:bottom-10 md:left-10"
          />
        </div>
        <FadeIn className="col-span-12 flex flex-col gap-3 md:gap-4 lg:col-span-5">
          <div className="corner overflow-hidden border border-line bg-paper">
            <p className="eyebrow border-b border-line px-5 py-4 text-[0.58rem] text-stone">Drive times by car</p>
            <ul className="flex flex-col divide-y divide-line">
              {near.map((d) => (
                <li
                  key={d.place}
                  className="flex items-center justify-between gap-6 px-5 py-3.5 transition-colors duration-300 hover:bg-mist"
                >
                  <span className="text-[0.93rem] text-ink">{d.place}</span>
                  <span className="flex shrink-0 items-baseline gap-1.5 text-accent">
                    <CountUp value={d.minutes} className="numerals text-[1.2rem] font-light leading-none" />
                    <span className="eyebrow text-[0.5rem]">Min</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="corner-alt bg-mist p-5">
            <p className="eyebrow text-[0.58rem] text-stone">Further out</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {further.map((d) => (
                <li
                  key={d.place}
                  className="rounded-full border border-line bg-paper px-3.5 py-2 text-[0.78rem] text-ink transition-colors duration-300 hover:border-accent/50 hover:text-accent"
                >
                  {d.place} <span className="numerals ml-1 text-stone">{d.minutes}′</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </Panel>
  );
}

/* ─── 04 · Market ────────────────────────────────────────────── */
export function MarketDetail({ z }: { z: number }) {
  const [sales, business, value, rents, prices, offplan] = marketStats.stats;
  const decimals = (v: number) => (Number.isInteger(v) ? 0 : 1);
  const small = [sales, offplan, rents, prices];
  return (
    <Panel id="market-detail" num={26} label="Market" z={z} tone="mist">
      <ChapterHead
        index="04"
        label="Market"
        level="24"
        title={
          <>
            Dubai offices, <em>first half 2026</em>
          </>
        }
        intro="Business Bay recorded more office sales than any other district in the period."
        action={<LinkLine action={{ tool: "horizon" }}>Model my return</LinkLine>}
      />
      <div className={`${body} ${grid}`}>
        <Tilt className="col-span-12 lg:col-span-7">
          <div className="corner relative flex h-full min-h-[24rem] flex-col justify-between overflow-hidden bg-ink p-7 text-paper md:p-9">
            <div aria-hidden="true" className="blueprint absolute inset-0" />
            <div aria-hidden="true" className="glow absolute -right-1/4 -top-1/2 size-[36rem]" />
            <span
              aria-hidden="true"
              className="ghost ghost-dark absolute -bottom-4 -right-2 text-[clamp(7rem,15vw,13rem)]"
            >
              #1
            </span>
            <div className="relative flex items-center justify-between gap-4">
              <p className="eyebrow text-paper/60">{business.label}</p>
              <Pill tone="dark">
                <LiveDot className="text-accent-bright" /> {marketStats.period}
              </Pill>
            </div>
            <div className="relative">
              <CountUp
                value={business.value}
                className="numerals block text-[clamp(4.5rem,10vw,9rem)] font-extralight leading-[0.85]"
              />
              <p className="mt-5 max-w-sm text-[1rem] leading-relaxed text-paper/70">
                Office sales in Business Bay: {business.note}.
              </p>
            </div>
          </div>
        </Tilt>
        <FadeIn stagger className="col-span-12 grid grid-cols-2 gap-3 md:gap-4 lg:col-span-5">
          {small.map((s, i) => (
            <StatTile
              key={s.label}
              label={s.label}
              note={s.note}
              tone="paper"
              compact
              className={i % 2 ? "corner-alt" : "corner"}
            >
              <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={decimals(s.value)} />
            </StatTile>
          ))}
        </FadeIn>
        <StatTile label={value.label} note={value.note} tone="accent" className="corner col-span-12 lg:col-span-7">
          <CountUp value={value.value} prefix={value.prefix} suffix={value.suffix} decimals={decimals(value.value)} />
        </StatTile>
        <div className="corner-alt col-span-12 flex flex-col justify-between gap-6 border border-line bg-paper p-6 md:p-7 lg:col-span-5">
          <p className="text-[1rem] leading-relaxed text-ink">
            What could an office here earn, or save you in rent?{" "}
            <span className="text-stone">Ownership Horizon runs the 70/30 plan year by year.</span>
          </p>
          <OpenToolButton tool="horizon" variant="accent" className="self-start">
            Run the numbers
          </OpenToolButton>
        </div>
      </div>
      <p className="mt-8 text-[0.78rem] text-stone">
        Source: {marketStats.source}, {marketStats.period}. For information only; past performance does not guarantee
        future returns.
      </p>
    </Panel>
  );
}

/* ─── 05 · Amenities ─────────────────────────────────────────── */

/** The signature amenity, first thing in the chapter: lift on lift, with a
    ride down to the full spotlight that follows. */
function LiftHighlight() {
  const { doubleDeck, passengersAtOnce } = project.lifts;
  const figures = [
    [doubleDeck, "Double-deck lifts"],
    [doubleDeck * 2, "Cabins in motion"],
    [passengersAtOnce, "People at once"],
  ] as const;
  return (
    <FadeIn className={`${body} corner relative overflow-hidden bg-ink text-paper ring-1 ring-rose/30`}>
      <div aria-hidden="true" className="blueprint absolute inset-0" />
      <div aria-hidden="true" className="glow-rose absolute -left-[12%] -top-[70%] size-[44rem]" />
      <div className="relative grid grid-cols-12">
        <div className="col-span-12 flex flex-col justify-between gap-9 p-6 md:p-10 lg:col-span-7">
          <div className="flex items-center justify-between gap-4">
            <Pill tone="rose">★ Signature amenity</Pill>
            <span className="eyebrow text-[0.54rem] text-paper/50">Every floor · G–60</span>
          </div>
          <div className="flex items-center gap-6 md:gap-9">
            <LiftGlyph />
            <div className="min-w-0">
              <p className="display text-[clamp(1.55rem,3.4vw,3.1rem)] leading-[1]">
                Lift on lift,
                <br />
                <span className="rose-metal">moving together</span>
              </p>
              <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-paper/65">
                Two cabins stacked in one frame travel as one and open on two floors at every stop.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6 border-t border-paper/12 pt-6 sm:flex-row sm:items-end sm:justify-between">
            <dl className="grid grid-cols-3 gap-5 md:gap-8">
              {figures.map(([n, k]) => (
                <div key={k} className="flex flex-col justify-between gap-3">
                  <dt className="eyebrow text-[0.5rem] text-paper/50">{k}</dt>
                  <dd className="numerals text-[clamp(1.5rem,2.6vw,2.2rem)] font-extralight leading-none">
                    <CountUp value={n} />
                  </dd>
                </div>
              ))}
            </dl>
            <ScrollButton to="double-deck-lifts" variant="rose" className="shrink-0 self-start sm:self-auto">
              See how it works ↓
            </ScrollButton>
          </div>
        </div>
        <div className="relative col-span-12 min-h-[14rem] overflow-hidden lg:col-span-5">
          <LoopVideo
            src={liftLoop.src}
            poster={liftLoop.poster}
            className="absolute inset-0 size-full origin-top scale-[1.2] object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent max-lg:bg-gradient-to-t" />
          <FrameMarks />
          <Pill tone="glass" className="absolute bottom-7 right-7 md:bottom-9 md:right-9">
            <LiveDot className="text-rose-bright" /> From the launch film
          </Pill>
        </div>
      </div>
    </FadeIn>
  );
}

export function AmenitiesDetail({ z }: { z: number }) {
  return (
    <Panel
      id="amenities-detail"
      num={33}
      label="Amenities"
      z={z}
      after={
        <Marquee
          tone="soft"
          speed={56}
          items={[
            "Lift on lift",
            "Co-working",
            "Focus pods",
            "Clubhouse",
            "Vinyl lounge",
            "Outdoor terraces",
            "Fitness studio",
            "Pilates",
            "Spinning",
            "Prayer rooms",
          ]}
        />
      }
    >
      <ChapterHead
        index="05"
        label="Amenities"
        level="32–35"
        title={
          <>
            Four levels for <em>work, play and wellness</em>
          </>
        }
        intro="Co-working and focus pods, a clubhouse with terraces, fitness studios and prayer rooms."
        action={<LinkLine action={{ lead: { source: "amenities-tour" } }}>Arrange a private tour</LinkLine>}
      />
      <LiftHighlight />
      <div className="mt-12 lg:mt-16">
        <AmenityGallery />
      </div>
      <FadeIn className="mt-3 md:mt-4">
        <AmenityLevels />
      </FadeIn>
    </Panel>
  );
}

/* ─── Spotlight · Double-deck lifts (dark) ─────────────────────
   "Lift on lift": the amenity buyers ask about most, shown working. */
const liftSteps: { icon: IconName; t: string; d: string }[] = [
  {
    icon: "target",
    t: "Choose your floor",
    d: "Tap your floor at the lobby gate; destination control assigns the fastest lift.",
  },
  {
    icon: "lift",
    t: "Two cabins, one ride",
    d: "Both decks share one frame and travel together, one above the other.",
  },
  {
    icon: "floor",
    t: "Two floors per stop",
    d: "Each stop opens on two neighbouring floors at once, so more people move with every trip.",
  },
];

export function LiftSpotlight({ z }: { z: number }) {
  const { doubleDeck, passengersAtOnce } = project.lifts;
  return (
    <Panel id="double-deck-lifts" num={34} label="Double-deck lifts" z={z} tone="ink" glow="rose">
      <ChapterHead
        dark
        rose
        index="★"
        label="Spotlight"
        level="G–60"
        title={
          <>
            Lift on lift, <em>moving together</em>
          </>
        }
        intro={`Each of the ${doubleDeck} double-deck lifts carries two cabins, one on top of the other. They travel as one and stop at two floors at once, so ${passengersAtOnce} people can ride at the same time.`}
        action={
          <LinkLine action={{ lead: { source: "lifts-brochure", offer: "brochure" } }}>
            Get the full specification
          </LinkLine>
        }
      />
      <div className={`${body} ${grid}`}>
        <FadeIn className="col-span-12 lg:col-span-7">
          <DoubleDeckShaft />
        </FadeIn>
        <div className="col-span-12 flex flex-col gap-3 md:gap-4 lg:col-span-5">
          <FadeIn className="corner-alt relative aspect-[16/10] overflow-hidden bg-graphite lg:aspect-auto lg:min-h-[14rem] lg:flex-1">
            <LoopVideo
              src={liftLoop.src}
              poster={liftLoop.poster}
              className="absolute inset-0 size-full origin-top scale-[1.2] object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
            <FrameMarks />
            <Pill tone="glass" className="absolute left-7 top-7 md:left-9 md:top-9">
              <LiveDot className="text-rose-bright" /> From the launch film
            </Pill>
            <p className="display absolute bottom-7 left-7 text-[0.95rem] text-paper md:bottom-9 md:left-9">
              Inside the double-deck shaft
            </p>
          </FadeIn>
          <FadeIn stagger className="grid grid-cols-2 gap-3 md:gap-4">
            <StatTile
              label="Double-deck lifts"
              note="Destination controlled"
              tone="graphite"
              compact
              className="corner"
            >
              <CountUp value={doubleDeck} />
            </StatTile>
            <StatTile label="Cabins in motion" note="Two to every lift" tone="graphite" compact className="corner-alt">
              <CountUp value={doubleDeck * 2} />
            </StatTile>
            <StatTile
              label="People at once"
              note={`Across all ${doubleDeck * 2} cabins`}
              tone="graphite"
              compact
              className="corner-alt"
            >
              <CountUp value={passengersAtOnce} />
            </StatTile>
            <StatTile label="Floors per stop" note="Both decks open together" tone="rose" compact className="corner">
              2
            </StatTile>
          </FadeIn>
        </div>
      </div>
      <FadeIn
        stagger
        className="mt-3 grid gap-px overflow-hidden rounded-[1.75rem_0_1.75rem_1.75rem] border border-paper/10 bg-paper/10 md:mt-4 md:grid-cols-3"
      >
        {liftSteps.map((s, i) => (
          <FeatureCard
            key={s.t}
            dark
            icon={s.icon}
            n={`0${i + 1}`}
            t={s.t}
            d={s.d}
            className="[--fill:linear-gradient(135deg,var(--color-rose)_0%,var(--color-rose-deep)_100%)]"
          />
        ))}
      </FadeIn>
    </Panel>
  );
}

/* ─── 06 · Technology (dark chapter) ─────────────────────────── */
const techIcons: IconName[] = ["lift", "target", "access", "car", "bolt", "floor", "leaf", "shield"];

export function IntelligenceDetail({ z }: { z: number }) {
  const cards = intelligence.map((f, i) => ({ ...f, icon: techIcons[i] })).filter((_, i) => i !== 0 && i !== 3);
  return (
    <Panel id="intelligence" num={38} label="Technology" z={z} tone="ink">
      <ChapterHead
        dark
        index="06"
        label="Technology"
        level="36"
        title={
          <>
            An intelligent <em>business environment</em>
          </>
        }
        intro="Destination-controlled double-deck lifts, smart access and robotic parking keep the day moving."
      />
      <div className={`${body} ${grid}`}>
        <div className="col-span-12 grid grid-cols-2 gap-3 md:gap-4 lg:col-span-7">
          <ImageTile
            src={media["smart-access"]}
            alt="Smart access gates in the lobby"
            eyebrow="Lobby"
            title="Smart access gates"
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="corner col-span-2 min-h-[16rem]"
          />
          <StatTile
            label="Automated bays"
            note={`Robotic parking + ${project.parking.valet} valet bays`}
            tone="graphite"
            className="corner-alt"
          >
            <CountUp value={project.parking.bays} />
          </StatTile>
          <StatTile label="Passengers at once" note="Across all lift cabs" tone="graphite" className="corner">
            <CountUp value={project.lifts.passengersAtOnce} />
          </StatTile>
        </div>
        <Tilt className="col-span-12 lg:col-span-5">
          <div className="corner-alt relative flex h-full min-h-[26rem] flex-col justify-between overflow-hidden bg-accent p-7 text-paper md:p-9">
            <div aria-hidden="true" className="blueprint absolute inset-0 opacity-60" />
            <span
              aria-hidden="true"
              className="ghost ghost-dark absolute -right-3 -top-2 text-[clamp(9rem,18vw,15rem)]"
            >
              {project.lifts.doubleDeck}
            </span>
            <Pill tone="glass" className="relative self-start">
              <LiveDot className="text-paper" /> Destination control
            </Pill>
            <div className="relative">
              <p className="eyebrow text-paper/70">Double-deck lifts</p>
              <CountUp
                value={project.lifts.doubleDeck}
                className="numerals mt-3 block text-[clamp(4.5rem,9vw,8rem)] font-extralight leading-[0.85]"
              />
              <p className="mt-5 max-w-xs text-[0.98rem] leading-relaxed text-paper/80">
                Choose your floor at the gate; the system assigns the fastest cab. {project.lifts.passengersAtOnce}{" "}
                people move at once.
              </p>
            </div>
          </div>
        </Tilt>
      </div>
      <FadeIn
        stagger
        className="mt-3 grid gap-px overflow-hidden rounded-[1.75rem_0_1.75rem_1.75rem] border border-paper/10 bg-paper/10 sm:grid-cols-2 md:mt-4 lg:grid-cols-3"
      >
        {cards.map((c, i) => (
          <FeatureCard key={c.title} dark icon={c.icon} n={String(i + 1).padStart(2, "0")} t={c.title} d={c.detail} />
        ))}
      </FadeIn>
    </Panel>
  );
}

/* ─── 07 · Floor plans ───────────────────────────────────────── */
export function OfficesDetail({ z }: { z: number }) {
  return (
    <Panel id="offices" num={41} label="Floor plans" z={z} tone="mist">
      <ChapterHead
        index="07"
        label="Floor plans"
        level="01–52"
        title={
          <>
            Choose your <em>floor plate</em>
          </>
        }
        intro="From 1,132 sq ft to a full 12,182 sq ft floor, with MEP provisions in every office."
        action={
          <LinkLine action={{ lead: { source: "offices-plans", offer: "brochure" } }}>
            Download the floor plans
          </LinkLine>
        }
      />
      <div className={body}>
        <OfficeExplorer />
      </div>
      <FadeIn className="corner relative mt-12 overflow-hidden bg-ink px-6 py-10 text-paper md:px-12 md:py-14 lg:mt-16">
        <div aria-hidden="true" className="blueprint absolute inset-0" />
        <div aria-hidden="true" className="glow absolute -right-[10%] -top-[80%] size-[40rem]" />
        <span aria-hidden="true" className="ghost ghost-dark absolute -bottom-5 right-0 text-[clamp(5rem,13vw,12rem)]">
          SpaceDNA
        </span>
        <div className="relative grid grid-cols-12 items-end gap-x-4 gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <Eyebrow dark>Not sure which layout fits?</Eyebrow>
            <p className="display mt-5 text-[clamp(1.35rem,2.4vw,2.2rem)] leading-[1.1]">
              Let SpaceDNA size the space your team needs
            </p>
            <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed text-paper/65">
              Describe your team and how it works; it ranks every Berkeley office type against it.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:justify-self-end">
            <OpenToolButton tool="spacedna" variant="light">
              Find my office
            </OpenToolButton>
          </div>
        </div>
      </FadeIn>
    </Panel>
  );
}

/* ─── 08 · Summit ────────────────────────────────────────────── */
const hq = [
  {
    id: "high-1",
    name: "Full floor",
    kind: "Upper-floor headquarters",
    bullets: ["A whole floor plate", "Brand the entire level", "MEP provisions included"],
  },
  {
    id: "duplex",
    name: "Duplex",
    kind: "Two-level headquarters",
    bullets: ["Double-height volumes", "Private terrace", "Single-tenant address"],
  },
  {
    id: "triplex",
    name: "Triplex",
    kind: "Three-level headquarters",
    bullets: ["Three connected levels", "Private terraces at the crown", "Single-tenant address"],
  },
] as const;

export function SummitDetail({ z }: { z: number }) {
  return (
    <Panel id="summit-detail" num={56} label="Summit" z={z}>
      <ChapterHead
        index="08"
        label="Summit collection"
        level="36–58"
        title={
          <>
            Headquarters with <em>their own skyline</em>
          </>
        }
        intro="Single-tenant addresses at the top of Business Bay. Areas are indicative."
        action={<LinkLine action={{ lead: { source: "summit-briefing" } }}>Arrange a private briefing</LinkLine>}
      />
      <FadeIn stagger className={`${body} grid gap-3 md:grid-cols-3 md:gap-4`}>
        {hq.map((h, i) => {
          const c = unitConfigs.find((u) => u.id === h.id);
          if (!c) return null;
          const featured = i === 1;
          return (
            <article
              key={h.id}
              className={`group flex flex-col overflow-hidden border transition-[translate,box-shadow] duration-700 ease-[var(--ease-out)] hover:-translate-y-2 hover:shadow-[0_40px_80px_-40px_rgb(0_0_0/0.35)] ${
                featured ? "corner-alt border-ink bg-ink text-paper" : "corner border-line bg-paper text-ink"
              }`}
            >
              <div className={`relative aspect-[1.3] ${featured ? "bg-paper" : "bg-mist"}`}>
                <Image
                  src={media[c.plan as keyof typeof media]}
                  alt={`${h.name} plan, ${c.floors}`}
                  fill
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="object-contain p-6 mix-blend-multiply transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                />
                <Pill tone={featured ? "accent" : "ink"} className="absolute left-4 top-4">
                  {c.floors}
                </Pill>
                <ArrowCircle tone="current" className="absolute right-4 top-4 bg-paper text-ink" />
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-7">
                <p className={`eyebrow ${featured ? "text-paper/55" : "text-stone"}`}>{h.kind}</p>
                <h3 className="display mt-3 text-[1.5rem]">{h.name}</h3>
                <p
                  className={`numerals mt-5 text-[2.2rem] font-extralight leading-none ${
                    featured ? "text-accent-bright" : "text-accent"
                  }`}
                >
                  {c.min.toLocaleString("en-US")}
                  <span className={`ml-2 text-[0.35em] tracking-[0.14em] ${featured ? "text-paper/55" : "text-stone"}`}>
                    SQ FT
                  </span>
                </p>
                <div className={`my-6 h-px ${featured ? "bg-paper/15" : "bg-line"}`} />
                <ul className="flex flex-1 flex-col gap-2.5">
                  {h.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-[0.92rem]">
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${featured ? "bg-accent-bright" : "bg-accent"}`}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
                <LeadButton
                  intent={{ source: "summit", unit: `${h.name} ${c.floors}` }}
                  variant={featured ? "light" : "ghost"}
                  className="mt-8 w-full justify-between!"
                >
                  Private briefing
                </LeadButton>
              </div>
            </article>
          );
        })}
      </FadeIn>
    </Panel>
  );
}

/* ─── 09 · Future ────────────────────────────────────────────── */
const future = [
  {
    img: media.vertiport,
    t: "Air-taxi vertiport readiness",
    l: "Level 60",
    d: "The crown is designed for future air-taxi services.",
    alt: "Air-taxi vertiport concept at the crown",
  },
  {
    img: media["drone-terraces"],
    t: "Drone delivery platforms",
    l: "Level 33",
    d: "Terrace platforms ready for drone deliveries.",
    alt: "Drone delivery platform on a terrace",
  },
];

export function FutureDetail({ z }: { z: number }) {
  return (
    <Panel id="future-detail" num={60} label="Future" z={z} tone="mist">
      <ChapterHead
        index="09"
        label="Future-ready"
        level="33 · 60"
        title={
          <>
            Built for how the <em>city will move</em>
          </>
        }
        intro="Vertiport and drone services depend on future operators and authority approvals."
      />
      <div className={`${body} ${grid}`}>
        {future.map((f, i) => (
          <figure
            key={f.t}
            className={`group relative col-span-12 ${i === 0 ? "md:col-span-7" : "md:col-span-5 md:mt-24"}`}
          >
            <LouverImage
              src={f.img}
              alt={f.alt}
              sizes="(min-width: 768px) 50vw, 100vw"
              className={`${i === 0 ? "corner aspect-[5/4]" : "corner-alt aspect-[4/5]"}`}
            />
            <span
              className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent ${
                i === 1 ? "corner-alt" : "corner"
              }`}
            />
            <FrameMarks />
            <Pill tone="glass" className="absolute left-8 top-8 md:left-10 md:top-10">
              {f.l}
            </Pill>
            <figcaption className="absolute inset-x-8 bottom-8 text-paper md:inset-x-10 md:bottom-10">
              <span className="display block text-[clamp(1.1rem,1.8vw,1.6rem)] leading-tight">{f.t}</span>
              <span className="mt-2 block max-w-xs text-[0.9rem] text-paper/75">{f.d}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Panel>
  );
}

/* ─── 10 · Payment plan ──────────────────────────────────────── */
export function Ownership({ z }: { z: number }) {
  return (
    <Panel id="ownership" num={60} label="Payment plan" z={z}>
      <ChapterHead
        index="10"
        label="Payment plan"
        level="★"
        title={
          <>
            Your path to <em>ownership</em>
          </>
        }
        intro="70% across booking and construction milestones, 30% on completion. Freehold, and a route to the 10-year Golden Visa."
        action={<LinkLine action={{ lead: { source: "payment-plan" } }}>Get the price list</LinkLine>}
      />
      <FadeIn className={body}>
        <PaymentBar />
      </FadeIn>
      <div className={`mt-12 lg:mt-16 ${grid} gap-y-10`}>
        <div className="col-span-12 lg:col-span-7 lg:pr-12">
          <OwnershipSteps />
        </div>
        <div className="col-span-12 flex flex-col gap-3 md:gap-4 lg:col-span-5">
          <div className="relative">
            <LouverImage
              src={media["office-empty-burj-view"]}
              alt="An empty Berkeley office looking towards the Burj Khalifa"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="corner-alt aspect-[4/5]"
              parallax
            />
            <FrameMarks />
            <FloatBadge
              label="Service charge"
              value={`AED ${project.serviceCharge}`}
              note="Per sq ft a year, anticipated"
              className="bottom-8 left-8 md:bottom-10 md:left-10"
            />
          </div>
          <FadeIn className="corner relative flex flex-col gap-5 overflow-hidden bg-ink p-6 text-paper md:p-7">
            <div aria-hidden="true" className="glow absolute -right-1/3 -top-full size-[26rem]" />
            <div className="relative">
              <p className="display text-[1.05rem]">Date every instalment</p>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-paper/65">
                Ownership Horizon schedules the plan for your office and compares owning with renting.
              </p>
            </div>
            <OpenToolButton tool="horizon" variant="light" className="relative self-start">
              Calculate my payments
            </OpenToolButton>
          </FadeIn>
          <p className="text-[0.78rem] text-stone">
            Indicative schedule from the project brief; the Sales and Purchase Agreement governs final terms.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ─── 11 · Golden Visa ───────────────────────────────────────── */
const visaSteps = [
  {
    t: "Choose your office",
    d: `A purchase value of AED ${goldenVisa.threshold / 1_000_000} million or more, alone or combined with other UAE property.`,
  },
  { t: "Reserve off-plan", d: "Buying from an approved developer counts, and UAE bank finance is allowed." },
  { t: "Apply through the DLD", d: "The Dubai Land Department handles the application; a medical check follows." },
  { t: "Bring your family", d: `Sponsor your ${goldenVisa.family} on the same route.` },
];

const visaPerks: { icon: IconName; t: string; d: string }[] = [
  { icon: "renew", t: "Ten years, renewable", d: "Long-term UAE residency without an employer or local sponsor." },
  { icon: "family", t: "Family included", d: `Your ${goldenVisa.family} can join you.` },
  { icon: "key", t: "Off-plan counts", d: "A Berkeley office bought at launch from Ellington can qualify." },
  { icon: "bank", t: "Finance allowed", d: "A mortgaged office qualifies with a no-objection letter from the bank." },
];

/** A stylised residency card; abstract on purpose, never a copy of the real document. */
function ResidencyCard() {
  return (
    <div className="relative aspect-[1.586] w-full overflow-hidden rounded-[1.2rem] bg-gradient-to-br from-accent via-accent-deep to-ink p-5 text-paper shadow-[0_50px_90px_-40px_rgb(27_44_204/0.75)] sm:rounded-[1.4rem] md:p-8">
      <div aria-hidden="true" className="blueprint absolute inset-0 opacity-70" />
      <div aria-hidden="true" className="glow absolute -right-1/3 -top-2/3 size-[30rem]" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-[0.5rem] text-paper/65 md:text-[0.56rem]">United Arab Emirates</p>
            <p className="display mt-1.5 whitespace-nowrap text-[clamp(0.85rem,2vw,1.45rem)] sm:mt-2">
              Golden Residency
            </p>
          </div>
          <svg
            aria-hidden="true"
            viewBox="0 0 40 30"
            className="h-6 w-auto text-paper/70 sm:h-8 md:h-10"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
          >
            <rect x="0.5" y="0.5" width="39" height="29" rx="5" />
            <path d="M0.5 10.5h12M0.5 19.5h12M27.5 10.5h12M27.5 19.5h12M12.5 0.5v29M27.5 0.5v29M12.5 15h15" />
          </svg>
        </div>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="numerals font-extralight leading-none">
              <span className="text-[clamp(2.6rem,7vw,5.5rem)]">{goldenVisa.years}</span>
              <span className="eyebrow ml-2 text-[0.55rem] text-paper/80 sm:ml-3 sm:text-[0.6rem]">Years</span>
            </p>
            <p className="mt-2 whitespace-nowrap text-[0.7rem] text-paper/70 sm:mt-3 sm:text-[0.8rem]">
              Real estate investor · Renewable
            </p>
          </div>
          <BerkeleyLockup className="h-8 w-auto shrink-0 text-paper/85 sm:h-10 md:h-12" />
        </div>
      </div>
    </div>
  );
}

export function GoldenVisa({ z }: { z: number }) {
  return (
    <Panel id="golden-visa" num={60} label="Golden Visa" z={z} tone="mist">
      <ChapterHead
        index="11"
        label="Golden Visa"
        level="★"
        title={
          <>
            Ownership that opens the door to a <em>10-year Golden Visa</em>
          </>
        }
        intro={`The UAE grants ${goldenVisa.years}-year Golden Residency to investors who own AED ${goldenVisa.threshold / 1_000_000} million or more in property, and off-plan purchases from approved developers count. A Berkeley office can be your way in.`}
        action={<LinkLine action={{ lead: { source: "golden-visa-head" } }}>Check my eligibility</LinkLine>}
      />
      <div className={`${body} ${grid}`}>
        <div className="corner relative col-span-12 flex min-h-[22rem] flex-col items-center justify-center gap-8 overflow-hidden bg-paper px-4 py-10 sm:px-6 sm:py-12 md:px-12 lg:col-span-7">
          <FrameMarks />
          <Tilt max={7} className="w-full max-w-[32rem]">
            <ResidencyCard />
          </Tilt>
          <div className="flex flex-wrap justify-center gap-2">
            <Pill tone="line">AED {goldenVisa.threshold / 1_000_000}M+ property</Pill>
            <Pill tone="line">Off-plan counts</Pill>
            <Pill tone="line">Family included</Pill>
          </div>
        </div>
        <FadeIn className="corner-alt relative col-span-12 flex flex-col justify-between gap-10 overflow-hidden bg-ink p-7 text-paper md:p-9 lg:col-span-5">
          <div aria-hidden="true" className="blueprint absolute inset-0" />
          <div aria-hidden="true" className="glow absolute -right-1/3 -top-1/3 size-[30rem]" />
          <div className="relative">
            <Eyebrow dark>How the route works</Eyebrow>
            <ol className="mt-8 flex flex-col gap-6">
              {visaSteps.map((s, i) => (
                <li key={s.t} className="flex gap-5">
                  <span className="numerals pt-0.5 text-[0.8rem] text-accent-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="display block text-[0.98rem]">{s.t}</span>
                    <span className="mt-1.5 block text-[0.9rem] leading-relaxed text-paper/65">{s.d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative flex flex-wrap items-center gap-x-8 gap-y-4">
            <LeadButton intent={{ source: "golden-visa" }} variant="light">
              Check my eligibility
            </LeadButton>
            <LinkLine
              action={{ ask: "Would a Berkeley office qualify me for the Golden Visa?" }}
              className="text-paper"
            >
              Ask Ellis
            </LinkLine>
          </div>
        </FadeIn>
        <FadeIn stagger className="col-span-12 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {visaPerks.map((p, i) => (
            <FeatureCard
              key={p.t}
              icon={p.icon}
              n={String(i + 1).padStart(2, "0")}
              t={p.t}
              d={p.d}
              className={i % 2 ? "corner-alt" : "corner"}
            />
          ))}
        </FadeIn>
        <p className="col-span-12 max-w-4xl text-[0.78rem] leading-relaxed text-stone">
          Criteria from the{" "}
          {goldenVisa.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && " and the "}
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
              >
                {s.label}
              </a>
            </span>
          ))}
          , checked {goldenVisa.checked}. {goldenVisa.note}
        </p>
      </div>
    </Panel>
  );
}

/* ─── 12 · Berkeley Intelligence (dark chapter) ──────────────── */
const soon: { n: string; name: string; line: string; icon: IconName }[] = [
  { n: "03", name: "SkyLine", line: "See the view and sunlight from any floor, façade and hour.", icon: "sun" },
  { n: "04", name: "Fit-Out Studio", line: "Visualise your brand inside your Berkeley office.", icon: "brush" },
  { n: "05", name: "Commute Oracle", line: "Compare your team's commute by car and Metro.", icon: "route" },
];

const live: {
  n: string;
  name: string;
  line: string;
  tool: ToolId;
  cta: string;
  box: string;
  span: string;
  ghost: string;
}[] = [
  {
    n: "01",
    name: "SpaceDNA",
    line: "Size your team's space and rank Berkeley's real office types against it.",
    tool: "spacedna",
    cta: "Open SpaceDNA",
    box: "corner border border-paper/10 bg-graphite",
    span: "lg:col-span-7",
    ghost: "DNA",
  },
  {
    n: "02",
    name: "Ownership Horizon",
    line: "Own versus rent under the 70/30 plan, with dated payments and yields.",
    tool: "horizon",
    cta: "Open Horizon",
    box: "corner-alt bg-accent",
    span: "lg:col-span-5",
    ghost: "70/30",
  },
];

export function AiStudio({ z }: { z: number }) {
  return (
    <Panel id="intelligence-studio" num={60} label="AI studio" z={z} tone="ink">
      <ChapterHead
        dark
        index="12"
        label="Berkeley Intelligence"
        level="★"
        title={
          <>
            Five tools that think like a <em>property advisor</em>
          </>
        }
        intro="Built on Berkeley's real floor plans, payment plan and views. Opening with the price list."
        action={
          <LinkLine action={{ ask: "" }} className="text-paper">
            Or ask the concierge
          </LinkLine>
        }
      />
      <div className={`${body} ${grid}`}>
        {live.map((t) => (
          <Tilt key={t.n} className={`col-span-12 ${t.span}`} max={4}>
            <article
              className={`relative flex h-full min-h-[22rem] flex-col justify-between overflow-hidden p-7 text-paper md:p-9 ${t.box}`}
            >
              <div aria-hidden="true" className="blueprint absolute inset-0 opacity-70" />
              <span
                aria-hidden="true"
                className="ghost ghost-dark absolute -bottom-4 -right-2 text-[clamp(6rem,12vw,11rem)]"
              >
                {t.ghost}
              </span>
              <div className="relative flex items-center justify-between gap-4">
                <span className="numerals text-[0.8rem] text-paper/60">{t.n}</span>
                <Pill tone="dark">
                  <LiveDot className="text-accent-bright" /> Live
                </Pill>
              </div>
              <div className="relative">
                <h3 className="display text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.05]">{t.name}</h3>
                <p className="mt-4 max-w-sm text-[0.98rem] leading-relaxed text-paper/70">{t.line}</p>
                <OpenToolButton tool={t.tool} variant="light" className="mt-8">
                  {t.cta}
                </OpenToolButton>
              </div>
            </article>
          </Tilt>
        ))}
        {soon.map((t, i) => (
          <div
            key={t.n}
            className={`group card-fill col-span-12 flex min-h-[16rem] flex-col justify-between gap-8 border border-paper/10 bg-graphite p-6 sm:col-span-6 md:p-7 lg:col-span-4 ${
              i % 2 ? "corner-alt" : "corner"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <IconDisc name={t.icon} dark />
              <span data-fill="sub" className="eyebrow text-[0.54rem] text-paper/45">
                {t.n} · In development
              </span>
            </div>
            <div>
              <h3 data-fill="title" className="display text-[1.2rem] text-paper">
                {t.name}
              </h3>
              <p data-fill="sub" className="mt-2.5 text-[0.92rem] leading-relaxed text-paper/60">
                {t.line}
              </p>
              <div className="mt-6 text-paper">
                <LinkLine action={{ lead: { source: `tool-${t.name}` } }}>Early access</LinkLine>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ─── 13 · Developer ─────────────────────────────────────────── */
export function Developer({ z }: { z: number }) {
  return (
    <Panel id="developer" num={60} label="Ellington" z={z}>
      <ChapterHead
        index="13"
        label="The developer"
        level="★"
        title={
          <>
            Design-led <em>since {project.developerFounded}</em>
          </>
        }
        intro="Ellington Properties crafts buildings around the people who use them. Berkeley Tower brings that philosophy into a commercial address."
      />
      <div className={`${body} ${grid}`}>
        <div className="relative col-span-12 lg:col-span-7">
          <LouverImage
            src={media["coworking-sea-view"]}
            alt="Co-working lounge at Berkeley Tower with views of the Arabian Gulf"
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="corner aspect-[16/11]"
            parallax
          />
          <FrameMarks />
          <FloatBadge
            label="Founded"
            value={project.developerFounded}
            note="Dubai"
            className="bottom-8 left-8 max-sm:hidden md:bottom-10 md:left-10"
          />
        </div>
        <FadeIn className="corner-alt relative col-span-12 flex flex-col justify-between gap-10 overflow-hidden bg-mist p-7 md:p-9 lg:col-span-5">
          <div aria-hidden="true" className="louvers absolute inset-0" />
          <EllingtonLogo className="relative h-12 w-auto self-start text-ink" />
          <div className="relative">
            <p className="text-[1rem] leading-[1.75] text-ink">
              Interiors, light and proportion come first.{" "}
              <span className="text-stone">The same design-led approach now shapes a Grade A office tower.</span>
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Pill className="bg-paper">Design-led</Pill>
              <Pill className="bg-paper">Business Bay</Pill>
              <Pill className="bg-paper">Grade A</Pill>
            </div>
          </div>
          <div className="relative">
            <LinkLine action={{ lead: { source: "developer" } }}>Speak to a consultant</LinkLine>
          </div>
        </FadeIn>
      </div>
    </Panel>
  );
}

/* ─── 14 · Questions ─────────────────────────────────────────── */
export function Questions({ z }: { z: number }) {
  return (
    <Panel id="faq" num={60} label="Questions" z={z} tone="mist">
      <ChapterHead
        index="14"
        label="Questions"
        level="★"
        title={
          <>
            Common <em>questions</em>
          </>
        }
        intro="Ownership, the Golden Visa, payments, sizes and access, answered from the project brief."
        action={<LinkLine action={{ ask: "" }}>Ask the concierge</LinkLine>}
      />
      <div className={`${body} ${grid} items-start`}>
        <FadeIn className="corner col-span-12 border border-line bg-paper px-6 md:px-8 lg:col-span-7">
          <FaqList />
        </FadeIn>
        <FadeIn className="corner-alt relative col-span-12 flex flex-col gap-8 overflow-hidden bg-ink p-7 text-paper md:p-9 lg:sticky lg:top-28 lg:col-span-5">
          <div aria-hidden="true" className="glow absolute -right-1/3 -top-1/2 size-[28rem]" />
          <div className="relative">
            <Eyebrow dark>Speak to a consultant</Eyebrow>
            <a
              href={phoneHref}
              className="numerals mt-6 block whitespace-nowrap text-[clamp(1.7rem,2.7vw,2.5rem)] font-extralight leading-none"
            >
              {broker.phone}
            </a>
            <a href={`mailto:${broker.email}`} className="mt-3 block text-[0.95rem] text-accent-soft hover:text-paper">
              {broker.email}
            </a>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <WhatsAppButton
              source="faq"
              variant="light"
              text="Hi, I have a question about Berkeley Tower by Ellington in Business Bay."
            />
            <LeadButton intent={{ source: "faq" }} variant="outline-light">
              Request a call back
            </LeadButton>
          </div>
        </FadeIn>
      </div>
    </Panel>
  );
}

/* ─── 15 · Register ──────────────────────────────────────────── */
const receive = [
  `The full brochure, straight away (${brochure.pages}-page PDF)`,
  "The official price list and live availability",
  `A ${goldenVisa.years}-year Golden Visa eligibility check`,
  "A private briefing with a consultant",
];

export function Register({ z }: { z: number }) {
  return (
    <Panel id="register" num={60} label="Launch access" z={z}>
      <ChapterHead
        index="15"
        label="Launch access"
        level="★"
        title={
          <>
            Register for <em>priority access</em>
          </>
        }
        intro="The brochure the moment you register, then the price list, live availability and a Golden Visa check with a Berkeley consultant."
        action={
          <LinkLine action={{ lead: { source: "register-brochure", offer: "brochure" } }}>Just the brochure</LinkLine>
        }
      />
      <div className={`${body} ${grid}`}>
        <div className="corner-alt col-span-12 border border-line bg-mist p-6 md:p-10 lg:col-span-7">
          <LeadForm source="final" />
        </div>
        <div className="corner relative col-span-12 flex flex-col justify-between gap-12 overflow-hidden bg-ink p-7 text-paper md:p-9 lg:col-span-5">
          <div aria-hidden="true" className="blueprint absolute inset-0" />
          <div aria-hidden="true" className="glow absolute -right-1/3 -top-1/3 size-[30rem]" />
          <DrawOnView className="pointer-events-none absolute -right-10 bottom-6 top-6 flex text-paper/20">
            <TowerLines className="h-full w-auto" />
          </DrawOnView>
          <div className="relative">
            <Eyebrow dark>What you receive</Eyebrow>
            <ul className="mt-8 flex flex-col gap-4">
              {receive.map((r) => (
                <li key={r} className="flex items-start gap-4 text-[1rem] text-paper/85">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-accent-bright/50 text-accent-bright">
                    <Icon name="shield" className="size-3.5" />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative grid grid-cols-3 gap-2">
            {[
              [`${goldenVisa.years} yrs`, "Golden Visa"],
              ["70/30", "Payment plan"],
              ["Freehold", "Ownership"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-paper/15 bg-paper/5 px-3 py-3 backdrop-blur-md">
                <p className="numerals text-[0.95rem] text-paper">{v}</p>
                <p className="eyebrow mt-1 text-[0.48rem] text-paper/55">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ─── Credits (footer) ───────────────────────────────────────── */
const footerNav = [
  ["Overview", "overview"],
  ["Location", "location-detail"],
  ["Amenities", "amenities-detail"],
  ["Floor plans", "offices"],
  ["Payment plan", "ownership"],
  ["Golden Visa", "golden-visa"],
  ["AI tools", "intelligence-studio"],
  ["Questions", "faq"],
] as const;

export function Credits({ z }: { z: number }) {
  const permit = process.env.NEXT_PUBLIC_TRAKHEESI_PERMIT;
  const rera = process.env.NEXT_PUBLIC_RERA_PROJECT_NO;
  const escrow = process.env.NEXT_PUBLIC_ESCROW_ACCOUNT;
  return (
    <footer
      data-tone="ink"
      className="relative overflow-hidden bg-ink pb-28 pt-20 text-paper md:pb-12 md:pt-28"
      style={{ zIndex: z }}
    >
      <div aria-hidden="true" className="blueprint pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute -left-[15%] -top-[40%] size-[50rem] opacity-60"
      />
      <span
        aria-hidden="true"
        className="ghost ghost-dark absolute -bottom-[0.12em] left-1/2 -translate-x-1/2 text-[clamp(5rem,19vw,19rem)]"
      >
        Berkeley
      </span>
      <div className="shell relative">
        <div className="grid grid-cols-12 gap-x-4 gap-y-12 border-b border-paper/10 pb-14">
          <div className="col-span-12 flex flex-col items-start gap-8 lg:col-span-4">
            <BerkeleyLockup className="h-24 w-auto text-paper" />
            <p className="max-w-xs text-[0.92rem] leading-relaxed text-paper/55">
              Grade A freehold offices on Sheikh Zayed Road, beside Business Bay Metro.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <BrochureButton source="footer" variant="light" />
              <LinkLine action={{ lead: { source: "footer" } }} className="text-paper">
                Launch access
              </LinkLine>
            </div>
          </div>
          <nav
            aria-label="Chapters"
            className="col-span-6 flex flex-col items-start gap-3.5 lg:col-span-2 lg:col-start-6"
          >
            <p className="eyebrow mb-2 text-[0.56rem] text-paper/40">Chapters</p>
            {footerNav.map(([l, id]) => (
              <LinkLine key={id} action={{ to: id }} quiet className="text-paper/70 hover:text-paper">
                {l}
              </LinkLine>
            ))}
          </nav>
          <div className="col-span-6 flex flex-col gap-3.5 lg:col-span-2">
            <p className="eyebrow mb-2 text-[0.56rem] text-paper/40">Building</p>
            {[
              "60 storeys",
              "12 double-deck lifts",
              "752 automated bays",
              "Levels 32–35 amenities",
              "Vertiport ready",
            ].map((f) => (
              <p key={f} className="flex items-center gap-2.5 text-[0.88rem] text-paper/65">
                <span className="size-1 rounded-full bg-accent-bright" />
                {f}
              </p>
            ))}
          </div>
          <address className="col-span-12 flex flex-col items-start gap-4 not-italic sm:col-span-6 lg:col-span-3 lg:col-start-10">
            <p className="eyebrow text-[0.56rem] text-paper/40">Presented by</p>
            <div className="flex items-center gap-3.5">
              <Image src={buildcapsMark} alt="" sizes="48px" className="size-12 shrink-0" />
              <p className="display text-[0.92rem] leading-snug text-paper">{broker.name}</p>
            </div>
            <a href={phoneHref} className="numerals whitespace-nowrap text-[1.45rem] font-light text-paper">
              {broker.phone}
            </a>
            <a href={`mailto:${broker.email}`} className="text-[0.92rem] text-accent-soft hover:text-paper">
              {broker.email}
            </a>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.88rem] leading-relaxed text-paper/55 hover:text-paper"
            >
              {broker.address}
            </a>
            {broker.orn && <p className="text-[0.82rem] text-paper/55">RERA ORN {broker.orn}</p>}
            <WhatsAppButton source="footer" variant="outline-light" className="mt-1">
              WhatsApp us
            </WhatsAppButton>
          </address>
        </div>
        <div className="mt-10 grid grid-cols-12 items-start gap-x-4 gap-y-6 text-[0.76rem] leading-relaxed text-paper/45">
          <div id="privacy" className="col-span-12 lg:col-span-7">
            <p>
              This page is operated by <span className="text-paper/75">{broker.name}</span>, a real estate brokerage
              marketing Berkeley Tower by {project.developer}. It is not the developer&apos;s official website.
            </p>
            <p className="mt-3">
              Renders and visualisations are illustrative. Areas, prices, payment terms and dates are indicative and
              subject to change; only the final Sales and Purchase Agreement has legal effect. Market figures are for
              information and do not guarantee future returns.
            </p>
            <p className="mt-3">
              Privacy: details you submit are used to respond to your enquiry about Berkeley Tower and, if you opt in,
              to share future launches. Ask us to access or delete your data at any time via {broker.email}.
            </p>
          </div>
          <div className="col-span-9 flex flex-col gap-1 lg:col-span-3 lg:col-start-9">
            {permit && <p>Trakheesi permit: {permit}</p>}
            {rera && <p>RERA project no.: {rera}</p>}
            {escrow && <p>Escrow account: {escrow}</p>}
            <p className="mt-2 flex items-center gap-3">
              Developed by <EllingtonLogo className="h-6 w-auto text-paper" />
            </p>
          </div>
          <div className="col-span-3 flex justify-end lg:col-span-1 lg:col-start-12">
            <BackToTop className="text-paper" />
          </div>
        </div>
      </div>
    </footer>
  );
}
