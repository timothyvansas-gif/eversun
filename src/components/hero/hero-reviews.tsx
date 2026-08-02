"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { StaticImageData } from "next/image";
import { m, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import reviewer1 from "@/images/people/reviewer-1.webp";
import reviewer2 from "@/images/people/reviewer-2.webp";
import reviewer3 from "@/images/people/reviewer-3.webp";
import reviewer4 from "@/images/people/reviewer-4.webp";
import reviewer5 from "@/images/people/reviewer-5.webp";
import StarIcon from "@/components/ui/star-icon";
import { useMediaQuery } from "@/hooks/use-media-query";

// Order is left to right; the last one ends up nearest the rating figure.
const reviewers = [reviewer1, reviewer4, reviewer2, reviewer5, reviewer3];

// On load every avatar sits stacked behind the last one (the top of the z-stack,
// on the right); the rest then glide out to the left into place with an elastic
// bounce. STACK_STEP = 56px avatar − 24px (-space-x-6) overlap, which is also
// the centre-to-centre spacing the dock curve is calibrated against, so it has
// to be changed in step with that class.
const STACK_STEP = 32;
const ENTRANCE_DELAY = 1.4; // wait for the review row to finish fading in
const ENTRANCE_STAGGER = 0.1;
const ANCHOR = reviewers.length - 1;

// macOS Dock magnification. Every avatar reads its own distance to the cursor
// and maps it onto a bell curve, so the one under the pointer peaks, its
// neighbours swell a little less, and the far ones stay at rest. The middle
// stops at ±STACK_STEP are what make it a curve instead of a triangle.
const AVATAR = 56; // the rendered box; scale is expressed against it
const SIZE_REST = 44;
const SIZE_NEIGHBOUR = 52;
const SIZE_PEAK = 68;
const REACH = 110; // how far from an avatar the wave still registers
const NUDGE = 10; // how far a neighbour is pushed aside to make room

const CURVE = [-REACH, -STACK_STEP, 0, STACK_STEP, REACH];
const SCALES = [SIZE_REST, SIZE_NEIGHBOUR, SIZE_PEAK, SIZE_NEIGHBOUR, SIZE_REST].map((px) => px / AVATAR);
// The stack sits tight at rest and opens up under the pointer: neighbours make
// way, so the overlap loosens exactly where the wave is. Distance is
// cursor − centre, so a negative distance means the avatar sits to the right of
// the cursor and has to move further right. Hence the sign flip.
// Every avatar gets the same range, including the two on the ends. Pinning
// those in place looked like the fix for the row spreading into the rating
// text, but it made their neighbours slide away while they stayed put, so the
// outer pairs bunched up at the exact moment the row was supposed to open.
// The row gap absorbs the spread instead.
const NUDGES = [0, NUDGE, 0, -NUDGE, 0];
const LIFTS = [0, -3, -8, -3, 0];

const DOCK_SPRING = { mass: 0.3, stiffness: 260, damping: 22 } as const;

const QUOTE_WIDTH = 400;

const tooltips: Record<number, { quote: string; name: string }> = {
  0: { quote: "Schoon en vriendelijk personeel", name: "Diana Boonstra" },
  1: { quote: "Wat een heerlijk schone en moderne studio is Ever Sun. Fijn in het centrum van Assen & parkeren voor de deur (gratis op zondag). Vriendelijk ontvangst en goede kwaliteit zonnebank met allemaal opties om naar eigen smaak in te stellen (ik had de medium sterke bank). Hier kom ik vaker!", name: "Koosje van Goinga" },
  2: { quote: "Hier ga je altijd vrolijk en getint de deur uit!", name: "Jackelien Beikes" },
  3: { quote: "Hele nette en fijne zonnestudio! Aardig personeel dus zeker de moeite waard om heen te gaan.", name: "Celine Ashley van Zanen" },
  4: { quote: "Mooie zonnestudio, vriendelijk personeel. Prachtig bruiningsresultaat en het ziet er brandschoon uit.", name: "Willeke Veenstra" },
};

function DockAvatar({
  img,
  index,
  mouseX,
  isActive,
  reduce,
  onActivate,
  onDeactivate,
  onSettled,
}: {
  img: StaticImageData;
  index: number;
  mouseX: MotionValue<number>;
  isActive: boolean;
  reduce: boolean | null;
  onActivate: () => void;
  onDeactivate: () => void;
  onSettled?: () => void;
}) {
  // Measured on the outer element, which the dock never displaces. Measuring
  // the moving element instead would feed its own offset back into the
  // distance and make the row oscillate.
  const ref = useRef<HTMLDivElement>(null);

  const centreDistance = useTransform(mouseX, (x: number) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return REACH;
    return x - (bounds.x + bounds.width / 2);
  });

  const scale = useSpring(useTransform(centreDistance, CURVE, SCALES), DOCK_SPRING);
  const nudge = useSpring(useTransform(centreDistance, CURVE, NUDGES), DOCK_SPRING);
  const lift = useSpring(useTransform(centreDistance, CURVE, LIFTS), DOCK_SPRING);

  const tooltip = tooltips[index];

  return (
    <m.div
      ref={ref}
      className="relative"
      style={{ zIndex: isActive ? 10 : index }}
      // No onMouseEnter: which avatar is active is derived from the cursor in
      // the row below, the same value the magnification reads. Hit-testing the
      // 56px boxes disagreed with it, because they overlap by 16px while the
      // curve peaks on the nearest centre.
      //
      // Keyboard focus parks the wave on this avatar, so tabbing through the
      // row produces the same magnification a pointer would.
      onFocus={() => {
        const bounds = ref.current?.getBoundingClientRect();
        if (bounds) mouseX.set(bounds.x + bounds.width / 2);
        onActivate();
      }}
      onBlur={() => {
        mouseX.set(Number.POSITIVE_INFINITY);
        onDeactivate();
      }}
      tabIndex={0}
      role="button"
      aria-label={tooltip ? `Review van ${tooltip.name}: ${tooltip.quote}` : undefined}
      initial={{ x: reduce ? 0 : (ANCHOR - index) * STACK_STEP }}
      animate={{ x: 0 }}
      transition={{ type: "spring", bounce: 0.5, duration: 0.85, delay: reduce ? 0 : ENTRANCE_DELAY + (ANCHOR - index) * ENTRANCE_STAGGER }}
      // The furthest-travelling avatar (i=0) settles last — its finish is
      // the cue for the title underlines to draw.
      onAnimationComplete={index === 0 ? () => onSettled?.() : undefined}
    >
      <m.div style={reduce ? undefined : { x: nudge }}>
        <m.div
          className="w-[56px] h-[56px] rounded-full overflow-hidden ring-1 ring-white/40"
          style={reduce ? undefined : { scale, y: lift }}
        >
          <Image
            src={img}
            alt={tooltip?.name ?? `Reviewer ${index + 1}`}
            width={56}
            height={56}
            className="object-cover"
          />
        </m.div>
      </m.div>
    </m.div>
  );
}

