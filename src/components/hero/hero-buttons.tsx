"use client";

import { CtaArrow } from "@/components/ui/cta-arrow";
import { scrollBehavior } from "@/lib/animate-scroll";

// No `gap`: CtaArrow carries its own margin and only unfolds on hover, so a
// standing gap would push the label off-centre while the arrow is collapsed.
const baseStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "9999px",
};


export default function HeroButtons({ onOpenAfspraak, onOpenPlanJeMoment }: { onOpenAfspraak: () => void; onOpenPlanJeMoment: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
      {/* Width is content-driven from sm up so the button widens as the arrow
          unfolds, the way the outline pills do. Mobile keeps its fixed width:
          there is no hover there, so there is nothing to grow into. */}
      <button
        className="group/cta w-[172px] px-0 sm:w-auto sm:px-10 min-h-[48px] sm:min-h-[56px] lg:min-h-[56px] font-sans font-medium text-[14px] md:text-[16px] text-surface-page cursor-pointer active:scale-[0.98] transition-transform duration-200"
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

      {/* Desktop-only: no fill, ever — only the border opacity and the arrow
          reveal change on hover. Layout comes from justify/items-center +
          rounded-full classes, not baseStyle — that object's display:"flex"
          would override the `hidden` class below lg (inline style always
          beats a class), showing the button on mobile too. */}
      <button
        className="group/cta hidden lg:flex justify-center items-center rounded-full px-10 min-h-[56px] font-sans font-medium text-[16px] text-white cursor-pointer border border-white/30 hover:border-white active:scale-[0.98] transition-[transform,border-color] duration-200"
        onClick={() => {
          document.getElementById("waarom")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
        }}
      >
        <span>Ontdek</span>
        <CtaArrow />
      </button>
    </div>
  );
}
