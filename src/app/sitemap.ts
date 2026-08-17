import type { MetadataRoute } from "next";
import { BASE_URL, FAQ_URL } from "@/lib/site";

/**
 * The dates are written by hand, and that is the point. `new Date()` stood here
 * before, which told every crawl that both pages had changed that very second —
 * a claim that is always true is no signal at all, and one a crawler learns to
 * discount once it never matches what it finds.
 *
 * Update these when the content on that page actually changes.
 */
const LAST_MODIFIED = {
  home: "2026-08-17",
  huidtest: "2026-08-16",
  faq: "2026-08-17",
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(LAST_MODIFIED.home),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/huidtest`,
      lastModified: new Date(LAST_MODIFIED.huidtest),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: FAQ_URL,
      lastModified: new Date(LAST_MODIFIED.faq),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
