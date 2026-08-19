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
 * `arrangeForSlots` takes that job. Photos go in in reading order, slots are
 * filled with something that fits, and the pattern is never violated. With an
 * all-landscape set — which is every photo in the sheet today — it returns the
 * input untouched, so this changes nothing until the first portrait arrives.
 */

/** How many columns a slot takes on the desktop grid. */
export type Slot = 1 | 2;

/** The bit of a photo this module needs: its shape. */
export type Shaped = { width: number; height: number };

const isLandscape = (p: Shaped) => p.width >= p.height;

/**
 * Orders `photos` so each one lands in a slot it suits.
 *
 * Wide slots (2 columns) prefer landscape, single slots prefer portrait, and
 * either takes the next photo of the other kind rather than leave a hole — a
 * hole would shift every tile after it and break the row sums the pattern
 * depends on. Relative order within each shape is preserved, so a photo never
 * jumps ahead of another of its own kind.
 *
 * `spans` is the repeating slot pattern; it cycles for as many photos as there
 * are.
 */
export function arrangeForSlots<T extends Shaped>(photos: T[], spans: Slot[]): T[] {
  if (spans.length === 0) return [...photos];

  const landscape = photos.filter(isLandscape);
  const portrait = photos.filter((p) => !isLandscape(p));

  let l = 0;
  let p = 0;

  return photos.map((_, i) => {
    const wantsLandscape = spans[i % spans.length] === 2;
    const first = wantsLandscape ? landscape : portrait;
    const second = wantsLandscape ? portrait : landscape;
    const firstIndex = wantsLandscape ? l : p;
    const secondIndex = wantsLandscape ? p : l;

    if (firstIndex < first.length) {
      if (wantsLandscape) l++;
      else p++;
      return first[firstIndex];
    }

    // Nothing of the preferred shape left. Take the other rather than leave the
    // slot empty; the crop is the lesser of the two problems.
    if (wantsLandscape) p++;
    else l++;
    return second[secondIndex];
  });
}
