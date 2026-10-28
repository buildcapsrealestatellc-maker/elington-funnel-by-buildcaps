// The funnel's public address: canonical URLs, the sitemap, structured data
// and email links all build on it. The subdomain carries the project's exact
// name, "Berkeley Tower by Ellington", the query people search.

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://berkeley-tower-by-ellington.buildcaps.com"
).replace(/\/$/, "");

export const siteName = "Berkeley Tower by Ellington";
