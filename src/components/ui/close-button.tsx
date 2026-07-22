import { forwardRef } from "react";

const SIZES = {
  sm: "w-8 h-8 text-[22px]",
  md: "w-9 h-9 text-[24px]",
} as const;

type CloseButtonProps = {
  onClick: () => void;
  /** Accessible label. Defaults to "Sluiten". */
  label?: string;
  /** Visual size. "md" (default) for overlays, "sm" for compact popovers. */
  size?: keyof typeof SIZES;
  /** Positioning / layout classes supplied by the consumer (e.g. "absolute top-4 right-4"). */
  className?: string;
};

/**
 * Shared "×" close control. Logic-less: positioning is the consumer's job,
 * passed via className. Keeps every dismissable surface visually and
 * behaviourally consistent (hover, focus ring, transition).
 */
export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton({ onClick, label = "Sluiten", size = "md", className = "" }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex items-center justify-center rounded-full border border-transparent leading-none text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:border-[#d5be9c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors duration-150 cursor-pointer ${SIZES[size]} ${className}`}
      >
        ×
      </button>
    );
  },
);
