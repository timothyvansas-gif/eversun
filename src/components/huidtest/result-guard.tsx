"use client";

import { decide } from "@/lib/huidtest/decide";
import { isComplete } from "@/lib/huidtest/flow";
import type { QuizAnswers } from "@/lib/huidtest/types";
import type { ZonnebankSlug } from "@/lib/whatsapp";
import { CtaButton } from "@/components/huidtest/cta";
import ResultScreen from "@/components/huidtest/result-screen";

/**
 * The result needs a complete answer set. Anything less means the quiz was
 * entered halfway — a stale panel, a hand-edited link, a restart that cleared
 * the answers behind a result still on the stack — and the honest response is
 * to start over rather than advise on gaps.
 *
 * Its own file rather than a branch inside `ResultScreen`, which would then be
 * deciding whether there is advice as well as presenting it.
 *
 * Nothing is reported from here. Arriving on this screen is a transition, and
 * the flow reports transitions — which is what makes the result count one
 * rather than one per render.
 */
export function ResultGuard({
  answers,
  bekekenBank,
  headingRef,
  actionsReady,
  onRestart,
}: {
  answers: Partial<QuizAnswers>;
  bekekenBank?: ZonnebankSlug;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  /** Passed straight through. Whether the advice's action bar may come up yet. */
  actionsReady: boolean;
  onRestart: () => void;
}) {
  const complete = isComplete(answers);
  const advies = complete ? decide(answers) : null;

  if (!complete || !advies) {
    return (
      <div>
        <h2
          ref={headingRef as React.RefObject<HTMLHeadingElement>}
          tabIndex={-1}
          className="font-display text-ink-primary text-[clamp(24px,4.5vw,32px)] font-medium leading-tight outline-none"
        >
          Deze test is nog niet af
        </h2>
        <CtaButton className="mt-6" onClick={onRestart}>
          Opnieuw doen
        </CtaButton>
      </div>
    );
  }

  return (
    <ResultScreen
      answers={answers}
      advies={advies}
      bekekenBank={bekekenBank}
      headingRef={headingRef}
      actionsReady={actionsReady}
      onRestart={onRestart}
    />
  );
}
