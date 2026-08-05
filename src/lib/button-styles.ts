/**
 * Shared class string for the outline "pill" CTA (border + rounded-full + hover
 * + focus ring). Kept as real utility classes (not @apply) so Tailwind's scanner
 * picks them up and per-use overrides layer predictably.
 *
 * Pair with `group/cta` and add per-use sizing (w-full, justify, py) in the
 * consumer's className.
 */
export const BTN_PILL =
  "group/cta inline-flex items-center text-zinc-900 text-[15px] font-medium font-sans tracking-[-0.01em] border border-line rounded-full px-[18px] cursor-pointer hover:border-[#312019] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors duration-150";

/**
 * Filled variant of the same pill, for when the CTA carries a section on its
 * own. Medium weight like the other accent buttons (hero, contact).
 *
 * The orange never changes on hover: the arrow unfolding is the whole hover
 * state, the same as the hero CTA. Pair with `<CtaArrow />`.
 */
export const BTN_PILL_ACCENT =
  "group/cta inline-flex items-center bg-accent text-surface-page text-[15px] font-medium font-sans tracking-[-0.01em] rounded-full px-[18px] cursor-pointer active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-transform duration-150";

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
