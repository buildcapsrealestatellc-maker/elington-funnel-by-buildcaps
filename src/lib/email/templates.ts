// The two emails every form fill sends, as table-based HTML that survives
// Gmail, Outlook and Apple Mail, plus a plain-text twin for each.
// Design follows the site: white, ink and electric blue, uppercase expanded
// display type (Archivo where web fonts load, Helvetica/Arial elsewhere), the
// corner signature (one square corner), and the lift-ride GIF as the hero.
// Motion: the hero GIF everywhere; a soft rise-in and a pulsing download
// button where the client runs CSS animation (Apple Mail, iOS), ignored safely
// elsewhere. Pure functions: no server or browser APIs.

import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { broker, mapsLink, phoneHref, whatsappLink } from "@/lib/data/broker";
import { brochure, driveTimes, goldenVisa, paymentPlan, project } from "@/lib/data/tower";
import { type LeadInput, purposes } from "@/lib/lead/schema";

/* ─── Tokens ─── */
const C = {
  ink: "#0d0d0f",
  graphite: "#1a1a1d",
  paper: "#ffffff",
  mist: "#f3f4f6",
  /** Behind the card: a shade deeper than mist, so the mist lift doors keep an edge. */
  page: "#e6e7eb",
  stone: "#6b6e76",
  line: "#e3e4e8",
  accent: "#2d45ff",
  accentDeep: "#1b2ccc",
  accentBright: "#7b8bff",
  accentSoft: "#e6e9ff",
  whatsapp: "#25d366",
} as const;
const DISPLAY = "Archivo,'Helvetica Neue',Helvetica,Arial,sans-serif";
const BODY = "Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
/** The site's corner signature: every corner round except the top right. */
const CORNER = "28px 0 28px 28px";

export type Rendered = { subject: string; preheader: string; html: string; text: string };

export type EmailLead = Omit<LeadInput, "company" | "consent"> & {
  id: string;
  createdAt: string;
  score: "hot" | "warm" | "cool";
  ip?: string;
  userAgent?: string;
};

