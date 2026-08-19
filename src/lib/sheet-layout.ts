/**
 * Fitting photos to the foto-sheet's mosaic.
 *
 * The desktop grid repeats a fixed slot pattern: a wide one beside a single,
 * three singles, then a single beside a wide. Every cycle adds up to the full
 * three columns, so the mosaic never leaves a hole. That pattern is what gives
 * the sheet its rhythm and it stays.
 *
 * What cannot stay is the assumption underneath it: that the photo at index N
 * suits whatever shape slot N happens to be. It held while every photo was
 * landscape. A portrait shot in a wide slot is cropped to a band across its
 * middle — so as soon as the set is mixed, the list has to be ordered by hand
 * against a pattern nobody can see while adding photos.
 *
 * `arrangeForSlots` takes that job, and takes only that job: a wide slot gets a
 * landscape photo. Everything else is left where it was written. A single slot
 * is 5/6 — upright, but not so narrow that a landscape shot in it is a problem;
 * the whole sheet was landscapes in singles before any portrait existed. So
 * singles have no preference, and a portrait sitting in one stays put instead of
 * being pulled forward to the first single on the grid, which would quietly
 * renumber every photo after it the moment one portrait joined the set.
 */

/** How many columns a slot takes on the desktop grid. */
export type Slot = 1 | 2;

/** The bit of a photo this module needs: its shape. */
export type Shaped = { width: number; height: number };

const isLandscape = (p: Shaped) => p.width >= p.height;

/**
 * Orders `photos` so no portrait lands in a wide slot, moving as little as
 * possible to get there.
 *
 * A wide slot keeps the photo written at its own index when that photo is
 * landscape; otherwise it borrows the earliest landscape still unplaced. Once
 * the landscapes run out a wide slot takes a portrait rather than stand empty —
 * a hole would shift every tile after it and break the row sums the pattern
 * depends on. Whatever is left fills the remaining slots in reading order, so
 * relative order within each shape survives and a hand-placed photo keeps its
 * position unless its slot cannot hold it.
 *
 * `spans` is the repeating slot pattern; it cycles for as many photos as there
 * are.
 */
export function arrangeForSlots<T extends Shaped>(photos: T[], spans: Slot[]): T[] {
  if (spans.length === 0) return [...photos];

  const out: (T | undefined)[] = new Array(photos.length);
  const placed = new Array(photos.length).fill(false);
  const wideSlots = photos.map((_, i) => i).filter((i) => spans[i % spans.length] === 2);

  const take = (index: number) => {
    placed[index] = true;
    return photos[index];
  };

  // A wide slot whose own photo is landscape needs no help at all.
  const borrowing = wideSlots.filter((i) => {
    if (!isLandscape(photos[i])) return true;
    out[i] = take(i);
    return false;
  });

  // The rest borrow the earliest landscape still going. If there is none left,
  // leave the slot to the fill below rather than reach for a portrait early:
  // grabbing one here would move photos that were fine where they were.
  for (const slot of borrowing) {
    const donor = photos.findIndex((p, i) => !placed[i] && isLandscape(p));
    if (donor === -1) break;
    out[slot] = take(donor);
  }

  // Everything still unplaced drops into the empty slots in reading order.
  let next = 0;
  for (let slot = 0; slot < out.length; slot++) {
    if (out[slot]) continue;
    while (placed[next]) next++;
    out[slot] = take(next);
  }

  return out as T[];
}
