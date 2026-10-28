import Image from "next/image";
import { BerkeleyLockup, EllingtonLogo } from "@/components/brand/logos";
import { media } from "@/lib/media";

/**
 * The brochure as a physical object: Ellington's night-terraces cover in
 * monochrome, turned slightly on its spine, with page edges behind it.
 */
export function BrochureCover({ className = "", sizes = "14rem" }: { className?: string; sizes?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative aspect-[3/4] [container-type:inline-size] [perspective:900px] ${className}`}
    >
      <span className="absolute inset-y-[4%] left-[8%] right-[-7%] rounded-r-md bg-paper shadow-[0_18px_40px_-20px_rgb(0_0_0/0.5)]" />
      <span className="absolute inset-y-[2%] left-[5%] right-[-3.5%] rounded-r-md border-r border-ink/10 bg-mist" />
      <div className="absolute inset-0 origin-left overflow-hidden rounded-r-md rounded-l-[3px] bg-ink shadow-[0_30px_60px_-24px_rgb(0_0_0/0.65)] [transform:rotateY(-12deg)]">
        <Image
          src={media["terraces-night"]}
          alt=""
          fill
          sizes={sizes}
          className="object-cover object-[72%_50%] grayscale"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-ink/5" />
        <span className="absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-black/60 to-transparent" />
        <span className="absolute inset-y-0 left-[6%] w-px bg-paper/15" />
        <EllingtonLogo className="absolute left-[14%] top-[9%] h-[9%] w-auto text-paper/85" />
        <BerkeleyLockup className="absolute left-[14%] top-1/2 h-[24%] w-auto -translate-y-1/2 text-paper" />
        {/* Sized to the cover, so it reads as print at any size and never clips. */}
        <span className="absolute bottom-[8%] left-[14%] whitespace-nowrap font-display text-[min(5.5cqw,0.5rem)] uppercase tracking-[0.25em] text-paper/80">
          Project brief
        </span>
      </div>
    </div>
  );
}
