import { describe, expect, it } from "vitest";
import {
  canPlayAction,
  ENDPOINT_MARGIN_SECONDS,
  hasReachedTarget,
  isAtRest,
  nextLook,
  restingFrame,
  startFrame,
} from "./zonnebank-playback";

// The real clips measure 2.566667s, so the dark frame sits at 1.283333s.
const DURATION = 2.566667;
const MID = DURATION / 2;

describe("nextLook", () => {
  it("flips between the two states", () => {
    expect(nextLook("light")).toBe("dark");
    expect(nextLook("dark")).toBe("light");
  });
});

describe("restingFrame", () => {
  it("puts light on the first frame", () => {
    expect(restingFrame("light", DURATION)).toBe(0);
  });

  it("puts dark on the midpoint", () => {
    expect(restingFrame("dark", DURATION)).toBeCloseTo(MID, 6);
  });

  it("answers for light even before the duration is known", () => {
    // Light is frame 0 whatever the clip turns out to be, so this never has to
    // wait for metadata.
    expect(restingFrame("light", NaN)).toBe(0);
    expect(restingFrame("light", 0)).toBe(0);
  });

  it("refuses to guess a dark frame without a duration", () => {
    expect(restingFrame("dark", NaN)).toBeNull();
    expect(restingFrame("dark", 0)).toBeNull();
    expect(restingFrame("dark", Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("isAtRest", () => {
  it("sees light at both ends of the clip", () => {
    // The last frame is the same picture as the first, so a finished
    // dark → light run is at rest without being rewound.
    expect(isAtRest("light", 0, DURATION)).toBe(true);
    expect(isAtRest("light", DURATION, DURATION)).toBe(true);
  });

  it("sees dark at the midpoint", () => {
    expect(isAtRest("dark", MID, DURATION)).toBe(true);
  });

  it("allows a frame of overshoot", () => {
    expect(isAtRest("dark", MID + ENDPOINT_MARGIN_SECONDS / 2, DURATION)).toBe(true);
    expect(isAtRest("light", ENDPOINT_MARGIN_SECONDS / 2, DURATION)).toBe(true);
  });

  it("rejects positions mid-transition", () => {
    expect(isAtRest("dark", 0, DURATION)).toBe(false);
    expect(isAtRest("light", MID, DURATION)).toBe(false);
    expect(isAtRest("dark", MID / 2, DURATION)).toBe(false);
  });

  it("cannot place dark without a duration", () => {
    expect(isAtRest("dark", 1, NaN)).toBe(false);
  });
});

describe("startFrame", () => {
  it("leaves a position that already runs toward the target", () => {
    expect(startFrame("dark", 0, DURATION)).toBe(0);
    expect(startFrame("light", MID, DURATION)).toBe(MID);
    expect(startFrame("light", DURATION * 0.75, DURATION)).toBe(DURATION * 0.75);
  });

  it("mirrors a position stranded in the wrong half", () => {
    // Reversing mid-transition: the picture is identical either side of the
    // midpoint, so the run continues from where the eye left it instead of
    // jumping.
    expect(startFrame("dark", DURATION * 0.75, DURATION)).toBeCloseTo(DURATION * 0.25, 6);
    expect(startFrame("light", DURATION * 0.25, DURATION)).toBeCloseTo(DURATION * 0.75, 6);
  });

  it("always lands in the half that ends on the target", () => {
    // The property the mirroring exists for: wherever the clip was left, the
    // start frame must sit in the half that runs toward the intent, or playback
    // would travel away from it.
    for (const at of [0, 0.4, MID - 0.01, MID + 0.01, DURATION * 0.8, DURATION]) {
      expect(startFrame("dark", at, DURATION)).toBeLessThanOrEqual(MID);
      expect(startFrame("light", at, DURATION)).toBeGreaterThanOrEqual(MID);
    }
  });

  it("leaves the position alone while the duration is unknown", () => {
    expect(startFrame("dark", 1.2, NaN)).toBe(1.2);
  });
});

describe("canPlayAction", () => {
  it("leaves a playing transition alone", () => {
    // The regression this exists for: canplay fires again on every seek and
    // rebuffer, so a running dark → light glide passes through here. Acting on
    // it snapped the clip to frame 0 mid-transition — the bed jumped open
    // instead of easing open.
    expect(canPlayAction(true, false)).toBe("ignore");
    expect(canPlayAction(false, false)).toBe("ignore");
  });

  it("starts a run that was waiting for data", () => {
    expect(canPlayAction(true, true)).toBe("resume-run");
  });

  it("repairs the frame of an idle element", () => {
    expect(canPlayAction(false, true)).toBe("recover-frame");
  });
});

describe("hasReachedTarget", () => {
  it("stops dark at the midpoint", () => {
    expect(hasReachedTarget("dark", MID - 0.5, DURATION)).toBe(false);
    expect(hasReachedTarget("dark", MID, DURATION)).toBe(true);
  });

  it("stops light at the end of the clip", () => {
    expect(hasReachedTarget("light", MID + 0.1, DURATION)).toBe(false);
    expect(hasReachedTarget("light", DURATION, DURATION)).toBe(true);
  });

  it("catches an endpoint the rAF tick stepped just short of", () => {
    expect(hasReachedTarget("dark", MID - ENDPOINT_MARGIN_SECONDS / 2, DURATION)).toBe(true);
  });

  it("never reports arrival before the duration is known", () => {
    // A false positive here would stop the clip on whatever frame happened to
    // be showing, so an unknown duration has to keep the monitor running.
    expect(hasReachedTarget("dark", 5, NaN)).toBe(false);
    expect(hasReachedTarget("light", 5, Number.POSITIVE_INFINITY)).toBe(false);
  });
});
