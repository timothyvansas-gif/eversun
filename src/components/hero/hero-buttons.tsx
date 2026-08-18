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
    // The extra bottom margin is mobile-only: the status row sits right under
    // this one there with nothing of its own above it, and the pair read as
    // crowded without a beat between them. From sm the reviews dock sits beside
    // the buttons instead and the row already has room.
    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto mb-4 sm:mb-0">
      {/* Side by side even on mobile now, the way the zonnebank cards split
          their pair: the fill grows to take the row, the outline takes only
          what its label needs. Content-driven from sm up, with a 210px floor
          from lg — the floor is what keeps the two the same width there, since
          their labels differ by a few pixels and without it they'd read as
          very slightly mismatched rather than as a deliberate pair. */}
      {/* Hover moves nothing but the arrow. This button used to fill white on
          hover, where the rest filled dark — it sits on a photograph and the
          dark fill sank into it — and both fills are now gone, so the CTAs no
          longer need a per-surface hover colour at all. */}
      <button
        className="group/cta flex flex-1 items-center justify-center rounded-full bg-cta px-0 sm:w-auto sm:flex-none sm:px-10 lg:min-w-[210px] lg:px-12 min-h-[48px] sm:min-h-[56px] lg:min-h-[56px] font-sans font-medium text-[14px] md:text-[16px] text-white cursor-pointer active:scale-[0.98] transition-transform duration-200"
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
          only the border opacity changes on hover. Sized to its own label
          rather than sharing the row's growth, on mobile same as from sm up. */}
      <button
        className="group/cta flex flex-none justify-center items-center rounded-full px-8 sm:w-auto sm:px-10 lg:min-w-[210px] min-h-[48px] sm:min-h-[56px] font-sans font-medium text-[14px] md:text-[16px] text-white cursor-pointer border border-white/30 hover:border-white active:scale-[0.98] transition-[transform,border-color] duration-200"
        onClick={() => setHuidtestOpen(true)}
      >
        {/* Short on mobile, where it now sits beside a growing neighbour
            instead of on its own full-width row and the long label was the one
            crowding "Plan je moment". Unchanged from sm, where each has room. */}
        <CtaLabel hold>
          <span className="sm:hidden">Huidtest</span>
          <span className="hidden sm:inline">Doe de huidtest</span>
        </CtaLabel>
      </button>

      <HuidtestOverlay
        isOpen={huidtestOpen}
        onClose={() => setHuidtestOpen(false)}
        entry="hero_link"
      />
    </div>
  );
}
