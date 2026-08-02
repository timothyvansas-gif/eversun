"use client";

import { CtaArrow } from "@/components/ui/cta-arrow";

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
        className="group/cta w-[172px] px-0 sm:w-auto sm:px-10 min-h-[48px] sm:min-h-[56px] lg:min-h-[48px] font-sans font-medium text-[14px] md:text-[16px] text-surface-page cursor-pointer active:scale-[0.98] transition-transform duration-200"
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
          background: "#f35b04",
        }}
      >
        <span>Plan je moment</span>
        {/* currentColor, so the arrow takes the label's colour and the orange
            fill stays put throughout. */}
        <CtaArrow />
      </button>
    </div>
  );
}
