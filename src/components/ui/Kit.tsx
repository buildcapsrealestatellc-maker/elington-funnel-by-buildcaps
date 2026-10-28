import type { CSSProperties, ReactNode } from "react";

/* Small building blocks shared by every chapter: section labels, tags,
   floating badges over images, icon discs and the ticker strip. */

/** Short rule + label, the way every section introduces itself. */
export function Eyebrow({
  children,
  className = "",
  dark = false,
  rose = false,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  rose?: boolean;
}) {
  const rule = rose ? "bg-rose" : dark ? "bg-accent-bright" : "bg-accent";
  return (
    <p className={`eyebrow flex items-center gap-3 ${dark ? "text-paper/60" : "text-stone"} ${className}`}>
      <span aria-hidden="true" className={`h-px w-8 shrink-0 ${rule}`} />
      {children}
    </p>
  );
}

type PillTone = "line" | "glass" | "ink" | "accent" | "dark" | "rose";

const pillTones: Record<PillTone, string> = {
  line: "border border-line text-ink",
  glass: "border border-paper/25 bg-paper/10 text-paper backdrop-blur-md",
  ink: "bg-ink text-paper",
  accent: "bg-accent text-paper",
  dark: "border border-paper/12 text-paper/70",
  rose: "rose-plate text-ink shadow-[0_10px_26px_-14px_rgb(163_90_78/0.8)]",
};

export function Pill({
  children,
  tone = "line",
  className = "",
}: {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
}) {
  return (
    <span
      className={`eyebrow inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.56rem] tracking-[0.2em] ${pillTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** White glass card pinned over an image: a label, a figure, a note. */
export function FloatBadge({
  label,
  value,
  note,
  className = "",
}: {
  label: string;
  value: ReactNode;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={`corner-sm absolute bg-paper/92 px-5 py-4 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.45)] backdrop-blur-md ${className}`}
    >
      <p className="eyebrow text-[0.54rem] text-stone">{label}</p>
      <p className="numerals mt-1.5 text-[1.35rem] font-light leading-none text-accent">{value}</p>
      {note && <p className="mt-1.5 text-[0.72rem] text-stone">{note}</p>}
    </div>
  );
}

/** Viewfinder corner marks laid over a photo, echoing the film's HUD. */
export function FrameMarks({ className = "" }: { className?: string }) {
  const corner = "absolute size-5 border-paper/80";
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-4 md:inset-5 ${className}`}>
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
    </span>
  );
}

/** A live dot, for "status" style labels. */
export function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-1.5 rounded-full bg-current animate-[pulse-dot_1.8s_ease-in-out_infinite] ${className}`}
    />
  );
}

const icons = {
  louver: "M5 3v18M9 3v18M13 3v18M17 3v18M3 21h18",
  seam: "M7 3c0 5 10 4 10 9s-10 4-10 9",
  terrace: "M3 10h18M5 10v10M19 10v10M3 20h18M8 10V6h8v4",
  crown: "M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5",
  lift: "M6 3h12v18H6zM12 3v18M9 8l1.5-2L12 8M12 16l1.5 2L15 16",
  target: "M12 3v4M12 17v4M3 12h4M17 12h4M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  access: "M5 21V7l7-4 7 4v14M9 21v-6h6v6M12 10h.01",
  car: "M5 16h14M6 16l1.5-5h9L18 16M7 19v-3M17 19v-3M8.5 13.5h.01M15.5 13.5h.01",
  bolt: "M13 3L6 13h5l-1 8 7-10h-5l1-8z",
  floor: "M4 20V8l8-4 8 4v12M4 12h16M4 16h16",
  leaf: "M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l7-7",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zM9 12l2 2 4-4",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z",
  chart: "M4 20h16M7 16V11M12 16V6M17 16v-8",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7",
  brush: "M4 20c2 0 4-1 4-4l9-9-3-3-9 9c-3 0-4 2-4 4M14 4l6 6",
  key: "M8 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 11h10M18 11v3M21 11v2",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v5M16 3v5",
  tower: "M8 21V5l4-2 4 2v16M6 21h12M10 8h.01M14 8h.01M10 12h.01M14 12h.01M10 16h.01M14 16h.01",
  pin: "M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  metro:
    "M8 3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM5 10h14M8.5 13.5h.01M15.5 13.5h.01M8 17l-2.5 4M16 17l2.5 4",
  film: "M4 5h16v14H4zM4 9h16M4 15h16M8 5v4M12 5v4M16 5v4M8 15v4M12 15v4M16 15v4",
  passport: "M6 3h12v18H6zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 13.5c-.6 1-.6 2 0 3M9.5 17h5",
  family:
    "M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM16.5 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM3.5 21v-4a4.5 4.5 0 0 1 9 0v4M13.5 21v-3.5a3 3 0 0 1 6 0V21",
  renew: "M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4",
  bank: "M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20.5h18",
  download: "M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14",
} as const;

export type IconName = keyof typeof icons;

/** The WhatsApp glyph (filled, unlike the line icons above). */
export function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M16.04 3C8.86 3 3.03 8.83 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.96 12.96 0 0 0 16.04 29C23.2 29 29 23.17 29 16S23.2 3 16.04 3Zm0 23.6c-2 0-3.95-.54-5.65-1.56l-.4-.24-3.97 1.04 1.06-3.86-.26-.4A10.56 10.56 0 0 1 5.43 16c0-5.85 4.76-10.6 10.61-10.6 5.84 0 10.6 4.75 10.6 10.6 0 5.85-4.76 10.6-10.6 10.6Zm5.82-7.94c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.57 1.14 3.08 1.3 3.3.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name]} />
    </svg>
  );
}

/** Icon in a soft disc; recolours inside a card-fill on hover. */
export function IconDisc({
  name,
  dark = false,
  className = "",
}: {
  name: IconName;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span
      data-fill="icon"
      className={`grid size-12 shrink-0 place-items-center rounded-full border ${
        dark ? "border-paper/15 bg-paper/5 text-accent-soft" : "border-accent/15 bg-accent/8 text-accent"
      } ${className}`}
    >
      <Icon name={name} />
    </span>
  );
}

/** Infinite ticker strip between chapters. */
export function Marquee({
  items,
  tone = "ink",
  speed = 48,
}: {
  items: readonly string[];
  tone?: "ink" | "accent" | "soft";
  speed?: number;
}) {
  const tones = {
    ink: { bg: "bg-ink", text: "text-paper/70", star: "text-accent-bright", fade: "from-ink" },
    accent: { bg: "bg-accent", text: "text-paper/85", star: "text-accent-soft", fade: "from-accent" },
    soft: { bg: "bg-accent-soft", text: "text-ink/75", star: "text-accent", fade: "from-accent-soft" },
  }[tone];
  const run = (copy: number) => (
    <div className="flex shrink-0 items-center" aria-hidden={copy > 0 || undefined}>
      {items.map((item) => (
        <span key={`${copy}-${item}`} className="flex items-center">
          <span className={`eyebrow whitespace-nowrap px-6 text-[0.7rem] md:px-8 ${tones.text}`}>{item}</span>
          <span className={`text-[0.7rem] ${tones.star}`}>✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`relative overflow-hidden py-5 md:py-6 ${tones.bg}`}>
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 bg-gradient-to-r to-transparent md:w-28 ${tones.fade}`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l to-transparent md:w-28 ${tones.fade}`}
      />
      <div className="marquee-track" style={{ "--marquee-speed": `${speed}s` } as CSSProperties}>
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
