import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // LAN origins allowed to pull dev assets, for checking the site on a real
  // phone. Without a match Next serves the HTML but 403s every /_next chunk,
  // so the page loads dead. These are DHCP ranges, hence the wildcards — add
  // the network you are on rather than a single lease.
  // 127.0.0.1 is not an alias for localhost here: Next matches the Host header
  // as written, so a browser that resolves one but not the other (headless
  // Chrome under automation, for one) gets its /_next chunks blocked and the
  // page loads without ever hydrating — every button dead, no console error.
  allowedDevOrigins: ["192.168.2.*", "10.30.*", "localhost:3000", "127.0.0.1"],
  images: {
    formats: isProd ? ["image/avif", "image/webp"] : ["image/webp"],
    qualities: [75, 80, 90],
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
