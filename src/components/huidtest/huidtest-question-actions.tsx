"use client";

import { AnimatePresence } from "framer-motion";
import { CtaButton } from "@/components/huidtest/cta";
import { StickyActions } from "@/components/huidtest/sticky-actions";
import { INSTANT, STEP_FADE } from "@/components/huidtest/motion";

/**
 * How the action bar leaves: quietly, unless the screen it is leaving for has
 * a bar of its own to put in its place, in which case there is nothing to show
 * and it goes on the spot. Read at the moment it leaves — see `custom` below.
 */
const BAR_VARIANTS = {
  exit: (handsOver: boolean) =>
    handsOver
      ? { opacity: 0, transition: INSTANT }
      : { opacity: 0, y: 16, transition: STEP_FADE },
};

/**
 * One bar for every question, mounted once and left alone. It used to be
 * rendered inside the question, which cost it twice over: it remounted on every
 * step, so it replayed its entrance and resized as it went, and it sat under
 * whatever transform moved the step, which is what detached its `sticky` from
 * the scrolling surface mid-swipe.
 *
 * Out here it is a fixture — the questions slide past it and it does not move.
 * Which also means it can no longer come and go with the answer: the way on is
 * always there, and says so by being disabled until there is something to
 * confirm.
 *
 * It does still have to leave when the questions do, and swiping back to the
 * age gate is where that showed: the bar was simply gone the frame the step
 * changed, while the card it belonged to was still on its way out. Now it drops
 * and fades on the way. `popLayout` hands its height back at the start rather
 * than the end, which is what the step area grows into — so the space closes
 * while the bar is still visibly leaving, instead of after it has blinked out.
 *
 * Except into the advice, which brings a bar of its own. There the two are the
 * same fixture with different buttons on it, and playing one out while the
 * other comes in is a handover made visible for no reason — `popLayout` takes
 * the leaving one out of the flow to close the gap, so it spent its fade lying
 * across the photo of the bed. It goes on the spot instead, and the advice's
 * own bar is already standing where it stood.
 */
export function HuidtestQuestionActions({
  visible,
  handsOver,
  canConfirm,
  onNext,
  onBack,
}: {
  /** The bar belongs to the questions, and leaves with them. */
  visible: boolean;
  /** Whether the screen being left for brings an action bar of its own. */
  handsOver: boolean;
  canConfirm: boolean;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <AnimatePresence initial={false} mode="popLayout" custom={handsOver}>
      {visible && (
        <StickyActions
          key="quiz-actions"
          className="mt-7 shrink-0 md:mt-4"
          variants={BAR_VARIANTS}
          exit="exit"
        >
          <div className="flex items-center gap-3 md:justify-between">
            {/* First in the DOM so the primary action is reached before the
                secondary back action. CSS order keeps back visually left. */}
            <CtaButton
              className="order-2 flex-1 md:flex-none"
              disabled={!canConfirm}
              onClick={onNext}
            >
              Volgende
            </CtaButton>

            {/* Thumb-height, thumb-width, and beside the button it undoes rather
                than at the top of a sheet. Unlike the decorative CTA arrows
                removed elsewhere, this icon communicates the control's only
                action: returning to the previous question. */}
            <button
              type="button"
              onClick={onBack}
              aria-label="Terug naar de vorige vraag"
              className="order-1 flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink-primary/25 text-ink-strong transition-colors duration-150 hover:border-ink-primary md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M13.5 8h-9m0 0L8 4m-3.5 4L8 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </button>

            {/* The panel's own back, at the button's own baseline rather than
                pinned above the questions: up there it moved every time the
                bar under it changed height, which on a panel tall enough to
                never scroll is a jump with nothing to blame it on. Mounted for
                every question rather than only once the stack allows it — the
                stack always does, since a step this bar is drawn on has always
                come from somewhere, so a condition here would never once have
                been false in practice. */}
            <button
              type="button"
              onClick={onBack}
              className="order-1 hidden min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-2 font-sans text-[15px] tracking-[-0.01em] text-zinc-500 transition-colors duration-150 hover:text-zinc-900 md:inline-flex"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Terug
            </button>

          </div>
        </StickyActions>
      )}
    </AnimatePresence>
  );
}
