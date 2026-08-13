import { describe, expect, it } from "vitest";
import {
  canPlayAction,
  canSeekTo,
  ENDPOINT_MARGIN_SECONDS,
  hasReachedTarget,
  isAtRest,
  nextLook,
  planRun,
  restingFrame,
  startFrame,
  type TimeRange,
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

// What Chrome reports for a clip served by something that answers a Range
// request with the whole file — Cloudflare Workers' static assets, as of this
// fix. Fully buffered, and every seek clamps to zero.
const UNSEEKABLE: TimeRange[] = [[0, 0]];
const SEEKABLE: TimeRange[] = [[0, DURATION]];

describe("canSeekTo", () => {
  it("allows any frame of a seekable clip", () => {
    expect(canSeekTo(SEEKABLE, 0)).toBe(true);
    expect(canSeekTo(SEEKABLE, MID)).toBe(true);
    expect(canSeekTo(SEEKABLE, DURATION)).toBe(true);
  });

  it("refuses the midpoint of an unseekable clip", () => {
    // The whole bug in one assertion: this seek used to be issued anyway, and
    // the browser clamped it to frame 0 — the bed in the light.
    expect(canSeekTo(UNSEEKABLE, MID)).toBe(false);
  });

  it("still allows frame 0, which is what makes the wrap work", () => {
    expect(canSeekTo(UNSEEKABLE, 0)).toBe(true);
  });

  it("refuses everything when the element reports no ranges at all", () => {
    expect(canSeekTo([], 0)).toBe(false);
  });

  it("refuses a frame that is not a number yet", () => {
    expect(canSeekTo(SEEKABLE, NaN)).toBe(false);
  });
});

describe("planRun", () => {
  it("does nothing when the picture already agrees", () => {
    expect(planRun("light", 0, DURATION, SEEKABLE)).toEqual({ kind: "settle" });
    expect(planRun("dark", MID, DURATION, SEEKABLE)).toEqual({ kind: "settle" });
  });

  it("just rolls forward when the clip is already in the right half", () => {
    expect(planRun("dark", 0, DURATION, SEEKABLE)).toEqual({ kind: "play" });
    expect(planRun("light", MID, DURATION, SEEKABLE)).toEqual({ kind: "play" });
  });

  it("mirrors onto the other half when it can seek there", () => {
    // Interrupting a dark → light glide at 1.8s: the frame that looks the same
    // but runs towards dark sits at duration - 1.8.
    expect(planRun("dark", 1.8, DURATION, SEEKABLE)).toEqual({
      kind: "seek",
      frame: DURATION - 1.8,
    });
  });

  it("runs an unseekable clip out to the end to reach light", () => {
    // Light rests on the last frame too, so the far end is a destination
    // rather than a detour.
    expect(planRun("light", 0.5, DURATION, UNSEEKABLE)).toEqual({ kind: "play" });
  });

  it("takes the long way round to dark on an unseekable clip", () => {
    // Dark exists only at the midpoint, which this half has passed. Out to the
    // end, back to zero — the one seek that still lands — and forward again.
    expect(planRun("dark", 1.8, DURATION, UNSEEKABLE)).toEqual({ kind: "wrap" });
  });

  it("plays rather than wraps when even frame 0 is out of reach", () => {
    expect(planRun("dark", 1.8, DURATION, [])).toEqual({ kind: "play" });
  });
});
