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
 * Strong outlined CTA: a clear dark edge, no fill. Used where a card needs a
 * booking action without competing with the page's filled primary CTA. It used
 * to fill dark on hover; hover is the arrow now, like every other CTA.
 */
export const BTN_PILL_DARK_OUTLINE =
  "inline-flex items-center border border-ink-primary bg-transparent text-ink-primary text-[15px] font-medium font-sans tracking-[-0.01em] rounded-full px-[18px] cursor-pointer active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-transform duration-150";

/**
 * The filled CTA, in the orange.
 *
 * Painted with `bg-cta`, which is where that colour lives now — see the token
 * in globals.css. The buttons spent a spell in the brand yellow; that yellow is
 * still the site's own, on the parking card, and that one is `brand` rather
 * than `cta` precisely so a change here leaves it alone.
 *
 * The label is white, by design decision. Worth knowing what that costs: white
 * on #ff4d00 measures 3.3:1, under the 4.5:1 WCAG AA asks for at this size,
 * where ink would have cleared 5.9:1. On the yellow it was the other way round
 * and ink was the only readable option.
 *
 * The orange holds through hover: the whole hover is `CtaArrow` sliding in, so
 * pair this with `group/cta` and a `CtaLabel`. Two earlier hovers left traces
 * worth knowing about — a circle that grew from wherever the cursor crossed the
 * edge (`useHoverBlob`), which is why this string once carried
 * `relative overflow-hidden` and a named group, and after it a plain swap to
 * the dark fill. Neither is here now, so nothing but `transform` transitions.
 */
export const BTN_PILL_CTA =
  "inline-flex items-center bg-cta text-white text-[15px] font-medium font-sans tracking-[-0.01em] rounded-full px-[18px] cursor-pointer active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-transform duration-150";

/** Shared geometry for the section-level CTAs. */
export const BTN_CTA_HEIGHT = "min-h-[48px]";
export const BTN_BOOKING_DESKTOP_WIDTH = "md:min-w-[190px]";

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
