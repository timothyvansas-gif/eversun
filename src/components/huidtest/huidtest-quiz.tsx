"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, m, useMotionValue, useTransform } from "framer-motion";
import { quietFocus } from "@/lib/quiet-focus";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { QUESTIONS } from "@/lib/huidtest/config";
import {
  currentAnswer as answerFor,
  progressFor,
  stepKey as keyFor,
  type Step,
  type Transition,
} from "@/lib/huidtest/flow";
import { useHuidtestFlow } from "@/components/huidtest/use-huidtest-flow";
import { useHuidtestStageMetrics } from "@/components/huidtest/use-huidtest-stage-metrics";
import {
  INSTANT,
  STEP_FADE,
  STEP_GAP,
  STEP_SLIDE,
  SWIPE_BACK_OFFSET,
  SWIPE_BACK_VELOCITY,
  SWIPE_RELEASE,
} from "@/components/huidtest/motion";
import { HuidtestProgress } from "@/components/huidtest/huidtest-progress";
import { HuidtestIntro } from "@/components/huidtest/huidtest-intro";
import { HuidtestQuestionActions } from "@/components/huidtest/huidtest-question-actions";
import { ResultGuard } from "@/components/huidtest/result-guard";
import type { QuizAnswers } from "@/lib/huidtest/types";
import type { ZonnebankSlug } from "@/lib/whatsapp";
import QuestionCard from "@/components/huidtest/question-card";
import ExitScreen from "@/components/huidtest/exit-screen";

