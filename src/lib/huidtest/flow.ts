import type { AnalyticsEvent } from "@/lib/analytics";
import type { Question } from "@/lib/huidtest/config";
import { decide, onlineAdviceExitReason, skipsKleurstijl } from "@/lib/huidtest/decide";
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

/* ------------------------------------------------------------------ */
/* The transition engine                                               */
/* ------------------------------------------------------------------ */

/**
 * The quiz as a state machine: an action goes in, and what comes out is the new
 * state, everything that should happen as a result, and whether the screen
 * actually changed.
 *
 * The effects are *described* here and *carried out* by the interpreter, which
 * is the whole point. Analytics and browser history are the two things this
 * flow is easiest to get wrong and hardest to see going wrong, and describing
 * them puts their number, their payload and their order inside a plain
 * `toEqual` — in the node environment the project already runs, without a DOM.
 *
 * It also fixes where an event comes from. Reporting the result from a render
 * effect meant reporting it again on every re-render that had nothing to do
 * with the answers; hung off the transition instead, it happens once because
 * the transition happens once.
 */

export type FlowConfig = {
  questions: readonly Question[];
  /** Where the visitor entered the quiz from. Reported once, at the start. */
  entry: Extract<AnalyticsEvent, { name: "huidtest_start" }>["props"]["entry"];
  /**
   * Whether going back travels through the browser's own history. True on the
   * route, where the quiz is the page. False in a panel, where the page
   * underneath owns the history.
   */
  historyBacked: boolean;
};

export type FlowState = {
  stack: Step[];
  answers: Partial<QuizAnswers>;
  /** Whether the start has been reported. Surviving a restart is the point. */
  started: boolean;
};

export type FlowAction =
  | { type: "confirmAge"; age: "ok" | "minor" }
  | { type: "select"; index: number; id: string }
  | { type: "toggleTattoo"; checked: boolean }
  | { type: "advance"; index: number }
  | { type: "backRequest" }
  | { type: "popstate" }
  | { type: "restart" };

/** The events the flow itself reports. The result screen reports its own CTAs. */
type FlowAnalyticsEvent = Extract<
  AnalyticsEvent,
  { name: "huidtest_start" | "huidtest_vraag" | "huidtest_exit" | "huidtest_resultaat" }
>;

export type FlowEffect =
  | ({ type: "track" } & FlowAnalyticsEvent)
  | { type: "historyPush" }
  | { type: "historyBack" };

/**
 * Why the screen changed. The stage reads this and nothing else to decide which
 * way a step travels, so movement policy stays out of the flow: `advance` and
 * `restart` go forward, `back` and `browser-back` go back.
 */
export type TransitionCause = "advance" | "back" | "browser-back" | "restart";

/** `null` when the action left the screen where it was. */
export type Transition = { from: Step; to: Step; cause: TransitionCause } | null;

export type FlowResult = { state: FlowState; effects: FlowEffect[]; transition: Transition };

const ANSWER_DEFAULTS: Partial<QuizAnswers> = { tattoo: false };

/** The screen that step is, and what arriving on it is worth reporting. */
function arrivalEffects(step: Step, answers: Partial<QuizAnswers>): FlowEffect[] {
  if (step.kind === "exit") {
    return [{ type: "track", name: "huidtest_exit", props: { reden: step.reason } }];
  }

  // A result reached with gaps in the answers is not a result: the screen shows
  // "this test is not finished" instead, and there is no advice to report. It
  // happens after a restart, which parks question one on top of the old result
  // rather than clearing the stack.
  if (step.kind === "resultaat" && isComplete(answers)) {
    const advies = decide(answers);
    return [
      {
        type: "track",
        name: "huidtest_resultaat",
        props: { bank: advies.bank, stand: advies.stand, product: advies.product },
      },
    ];
  }

  return [];
}

