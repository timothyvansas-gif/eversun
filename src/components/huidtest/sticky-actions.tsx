"use client";

import { m, type MotionProps } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { MOBILE_QUERY } from "@/lib/breakpoints";

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
 *
 * It animates as itself rather than inside a wrapper, because a wrapper would
 * become its containing block — and a sticky element can only travel as far as
 * that block reaches, which around a bar this size is nowhere at all.
 */

/**
 * The travel is the sheet's, not the panel's. On a phone the bar comes up out
 * of the bottom edge it lives on; in the side panel there is no edge to come
 * from and the same movement reads as the button jumping into place, so there
 * it simply fades where it stands.
 *
 * This was a CSS keyframe until the bar had to be able to leave as well as
 * arrive. A running animation outranks inline styles, and `both` keeps its
 * last frame doing so long after it has finished — so the class went on
 * holding `translateY(0)` while the exit wrote a transform of its own, and the
 * two traded the property back and forth every frame. One owner, and the
 * flicker has nothing left to argue about.
 */
const BAR_IN = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
const BAR_IN_PANEL = { duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

export function StickyActions({
  children,
  visible = true,
  className = "",
  ...motion
}: {
  children: React.ReactNode;
  /**
   * Whether this surface has anything to act on at all. False renders nothing
   * — not a hidden bar, which still holds its space. It is about the screen
   * rather than the answer on it: the questions keep one bar between them and
   * disable the button instead, so that it cannot appear and disappear
   * underneath a thumb that is reaching for it.
   */
  visible?: boolean;
  className?: string;
} & MotionProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const shouldReduceMotion = useReducedMotion();

  if (!visible) return null;

  return (
    <m.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: isMobile ? "100%" : 0 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: isMobile ? BAR_IN : BAR_IN_PANEL,
      }}
      {...motion}
      className={`sticky bottom-0 -mx-6 bg-surface-page/95 px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-[2px] ${className}`}
    >
      {children}
    </m.div>
  );
}
