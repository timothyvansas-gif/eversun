import { describe, expect, it } from "vitest";
import { decide } from "@/lib/huidtest/decide";
import { decodeAnswers, encodeAnswers, shareHref } from "@/lib/huidtest/share";
import type { QuizAnswers } from "@/lib/huidtest/types";

const full: QuizAnswers = {
  huidreactie: "type3",
  haarkleur: "anders",
  ervaring: "soms",
  doel: "snel",
  huidgevoel: "normaal",
  tattoo: false,
  kleurstijl: "direct",
};

const gevoelig: QuizAnswers = {
  huidreactie: "type2",
  haarkleur: "anders",
  ervaring: "regelmatig",
  doel: "behoud",
  huidgevoel: "gevoelig",
  tattoo: true,
};

describe("encodeAnswers", () => {
  it("writes the seven answers in a fixed order", () => {
    expect(encodeAnswers(full)).toBe("type3.anders.soms.snel.normaal.0.direct");
  });

  it("marks a skipped final question rather than dropping the field", () => {
    // Seven segments whatever happened, so a truncated paste is detectable.
    expect(encodeAnswers(gevoelig)).toBe("type2.anders.regelmatig.behoud.gevoelig.1.x");
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
    const decoded = decodeAnswers("type1.anders.soms.snel.normaal.0.direct");

    expect(decoded?.huidreactie).toBe("type1");
  });

  it("keeps the red-hair exit closed", () => {
    const decoded = decodeAnswers("type3.rossig.soms.snel.normaal.0.direct");

    expect(decoded?.haarkleur).toBe("rossig");
  });

  it("refuses anything that does not parse", () => {
    for (const value of [
      null,
      undefined,
      "",
      "type3.anders.soms.snel.normaal.0", // truncated
      "type3.anders.soms.snel.normaal.0.direct.extra",
      "type9.anders.soms.snel.normaal.0.direct", // invented skin
      "type3.paars.soms.snel.normaal.0.direct", // invented hair colour
      "type3.anders.altijd.snel.normaal.0.direct", // invented experience
      "type3.anders.soms.bruinen.normaal.0.direct", // invented goal
      "type3.anders.soms.snel.zacht.0.direct", // invented feel
      "type3.anders.soms.snel.normaal.2.direct", // tattoo is a flag, not a count
      "type3.anders.soms.snel.normaal.0.zomers", // invented colour style
    ]) {
      expect(decodeAnswers(value)).toBeNull();
    }
  });

  it("refuses a link whose answers contradict each other", () => {
    // The final question is never asked of a sensitive skin, so an answer means
    // the link was edited; and every other skin must have one.
    expect(decodeAnswers("type2.anders.regelmatig.behoud.gevoelig.1.direct")).toBeNull();
    expect(decodeAnswers("type3.anders.soms.snel.normaal.0.x")).toBeNull();
  });
});

describe("shareHref", () => {
  it("hangs the answers off the route", () => {
    expect(shareHref("/huidtest", full)).toBe(
      "/huidtest?a=type3.anders.soms.snel.normaal.0.direct",
    );
  });
});

/** The advice a link rebuilds, for comparing against the advice it came from. */
function decode(a: QuizAnswers) {
  const decoded = decodeAnswers(encodeAnswers(a));
  return decoded ? decide(decoded) : null;
}
