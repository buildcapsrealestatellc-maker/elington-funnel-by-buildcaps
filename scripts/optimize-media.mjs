// Converts the raw images extracted from the Berkeley Tower brochure into
// web masters under src/assets/media (statically imported by next/image,
// which then serves AVIF/WebP at responsive widths).
//
// Usage: node scripts/optimize-media.mjs <extracted-dir>

import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAP = {
  // Exterior
  p06_x115: "tower-fog-dawn",
  p16_x352: "tower-dusk-metro",
  p13_x167: "tower-day-skyline",
  p22_x465: "tower-aerial-night",
  p07_x120: "tower-dusk-portrait",
  p02_x4: "terraces-night",
  p04_x46: "metro-station",
  p08_x125: "towers-looking-up",
  p14_x959: "location-model",
  // Arrival & interiors
  p24_x477: "drop-off-canopy",
  p25_x482: "lobby-reception",
  p05_x69: "office-interior",
  p47_x607: "office-empty-burj-view",
  // Technology & future
  p09_x130: "smart-access",
  p10_x135: "robotic-parking",
  p11_x149: "vertiport",
  p12_x154: "drone-terraces",
  // Amenities
  p32_x519: "clubhouse-terraces-night",
  p41_x575_alpha: "clubhouse-terraces-aerial",
  p33_x524: "rest-recharge",
  p34_x529: "coworking-lounge",
  p35_x545: "coworking-space",
  p36_x550: "coworking-sea-view",
  p37_x555: "terrace-view-night",
  p39_x565: "clubhouse",
  p40_x570: "games-room",
  p43_x587: "fitness-studio",
  p44_x592: "spinning-studio",
  p45_x597: "pilates-studio",
  // Plans
  p38_x560: "plan-l32",
  p42_x582_alpha: "plan-l33",
  p46_x602: "plan-l34",
  p48_x612: "plan-l35",
  p50_x620: "plan-low-8",
  p51_x625: "plan-low-4",
  p52_x630: "plan-low-3",
  p53_x635: "plan-low-2",
  p54_x640: "plan-high-4",
  p55_x645: "plan-high-3",
  p56_x650: "plan-high-2",
  p57_x655: "plan-high-1",
  p58_x660: "plan-duplex-l54",
  p59_x665: "plan-duplex-l55",
  p60_x670: "plan-triplex-l56",
  p61_x675: "plan-triplex-l57",
  p62_x680: "plan-triplex-l58",
  // Drawings
  p19_x412_alpha: "elevation-b",
  p21_x437_alpha: "architecture-model",
  p21_x457_alpha: "amenity-axonometric",
};

const src = process.argv[2];
if (!src) throw new Error("Pass the extracted-images directory");
const out = path.resolve("src/assets/media");
await mkdir(out, { recursive: true });

const files = await readdir(src);
let total = 0;
for (const [key, name] of Object.entries(MAP)) {
  const file = files.find((f) => f.startsWith(`${key}.`));
  if (!file) {
    console.warn(`missing ${key}`);
    continue;
  }
  const hasAlpha = key.endsWith("_alpha");
  const info = await sharp(path.join(src, file))
    .resize({ width: 2560, withoutEnlargement: true })
    .webp({ quality: hasAlpha ? 90 : 84, alphaQuality: 90, effort: 5 })
    .toFile(path.join(out, `${name}.webp`));
  total += info.size;
  console.log(`${name}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} kB`);
}
console.log(`total ${(total / 1024 / 1024).toFixed(1)} MB`);