export default function HeroReviews({ onSettled }: { onSettled?: () => void }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const canHover = useMediaQuery("(hover: hover)");

  // Parked off-screen so every avatar reads a distance beyond REACH and sits
  // at rest until the pointer actually enters the row.
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

  // AnimatePresence keeps the exiting subtree around with its last props, so
  // this still resolves while the quote animates away.
  const active = activeIndex === null ? null : tooltips[activeIndex];

  return (
    <div className="hidden lg:flex items-center gap-6">
      {/* Positioning context for the quote. It has to sit outside the
          -space-x-4 row below: that utility spaces by child index, so mounting
          the quote inside it re-targeted the rule and shunted every avatar 16px
          sideways the moment the pointer arrived. */}
      <div className="relative">
        {/* Photo stack */}
        <div
          className="flex -space-x-6"
          onMouseMove={(e) => {
            if (!canHover) return;
            mouseX.set(e.clientX);
            // Same input as the magnification, so the quote can never belong to
            // a different face than the one that is peaking.
            const rowLeft = e.currentTarget.getBoundingClientRect().left;
            const nearest = Math.round((e.clientX - rowLeft - AVATAR / 2) / STACK_STEP);
            setActiveIndex(Math.min(reviewers.length - 1, Math.max(0, nearest)));
          }}
          onMouseLeave={() => {
            mouseX.set(Number.POSITIVE_INFINITY);
            setActiveIndex(null);
          }}
        >
          {reviewers.map((img, i) => (
            <DockAvatar
              key={i}
              img={img}
              index={i}
              mouseX={mouseX}
              isActive={activeIndex === i}
              reduce={reduce}
              onActivate={() => setActiveIndex(i)}
              onDeactivate={() => setActiveIndex(null)}
              onSettled={onSettled}
            />
          ))}
        </div>

        {/* One quote for the whole row, not one per avatar. Per-avatar panels
            each had their own AnimatePresence, so moving between neighbours
            left the old quote exiting on top of the new one. This single panel
            never unmounts while the pointer stays in the row; it just slides to
            the avatar under the cursor and swaps its text. */}
        <AnimatePresence>
          {active && activeIndex !== null && (
            <m.div
              className="absolute pointer-events-none"
              style={{
                bottom: "calc(100% + 32px)",
                left: AVATAR / 2,
                marginLeft: -QUOTE_WIDTH / 2,
                width: QUOTE_WIDTH,
                zIndex: 20,
              }}
              initial={{ y: 8, x: activeIndex * STACK_STEP }}
              animate={{ y: 0, x: activeIndex * STACK_STEP }}
              exit={{ y: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                  borderRadius: 16,
                  border: "1px solid #111",
                  background: "rgba(0, 0, 0, 0.85)",
                  boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.22)",
                  backdropFilter: "blur(2px)",
                }}
              >
                <div className="flex" style={{ gap: 4, marginBottom: 8 }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <StarIcon key={s} size={16} />
                  ))}
                </div>
                <span className="font-sans text-[15px] leading-[24px] text-white/90">
                  {active.quote}
                </span>
                <span className="font-sans text-[13px] text-white/50" style={{ marginTop: 12 }}>
                  {active.name}
                </span>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text Container */}
      <div className="h-[40px] flex items-center">
        <span className="font-sans font-normal text-[15px] leading-none whitespace-nowrap" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
          <span className="font-normal">4.9</span>/5 <span className="opacity-50">-</span> 176 reviews
        </span>
      </div>
    </div>
  );
}
