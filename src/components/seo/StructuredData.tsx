import { broker } from "@/lib/data/broker";
import { faq } from "@/lib/data/faq";
import { project } from "@/lib/data/tower";
import { siteName, siteUrl } from "@/lib/site";

// Schema.org graph for search: the site, the brokerage that runs it, the
// building, and the FAQ. Facts come from lib/data only.
export function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: siteName,
        inLanguage: "en",
        publisher: { "@id": `${siteUrl}/#agent` },
      },
      {
        "@type": "RealEstateAgent",
        "@id": `${siteUrl}/#agent`,
        name: broker.name,
        url: `${siteUrl}/`,
        telephone: broker.phone,
        email: broker.email,
        logo: `${siteUrl}/email/buildcaps-mark.png`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Conrad Office Tower, Office 1604, Sheikh Zayed Road",
          addressLocality: "Dubai",
          addressCountry: "AE",
        },
        areaServed: "Dubai",
      },
      {
        "@type": "Place",
        "@id": `${siteUrl}/#berkeley-tower`,
        name: project.name,
        description: `A ${project.storeys}-storey ${project.grade} office tower by ${project.developer} on Sheikh Zayed Road, beside Business Bay Metro Station: ${project.units} freehold offices on ${project.officeFloors} floors.`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Sheikh Zayed Road",
          addressLocality: "Business Bay, Dubai",
          addressCountry: "AE",
        },
        image: `${siteUrl}/email/hero-view.jpg`,
        url: `${siteUrl}/`,
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#page`,
        url: `${siteUrl}/`,
        name: "Berkeley Tower by Ellington | Grade A Offices in Business Bay, Dubai",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#berkeley-tower` },
        inLanguage: "en",
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON from our own data; "<" escaped
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
