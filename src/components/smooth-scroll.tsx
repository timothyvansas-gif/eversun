"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ScrollTriggerConfig
 * 
 * Bridges Lenis smooth scroll with GSAP ScrollTrigger.
 * This ensures that GSAP is aware of the virtual scroll position 
 * managed by Lenis, preventing laggy or misplaced triggers.
 */
function ScrollTriggerConfig() {
  const lenis = useLenis();

  useEffect(() => {
    // 1. Register the plugin
    gsap.registerPlugin(ScrollTrigger);

    // 2. Synchronize GSAP ticker with Lenis raf
    // This is the "Gold Standard" for GSAP + Lenis integration
    const update = (time: number) => {
      lenis?.raf(time * 1000);
    };
    
    gsap.ticker.add(update);
    
    // Disable lag smoothing for perfect sync
    gsap.ticker.lagSmoothing(0);

    // 3. Link Lenis scroll to ScrollTrigger update
    lenis?.on("scroll", () => {
      ScrollTrigger.update();
    });

    // 4. Initial refresh to catch starting positions
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.5, smoothWheel: true }}>
      <ScrollTriggerConfig />
      {children}
    </ReactLenis>
  );
}
