/**
 * The studio's own details, in one place.
 *
 * These were spread over four files — the address in the openingstijden
 * overlay, the phone number in the contact section, the socials next to their
 * icons, the domain in `layout.tsx`. Every one of them is also a claim the
 * structured data makes to Google and to the AI crawlers, and a number that
 * disagrees with the JSON-LD is worse than no JSON-LD at all: it tells the
 * indexer the page cannot be trusted about itself.
 *
 * So the components and the machine-readable copy read the same constants.
 */

export const BASE_URL = "https://www.eversun-assen.nl";

export const SITE_NAME = "Ever Sun";

/**
 * The FAQ's own page. On the site itself the questions open in a panel over the
 * homepage; this is where the footer link points, and what a crawler or a
 * shared link gets — the same list as a plain, readable page.
 */
export const FAQ_URL = `${BASE_URL}/veelgestelde-vragen`;

export const EMAIL = "info@eversun-assen.nl";

/** Written out the way the site shows it. */
export const PHONE_DISPLAY = "06 25 30 64 91";

/** The same number in E.164, which is what `tel:` links and schema.org want. */
export const PHONE_E164 = "+31625306491";

export const ADDRESS = {
  street: "Kloekhorststraat 4a",
  postalCode: "9401 BD",
  city: "Assen",
  country: "NL",
} as const;

/**
 * Includes the Google place id, so the link resolves to the studio's own
 * listing rather than a search for its name. That id is also what makes this
 * URL worth putting in `sameAs`: it ties the site to the Maps entity that
 * local answers are actually built from.
 */
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Ever+Sun+Assen&query_place_id=ChIJAe9RzRwlyEcR1wglglnLp4w";

export const FACEBOOK_URL = "https://www.facebook.com/eversun.assen/";

export const INSTAGRAM_URL = "https://www.instagram.com/ever_sun_assen/";

/** Every profile that is the same business, for schema.org `sameAs`. */
export const SAME_AS = [MAPS_URL, FACEBOOK_URL, INSTAGRAM_URL];
