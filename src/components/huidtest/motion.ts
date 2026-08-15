/**
 * The timings the quiz moves on, in one place because they are deliberately
 * shared: the step area and the action bar are two halves of one move, and a
 * bar that left on its own clock would read as a second thing happening.
 *
 * Values only. Which element reads which variant stays with that element.
 */

/**
 * One glide, shared by the step arriving and the step leaving.
 *
 * They used to differ — a longer entrance over a short hop, a shorter exit —
 * on the reasoning that a screen on its way out has nothing left to say. Beside
 * the swipe that reasoning fell apart: the gesture moves both screens as one
 * strip under the finger, and a forward step that crossfaded over a 24px nudge
 * was plainly a different thing to the same move made by hand. Two halves of
 * one strip cannot keep different clocks without a seam opening between them,
 * so there is one duration and one easing, and the distance is the width the
 * swipe pulls back by.
 */
/*
 * A spring rather than a curve, for the same reason the sheets here use one:
 * a step that is dragged and a step that is confirmed should be governed by
 * the same physics, or the button and the finger produce two different moves.
 *
 * Softer than the sheets' own `STACK_SPRING` (300/40), which is tuned for a
 * panel snapping home, but not by as much as it first was: at a stiffness of
 * 80 the glide was smooth and a beat too slow to sit behind a tap. Critical
 * damping — the point where a spring settles without ever crossing its
 * target — is `2 * sqrt(stiffness * mass)`, about 21.9 here. Sitting just
 * under it keeps the settle even without a card that slides past the edge and
 * comes back, which on a question would read as a wobble rather than a move.
 */
export const STEP_SLIDE = { type: "spring", stiffness: 120, damping: 21, mass: 1 } as const;

/**
 * Breathing room between two question cards while they share the stage. It is
 * the same 24px rhythm as the surface padding, and part of the travel itself —
 * not a margin on either card — so forward animation and back-swipe expose the
 * exact same gap without changing either card's resting width.
 */
export const STEP_GAP = 24;

/**
 * For the screens either side of the questions, which have no sibling to slide
 * against: the advice arrives as the progress bar above it closes, and a
 * carousel move on top of that is two things happening at once.
 */
export const STEP_FADE = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

/** No transition at all, for a step change a gesture has already performed. */
export const INSTANT = { duration: 0 };

/**
 * Both ends of a released swipe: carried the rest of the way when it counts as
 * going back, or returned to where it started when it does not.
 *
 * The same spring the buttons move a step on, so that letting go continues the
 * gesture rather than handing it to something with a different idea of weight.
 * It was a short tween for a while, because a spring stops once it is close
 * enough to call itself at rest and that left a sliver of the outgoing card
 * short of the edge — but the step area cuts its own sides now, so there is no
 * longer an edge to fall short of.
 */
export const SWIPE_RELEASE = STEP_SLIDE;

/**
 * How far a swipe has to travel, or how fast, before it counts as going back.
 * The same pair the sheets dismiss on, a notch shorter: this gesture undoes one
 * answer rather than closing the test, so it should not ask for as much
 * commitment as the one that throws the whole thing away.
 */
export const SWIPE_BACK_OFFSET = 60;
export const SWIPE_BACK_VELOCITY = 300;
