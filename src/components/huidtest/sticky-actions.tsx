"use client";

/**
 * The bar the test's forward button rides on.
 *
 * A question with four long options is taller than a phone once the sheet has
 * taken its share of the screen, and the button that moves on ended up under
 * the fold: the visitor picked an answer and nothing appeared to happen. So it
 * sticks to the bottom of whatever scrolls it — the sheet, the panel, the page
 * — and settles into place at the end of the content rather than hovering over
 * the last line forever.
 *
 * The negative margin spans the padding of that container, so it reads as a
 * bar across the surface instead of a button floating on top of the text it is
 * covering. That padding is 24px everywhere the test is shown, which is what
 * lets one constant do.
 */
export function StickyActions({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`sticky bottom-0 -mx-6 bg-surface-page/95 px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-[2px] ${className}`}
    >
      {children}
    </div>
  );
}
