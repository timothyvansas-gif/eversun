/**
 * Arrow that slides and fades in on hover of a `group/cta` ancestor. Purely
 * presentational — render it inside a button or link that carries the
 * `group/cta` class.
 *
 * Pass `always` for buttons that show the arrow at rest (the hero CTA): it
 * renders the hover end-state straight away and needs no `group/cta` ancestor.
 * That variant brings no margin of its own — the consumer sets the gap.
 */
export function CtaArrow({ always = false }: { always?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        always
          ? "flex items-center overflow-hidden w-4"
          : "flex items-center overflow-hidden w-0 -translate-x-1 opacity-0 transition-all duration-300 ease-out group-hover/cta:w-4 group-hover/cta:ml-2 group-hover/cta:translate-x-0 group-hover/cta:opacity-100"
      }
    >
      <svg className="shrink-0" width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2.5 8h9m0 0L8 4m3.5 4L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}