/* ─── Helpers ─── */
export const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const firstName = (full: string) => full.trim().split(/\s+/)[0] ?? "";
const absolute = (base: string, href: string) => (/^https?:\/\//.test(href) ? href : `${base}${href}`);
const img = (base: string, file: string) => `${base}/email/${file}`;

const eyebrow = (label: string, color: string = C.stone, extra = "") =>
  `<p style="margin:0;font:600 11px/1.4 ${DISPLAY};letter-spacing:0.24em;text-transform:uppercase;font-stretch:125%;color:${color};${extra}">${label}</p>`;

/** A pill button that holds up in every client (no images, no VML). */
function button(href: string, label: string, opts: { bg: string; color: string; border?: string; cls?: string }) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate"><tr><td class="${opts.cls ?? ""}" bgcolor="${opts.bg}" style="border-radius:999px;background:${opts.bg};${opts.border ? `border:1px solid ${opts.border};` : ""}">
<a class="btn" href="${esc(href)}" target="_blank" style="display:inline-block;padding:16px 28px;font:600 12px/1 ${DISPLAY};letter-spacing:0.2em;text-transform:uppercase;font-stretch:112%;white-space:nowrap;color:${opts.color};text-decoration:none;border-radius:999px">${label}</a>
</td></tr></table>`;
}

/** The outer shell: fonts, mobile rules, the motion layer and the preheader. */
function shell(title: string, preheader: string, body: string) {
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112..125,400..700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{color-scheme:light only;supported-color-schemes:light only}
body{margin:0;padding:0;width:100%!important;background:${C.page};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table{border-collapse:collapse}
img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}
a{color:${C.accent}}
@media (prefers-reduced-motion:no-preference){
  .rise{animation:bt-rise .9s cubic-bezier(.22,1,.36,1) both}
  .rise-2{animation-delay:.15s}.rise-3{animation-delay:.3s}
  .pulse{animation:bt-pulse 2.6s ease-in-out 1.2s infinite}
}
@keyframes bt-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes bt-pulse{0%,100%{box-shadow:0 0 0 0 rgba(45,69,255,.45)}50%{box-shadow:0 0 0 12px rgba(45,69,255,0)}}
@media only screen and (max-width:620px){
  .container{width:100%!important}
  .px{padding-left:24px!important;padding-right:24px!important}
  .stack{display:block!important;width:100%!important;max-width:100%!important}
  .stack-gap{padding:0 0 16px!important}
  .h1{font-size:28px!important}
  .h2{font-size:21px!important}
  .stat{font-size:28px!important}
  .hide-sm{display:none!important}
  .btn{padding:15px 20px!important;letter-spacing:0.14em!important}
  .full-sm{width:100%!important;max-width:100%!important}
}
</style>
<!--[if mso]><style>body,table,td,p,a{font-family:Arial,Helvetica,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${C.page}">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.page}">${esc(preheader)}${"&nbsp;&zwnj;".repeat(60)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page}">
<tr><td align="center" style="padding:28px 12px 40px">
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px">
${body}
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Footer shared by both emails: the brokerage, as in the site footer. */
function footer(base: string, note: string) {
  return `<tr><td style="padding:16px 0 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.ink}" style="background:${C.ink};border-radius:${CORNER}">
<tr><td class="px" style="padding:36px 40px 32px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td class="stack stack-gap" valign="top" style="padding:0 24px 0 0">
      <img src="${img(base, "berkeley-lockup-white.png")}" height="44" alt="Berkeley Tower" style="display:block;height:44px;width:auto">
      <p style="margin:16px 0 0;font:400 13px/1.6 ${BODY};color:rgba(255,255,255,0.55)">Grade A freehold offices on Sheikh Zayed Road, beside Business Bay Metro.</p>
    </td>
    <td class="stack" valign="top" width="250" style="width:250px">
      ${eyebrow("Presented by", "rgba(255,255,255,0.4)")}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px"><tr>
        <td valign="middle" style="padding:0 12px 0 0"><img src="${img(base, "buildcaps-mark.png")}" width="40" height="40" alt="" style="display:block;width:40px;height:40px"></td>
        <td valign="middle" style="font:600 13px/1.4 ${DISPLAY};letter-spacing:0.06em;text-transform:uppercase;font-stretch:112%;color:${C.paper}">${esc(broker.name)}</td>
      </tr></table>
      <p style="margin:14px 0 0;font:400 13px/1.7 ${BODY};color:rgba(255,255,255,0.7)">
        <a href="${phoneHref}" style="color:${C.paper};text-decoration:none">${esc(broker.phone)}</a><br>
        <a href="mailto:${esc(broker.email)}" style="color:${C.accentBright};text-decoration:none">${esc(broker.email)}</a><br>
        <a href="${mapsLink}" target="_blank" style="color:rgba(255,255,255,0.55);text-decoration:none">${esc(broker.address)}</a>
      </p>
    </td>
  </tr></table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-top:1px solid rgba(255,255,255,0.12)"><tr>
    <td style="padding:20px 0 0;font:400 11px/1.65 ${BODY};color:rgba(255,255,255,0.45)">${note}</td>
    <td class="hide-sm" valign="bottom" align="right" style="padding:20px 0 0 20px;white-space:nowrap">
      <span style="font:400 11px/1 ${BODY};color:rgba(255,255,255,0.45);vertical-align:middle">Developed by&nbsp;</span><img src="${img(base, "ellington-white.png")}" height="22" alt="Ellington Properties" style="height:22px;width:auto;vertical-align:middle">
    </td>
  </tr></table>
</td></tr>
</table>
</td></tr>`;
}

/* ─── 1 · The brochure, to the lead ─── */

const inside = [
  ["01", "Architecture and arrival", "The louvered façade, the drop-off and the double-height lobby."],
  ["02", "Amenity levels 32–35", "Co-working, the clubhouse and terraces, fitness and prayer rooms."],
  ["03", "Every office type", "Floor plans from 1,132 sq ft to duplex and triplex headquarters."],
  ["04", "The 70/30 plan", "20% at booking, 50% while it rises, 30% on completion."],
] as const;

const nextSteps = [
  ["01", "A consultant will WhatsApp you", "Usually within 15 minutes during business hours."],
  ["02", "Your price list, first", "Sent as soon as Ellington releases launch pricing and availability."],
  [
    "03",
    "Your Golden Visa check",
    `Whether your office clears the AED ${goldenVisa.threshold / 1_000_000}M route to ${goldenVisa.years}-year residency.`,
  ],
] as const;

export function brochureEmail(o: { base: string; lead: Pick<LeadInput, "fullName" | "offer"> }): Rendered {
  const first = firstName(o.lead.fullName);
  const base = o.base.replace(/\/$/, "");
  const pdf = absolute(base, brochure.url);
  const difc = driveTimes.find((d) => d.place === "DIFC")?.minutes ?? 4;
  const booking = paymentPlan.find((p) => p.phase === "booking")?.pct ?? 20;
  const askVisa = whatsappLink(
    `Hi, this is ${first}. I've just downloaded the Berkeley Tower brochure and would like a Golden Visa eligibility check for an office.`,
  );
  const chat = whatsappLink(`Hi, this is ${first}. I've just downloaded the Berkeley Tower brochure.`);

  const subject = `${first ? `${first}, your` : "Your"} Berkeley Tower brochure is here`;
  const preheader = `${brochure.pages} pages: every office type's floor plan, the amenity levels, the 70/30 plan, and your route to a ${goldenVisa.years}-year Golden Visa.`;

  const stat = (value: string, label: string) =>
    `<td class="stack stack-gap" width="33%" valign="top" style="padding:0 6px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.mist}" style="background:${C.mist};border-radius:20px 0 20px 20px"><tr><td style="padding:20px 18px">
${eyebrow(label, C.stone, "font-size:10px")}
<p class="stat" style="margin:14px 0 0;font:300 34px/1 ${BODY};letter-spacing:-0.02em;color:${C.ink}">${value}</p>
</td></tr></table></td>`;

  const html = shell(
    subject,
    preheader,
    `
<!-- Top bar -->
<tr><td style="padding:0 4px 18px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td valign="middle"><img src="${img(base, "berkeley-lockup-ink.png")}" height="48" alt="Berkeley Tower" style="display:block;height:48px;width:auto"></td>
    <td valign="middle" align="right">${eyebrow("Level 60 · Request received", C.stone, "font-size:10px")}</td>
  </tr></table>
</td></tr>

<!-- Card -->
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.paper}" style="background:${C.paper};border-radius:${CORNER};overflow:hidden">
  <tr><td style="line-height:0;font-size:0"><a href="${esc(pdf)}" target="_blank"><img src="${img(base, "hero.gif")}" width="600" alt="The lift rides to level 60 and opens on Berkeley Tower at dusk beside the Burj Khalifa" style="display:block;width:100%;max-width:600px;height:auto;border-radius:28px 0 0 0"></a></td></tr>
  <tr><td bgcolor="${C.ink}" style="background:${C.ink};padding:12px 40px" class="px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>${eyebrow("SC 01 &nbsp;—&nbsp; Berkeley Tower &nbsp;—&nbsp; L 60", "rgba(255,255,255,0.6)", "font-size:10px")}</td>
      <td align="right" class="hide-sm">${eyebrow("Your brochure", C.accentBright, "font-size:10px")}</td>
    </tr></table>
  </td></tr>

  <!-- Welcome -->
  <tr><td class="px rise" style="padding:44px 44px 8px">
    ${eyebrow("Your copy of the brochure", C.accent)}
    <h1 class="h1" style="margin:16px 0 0;font:500 34px/1.05 ${DISPLAY};letter-spacing:0.01em;text-transform:uppercase;font-stretch:125%;color:${C.ink}">Welcome to the <span style="color:${C.accent}">top</span>${first ? `, ${esc(first)}` : ""}.</h1>
    <p style="margin:20px 0 0;font:400 16px/1.7 ${BODY};color:${C.stone}">Thank you for your interest in Berkeley Tower, ${esc(project.developer)}' Grade A office tower on Sheikh Zayed Road. Your copy of the brochure is ready: ${brochure.pages} pages on the architecture, the amenity levels, every office type and the payment plan.</p>
  </td></tr>
  <tr><td class="px rise rise-2" style="padding:28px 44px 0">
    ${button(pdf, "Download the brochure &nbsp;&darr;", { bg: C.accent, color: C.paper, cls: "pulse" })}
    <p style="margin:12px 0 0;font:400 12px/1.5 ${BODY};color:${C.stone}">PDF &middot; ${brochure.pages} pages &middot; ${brochure.size}. The link stays live; keep this email to download it again.</p>
  </td></tr>

  <!-- What's inside -->
  <tr><td class="px" style="padding:44px 44px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line}"><tr><td style="padding:36px 0 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td class="stack stack-gap" width="232" valign="top" style="width:232px;padding:0 24px 0 0">
          <img class="full-sm" src="${img(base, "tile-office.jpg")}" width="232" alt="An empty Berkeley office looking towards the Burj Khalifa" style="display:block;width:100%;max-width:232px;height:auto;border-radius:20px 0 20px 20px">
        </td>
        <td class="stack" valign="top">
          ${eyebrow("What's inside", C.accent)}
          ${inside
            .map(
              ([
                n,
                t,
                d,
              ]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px"><tr>
<td width="34" valign="top" style="width:34px;font:400 12px/1.6 ${BODY};color:${C.accent}">${n}</td>
<td valign="top"><p style="margin:0;font:600 13px/1.4 ${DISPLAY};letter-spacing:0.04em;text-transform:uppercase;font-stretch:112%;color:${C.ink}">${t}</p>
<p style="margin:4px 0 0;font:400 13px/1.55 ${BODY};color:${C.stone}">${d}</p></td></tr></table>`,
            )
            .join("")}
        </td>
      </tr></table>
    </td></tr></table>
  </td></tr>

  <!-- Key numbers -->
  <tr><td class="px" style="padding:36px 38px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${stat(String(project.storeys), "Storeys")}${stat(`${booking}%`, "At booking")}${stat(`${difc} min`, "To DIFC")}
    </tr></table>
  </td></tr>

  <!-- Golden Visa -->
  <tr><td class="px" style="padding:36px 44px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.accentDeep}" style="background:${C.accentDeep};background-image:linear-gradient(135deg,${C.accent} 0%,${C.accentDeep} 55%,${C.ink} 100%);border-radius:${CORNER}">
      <tr><td style="padding:34px 32px">
        ${eyebrow("United Arab Emirates · Golden Residency", "rgba(255,255,255,0.7)", "font-size:10px")}
        <h2 class="h2" style="margin:14px 0 0;font:500 24px/1.12 ${DISPLAY};text-transform:uppercase;font-stretch:125%;color:${C.paper}">Ownership that opens the door to a ${goldenVisa.years}-year Golden Visa</h2>
        <p style="margin:14px 0 0;font:400 14px/1.65 ${BODY};color:rgba(255,255,255,0.78)">The UAE grants ${goldenVisa.years}-year Golden Residency to investors who own AED ${goldenVisa.threshold / 1_000_000} million or more in property, and off-plan purchases from approved developers count. A Berkeley office can be your way in, with your ${goldenVisa.family} alongside you.</p>
        <p style="margin:18px 0 0;font-size:0;line-height:0">
          ${["AED 2M+ property", "Off-plan counts", "Family included"]
            .map(
              (p) =>
                `<span style="display:inline-block;margin:0 6px 6px 0;padding:7px 12px;border:1px solid rgba(255,255,255,0.3);border-radius:999px;font:600 10px/1 ${DISPLAY};letter-spacing:0.14em;text-transform:uppercase;color:${C.paper};white-space:nowrap">${p}</span>`,
            )
            .join("")}
        </p>
        <div style="margin-top:20px">${button(askVisa, "Check my eligibility", { bg: C.paper, color: C.ink })}</div>
        <p style="margin:16px 0 0;font:400 11px/1.55 ${BODY};color:rgba(255,255,255,0.55)">${esc(goldenVisa.note)}</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Next steps -->
  <tr><td class="px" style="padding:40px 44px 0">
    ${eyebrow("What happens next", C.accent)}
    ${nextSteps
      .map(
        ([
          n,
          t,
          d,
        ]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border-top:1px solid ${C.line}"><tr>
<td width="44" valign="top" style="width:44px;padding:16px 0 0;font:300 22px/1 ${BODY};color:${C.accent}">${n}</td>
<td valign="top" style="padding:16px 0 0"><p style="margin:0;font:600 14px/1.4 ${DISPLAY};letter-spacing:0.04em;text-transform:uppercase;font-stretch:112%;color:${C.ink}">${t}</p>
<p style="margin:4px 0 0;font:400 14px/1.6 ${BODY};color:${C.stone}">${d}</p></td></tr></table>`,
      )
      .join("")}
  </td></tr>

  <!-- Talk to us -->
  <tr><td class="px" style="padding:36px 44px 44px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.mist}" style="background:${C.mist};border-radius:20px 0 20px 20px"><tr><td style="padding:26px 26px">
      ${eyebrow("Speak to a consultant", C.stone, "font-size:10px")}
      <p style="margin:10px 0 0;font:300 26px/1.1 ${BODY};color:${C.ink}"><a href="${phoneHref}" style="color:${C.ink};text-decoration:none">${esc(broker.phone)}</a></p>
      <div style="margin-top:18px">${button(chat, "WhatsApp us", { bg: C.whatsapp, color: C.paper })}</div>
    </td></tr></table>
  </td></tr>
</table>
</td></tr>
${footer(
  base,
  `You're receiving this because you requested the Berkeley Tower brochure on our website. It comes from ${esc(broker.name)}, a real estate brokerage marketing Berkeley Tower by ${esc(project.developer)}; it is not the developer's official channel. Renders are illustrative, and areas, prices and dates are indicative until the Sales and Purchase Agreement.`,
)}`,
  );

  const text = [
    `Welcome to the top${first ? `, ${first}` : ""}.`,
    "",
    `Your copy of the Berkeley Tower brochure is ready (${brochure.pages} pages, PDF, ${brochure.size}):`,
    pdf,
    "",
    "What's inside",
    ...inside.map(([n, t, d]) => `${n}  ${t}: ${d}`),
    "",
    `Golden Visa: the UAE grants ${goldenVisa.years}-year Golden Residency to investors who own AED ${goldenVisa.threshold / 1_000_000} million or more in property, and off-plan counts. Check your eligibility on WhatsApp: ${askVisa}`,
    goldenVisa.note,
    "",
    "What happens next",
    ...nextSteps.map(([n, t, d]) => `${n}  ${t}: ${d}`),
    "",
    `Call ${broker.phone} or WhatsApp us: ${chat}`,
    "",
    `${broker.name} · ${broker.address} · ${broker.email}`,
    `${broker.name} is a real estate brokerage marketing Berkeley Tower by ${project.developer}; this is not the developer's official channel.`,
  ].join("\n");

  return { subject, preheader, html, text };
}

/* ─── 2 · The lead, to the sales team ─── */

const offerLabel = (o?: LeadInput["offer"]) =>
  o === "brochure" ? "Downloaded the brochure" : "Requested launch access";
const purposeLabel = (p?: LeadInput["purpose"]) => purposes.find((x) => x.value === p)?.label;
const prefLabel = { whatsapp: "WhatsApp", call: "Phone call", email: "Email" } as const;
/** Short names that fit the "From" tile; anything else uses the full name. */
const shortCountry: Record<string, string> = { AE: "UAE", GB: "UK", US: "USA", SA: "KSA" };

/** Where on the page the form was opened, in words. */
const sourceLabel = (s: string) =>
  ({
    hero: "Hero, opening shot",
    header: "Header Brochure button",
    "mobile-bar": "Mobile action bar",
    popup: "Exit popup",
    overview: "Overview chapter",
    "overview-brochure": "Overview, brochure link",
    "offices-plans": "Floor plans chapter",
    "golden-visa": "Golden Visa chapter",
    "golden-visa-head": "Golden Visa chapter, heading link",
    "payment-plan": "Payment plan chapter",
    concierge: "Ellis, the AI concierge",
    faq: "Questions chapter",
    final: "Register form, end of page",
    "register-brochure": "Register chapter, brochure link",
    finale: "Finale shot",
    footer: "Footer",
  })[s] ?? s;

function device(ua?: string) {
  if (!ua) return undefined;
  const os = /iPhone|iPad/.test(ua)
    ? "iPhone / iPad"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "Mac"
          : "Other";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "";
  return [os, browser].filter(Boolean).join(" · ");
}

const dubaiTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export function leadAlertEmail(o: { base: string; lead: EmailLead; brochureEmailed?: boolean }): Rendered {
  const base = o.base.replace(/\/$/, "");
  const l = o.lead;
  const first = firstName(l.fullName);
  const a = l.attribution ?? {};
  const digits = l.phone.replace(/\D/g, "");
  const parsed = parsePhoneNumberFromString(l.phone);
  const phoneShown = parsed?.formatInternational() ?? l.phone;
  const country = parsed?.country ? new Intl.DisplayNames(["en"], { type: "region" }).of(parsed.country) : undefined;
  const waLead = `https://wa.me/${digits}?text=${encodeURIComponent(
    `Hi ${first}, this is the Berkeley Tower team. Thank you for your interest in Berkeley Tower by ${project.developer}. Here's the brochure: ${absolute(base, brochure.url)}`,
  )}`;
  const scoreColor = { hot: C.accent, warm: C.ink, cool: C.stone }[l.score];
  const received = dubaiTime(l.createdAt);
  const clickId =
    a.gclid || a.gbraid || a.wbraid
      ? "Google Ads"
      : a.fbclid
        ? "Meta Ads"
        : a.msclkid
          ? "Microsoft Ads"
          : a.ttclid
            ? "TikTok Ads"
            : a.li_fat_id
              ? "LinkedIn Ads"
              : undefined;

  const subject = `[${l.score.toUpperCase()}] New Berkeley Tower lead: ${l.fullName.replace(/\s+/g, " ")} (${l.offer === "brochure" ? "brochure" : "launch access"})`;
  const preheader = `${phoneShown} · ${l.email} · ${sourceLabel(l.source)} · ${received} Dubai`;

  // Label/value rows; `dark` for the source card on the blue-to-ink gradient.
  const rows = (items: [string, string | undefined][], dark = false) =>
    items
      .filter(([, v]) => v)
      .map(
        ([
          k,
          v,
        ]) => `<tr><td width="130" valign="top" style="width:130px;padding:10px 12px 10px 0;border-top:1px solid ${dark ? "rgba(255,255,255,0.14)" : C.line};font:400 12px/1.5 ${BODY};color:${dark ? "rgba(255,255,255,0.6)" : C.stone}">${k}</td>
