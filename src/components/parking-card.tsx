"use client";
import Image from "next/image";
import { m, useInView } from "framer-motion";
import { useContainerScale } from "@/hooks/use-container-scale";
import { useStickyCard } from "@/components/sticky-card-context";
import PinMarker from "@/components/pin-marker";
import parkingBackground from "@/images/bg-park-yellow.svg";
import pBordSm from "@/images/p-bord-sm.svg";
import pBordL from "@/images/p-bord-l.svg";

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
  hidden: { 
    y: -180, 
    opacity: 0, 
    transition: { 
      opacity: { duration: 0.4, ease: "easeOut" as const }, 
      y: { delay: 0.4, duration: 0 } 
    } 
  },
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
} as const;

export default function ParkingCard() {
  const { containerRef, contentRef } = useContainerScale(411);
  const parkingInView = useInView(containerRef, { once: false, amount: 0.5 });
  const { isCovered } = useStickyCard();
  const shouldAnimate = parkingInView && !isCovered;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[362px] xl:h-[431px] bg-brand rounded-[12px] overflow-hidden"
    >
      {/* A real responsive image rather than part of the JS-scaled canvas.
          Mobile Safari could leave the transformed CSS background unpainted
          until a resize forced another composite. This has the same geometry
          — 32px from the top on mobile, 40px at the 411px design width — but
          is correct on the first paint without waiting for ResizeObserver. */}
      <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-center xl:top-10">
        <Image
          src={parkingBackground}
          alt=""
          loading="eager"
          unoptimized
          className="h-auto w-full max-w-[411px]"
        />
      </div>

      <div
        ref={contentRef}
        className="absolute top-0 left-0 origin-top-left z-[2]"
        style={{ width: 411, height: 431 }}
      >

        {P_BORD_SM.map((s, i) => (
          <m.img
            key={i}
            src={pBordSm.src}
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
        <m.img
          src={pBordL.src}
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

      {/* Gradient fade overlay in container space — independent of canvas scale */}
      <div
        className="max-xl:block hidden absolute inset-0 pointer-events-none z-[1]"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, var(--color-brand) 100%)" }}
      />

      {/* Unscaled text overlay for mobile consistency - adjusted margin to match PhotoCard */}
      <div className="absolute bottom-6 left-6 xl:bottom-10 xl:left-10 z-10 pointer-events-none">
        <h3 className="card-title text-zinc-900">Parkeren? Geen punt</h3>
        <p className="card-body text-zinc-800 mt-1">
          Direct voor de deur of garage Citadel
        </p>
      </div>
    </div>
  );
}
