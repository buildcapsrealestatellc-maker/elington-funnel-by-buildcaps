import { broker } from "@/lib/data/broker";
import { sendBrochureEmail } from "@/lib/email/send";
import { leadSchema, scoreLead } from "@/lib/lead/schema";
import { deliverLead, rateLimited, type StoredLead, verifyTurnstile } from "@/lib/lead/server";
import { siteUrl } from "@/lib/site";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  if (rateLimited(ip ?? "unknown")) {
    return Response.json({ ok: false, error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form" },
      { status: 422 },
    );
  }

  const { company, ...lead } = parsed.data;
  const id = crypto.randomUUID();
  // Honeypot: pretend success so bots learn nothing.
  if (company) return Response.json({ ok: true, id });

  const token = (body as { turnstileToken?: string }).turnstileToken;
  if (!(await verifyTurnstile(token, ip))) {
    return Response.json({ ok: false, error: "Verification failed. Please refresh and try again." }, { status: 403 });
  }

  const stored: StoredLead = {
    ...lead,
    id,
    createdAt: new Date().toISOString(),
    score: scoreLead(parsed.data),
    ip,
    userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? undefined,
  };

  // The brochure goes first, so the team's alert can say whether it arrived.
  const base = siteBase(request);
  const emailed = (await sendBrochureEmail(base, stored)).ok;
  const { delivered } = await deliverLead(stored, { base, brochureEmailed: emailed });
  if (!delivered) {
    console.error(`[lead] no sink accepted lead ${id}`);
    return Response.json(
      { ok: false, error: `We couldn't save your request. Please call or WhatsApp ${broker.phone}, or try again.` },
      { status: 502 },
    );
  }
  return Response.json({ ok: true, id, emailed });
}

/**
 * Absolute origin for the links and images in emails. Production always uses
 * the site's own address, never the Host header, so a forged request can't
 * plant another domain's links in an email we send. Development uses localhost.
 */
function siteBase(request: Request) {
  return process.env.NODE_ENV === "production" ? siteUrl : new URL(request.url).origin;
}
