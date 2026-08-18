"use client";

import { BTN_FILL_LABEL, BTN_OUTLINE_BORDER } from "@/lib/button-styles";
import { useHoverBlob } from "@/components/ui/hover-blob";

/**
 * The huidtest's two buttons.
 *
 * They are close cousins of the site's pills but not the same animal, so they
 * live here rather than bending the shared constants: inside the test a button
 * is an answer, and the filled one fills dark from the cursor on hover — the
 * same fill the section CTAs use, so a button does not change species when the
 * test opens over the page.
 *
 * The transition is an inline style on purpose. Two `transition-property`
 * utilities on one element resolve by stylesheet order rather than by intent,
 * and this button needs both the press-scale and the colour.
 */

const BASE =
  "relative overflow-hidden inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full px-[28px] py-3 font-sans text-[15px] font-medium tracking-[-0.01em] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100";

const VARIANTS = {
  // No `hover:bg-void` here any more: it repainted the pill on the first frame
  // and left the fill nothing to arrive over.
  accent: "group/cta bg-brand text-ink-primary",
  // No fill at all, like the outline pills elsewhere on the site: the edge is
  // the button. Its whole hover is that edge darkening, which is why the
  // transition below carries border-color.
  outline: BTN_OUTLINE_BORDER,
} as const;

// Opacity is on this list because the way on spends most of its life waiting.
// It is the one property the disabled state changes, and left off the list it
// was the one property that snapped: swiping back to an answered question lit
// the button in a single frame while its colours were still easing.
const TRANSITION =
  "transform 150ms ease, background-color 150ms ease, border-color 150ms ease, opacity 150ms ease";

export function ctaClass(variant: keyof typeof VARIANTS, extra = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`;
}

export const CTA_TRANSITION: React.CSSProperties = { transition: TRANSITION };

/**
 * Only the filled variant fills. The outline one has no background to arrive
 * over — its whole hover is the edge darkening — so it renders nothing extra
 * and keeps its children exactly where they were.
 */
export function CtaButton({
  variant = "accent",
  className = "",
  children,
  ...props
}: {
  variant?: keyof typeof VARIANTS;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const blob = useHoverBlob({ disabled: props.disabled });
  const filled = variant === "accent";

  return (
    <button
      type="button"
      className={ctaClass(variant, className)}
      style={CTA_TRANSITION}
      {...(filled ? blob.hoverProps : {})}
      {...props}
    >
      {filled ? (
        <>
          {blob.blob}
          <span className={`${BTN_FILL_LABEL} inline-flex items-center gap-2 group-hover/cta:text-surface-page`}>
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function CtaLink({
  variant = "accent",
  className = "",
  children,
  ...props
}: {
  variant?: keyof typeof VARIANTS;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const blob = useHoverBlob();
  const filled = variant === "accent";

  return (
    <a
      className={ctaClass(variant, className)}
      style={CTA_TRANSITION}
      {...(filled ? blob.hoverProps : {})}
      {...props}
    >
      {filled ? (
        <>
          {blob.blob}
          {/* The gap comes along: these links carry an icon beside their label,
              and the spacing that used to sit on the anchor now has to sit on
              the row that actually holds the two of them. */}
          <span className={`${BTN_FILL_LABEL} inline-flex items-center gap-2 group-hover/cta:text-surface-page`}>
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </a>
  );
}
