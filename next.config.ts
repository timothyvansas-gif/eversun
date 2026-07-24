import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.2.66", "192.168.2.*", "localhost:3000"],
  images: {
    formats: isProd ? ["image/avif", "image/webp"] : ["image/webp"],
    qualities: [75, 80],
  },
  // Inline the page CSS into the HTML <head> instead of a render-blocking
  // <link>. This is a single-page site with one stylesheet, so there is no
  // cross-page cache to lose — the CSS is needed on first paint anyway.
  experimental: {
    inlineCss: true,
    // Rewrite framer-motion's barrel import (`import { m } from "framer-motion"`)
    // to deep per-module paths so only the used exports land in the bundle,
    // trimming the parse/eval cost that shows up as desktop main-thread time.
    // (gsap is a single default-export entry, not a named-export barrel, so it
    // gains nothing here — left out to avoid implying a win that doesn't exist.)
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
