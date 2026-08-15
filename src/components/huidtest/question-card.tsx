"use client";

import { useLayoutEffect, useRef } from "react";
import type { Question, QuestionKey } from "@/lib/huidtest/config";
import { CheckField } from "@/components/huidtest/check-field";
import { StepCard } from "@/components/huidtest/step-card";

/**
 * One question, one screen.
 *
 * A radiogroup rather than a row of buttons: the options are one choice out of
 * several, and a screen reader should say so — "2 van 4" — instead of reading
 * four unrelated buttons. It also sets the keyboard contract, which this
 * component then has to keep: arrows move within the group, Tab leaves it.
 *
 * The card is all there is here. The button that confirms an answer belongs to
 * the surface rather than to the question — see the action bar in the quiz
 * shell — so it can stay still while the questions move past it.
 */
export default function QuestionCard<K extends QuestionKey>({
  question,
  headingRef,
  selected,
  onSelect,
  checkboxChecked,
  onCheckboxChange,
  onHeightChange,
}: {
  question: Question<K>;
  /** Focus lands here on every step change, so the question is what gets read. */
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  selected?: string;
  onSelect: (id: string) => void;
  checkboxChecked?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  /** Reports the rendered card size to the desktop transition stage. */
  onHeightChange?: (height: number) => void;
}) {
  const headingId = `huidtest-vraag-${question.key}`;
  const hulpId = question.hulptekst ? `${headingId}-hulp` : undefined;
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card || !onHeightChange) return;

    const report = () => onHeightChange(Math.ceil(card.getBoundingClientRect().height));
    report();

    const observer = new ResizeObserver(report);
    observer.observe(card);
    return () => observer.disconnect();
  }, [onHeightChange, question.key]);

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
    <StepCard ref={cardRef}>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-ink-primary text-[clamp(24px,5vw,34px)] font-medium leading-tight tracking-[-0.01em] outline-none"
      >
        {question.vraag}
      </h2>

      {question.hulptekst && (
        <p id={hulpId} className="mt-2 font-sans text-[15px] leading-[24px] text-zinc-600">
          {question.hulptekst}
        </p>
      )}

      <div
        role="radiogroup"
        aria-labelledby={headingId}
        aria-describedby={hulpId}
        className="mt-5 flex flex-col gap-3"
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
              // would turn a six-question quiz into a twenty-four-press slog.
              tabIndex={isSelected || (!selected && index === 0) ? 0 : -1}
              onClick={() => onSelect(option.id as string)}
              onKeyDown={(event) => handleArrows(event, index)}
              className={`relative flex min-h-[56px] w-full cursor-pointer items-center rounded-[12px] border px-5 pr-8 py-3 text-left font-sans text-[15px] leading-[24px] tracking-[-0.01em] transition-colors duration-150 ${
                isSelected
                  ? "border-accent bg-white text-ink-strong"
                  : "border-ink-primary/20 bg-white/60 text-ink-strong hover:border-ink-primary hover:bg-white"
              }`}
            >
              <span className="flex-1">{option.label}</span>

              {/* The mark is removed from the flex flow so it does not steal
                  width from long answer labels on narrow screens. */}
              <span
                aria-hidden="true"
                className={`absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full transition-[opacity,transform] duration-150 ${
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
  );
}
