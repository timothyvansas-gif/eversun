/**
 * Shared class strings for the horizontal card carousels (products, team).
 * Keeps the track behaviour and card sizing identical across sections;
 * consumers append their own layout extras to the card shell.
 */

/** The scroll track: horizontal, snap on desktop, draggable, gap 16/24px. */
export const CAROUSEL_TRACK_CLASS =
  "draggable-scroll flex overflow-x-auto gap-4 md:gap-6 md:snap-x md:snap-proximity md:cursor-grab pb-4";

/** A card shell's width + snap sizing. Append flex/gap/etc. per section. */
export const CAROUSEL_CARD_CLASS =
  "w-[clamp(260px,85vw,310px)] md:w-[411px] shrink-0 md:snap-start";
