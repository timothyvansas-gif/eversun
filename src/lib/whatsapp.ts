const WHATSAPP_NUMBER = "31625306491";
const DEFAULT_MESSAGE = "Hoi Ever Sun,\nik wil graag een zonsessie boeken";

const bookingUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/**
 * The one default booking link, repeated verbatim across the nav, both menus,
 * and every overlay.
 */
export const WHATSAPP_BOOKING_URL = bookingUrl(DEFAULT_MESSAGE);

/**
 * Bank names, keyed by slug. These live here rather than in
 * `zonnebanken-data.ts` because two things need them and only one of those can
 * read that file: the site, and the QR generator script — which runs in plain
 * Node and would choke on the `.webp` imports at the top of the data module.
 *
 * The name doubles as the display title, so `zonnebanken-data.ts` reads its
 * `title` from here too. One string, one place: rename a bank and its message,
 * its QR code and its heading all move together.
 */
export const ZONNEBANK_BOOKINGS = {
  "ergoline-prestige-1600": "Ergoline Prestige 1600",
  "ergoline-770-medium": "Ergoline 770 medium",
  "ergoline-blue-vision": "Ergoline Blue Vision",
  "ergoline-600-light": "Ergoline 600 light",
} as const;

export type ZonnebankSlug = keyof typeof ZONNEBANK_BOOKINGS;

export const ZONNEBANK_SLUGS = Object.keys(ZONNEBANK_BOOKINGS) as ZonnebankSlug[];

export const zonnebankBookingUrl = (slug: ZonnebankSlug) =>
  bookingUrl(`${DEFAULT_MESSAGE} voor de bank ${ZONNEBANK_BOOKINGS[slug]}`);
