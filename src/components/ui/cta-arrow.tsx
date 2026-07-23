/**
 * Arrow that slides and fades in on hover of a `group/cta` ancestor. Purely
 * presentational — render it inside a button or link that carries the
 * `group/cta` class.
 */
export function CtaArrow() {
  return (
    <span
      aria-hidden="true"
      className="flex items-center overflow-hidden w-0 -translate-x-1 opacity-0 transition-all duration-300 ease-out group-hover/cta:w-4 group-hover/cta:ml-2 group-hover/cta:translate-x-0 group-hover/cta:opacity-100"
    >
      <svg className="shrink-0" width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2.5 8h9m0 0L8 4m3.5 4L8 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}
