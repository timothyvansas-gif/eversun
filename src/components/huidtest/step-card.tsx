"use client";

/**
 * The white surface every step is written on.
 *
 * The test sits on the page's cream, and its content needs a sheet of its own
 * to read as one thing rather than as text floating on the site. Same panel the
 * openingstijden sheet uses, down to the radius and the padding.
 *
 * Two things stay outside it, deliberately: the progress bar, which is about
 * the test rather than the step, and the action bar, which belongs to the edge
 * of the surface the test is in.
 */
export function StepCard({
  children,
  className = "",
  ref,
}: {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref} className={`rounded-2xl bg-white px-6 py-6 ${className}`}>
      {children}
    </div>
  );
}
