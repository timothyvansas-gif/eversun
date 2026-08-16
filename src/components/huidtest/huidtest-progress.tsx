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
 * own business: on a phone the result's action bar comes up out of the sheet's
 * bottom edge as this one closes, and a second timer counting to the same beat
 * is a second thing to fall out of step with.
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
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Voortgang van de huidtest"
            className="h-[6px] w-full overflow-hidden rounded-full bg-ink-primary/5"
          >
            {/* A full-width bar slid left behind the track's clip, rather than
                a narrow one that grows. Two reasons, and the second is why it
                is not a scaleX either: width animates layout every frame where
                a transform stays on the compositor, and scaling a 6px pill
                sideways squashes its round cap into an ellipse. Translating
                keeps the cap circular and hides the other end off-track. */}
            <div
              className="h-full w-full rounded-full bg-ink-primary"
              style={{
                transform: `translateX(-${100 - progress}%)`,
                transition: shouldReduceMotion
                  ? "none"
                  : "transform 400ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
