"use client";

import { useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, animate, m, useMotionValue, useTransform } from "framer-motion";
import type { Step, TransitionCause } from "@/lib/huidtest/flow";
import {
  INSTANT,
  STEP_FADE,
  STEP_GAP,
  STEP_SLIDE,
  SWIPE_BACK_OFFSET,
  SWIPE_BACK_VELOCITY,
  SWIPE_RELEASE,
} from "@/components/huidtest/motion";

/**
 * The step area: the one box where a screen is on its way in or on its way out,
 * and the only place a finger can move one.
 *
 * It owns movement, not flow. Which screen follows which is decided in
 * `lib/huidtest/flow.ts`; what arrives here is the cause of a change that has
 * already been made, and the single question asked of it is which way the pair
 * of screens should travel. Nothing in this file may reach for an answer or
 * decide a step — the moment it does, the layer that watches for a finger is
 * also the layer that ends the test on red hair.
 */

/**
 * What a step needs to know to change places: how far it travels and in which
 * direction — negative going back — and whether a finger has already done the
 * moving. A travel of zero means the step has no sibling to slide against and
 * fades instead.
 */
type StepMotion = { travel: number; instant: boolean };

/**
 * As variants rather than inline props, because that is what lets a step read
 * these values at the moment it leaves instead of at the moment it was last
 * rendered. See the presence below.
 */
const STEP_VARIANTS = {
  enter: ({ travel }: StepMotion) => ({ x: travel, opacity: travel === 0 ? 0 : 1 }),
  center: ({ travel, instant }: StepMotion) => ({
    x: 0,
    opacity: 1,
    transition: instant ? INSTANT : travel === 0 ? STEP_FADE : STEP_SLIDE,
  }),
  exit: ({ travel, instant }: StepMotion) => ({
    x: -travel,
    opacity: travel === 0 ? 0 : 1,
    transition: instant ? INSTANT : travel === 0 ? STEP_FADE : STEP_SLIDE,
  }),
};

/**
 * The stage's own state, held here and handed to the element that renders it.
 *
 * Split off as a hook rather than kept inside the component because two things
 * outside the step area have to reach it before a step can change: the flow,
 * which reports the cause of every change, and the back button in the action
 * bar, which is the swipe's move made without a finger. Both have to be able
 * to speak to this state without knowing how a step travels.
 */
export type HuidtestStage = {
  /** Hand over the cause of a change the flow has just made. */
  noteTransition: (cause: TransitionCause) => void;
  /**
   * The step a released swipe is on its way to, for as long as it is still on
   * its way — `null` at every other moment.
   *
   * Only the card has a reason to wait for the animation to land. Everything
   * outside the step area should be reading this instead of the flow's own
   * step, or it moves a spring's worth of time after the finger let go. See
   * the release below.
   */
  previewStep: Step | null;
  /** For the stage element and the back button. Nothing else reads these. */
  direction: 1 | -1;
  swipedBack: boolean;
  setSwipedBack: (swiped: boolean) => void;
  setPreviewStep: (step: Step | null) => void;
};

export function useHuidtestStage(): HuidtestStage {
  // Which way the last move went, so a step leaves the way the next one comes
  // in. Forward and back looking identical is what makes a wizard feel like it
  // is shuffling rather than moving.
  const [direction, setDirection] = useState<1 | -1>(1);

  // Whether the step now on screen was carried there by the gesture. Its
  // entrance would otherwise run a second time over a screen that has finished
  // arriving, which reads as the question flinching once it lands.
  const [swipedBack, setSwipedBack] = useState(false);

  // Where a released swipe is headed, known from the moment the finger lifts
  // rather than from the moment the card arrives. Held beside the other two
  // because everything that reads it lives outside the step area.
  const [previewStep, setPreviewStep] = useState<Step | null>(null);

  // The cause the flow reports is the only thing movement is decided from.
  // Going back never clears the swipe flag: the gesture raises it before it asks
  // to go back, and clearing it here would put an entrance animation over a
  // screen the finger has already carried into place.
  const noteTransition = (cause: TransitionCause) => {
    const forward = cause === "advance" || cause === "restart";
    setDirection(forward ? 1 : -1);
    if (forward) setSwipedBack(false);
  };

  return { noteTransition, previewStep, direction, swipedBack, setSwipedBack, setPreviewStep };
}

