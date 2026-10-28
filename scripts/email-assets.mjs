// Builds the images the emails link to, in public/email/. Email clients need
// absolute-URL PNG, JPEG or GIF (no WebP, SVG or CSS animation in Gmail), so
// the logos are rasterised from the site's own vectors and the motion is an
// animated GIF of the funnel's lift ride: the floor counter ticks 00 → 60,
// then the doors part on the tower at dusk. Outlook shows only the first
// frame, the closed doors, which still reads as a designed cover.
//
// Usage: node scripts/email-assets.mjs   (Windows fonts: Segoe UI Light, Bahnschrift)

import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "email");
const MEDIA = path.join(ROOT, "src", "assets", "media");
const FONTS = process.env.WINDIR ? path.join(process.env.WINDIR, "Fonts") : "C:/Windows/Fonts";

const INK = "#0d0d0f";
const PAPER = "#ffffff";
const MIST = "#f3f4f6";
const STONE = "#6b6e76";
const ACCENT = "#2d45ff";

await mkdir(OUT, { recursive: true });

/* ─── Logos: the same paths as components/brand/logos.tsx ─── */
const logosSrc = await readFile(path.join(ROOT, "src", "components", "brand", "logos.tsx"), "utf8");

function logo(name) {
  const block = logosSrc.match(new RegExp(`export function ${name}\\b[\\s\\S]*?</svg>`));
  if (!block) throw new Error(`Logo ${name} not found`);
  const viewBox = block[0].match(/viewBox="([^"]+)"/)[1];
  const paths = [...block[0].matchAll(/\bd="([^"]+)"/g)].map((m) => m[1]);
  return (fill) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="${fill}">${paths
      .map((d) => `<path fill-rule="nonzero" d="${d}"/>`)
      .join("")}</svg>`;
}

async function png(svg, height, file) {
  await sharp(Buffer.from(svg), { density: 600 })
    .resize({ height })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, file));
  console.log("✓", file);
}

const lockup = logo("BerkeleyLockup");
const mark = logo("BerkeleyMark");
const ellington = logo("EllingtonLogo");
// Rendered at 2× their display size for retina screens.
await png(lockup(INK), 112, "berkeley-lockup-ink.png");
await png(lockup(PAPER), 112, "berkeley-lockup-white.png");
await png(mark(PAPER), 64, "berkeley-mark-white.png");
await png(ellington(PAPER), 64, "ellington-white.png");

await sharp(path.join(ROOT, "src", "assets", "brand", "buildcaps-mark.webp"))
  .resize(96, 96)
  .png({ compressionLevel: 9 })
  .toFile(path.join(OUT, "buildcaps-mark.png"));
console.log("✓ buildcaps-mark.png");

/* ─── Photo tiles (2× their 280 × 210 slot) ─── */
const tiles = [
  ["office-empty-burj-view.webp", "tile-office.jpg", "centre"],
  ["clubhouse-terraces-night.webp", "tile-terraces.jpg", "centre"],
  ["tower-dusk-portrait.webp", "tile-tower.jpg", "north"],
];
for (const [src, file, position] of tiles) {
  await sharp(path.join(MEDIA, src))
    .resize(560, 420, { fit: "cover", position })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(path.join(OUT, file));
  console.log("✓", file);
}

/* ─── Hero GIF: the lift ride, as on the thank-you page ─── */
const W = 600;
const H = 440;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Text as a transparent PNG (Pango markup; size in px at 72 dpi). */
const text = (markup, font, file) =>
  sharp({ text: { text: markup, font, fontfile: path.join(FONTS, file), rgba: true, dpi: 72 } })
    .png()
    .toBuffer({ resolveWithObject: true });
const eyebrow = (label, color) =>
  text(`<span foreground="${color}" letter_spacing="3600">${label}</span>`, "Bahnschrift 13", "bahnschrift.ttf");

// The view the doors open onto: the tower at dusk beside the Burj and the Metro,
// with a low fade for the caption.
const caption = await eyebrow("LEVEL 60 · BUSINESS BAY", PAPER);
const view = await sharp(path.join(MEDIA, "tower-dusk-metro.webp"))
  .resize(W, H, { fit: "cover", position: "centre" })
  .composite([
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="${INK}" stop-opacity="0"/><stop offset="1" stop-color="${INK}" stop-opacity="0.7"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`,
      ),
    },
    { input: caption.data, left: 32, top: H - 32 - caption.info.height },
  ])
  .png()
  .toBuffer();

// One door: mist, with the hairlines that bow like draped fabric and the seam.
const door = (side) => {
  const lines = Array.from({ length: 8 }, (_, i) => {
    const x = 26 + i * 36;
    const bow = (i % 2 ? 1 : -1) * (6 + (i % 3) * 3);
    return `<path d="M${x} -10 C${x + bow} ${H * 0.3}, ${x - bow} ${H * 0.7}, ${x} ${H + 10}" fill="none" stroke="${INK}" stroke-opacity="0.07" stroke-width="1"/>`;
  }).join("");
  const seamX = side === "l" ? W / 2 - 0.5 : 0.5;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W / 2}" height="${H}"><rect width="${W / 2}" height="${H}" fill="${MIST}"/>${lines}<line x1="${seamX}" y1="0" x2="${seamX}" y2="${H}" stroke="${INK}" stroke-opacity="0.15"/></svg>`,
  );
};
const doorL = await sharp(door("l")).png().toBuffer();
const doorR = await sharp(door("r")).png().toBuffer();

