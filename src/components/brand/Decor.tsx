// Decorative, server-rendered SVG motifs drawn from the brochure:
// the wavy "fabric" hairlines in the page margins and the parametric
// line-art tower (the film's glowing façade drawings).

type WaveFieldProps = { className?: string; lines?: number; flip?: boolean };

/** Vertical hairlines that bow like draped fabric (brochure margins). */
export function WaveField({ className = "", lines = 22, flip = false }: WaveFieldProps) {
  const paths = Array.from({ length: lines }, (_, i) => {
    const t = i / (lines - 1);
    const x = 8 + t * 184;
    const amp = 6 + t * t * 34;
    const a = flip ? -amp : amp;
    return `M${x.toFixed(1)} 0 C${(x + a).toFixed(1)} 320 ${(x - a * 0.6).toFixed(1)} 680 ${(x + a * 0.25).toFixed(1)} 1000`;
  });
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 1000"
      preserveAspectRatio="none"
      className={`pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
    >
      {paths.map((d) => (
        <path key={d} d={d} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

const TOP = 34;
const BOTTOM = 986;
const LEFT = 22;
const RIGHT = 218;
const CORE = 16; // half-width of the terrace seam

/** Centre line of the façade seam: an S-curve, like elevation B. */
function seam(y: number) {
  const t = (y - TOP) / (BOTTOM - TOP);
  return 128 + 30 * Math.sin(Math.PI * 1.55 * t + 0.35) - 8 * Math.sin(Math.PI * 4 * t);
}

function louverPath(u: number, side: "left" | "right") {
  const pts: string[] = [];
  for (let s = 0; s <= 64; s++) {
    const y = TOP + ((BOTTOM - TOP) * s) / 64;
    const c = seam(y);
    const x = side === "left" ? LEFT + u * (c - CORE - LEFT) : c + CORE + u * (RIGHT - c - CORE);
    pts.push(`${s === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(1)}`);
  }
  return pts.join("");
}

export const towerGeometry = { TOP, BOTTOM, LEFT, RIGHT, seam };

type TowerLinesProps = { className?: string; louvers?: number };

/**
 * Parametric line drawing of Berkeley Tower: louvers flow around the
 * S-shaped terrace seam; one slab per floor; wider cantilevers at L32–35.
 * Paths carry data attributes so chapters can draw them with GSAP.
 */
export function TowerLines({ className = "", louvers = 15 }: TowerLinesProps) {
  const lefts = Array.from({ length: louvers }, (_, i) => louverPath(i / (louvers - 1), "left"));
  const rightCount = Math.round(louvers * 0.8);
  const rights = Array.from({ length: rightCount }, (_, i) => louverPath(i / (rightCount - 1), "right"));
  const slabs = Array.from({ length: 60 }, (_, f) => {
    const y = BOTTOM - ((BOTTOM - TOP - 30) * (f + 1)) / 60;
    const c = seam(y);
    const amenity = f + 1 >= 32 && f + 1 <= 35;
    const w = amenity ? CORE + 26 : CORE - 2;
    return { d: `M${(c - w).toFixed(1)} ${y.toFixed(1)}H${(c + w).toFixed(1)}`, amenity };
  });

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 1000"
      className={`overflow-visible ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <g data-outline="">
        <path d={`M${LEFT} ${BOTTOM}V${TOP}H${RIGHT}V${BOTTOM}`} strokeWidth={1.1} vectorEffect="non-scaling-stroke" />
        <path d={`M${LEFT - 6} ${BOTTOM}H${RIGHT + 6}`} strokeWidth={1.1} vectorEffect="non-scaling-stroke" />
        <path
          d={`M${LEFT + 18} ${TOP}V${TOP - 22}H${RIGHT - 18}V${TOP}`}
          strokeWidth={0.8}
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <g data-louvers="">
        {[...lefts, ...rights].map((d) => (
          <path key={d} d={d} strokeWidth={0.75} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g data-slabs="">
        {slabs.map(({ d, amenity }) => (
          <path
            key={d}
            d={d}
            strokeWidth={amenity ? 1.6 : 0.9}
            vectorEffect="non-scaling-stroke"
            className={amenity ? "text-accent" : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