<td valign="top" style="padding:10px 0;border-top:1px solid ${dark ? "rgba(255,255,255,0.14)" : C.line};font:500 14px/1.5 ${BODY};color:${dark ? C.paper : C.ink};word-break:break-word">${v}</td></tr>`,
      )
      .join("");

  const tile = (label: string, value: string, opts: { bg?: string; color?: string; sub?: string } = {}) =>
    `<td class="stack stack-gap" width="33%" valign="top" style="padding:0 6px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${opts.bg ?? C.mist}" style="background:${opts.bg ?? C.mist};border-radius:20px 0 20px 20px"><tr><td style="padding:18px 18px">
${eyebrow(label, opts.sub ?? C.stone, "font-size:10px")}
<p class="stat" style="margin:12px 0 0;font:300 24px/1.1 ${BODY};letter-spacing:-0.01em;color:${opts.color ?? C.ink}">${value}</p>
</td></tr></table></td>`;

  const brief = (
    [
      ["Purpose", purposeLabel(l.purpose)],
      ["Size", l.size ? esc(l.size) : undefined],
      ["Timeline", l.timeline ? esc(l.timeline) : undefined],
      ["Interested in", l.unit ? esc(l.unit) : undefined],
      ["Prefers", l.contactPref ? prefLabel[l.contactPref] : undefined],
      ["Marketing", l.marketing ? "Opted in to future launches" : "Not opted in"],
    ] as [string, string | undefined][]
  ).filter((r): r is [string, string] => Boolean(r[1]));

  const sourceRows = rows(
    [
      ["Form opened from", esc(sourceLabel(l.source))],
      ["Ad click", clickId],
      [
        "Source / medium",
        a.utm_source || a.utm_medium ? esc([a.utm_source, a.utm_medium].filter(Boolean).join(" / ")) : undefined,
      ],
      ["Campaign", a.utm_campaign ? esc(a.utm_campaign) : undefined],
      ["Keyword", a.utm_term || a.keyword ? esc(a.utm_term || a.keyword) : undefined],
      ["Ad content", a.utm_content ? esc(a.utm_content) : undefined],
      [
        "First touch",
        a.first_utm_source ? esc([a.first_utm_source, a.first_utm_campaign].filter(Boolean).join(" · ")) : undefined,
      ],
      ["Referrer", a.referrer ? esc(a.referrer) : undefined],
      ["Page", a.page ? esc(a.page) : undefined],
    ],
    true,
  );

  const record = [
    `${l.score[0].toUpperCase()}${l.score.slice(1)} lead`,
    o.brochureEmailed === undefined
      ? undefined
      : o.brochureEmailed
        ? `Brochure email sent to ${esc(l.email)}`
        : "Brochure email NOT sent: check Resend",
    device(l.userAgent) ? esc(device(l.userAgent)) : undefined,
    `ID ${esc(l.id)}`,
  ]
    .filter(Boolean)
    .join(" &middot; ");

  const html = shell(
    subject,
    preheader,
    `
