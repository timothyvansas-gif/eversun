/**
 * Programmatic smooth-scroll to the top of the page.
 *
 * Fires `PROGRAMMATIC_SCROLL_EVENT` first so scroll-linked animations (e.g. the
 * hero parallax spring) can bypass their smoothing while the browser drives the
 * scroll — otherwise the animation visibly lags behind and "glides" into place
 * after arrival.
 */
import { animateScrollTo, prefersAnimatedScroll } from "@/lib/animate-scroll";

export const PROGRAMMATIC_SCROLL_EVENT = "eversun:programmatic-scroll";

export function scrollToTop() {
  window.dispatchEvent(new Event(PROGRAMMATIC_SCROLL_EVENT));
  if (prefersAnimatedScroll()) {
    animateScrollTo(0);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
