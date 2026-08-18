"use client";

import { OUTLINE_BORDER_COLOR } from "@/lib/button-styles";

/**
 * A checkbox drawn the same way a chosen answer is: an ink square with a
 * quiet white mark.
 *
 * The native control could not get there. `accent-color` paints the browser's
 * own tick, which is heavier than the one on the option cards and square at the
 * corners, so the two checked states in the test read as belonging to different
 * products. The real input stays, visually hidden and doing all the work —
 * focus, keyboard, the label association — with the span beside it as the
 * picture of its state.
 */
export function CheckField({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="group flex min-h-[44px] w-fit cursor-pointer items-start gap-2 font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        // 2px down: the box is 20px against a 24px line, so centring it on the
        // line rather than on the whole label is what makes it look aligned
        // once the text wraps.
        className={`mt-[2px] flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors duration-150 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
          checked
            ? "border-ink-primary bg-ink-primary text-white"
            : `${OUTLINE_BORDER_COLOR} bg-white/60 group-hover:border-ink-primary`
        }`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-opacity duration-150 ${checked ? "opacity-100" : "opacity-0"}`}
        >
          <path
            d="M2.5 6.2l2.2 2.2 4.8-4.8"
            // Follows the box's own text colour, so the tick is set in one
            // place with the fill it sits on rather than in the path itself.
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {children}
    </label>
  );
}
