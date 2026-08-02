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
