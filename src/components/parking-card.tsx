"use client";
import { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useContainerScale } from "@/hooks/use-container-scale";
import PinMarker from "@/components/pin-marker";

const P_BORD_SM = [
  // Diagonal column (upper center, following diagonal road)
  { top: 66,  left: 172, rotate: 30 },
  { top: 89,  left: 157, rotate: 30 },
  { top: 111, left: 141, rotate: 30 },
  // Horizontal row (above pin, slight tilt)
  { top: 143, left: 173, rotate: 20 },
  { top: 152, left: 199, rotate: 20 },
  { top: 161, left: 225, rotate: 18 },
  { top: 169, left: 251, rotate: 15 },
  { top: 174, left: 278, rotate: 12 },
  // Lower-left group
  { top: 209, left: 68,  rotate: 40 },
  { top: 232, left: 51,  rotate: 40 },
];

const itemVariants = {
  hidden: { y: -180, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 22,
      delay: 0.3 + i * 0.08,
    },
  }),
};

export default function ParkingCard() {
  const [mounted, setMounted] = useState(false);
  const { containerRef, contentRef } = useContainerScale(411);
  const parkingInView = useInView(containerRef, { once: true, amount: 0.5 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate = mounted && parkingInView;

  return (
    <div
      ref={containerRef}
      className="relative w-full lg:w-[411px] h-[362px] lg:h-[431px] bg-brand rounded-lg overflow-hidden lg:shrink-0"
    >
      <div
        ref={contentRef}
        className="absolute top-0 left-0 origin-top-left bg-brand"
        style={{ width: 411, height: 431 }}
      >
        {/* Background SVG - Softened significantly on mobile for a premium feel */}
        <div 
          className="absolute inset-0 bg-[url('/bg-park-yellow.svg')] bg-no-repeat bg-[center_top_40px] opacity-100" 
        />

        {P_BORD_SM.map((s, i) => (
          <motion.img
            key={i}
            src="/p-bord-sm.svg"
            width={24}
            height={24}
            alt="Parkeerbord icoon"
            className="absolute"
            style={{ top: s.top, left: s.left, rotate: s.rotate }}
            custom={i}
            initial="hidden"
            animate={shouldAnimate ? "visible" : "hidden"}
            variants={itemVariants}
          />
        ))}
        <motion.img
          src="/p-bord-l.svg"
          alt="Groot parkeerbord icoon"
          className="absolute"
          style={{ top: 231, left: 313 }}
          custom={P_BORD_SM.length}
          initial="hidden"
          animate={shouldAnimate ? "visible" : "hidden"}
          variants={itemVariants}
        />

        <PinMarker />
      </div>

      {/* Unscaled text overlay for mobile consistency - adjusted margin to match PhotoCard */}
      <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 z-10 pointer-events-none">
        <h3 className="card-title text-zinc-900">Parkeren? Geen punt</h3>
        <p className="card-body text-zinc-800 mt-1">
          Direct voor de deur of garage Citadel
        </p>
      </div>
    </div>
  );
}
