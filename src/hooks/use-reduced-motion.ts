"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Has the visitor asked their OS for less motion?
 *
 * Not framer-motion's hook of the same name. That one reads the preference once
 * into `useState` on the first render and never updates it — its own source
 * carries the TODO. On a server-rendered page that first render happens where no
 * media query can be evaluated, so it hydrates to `false` and stays `false` for
 * the life of the page, no matter what the visitor set. Every component that
 * asked it got the wrong answer, silently.
 *
 * useMediaQuery goes through `useSyncExternalStore`: `false` for the server
 * snapshot, then a real read on the client after hydration, plus a subscription
 * so flipping the OS setting takes effect without a reload.
 *
 * `MotionConfig reducedMotion="user"` in page-layout is unaffected — it checks
 * the query inside the animation layer, not through this hook. Use this for the
 * things that switch cannot reach: MotionValues, ScrollTrigger, plain CSS
 * transitions in inline styles, and anything that autoplays.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
