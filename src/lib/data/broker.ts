// The brokerage that runs this page. Its phone, WhatsApp and email are the
// page's contact channels; its name and mark appear in the footer only, never
// in the header. Each value can be overridden from env for another agent.

export const broker = {
  name: process.env.NEXT_PUBLIC_BROKER_NAME || "Buildcaps Real Estate",
  phone: process.env.NEXT_PUBLIC_BROKER_PHONE || "+971 58 260 9991",
  /** Digits only, with the country code. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971582609991",
  email: process.env.NEXT_PUBLIC_BROKER_EMAIL || "info@buildcaps.com",
  address:
    process.env.NEXT_PUBLIC_BROKER_ADDRESS ||
    "Conrad Office Tower, Office 1604, Sheikh Zayed Road, Trade Centre First, Dubai, UAE",
  /** RERA office registration number; shown once issued. */
  orn: process.env.NEXT_PUBLIC_BROKER_ORN || "",
} as const;

export const phoneHref = `tel:${broker.phone.replace(/[^\d+]/g, "")}`;

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(broker.address)}`;

/** The opening line every WhatsApp chat starts with, unless a CTA has its own. */
export const whatsappHello = "Hi, I'm interested in Berkeley Tower by Ellington in Business Bay.";

export const whatsappLink = (text = whatsappHello) =>
  `https://wa.me/${broker.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
