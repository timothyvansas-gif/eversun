"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { StaticImageData } from "next/image";
import { m, AnimatePresence, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import StarIcon from "@/components/ui/star-icon";
import { useMediaQuery } from "@/hooks/use-media-query";
import { REVIEWS, REVIEW_SUMMARY } from "@/lib/reviews";

// Order is left to right; the last one ends up nearest the rating figure.
const reviewers = REVIEWS.map((review) => review.avatar);

// On load every avatar sits stacked behind the last one (the top of the z-stack,
// on the right); the rest then glide out to the left into place with an elastic
// bounce. STACK_STEP = the 56px box − 20px (-space-x-5), which is also the
// centre-to-centre spacing the dock curve is calibrated against, so it has to be
// changed in step with that class. The visible overlap is smaller than the class
// suggests, since a resting avatar is SIZE_REST rather than the full box: 48
// against a 36px step leaves the circles 12px into each other.
const STACK_STEP = 36;
// The glide starts early in the review row's own fade (which runs 0.2s–1.1s),
// not after it. Waiting for the fade to finish read as a pause with nothing
// happening in it; overlapping this far means the row is unpacking itself
// while it is still arriving.
const ENTRANCE_DELAY = 0.35;
const ENTRANCE_STAGGER = 0.1;
const ANCHOR = reviewers.length - 1;

// macOS Dock magnification. Every avatar reads its own distance to the cursor
// and maps it onto a bell curve, so the one under the pointer peaks, its
// neighbours swell a little less, and the far ones stay at rest. The middle
// stops at ±STACK_STEP are what make it a curve instead of a triangle.
const AVATAR = 56; // the rendered box; scale is expressed against it
// A resting avatar sits inside the box rather than filling it, which is also
// what opens the row up: the boxes stay STACK_STEP apart, so shrinking the
// circle takes the same amount straight off the overlap. The swell keeps its
// +8/+24 reach, so the magnification feels the same as before.
const SIZE_REST = 48;
const SIZE_NEIGHBOUR = 56;
const SIZE_PEAK = 72;
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

// Roughly critically damped: no wobble, but heavy enough that the wave eases
// in rather than snapping to its peak the moment the pointer lands.
const DOCK_SPRING = { mass: 0.55, stiffness: 170, damping: 20 } as const;

// How far the avatar under the cursor is lifted above its resting rank, and how
// far from it that lift has faded to nothing. Two steps is wide enough to cover
// the pair the wave actually swells and narrow enough to leave the rest of the
// row in its resting order. A lifted rank tops out at TOP_Z + the row's length,
// which stays well under the quote panel's 20.
const TOP_Z = 10;
const Z_REACH = 2 * STACK_STEP;

const QUOTE_WIDTH = 400;

// Keyed by avatar position, which is the order of REVIEWS itself.
const tooltips: Record<number, { quote: string; name: string }> = Object.fromEntries(
  REVIEWS.map((review, i) => [i, { quote: review.quote, name: review.name }]),
);

function DockAvatar({
  img,
  index,
  mouseX,
  reduce,
  onActivate,
  onDeactivate,
  onToggle,
  isActive,
  onSettled,
}: {
  img: StaticImageData;
  index: number;
  mouseX: MotionValue<number>;
  reduce: boolean | null;
  onActivate: () => void;
  onDeactivate: () => void;
  onToggle: () => void;
  isActive: boolean;
  onSettled?: () => void;
}) {
  // Measured on the outer element, which the dock never displaces. Measuring
  // the moving element instead would feed its own offset back into the
  // distance and make the row oscillate.
  const ref = useRef<HTMLButtonElement>(null);

  const centreDistance = useTransform(mouseX, (x: number) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return REACH;
    return x - (bounds.x + bounds.width / 2);
  });

  const scale = useSpring(useTransform(centreDistance, CURVE, SCALES), DOCK_SPRING);
  const nudge = useSpring(useTransform(centreDistance, CURVE, NUDGES), DOCK_SPRING);
  const lift = useSpring(useTransform(centreDistance, CURVE, LIFTS), DOCK_SPRING);

  // Stacking follows the same distance the size does, so an avatar rises
  // through the pile as it grows. Keying it to the active index instead made it
  // jump the whole stack in one frame, while its scale was still on the way up.
  // Neighbours swap rank at the midpoint between them, where they are the same
  // size and the swap does not read.
  //
  // The lift is added on top of the resting order rather than replacing it. A
  // bare distance ranking is symmetric around the cursor, while at rest the row
  // reads right-over-left (every avatar sits at the same rank, so DOM order
  // decides). The two only agreed with the pointer at the right-hand end: on the
  // first avatar all three pairs inverted at once, flipping overlaps between
  // avatars the pointer was nowhere near. Seeding with `index` keeps that
  // resting order, and the lift dies out within Z_REACH so only the avatars
  // actually under the wave are re-ranked.
  const zIndex = useTransform(centreDistance, (d) => {
    const lift = Math.round(TOP_Z * (1 - Math.abs(d) / Z_REACH));
    return index + 1 + Math.max(0, lift);
  });

  const tooltip = tooltips[index];

  return (
    <m.button
      ref={ref}
      type="button"
      // Focus ring lives on the scaled avatar below, not here: this button's
      // own box stays at 56px while the dock magnification grows the avatar
      // past it, so an outline on the button gets swallowed by the now-larger
      // photo and only its uncovered sliver shows.
      className="group relative cursor-pointer rounded-full outline-none"
      style={reduce ? { zIndex: index } : { zIndex }}
      // No onMouseEnter: which avatar is active is derived from the cursor in
      // the row below, the same value the magnification reads. Hit-testing the
      // 56px boxes disagreed with it, because they overlap by 20px while the
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
      // A real button, not a div wearing role="button". It used to announce
      // itself as a button and then do nothing on Enter — the quote was
      // pointer-only. Now the key does what the hover does, and the panel is
      // what aria-expanded refers to.
      onClick={onToggle}
      aria-expanded={isActive}
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
          className={`w-[56px] h-[56px] rounded-full overflow-hidden transition-shadow duration-200 group-focus-visible:shadow-[0_0_0_2px_var(--color-accent)] ${
            isActive
              ? "shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
              : "shadow-[0_0_0_1px_rgba(255,255,255,0.5)]"
          }`}
          style={reduce ? undefined : { scale, y: lift }}
        >
          {/* w-full h-full, not the width/height attributes alone: the reset
              gives images `height: auto`, which overrides the attribute and
              lets a non-square source keep its own ratio. One reviewer's photo
              is 64x77, so it rendered 56x67 inside a 56px circle — 11px of it
              cropped off the bottom while the other four sat centred, and that
              face hung higher in the row than its neighbours. Filling the box
              hands the crop to object-cover, where it belongs. */}
          <Image
            src={img}
            alt={tooltip?.name ?? `Reviewer ${index + 1}`}
            width={56}
            height={56}
            className="object-cover w-full h-full"
          />
        </m.div>
      </m.div>
    </m.button>
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
          className="flex -space-x-5"
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
              reduce={reduce}
              onActivate={() => setActiveIndex(i)}
              onDeactivate={() => setActiveIndex(null)}
              // Click/Enter on the avatar that is already showing puts the quote
              // away again, so the keyboard can close what it opened.
              onToggle={() => setActiveIndex((prev) => (prev === i ? null : i))}
              isActive={activeIndex === i}
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
              // The fade is safe again now the row shares one panel: there is
              // never a second quote to cross over during the change.
              initial={{ opacity: 0, y: 8, x: activeIndex * STACK_STEP }}
              animate={{ opacity: 1, y: 0, x: activeIndex * STACK_STEP }}
              exit={{ opacity: 0, y: 8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 26,
                opacity: { duration: 0.22, ease: "easeOut" },
              }}
            >
              <div
                style={{
                  padding: "20px",
                  borderRadius: 16,
                  border: "1px solid #111",
                  background: "rgba(0, 0, 0, 0.85)",
                  boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.22)",
                  backdropFilter: "blur(2px)",
                }}
              >
                {/* Keyed on the index, so crossing from one avatar to the next
                    remounts the text and eases it in instead of swapping the
                    words mid-glide. */}
                <m.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4,
                  }}
                >
                  <span className="font-sans text-[15px] leading-[24px] text-white/90">
                    {active.quote}
                  </span>
                  <div className="flex" style={{ gap: 4, marginTop: 10 }}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <StarIcon key={s} size={16} />
                    ))}
                  </div>
                  <span className="font-sans text-[15px] text-white/50">
                    {active.name}
                  </span>
                </m.div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text Container */}
      <span className="font-sans font-normal text-[15px] leading-none whitespace-nowrap text-hero-ink/85">
        <span className="font-normal">{REVIEW_SUMMARY.rating}</span>/{REVIEW_SUMMARY.outOf}{" "}
        <span className="opacity-50">-</span> {REVIEW_SUMMARY.count} reviews
      </span>
    </div>
  );
}
