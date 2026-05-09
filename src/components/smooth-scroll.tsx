"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GsapConfig
 * 
 * Initializes GSAP ScrollTrigger for native scrolling.
 */
function GsapConfig() {
  useEffect(() => {
    // 1. Register the plugin
    gsap.registerPlugin(ScrollTrigger);

    // 2. Prevent browser from jumping to scroll positions automatically
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // 3. Initial refresh
    ScrollTrigger.refresh();

    // 4. Handle visibility change (mobile "wake up")
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setTimeout(() => ScrollTrigger.refresh(), 150);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GsapConfig />
      {children}
    </>
  );
}
