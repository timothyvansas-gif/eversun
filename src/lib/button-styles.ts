/**
 * Shared class string for the outline "pill" CTA (border + rounded-full + hover
 * + focus ring). Kept as real utility classes (not @apply) so Tailwind's scanner
 * picks them up and per-use overrides layer predictably.
 *
 * Add per-use sizing (w-full, justify, py) in the consumer's className.
 */
/**
 * The outline's edge: resting colour and hover, nothing else. Its own constant
 * because the outline button is not always this pill — the sheets build theirs
 * on a subgrid to line the icons up, the photo card sits one on top of an
 * image — and they still have to read as the same button.
 *
 * Colour only, on purpose. The transition stays with the consumer: this pill
 * moves its border alone, the sheet buttons move a border and a press-scale
 * together, and two `transition-property` utilities on one element resolve by
 * stylesheet order rather than by intent.
 */
/** Resting edge shared by outline buttons, fields and huidtest choices. */
export const OUTLINE_BORDER_COLOR = "border-ink-primary/20";

export const BTN_OUTLINE_BORDER =
  `border ${OUTLINE_BORDER_COLOR} text-zinc-600 hover:border-ink-primary hover:text-zinc-900`;

export const BTN_PILL =
  `inline-flex items-center text-zinc-600 text-[15px] font-medium font-sans tracking-[-0.01em] ${BTN_OUTLINE_BORDER} rounded-full px-[18px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors duration-150`;

/**
 * Strong outlined CTA: a clear dark edge at rest that fills to the same dark
 * colour on hover. Used where a card needs a booking action without competing
 * with the page's filled primary CTA.
 */
export const BTN_PILL_DARK_OUTLINE =
  "inline-flex items-center border border-ink-primary bg-transparent text-ink-primary text-[15px] font-medium font-sans tracking-[-0.01em] rounded-full px-[18px] cursor-pointer hover:bg-ink-primary hover:text-surface-page active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-[transform,background-color,color] duration-150";

/**
 * The filled CTA, in the brand yellow.
 *
 * That yellow is the site's own: it is what the "2 banken" label on a bed card
 * is drawn in. The buttons rested orange until now, which put the loudest
 * colour on the page on every call to action at once; yellow carries them and
 * leaves orange to mean something — a selected answer, an open studio.
 *
 * The label is ink rather than page cream, because yellow is a light fill and
 * white on it is unreadable. It still has to invert as the dark hover fill
 * arrives underneath: `group/cta` is here for that, and `BTN_FILL_LABEL` is the
 * other half.
 *
 * Carries `relative overflow-hidden` because the fill is an element rather than
 * a colour — it comes from `useHoverBlob` and the consumer drops it in — and a
 * button that forgets those two lets the blob escape its own pill, which is the
 * one way to get this wrong that reads as a rendering bug.
 *
 * The transition deliberately leaves `color` out: the label owns its own
 * timing, and two `transition-property` declarations on one element resolve by
 * stylesheet order rather than by intent.
 */
export const BTN_PILL_BRAND =
  "group/cta relative overflow-hidden inline-flex items-center bg-brand text-ink-primary text-[15px] font-medium font-sans tracking-[-0.01em] rounded-full px-[18px] cursor-pointer active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-[transform,background-color] duration-150";

/**
 * The label inside a filled CTA: the timing of its flip, not its colours.
 *
 * A filled button's label has to change colour as the blob arrives under it, or
 * it disappears into the fill. The two directions are not symmetric. Coming in,
 * the blob's ease covers the centre of the button within about a tenth of a
 * second, so the colour follows almost immediately. Going out, the blob holds
 * its colour for a beat while it shrinks, and a label that turned with it would
 * vanish — so the way back waits for the fade.
 *
 * Hover rather than a JS pointer flag: Tailwind's hover variant is already
 * behind `(hover: hover)`, so a tap cannot leave the label stuck in the
 * inverted state. The named group is what ties it to its own button and not to
 * whatever card it happens to sit inside.
 *
 * Add the two colours per button — they differ by fill: `group-hover/cta:` the
 * one the blob brings, plain the one it rests on.
 */
export const BTN_FILL_LABEL =
  "relative z-10 transition-colors duration-200 delay-[220ms] group-hover/cta:delay-[50ms]";

/** Shared geometry for the section-level CTAs. */
export const BTN_CTA_HEIGHT = "min-h-[48px]";
export const BTN_BOOKING_DESKTOP_WIDTH = "md:min-w-[220px]";

/**
 * Minimum comfortable tap area for a small icon control: 44×44, per Apple HIG
 * and Material's 48dp. Everything here already cleared WCAG 2.5.8 (24px, and
 * the two shortest controls pass on the spacing exception) — this is about the
 * thumb, not the standard.
 *
 * Padding alone does not get there. A hamburger's three rules are 14.5px tall
 * all in, so even `p-3` leaves it at 39px. The floor has to be stated, with the
 * icon centred inside it: the drawn mark keeps its size and its position, and
 * only the box around it grows.
 *
 * Pair with a negative margin where the extra width would otherwise push a row
 * out of alignment (see the hero header).
 */
export const TAP_TARGET = "min-h-[44px] min-w-[44px] justify-center";
