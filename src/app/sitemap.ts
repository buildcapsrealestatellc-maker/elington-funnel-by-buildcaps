import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// One page: the funnel. The thank-you page is noindex and the brochure is gated.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl}/` }];
}
