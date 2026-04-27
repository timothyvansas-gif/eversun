"use client";

import { useRef, useEffect, useState } from "react";
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

/**
 * StickyCardWrapper
 * 
 * A senior-grade wrapper that handles sticky positioning and scroll-driven 
 * scaling interactions using GSAP ScrollTrigger.
 */
export default function StickyCardWrapper({ children, index, total, offsetTop = 132, variants, custom }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scalingRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sync mounting state to prevent hydration mismatches with window-dependent logic
  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Ensure GSAP knows the correct positions after the initial layout pass
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timeout);
    };
  }, []);

  useGSAP(() => {
    if (!isMounted || !isMobile || index === total - 1) return;

    // The scaling animation triggers when the card is in its sticky position
    // and continues as the next cards scroll over it.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        // Start scaling as soon as the card hits its sticky top position
        start: `top ${offsetTop}px`,
        // Continue scaling until the card is eventually pushed out by its container
        end: "bottom top", 
        scrub: true,
        invalidateOnRefresh: true,
      }
    });

    tl.to(scalingRef.current, {
      scale: 0.9,
      ease: "power1.inOut"
    });

    return () => {
      tl.kill();
    };
  }, { dependencies: [isMounted, isMobile, offsetTop], scope: containerRef });

  return (
    <div
      ref={containerRef}
      style={{
        position: isMobile ? "sticky" : "relative",
        top: isMobile ? `${offsetTop}px` : "auto",
        zIndex: 10 + index,
      } as React.CSSProperties}
      className="w-full origin-top"
    >
      <div 
        ref={scalingRef} 
        className="origin-top w-full will-change-transform" 
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
