import { Icon, LiveDot } from "@/components/ui/Kit";

/**
 * The opening shot's headline, set like a station sign: a rose-gold roundel
 * and polished rose-gold type on an ink plate, so the Metro is the first
 * thing read after the name.
 */
export function MetroSign() {
  return (
    <div className="corner-sm inline-flex max-w-full items-stretch overflow-hidden bg-ink text-paper shadow-[0_30px_60px_-26px_rgb(13_13_15/0.8)] ring-1 ring-rose/35">
      <span className="rose-plate grid w-14 shrink-0 place-items-center text-ink md:w-[4.75rem]">
        <Icon name="metro" className="size-6 md:size-8" />
      </span>
      <span className="flex min-w-0 flex-col justify-center gap-2 px-5 py-3.5 md:gap-2.5 md:px-7 md:py-5">
        <span className="eyebrow flex items-center gap-2 text-[0.5rem] text-rose-bright md:text-[0.56rem]">
          <LiveDot />
          Business Bay Station · Red Line<span className="max-sm:hidden"> · Next door</span>
        </span>
        <span className="display rose-metal text-[clamp(1.05rem,2.3vw,2.25rem)] font-normal leading-[1.05]">
          The iconic tower
          <br />
          next to the Metro
        </span>
      </span>
    </div>
  );
}
