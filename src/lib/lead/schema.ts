import { isValidPhoneNumber } from "libphonenumber-js/min";
import { z } from "zod";

export const purposes = [
  { value: "own-use", label: "An office for my company" },
  { value: "investment", label: "An investment" },
  { value: "both", label: "Both" },
] as const;

export const sizes = [
  "Under 1,500 sq ft",
  "1,500 – 3,000 sq ft",
  "3,000 – 6,500 sq ft",
  "Full floor (12,000+ sq ft)",
  "Duplex / Triplex (20,000+ sq ft)",
  "Not sure yet",
] as const;

export const timelines = ["At launch", "Within 3 months", "6 months or more"] as const;

/** What the visitor asked for: the brochure download or launch access. */
export const offers = ["brochure", "access"] as const;
export type Offer = (typeof offers)[number];

export const contactPrefs = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "call", label: "Phone call" },
  { value: "email", label: "Email" },
] as const;

export const leadSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .refine((v) => isValidPhoneNumber(v), "Please enter a valid mobile number"),
  // Required: the brochure is emailed to this address.
  email: z
    .string({ error: "Please enter your email" })
    .trim()
    .min(1, "Please enter your email")
    .pipe(z.email("Please enter a valid email address").max(120)),
  purpose: z.enum(["own-use", "investment", "both"]).optional(),
  size: z.enum(sizes).optional(),
  timeline: z.enum(timelines).optional(),
  contactPref: z.enum(["whatsapp", "call", "email"]).optional(),
  consent: z.literal(true, { error: "Please agree so our team can contact you" }),
  marketing: z.boolean().optional(),
  offer: z.enum(offers).optional(),
  source: z.string().max(40),
  unit: z.string().max(60).optional(),
  attribution: z.record(z.string(), z.string().max(400)).optional(),
  /** Honeypot: humans never see or fill this. */
  company: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Rough priority for sales routing; refined later by the AI scorer. */
export function scoreLead(lead: LeadInput): "hot" | "warm" | "cool" {
  let score = 0;
  if (lead.timeline === "At launch") score += 2;
  if (lead.timeline === "Within 3 months") score += 1;
  if (lead.size && /Full floor|Duplex|3,000/.test(lead.size)) score += 2;
  if (lead.purpose === "own-use" || lead.purpose === "both") score += 1;
  if (lead.email) score += 1;
  return score >= 4 ? "hot" : score >= 2 ? "warm" : "cool";
}
