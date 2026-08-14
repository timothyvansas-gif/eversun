"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, m, useMotionValue, useTransform } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import { quietFocus } from "@/lib/quiet-focus";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { INTRO, QUESTIONS } from "@/lib/huidtest/config";
import { decide, skipsKleurstijl } from "@/lib/huidtest/decide";
import type { ExitReason, QuizAnswers } from "@/lib/huidtest/types";
import { CtaButton } from "@/components/huidtest/cta";
import { StepCard } from "@/components/huidtest/step-card";
import { StickyActions } from "@/components/huidtest/sticky-actions";
import QuestionCard from "@/components/huidtest/question-card";
import ExitScreen from "@/components/huidtest/exit-screen";
import ResultScreen from "@/components/huidtest/result-screen";

/**
 * The quiz, top to bottom, wherever it is shown: a side panel on desktop, a
 * bottom sheet on a phone, the /huidtest route for a shared link.
 *
 * One screen at a time, and one place that decides which — the stack below.
 * Everything else (the progress bar, both back buttons) reads from it rather
 * than counting for itself, because a second counter is a second thing to get
 * out of step with the answers.
 */

type Step =
  | { kind: "intro" }
  | { kind: "vraag"; index: number }
  | { kind: "exit"; reason: ExitReason }
  | { kind: "resultaat" };

/**
 * The bar starts filled rather than empty. Endowed progress: someone who can
 * see they are already under way finishes more often than someone staring at
 * zero, and the first question genuinely is not the start — the age check is
 * behind them.
 */
const START_PROGRESS = 20;

// The age gate is the first real step, so it should not greet someone with an
// empty track. Keep it visibly lighter than the first bank question, which
// starts at the endowed 20% mark.
const INTRO_PROGRESS = START_PROGRESS / 2;

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
const STEP_SLIDE = { type: "spring", stiffness: 120, damping: 21, mass: 1 } as const;

/**
 * Breathing room between two question cards while they share the stage. It is
 * the same 24px rhythm as the surface padding, and part of the travel itself —
 * not a margin on either card — so forward animation and back-swipe expose the
 * exact same gap without changing either card's resting width.
 */
const STEP_GAP = 24;

/**
 * For the screens either side of the questions, which have no sibling to slide
 * against: the advice arrives as the progress bar above it closes, and a
 * carousel move on top of that is two things happening at once.
 */
const STEP_FADE = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

/** No transition at all, for a step change a gesture has already performed. */
const INSTANT = { duration: 0 };

/**
 * What a step needs to know to change places: how far it travels and in which
 * direction — negative going back — and whether a finger has already done the
 * moving. A travel of zero means the step has no sibling to slide against and
 * fades instead.
 */
type StepMotion = { travel: number; instant: boolean };

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
const SWIPE_RELEASE = STEP_SLIDE;

/**
 * How far a swipe has to travel, or how fast, before it counts as going back.
 * The same pair the sheets dismiss on, a notch shorter: this gesture undoes one
 * answer rather than closing the test, so it should not ask for as much
 * commitment as the one that throws the whole thing away.
 */
const SWIPE_BACK_OFFSET = 60;
const SWIPE_BACK_VELOCITY = 300;

