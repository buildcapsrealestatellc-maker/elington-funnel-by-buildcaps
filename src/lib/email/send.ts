import "server-only";

import { Resend } from "resend";
import { brochureEmail, type EmailLead, leadAlertEmail, type Rendered } from "./templates";

// Email through Resend (https://resend.com). Off until RESEND_API_KEY is set.
// Every form fill sends two emails: the brochure to the lead (replies reach the
// team) and the lead alert to the team (replies reach the lead). The sender's
// domain must be verified in Resend; until then the resend.dev test sender
// only delivers to the Resend account owner's own address.

export const emailFrom = () =>
  process.env.EMAIL_FROM || process.env.LEAD_NOTIFY_FROM || "Berkeley Tower <onboarding@resend.dev>";

/** The team inbox(es) that receive every lead; comma-separated in env. */
export const teamInbox = () =>
  (process.env.LEAD_NOTIFY_TO || "buildcapsrealestatellc@gmail.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export type SendResult = { ok: boolean; id?: string; error?: string };

async function send(
  to: string[],
  m: Rendered,
  opts: { replyTo?: string; tag: string; key: string },
): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set" };
  try {
    const { data, error } = await new Resend(key).emails.send(
      {
        from: emailFrom(),
        to,
        replyTo: opts.replyTo,
        subject: m.subject,
        html: m.html,
        text: m.text,
        tags: [{ name: "type", value: opts.tag }],
      },
      // One email per lead and kind, even if the request is retried.
      { idempotencyKey: opts.key },
    );
    if (error) {
      console.error(`[email] ${opts.tag} not sent: ${error.message}`);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (e) {
    console.error(`[email] ${opts.tag} not sent:`, e);
    return { ok: false, error: String(e) };
  }
}

/** The brochure, to the lead. */
export function sendBrochureEmail(base: string, lead: EmailLead) {
  return send([lead.email], brochureEmail({ base, lead }), {
    replyTo: teamInbox()[0],
    tag: "brochure",
    key: `brochure/${lead.id}`,
  });
}

/** The lead alert, to the team. Replies go straight to the lead. */
export function sendLeadAlert(base: string, lead: EmailLead, brochureEmailed?: boolean) {
  return send(teamInbox(), leadAlertEmail({ base, lead, brochureEmailed }), {
    replyTo: lead.email,
    tag: "lead-alert",
    key: `lead/${lead.id}`,
  });
}
