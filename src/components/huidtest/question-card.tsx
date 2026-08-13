"use client";

import { useRef } from "react";
import type { Question, QuestionKey } from "@/lib/huidtest/config";
import { CtaArrow } from "@/components/ui/cta-arrow";
import { CheckField } from "@/components/huidtest/check-field";
import { CtaButton } from "@/components/huidtest/cta";
import { StepCard } from "@/components/huidtest/step-card";
import { StickyActions } from "@/components/huidtest/sticky-actions";

/**
 * One question, one screen.
 *
 * A radiogroup rather than a row of buttons: the options are one choice out of
 * several, and a screen reader should say so — "2 van 4" — instead of reading
 * four unrelated buttons. It also sets the keyboard contract, which this
 * component then has to keep: arrows move within the group, Tab leaves it.
 */
export default function QuestionCard<K extends QuestionKey>({
  question,
  headingRef,
  selected,
  onSelect,
  checkboxChecked,
  onCheckboxChange,
  onNext,
  onBack,
}: {
  question: Question<K>;
  /** Focus lands here on every step change, so the question is what gets read. */
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  selected?: string;
  onSelect: (id: string) => void;
  checkboxChecked?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  /** Confirms the answer. Every question has one; nothing advances by itself. */
  onNext?: () => void;
  /**
   * One question back. Absent on the first, where there is nothing behind it.
   * Only drawn below sm: from there up the same move is a text link above the
   * question, which is where a mouse expects it.
   */
  onBack?: () => void;
}) {
  const headingId = `huidtest-vraag-${question.key}`;
  const hulpId = question.hulptekst ? `${headingId}-hulp` : undefined;
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleArrows = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const back = event.key === "ArrowUp" || event.key === "ArrowLeft";
    if (!forward && !back) return;

    event.preventDefault();

    const count = question.options.length;
    const next = (index + (forward ? 1 : -1) + count) % count;

    // Selecting also moves focus, because the roving tabindex has just moved
    // with it — leaving focus behind would strand the visitor on an element
    // that is no longer the group's tab stop.
    onSelect(question.options[next].id as string);
    optionRefs.current[next]?.focus();
  };

  return (
    <div className="flex flex-1 flex-col">
      <StepCard>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-ink-strong text-[clamp(24px,5vw,34px)] font-medium leading-tight tracking-[-0.01em] outline-none"
      >
        {question.vraag}
      </h2>

      {question.hulptekst && (
        <p id={hulpId} className="mt-2 font-sans text-[15px] leading-[24px] text-muted">
          {question.hulptekst}
        </p>
      )}

      <div
        role="radiogroup"
        aria-labelledby={headingId}
        aria-describedby={hulpId}
        className="mt-7 flex flex-col gap-3"
      >
        {question.options.map((option, index) => {
          const isSelected = selected === option.id;

          return (
            <button
              key={option.id}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              // One tab stop for the whole group — the selected option, or the
              // first one before anything is chosen. Four stops per question
              // would turn a five-question quiz into a twenty-press slog.
              tabIndex={isSelected || (!selected && index === 0) ? 0 : -1}
              onClick={() => onSelect(option.id as string)}
              onKeyDown={(event) => handleArrows(event, index)}
              className={`flex min-h-[56px] w-full cursor-pointer items-center gap-3 rounded-[12px] border px-5 py-3 text-left font-sans text-[15px] leading-[24px] tracking-[-0.01em] transition-colors duration-150 ${
                isSelected
                  ? "border-accent bg-white text-ink-strong"
                  : "border-line bg-white/60 text-ink-strong hover:border-[#312019] hover:bg-white"
              }`}
            >
              <span className="flex-1">{option.label}</span>

              {/* The mark holds its space whether or not it is drawn, so
                  choosing an answer does not reflow the label it sits beside. */}
              <span
                aria-hidden="true"
                className={`flex size-5 shrink-0 items-center justify-center rounded-full transition-all duration-150 ${
                  isSelected ? "bg-accent opacity-100 scale-100" : "opacity-0 scale-75"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6.2l2.2 2.2 4.8-4.8"
                    stroke="var(--color-surface-page)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      {question.checkbox && (
        <div className="mt-5">
          <CheckField
            checked={checkboxChecked ?? false}
            onChange={(checked) => onCheckboxChange?.(checked)}
          >
            {question.checkbox.label}
          </CheckField>
        </div>
      )}

      </StepCard>

      {/* Takes up whatever is left, which is what pins the bar below to the
          bottom edge on a short question instead of letting it ride up under
          the last option. */}
      <div className="flex-1" />

      {/* Every question is confirmed rather than sprung: the answer takes a
          mark, and the way on arrives under it. Choosing used to advance by
          itself, which read as the screen deciding it had heard enough. */}
      <StickyActions className="mt-7 shrink-0" visible={Boolean(selected)}>
        <div className="flex items-center gap-3">
          {/* Thumb-height, thumb-width, and beside the button it undoes rather
              than at the top of a sheet. The site's own arrow, turned around,
              so back and forward are visibly the same gesture in reverse. */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Terug naar de vorige vraag"
              className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-ink-strong transition-colors duration-150 hover:border-[#312019] sm:hidden"
            >
              <span className="rotate-180">
                <CtaArrow always />
              </span>
            </button>
          )}

          <CtaButton className="flex-1 sm:flex-none sm:w-auto" onClick={onNext}>
            Volgende
          </CtaButton>
        </div>
      </StickyActions>
    </div>
  );
}
