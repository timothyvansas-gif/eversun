import { useEffect } from "react";

/**
 * Locks page scroll while `locked` is true. Pair with `data-lenis-prevent` on
 * the overlay's backdrop and panel: overflow:hidden only stops native scroll,
 * Lenis drives the page via JS and needs the attribute to ignore wheel/touch
 * input over the overlay.
 */
let lockCount = 0;

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount++;
    document.documentElement.style.overflow = "hidden";
    return () => {
      lockCount--;
      // Nested overlays (e.g. QR modal over the photo sheet) each hold a lock;
      // only the last one released may restore scrolling.
      if (lockCount === 0) document.documentElement.style.overflow = "";
    };
  }, [locked]);
}
