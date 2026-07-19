import { useEffect } from "react";

/**
 * Locks page scroll while `locked` is true. Pair with `data-lenis-prevent` on
 * the overlay's backdrop and panel: overflow:hidden only stops native scroll,
 * Lenis drives the page via JS and needs the attribute to ignore wheel/touch
 * input over the overlay.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [locked]);
}
