"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CtaArrow } from "@/components/ui/cta-arrow";

// Nobody sees the quiz until they ask for it, so it stays out of the hero's
// bundle until the button is pressed.
const HuidtestOverlay = dynamic(() => import("@/components/huidtest/huidtest-overlay"));

// No `gap`: CtaArrow carries its own margin and only unfolds on hover, so a
// standing gap would push the label off-centre while the arrow is collapsed.
const baseStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "9999px",
};


export default function HeroButtons({ onOpenAfspraak, onOpenPlanJeMoment }: { onOpenAfspraak: () => void; onOpenPlanJeMoment: () => void }) {
  const [huidtestOpen, setHuidtestOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
      {/* Width is content-driven from sm up so the button widens as the arrow
          unfolds, the way the outline pills do. Mobile fills the column
          instead: two stacked CTAs of different widths read as two different
          kinds of thing, and these are a pair. */}
      <button
        className="group/cta w-full px-0 sm:w-auto sm:px-10 lg:px-12 min-h-[48px] sm:min-h-[56px] lg:min-h-[56px] font-sans font-medium text-[14px] md:text-[16px] text-white cursor-pointer active:scale-[0.98] transition-transform duration-200"
        onClick={() => {
          if (window.innerWidth < 768) {
            onOpenPlanJeMoment();
          } else {
            onOpenAfspraak();
          }
        }}
        style={{
          ...baseStyle,
          transition: "transform 0.2s ease",
          background: "var(--color-accent)",
        }}
      >
        <span>Plan je moment</span>
        {/* currentColor, so the arrow takes the label's colour and the orange
            fill stays put throughout. */}
        <CtaArrow />
      </button>

      {/* The second way in, beside booking rather than under it: someone who
          would book but does not know which bed is theirs. No fill, ever —
          only the border opacity and the arrow reveal change on hover. Full
          width on mobile like the button above it, content-width from sm up. */}
      <button
        className="group/cta flex w-full sm:w-auto justify-center items-center rounded-full sm:px-10 lg:px-12 min-h-[48px] sm:min-h-[56px] font-sans font-medium text-[14px] md:text-[16px] text-white cursor-pointer border border-white/30 hover:border-white active:scale-[0.98] transition-[transform,border-color] duration-200"
        onClick={() => setHuidtestOpen(true)}
      >
        <span>Doe de huidtest</span>
        <CtaArrow />
      </button>

      <HuidtestOverlay
        isOpen={huidtestOpen}
        onClose={() => setHuidtestOpen(false)}
        entry="hero_link"
      />
    </div>
  );
}
