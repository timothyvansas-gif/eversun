"use client";

import dynamic from "next/dynamic";

import { CtaLabel } from "@/components/ui/cta-arrow";
import { useState } from "react";

// Nobody sees the quiz until they ask for it, so it stays out of the hero's
// bundle until the button is pressed.
const HuidtestOverlay = dynamic(() => import("@/components/huidtest/huidtest-overlay"));

export default function HeroButtons({ onOpenAfspraak, onOpenPlanJeMoment }: { onOpenAfspraak: () => void; onOpenPlanJeMoment: () => void }) {
  const [huidtestOpen, setHuidtestOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
      {/* Width is content-driven from sm up, with a 260px floor from lg. The
          floor does two things at once: it gives the pair a little more presence
          on a wide screen, and because both buttons carry the same one
          they come out the same width — their labels differ by six pixels, so
          without it they read as very slightly mismatched rather than as a
          deliberate pair. Mobile fills the column instead, for the same
          reason. */}
      {/* Hover moves nothing but the arrow. This button used to fill white on
          hover, where the rest filled dark — it sits on a photograph and the
          dark fill sank into it — and both fills are now gone, so the CTAs no
          longer need a per-surface hover colour at all. */}
      <button
        className="group/cta flex w-full items-center justify-center rounded-full bg-cta px-0 sm:w-auto sm:px-10 lg:min-w-[210px] lg:px-12 min-h-[48px] sm:min-h-[56px] lg:min-h-[56px] font-sans font-medium text-[14px] md:text-[16px] text-white cursor-pointer active:scale-[0.98] transition-transform duration-200"
        onClick={() => {
          if (window.innerWidth < 768) {
            onOpenPlanJeMoment();
          } else {
            onOpenAfspraak();
          }
        }}
      >
        <CtaLabel hold>Plan je moment</CtaLabel>
      </button>

      {/* The second way in, beside booking rather than under it: someone who
          would book but does not know which bed is theirs. No fill, ever —
          only the border opacity changes on hover. Full width on mobile like
          the button above it, content-width from sm up. */}
      <button
        className="group/cta flex w-full sm:w-auto justify-center items-center rounded-full sm:px-10 lg:min-w-[210px] min-h-[48px] sm:min-h-[56px] font-sans font-medium text-[14px] md:text-[16px] text-white cursor-pointer border border-white/30 hover:border-white active:scale-[0.98] transition-[transform,border-color] duration-200"
        onClick={() => setHuidtestOpen(true)}
      >
        <CtaLabel hold>Doe de huidtest</CtaLabel>
      </button>

      <HuidtestOverlay
        isOpen={huidtestOpen}
        onClose={() => setHuidtestOpen(false)}
        entry="hero_link"
      />
    </div>
  );
}
