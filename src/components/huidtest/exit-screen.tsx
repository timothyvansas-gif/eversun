"use client";

import Link from "next/link";
import { EXIT_MINOR, EXIT_ROSSIG, EXIT_TYPE1, TELEFOON } from "@/lib/huidtest/config";
import type { ExitReason } from "@/lib/huidtest/types";
import { ctaClass, CtaButton, CTA_TRANSITION } from "@/components/huidtest/cta";
import { StepCard } from "@/components/huidtest/step-card";

/**
 * The ways the test ends without advice: too young, a skin that always burns,
 * or naturally red/auburn hair.
 *
 * None is a failure state or styled like one — no warning colours, no apology.
 * One is the law and the others are reasons to come in and be looked at
 * properly, so all get the same calm treatment as the result.
 */
export default function ExitScreen({
  reason,
  headingRef,
  onClose,
}: {
  reason: ExitReason;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  /**
   * "Terug naar de site" means two different things depending on where the quiz
   * is: closing the panel, or leaving the route. Passing the closer in is what
   * lets one screen do both without knowing which it is in.
   */
  onClose?: () => void;
}) {
  const personalCopy = reason === "rossig" ? EXIT_ROSSIG : EXIT_TYPE1;
  const copy = reason === "minor" ? EXIT_MINOR : personalCopy;
  const terugLabel = reason === "minor" ? EXIT_MINOR.cta : personalCopy.ctaSecundair;

  // Filled when it is the only way on (the minor exit), outline when it stands
  // beside the WhatsApp button — one primary per screen, either way.
  const terugVariant = reason === "minor" ? "accent" : "outline";

  return (
    <StepCard>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-ink-strong text-[clamp(24px,4.5vw,32px)] font-medium leading-tight tracking-[-0.01em] outline-none"
      >
        {copy.kop}
      </h2>

      <p className="mt-3 max-w-[54ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
        {copy.body}
      </p>

      {reason !== "minor" && (
        <p className="mt-4 max-w-[54ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
          {personalCopy.telefoonVoor}
          <a
            href={TELEFOON.href}
            className="whitespace-nowrap text-ink-strong underline decoration-line underline-offset-4 transition-colors duration-150 hover:decoration-ink-strong"
          >
            {TELEFOON.weergave}
          </a>
          {personalCopy.telefoonNa}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {onClose ? (
          <CtaButton variant={terugVariant} onClick={onClose}>
            {terugLabel}
          </CtaButton>
        ) : (
          <Link href="/" className={ctaClass(terugVariant)} style={CTA_TRANSITION}>
            {terugLabel}
          </Link>
        )}
      </div>
    </StepCard>
  );
}
