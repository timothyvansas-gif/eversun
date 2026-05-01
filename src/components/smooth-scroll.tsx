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

    // 2. Prevent browser from jumping to scroll positions automatically
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // 3. Link Lenis scroll to ScrollTrigger update
    // This ensures GSAP animations stay in sync with the smooth scroll
    lenis?.on("scroll", ScrollTrigger.update);

    // 4. Handle visibility change (mobile "wake up")
    // Stop Lenis when hidden so it doesn't run in the background.
    // Delay refresh on return so browser layout is stable before GSAP recalculates.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lenis?.stop();
      } else {
        lenis?.start();
        setTimeout(() => ScrollTrigger.refresh(), 150);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 5. Initial refresh
    ScrollTrigger.refresh();

    return () => {
      lenis?.off("scroll", ScrollTrigger.update);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.12, 
        duration: 1.2, 
        smoothWheel: true,
        // syncTouch verwijderd: we gebruiken native scroll op mobiel voor het beste gevoel
      }}
    >
      <ScrollTriggerConfig />
      {children}
    </ReactLenis>
  );
}
