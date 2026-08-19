/**
 * The CTA hover arrow, and the label that makes room for it.
 *
 * The arrow used to unfold inline — a `w-0` span that grew to `w-4` — which
 * widened the button along with it. That is what the button-not-growing rule
 * here rules out, so the arrow is taken out of flow instead: it sits absolutely
 * at the label's trailing edge and slides in from further right, while the
 * label itself slides left by half the space the pair takes up. The two moves
 * together keep the pair centred and the button's box untouched, so nothing
 * around it reflows on hover.
 *
 * Half of (arrow + gap) is 12px: a 20px arrow, 4px clear of the label. Change
 * either and this number changes with it.
 *
 * `transition-[translate]`, not `transition-transform`: in Tailwind v4
 * `translate-x-*` writes the `translate` property, which `transform` does not
 * cover — the arrow would jump rather than glide.
 *
 * Render inside an element carrying `group/cta`; the arrow takes `currentColor`
 * so it flips with the label on hover.
 */
export function CtaArrow() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-full ml-1 flex items-center translate-x-4 opacity-0 transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none group-hover/cta:translate-x-0 group-hover/cta:opacity-100"
    >
      <svg className="shrink-0" width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2.5 8h9m0 0L8 4m3.5 4L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}

/**
 * A CTA's label with the arrow attached. `relative` is the arrow's anchor, so
 * the arrow lands at this element's right edge whatever the label says.
 *
 * Two ways to make room, neither of which resizes the button:
 *
 * - default: the label slides left by half the pair's width, so label and arrow
 *   stay centred together and the arrow eats 12px of the right padding.
 * - `hold`: the label does not move at all. Steadier — nothing shifts under the
 *   cursor — but the arrow then reaches 24px into the right padding, and the
 *   pair sits off-centre by that much. Only for buttons with the room; see
 *   ARROW_REACH below.
 */
export function CtaLabel({ children, className = "", hold = false }: { children: React.ReactNode; className?: string; hold?: boolean }) {
  return (
    <span
      className={`relative flex items-center ${hold ? "" : "transition-[translate] duration-300 ease-out motion-reduce:transition-none group-hover/cta:-translate-x-[12px]"} ${className}`}
    >
      {children}
      <CtaArrow />
    </span>
  );
}

/**
 * How far past the label the arrow reaches, in px: 4px gap + 20px arrow. The
 * default variant halves it by sliding the label; `hold` pays it in full. A
 * button needs at least this much slack between its label and its right edge or
 * the pill's own curve starts cutting into the arrow.
 */
export const ARROW_REACH = 24;
