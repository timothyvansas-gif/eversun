"use client";

import dynamic from "next/dynamic";
import { m } from "framer-motion";
import { useState } from "react";

const BLOB_SIZE = 560;

// Nobody sees the quiz until they ask for it, so it stays out of the hero's
// bundle until the button is pressed.
const HuidtestOverlay = dynamic(() => import("@/components/huidtest/huidtest-overlay"));

export default function HeroButtons({ onOpenAfspraak, onOpenPlanJeMoment }: { onOpenAfspraak: () => void; onOpenPlanJeMoment: () => void }) {
  const [huidtestOpen, setHuidtestOpen] = useState(false);
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
      {/* Width is content-driven from sm up. Mobile fills the column instead:
          two stacked CTAs of different widths read as two different kinds of
          thing, and these are a pair. */}
      <button
        className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-accent px-0 sm:w-auto sm:px-10 lg:px-12 min-h-[48px] sm:min-h-[56px] lg:min-h-[56px] font-sans font-medium text-[14px] md:text-[16px] text-white cursor-pointer active:scale-[0.98] transition-transform duration-200"
        onMouseEnter={(event) => {
          if (!window.matchMedia("(hover: hover)").matches) return;
          const rect = event.currentTarget.getBoundingClientRect();
          setOrigin({ x: event.clientX - rect.left, y: event.clientY - rect.top });
          setPrimaryHovered(true);
        }}
        onMouseLeave={() => setPrimaryHovered(false)}
        onClick={() => {
          if (window.innerWidth < 768) {
            onOpenPlanJeMoment();
          } else {
            onOpenAfspraak();
          }
        }}
      >
        <m.span
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            width: BLOB_SIZE,
            height: BLOB_SIZE,
            left: origin.x - BLOB_SIZE / 2,
            top: origin.y - BLOB_SIZE / 2,
          }}
          initial={false}
          animate={{ scale: primaryHovered ? 1 : 0, opacity: primaryHovered ? 1 : 0 }}
          transition={{ duration: 0.75, ease: [0.25, 1, 0.35, 1] }}
        />
        {/* The label darkens as the blob arrives under it, since white on white
            is nothing at all. Driven off the same state as the blob rather than
            a CSS :hover, because that state is already gated on a real pointer —
            a tap must not leave the label dark on orange.

            The two directions are not symmetric. Coming in, the blob's ease
            covers the centre of the button within about a tenth of a second, so
            the colour follows almost immediately; the moment before it lands is
            dark text on orange, which reads better than the white it replaces.
            Going out is the one that can break: the blob holds its white for a
            beat while it shrinks, and a label that turned white with it would
            disappear into it. So the way back waits for the fade. */}
        <m.span
          className="relative z-10"
          initial={false}
          animate={{ color: primaryHovered ? "#0b0b0b" : "#ffffff" }}
          transition={{ duration: 0.2, delay: primaryHovered ? 0.05 : 0.22 }}
        >
          Plan je moment
        </m.span>
      </button>

      {/* The second way in, beside booking rather than under it: someone who
          would book but does not know which bed is theirs. No fill, ever —
          only the border opacity changes on hover. Full width on mobile like
          the button above it, content-width from sm up. */}
      <button
        className="flex w-full sm:w-auto justify-center items-center rounded-full sm:px-10 min-h-[48px] sm:min-h-[56px] font-sans font-medium text-[14px] md:text-[16px] text-white cursor-pointer border border-white/30 hover:border-white active:scale-[0.98] transition-[transform,border-color] duration-200"
        onClick={() => setHuidtestOpen(true)}
      >
        <span>Doe de huidtest</span>
      </button>

      <HuidtestOverlay
        isOpen={huidtestOpen}
        onClose={() => setHuidtestOpen(false)}
        entry="hero_link"
      />
    </div>
  );
}
