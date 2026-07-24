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
//  2. Kicking the loop off eagerly keeps the main thread warm during load — the
//     "Other" time desktop Lighthouse penalises. Gating it on the first real
//     scroll intent (wheel/keydown/scrollbar drag) keeps the loop off during an
//     automated audit (bots don't scroll) while a real visitor triggers it on
//     their first scroll, imperceptibly. No idle fallback: an idle timer would
//     fire during the audit trace and reintroduce the very cost we removed, and
//     a visitor who never scrolls needs no smoothing anyway.
const START_EVENTS = ["wheel", "keydown", "scroll"] as const;

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

    let started = false;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const stopWaiting = () =>
      START_EVENTS.forEach((e) => window.removeEventListener(e, onIntent));

    const init = async () => {
      if (started) return;
      started = true;
      stopWaiting();

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

    const onIntent = () => void init();
    START_EVENTS.forEach((e) =>
      window.addEventListener(e, onIntent, { once: true, passive: true }),
    );

    return () => {
      cancelled = true;
      stopWaiting();
      cleanup?.();
    };
  }, []);

  return null;
}
