/**
 * Shared class strings for the horizontal card carousels (products, team).
 * Keeps the track behaviour and card sizing identical across sections;
 * consumers append their own layout extras to the card shell.
 */

import type { CSSProperties } from "react";

// Distance from the centered 1280px content column's side edge to the viewport
// edge, at any width: the responsive gutter, or half the leftover space once
// the column caps at 1280px — whichever is larger.
const BLEED_GUTTER = "max(clamp(1.5rem, 4vw, 10rem), (100vw - 1280px) / 2)";

/**
 * Full-bleed track: pull to both viewport edges (negative margins), then pad
 * the first/last card back onto the content column so cards peek to the edge
 * instead of clipping at the column. One value G drives margin, padding AND
 * scroll-padding — the last matters because scroll-padding percentages resolve
 * against the (now full-width) scrollport, not the column, so a percentage form
 * would collapse to 0 and snap the first card to the viewport edge on load.
 */
export const CAROUSEL_BLEED_STYLE: CSSProperties = {
  marginLeft: `calc(-1 * ${BLEED_GUTTER})`,
  marginRight: `calc(-1 * ${BLEED_GUTTER})`,
  paddingLeft: BLEED_GUTTER,
  paddingRight: BLEED_GUTTER,
  scrollPaddingLeft: BLEED_GUTTER,
};

/** The scroll track: free horizontal scrolling, draggable, gap 16/24px. */
export const CAROUSEL_TRACK_CLASS =
  "draggable-scroll flex overflow-x-auto gap-4 md:gap-6 pb-4";

/** A card shell's responsive width. Append flex/gap/etc. per section. */
export const CAROUSEL_CARD_CLASS =
  "w-[clamp(260px,85vw,310px)] md:w-[411px] shrink-0";
