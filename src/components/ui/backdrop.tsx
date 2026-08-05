"use client";

import { m } from "framer-motion";
import type { MotionValue, Transition } from "framer-motion";

/** Shared scrim look for every full-screen backdrop: 75% black + a 2px blur. */
export const BACKDROP_SCRIM: React.CSSProperties = {
  backgroundColor: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
};

/**
 * Full-screen dim + blur scrim behind an overlay. Render it conditionally
 * inside an <AnimatePresence> — it fades in and out with the shared timing.
 *
 * Logic-less: the caller owns the open state. z-index (and cursor) come through
 * `className`; `scrollLock` opts into the Lenis scroll guard the modals use
 * (the desktop menu deliberately skips it so a wheel gesture closes it).
 */
export function Backdrop({
  onClick,
  className = "",
  scrollLock = false,
  transition = { duration: 0.25 },
  opacity,
  "aria-hidden": ariaHidden,
}: {
  onClick?: () => void;
  /** z-index, cursor, etc. */
  className?: string;
  /** Adds data-lenis-prevent so the smooth-scroll layer stays put underneath. */
  scrollLock?: boolean;
  transition?: Transition;
  /**
   * The scrim's own opacity, for a caller that has something to dim it against
   * — a gesture, a scroll position. Handing in the value rather than a number
   * keeps this component logic-less and keeps the fades: the in and out below
   * animate this very value, and the caller writes to it in between.
   */
  opacity?: MotionValue<number>;
  "aria-hidden"?: React.AriaAttributes["aria-hidden"];
}) {
  return (
    <m.div
      onClick={onClick}
      aria-hidden={ariaHidden}
      {...(scrollLock ? { "data-lenis-prevent": "" } : {})}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      className={`fixed inset-0 ${className}`}
      style={opacity ? { ...BACKDROP_SCRIM, opacity } : BACKDROP_SCRIM}
    />
  );
}
