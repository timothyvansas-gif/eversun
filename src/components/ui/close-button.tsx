import { forwardRef } from "react";

const SIZES = {
  sm: "w-8 h-8 text-[22px]",
  md: "w-9 h-9 text-[24px]",
} as const;

const VARIANTS = {
  // For a light/white surface. The × is fully present at rest; on hover its
  // border resolves to the same ink colour instead of introducing a second
  // warm line colour.
  light: "text-ink border-ink-primary/25 hover:border-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900",
  // For a dark surface (#0B0B0B and similar), with the same resting/hover
  // relationship in the light nav palette.
  dark: "text-nav-ink border-nav-ink/30 hover:border-nav-ink",
} as const;

type CloseButtonProps = {
  onClick: () => void;
  /** Accessible label. Defaults to "Sluiten". */
  label?: string;
  /** Visual size. "md" (default) for overlays, "sm" for compact popovers. */
  size?: keyof typeof SIZES;
  /** Which surface it sits on. "light" (default) for white/cream cards, "dark" for near-black ones. */
  variant?: keyof typeof VARIANTS;
  /** Positioning / layout classes supplied by the consumer (e.g. "absolute top-4 right-4"). */
  className?: string;
};

/**
 * Shared "×" close control. Logic-less: positioning is the consumer's job,
 * passed via className. Keeps every dismissable surface visually and
 * behaviourally consistent (hover, focus ring, transition).
 */
export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton({ onClick, label = "Sluiten", size = "md", variant = "light", className = "" }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex items-center justify-center rounded-full border leading-none transition-colors duration-150 cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      >
        {/* The "×" glyph sits ~0.05em below the centre of its text box, which
            shows as soon as the hover ring makes the circle visible. Nudged back
            optically; in em, so it holds at every size. */}
        <span aria-hidden="true" className="-translate-y-[0.05em]">
          ×
        </span>
      </button>
    );
  },
);
