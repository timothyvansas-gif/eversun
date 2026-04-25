"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  variants?: any;
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
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
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
    // Only animate on mobile and for non-last cards
    if (!isMounted || !isMobile || index === total - 1) return;

    // Create a localized timeline for this card's exit animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        // Trigger based on the bottom of the sticky card reaching the header zone
        start: `bottom ${offsetTop + 250}px`,
        end: `bottom ${offsetTop}px`,
        scrub: true,
        invalidateOnRefresh: true,
      }
    });

    tl.fromTo(scalingRef.current, 
      { scale: 1, opacity: 1 },
      {
        scale: 0.9,
        opacity: 1,
        ease: "power1.inOut",
      }
    );

    return () => {
      tl.kill();
      ScrollTrigger.refresh();
    };
  }, { dependencies: [isMounted, isMobile, offsetTop], scope: containerRef });

  return (
    <div
      ref={containerRef}
      style={{
        zIndex: 10 + index,
        // CSS-driven sticky position using the dynamic header height variable
        ...(isMounted && isMobile ? { top: "var(--header-height, 132px)" } : {})
      }}
      className={`origin-top w-full ${isMounted && isMobile ? 'sticky' : ''}`}
    >
      <div 
        ref={scalingRef} 
        className="origin-top w-full will-change-transform" 
        style={{ opacity: 1 }}
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
