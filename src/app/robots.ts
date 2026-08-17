import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/site";

/**
 * The wildcard rule already lets every crawler in, AI ones included. They are
 * named anyway, because the default is the thing people change by accident:
 * an explicit line is what makes it obvious that GPTBot and friends are welcome
 * here on purpose, and what a later "block the AI bots" edit has to argue with.
 *
 * Note that robots.txt is not the only gate — a CDN can block these agents
 * before the file is ever read.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
