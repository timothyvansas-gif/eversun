"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Props {
  children: React.ReactNode;
  index: number;
  total: number;
  offsetTop?: number;
}

export default function StickyCardWrapper({ children, index, total, offsetTop = 132 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track the scroll progress of the card's placeholder.
  // Start scaling when the card hits its natural DOM position (offsetTop).
  // End scaling when the next card fully overlaps it.
  // Next card is 362px high + 16px gap = 378px away.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`start ${offsetTop}px`, `start ${offsetTop - 378}px`],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  const isLast = index === total - 1;

  return (
    <motion.div
      ref={ref}
      style={{
        scale: isMounted && isMobile && !isLast ? scale : 1,
        opacity: isMounted && isMobile && !isLast ? opacity : 1,
        zIndex: 10 + index,
        ...(isMounted && isMobile ? { top: "var(--header-height, 132px)" } : {})
      }}
      // max-md:sticky makes it stick on mobile
      // transform-origin top ensures it scales down from the top edge, maintaining the sticky visual effect
      className={`origin-top w-full ${isMounted && isMobile ? 'sticky' : ''}`}
    >
      {children}
    </motion.div>
  );
}
