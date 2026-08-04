"use client";

import { useEffect } from "react";

// Smooth scroll runs a continuous rAF loop (gsap.ticker → lenis.raf) that stays
// busy every frame once started. Two facts shape when we start it:
//
//  1. Lenis `smoothWheel` only smooths *wheel* input — touch devices scroll
//     natively (syncTouch is off), so mobile gains nothing from it. Starting it
//     there only risks a mid-gesture hitch (the async import + ScrollTrigger
//     reflow landing while a finger drag is in flight). So: fine-pointer only.
//
//  2. We start it *before* the first scroll, during idle time after mount, not
//     *on* the first scroll. Gating on scroll intent meant Lenis attached mid-
//     gesture — the async chunk import + ScrollTrigger.refresh() reflow landing
//     while the wheel was already scrolling natively — a visible hitch on the
//     very first scroll. requestIdleCallback loads the chunk while the main
//     thread is quiet, so a real visitor's first scroll is smooth from frame one.
//     The only cost is the loop running during an automated audit (idle fires
//     there too); that lands on desktop Lighthouse's unscored "Other" time, so
//     it does not move the score.

export default function SmoothScrollInit() {
  useEffect(() => {
    // Reload should not restore a stale scroll position — unconditional, and
    // independent of the (fine-pointer-only) smooth-scroll loop below.
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Touch/coarse-pointer devices scroll natively; skip the loop entirely.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    // Lenis eases every wheel gesture (lerp 0.12), which is exactly the motion
    // someone asking for reduced motion wants gone. The CSS block in globals
    // cannot reach it — this is a JS rAF loop, not a transition. Bailing here
    // also keeps the lenis/gsap chunk off their wire entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

      // The effect may have been torn down while the imports were in flight;
      // bail before creating a Lenis instance / ticker that nothing owns.
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        smoothWheel: true,
        lerp: 0.12,
        // Lenis watches `content` with a ResizeObserver to keep its scroll
        // limit current, and defaults that to <html> — which this page pins to
        // the viewport (`h-full`), so its observed box never changes and the
        // limit goes stale the moment the document grows. That is how the
        // contact form's error messages used to cut the last ~60px off the
        // footer: the page got taller, Lenis did not notice, and the wheel
        // stopped short. <body> is the box that actually grows here.
        content: document.body,
      });

      lenis.on("scroll", ScrollTrigger.update);

      const tickerCb = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.refresh();

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          setTimeout(() => ScrollTrigger.refresh(), 150);
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      cleanup = () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        lenis.destroy();
        gsap.ticker.remove(tickerCb);
      };
    };

    // Warm the loop during idle time after mount so it is already running before
    // the first scroll. Fall back to a short timeout where rIC is unavailable
    // (older Safari); the `timeout` option caps the wait on busy load too.
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(() => void init(), {
        timeout: 2000,
      });
    } else {
      timeoutHandle = setTimeout(() => void init(), 200);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
      }
      cleanup?.();
    };
  }, []);

  return null;
}
