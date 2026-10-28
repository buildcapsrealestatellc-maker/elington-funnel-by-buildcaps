import type { NextConfig } from "next";

/** Vercel's project address; everything on it moves to the custom domain. */
const vercelHost = "buildcaps-berkeley-ellington-funnel.vercel.app";
const domain = "https://berkeley-tower-by-ellington.buildcaps.com";

const nextConfig: NextConfig = {
  // Here rather than in vercel.json: Next's own redirects run before the
  // prerendered home page, so "/" redirects too.
  async redirects() {
    const host = [{ type: "host" as const, value: vercelHost }];
    return [
      { source: "/", has: host, destination: `${domain}/`, permanent: true },
      { source: "/:path+", has: host, destination: `${domain}/:path+`, permanent: true },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2560],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