/** `hex` faded toward the door colour; a fade on mist without alpha tricks. */
const fade = (hex, a) =>
  `#${[0, 1, 2]
    .map((i) => {
      const c = (h) => Number.parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
      return Math.round(c(hex) * a + c(MIST) * (1 - a))
        .toString(16)
        .padStart(2, "0");
    })
    .join("")}`;

const cache = new Map();
const once = (key, make) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
};
const centred = (img, top) => ({ input: img.data, left: Math.round((W - img.info.width) / 2), top });

/** The lift readout, as on the thank-you page: label, floor, building. */
async function readout(floor, alpha) {
  const n = String(floor).padStart(2, "0");
  const [up, num, name] = await Promise.all([
    once(`up${alpha}`, () => eyebrow("GOING UP", fade(STONE, alpha))),
    once(`n${n}${alpha}`, () =>
      text(`<span foreground="${fade(INK, alpha)}">${n}</span>`, "Segoe UI Light 104", "segoeuil.ttf"),
    ),
    once(`bt${alpha}`, () => eyebrow("BERKELEY TOWER", fade(ACCENT, alpha))),
  ]);
  return [centred(up, 118), centred(num, 150), centred(name, 282)];
}

/** A frame: doors `open` (0 shut … 1 gone), the readout at `alpha` showing `floor`. */
async function frame(open, floor, alpha) {
  const shift = Math.round(ease(open) * (W / 2));
  const layers = [];
  if (shift < W / 2) {
    // Each door slides out of frame, so draw only the part still in view.
    const w = W / 2 - shift;
    layers.push(
      { input: await sharp(doorL).extract({ left: shift, top: 0, width: w, height: H }).toBuffer(), left: 0, top: 0 },
      {
        input: await sharp(doorR).extract({ left: 0, top: 0, width: w, height: H }).toBuffer(),
        left: W / 2 + shift,
        top: 0,
      },
    );
  }
  if (alpha > 0) layers.push(...(await readout(floor, alpha)));
  return sharp(view).composite(layers).png().toBuffer();
}

const frames = [];
const delays = [];
const add = async (ms, ...args) => {
  frames.push(await frame(...args));
  delays.push(ms);
};

await add(700, 0, 0, 1); // doors closed at the ground floor
let last = 0;
for (let i = 1; i <= 18; i++) {
  const floor = Math.round(ease(i / 18) * 60);
  if (floor !== last) await add(70, 0, floor, 1);
  last = floor;
}
delays[delays.length - 1] = 520; // hold on 60
await add(70, 0, 60, 0.55);
await add(70, 0, 60, 0.15);
for (let i = 1; i <= 13; i++) await add(50, i / 13, 60, 0);
delays[delays.length - 1] = 60_000; // then rest on the view

await sharp(frames, { join: { animated: true } })
  .gif({ delay: delays, loop: 1, colours: 256, dither: 0.7, effort: 10, interFrameMaxError: 6, reuse: true })
  .toFile(path.join(OUT, "hero.gif"));
console.log(`✓ hero.gif (${frames.length} frames)`);

// The last frame as a still, for clients that block GIFs and for the preview.
await sharp(view).jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(path.join(OUT, "hero-view.jpg"));
console.log("✓ hero-view.jpg");

/* ─── Share image (WhatsApp, LinkedIn, Google): app/opengraph-image.jpg ─── */
{
  const OW = 1200;
  const OH = 630;
  const lock = await sharp(Buffer.from(lockup(PAPER)), { density: 600 })
    .resize({ height: 132 })
    .png()
    .toBuffer();
  const line = await text(
    `<span foreground="${PAPER}" letter_spacing="5200">GRADE A OFFICES  ·  BUSINESS BAY  ·  DUBAI</span>`,
    "Bahnschrift 20",
    "bahnschrift.ttf",
  );
  const pillText = await text(
    `<span foreground="${PAPER}" letter_spacing="4200">★  10-YEAR GOLDEN VISA ROUTE</span>`,
    "Bahnschrift SemiBold 17",
    "bahnschrift.ttf",
  );
  const pw = pillText.info.width + 56;
  const ph = 50;
  const pill = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><rect width="${pw}" height="${ph}" rx="${ph / 2}" fill="${ACCENT}"/></svg>`,
    ),
  )
    .composite([{ input: pillText.data, left: 28, top: Math.round((ph - pillText.info.height) / 2) }])
    .png()
    .toBuffer();
  const shade = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OW}" height="${OH}"><defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${INK}" stop-opacity="0.82"/><stop offset="0.55" stop-color="${INK}" stop-opacity="0.25"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient></defs><rect width="${OW}" height="${OH}" fill="url(#s)"/></svg>`,
  );
  const lockMeta = await sharp(lock).metadata();
  await sharp(path.join(MEDIA, "tower-dusk-metro.webp"))
    .resize(OW, OH, { fit: "cover", position: "centre" })
    .composite([
      { input: shade },
      { input: lock, left: 72, top: 150 },
      { input: line.data, left: 72, top: 150 + lockMeta.height + 40 },
      { input: pill, left: 72, top: 150 + lockMeta.height + 40 + line.info.height + 34 },
    ])
    .jpeg({ quality: 84, mozjpeg: true, progressive: true })
    .toFile(path.join(ROOT, "src", "app", "opengraph-image.jpg"));
  console.log("✓ app/opengraph-image.jpg");
}
