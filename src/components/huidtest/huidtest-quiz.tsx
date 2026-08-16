"use client";

import { useEffect, useMemo, useRef } from "react";
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
  HuidtestStepStage,
  useHuidtestStage,
} from "@/components/huidtest/huidtest-step-stage";
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
 * that, and is unit-tested without a browser. How a screen travels is not
 * decided here either: `huidtest-step-stage.tsx` owns the gestures and the
 * handover. What is left is composition, and the two things that genuinely
 * belong to the whole column — which heading takes focus, and where it scrolls.
 */

/**
 * Whatever actually scrolls the quiz: a panel's own scroll area, or the page.
 *
 * Found by walking up from the quiz's own root rather than taken from the
 * surface context, because those are not the same element — the context hands
 * down the panel, so a sheet can slide up from its bottom edge, while the thing
 * that scrolls is a box inside it. Asking the DOM which ancestor scrolls is the
 * question actually being asked here, and it answers correctly on the route,
 * where nothing above the quiz scrolls and the page does.
 */
function scrollerFor(root: HTMLElement | null): HTMLElement | Window {
  for (let node = root?.parentElement ?? null; node; node = node.parentElement) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
  }
  return window;
}

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

  // The quiz's own root, used to find whatever is scrolling it. See `scrollerFor`.
  const rootRef = useRef<HTMLDivElement>(null);

  // Movement is the stage's, and it is told the cause of every change below.
  const stage = useHuidtestStage();

  // A step change is two things at once: the stage learns which way the pair of
  // screens travels, and the column they sit in goes back to its top.
  //
  // Not memoised, and it does not need to be: `useHuidtestFlow` keeps this in a
  // ref it refreshes on every commit, so a new identity per render costs
  // nothing and a stale closure over the stage cannot happen.
  const onTransition = ({ cause }: NonNullable<Transition>) => {
    stage.noteTransition(cause);

    // A new screen starts at its top. Without this the offset built up on the
    // screen being left simply stayed: on a phone, restarting from the bottom
    // of the advice painted question one 57px above the viewport and left it
    // there for the length of the transition. Only once the outgoing card
    // stopped taking up room did the document shrink to the viewport, and the
    // browser's own clamp then moved everything into place at once — which is
    // what read as a jump.
    //
    // Reset here rather than in a layout effect, because here the screen being
    // left is still laid out: the document is still tall enough for the scroll
    // to move, and it moves before React commits the screen that replaces it.
    const scroller = scrollerFor(rootRef.current);
    const scrolled = scroller instanceof Window ? window.scrollY > 0 : scroller.scrollTop > 0;
    if (scrolled) scroller.scrollTo(0, 0);
  };

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

  /**
   * `viaSwipe` when the gesture has already moved the step into place.
   *
   * Composed here because it is the one move with two ways in: the finger and
   * the button below. Both raise the flag before the flow is allowed to move —
   * the step animation reads its exit from the render it is leaving, so a flag
   * set afterwards arrives one render too late.
   */
  const back = (viaSwipe = false) => {
    stage.setSwipedBack(viaSwipe);
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

  /** What a swipe has behind this step to pull back in. */
  const peekTarget = stack[stack.length - 2];

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
    <div ref={rootRef} className="relative flex w-full shrink-0 flex-col min-h-full">
      <HuidtestProgress progress={progress} resultKey={resultProgressKey} />

      <HuidtestStepStage
        stage={stage}
        step={step}
        peekTarget={peekTarget}
        isMobile={isMobile}
        shouldReduceMotion={shouldReduceMotion}
        stageRef={stageRef}
        stageWidth={stageWidth}
        questionStageHeight={questionStageHeight}
        stepKey={stepKey}
        renderStep={renderStep}
        onBack={back}
      />

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