function goTo(
  state: FlowState,
  next: Step,
  config: FlowConfig,
  cause: Extract<TransitionCause, "advance" | "restart">,
  answers: Partial<QuizAnswers> = state.answers,
  before: FlowEffect[] = [],
): FlowResult {
  const from = state.stack[state.stack.length - 1];

  return {
    state: { ...state, answers, stack: [...state.stack, next] },
    // History first, then the arrival: that is the order the component pushed
    // and then reported in, and analytics ordering is part of what is pinned.
    effects: [
      ...before,
      ...(config.historyBacked ? ([{ type: "historyPush" }] as FlowEffect[]) : []),
      ...arrivalEffects(next, answers),
    ],
    transition: { from, to: next, cause },
  };
}

function pop(state: FlowState, cause: Extract<TransitionCause, "back" | "browser-back">): FlowResult {
  // Nothing behind this screen: the stack keeps its identity and the screen
  // keeps its place, so nothing animates and nothing is reported.
  if (state.stack.length <= 1) return { state, effects: [], transition: null };

  const from = state.stack[state.stack.length - 1];
  const stack = state.stack.slice(0, -1);
  const to = stack[stack.length - 1];

  return {
    state: { ...state, stack },
    effects: arrivalEffects(to, state.answers),
    transition: { from, to, cause },
  };
}

/**
 * Where a visit starts. A full action rather than a constructor, because a
 * shared link can open straight onto an exit or a result, and those screens owe
 * the same event they would have owed if the visitor had answered their way
 * there.
 *
 * It takes no config, which is the honest way to say that it never pushes
 * history — not even on the route, where the entry in the browser's stack is
 * the one that loaded the page.
 */
export function init(shared: QuizAnswers | null): {
  state: FlowState;
  effects: FlowEffect[];
} {
  const step = openingStep(shared);
  const answers = shared ?? { ...ANSWER_DEFAULTS };

  return {
    state: { stack: [step], answers, started: false },
    effects: arrivalEffects(step, answers),
  };
}

export function transition(
  state: FlowState,
  action: FlowAction,
  config: FlowConfig,
): FlowResult {
  switch (action.type) {
    case "confirmAge": {
      if (action.age === "minor") {
        return goTo(state, { kind: "exit", reason: "minor" }, config, "advance");
      }

      // Reported before the first question is pushed, and only once a session —
      // someone who swipes back to the age gate and confirms again has not
      // started a second test.
      const before: FlowEffect[] = state.started
        ? []
        : [{ type: "track", name: "huidtest_start", props: { entry: config.entry } }];

      return goTo(
        { ...state, started: true },
        { kind: "vraag", index: 0 },
        config,
        "advance",
        state.answers,
        before,
      );
    }

    case "select": {
      const question = config.questions[action.index];

      // Picking an option does not move the quiz on: the button below confirms
      // it. The stack is handed back by reference rather than copied, which is
      // what keeps `useEffect(..., [step])` in the UI from firing for a change
      // that never touched the screen.
      return {
        state: { ...state, answers: { ...state.answers, [question.key]: action.id } },
        effects: [
          {
            type: "track",
            name: "huidtest_vraag",
            props: { vraag: question.key, antwoord: action.id },
          },
        ],
        transition: null,
      };
    }

    case "toggleTattoo":
      return {
        state: { ...state, answers: { ...state.answers, tattoo: action.checked } },
        effects: [],
        transition: null,
      };

    case "advance":
      return goTo(
        state,
        nextStep(action.index, state.answers, config.questions),
        config,
        "advance",
      );

    case "backRequest":
      // On the route the browser's back button and the one on screen have to
      // agree, and routing this one through history is what guarantees that.
      // The stack does not move here — `popstate` is what pops it, one turn of
      // the event loop later.
      if (config.historyBacked) {
        return { state, effects: [{ type: "historyBack" }], transition: null };
      }
      return pop(state, "back");

    case "popstate":
      return pop(state, "browser-back");

    case "restart":
      // Question one is pushed on top of the finished result rather than
      // replacing the stack, so the result is still behind it. The answers are
      // cleared though, which is why going back to it lands on the unfinished
      // screen instead of on stale advice.
      return goTo(state, { kind: "vraag", index: 0 }, config, "restart", { ...ANSWER_DEFAULTS });
  }
}