<!-- Top bar -->
<tr><td style="padding:0 4px 18px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td valign="middle"><img src="${img(base, "berkeley-lockup-ink.png")}" height="48" alt="Berkeley Tower" style="display:block;height:48px;width:auto"></td>
    <td valign="middle" align="right">${eyebrow("Lead desk · Level 60", C.stone, "font-size:10px")}</td>
  </tr></table>
</td></tr>

<!-- Card -->
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.paper}" style="background:${C.paper};border-radius:${CORNER};overflow:hidden">
  <tr><td style="line-height:0;font-size:0"><img src="${img(base, "hero-view.jpg")}" width="600" alt="Berkeley Tower at dusk beside the Burj Khalifa" style="display:block;width:100%;max-width:600px;height:auto;border-radius:28px 0 0 0"></td></tr>
  <tr><td bgcolor="${C.ink}" style="background:${C.ink};padding:12px 40px" class="px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>${eyebrow(`New lead &nbsp;—&nbsp; ${esc(sourceLabel(l.source))}`, "rgba(255,255,255,0.6)", "font-size:10px")}</td>
      <td align="right"><span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${scoreColor};${l.score === "warm" ? "border:1px solid rgba(255,255,255,0.35);" : ""}font:700 10px/1 ${DISPLAY};letter-spacing:0.2em;text-transform:uppercase;color:${C.paper}">${l.score}</span></td>
    </tr></table>
  </td></tr>

  <!-- Who -->
  <tr><td class="px rise" style="padding:40px 44px 0">
    ${eyebrow(`${offerLabel(l.offer)} · ${esc(received)} Dubai`, C.accent)}
    <h1 class="h1" style="margin:16px 0 0;font:500 34px/1.05 ${DISPLAY};letter-spacing:0.01em;text-transform:uppercase;font-stretch:125%;color:${C.ink}">${esc(l.fullName)}</h1>
    <p style="margin:16px 0 0;font:400 16px/1.7 ${BODY};color:${C.stone}">${esc(first || "They")} just ${l.offer === "brochure" ? "downloaded the Berkeley Tower brochure" : "requested launch access"}${country ? ` from ${esc(country)}` : ""}. Reach out while it's still open on their screen.</p>
  </td></tr>

  <!-- Act now -->
  <tr><td class="px rise rise-2" style="padding:26px 44px 0">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td class="stack stack-gap" style="padding:0 8px 8px 0">${button(waLead, "WhatsApp them", { bg: C.whatsapp, color: C.paper, cls: "pulse" })}</td>
      <td class="stack stack-gap" style="padding:0 8px 8px 0">${button(`tel:${l.phone}`, "Call", { bg: C.ink, color: C.paper })}</td>
      <td class="stack" style="padding:0 0 8px">${button(`mailto:${l.email}`, "Email", { bg: C.paper, color: C.ink, border: C.line })}</td>
    </tr></table>
  </td></tr>

  <!-- Key facts -->
  <tr><td class="px" style="padding:30px 38px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${tile("Score", l.score.toUpperCase(), l.score === "hot" ? { bg: C.accent, color: C.paper, sub: "rgba(255,255,255,0.7)" } : {})}${tile("Wants", l.offer === "brochure" ? "Brochure" : "Launch access")}${tile("From", parsed?.country ? (shortCountry[parsed.country] ?? esc(country ?? parsed.country)) : "Unknown")}
    </tr></table>
  </td></tr>

  <!-- Contact card -->
  <tr><td class="px" style="padding:30px 44px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.mist}" style="background:${C.mist};border-radius:20px 0 20px 20px"><tr><td style="padding:24px 26px">
      ${eyebrow("Contact", C.stone, "font-size:10px")}
      <p style="margin:10px 0 0;font:300 28px/1.1 ${BODY};color:${C.ink}"><a href="tel:${esc(l.phone)}" style="color:${C.ink};text-decoration:none">${esc(phoneShown)}</a></p>
      <p style="margin:8px 0 0;font:500 15px/1.5 ${BODY}"><a href="mailto:${esc(l.email)}" style="color:${C.accent};text-decoration:none">${esc(l.email)}</a></p>
    </td></tr></table>
  </td></tr>

  ${
    brief.length
      ? `<!-- Their brief -->
  <tr><td class="px" style="padding:36px 44px 0">
    ${eyebrow("Their brief", C.accent)}
    ${brief
      .map(
        (
          [k, v],
          i,
        ) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid ${C.line}"><tr>
<td width="44" valign="top" style="width:44px;padding:14px 0 0;font:300 20px/1 ${BODY};color:${C.accent}">${String(i + 1).padStart(2, "0")}</td>
<td valign="top" style="padding:14px 0 0">${eyebrow(k, C.stone, "font-size:10px")}<p style="margin:6px 0 0;font:500 15px/1.5 ${BODY};color:${C.ink}">${v}</p></td></tr></table>`,
      )
      .join("")}
  </td></tr>`
      : ""
  }

  <!-- Where they came from -->
  <tr><td class="px" style="padding:36px 44px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.accentDeep}" style="background:${C.accentDeep};background-image:linear-gradient(135deg,${C.accent} 0%,${C.accentDeep} 55%,${C.ink} 100%);border-radius:${CORNER}">
      <tr><td style="padding:30px 30px 22px">
        ${eyebrow("Where they came from", "rgba(255,255,255,0.7)", "font-size:10px")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px">${sourceRows}</table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td class="px" style="padding:26px 44px 40px">
    <p style="margin:0;font:400 12px/1.6 ${BODY};color:${C.stone}">${record}</p>
    <p style="margin:10px 0 0;font:400 13px/1.6 ${BODY};color:${C.ink}">Reply to this email to answer ${esc(first || "them")} directly.</p>
  </td></tr>
</table>
</td></tr>
${footer(base, `Lead alert from the Berkeley Tower launch page. Sent to the ${esc(broker.name)} team only.`)}`,
  );

  const text = [
    `New Berkeley Tower lead (${l.score.toUpperCase()})`,
    "",
    `Name: ${l.fullName}`,
    `Mobile: ${phoneShown}${country ? ` (${country})` : ""}`,
    `Email: ${l.email}`,
    `Wants: ${offerLabel(l.offer)}`,
    l.purpose ? `Purpose: ${purposeLabel(l.purpose)}` : "",
    l.size ? `Size: ${l.size}` : "",
    l.timeline ? `Timeline: ${l.timeline}` : "",
    l.contactPref ? `Prefers: ${prefLabel[l.contactPref]}` : "",
    l.unit ? `Interested in: ${l.unit}` : "",
    `Form opened from: ${sourceLabel(l.source)}`,
    a.utm_campaign ? `Campaign: ${a.utm_campaign}` : "",
    `Received: ${received} Dubai`,
    `Lead ID: ${l.id}`,
    "",
    `WhatsApp them: ${waLead}`,
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  return { subject, preheader, html, text };
}
