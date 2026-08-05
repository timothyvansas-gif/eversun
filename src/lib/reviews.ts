/**
 * The Google reviews the site shows, in one place: the hero's avatar dock and
 * the "Plan je moment" sheet read the same list, so a new review only has to be
 * added here.
 *
 * Order is the hero's left-to-right order; the last one ends up nearest the
 * rating figure.
 */

import type { StaticImageData } from "next/image";
import reviewer2 from "@/images/people/reviewer-2.webp";
import reviewer3 from "@/images/people/reviewer-3.webp";
import reviewer4 from "@/images/people/reviewer-4.webp";
import reviewer5 from "@/images/people/reviewer-5.webp";

/**
 * The headline figure the hero shows beside the avatar dock.
 *
 * Here rather than inline in the JSX, next to the quotes it summarises: both
 * come off the same Google listing, so they go stale together and should be
 * updated in one sitting. `checked` records when someone last compared it
 * against the listing — the number carries no expiry of its own.
 */
export const REVIEW_SUMMARY = {
  rating: "4.9",
  outOf: "5",
  count: 176,
  checked: "2026-08-05",
} as const;

export type Review = {
  /** Stable handle, so a consumer can pick a subset without matching on text. */
  id: string;
  name: string;
  quote: string;
  avatar: StaticImageData;
};

export const REVIEWS: Review[] = [
  {
    id: "koosje",
    name: "Koosje van Goinga",
    quote:
      "Wat een heerlijk schone en moderne studio is Ever Sun. Fijn in het centrum van Assen & parkeren voor de deur (gratis op zondag). Vriendelijk ontvangst en goede kwaliteit zonnebank met allemaal opties om naar eigen smaak in te stellen (ik had de medium sterke bank). Hier kom ik vaker!",
    avatar: reviewer4,
  },
  {
    id: "jackelien",
    name: "Jackelien Beikes",
    quote: "Hier ga je altijd vrolijk en getint de deur uit!",
    avatar: reviewer2,
  },
  {
    id: "celine",
    name: "Celine Ashley van Zanen",
    quote:
      "Hele nette en fijne zonnestudio! Aardig personeel dus zeker de moeite waard om heen te gaan.",
    avatar: reviewer5,
  },
  {
    id: "willeke",
    name: "Willeke Veenstra",
    quote:
      "Mooie zonnestudio, vriendelijk personeel. Prachtig bruiningsresultaat en het ziet er brandschoon uit.",
    avatar: reviewer3,
  },
];

/** Look one up by id; throws in development if the id was mistyped. */
export function getReviews(ids: readonly string[]): Review[] {
  return ids.map((id) => {
    const review = REVIEWS.find((r) => r.id === id);
    if (!review) throw new Error(`Unknown review id: ${id}`);
    return review;
  });
}
