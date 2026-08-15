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
export const BTN_OUTLINE_BORDER =
  "border border-[#0B0B0B]/20 text-zinc-600 hover:border-[#0B0B0B] hover:text-zinc-900";

export const BTN_PILL =
  `inline-flex items-center text-zinc-600 text-[15px] font-medium font-sans tracking-[-0.01em] ${BTN_OUTLINE_BORDER} rounded-full px-[18px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors duration-150`;

/**
 * Strong outlined CTA: a clear dark edge at rest that fills to the same dark
 * colour on hover. Used where a card needs a booking action without competing
 * with the page's filled primary CTA.
 */
export const BTN_PILL_DARK_OUTLINE =
  "inline-flex items-center border border-[#0B0B0B] bg-transparent text-[#0B0B0B] text-[15px] font-medium font-sans tracking-[-0.01em] rounded-full px-[18px] cursor-pointer hover:bg-[#0B0B0B] hover:text-surface-page active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-[transform,background-color,color] duration-150";

/**
 * Filled variant of the same pill, for when the CTA carries a section on its
 * own. Medium weight like the other accent buttons (hero, contact). Filled
 * CTAs rest on the page black and turn orange on hover; the hero's CTA
 * deliberately owns its cursor-origin blob instead.
 */
export const BTN_PILL_ACCENT =
  "inline-flex items-center bg-void text-surface-page text-[15px] font-medium font-sans tracking-[-0.01em] rounded-full px-[18px] cursor-pointer hover:bg-accent active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-[transform,background-color,color] duration-150";

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