export default function HuidtestQuiz({
  shared = null,
  entry = "direct",
  historyBacked = false,
  onClose,
}: {
  /**
   * Answers lifted off a shared link, decoded by whoever owns the URL — the
   * route reads them server-side, a panel never has any. Handed in rather than
   * read here, so this component behaves the same in both.
   */
  shared?: QuizAnswers | null;
  entry?: "home_sectie" | "hero_link" | "direct";
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

  // A shared link is where this render starts: the answers were in the URL
  // before the first paint. Deriving the opening step from them beats setting
  // state in an effect, which would paint the intro and replace it a frame on.
  const [stack, setStack] = useState<Step[]>(() => [openingStep(shared)]);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(() => shared ?? { tattoo: false });

  const step = stack[stack.length - 1];

  // Which way the last move went, so a step leaves the way the next one comes
  // in. Forward and back looking identical is what makes a wizard feel like it
  // is shuffling rather than moving.
  const [direction, setDirection] = useState<1 | -1>(1);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasStarted = useRef(false);

  // How far the swipe has pulled the current step, and the step behind it
  // riding the same value one screen-width back. The step area is measured off
  // the stage rather than the viewport: in a panel the two are not the same.
  const stageRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const peekX = useTransform(
    dragX,
    (v) => v - (stageRef.current?.offsetWidth ?? 0) - STEP_GAP,
  );
  const [peekStep, setPeekStep] = useState<Step | null>(null);

  // The width a step crosses when it is not a finger moving it. Measured rather
  // than assumed, because it is also the basis of the back-swipe; STEP_GAP is
  // added to both paths below. Watched, since a phone that turns and a panel
  // that is not the viewport both change it.
  const [stageWidth, setStageWidth] = useState(0);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const sync = () => setStageWidth(stage.offsetWidth);
    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Questions do not all take the same number of lines, but the controls below
  // them should not move every time that copy changes. On a desktop surface we
  // keep the tallest rendered question as the stage's floor. QuestionCard
  // reports its actual size, so this follows copy, fonts and panel width rather
  // than relying on a height that can quietly go stale. Mobile deliberately
  // keeps its natural height: there the sheet scrolls and the action bar sticks
  // to its bottom edge.
  const [questionStageHeight, setQuestionStageHeight] = useState(0);
  const recordQuestionHeight = useCallback(
    (height: number) => {
      // Read the real viewport here as well as gating the prop below. The quiz
      // route can hydrate from a server render that cannot know the breakpoint;
      // a phone must never be recorded as the desktop height during that handoff.
      if (window.matchMedia(MOBILE_QUERY).matches) return;
      setQuestionStageHeight((current) => (height > current ? height : current));
    },
    [],
  );

  // Whether the step now on screen was carried there by the gesture. Its
  // entrance would otherwise run a second time over a screen that has finished
  // arriving, which reads as the question flinching once it lands.
  const [swipedBack, setSwipedBack] = useState(false);

  const goTo = useCallback(
    (next: Step) => {
      setDirection(1);
      setSwipedBack(false);
      setStack((current) => [...current, next]);
      if (historyBacked) window.history.pushState({ huidtest: true }, "");
    },
    [historyBacked],
  );

  const pop = () => {
    setDirection(-1);
    setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
  };

  /** `viaSwipe` when the gesture has already moved the step into place. */
  const back = (viaSwipe = false) => {
    setSwipedBack(viaSwipe);

    // On the route the browser's back button and the one on screen have to
    // agree; routing this one through history is what guarantees that, rather
    // than two implementations that have to be kept in line.
    if (historyBacked) {
      setDirection(-1);
      window.history.back();
      return;
    }
    pop();
  };

  useEffect(() => {
    if (!historyBacked) return;

    const onPopState = () => {
      setDirection(-1);
      setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [historyBacked]);

  // Focus follows the screen, so a screen reader announces the new question
  // instead of leaving the cursor on a button that no longer exists. Quietly:
  // nobody tabbed here, and a ring landing on a heading by itself reads as a
  // glitch — same treatment the overlays give their returned focus.
  useEffect(() => {
    const heading = headingRef.current;
    if (heading) quietFocus(heading);
  }, [step]);

  // One place that reports leaving the quiz, whether the visitor answered their
  // way here or arrived on a shared link.
  useEffect(() => {
    if (step.kind === "exit") trackEvent("huidtest_exit", { reden: step.reason });
  }, [step]);

  const handleAge = (age: "ok" | "minor") => {
    if (age === "minor") {
      goTo({ kind: "exit", reason: "minor" });
      return;
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      trackEvent("huidtest_start", { entry });
    }
    goTo({ kind: "vraag", index: 0 });
  };

  /** Where the quiz goes once the question at `index` has been confirmed. */
  const nextStep = (index: number, current: Partial<QuizAnswers>): Step => {
    // A skin that always burns ends the test, before any advice exists. Checked
    // on the way out rather than on the tap: picking an option is not the same
    // as standing by it, and being thrown onto an exit screen mid-thought is no
    // way to be told this.
    if (index === 0 && current.huidreactie === "type1") return { kind: "exit", reason: "type1" };

    // Question 5 exists only for a skin that has not already decided the
    // product. Asking it anyway would be asking for an answer nothing reads.
    if (index === 3 && skipsKleurstijl(current.huidgevoel!)) return { kind: "resultaat" };
    if (index >= QUESTIONS.length - 1) return { kind: "resultaat" };
    return { kind: "vraag", index: index + 1 };
  };

  const answer = (index: number, id: string) => {
    const question = QUESTIONS[index];

    setAnswers((prev) => ({ ...prev, [question.key]: id }) as Partial<QuizAnswers>);
    trackEvent("huidtest_vraag", { vraag: question.key, antwoord: id });
  };

  const restart = () => {
    setAnswers({ tattoo: false });
    goTo({ kind: "vraag", index: 0 });
  };

  const totalQuestions = skipsKleurstijl(answers.huidgevoel ?? "normaal")
    ? QUESTIONS.length - 1
    : QUESTIONS.length;

  const answered = step.kind === "vraag" ? step.index : 0;

  // Defined for every step, including the ones either side of the questions:
  // the bar that carries it is a fixture of the whole quiz now, not a thing
  // that comes and goes with them, and a step it has no number for would be
  // the one place it silently held its last value instead.
  const progress =
    step.kind === "intro"
      ? INTRO_PROGRESS
      : step.kind === "exit"
        ? START_PROGRESS
        : step.kind === "resultaat"
          ? 100
          : START_PROGRESS + ((100 - START_PROGRESS) * answered) / totalQuestions;

  const stepKey = step.kind === "vraag" ? `vraag-${step.index}` : step.kind;

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

  /** What the visitor has picked on the question now showing, if anything. */
  const currentAnswer =
    step.kind === "vraag" ? (answers[QUESTIONS[step.index].key] as string | undefined) : undefined;

  const renderStep = (s: Step) => (
    <>
      {s.kind === "intro" && (
        // The whole opening on one card: what the test is, the law it works
        // under, and the gate itself. Split across the surface it read as three
        // unrelated blocks; together it is one thing to answer.
        <StepCard>
          <h2
            ref={headingRef as React.RefObject<HTMLHeadingElement>}
            tabIndex={-1}
            className="font-display text-ink-strong text-[clamp(24px,4.5vw,32px)] font-medium leading-tight tracking-[-0.01em] outline-none"
          >
            {INTRO.kop}
          </h2>

          <p className="mt-3 max-w-[54ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
            {INTRO.body}
          </p>

          {/* A rule where the card turns from telling to asking. The gate is a
              different kind of thing from the paragraph above it, and a line
              says so more quietly than white space can at this size. */}
          <h3 className="mt-6 border-t border-line/30 pt-6 font-sans text-[17px] font-semibold tracking-[-0.01em] text-ink-strong">
            {INTRO.vraag}
          </h3>

          <p className="mt-1 max-w-[54ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
            {INTRO.wettelijk}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <CtaButton onClick={() => handleAge("ok")}>{INTRO.ja}</CtaButton>
            <CtaButton variant="outline" onClick={() => handleAge("minor")}>
              {INTRO.nee}
            </CtaButton>
          </div>
        </StepCard>
      )}

      {s.kind === "vraag" && (
        <QuestionCard
          question={QUESTIONS[s.index]}
          headingRef={headingRef}
          selected={answers[QUESTIONS[s.index].key] as string | undefined}
          onSelect={(id) => answer(s.index, id)}
          checkboxChecked={answers.tattoo}
          onCheckboxChange={(checked) => setAnswers((prev) => ({ ...prev, tattoo: checked }))}
          onHeightChange={isMobile ? undefined : recordQuestionHeight}
        />
      )}

      {s.kind === "exit" && (
        <ExitScreen reason={s.reason} headingRef={headingRef} onClose={onClose} />
      )}

      {s.kind === "resultaat" && (
        <Resultaat answers={answers} headingRef={headingRef} onRestart={restart} />
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
      {/* A fixture of every step, the advice included, so that arriving never
          costs a jump. It was worth trying to retire the full bar on the
          result — it has nothing left to report there — but every way of
          taking it away moved it: closing its height ran a fill and a
          collapse along the same 6px rule while the card slid in beside it,
          and no amount of fading that line first stopped the space under it
          from shifting. A bar that simply sits there full is the quieter
          answer, and it leaves the advice as the only thing that moves. */}
      <div className="mb-5 shrink-0">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Voortgang van de huidtest"
          className="h-[6px] w-full overflow-hidden rounded-full bg-line/40"
        >
          {/* A full-width bar slid left behind the track's clip, rather than
              a narrow one that grows. Two reasons, and the second is why it
              is not a scaleX either: width animates layout every frame where
              a transform stays on the compositor, and scaling a 6px pill
              sideways squashes its round cap into an ellipse. Translating
              keeps the cap circular and hides the other end off-track. */}
          <div
            className="h-full w-full rounded-full bg-accent"
            style={{
              transform: `translateX(-${100 - progress}%)`,
              transition: shouldReduceMotion
                ? "none"
                : "transform 400ms cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
      </div>

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

      {/* One bar for every question, mounted once and left alone. It used to be
          rendered inside the question, which cost it twice over: it remounted
          on every step, so it replayed its entrance and resized as it went, and
          it sat under whatever transform moved the step, which is what detached
          its `sticky` from the scrolling surface mid-swipe.

          Out here it is a fixture — the questions slide past it and it does not
          move. Which also means it can no longer come and go with the answer:
          the way on is always there, and says so by being disabled until there
          is something to confirm.

          It does still have to leave when the questions do, and swiping back
          to the age gate is where that showed: the bar was simply gone the
          frame the step changed, while the card it belonged to was still on
          its way out. Now it drops and fades on the way. `popLayout` hands
          its height back at the start rather than the end, which is what the
          step area grows into — so the space closes while the bar is still
          visibly leaving, instead of after it has blinked out.

          Except into the advice, which brings a bar of its own. There the two
          are the same fixture with different buttons on it, and playing one
          out while the other comes in is a handover made visible for no
          reason — `popLayout` takes the leaving one out of the flow to close
          the gap, so it spent its fade lying across the photo of the bed. It
          goes on the spot instead, and the advice's own bar is already
          standing where it stood. */}
      <AnimatePresence initial={false} mode="popLayout" custom={step.kind === "resultaat"}>
        {step.kind === "vraag" && (
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
              disabled={!currentAnswer}
              onClick={() => goTo(nextStep(step.index, answers))}
            >
              Volgende
            </CtaButton>

            {/* Thumb-height, thumb-width, and beside the button it undoes rather
                than at the top of a sheet. Unlike the decorative CTA arrows
                removed elsewhere, this icon communicates the control's only
                action: returning to the previous question. */}
            <button
              type="button"
              onClick={() => back()}
              aria-label="Terug naar de vorige vraag"
              className="order-1 flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-ink-strong transition-colors duration-150 hover:border-[#312019] md:hidden"
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
              onClick={() => back()}
              className="order-1 hidden min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-2 font-sans text-[15px] tracking-[-0.01em] text-muted transition-colors duration-150 hover:text-ink-strong md:inline-flex"
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
    </div>
  );
}

/**
 * The result needs a complete answer set. Anything less means the quiz was
 * entered halfway — a stale panel, a hand-edited link — and the honest response
 * is to start over rather than advise on gaps.
 */
function Resultaat({
  answers,
  headingRef,
  onRestart,
}: {
  answers: Partial<QuizAnswers>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}) {
  const complete = isComplete(answers);
  const advies = complete ? decide(answers) : null;

  useEffect(() => {
    if (advies) {
      trackEvent("huidtest_resultaat", {
        bank: advies.bank,
        stand: advies.stand,
        product: advies.product,
      });
    }
  }, [advies]);

  if (!complete || !advies) {
    return (
      <div>
        <h2
          ref={headingRef as React.RefObject<HTMLHeadingElement>}
          tabIndex={-1}
          className="font-display text-ink-strong text-[clamp(24px,4.5vw,32px)] font-medium leading-tight outline-none"
        >
          Deze test is nog niet af
        </h2>
        <CtaButton className="mt-6" onClick={onRestart}>
          Opnieuw doen
        </CtaButton>
      </div>
    );
  }

  return (
    <ResultScreen answers={answers} advies={advies} headingRef={headingRef} onRestart={onRestart} />
  );
}

/**
 * Where a visit begins: the intro, or straight to the advice a link carries. A
 * link claiming type1 lands on the exit, the same as answering it would — the
 * age check is skippable, that one is not.
 */
function openingStep(shared: QuizAnswers | null): Step {
  if (!shared) return { kind: "intro" };
  if (shared.huidreactie === "type1") return { kind: "exit", reason: "type1" };
  return { kind: "resultaat" };
}

function isComplete(a: Partial<QuizAnswers>): a is QuizAnswers {
  if (!a.huidreactie || !a.ervaring || !a.doel || !a.huidgevoel) return false;
  return skipsKleurstijl(a.huidgevoel) || Boolean(a.kleurstijl);
}
