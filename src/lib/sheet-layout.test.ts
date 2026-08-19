import { describe, expect, it } from "vitest";
import { arrangeForSlots, type Slot } from "./sheet-layout";

const SPANS: Slot[] = [2, 1, 1, 1, 1, 1, 2];

const wide = (id: string) => ({ id, width: 1600, height: 900 });
const tall = (id: string) => ({ id, width: 900, height: 1600 });

const ids = (photos: { id: string }[]) => photos.map((p) => p.id);

describe("arrangeForSlots", () => {
  it("leaves an all-landscape set in its original order", () => {
    // Every photo in the sheet is landscape today, so this is the case that
    // must not move: the rewrite has to be invisible until a portrait arrives.
    const photos = Array.from({ length: 14 }, (_, i) => wide(`L${i}`));
    expect(ids(arrangeForSlots(photos, SPANS))).toEqual(ids(photos));
  });

  it("leaves an all-portrait set in its original order", () => {
    const photos = Array.from({ length: 7 }, (_, i) => tall(`P${i}`));
    expect(ids(arrangeForSlots(photos, SPANS))).toEqual(ids(photos));
  });

  it("keeps portrait photos out of the wide slots", () => {
    // Portraits first in the input, so a naive pass would drop one straight
    // into slot 0 — the widest tile on the grid.
    const photos = [tall("P0"), tall("P1"), wide("L0"), wide("L1"), wide("L2"), tall("P2"), tall("P3")];
    const arranged = arrangeForSlots(photos, SPANS);

    SPANS.forEach((span, i) => {
      if (span === 2) {
        expect(arranged[i].width).toBeGreaterThanOrEqual(arranged[i].height);
      }
    });
  });

  it("preserves relative order within each shape", () => {
    const photos = [wide("L0"), tall("P0"), wide("L1"), tall("P1"), wide("L2"), tall("P2"), wide("L3")];
    const arranged = ids(arrangeForSlots(photos, SPANS));

    expect(arranged.filter((id) => id.startsWith("L"))).toEqual(["L0", "L1", "L2", "L3"]);
    expect(arranged.filter((id) => id.startsWith("P"))).toEqual(["P0", "P1", "P2"]);
  });

  it("leaves a portrait where it was written when its slot is a single", () => {
    // The sheet's own case: one portrait, hand-placed third. A single is 5/6,
    // so it holds that photo fine and nothing needs to move — pulling it to the
    // first single would renumber every photo behind it.
    const photos = [wide("L0"), wide("L1"), tall("P0"), wide("L2"), wide("L3"), wide("L4"), wide("L5")];
    expect(ids(arrangeForSlots(photos, SPANS))).toEqual(ids(photos));
  });

  it("returns every photo exactly once", () => {
    const photos = [wide("L0"), tall("P0"), tall("P1"), wide("L1"), wide("L2"), tall("P2"), wide("L3"), tall("P3")];
    expect(ids(arrangeForSlots(photos, SPANS)).sort()).toEqual(ids(photos).sort());
  });

  it("fills a wide slot with a portrait rather than leaving a hole", () => {
    // One landscape, and the pattern opens with two wide slots across eight
    // tiles. The second has to take a portrait; an empty slot would shift every
    // tile after it and break the row sums.
    const photos = [wide("L0"), ...Array.from({ length: 7 }, (_, i) => tall(`P${i}`))];
    const arranged = arrangeForSlots(photos, SPANS);

    expect(arranged).toHaveLength(8);
    expect(arranged[0].id).toBe("L0");
    expect(arranged.filter(Boolean)).toHaveLength(8);
  });

  it("handles an empty slot pattern without dropping photos", () => {
    const photos = [wide("L0"), tall("P0")];
    expect(ids(arrangeForSlots(photos, []))).toEqual(["L0", "P0"]);
  });
});
