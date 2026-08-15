import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/huidtest/config";
import { decide } from "@/lib/huidtest/decide";
import {
  currentAnswer,
  init,
  isComplete,
  nextStep,
  openingStep,
  progressFor,
  questionCount,
  stepKey,
  transition,
  type FlowAction,
  type FlowConfig,
  type FlowEffect,
  type FlowState,
  type Step,
  type Transition,
} from "@/lib/huidtest/flow";
import type { QuizAnswers } from "@/lib/huidtest/types";

/**
 * Characterisation, not specification: these tests describe what the quiz does
 * today, including the parts that look like mistakes and are not. Where that is
 * the case the test says so, so a later reader does not "fix" one of them.
 *
 * The real `QUESTIONS` are used throughout rather than a fixture. The order of
 * the questions, which one carries the tattoo checkbox and which one can be
 * skipped are all part of the behaviour being pinned down.
 */

const SAFE: QuizAnswers = {
  huidreactie: "type3",
  haarkleur: "anders",
  ervaring: "soms",
  doel: "verdiepen",
  huidgevoel: "droog",
  tattoo: false,
  kleurstijl: "natuurlijk",
};

/** The index of each question, by name, so the tests read as the flow does. */
const AT = Object.fromEntries(QUESTIONS.map((q, i) => [q.key, i])) as Record<
  (typeof QUESTIONS)[number]["key"],
  number
>;

describe("openingStep", () => {
  it("opens the intro without shared answers", () => {
    expect(openingStep(null)).toEqual({ kind: "intro" });
  });

  it("opens the result on complete, safe shared answers", () => {
    expect(openingStep(SAFE)).toEqual({ kind: "resultaat" });
  });

  it("opens the type 1 exit on shared answers carrying it", () => {
    expect(openingStep({ ...SAFE, huidreactie: "type1" })).toEqual({
      kind: "exit",
      reason: "type1",
    });
  });

  it("opens the red hair exit on shared answers carrying it", () => {
    expect(openingStep({ ...SAFE, haarkleur: "rossig" })).toEqual({
      kind: "exit",
      reason: "rossig",
    });
  });

  it("prefers the skin type exit when a link carries both safety answers", () => {
    expect(openingStep({ ...SAFE, huidreactie: "type1", haarkleur: "rossig" })).toEqual({
      kind: "exit",
      reason: "type1",
    });
  });
});

describe("isComplete", () => {
  it("accepts a full answer set", () => {
    expect(isComplete(SAFE)).toBe(true);
  });

  it("rejects an answer set missing any of the five always-asked questions", () => {
    for (const key of ["huidreactie", "haarkleur", "ervaring", "doel", "huidgevoel"] as const) {
      const partial: Partial<QuizAnswers> = { ...SAFE };
      delete partial[key];
      expect(isComplete(partial), key).toBe(false);
    }
  });

  it("rejects a missing kleurstijl for a skin that is asked for one", () => {
    expect(isComplete({ ...SAFE, kleurstijl: undefined })).toBe(false);
  });

  it("accepts a missing kleurstijl for a sensitive skin, which is never asked", () => {
    expect(isComplete({ ...SAFE, huidgevoel: "gevoelig", kleurstijl: undefined })).toBe(true);
  });

  it("ignores the tattoo checkbox, which every answer set carries a default for", () => {
    expect(isComplete({ ...SAFE, tattoo: true })).toBe(true);
  });
});

