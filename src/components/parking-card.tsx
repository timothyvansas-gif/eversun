"use client";
import { useState } from "react";
import Image from "next/image";
import { m, AnimatePresence, useInView } from "framer-motion";
import { useContainerScale } from "@/hooks/use-container-scale";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
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

// Where the tooltip points, in the canvas's own 411x431 design units. Not the
// pin's own 26px width: PinMarker is a centred flex column whose widest child
// is the 47px shadow ellipse, so the column sits at left 186 and its centre —
// the one the pin is drawn on — is 186 + 47/2. The head starts at y 184, and
// the label keeps 8px of air above it.
//
// The card converts both with --canvas-scale, because the label itself lives
// outside the scaled canvas and would otherwise have its type shrunk along
// with the map.
const TIP_X = 209.5;

// The pin's head starts here in design units, and the label keeps a fixed
// distance above it in *container* pixels. Scaling that gap too would squeeze
// it to under 7px on a phone-width card, where the label needs more air rather
// than less.
const PIN_TOP_Y = 184;
const TIP_GAP_PX = 10;

export default function ParkingCard() {
  const { containerRef, contentRef } = useContainerScale(411);
  const parkingInView = useInView(containerRef, { once: false, amount: 0.5 });
  const { isCovered } = useStickyCard();
  const shouldAnimate = parkingInView && !isCovered;

  const [tipOpen, setTipOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  // Hover capability, not screen width: a mouse gets hover, a finger gets tap.
  // Width would call a touch laptop or a big tablet "desktop" and leave the
  // address unreachable there, since a tap fires enter and leave in one go.
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[362px] xl:h-[431px] bg-brand rounded-[12px] overflow-hidden"
      onMouseEnter={canHover ? () => setTipOpen(true) : undefined}
      onMouseLeave={canHover ? () => setTipOpen(false) : undefined}
      // Touch: anywhere on the card toggles. The label is pointer-events-none,
      // so tapping it counts as tapping the card and closes it again.
      onClick={canHover ? undefined : () => setTipOpen((v) => !v)}
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

      {/* Outside the scaled canvas so the address keeps the card's own type
          size, but placed on canvas coordinates through --canvas-scale. The
          -50%/-100% shift rides on the `translate` property, which leaves
          `transform` free for the few pixels of travel below. */}
      <div
        className="pointer-events-none absolute z-[3]"
        style={{
          left: "calc(var(--canvas-x, 0px) + " + TIP_X + "px * var(--canvas-scale, 1))",
          top: `calc(${PIN_TOP_Y}px * var(--canvas-scale, 1) - ${TIP_GAP_PX}px)`,
        }}
        aria-hidden="true"
      >
        <AnimatePresence>
          {tipOpen && (
            <m.div
              // One size at every width. The label deliberately does not
              // scale with the canvas — its type would shrink along with the
              // map — so 15px is what it stays, phone included.
              className="-translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-white px-3 py-2 text-[15px] font-medium text-ink-primary shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              // Leaving is quicker than arriving. A tooltip that fades out on
              // the same soft curve trails the cursor off the card.
              exit={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 4,
                transition: { duration: 0.16, ease: "easeOut" as const },
              }}
              // A spring with no bounce rather than an expo curve: expo-out
              // dumps most of the move into the first 50ms, which is what read
              // as abrupt. This one eases in as well as out.
              transition={{ type: "spring" as const, duration: 0.55, bounce: 0 }}
            >
              Kloekhorststraat 4a, Assen
            </m.div>
          )}
        </AnimatePresence>
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
