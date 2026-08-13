"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { quietFocus } from "@/lib/quiet-focus";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { INTRO, QUESTIONS } from "@/lib/huidtest/config";
import { decide, skipsKleurstijl } from "@/lib/huidtest/decide";
import type { ExitReason, QuizAnswers } from "@/lib/huidtest/types";
import { CtaButton } from "@/components/huidtest/cta";
import { StepCard } from "@/components/huidtest/step-card";
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

  // A shared link is where this render starts: the answers were in the URL
  // before the first paint. Deriving the opening step from them beats setting
  // state in an effect, which would paint the intro and replace it a frame on.
  const [stack, setStack] = useState<Step[]>(() => [openingStep(shared)]);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(() => shared ?? { tattoo: false });

  const step = stack[stack.length - 1];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasStarted = useRef(false);

  const goTo = useCallback(
    (next: Step) => {
      setStack((current) => [...current, next]);
      if (historyBacked) window.history.pushState({ huidtest: true }, "");
    },
    [historyBacked],
  );

  const pop = () => setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));

  const back = () => {
    // On the route the browser's back button and the one on screen have to
    // agree; routing this one through history is what guarantees that, rather
    // than two implementations that have to be kept in line.
    if (historyBacked) {
      window.history.back();
      return;
    }
    pop();
  };

  useEffect(() => {
    if (!historyBacked) return;

    const onPopState = () =>
      setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));

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

  const progress =
    step.kind === "intro" || step.kind === "exit"
      ? START_PROGRESS
      : START_PROGRESS + ((100 - START_PROGRESS) * answered) / totalQuestions;

  const showsProgress = step.kind === "vraag";

  return (
    // A column that fills whatever it is in, so the action bar can be held on
    // the bottom edge rather than trailing the last option. A question with
    // three answers is shorter than one with four, and a button that moved up
    // with it made the two screens read as different layouts.
    <div className="flex min-h-full w-full flex-col">
      {showsProgress && (
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

          {step.kind === "vraag" && stack.length > 1 && (
            <button
              type="button"
              onClick={back}
              className="mt-4 -ml-2 hidden min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-2 font-sans text-[15px] tracking-[-0.01em] text-muted transition-colors duration-150 hover:text-ink-strong md:inline-flex"
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
          )}
        </div>
      )}

      {step.kind === "intro" && (
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

          <p className="mt-3 max-w-[54ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-ink">
            {INTRO.body}
          </p>

          {/* A rule where the card turns from telling to asking. The gate is a
              different kind of thing from the paragraph above it, and a line
              says so more quietly than white space can at this size. */}
          <h3 className="mt-6 border-t border-line/50 pt-6 font-sans text-[17px] font-semibold tracking-[-0.01em] text-ink-strong">
            {INTRO.vraag}
          </h3>

          <p className="mt-1 max-w-[54ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-muted">
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

      {step.kind === "vraag" && (
        <QuestionCard
          question={QUESTIONS[step.index]}
          headingRef={headingRef}
          selected={answers[QUESTIONS[step.index].key] as string | undefined}
          onSelect={(id) => answer(step.index, id)}
          checkboxChecked={answers.tattoo}
          onCheckboxChange={(checked) => setAnswers((prev) => ({ ...prev, tattoo: checked }))}
          onNext={() => goTo(nextStep(step.index, answers))}
          onBack={stack.length > 1 ? back : undefined}
        />
      )}

      {step.kind === "exit" && (
        <ExitScreen reason={step.reason} headingRef={headingRef} onClose={onClose} />
      )}

      {step.kind === "resultaat" && (
        <Resultaat answers={answers} headingRef={headingRef} onRestart={restart} />
      )}
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
