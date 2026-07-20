"use client";

import React, { useRef, useEffect, useState, forwardRef } from "react";
import { m, Variants } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { StickyCardContext } from "./sticky-card-context";

interface Props {
  children: React.ReactNode;
  index: number;
  total: number;
  offsetTop?: number;
  variants?: Variants;
  custom?: number;
}

const StickyCardWrapper = forwardRef<HTMLDivElement, Props>(
  function StickyCardWrapper({ children, index, total, offsetTop = 132, variants, custom }, forwardedRef) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scalingRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const isMobile = useMediaQuery("(max-width: 767px)");
    const [isCovered, setIsCovered] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    // The scroll-driven scale-down is mobile-only, below the fold, and purely
    // cosmetic — so gsap + ScrollTrigger (and the layout-reading refresh) load
    // lazily here instead of in the initial bundle. Desktop and the last card
    // never load gsap at all.
    useEffect(() => {
      if (!isMounted || !isMobile || index === total - 1) return;
      const container = containerRef.current;
      const scaling = scalingRef.current;
      if (!container || !scaling) return;

      let cancelled = false;
      let cleanup: (() => void) | undefined;

      void (async () => {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: `top ${offsetTop}px`,
            end: "bottom top",
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const covered = self.progress > 0.85;
              setIsCovered((prev) => (prev === covered ? prev : covered));
            },
          },
        });

        tl.to(scaling, {
          scale: 0.9,
          ease: "power1.inOut",
        });

        ScrollTrigger.refresh();

        cleanup = () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      })();

      return () => {
        cancelled = true;
        cleanup?.();
      };
    }, [isMounted, isMobile, index, total, offsetTop]);

    return (
      <div
        ref={(node) => {
          (containerRef as React.RefObject<HTMLDivElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        style={{
          position: isMounted && isMobile ? "sticky" : "relative",
          top: isMounted && isMobile ? `${offsetTop}px` : "auto",
        } as React.CSSProperties}
        className="w-full origin-top"
      >
        <div
          ref={scalingRef}
          className="origin-top w-full will-change-transform"
        >
          <m.div
            variants={variants}
            custom={custom}
            className="w-full"
          >
            <StickyCardContext.Provider value={{ isCovered }}>
              {children}
            </StickyCardContext.Provider>
          </m.div>
        </div>
      </div>
    );
  }
);

export default StickyCardWrapper;