export function HuidtestStepStage({
  stage,
  step,
  peekTarget,
  isMobile,
  shouldReduceMotion,
  stageRef,
  stageWidth,
  questionStageHeight,
  stepKey,
  renderStep,
  onBack,
}: {
  stage: HuidtestStage;
  /** The step on screen. Chosen elsewhere; this box only moves it. */
  step: Step;
  /** What sits behind it in the stack, and so what a swipe can pull back in. */
  peekTarget: Step | undefined;
  isMobile: boolean;
  shouldReduceMotion: boolean;
  /**
   * Measured by `useHuidtestStageMetrics`, which is handed this box rather than
   * owning it: a step area that measured itself would be deciding both what a
   * question may look like and how it moves.
   */
  stageRef: RefObject<HTMLDivElement | null>;
  stageWidth: number;
  questionStageHeight: number;
  /** The identity a step keeps for as long as it is the same screen. */
  stepKey: string;
  renderStep: (step: Step) => ReactNode;
  /**
   * Going back a step. The same call the back button makes, so that a released
   * swipe and a tap arrive at the flow by one route — including the flag both
   * of them have to raise on the way.
   */
  onBack: (viaSwipe?: boolean) => void;
}) {
  const { direction, swipedBack, setSwipedBack, setPreviewStep } = stage;

  // How far the swipe has pulled the current step, and the step behind it
  // riding the same value one screen-width back. The step area is measured off
  // the stage rather than the viewport: in a panel the two are not the same.
  //
  // The width is read off the ref rather than taken from `stageWidth` above,
  // and has to stay that way: this transform does not re-run when that state
  // changes, so it has to see the width at the moment it is evaluated.
  const dragX = useMotionValue(0);
  const peekX = useTransform(
    dragX,
    (v) => v - (stageRef.current?.offsetWidth ?? 0) - STEP_GAP,
  );
  const [peekStep, setPeekStep] = useState<Step | null>(null);

  // A full stage plus the shared gutter, so a step confirmed with the button
  // travels the same distance a step pulled back by a finger does — the advice
  // included. It was held flat for a while because the progress bar above it
  // closes on the same beat, and a 24px nudge arriving into that read as two unrelated
  // things twitching at once; a glide the width of the card is a big enough
  // move to be the one thing happening, and the bar closing under it is then
  // just the room it is settling into. Flat only when the gesture has already
  // done the moving, and when motion is turned down.
  const travel = shouldReduceMotion || swipedBack ? 0 : (stageWidth + STEP_GAP) * direction;

  /** Handed to both halves of a step change, and read as each of them moves. */
  const stepMotion: StepMotion = { travel, instant: swipedBack };

  // Swiping back sits alongside the button rather than replacing it. Only on a
  // phone, only where there is something behind this question, and only for a
  // question or the intro: starting over parks the finished result behind
  // question one, and dragging that into view would expose an advice built on
  // answers that were just cleared.
  const canSwipeBack =
    isMobile &&
    step.kind === "vraag" &&
    (peekTarget?.kind === "vraag" || peekTarget?.kind === "intro");

  return (
    /* The step area: cards only, and the positioning context the step behind
        is parked in. Everything that moves lives in here, and the action bar
        below deliberately does not — a transform on an ancestor is what took
        the bar's `sticky` away from the scrolling surface and left it stuck
        to the sliding layer instead.

        On a phone it takes the height that is going, so the bar rides the
        bottom edge. On the panel it is content-sized, with the tallest
        question as its floor: a button pushed to the panel's bottom loses
        its tie to the question, while a button following every question's
        exact height visibly hops up and down through the test.

        `flex-auto` rather than `flex-1`, which differ only in their basis:
        both grow into spare room, but `flex-1` starts from zero, and a box
        that starts from zero tells the column above it that it needs no
        height at all. The column then sized itself to the surface while a
        long question pushed past it, leaving the action bar below the
        column's own bottom edge — outside the box that is supposed to hold
        it, which is the one place `sticky` cannot hold anything. From a
        basis of `auto` the question's real height reaches the column, and
        the bar stays inside it.

        It clips its own sides, rather than leaving that to the surface. This
        box is inset from the surface by its padding, so a card moved by only
        the surface width still had that much of its edge in view — parked at
        the left until unmount. The travel is this box's width plus the shared
        gutter now; clipping here makes that same geometry exact on both sides
        and for the step a swipe parks behind this one too.

        Cutting both axes is the panel's alone, and is safe because its two
        transitioning cards share one grid cell. That row stays as tall as
        the taller participant until the slide is over, so a shorter incoming
        card cannot move the clip edge through the one still leaving. On a
        phone the old popLayout path stays in place. There this box is a flex
        child filling the surface, and cutting its vertical axis would drop
        its automatic minimum to zero: the question would be cut off with
        nothing left for the sheet to scroll.

        `clip` rather than `hidden`, because the result's own action bar is
        inside this box. `hidden` makes an element a scroll container, and a
        `sticky` child sticks to its nearest one — so the bar stopped
        answering to the surface and started answering to a box sized to fit
        it exactly, which is to say it stopped sticking at all. `clip` cuts
        without ever becoming a scroll container, so the bar keeps looking
        past it to the surface it belongs to. */
    <div
      ref={stageRef}
      style={
        !isMobile && step.kind === "vraag" && questionStageHeight > 0
          ? { minHeight: questionStageHeight }
          : undefined
      }
      className="relative flex flex-auto flex-col overflow-x-clip md:flex-none md:overflow-clip"
    >
      {/* The step being swiped back to, held one stage-width and its gutter to
          the left and pulled along by the same value the drag writes. Rendered
          only while the gesture is live, so the quiz is one screen at every
          other moment — and hidden from screen readers, which are still on
          the step the visitor has not left yet. */}
      {peekStep && (
        <m.div
          aria-hidden="true"
          style={{ x: peekX }}
          className="pointer-events-none absolute inset-0 flex flex-col"
        >
          {renderStep(peekStep)}
        </m.div>
      )}

      {/* The swipe rides on its own element, outside the one that animates the
          step change. Both would write x, and on a single element the drag and
          the entrance fight over it — the same collision the sheet stack hit.

          dragDirectionLock is what keeps the quiz scrollable: the first move
          decides the axis, and a vertical one hands the pointer straight back
          to the scroll container. */}
      <m.div
        className="flex flex-1 flex-col md:grid"
        style={{ x: dragX }}
        drag={canSwipeBack ? "x" : false}
        dragDirectionLock
        // No constraints, and the release settled by hand below. Constrained,
        // framer starts its own spring back to the bound the moment the
        // finger lifts, and that animation and the one that finishes the
        // gesture would both be writing x at once.
        dragMomentum={false}
        // Both flags go up before the step can change, not with it. The step
        // animation reads its exit from the render it is leaving, so a flag
        // set at commit time arrives one render too late and the outgoing
        // question still fades over the one the finger just pulled in.
        onDragStart={() => {
          setPeekStep(peekTarget ?? null);
          setSwipedBack(true);
        }}
        // Back is the only direction with something behind it. Clamped rather
        // than constrained so that dragging the other way meets a wall instead
        // of stretching against one.
        onDrag={() => {
          if (dragX.get() < 0) dragX.set(0);
        }}
        onDragEnd={(_, info) => {
          const commits =
            info.offset.x > SWIPE_BACK_OFFSET || info.velocity.x > SWIPE_BACK_VELOCITY;

          if (!commits) {
            animate(dragX, 0, SWIPE_RELEASE).then(() => {
              setPeekStep(null);
              setSwipedBack(false);
            });
            return;
          }

          // Announce where this is going before it gets there. Only the two
          // cards have a reason to wait for the animation below: the progress
          // bar and the action bar are outside the swap, and holding them back
          // with it is what made a swipe feel a beat slower than the button
          // that does the same thing — the bar and the button jumped once the
          // card had already landed, rather than moving with it.
          //
          // The flow itself stays where it is until the animation is done. This
          // is a statement about what is about to be true, not a step change,
          // and nothing that decides anything may read it.
          setPreviewStep(peekTarget ?? null);

          // Carry the gesture through to the edge before the step changes, so
          // the screen the finger was pulling in is already where it lands.
          // The swap then happens on a still frame: same content, one from
          // the peek layer and one from the step itself.
          animate(
            dragX,
            (stageRef.current?.offsetWidth ?? 0) + STEP_GAP,
            SWIPE_RELEASE,
          ).then(() => {
            onBack(true);
            // Dropped in the same batch the flow moves in, so there is never a
            // frame where the announcement has been withdrawn and the step it
            // announced has not yet arrived.
            setPreviewStep(null);
            dragX.set(0);
            setPeekStep(null);

            // The flag has done its work once the swapped-in step has been
            // painted without an entrance, and it has to be handed back
            // before the next move rather than at the start of it: a step
            // leaves on the props it was rendered with, so a flag still
            // raised here is one the step being left behind reads as "the
            // finger has already moved me" — and it vanished on the spot
            // while its replacement slid in over nothing, which is what made
            // the move after a swipe look like it started halfway.
            requestAnimationFrame(() => setSwipedBack(false));
          });
        }}
      >
        {/* One handover, not two animations in a queue. `mode="wait"` held the
          incoming step until the outgoing one had finished, which left the
          panel empty for a fifth of a second and read as a stutter. On a
          phone popLayout still takes the leaving step out of the flow: the
          sheet owns the available height and scrolls anything taller. In the
          desktop panel both steps instead share one grid cell in sync mode.
          Both then contribute to the row's height while they move, so its
          vertical clip can never cut through the taller one.

          Between questions the pair is one strip: the step arriving and the
          step leaving cover the same width in the same time, so nothing
          fades through anything else and confirming an answer looks like the
          swipe that undoes it, run the other way. The fade is kept for the
          screens with no sibling to travel against.

          A swipe has already done all of that with the finger, so there the
          handover is cut out entirely: the step it pulled in is standing
          where it belongs, and anything played over that is a second
          transition on top of one that already finished.

          Both halves read their direction from `custom` rather than from
          the props they were rendered with. A leaving step keeps the props
          of the render it is leaving, and those still describe the move
          before this one — so after a swipe back, which points the sequence
          left, confirming an answer sent the old question out to the right
          while the new one arrived from the right as well, and the two slid
          straight through each other. `custom` on the presence hands the
          leaving step the direction of the move actually happening. */}
        <AnimatePresence
          mode={isMobile ? "popLayout" : "sync"}
          initial={false}
          custom={stepMotion}
        >
          <m.div
            key={stepKey}
            custom={stepMotion}
            variants={STEP_VARIANTS}
            initial={swipedBack ? false : "enter"}
            animate="center"
            exit="exit"
            className="flex flex-1 flex-col md:col-start-1 md:row-start-1"
          >
            {renderStep(step)}
          </m.div>
        </AnimatePresence>
      </m.div>
    </div>
  );
}
