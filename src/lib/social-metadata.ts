/**
 * Keep the share image on the Worker domain until the public domain is routed
 * to this deployment. Social crawlers can fetch this URL today, independently
 * of the website's canonical domain.
 */
export const SOCIAL_IMAGE_URL =
  "https://ever-sun.ever-sun.workers.dev/social/ever-sun-share-1200x630.png";

export const SOCIAL_IMAGE = {
  url: SOCIAL_IMAGE_URL,
  secureUrl: SOCIAL_IMAGE_URL,
  width: 1200,
  height: 630,
  alt: "Ever Sun — Zonnestudio Assen",
  type: "image/png",
} as const;

export const TWITTER_IMAGE = {
  url: SOCIAL_IMAGE_URL,
  alt: SOCIAL_IMAGE.alt,
} as const;
