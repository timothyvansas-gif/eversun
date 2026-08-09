const WHATSAPP_NUMBER = "31625306491";
const DEFAULT_MESSAGE = "Hoi Ever Sun,\nik wil graag een zonsessie boeken";

/**
 * The one default booking link. Product-specific WhatsApp URLs (per zonnebank)
 * stay in `zonnebanken-data.ts` — those messages are genuinely distinct, this
 * is only the generic "boek een sessie" link repeated verbatim across the nav,
 * both menus, and every overlay.
 */
export const WHATSAPP_BOOKING_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
