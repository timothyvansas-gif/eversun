"use client";

import Link from "next/link";
import { EXIT_MINOR, EXIT_TYPE1 } from "@/lib/huidtest/config";
import type { ExitReason } from "@/lib/huidtest/types";
import { ctaClass, CtaButton, CtaLink, CTA_TRANSITION } from "@/components/huidtest/cta";

/**
 * The two ways the test ends without advice: too young, and a skin that always
 * burns.
 *
 * Neither is a failure state and neither is styled like one — no warning
 * colours, no apology. One is the law and the other is a reason to come in and
 * be looked at properly, so both get the same calm treatment as the result.
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
  const copy = reason === "minor" ? EXIT_MINOR : EXIT_TYPE1;
  const terugLabel = reason === "minor" ? EXIT_MINOR.cta : EXIT_TYPE1.ctaSecundair;

  // Filled when it is the only way on (the minor exit), outline when it stands
  // beside the WhatsApp button — one primary per screen, either way.
  const terugVariant = reason === "minor" ? "accent" : "outline";

  return (
    <div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-ink-strong text-[clamp(24px,4.5vw,32px)] font-medium leading-tight tracking-[-0.01em] outline-none"
      >
        {copy.kop}
      </h2>

      <p className="mt-4 max-w-[54ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-ink">
        {copy.body}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {reason === "type1" && (
          <CtaLink href={EXIT_TYPE1.whatsappUrl} target="_blank" rel="noopener noreferrer">
            {EXIT_TYPE1.ctaPrimair}
          </CtaLink>
        )}

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
    </div>
  );
}
