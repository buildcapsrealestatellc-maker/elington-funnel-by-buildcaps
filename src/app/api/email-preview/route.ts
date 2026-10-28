import { brochureEmail, type EmailLead, leadAlertEmail } from "@/lib/email/templates";

// Development only: renders the emails in the browser for design review.
//   /api/email-preview?type=brochure   the lead's brochure email
//   /api/email-preview?type=lead       the team's lead alert
//   &format=text                       the plain-text version

const sample: EmailLead = {
  id: "preview-0000-0000",
  createdAt: new Date().toISOString(),
  score: "hot",
  fullName: "Sara Al Mansoori",
  phone: "+971501234567",
  email: "sara@example.com",
  offer: "brochure",
  purpose: "both",
  size: "1,500 – 3,000 sq ft",
  timeline: "At launch",
  contactPref: "whatsapp",
  marketing: true,
  source: "popup",
  attribution: {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "berkeley-tower-launch",
    utm_term: "grade a offices business bay",
    gclid: "preview",
    first_utm_source: "google",
    first_utm_campaign: "berkeley-tower-launch",
    page: "https://www.example.com/?utm_source=google",
  },
  ip: "203.0.113.24",
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
};

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const url = new URL(request.url);
  const base = url.origin;
  const m =
    url.searchParams.get("type") === "lead"
      ? leadAlertEmail({ base, lead: sample, brochureEmailed: true })
      : brochureEmail({ base, lead: sample });
  if (url.searchParams.get("format") === "text") {
    return new Response(`Subject: ${m.subject}\nPreheader: ${m.preheader}\n\n${m.text}`, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(m.html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
