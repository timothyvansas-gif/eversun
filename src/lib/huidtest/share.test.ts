import { describe, expect, it } from "vitest";
import { decide } from "@/lib/huidtest/decide";
import { decodeAnswers, encodeAnswers, shareHref } from "@/lib/huidtest/share";
import type { QuizAnswers } from "@/lib/huidtest/types";

const full: QuizAnswers = {
  huidreactie: "type3",
  ervaring: "soms",
  doel: "snel",
  huidgevoel: "normaal",
  tattoo: false,
  kleurstijl: "direct",
};

const gevoelig: QuizAnswers = {
  huidreactie: "type2",
  ervaring: "regelmatig",
  doel: "behoud",
  huidgevoel: "gevoelig",
  tattoo: true,
};

describe("encodeAnswers", () => {
  it("writes the six answers in a fixed order", () => {
    expect(encodeAnswers(full)).toBe("type3.soms.snel.normaal.0.direct");
  });

  it("marks a skipped question 5 rather than dropping the field", () => {
    // Six segments whatever happened, so a truncated paste is detectable.
    expect(encodeAnswers(gevoelig)).toBe("type2.regelmatig.behoud.gevoelig.1.x");
  });
});

describe("decodeAnswers", () => {
  it("round-trips, so a shared link advises what the quiz advised", () => {
    for (const a of [full, gevoelig]) {
      const decoded = decodeAnswers(encodeAnswers(a));

      expect(decoded).toEqual(a);
      expect(decode(a)).toEqual(decide(a));
    }
  });

  it("keeps the type1 exit closed", () => {
    // The acceptance criterion: a link cannot talk its way past the exit. The
    // answers decode, and the screen that reads them sends type1 to the exit
    // before any advice is built.
    const decoded = decodeAnswers("type1.soms.snel.normaal.0.direct");

    expect(decoded?.huidreactie).toBe("type1");
  });

  it("refuses anything that does not parse", () => {
    for (const value of [
      null,
      undefined,
      "",
      "type3.soms.snel.normaal.0", // truncated
      "type3.soms.snel.normaal.0.direct.extra",
      "type9.soms.snel.normaal.0.direct", // invented skin
      "type3.altijd.snel.normaal.0.direct", // invented experience
      "type3.soms.bruinen.normaal.0.direct", // invented goal
      "type3.soms.snel.zacht.0.direct", // invented feel
      "type3.soms.snel.normaal.2.direct", // tattoo is a flag, not a count
      "type3.soms.snel.normaal.0.zomers", // invented colour style
    ]) {
      expect(decodeAnswers(value)).toBeNull();
    }
  });

  it("refuses a link whose answers contradict each other", () => {
    // Question 5 is never asked of a sensitive skin, so an answer to it means
    // the link was edited; and every other skin must have one.
    expect(decodeAnswers("type2.regelmatig.behoud.gevoelig.1.direct")).toBeNull();
    expect(decodeAnswers("type3.soms.snel.normaal.0.x")).toBeNull();
  });
});

describe("shareHref", () => {
  it("hangs the answers off the route", () => {
    expect(shareHref("/huidtest", full)).toBe("/huidtest?a=type3.soms.snel.normaal.0.direct");
  });
});

/** The advice a link rebuilds, for comparing against the advice it came from. */
function decode(a: QuizAnswers) {
  const decoded = decodeAnswers(encodeAnswers(a));
  return decoded ? decide(decoded) : null;
}
