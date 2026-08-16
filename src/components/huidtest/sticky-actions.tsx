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
 * A spring rather than a curve, for the reason the steps and the sheets use
 * one: everything in the test that travels should be governed by the same
 * physics. It replaced a 280ms quintic, which spent more than half its distance
 * in the first quarter of its time — correct as an ease-out, and at this size
 * it read as the bar snapping into place rather than arriving.
 *
 * This one has to be kept from overshooting, which is where it parts company
 * with the steps. The bar comes to rest against an edge, and a spring that
 * crosses its target lifts it off that edge and shows daylight underneath
 * before settling back. Critical damping — the point where a spring settles
 * without ever crossing — is `2 * sqrt(stiffness * mass)`, 26.8 at this
 * stiffness, so the damping sits just above it. `STEP_SLIDE` sits just under
 * its own, and that is the whole difference between a card that may settle
 * and a bar that may not.
 *
 * Stiffer than it first was. At 120 the rise was smooth and a beat too long to
 * sit behind a tap — the same complaint the steps' own spring was tuned out of,
 * and the same answer: raise the stiffness and carry the damping up with it, or
 * the ratio drops under the line and the overshoot comes back.
 *
 * All of this is motion props rather than a CSS keyframe, and has to stay that
 * way. It was a keyframe until the bar had to be able to leave as well as
 * arrive: a running animation outranks inline styles, and `both` keeps its last
 * frame doing so long after it has finished — so the class went on holding
 * `translateY(0)` while the exit wrote a transform of its own, and the two
 * traded the property back and forth every frame. One owner, and the flicker
 * has nothing left to argue about.
 */
const BAR_RISE = { type: "spring", stiffness: 180, damping: 29, mass: 1 } as const;

/**
 * The fade keeps its own clock. On the spring it inherited the tail, and the
 * bar spent the last of its rise not quite opaque over the content it is there
 * to cover.
 */
const BAR_FADE = { duration: 0.22, ease: "easeOut" } as const;

/**
 * How far it rises from, which is the one thing the two surfaces differ on.
 *
 * On a phone the bar comes up out of the bottom edge it lives on, a full height
 * of itself: the sheet clips it, so it is genuinely arriving from off-surface
 * and the fade and the travel read as one move.
 *
 * The panel does not travel at all, and the reason is worth keeping. A short
 * rise was tried here — 12px, on the thinking that the bar now waits for the
 * advice to land and so arrives into an empty bar area where a bare fade reads
 * as appearing rather than arriving. It came out worse, and predictably so: over
 * a distance that short the fade finishes well before the travel does, so the
 * bar turns solid where it stands and is then seen shifting the last few pixels
 * into place. Two beats — a pop, then a nudge — where the sheet gets one.
 *
 * Matching the two clocks would fix the seam and not the cause. There is no
 * edge in the panel for the bar to come from, so any travel is movement without
 * an origin, which is the same thing this file has said since the bar was a
 * keyframe. It fades where it stands.
 */
const BAR_TRAVEL = { sheet: "100%", panel: 0 } as const;

export function StickyActions({
  children,
  visible = true,
  className = "",
  backgroundClassName = "bg-surface-page/95",
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
  /** Surface colour for a bar that needs a different veil on one screen. */
  backgroundClassName?: string;
} & MotionProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const shouldReduceMotion = useReducedMotion();

  if (!visible) return null;

  return (
    <m.div
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, y: isMobile ? BAR_TRAVEL.sheet : BAR_TRAVEL.panel }
      }
      animate={{
        opacity: 1,
        y: 0,
        transition: { y: BAR_RISE, opacity: BAR_FADE },
      }}
      {...motion}
      className={`sticky bottom-0 -mx-6 ${backgroundClassName} px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-[2px] ${className}`}
    >
      {children}
    </m.div>
  );
}
