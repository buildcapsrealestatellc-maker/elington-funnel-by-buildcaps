import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { siteName, siteUrl } from "@/lib/site";
import "./globals.css";

// Archivo's width axis gives the expanded, film-title cut (font-stretch 125%).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Berkeley Tower by Ellington: a 60-storey Grade A office tower beside Business Bay Metro, Dubai. Freehold offices from 1,132 sq ft to full floors, a 70/30 payment plan and a route to the 10-year UAE Golden Visa. Download the brochure.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Berkeley Tower by Ellington | Grade A Offices in Business Bay, Dubai",
  description,
  applicationName: siteName,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Berkeley Tower by Ellington | Grade A Offices, Business Bay",
    description:
      "Grade A freehold offices beside Business Bay Metro, Dubai, with a route to the 10-year Golden Visa. Download the brochure.",
    url: "/",
    siteName,
    type: "website",
    locale: "en_AE",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false },
  // Search Console ownership (HTML-tag method): the subdomain's CNAME rules out a DNS TXT.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

// Runs before paint: flags JS + motion support and returning visitors so the
// preloader and reveal states never flash.
const bootScript = `(function(){try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-motion')}if(sessionStorage.getItem('bt-intro')){d.dataset.introSeen='1'}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static boot script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
