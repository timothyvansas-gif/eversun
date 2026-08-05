import { describe, it, expect } from "vitest";
import { stackDepthForDrag, scrimOpacityForDrag } from "./sheet-stack";

describe("stackDepthForDrag", () => {
  it("keeps the sheet behind fully sunk while the one in front sits still", () => {
    expect(stackDepthForDrag(0)).toBe(1);
  });

  it("holds at full depth on an upward drag, which the sheet in front cannot make", () => {
    expect(stackDepthForDrag(-120)).toBe(1);
  });

  it("gives the size back in step with the drag", () => {
    expect(stackDepthForDrag(50)).toBeCloseTo(0.75);
    expect(stackDepthForDrag(100)).toBeCloseTo(0.5);
  });

  it("is still short of its own size at the point the sheet in front closes", () => {
    expect(stackDepthForDrag(80)).toBeGreaterThan(0);
  });

  it("does not overshoot past its own size on a long drag", () => {
    expect(stackDepthForDrag(400)).toBe(0);
  });
});

describe("scrimOpacityForDrag", () => {
  const SHEET = 560;

  it("holds the dim while the sheet has not moved", () => {
    expect(scrimOpacityForDrag(0, SHEET)).toBe(1);
    expect(scrimOpacityForDrag(-60, SHEET)).toBe(1);
  });

  it("barely touches the dim over a normal close-drag", () => {
    // 80px of finger is the close threshold; the sheet is still all but gone
    // from nowhere, so the scrim should still read as a scrim.
    expect(scrimOpacityForDrag(80, SHEET)).toBeGreaterThan(0.9);
  });

  it("stays ahead of the stack depth, which is the whole point", () => {
    expect(scrimOpacityForDrag(160, SHEET)).toBeGreaterThan(stackDepthForDrag(160));
  });

  it("is gone once the sheet has travelled its own height", () => {
    expect(scrimOpacityForDrag(SHEET * 2, SHEET)).toBe(0);
    expect(scrimOpacityForDrag(SHEET * 3, SHEET)).toBe(0);
  });

  it("leaves the scrim alone when the sheet could not be measured", () => {
    expect(scrimOpacityForDrag(200, 0)).toBe(1);
  });
});
