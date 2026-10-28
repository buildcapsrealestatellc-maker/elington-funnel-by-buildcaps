import { describe, expect, it } from "vitest";
import { broker } from "@/lib/data/broker";
import { brochure } from "@/lib/data/tower";
import { leadSchema } from "@/lib/lead/schema";
import { brochureEmail, type EmailLead, esc, leadAlertEmail } from "./templates";

const base = "https://berkeley.example.com";

const lead: EmailLead = {
  id: "lead-123",
  createdAt: "2026-10-25T10:30:00.000Z",
  score: "warm",
  fullName: "Omar Haddad",
  phone: "+971501234567",
  email: "omar@example.com",
  offer: "brochure",
  source: "popup",
  contactPref: "whatsapp",
  attribution: { utm_source: "google", utm_campaign: "launch" },
};

describe("brochureEmail", () => {
  const m = brochureEmail({ base, lead });

  it("greets the lead and links the brochure with absolute URLs", () => {
    expect(m.subject).toBe("Omar, your Berkeley Tower brochure is here");
    expect(m.html).toContain(`href="${base}${brochure.url}"`);
    expect(m.html).toContain(`src="${base}/email/hero.gif"`);
    expect(m.html).toContain("Welcome to the <span");
    expect(m.text).toContain(`${base}${brochure.url}`);
  });

  it("keeps an absolute brochure URL as it is", () => {
    expect(brochureEmail({ base: `${base}/`, lead }).html).not.toContain(`${base}//`);
  });

  it("offers WhatsApp and the Golden Visa check on the brokerage's number", () => {
    expect(m.html).toContain(`https://wa.me/${broker.whatsapp}?text=`);
    expect(m.html).toContain("Check my eligibility");
    expect(m.html).toContain(encodeURIComponent("Golden Visa eligibility check"));
  });

  it("never lets a name inject markup", () => {
    const evil = brochureEmail({ base, lead: { ...lead, fullName: '<img src=x onerror="alert(1)">' } });
    expect(evil.html).not.toContain("<img src=x");
    expect(evil.html).toContain("&lt;img");
  });
});

describe("leadAlertEmail", () => {
  const m = leadAlertEmail({ base, lead, brochureEmailed: true });

  it("puts the score, name and offer in the subject", () => {
    expect(m.subject).toBe("[WARM] New Berkeley Tower lead: Omar Haddad (brochure)");
  });

  it("gives one-tap actions to reach the lead", () => {
    expect(m.html).toContain("https://wa.me/971501234567?text=");
    expect(m.html).toContain('href="tel:+971501234567"');
    expect(m.html).toContain('href="mailto:omar@example.com"');
  });

  it("shows where the lead came from, in Dubai time, and skips empty fields", () => {
    expect(m.html).toContain("Exit popup");
    expect(m.html).toContain("google");
    expect(m.html).toContain("25 Oct 2026, 14:30");
    expect(m.html).toContain("Brochure email sent to omar@example.com");
    expect(m.html).not.toContain(">Purpose<");
  });

  it("escapes everything the visitor typed", () => {
    const evil = leadAlertEmail({
      base,
      lead: { ...lead, fullName: "<b>Boss</b>", attribution: { utm_campaign: '"><script>x()</script>' } },
    });
    expect(evil.html).not.toContain("<script>");
    expect(evil.html).not.toContain("<b>Boss</b>");
    expect(evil.html).toContain("&lt;b&gt;Boss&lt;/b&gt;");
  });

  it("keeps the subject on one line", () => {
    expect(leadAlertEmail({ base, lead: { ...lead, fullName: "Omar\nHaddad" } }).subject).not.toContain("\n");
  });
});

describe("esc", () => {
  it("escapes the five HTML specials", () => {
    expect(esc(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});

describe("lead form", () => {
  const valid = {
    fullName: "Omar Haddad",
    phone: "+971501234567",
    email: "omar@example.com",
    consent: true,
    source: "popup",
  };

  it("requires an email", () => {
    expect(leadSchema.safeParse(valid).success).toBe(true);
    const missing = leadSchema.safeParse({ ...valid, email: "" });
    expect(missing.success).toBe(false);
    expect(missing.error?.issues[0]?.message).toBe("Please enter your email");
    expect(leadSchema.safeParse({ ...valid, email: undefined }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("requires a valid mobile number and a name", () => {
    expect(leadSchema.safeParse({ ...valid, phone: "" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, fullName: "" }).success).toBe(false);
  });
});
