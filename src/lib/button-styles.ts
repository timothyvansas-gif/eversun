/**
 * Shared class string for the outline "pill" CTA (border + rounded-full + hover
 * + focus ring). Kept as real utility classes (not @apply) so Tailwind's scanner
 * picks them up and per-use overrides layer predictably.
 *
 * Pair with `group/cta` and add per-use sizing (w-full, justify, py) in the
 * consumer's className.
 */
export const BTN_PILL =
  "group/cta inline-flex items-center text-zinc-900 text-[15px] font-normal font-sans tracking-[-0.01em] border border-line rounded-full px-[18px] cursor-pointer hover:border-[#312019] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors duration-150";
