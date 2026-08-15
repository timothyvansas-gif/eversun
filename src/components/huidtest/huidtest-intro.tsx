"use client";

import { INTRO } from "@/lib/huidtest/config";
import { CtaButton } from "@/components/huidtest/cta";
import { StepCard } from "@/components/huidtest/step-card";

/**
 * The whole opening on one card: what the test is, the law it works under, and
 * the age gate itself. Split across the surface it read as three unrelated
 * blocks; together it is one thing to answer.
 */
export function HuidtestIntro({
  headingRef,
  onConfirm,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onConfirm: (age: "ok" | "minor") => void;
}) {
  return (
    <StepCard>
      <h2
        ref={headingRef as React.RefObject<HTMLHeadingElement>}
        tabIndex={-1}
        className="font-display text-ink-primary text-[clamp(24px,4.5vw,32px)] font-medium leading-tight tracking-[-0.01em] outline-none"
      >
        {INTRO.kop}
      </h2>

      <p className="mt-3 max-w-[54ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
        {INTRO.body}
      </p>

      {/* A rule where the card turns from telling to asking. The gate is a
          different kind of thing from the paragraph above it, and a line
          says so more quietly than white space can at this size. */}
      <h3 className="mt-6 border-t border-line/30 pt-6 font-sans text-[17px] font-semibold tracking-[-0.01em] text-ink-primary">
        {INTRO.vraag}
      </h3>

      <p className="mt-1 max-w-[54ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
        {INTRO.wettelijk}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <CtaButton onClick={() => onConfirm("ok")}>{INTRO.ja}</CtaButton>
        <CtaButton variant="outline" onClick={() => onConfirm("minor")}>
          {INTRO.nee}
        </CtaButton>
      </div>
    </StepCard>
  );
}