describe("nextStep", () => {
  it("walks the questions in order", () => {
    expect(nextStep(AT.huidreactie, { huidreactie: "type3" }, QUESTIONS)).toEqual({
      kind: "vraag",
      index: AT.haarkleur,
    });
    expect(nextStep(AT.ervaring, { ...SAFE, huidgevoel: undefined }, QUESTIONS)).toEqual({
      kind: "vraag",
      index: AT.doel,
    });
  });

  it("goes to the result after the last question", () => {
    expect(nextStep(AT.kleurstijl, SAFE, QUESTIONS)).toEqual({ kind: "resultaat" });
  });

  it("skips kleurstijl for a sensitive skin", () => {
    expect(nextStep(AT.huidgevoel, { ...SAFE, huidgevoel: "gevoelig" }, QUESTIONS)).toEqual({
      kind: "resultaat",
    });
  });

  it("asks kleurstijl for every other skin", () => {
    for (const huidgevoel of ["droog", "normaal"] as const) {
      expect(nextStep(AT.huidgevoel, { ...SAFE, huidgevoel }, QUESTIONS), huidgevoel).toEqual({
        kind: "vraag",
        index: AT.kleurstijl,
      });
    }
  });

  it("exits on skin type 1, on the question after the one that says so", () => {
    expect(nextStep(AT.huidreactie, { huidreactie: "type1" }, QUESTIONS)).toEqual({
      kind: "exit",
      reason: "type1",
    });
  });

  it("exits on red hair", () => {
    expect(nextStep(AT.haarkleur, { huidreactie: "type3", haarkleur: "rossig" }, QUESTIONS)).toEqual(
      { kind: "exit", reason: "rossig" },
    );
  });

  it("lets a safety answer win over the skipped last question", () => {
    expect(
      nextStep(AT.huidgevoel, { ...SAFE, huidreactie: "type1", huidgevoel: "gevoelig" }, QUESTIONS),
    ).toEqual({ kind: "exit", reason: "type1" });
  });

  it("keeps exiting on every later question, not only the one that decided it", () => {
    expect(nextStep(AT.doel, { ...SAFE, haarkleur: "rossig" }, QUESTIONS)).toEqual({
      kind: "exit",
      reason: "rossig",
    });
  });
});

describe("questionCount", () => {
  it("asks all six questions by default", () => {
    expect(questionCount({}, QUESTIONS.length)).toBe(6);
  });

  it("drops to five once a sensitive skin is picked", () => {
    expect(questionCount({ huidgevoel: "gevoelig" }, QUESTIONS.length)).toBe(5);
  });
});

describe("progressFor", () => {
  /**
   * The exact numbers, and the rounding `aria-valuenow` shows. The jump from 73
   * to 84 on question five is existing behaviour: the denominator reads
   * `answers.huidgevoel`, which is written the moment the option is picked
   * rather than when it is confirmed. Pinned down, not repaired.
   */
  const cases: Array<{ name: string; step: Step; answers: Partial<QuizAnswers>; value: number; aria: number }> = [
    { name: "intro", step: { kind: "intro" }, answers: {}, value: 10, aria: 10 },
    { name: "question 1", step: { kind: "vraag", index: 0 }, answers: {}, value: 20, aria: 20 },
    {
      name: "question 2",
      step: { kind: "vraag", index: 1 },
      answers: {},
      value: 33.333333333333336,
      aria: 33,
    },
    {
      name: "question 5, nothing picked yet",
      step: { kind: "vraag", index: 4 },
      answers: {},
      value: 73.33333333333333,
      aria: 73,
    },
    {
      name: "question 5, sensitive picked",
      step: { kind: "vraag", index: 4 },
      answers: { huidgevoel: "gevoelig" },
      value: 84,
      aria: 84,
    },
    {
      name: "question 6",
      step: { kind: "vraag", index: 5 },
      answers: { huidgevoel: "droog" },
      value: 86.66666666666667,
      aria: 87,
    },
    {
      name: "exit",
      step: { kind: "exit", reason: "type1" },
      answers: {},
      value: 20,
      aria: 20,
    },
    { name: "result", step: { kind: "resultaat" }, answers: SAFE, value: 100, aria: 100 },
  ];

  for (const { name, step, answers, value, aria } of cases) {
    it(`is ${aria}% on ${name}`, () => {
      const progress = progressFor(step, answers, QUESTIONS.length);
      expect(progress).toBeCloseTo(value, 10);
      expect(Math.round(progress)).toBe(aria);
    });
  }

  it("holds at the endowed start on every exit reason", () => {
    for (const reason of ["minor", "type1", "rossig"] as const) {
      expect(progressFor({ kind: "exit", reason }, SAFE, QUESTIONS.length), reason).toBe(20);
    }
  });
});

describe("stepKey", () => {
  it("numbers the questions and names everything else", () => {
    expect(stepKey({ kind: "intro" })).toBe("intro");
    expect(stepKey({ kind: "vraag", index: 3 })).toBe("vraag-3");
    expect(stepKey({ kind: "resultaat" })).toBe("resultaat");
  });

  it("gives both exits one key, since the quiz never moves between them", () => {
    expect(stepKey({ kind: "exit", reason: "type1" })).toBe(
      stepKey({ kind: "exit", reason: "rossig" }),
    );
  });
});

