"use client";

import React, { useRef, useEffect, useState, forwardRef } from "react";
import { motion, Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
    const [isMobile, setIsMobile] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
      setIsMounted(true);
      const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
      checkMobile();
      window.addEventListener("resize", checkMobile);

      const onNavStart = () => setIsNavigating(true);
      const onNavEnd = () => setIsNavigating(false);
      window.addEventListener("programmatic-scroll-start", onNavStart);
      window.addEventListener("programmatic-scroll-end", onNavEnd);

      const timeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

      return () => {
        window.removeEventListener("resize", checkMobile);
        window.removeEventListener("programmatic-scroll-start", onNavStart);
        window.removeEventListener("programmatic-scroll-end", onNavEnd);
        clearTimeout(timeout);
      };
    }, []);

    useGSAP(() => {
      if (!isMounted || !isMobile || index === total - 1) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: `top ${offsetTop}px`,
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        }
      });

      tl.to(scalingRef.current, {
        scale: 0.9,
        ease: "power1.inOut"
      });
    }, { dependencies: [isMounted, isMobile, offsetTop], scope: containerRef });

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        style={{
          position: isMounted && isMobile && !isNavigating ? "sticky" : "relative",
          top: isMounted && isMobile && !isNavigating ? `${offsetTop}px` : "auto",
        } as React.CSSProperties}
        className="w-full origin-top sticky-card-wrapper"
      >
        <div
          ref={scalingRef}
          className="origin-top w-full will-change-transform sticky-card-scaling"
        >
          <motion.div
            variants={variants}
            custom={custom}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </div>
    );
  }
);

export default StickyCardWrapper;
