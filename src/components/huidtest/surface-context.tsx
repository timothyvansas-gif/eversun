"use client";

import { createContext, useContext } from "react";

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
export const HuidtestSurfaceContext = createContext<HTMLElement | null>(null);

export function useHuidtestSurface(): HTMLElement | null {
  return useContext(HuidtestSurfaceContext);
}