describe("currentAnswer", () => {
  it("reads the answer belonging to the question on screen", () => {
    expect(currentAnswer({ kind: "vraag", index: AT.doel }, SAFE, QUESTIONS)).toBe("verdiepen");
  });

  it("is undefined on a question with nothing picked", () => {
    expect(currentAnswer({ kind: "vraag", index: AT.doel }, {}, QUESTIONS)).toBeUndefined();
  });

  it("is undefined on every screen that is not a question", () => {
    expect(currentAnswer({ kind: "intro" }, SAFE, QUESTIONS)).toBeUndefined();
    expect(currentAnswer({ kind: "resultaat" }, SAFE, QUESTIONS)).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ */
/* The transition engine                                               */
/* ------------------------------------------------------------------ */

/** The quiz as the route runs it: back travels through browser history. */
const ROUTE: FlowConfig = { questions: QUESTIONS, entry: "direct", historyBacked: true };

/** The quiz as a panel runs it: the page underneath owns the history. */
const PANEL: FlowConfig = { ...ROUTE, historyBacked: false };

type Run = {
  state: FlowState;
  effects: FlowEffect[];
  transitions: Transition[];
  /** The transition of the last action, which is what most tests are about. */
  last: Transition;
};

function drive(
  config: FlowConfig,
  shared: QuizAnswers | null,
  actions: FlowAction[],
): Run {
  const opening = init(shared);
  let state = opening.state;
  const effects: FlowEffect[] = [...opening.effects];
  const transitions: Transition[] = [];

  for (const action of actions) {
    const result = transition(state, action, config);
    state = result.state;
    effects.push(...result.effects);
    transitions.push(result.transition);
  }

  return { state, effects, transitions, last: transitions[transitions.length - 1] ?? null };
}

/** Answering a question the way the UI does: pick, then confirm. */
function answerQuestion(key: keyof QuizAnswers, id: string): FlowAction[] {
  const index = AT[key as (typeof QUESTIONS)[number]["key"]];
  return [
    { type: "select", index, id },
    { type: "advance", index },
  ];
}

const TO_RESULT: FlowAction[] = [
  { type: "confirmAge", age: "ok" },
  ...answerQuestion("huidreactie", SAFE.huidreactie),
  ...answerQuestion("haarkleur", SAFE.haarkleur),
  ...answerQuestion("ervaring", SAFE.ervaring),
  ...answerQuestion("doel", SAFE.doel),
  ...answerQuestion("huidgevoel", SAFE.huidgevoel),
  ...answerQuestion("kleurstijl", SAFE.kleurstijl!),
];

const step = (run: Run): Step => run.state.stack[run.state.stack.length - 1];
type TrackEffect = Extract<FlowEffect, { type: "track" }>;

const tracked = (run: Run): TrackEffect[] =>
  run.effects.filter((e): e is TrackEffect => e.type === "track");
const named = (run: Run, name: TrackEffect["name"]): TrackEffect[] =>
  tracked(run).filter((e) => e.name === name);

describe("init", () => {
  it("opens the intro with no effects when there is nothing shared", () => {
    const run = drive(ROUTE, null, []);
    expect(step(run)).toEqual({ kind: "intro" });
    expect(run.effects).toEqual([]);
    expect(run.state.answers).toEqual({ tattoo: false });
    expect(run.state.started).toBe(false);
  });

  it("opens the result and reports it once, with the advice decide() gives", () => {
    const run = drive(ROUTE, SAFE, []);
    expect(step(run)).toEqual({ kind: "resultaat" });
    expect(run.effects).toEqual([
      {
        type: "track",
        name: "huidtest_resultaat",
        props: {
          bank: decide(SAFE).bank,
          stand: decide(SAFE).stand,
          product: decide(SAFE).product,
        },
      },
    ]);
  });

  it("reports nothing for a link whose answers are incomplete", () => {
    const run = drive(ROUTE, { ...SAFE, kleurstijl: undefined }, []);
    expect(step(run)).toEqual({ kind: "resultaat" });
    expect(run.effects).toEqual([]);
  });

  it("opens the skin type exit and reports it once", () => {
    const run = drive(ROUTE, { ...SAFE, huidreactie: "type1" }, []);
    expect(step(run)).toEqual({ kind: "exit", reason: "type1" });
    expect(run.effects).toEqual([
      { type: "track", name: "huidtest_exit", props: { reden: "type1" } },
    ]);
  });

  it("opens the red hair exit and reports it once", () => {
    const run = drive(ROUTE, { ...SAFE, haarkleur: "rossig" }, []);
    expect(step(run)).toEqual({ kind: "exit", reason: "rossig" });
    expect(run.effects).toEqual([
      { type: "track", name: "huidtest_exit", props: { reden: "rossig" } },
    ]);
  });

  it("never pushes history, on the route as much as in a panel", () => {
    for (const shared of [null, SAFE, { ...SAFE, huidreactie: "type1" as const }]) {
      const run = drive(ROUTE, shared, []);
      expect(run.effects.filter((e) => e.type !== "track")).toEqual([]);
    }
  });
});

describe("the age gate", () => {
  it("sends a minor to their own exit and reports it", () => {
    const run = drive(PANEL, null, [{ type: "confirmAge", age: "minor" }]);
    expect(step(run)).toEqual({ kind: "exit", reason: "minor" });
    expect(run.effects).toEqual([
      { type: "track", name: "huidtest_exit", props: { reden: "minor" } },
    ]);
  });

  it("does not report a start for a visitor who is turned away", () => {
    const run = drive(PANEL, null, [{ type: "confirmAge", age: "minor" }]);
    expect(named(run, "huidtest_start")).toEqual([]);
    expect(run.state.started).toBe(false);
  });

  it("reports the start before the first question is pushed", () => {
    const run = drive(ROUTE, null, [{ type: "confirmAge", age: "ok" }]);
    expect(step(run)).toEqual({ kind: "vraag", index: 0 });
    expect(run.effects).toEqual([
      { type: "track", name: "huidtest_start", props: { entry: "direct" } },
      { type: "historyPush" },
    ]);
  });

  it("carries the entry point the config was given", () => {
    const run = drive({ ...PANEL, entry: "zonnebank_kaart" }, null, [
      { type: "confirmAge", age: "ok" },
    ]);
    expect(named(run, "huidtest_start")).toEqual([
      { type: "track", name: "huidtest_start", props: { entry: "zonnebank_kaart" } },
    ]);
  });

  it("reports the start once a session, however often the gate is confirmed", () => {
    const run = drive(PANEL, null, [
      { type: "confirmAge", age: "ok" },
      { type: "backRequest" },
      { type: "confirmAge", age: "ok" },
    ]);
    expect(named(run, "huidtest_start")).toHaveLength(1);
  });
});

describe("the safety exits", () => {
  it("exits on skin type 1 and never reaches an advice", () => {
    const run = drive(PANEL, null, [
      { type: "confirmAge", age: "ok" },
      ...answerQuestion("huidreactie", "type1"),
    ]);
    expect(step(run)).toEqual({ kind: "exit", reason: "type1" });
    expect(named(run, "huidtest_resultaat")).toEqual([]);
  });

  it("exits on red hair and never reaches an advice", () => {
    const run = drive(PANEL, null, [
      { type: "confirmAge", age: "ok" },
      ...answerQuestion("huidreactie", "type3"),
      ...answerQuestion("haarkleur", "rossig"),
    ]);
    expect(step(run)).toEqual({ kind: "exit", reason: "rossig" });
    expect(named(run, "huidtest_resultaat")).toEqual([]);
  });

  it("reports each exit exactly once", () => {
    const run = drive(PANEL, null, [
      { type: "confirmAge", age: "ok" },
      ...answerQuestion("huidreactie", "type1"),
    ]);
    expect(named(run, "huidtest_exit")).toHaveLength(1);
  });
});

describe("answering a question", () => {
  it("writes the answer without moving the screen", () => {
    const before = drive(PANEL, null, [{ type: "confirmAge", age: "ok" }]);
    const result = transition(
      before.state,
      { type: "select", index: AT.huidreactie, id: "type3" },
      PANEL,
    );

    expect(result.transition).toBeNull();
    expect(result.state.answers.huidreactie).toBe("type3");
  });

  it("hands the stack back by reference when the screen did not change", () => {
    const before = drive(PANEL, null, [{ type: "confirmAge", age: "ok" }]);
    const result = transition(
      before.state,
      { type: "select", index: AT.huidreactie, id: "type3" },
      PANEL,
    );

    expect(result.state.stack).toBe(before.state.stack);
  });

  it("reports every pick, including picking the same option again", () => {
    const run = drive(PANEL, null, [
      { type: "confirmAge", age: "ok" },
      { type: "select", index: AT.huidreactie, id: "type3" },
      { type: "select", index: AT.huidreactie, id: "type3" },
    ]);

    expect(named(run, "huidtest_vraag")).toEqual([
      {
        type: "track",
        name: "huidtest_vraag",
        props: { vraag: "huidreactie", antwoord: "type3" },
      },
      {
        type: "track",
        name: "huidtest_vraag",
        props: { vraag: "huidreactie", antwoord: "type3" },
      },
    ]);
  });

  it("never lets a pick report an exit or a result", () => {
    const run = drive(PANEL, null, [
      { type: "confirmAge", age: "ok" },
      { type: "select", index: AT.huidreactie, id: "type1" },
    ]);

    expect(named(run, "huidtest_exit")).toEqual([]);
    expect(named(run, "huidtest_resultaat")).toEqual([]);
  });

  it("toggles the tattoo checkbox silently, without moving the screen", () => {
    const before = drive(PANEL, null, [{ type: "confirmAge", age: "ok" }]);
    const result = transition(before.state, { type: "toggleTattoo", checked: true }, PANEL);

    expect(result.effects).toEqual([]);
    expect(result.transition).toBeNull();
    expect(result.state.stack).toBe(before.state.stack);
    expect(result.state.answers.tattoo).toBe(true);
  });
});

describe("the run to a result", () => {
  it("ends on the result and reports it once, with the advice decide() gives", () => {
    const run = drive(PANEL, null, TO_RESULT);
    expect(step(run)).toEqual({ kind: "resultaat" });
    expect(named(run, "huidtest_resultaat")).toEqual([
      {
        type: "track",
        name: "huidtest_resultaat",
        props: {
          bank: decide(SAFE).bank,
          stand: decide(SAFE).stand,
          product: decide(SAFE).product,
        },
      },
    ]);
  });

  it("reports one start, six questions and one result, and nothing else", () => {
    const run = drive(PANEL, null, TO_RESULT);
    expect(tracked(run).map((e) => (e.type === "track" ? e.name : ""))).toEqual([
      "huidtest_start",
      "huidtest_vraag",
      "huidtest_vraag",
      "huidtest_vraag",
      "huidtest_vraag",
      "huidtest_vraag",
      "huidtest_vraag",
      "huidtest_resultaat",
    ]);
  });

  it("skips the last question for a sensitive skin", () => {
    const run = drive(PANEL, null, [
      { type: "confirmAge", age: "ok" },
      ...answerQuestion("huidreactie", "type3"),
      ...answerQuestion("haarkleur", "anders"),
      ...answerQuestion("ervaring", "soms"),
      ...answerQuestion("doel", "verdiepen"),
      ...answerQuestion("huidgevoel", "gevoelig"),
    ]);

    expect(step(run)).toEqual({ kind: "resultaat" });
    expect(named(run, "huidtest_resultaat")).toHaveLength(1);
  });
});

describe("going back", () => {
  it("removes exactly one step in a panel", () => {
    const run = drive(PANEL, null, [
      { type: "confirmAge", age: "ok" },
      ...answerQuestion("huidreactie", "type3"),
      { type: "backRequest" },
    ]);

    expect(step(run)).toEqual({ kind: "vraag", index: 0 });
    expect(run.state.stack).toHaveLength(2);
    expect(run.last).toEqual({
      from: { kind: "vraag", index: AT.haarkleur },
      to: { kind: "vraag", index: 0 },
      cause: "back",
    });
  });

  it("uses no browser history in a panel", () => {
    const run = drive(PANEL, null, [...TO_RESULT, { type: "backRequest" }]);
    expect(run.effects.filter((e) => e.type !== "track")).toEqual([]);
  });

  it("asks history on the route and leaves the stack where it was", () => {
    const before = drive(ROUTE, null, [{ type: "confirmAge", age: "ok" }]);
    const result = transition(before.state, { type: "backRequest" }, ROUTE);

    expect(result.effects).toEqual([{ type: "historyBack" }]);
    expect(result.transition).toBeNull();
    expect(result.state.stack).toBe(before.state.stack);
  });

  it("pops on the route only once history answers, and says who asked", () => {
    const run = drive(ROUTE, null, [
      { type: "confirmAge", age: "ok" },
      { type: "backRequest" },
      { type: "popstate" },
    ]);

    expect(step(run)).toEqual({ kind: "intro" });
    expect(run.last).toEqual({
      from: { kind: "vraag", index: 0 },
      to: { kind: "intro" },
      cause: "browser-back",
    });
  });

  it("stays put when there is nothing behind the first screen", () => {
    const before = drive(PANEL, null, []);
    const result = transition(before.state, { type: "backRequest" }, PANEL);

    expect(result.transition).toBeNull();
    expect(result.effects).toEqual([]);
    expect(result.state.stack).toBe(before.state.stack);
  });

  it("keeps the object identity of every step that stays", () => {
    const before = drive(PANEL, null, [
      { type: "confirmAge", age: "ok" },
      ...answerQuestion("huidreactie", "type3"),
    ]);
    const after = transition(before.state, { type: "backRequest" }, PANEL);

    expect(after.state.stack[0]).toBe(before.state.stack[0]);
    expect(after.state.stack[1]).toBe(before.state.stack[1]);
  });
});

describe("restarting", () => {
  it("clears the answers apart from the tattoo default and opens question one", () => {
    const run = drive(PANEL, null, [...TO_RESULT, { type: "restart" }]);

    expect(step(run)).toEqual({ kind: "vraag", index: 0 });
    expect(run.state.answers).toEqual({ tattoo: false });
    expect(run.last?.cause).toBe("restart");
  });

  it("parks question one on top of the result rather than clearing the stack", () => {
    const finished = drive(PANEL, null, TO_RESULT);
    const run = drive(PANEL, null, [...TO_RESULT, { type: "restart" }]);

    expect(run.state.stack).toHaveLength(finished.state.stack.length + 1);
    expect(run.state.stack[run.state.stack.length - 2]).toEqual({ kind: "resultaat" });
  });

  it("cannot bring the old advice back, because the answers behind it are gone", () => {
    const run = drive(PANEL, null, [...TO_RESULT, { type: "restart" }, { type: "backRequest" }]);

    expect(step(run)).toEqual({ kind: "resultaat" });
    expect(isComplete(run.state.answers)).toBe(false);
    // No second result event: an unfinished result is not a result.
    expect(named(run, "huidtest_resultaat")).toHaveLength(1);
  });

  it("does not report a second start", () => {
    const run = drive(PANEL, null, [...TO_RESULT, { type: "restart" }]);
    expect(named(run, "huidtest_start")).toHaveLength(1);
  });
});

describe("history effects on the route", () => {
  it("pushes once for every step added to the stack", () => {
    const run = drive(ROUTE, null, TO_RESULT);
    const pushes = run.effects.filter((e) => e.type === "historyPush");

    expect(pushes).toHaveLength(run.state.stack.length - 1);
  });

  it("still balances after a restart and a walk back through history", () => {
    const run = drive(ROUTE, null, [
      ...TO_RESULT,
      { type: "restart" },
      { type: "backRequest" },
      { type: "popstate" },
    ]);
    const pushes = run.effects.filter((e) => e.type === "historyPush").length;
    const pops = run.transitions.filter((t) => t?.cause === "browser-back").length;

    expect(pushes - pops).toBe(run.state.stack.length - 1);
  });

  it("pushes history before it reports the screen it pushed to", () => {
    const run = drive(ROUTE, null, [
      { type: "confirmAge", age: "ok" },
      ...answerQuestion("huidreactie", "type1"),
    ]);

    const tail = run.effects.slice(-2);
    expect(tail).toEqual([
      { type: "historyPush" },
      { type: "track", name: "huidtest_exit", props: { reden: "type1" } },
    ]);
  });
});
