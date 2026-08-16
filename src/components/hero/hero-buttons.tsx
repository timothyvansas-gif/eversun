"use client";

import dynamic from "next/dynamic";
import { m } from "framer-motion";
import { useState } from "react";
import { useHoverBlob } from "@/components/ui/hover-blob";

// Nobody sees the quiz until they ask for it, so it stays out of the hero's
// bundle until the button is pressed.
const HuidtestOverlay = dynamic(() => import("@/components/huidtest/huidtest-overlay"));

export default function HeroButtons({ onOpenAfspraak, onOpenPlanJeMoment }: { onOpenAfspraak: () => void; onOpenPlanJeMoment: () => void }) {
  const [huidtestOpen, setHuidtestOpen] = useState(false);

  // The same fill every other accent button uses, in white rather than ink.
  // It was written here first and then copied outwards, which is exactly how
  // one button quietly becomes two kinds of button — so the hero reads from
  // the shared one now and only keeps what is genuinely its own: a label that
  // has to darken, because white on white is nothing at all.
  const primary = useHoverBlob({ color: "bg-white" });

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
      {/* Width is content-driven from sm up. Mobile fills the column instead:
          two stacked CTAs of different widths read as two different kinds of
          thing, and these are a pair. */}
      <button
        className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-accent px-0 sm:w-auto sm:px-10 lg:px-12 min-h-[48px] sm:min-h-[56px] lg:min-h-[56px] font-sans font-medium text-[14px] md:text-[16px] text-white cursor-pointer active:scale-[0.98] transition-transform duration-200"
        {...primary.hoverProps}
        onClick={() => {
          if (window.innerWidth < 768) {
            onOpenPlanJeMoment();
          } else {
            onOpenAfspraak();
          }
        }}
      >
        {primary.blob}
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
          animate={{ color: primary.hovered ? "#0b0b0b" : "#ffffff" }}
          transition={{ duration: 0.2, delay: primary.hovered ? 0.05 : 0.22 }}
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