/**
 * The quiz, top to bottom, wherever it is shown: a side panel on desktop, a
 * bottom sheet on a phone, the /huidtest route for a shared link.
 *
 * One screen at a time, and one place that decides which — the stack below.
 * Everything else (the progress bar, both back buttons) reads from it rather
 * than counting for itself, because a second counter is a second thing to get
 * out of step with the answers.
 *
 * Which screen follows which is not decided here: `lib/huidtest/flow.ts` owns
 * that, and is unit-tested without a browser. What is left in this file is the
 * part that genuinely needs one — measurement, gestures and motion.
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

export default function HuidtestQuiz({
  shared = null,
  entry = "direct",
  bekekenBank,
  historyBacked = false,
  onClose,
}: {
  /**
   * Answers lifted off a shared link, decoded by whoever owns the URL — the
   * route reads them server-side, a panel never has any. Handed in rather than
   * read here, so this component behaves the same in both.
   */
  shared?: QuizAnswers | null;
  entry?: "home_sectie" | "hero_link" | "direct" | "zonnebank_kaart";
  /** The card that opened this quiz. It adds context to the result, never bias. */
  bekekenBank?: ZonnebankSlug;
  /**
   * Whether going back moves through the browser's own history. True on the
   * route, where the quiz is the page and back means the previous question.
   * False in a panel: the page underneath owns the history, and a panel that
   * hijacked it would send someone browsing away instead of back a question.
   */
  historyBacked?: boolean;
  /** Lets a panel close itself from inside the quiz. */
  onClose?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_QUERY);

  // Which way the last move went, so a step leaves the way the next one comes
  // in. Forward and back looking identical is what makes a wizard feel like it
  // is shuffling rather than moving.
  const [direction, setDirection] = useState<1 | -1>(1);

  // Whether the step now on screen was carried there by the gesture. Its
  // entrance would otherwise run a second time over a screen that has finished
  // arriving, which reads as the question flinching once it lands.
  const [swipedBack, setSwipedBack] = useState(false);

  // The cause the flow reports is the only thing movement is decided from.
  // Going back never clears the swipe flag: the gesture raises it before it asks
  // to go back, and clearing it here would put an entrance animation over a
  // screen the finger has already carried into place.
  const onTransition = useCallback(({ cause }: NonNullable<Transition>) => {
    const forward = cause === "advance" || cause === "restart";
    setDirection(forward ? 1 : -1);
    if (forward) setSwipedBack(false);
  }, []);

  const config = useMemo(
    () => ({ questions: QUESTIONS, entry, historyBacked }),
    [entry, historyBacked],
  );
  const { state, dispatch } = useHuidtestFlow(shared, config, onTransition);
  const { stack, answers } = state;

  const step = stack[stack.length - 1];

  // Each arrival at a result gets its own hold, so restarting and coming back
  // to one does not inherit the last one's dismissal.
  const resultProgressKey = step.kind === "resultaat" ? stack.length : null;

  const headingRef = useRef<HTMLHeadingElement>(null);

  const { stageRef, stageWidth, questionStageHeight, recordQuestionHeight } =
    useHuidtestStageMetrics();

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

  /** `viaSwipe` when the gesture has already moved the step into place. */
  const back = (viaSwipe = false) => {
    // Raised before the flow can move, not with it: the step animation reads
    // its exit from the render it is leaving, so a flag set afterwards arrives
    // one render too late.
    setSwipedBack(viaSwipe);
    dispatch({ type: "backRequest" });
  };

  // Focus follows the screen, so a screen reader announces the new question
  // instead of leaving the cursor on a button that no longer exists. Quietly:
  // nobody tabbed here, and a ring landing on a heading by itself reads as a
  // glitch — same treatment the overlays give their returned focus.
  useEffect(() => {
    const heading = headingRef.current;
    if (heading) quietFocus(heading);
  }, [step]);

  const restart = () => dispatch({ type: "restart" });

  const progress = progressFor(step, answers, QUESTIONS.length);

  const stepKey = keyFor(step);

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
  const peekTarget = stack[stack.length - 2];
  const canSwipeBack =
    isMobile &&
    step.kind === "vraag" &&
    (peekTarget?.kind === "vraag" || peekTarget?.kind === "intro");

  const currentAnswer = answerFor(step, answers, QUESTIONS);

  const renderStep = (s: Step) => (
    <>
      {s.kind === "intro" && (
        <HuidtestIntro
          headingRef={headingRef}
          onConfirm={(age) => dispatch({ type: "confirmAge", age })}
        />
      )}

      {s.kind === "vraag" && (
        <QuestionCard
          question={QUESTIONS[s.index]}
          headingRef={headingRef}
          selected={answers[QUESTIONS[s.index].key] as string | undefined}
          onSelect={(id) => dispatch({ type: "select", index: s.index, id })}
          checkboxChecked={answers.tattoo}
          onCheckboxChange={(checked) => dispatch({ type: "toggleTattoo", checked })}
          onHeightChange={isMobile ? undefined : recordQuestionHeight}
        />
      )}

      {s.kind === "exit" && (
        <ExitScreen reason={s.reason} headingRef={headingRef} onClose={onClose} />
      )}

      {s.kind === "resultaat" && (
        <ResultGuard
          answers={answers}
          bekekenBank={bekekenBank}
          headingRef={headingRef}
          onRestart={restart}
        />
      )}
    </>
  );

  return (
    // A column that fills whatever it is in, so the action bar can be held on
    // the bottom edge rather than trailing the last option. A question with
    // three answers is shorter than one with four, and a button that moved up
    // with it made the two screens read as different layouts.
    //
    // `shrink-0` is what lets the bar stick. As a flex child of the scrolling
    // surface this column would otherwise be allowed to shrink to the height
    // of that surface: `min-h-full` sets a minimum of 100%, and in doing so
    // replaces the automatic one that would have held it at its content's
    // height. A question taller than the surface then left the column at the
    // surface's height with the bar hanging below its own bottom edge — and a
    // sticky element cannot be held anywhere its containing block does not
    // reach, so it simply scrolled away with the questions.
    <div className="relative flex w-full shrink-0 flex-col min-h-full">
      <HuidtestProgress progress={progress} resultKey={resultProgressKey} />

      {/* The step area: cards only, and the positioning context the step behind
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
          past it to the surface it belongs to. */}
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

            // Carry the gesture through to the edge before the step changes, so
            // the screen the finger was pulling in is already where it lands.
            // The swap then happens on a still frame: same content, one from
            // the peek layer and one from the step itself.
            animate(
              dragX,
              (stageRef.current?.offsetWidth ?? 0) + STEP_GAP,
              SWIPE_RELEASE,
            ).then(() => {
              back(true);
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

      <HuidtestQuestionActions
        visible={step.kind === "vraag"}
        handsOver={step.kind === "resultaat"}
        canConfirm={Boolean(currentAnswer)}
        // The narrowing is only for the type checker: the bar is not drawn on
        // anything but a question, so this cannot be called on another screen.
        onNext={() => {
          if (step.kind === "vraag") dispatch({ type: "advance", index: step.index });
        }}
        onBack={() => back()}
      />
    </div>
  );
}
