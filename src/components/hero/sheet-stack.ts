/**
 * Geometry for stacking one bottom sheet on top of another.
 *
 * Kept out of the sheet components themselves so the sheet in front can size
 * itself against the one behind without importing it — the overlays are loaded
 * with next/dynamic, and a named import would pull them back into the main
 * bundle.
 */

/** How far back the sheet underneath sinks, measured from its bottom edge. */
export const BEHIND_SCALE = 0.94;
/** How far it lifts on top of that, in pixels. Negative is up. */
export const BEHIND_LIFT = -16;
/** How much of it should stay in view above the sheet in front. */
const SHOULDER = 40;

/**
 * The spring the whole stack moves on — the sheets sink, grow and settle on one
 * curve, so the two never read as two animations that happen to overlap. Same
 * numbers the sheets themselves slide in on.
 */
export const STACK_SPRING = { type: "spring", damping: 40, stiffness: 300 } as const;

/**
 * How far the sheet in front is dragged, in pixels of pointer travel, before
 * the sheet behind is back at its own size. Past the 80px that closes the sheet
 * in front, so a drag that ends in a close hands over to a sheet that is most
 * of the way home rather than one that snapped there early.
 */
const RELEASE_TRAVEL = 200;

/**
 * How far into the stack the sheet behind sits for a given drag: 1 while the
 * sheet in front is at rest, 0 once it has been dragged clear.
 *
 * Upward drags (negative offsets) hold at 1 — the sheet in front cannot go up
 * past its constraint, so there is nothing to give back.
 */
export function stackDepthForDrag(offsetY: number): number {
  if (offsetY <= 0) return 1;
  return Math.max(0, 1 - offsetY / RELEASE_TRAVEL);
}

/**
 * How much the two stacked sheets give way past their bottom constraint: a
 * finger that travels 200px moves the sheet 100px. Shared because the scrim
 * below does the same sum — hard-code it in one place and the dim starts
 * lying about where the sheet is.
 */
export const DRAG_ELASTIC = 0.5;

/**
 * How dim the extra scrim is for a given drag, from full to gone.
 *
 * Not the stack depth: that runs out after 200px of finger, while the sheet it
 * dims still fills all but a sliver of the screen — the dim would be gone with
 * the sheet still sitting there. This tracks the sheet itself, so the scrim
 * only clears as the sheet clears, and a normal close-drag barely touches it.
 * The exit fade carries the rest once the sheet is on its way out.
 *
 * `sheetHeight` is the sheet's own height in pixels, measured when the drag
 * starts; 0 or less means it could not be measured, and the scrim stays put.
 */
export function scrimOpacityForDrag(offsetY: number, sheetHeight: number): number {
  if (offsetY <= 0 || sheetHeight <= 0) return 1;
  return Math.max(0, 1 - (offsetY * DRAG_ELASTIC) / sheetHeight);
}

/**
 * The height the sheet in front needs for the sheet behind to show exactly a
 * shoulder of its own above it.
 *
 * The sheet behind is anchored to the bottom of the screen and scales from that
 * edge, so its top lands at `viewport − height × scale + lift`. Everything
 * below that line is the sheet in front, which makes its height independent of
 * the viewport: it follows the height of the sheet behind it.
 *
 * Returns undefined when there is nothing behind, so the sheet keeps hugging
 * its content.
 */
export function stackedSheetHeight(panel: HTMLElement | null | undefined): number | undefined {
  if (!panel) return undefined;
  return Math.round(panel.offsetHeight * BEHIND_SCALE - BEHIND_LIFT - SHOULDER);
}
