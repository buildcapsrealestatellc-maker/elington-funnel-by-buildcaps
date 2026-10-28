import "server-only";

import { createHash } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { sendLeadAlert } from "@/lib/email/send";
import type { LeadInput, scoreLead } from "./schema";

export type StoredLead = Omit<LeadInput, "company"> & {
  id: string;
  createdAt: string;
  score: ReturnType<typeof scoreLead>;
  ip?: string;
  userAgent?: string;
};

type SinkResult = { sink: string; ok: boolean; error?: string };

/** Generic CRM / automation webhook (HubSpot, Salesforce, Zapier, Make, n8n). */
async function webhookSink(lead: StoredLead): Promise<SinkResult | null> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(8000),
    });
    return { sink: "webhook", ok: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (e) {
    return { sink: "webhook", ok: false, error: String(e) };
  }
}

/** This funnel's slug in the shared Buildcaps Supabase (public.funnels). */
export const FUNNEL = process.env.FUNNEL_SLUG || "berkeley-tower";

/** IPs are stored only as a salted hash. */
function hashIp(ip?: string) {
  if (!ip) return null;
  return createHash("sha256")
    .update(`${process.env.LEAD_IP_SALT ?? ""}:${ip}`)
    .digest("hex");
}

/** The shared Buildcaps Supabase: one `leads` table, every row tagged with its funnel. */
async function supabaseSink(lead: StoredLead, ctx: DeliveryContext): Promise<SinkResult | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  const parsed = parsePhoneNumberFromString(lead.phone);
  const row = {
    id: lead.id,
    funnel: FUNNEL,
    created_at: lead.createdAt,
    full_name: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    country: parsed?.country ?? null,
    language: "en",
    offer: lead.offer ?? "access",
    source: lead.source,
    score: lead.score,
    consent: lead.consent === true,
    marketing_opt_in: lead.marketing === true,
    answers: {
      purpose: lead.purpose,
      size: lead.size,
      timeline: lead.timeline,
      contact_pref: lead.contactPref,
      unit: lead.unit,
    },
    attribution: lead.attribution ?? {},
    page_url: lead.attribution?.page ?? null,
    ip_hash: hashIp(lead.ip),
    user_agent: lead.userAgent ?? null,
    brochure_emailed: ctx.brochureEmailed ?? null,
  };
  try {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: { apikey: key, "content-type": "application/json", prefer: "return=minimal" },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(8000),
    });
    return {
      sink: "supabase",
      ok: res.ok,
      error: res.ok ? undefined : `HTTP ${res.status} ${(await res.text()).slice(0, 200)}`,
    };
  } catch (e) {
    return { sink: "supabase", ok: false, error: String(e) };
  }
}

/** The designed lead alert to the team inbox, via Resend (lib/email). */
async function emailSink(lead: StoredLead, ctx: DeliveryContext): Promise<SinkResult | null> {
  if (!process.env.RESEND_API_KEY) return null;
  const r = await sendLeadAlert(ctx.base, lead, ctx.brochureEmailed);
  return { sink: "email", ok: r.ok, error: r.error };
}

/** Local JSONL file, development only. */
async function fileSink(lead: StoredLead): Promise<SinkResult | null> {
  if (process.env.NODE_ENV === "production") return null;
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "leads.jsonl"), `${JSON.stringify(lead)}\n`, "utf8");
  return { sink: "file", ok: true };
}

/** What the alert email needs beyond the lead: absolute links and the brochure send. */
export type DeliveryContext = { base: string; brochureEmailed?: boolean };

export async function deliverLead(lead: StoredLead, ctx: DeliveryContext) {
  const results = (
    await Promise.all([supabaseSink(lead, ctx), webhookSink(lead), emailSink(lead, ctx), fileSink(lead)])
  ).filter((r): r is SinkResult => r !== null);
  for (const r of results) if (!r.ok) console.error(`[lead] ${r.sink} failed for ${lead.id}: ${r.error}`);
  return { delivered: results.some((r) => r.ok), results };
}

// Best-effort per-instance limiter; swap for Upstash in production (plan §9).
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

export async function verifyTurnstile(token: string | undefined, ip: string | undefined) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}
