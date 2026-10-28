"use client";

import { Mesh, Program, Renderer, Texture, Triangle, Vec2 } from "ogl";
import { type RefObject, useEffect, useRef } from "react";
import type { CamKey } from "@/lib/data/shots";
import { prefersReducedMotion } from "@/lib/motion/gsap";

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// A virtual camera over a photograph + its depth map: depth-weighted dolly
// (near things grow faster), truck/crane parallax around the focus plane,
// roll, rack-focus depth of field, then a light film grade.
const fragment = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform sampler2D tDepth;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uFrame;
uniform vec3 uCam;
uniform float uRoll;
uniform float uFocus;
uniform float uDof;
uniform float uTime;
uniform float uOver;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

vec2 camUv(vec2 uv, vec2 center, float d) {
  float dz = 1.0 + uCam.z * (0.25 + 0.75 * d);
  vec2 p = (uv - center) / dz + center;
  p -= uCam.xy * (d - uFocus) * vec2(0.085, 0.075);
  p -= uCam.xy * vec2(0.03, 0.028);
  return clamp(p, 0.001, 0.999);
}

void main() {
  float rs = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 scale = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  scale /= uOver; // overscan: room for the camera to move
  vec2 uv = vUv * scale + (1.0 - scale) * uFrame;
  vec2 center = (1.0 - scale) * uFrame + 0.5 * scale;

  // Roll around the centre of frame, aspect-correct.
  vec2 r = uv - center;
  r.x *= ri;
  float c = cos(uRoll), s = sin(uRoll);
  r = mat2(c, -s, s, c) * r;
  r.x /= ri;
  uv = center + r;

  // Two-step depth lookup keeps edges stable while dollying.
  float d = texture2D(tDepth, uv).r;
  vec2 p = camUv(uv, center, d);
  d = texture2D(tDepth, p).r;
  p = camUv(uv, center, d);

  vec3 col = texture2D(tMap, p).rgb;

  if (uDof > 0.001) {
    float coc = clamp(abs(d - uFocus) * uDof, 0.0, 1.0) * 0.0045;
    vec3 acc = col;
    acc += texture2D(tMap, p + vec2(coc, 0.0)).rgb;
    acc += texture2D(tMap, p - vec2(coc, 0.0)).rgb;
    acc += texture2D(tMap, p + vec2(0.0, coc * rs)).rgb;
    acc += texture2D(tMap, p - vec2(0.0, coc * rs)).rgb;
    acc += texture2D(tMap, p + vec2(coc, coc * rs) * 0.7).rgb;
    acc += texture2D(tMap, p - vec2(coc, coc * rs) * 0.7).rgb;
    col = acc / 7.0;
  }

  // Grade: gentle contrast, vignette, grain.
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.18);
  vec2 q = (vUv - 0.5) * vec2(rs, 1.0);
  col *= mix(0.78, 1.0, smoothstep(1.05, 0.25, length(q)));
  col += (hash(vUv * uRes + fract(uTime * 7.0) * 113.0) - 0.5) * 0.035;

  gl_FragColor = vec4(col, 1.0);
}
`;

type ShotCanvasProps = {
  image: { src: string; width: number; height: number };
  depth: string;
  frame: [number, number];
  cam: RefObject<CamKey>;
  /** Added on top of `cam` (used by the opening move). */
  offset?: RefObject<CamKey>;
  onReady?: () => void;
};

/**
 * One WebGL context per shot, created only while the shot is near the
 * viewport and rendering only while it is on screen.
 */
export function ShotCanvas({ image, depth, frame, cam, offset, onReady }: ShotCanvasProps) {
  const host = useRef<HTMLDivElement>(null);
  const ready = useRef(onReady);
  ready.current = onReady;
  const [fx, fy] = frame;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      ready.current?.();
      return;
    }

    let teardown: (() => void) | null = null;

    const mount = () => {
      let renderer: Renderer;
      try {
        renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.5), alpha: false, antialias: false });
      } catch {
        ready.current?.();
        return null;
      }
      const gl = renderer.gl;
      const canvas = gl.canvas as HTMLCanvasElement;
      Object.assign(canvas.style, { width: "100%", height: "100%", opacity: "0", transition: "opacity 400ms linear" });
      el.appendChild(canvas);

      const tMap = new Texture(gl, { generateMipmaps: false });
      const tDepth = new Texture(gl, { generateMipmaps: false });
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          tMap: { value: tMap },
          tDepth: { value: tDepth },
          uRes: { value: new Vec2(1, 1) },
          uImg: { value: new Vec2(image.width, image.height) },
          uFrame: { value: new Vec2(fx, 1 - fy) },
          uCam: { value: [0, 0, 0] },
          uRoll: { value: 0 },
          uFocus: { value: 0.7 },
          uDof: { value: 0 },
          uTime: { value: 0 },
          uOver: { value: 1.2 },
        },
      });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      let loaded = 0;
      let portrait = false;
      const load = (src: string, tex: Texture) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          tex.image = img;
          loaded++;
          if (loaded === 2) {
            canvas.style.opacity = "1";
            ready.current?.();
          }
        };
        img.onerror = () => ready.current?.();
        img.src = src;
      };
      load(image.src, tMap);
      load(depth, tDepth);

      const resize = () => {
        const { width: w, height: h } = el.getBoundingClientRect();
        renderer.setSize(w, h);
        program.uniforms.uRes.value.set(w * renderer.dpr, h * renderer.dpr);
        // Portrait screens see a narrow slice of a landscape render: less
        // overscan and gentler camera travel keep the frame sharp.
        portrait = w / h < 0.9;
        program.uniforms.uOver.value = portrait ? 1.08 : 1.2;
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      let onScreen = false;
      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
      });
      io.observe(el);

      let raf = 0;
      const t0 = performance.now();
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!onScreen || loaded < 2) return;
        const c = cam.current;
        const o = offset?.current;
        const t = (now - t0) / 1000;
        const amp = portrait ? 0.55 : 1;
        // A slow floating drift keeps the frame alive between scrolls.
        const dx = Math.sin(t * 0.31) * 0.06 + Math.sin(t * 0.13) * 0.04;
        const dy = Math.cos(t * 0.23) * 0.05;
        const u = program.uniforms;
        u.uCam.value = [
          (c.x + (o?.x ?? 0) + dx) * amp,
          (c.y + (o?.y ?? 0) + dy) * amp,
          Math.max(0, c.z + (o?.z ?? 0)) * amp,
        ];
        u.uRoll.value = c.roll + (o?.roll ?? 0) + Math.sin(t * 0.17) * 0.002;
        u.uFocus.value = c.focus;
        u.uDof.value = Math.max(0, c.dof + (o?.dof ?? 0));
        u.uTime.value = t;
        renderer.render({ scene: mesh });
      };
      raf = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
      };
    };

    // Keep at most a couple of live contexts: mount near the viewport only.
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !teardown) teardown = mount();
        else if (!e.isIntersecting && teardown) {
          teardown();
          teardown = null;
        }
      },
      { rootMargin: "120% 0px" },
    );
    near.observe(el);

    return () => {
      near.disconnect();
      teardown?.();
    };
  }, [image.src, image.width, image.height, depth, fx, fy, cam, offset]);

  return <div ref={host} aria-hidden="true" className="absolute inset-0 [&>canvas]:block" />;
}
