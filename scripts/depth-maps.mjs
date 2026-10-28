// Generates depth maps for the cinematic shots with Depth Anything V2
// (transformers.js, runs locally on CPU). Brighter = closer to camera.
// Usage: node scripts/depth-maps.mjs [name ...]   (defaults to every shot)

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { env, pipeline, RawImage } from "@huggingface/transformers";
import sharp from "sharp";

const SHOTS = [
  "tower-fog-dawn",
  "drop-off-canopy",
  "lobby-reception",
  "terraces-night",
  "tower-day-skyline",
  "towers-looking-up",
  "clubhouse-terraces-night",
  "pilates-studio",
  "robotic-parking",
  "terrace-view-night",
  "vertiport",
  "tower-dusk-metro",
];

env.cacheDir = path.resolve(".cache/models");
const names = process.argv.slice(2).length ? process.argv.slice(2) : SHOTS;
const src = path.resolve("src/assets/media");
const out = path.resolve("src/assets/depth");
await mkdir(out, { recursive: true });

console.log("loading model…");
const estimate = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", { dtype: "fp32" });

for (const name of names) {
  const t0 = Date.now();
  const image = await RawImage.read(path.join(src, `${name}.webp`));
  const { depth } = await estimate(image);
  const { width, height } = image;
  await sharp(Buffer.from(depth.data), { raw: { width: depth.width, height: depth.height, channels: depth.channels } })
    .resize({ width: Math.min(1280, width), height: Math.round((Math.min(1280, width) * height) / width), fit: "fill" })
    .normalise()
    .blur(2.2)
    .toColourspace("b-w")
    .webp({ quality: 88 })
    .toFile(path.join(out, `${name}.webp`));
  console.log(`${name}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
console.log("done");
