import type { Question } from "@/lib/huidtest/config";
import { onlineAdviceExitReason, skipsKleurstijl } from "@/lib/huidtest/decide";
import type { ExitReason, QuizAnswers } from "@/lib/huidtest/types";

/**
 * Which screen the huidtest is on, and what moves it to the next one.
 *
 * Here rather than in the component because none of it is React: given the
 * answers so far, the question that was just confirmed decides the next screen
 * the same way whether that screen is a panel, a route, or a test. It sits
 * beside `decide.ts` for the same reason that does — logic the studio's advice
 * depends on belongs where it can be read and tested without a browser.
 *
 * Nothing here imports framer-motion, and nothing here performs a side effect.
 * Direction, gestures and animation are the UI layer's; history and analytics
 * are described by the engine above these functions and carried out by its
 * interpreter.
 */

export type Step =
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
export const START_PROGRESS = 20;

// The age gate is the first real step, so it should not greet someone with an
// empty track. Keep it visibly lighter than the first bank question, which
// starts at the endowed 20% mark.
export const INTRO_PROGRESS = START_PROGRESS / 2;

/**
 * Where a visit begins: the intro, or straight to the advice a link carries. A
 * link carrying a safety answer lands on the exit, the same as answering it
 * would — the age check is skippable, those answers are not.
 */
export function openingStep(shared: QuizAnswers | null): Step {
  if (!shared) return { kind: "intro" };
  const exitReason = onlineAdviceExitReason(shared);
  if (exitReason) return { kind: "exit", reason: exitReason };
  return { kind: "resultaat" };
}

export function isComplete(a: Partial<QuizAnswers>): a is QuizAnswers {
  if (!a.huidreactie || !a.haarkleur || !a.ervaring || !a.doel || !a.huidgevoel) return false;
  return skipsKleurstijl(a.huidgevoel) || Boolean(a.kleurstijl);
}

/** Where the quiz goes once the question at `index` has been confirmed. */
export function nextStep(
  index: number,
  answers: Partial<QuizAnswers>,
  questions: readonly Question[],
): Step {
  const question = questions[index];
  const exitReason = onlineAdviceExitReason(answers);

  // Safety answers end the test before any advice exists. Checked on the way
  // out rather than on the tap: picking an option is not the same as standing
  // by it, and being thrown onto an exit screen mid-thought is no way to be
  // told this.
  if (exitReason) return { kind: "exit", reason: exitReason };

  // The last question exists only for a skin that has not already decided the
  // product. Asking it anyway would be asking for an answer nothing reads.
  if (question.key === "huidgevoel" && skipsKleurstijl(answers.huidgevoel!)) {
    return { kind: "resultaat" };
  }
  if (index >= questions.length - 1) return { kind: "resultaat" };
  return { kind: "vraag", index: index + 1 };
}

/**
 * How many questions this visitor is being asked. A sensitive skin never sees
 * the last one, and the bar should count the test they are actually taking.
 *
 * It reads the answer rather than the step, so the denominator changes the
 * moment "gevoelig" is picked — before that answer is confirmed. The bar
 * therefore jumps from 73 to 84 on question five. Existing behaviour, and
 * arguably the honest one: the test really did just get shorter.
 */
export function questionCount(answers: Partial<QuizAnswers>, total: number): number {
  return skipsKleurstijl(answers.huidgevoel ?? "normaal") ? total - 1 : total;
}

/**
 * Defined for every step, including the ones either side of the questions: the
 * bar that carries it is a fixture of the whole quiz, not a thing that comes
 * and goes with them, and a step it had no number for would be the one place it
 * silently held its last value instead.
 */
export function progressFor(
  step: Step,
  answers: Partial<QuizAnswers>,
  totalQuestions: number,
): number {
  if (step.kind === "intro") return INTRO_PROGRESS;
  if (step.kind === "exit") return START_PROGRESS;
  if (step.kind === "resultaat") return 100;

  const asked = questionCount(answers, totalQuestions);
  return START_PROGRESS + ((100 - START_PROGRESS) * step.index) / asked;
}

/** The identity a step keeps while it is on screen, and loses when it leaves. */
export function stepKey(step: Step): string {
  return step.kind === "vraag" ? `vraag-${step.index}` : step.kind;
}

/** What the visitor has picked on the question now showing, if anything. */
export function currentAnswer(
  step: Step,
  answers: Partial<QuizAnswers>,
  questions: readonly Question[],
): string | undefined {
  if (step.kind !== "vraag") return undefined;
  return answers[questions[step.index].key] as string | undefined;
}
