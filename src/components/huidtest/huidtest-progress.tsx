"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * The bar across the top of the quiz, and the one beat it holds for at the end.
 *
 * It is a fixture of the whole test rather than of the questions: it is drawn
 * on the intro and on both exits too, because a bar that came and went would
 * move everything under it twice per screen. The number it shows is worked out
 * by `flow.ts`; this file only knows how to draw it and how to leave.
 *
 * When it leaves is a hook rather than state inside the component, because the
 * result's own action bar waits for the same moment — see `useProgressVisible`.
 */

/** Let the completed bar register before the result gets the space back. */
const RESULT_PROGRESS_HOLD = 560;

/** The same beat, minus the part that is only there to be watched. */
const REDUCED_PROGRESS_HOLD = 240;

const PROGRESS_EXIT = {
  opacity: { duration: 0.22, ease: "easeOut" as const },
  height: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  marginBottom: {
    duration: 0.32,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

/**
 * Whether the bar is still on screen.
 *
 * Out here rather than inside the component because it is not only the bar's
 * own business: the result's action bar arrives as this one closes, and a
 * second timer counting to the same beat is a second thing to fall out of step
 * with.
 *
 * `resultKey` identifies the arrival at a result, or `null` on any other
 * screen. A key rather than a flag because the quiz can reach a result more
 * than once — restarting parks question one on top of the old one — and each
 * arrival deserves its own hold rather than inheriting the last one's
 * dismissal.
 */
export function useProgressVisible(resultKey: number | null): boolean {
  const shouldReduceMotion = useReducedMotion();

  // Keep the completed bar visible for one quiet beat. On the result it then
  // fades while its own height and gap collapse, which lets the card below it
  // settle into the released space instead of jumping there in one frame.
  const [dismissed, setDismissed] = useState<number | null>(null);
  useEffect(() => {
    if (resultKey === null) return;

    const timer = window.setTimeout(
      () => setDismissed(resultKey),
      shouldReduceMotion ? REDUCED_PROGRESS_HOLD : RESULT_PROGRESS_HOLD,
    );
    return () => window.clearTimeout(timer);
  }, [resultKey, shouldReduceMotion]);

  return resultKey === null || dismissed !== resultKey;
}

/**
 * The track and its fill, without any opinion about where the bar sits.
 *
 * Both placements draw the same thing in the same way and differ only in
 * height, colour and corner, so the drawing lives here once and the two callers
 * below hand in the classes that separate them.
 */
function ProgressTrack({
  progress,
  trackClassName,
  fillClassName,
  shouldReduceMotion,
}: {
  progress: number;
  trackClassName: string;
  fillClassName: string;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Voortgang van de huidtest"
      className={`w-full overflow-hidden ${trackClassName}`}
    >
      {/* A full-width bar slid left behind the track's clip, rather than
          a narrow one that grows. Two reasons, and the second is why it
          is not a scaleX either: width animates layout every frame where
          a transform stays on the compositor, and scaling a 6px pill
          sideways squashes its round cap into an ellipse. Translating
          keeps the cap circular and hides the other end off-track. */}
      <div
        className={`h-full w-full ${fillClassName}`}
        style={{
          transform: `translateX(-${100 - progress}%)`,
          transition: shouldReduceMotion
            ? "none"
            : "transform 400ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </div>
  );
}

/**
 * The bar pinned to the top edge of the window, for a surface whose own top
 * edge is not the top of anything the reader can see — the mobile sheet stops
 * at 92svh, and the strip of dimmed page above it was doing nothing.
 *
 * Drawn by the surface rather than by the quiz, and that placement is the whole
 * reason this is a separate export. Inside the quiz it could only ever be a
 * portal, and a portal unmounts with its owner: when the sheet closes, the quiz
 * and the bar go at once, so the bar's own exit never got a frame and it
 * vanished the instant the slide-out finished. As a sibling of the sheet it
 * sits in the surface's own `<AnimatePresence>`, which holds it long enough to
 * fade with everything else.
 *
 * Kept mounted for as long as the surface is open, and hidden by animating its
 * opacity rather than by unmounting. That is not a style choice either: an
 * `<AnimatePresence>` around it would install a presence context of its own and
 * shadow the surface's, so the bar would never hear that the surface is
 * leaving — which is the original bug wearing a different hat. One `animate`
 * covers the result screen, where the bar goes and the sheet stays, and `exit`
 * covers the close, where both go.
 *
 * Colours are picked for that dimmed strip, where the inline bar's 5%-ink track
 * would vanish: the site's ink for the track, the CTA orange for the fill.
 */
export function HuidtestViewportProgress({
  progress,
  show,
}: {
  progress: number;
  /** From `useProgressVisible`, by way of whoever is drawing this. */
  show: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    // z-[56] clears the sheet at z-[55] and stays under the booking sheet's
    // z-[60]. Nothing here is focusable, so sitting outside the test's `inert`
    // subtree costs the focus trap nothing.
    //
    // It leaves ahead of the sheet rather than with it. Matching the sheet's
    // own 0.28s left the bar still legible at the top of a window the sheet had
    // nearly finished vacating, which read as it hanging on; going first, and
    // easing out so most of the fade happens in the first frames, puts it away
    // while the slide is still the thing being watched.
    <m.div
      aria-hidden={!show}
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.16, ease: "easeOut" }
      }
      className="pointer-events-none fixed inset-x-0 top-0 z-[56]"
    >
      {/* Square and full-bleed: a pill's rounded ends sitting flush against the
          window's own edges read as a mistake rather than as a shape. Thinner
          than the inline bar as well — full-bleed it spans four times the
          width, and the same 6px across all of that reads as a band rather
          than as a measure. */}
      <ProgressTrack
        progress={progress}
        trackClassName="h-[3px] bg-ink-primary"
        fillClassName="bg-cta"
        shouldReduceMotion={shouldReduceMotion}
      />
    </m.div>
  );
}

export function HuidtestProgress({
  progress,
  show,
}: {
  /** 0–100. Rounded for `aria-valuenow`, used unrounded for the fill. */
  progress: number;
  /** From `useProgressVisible`, which the result's action bar reads as well. */
  show: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    // The completed bar gets one quiet beat on the result, then leaves its
    // opacity, height and gap together. The advice below can consequently
    // settle into the released space without a sudden layout jump.
    <AnimatePresence initial={false}>
      {show && (
        <m.div
          key="quiz-progress"
          initial={false}
          animate={{ height: "auto", marginBottom: 20, opacity: 1 }}
          exit={
            shouldReduceMotion
              ? { height: 0, marginBottom: 0, opacity: 0, transition: { duration: 0 } }
              : { height: 0, marginBottom: 0, opacity: 0, transition: PROGRESS_EXIT }
          }
          className="shrink-0 overflow-hidden"
        >
          {/* This same bar draws on the mobile /huidtest route as well as the
              desktop panel, where its 5%-ink track came from. White is a
              desktop-only override: on mobile the bar sits directly on the
              page's cream, where solid white would be a hard-edged block
              rather than a track. */}
          <ProgressTrack
            progress={progress}
            trackClassName="h-[6px] rounded-full bg-ink-primary/5 md:bg-white/60"
            fillClassName="rounded-full bg-ink-primary"
            shouldReduceMotion={shouldReduceMotion}
          />
        </m.div>
      )}
    </AnimatePresence>
  );
}
