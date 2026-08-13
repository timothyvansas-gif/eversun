"use client";

import { createContext, useContext } from "react";
import type { MotionValue } from "framer-motion";

/**
 * The element the test is being shown in: the side panel on desktop, the sheet
 * on a phone, and nothing at all on the /huidtest route, where the test is the
 * page.
 *
 * It exists so a screen deep inside the quiz can put something on the edge of
 * that surface without knowing which surface it is — the booking sheet slides
 * up from the bottom of the panel, not from the bottom of the browser window.
 * Handing the element down beats reaching for it with a querySelector, which is
 * the same coupling written less honestly.
 */
export type HuidtestSurface = {
  element: HTMLElement | null;
  /**
   * 0 while the test is the front sheet, 1 once another sheet is stacked on it.
   * The surface reads it to sink; whatever stacks writes it, including while
   * being dragged back down, so the two move as one stack.
   */
  stackDepth: MotionValue<number> | null;
};

export const HuidtestSurfaceContext = createContext<HuidtestSurface>({
  element: null,
  stackDepth: null,
});

export function useHuidtestSurface(): HuidtestSurface {
  return useContext(HuidtestSurfaceContext);
}
