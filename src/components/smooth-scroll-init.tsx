"use client";

import { useEffect } from "react";

export default function SmoothScrollInit() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      if (typeof window !== "undefined" && "scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }

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

    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(() => void init());
    } else {
      setTimeout(() => void init(), 100);
    }

    return () => cleanup?.();
  }, []);

  return null;
}
