"use client";

// Captures ad click IDs and UTMs so every lead carries its source to the CRM
// and to server-side conversion APIs (plan §2.2).

const KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "campaign_id",
  "adgroup_id",
  "keyword",
  "match_type",
  "device",
  "gclid",
  "gbraid",
  "wbraid",
  "gad_campaignid",
  "fbclid",
  "ttclid",
  "li_fat_id",
  "msclkid",
] as const;

const FIRST = "bt-attr-first";
const LAST = "bt-attr-last";

type Attr = Record<string, string>;

function read(key: string): Attr | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Attr) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: Attr) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const touch: Attr = {};
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) touch[k] = v.slice(0, 400);
  }
  const hasClick = Object.keys(touch).length > 0;
  const stamp = {
    landing: window.location.pathname,
    referrer: document.referrer.slice(0, 400),
    at: new Date().toISOString(),
  };
  if (!read(FIRST)) write(FIRST, { ...touch, ...stamp });
  if (hasClick || !read(LAST)) write(LAST, { ...touch, ...stamp });
}

export function getAttribution(): Attr {
  const first = read(FIRST) ?? {};
  const last = read(LAST) ?? {};
  const out: Attr = {};
  for (const [k, v] of Object.entries(first)) out[`first_${k}`] = v;
  for (const [k, v] of Object.entries(last)) out[k] = v;
  out.page = window.location.href.slice(0, 400);
  return out;
}
