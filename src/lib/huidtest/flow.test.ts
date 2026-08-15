import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/huidtest/config";
import {
  currentAnswer,
  isComplete,
  nextStep,
  openingStep,
  progressFor,
  questionCount,
  stepKey,
  type Step,
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
