"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { BTN_PILL_ACCENT } from "@/lib/button-styles";
import { CtaArrow } from "@/components/ui/cta-arrow";
import { TEASER } from "@/lib/huidtest/config";

const HuidtestOverlay = dynamic(() => import("@/components/huidtest/huidtest-overlay"));

/**
 * The homepage's way into the huidtest, between the banks and the products —
 * where the question it answers actually comes up. Someone has just read four
 * bank descriptions and is wondering which one is theirs.
 *
 * It opens the panel rather than linking to the route: the four beds they were
 * comparing stay on screen behind it. On a phone the same panel arrives as a
 * bottom sheet, which is also the only way in there — the hero's second button
 * is desktop-only.
 */
export default function HuidtestTeaser() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section aria-labelledby="huidtest-teaser" className="w-full bg-white py-14 xl:py-20">
      <div
        className="w-full flex flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="flex flex-col gap-5 rounded-[12px] border border-line/70 bg-surface-page px-6 py-8 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-10">
            <div className="max-w-[62ch]">
              <h2
                id="huidtest-teaser"
                className="font-display text-[clamp(24px,3vw,34px)] font-medium leading-tight tracking-[-0.01em] text-ink-strong"
              >
                {TEASER.kop}
              </h2>
              <p className="mt-3 font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
                {TEASER.body}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={`${BTN_PILL_ACCENT} min-h-[48px] shrink-0 justify-center py-3 md:!px-[28px]`}
            >
              {TEASER.cta}
              <CtaArrow />
            </button>
          </div>
        </div>
      </div>

      <HuidtestOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} entry="home_sectie" />
    </section>
  );
}
