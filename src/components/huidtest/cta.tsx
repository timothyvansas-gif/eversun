"use client";

import { CtaLabel } from "@/components/ui/cta-arrow";

/**
 * The huidtest's two buttons.
 *
 * They are close cousins of the site's pills but not the same animal, so they
 * live here rather than bending the shared constants.
 *
 * The transition is an inline style on purpose. Two `transition-property`
 * utilities on one element resolve by stylesheet order rather than by intent,
 * and this button needs both the press-scale and the colour.
 */

const BASE =
  // 36px, not the original 28px: with `hold` the arrow's 24px reach only had
  // 4px of clearance before the pill's own curve started cutting into it,
  // which read as cramped on hover. Equal on both sides, so it stays
  // symmetric at rest.
  "group/cta inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full px-9 py-3 font-sans text-[15px] font-medium tracking-[-0.01em] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100";

const VARIANTS = {
  // Orange stays orange; the arrow is the whole hover, same as BTN_PILL_CTA
  // everywhere it carries `group/cta` and a `CtaLabel`.
  accent: "bg-cta text-white",
  // No fill at all, like the outline pills elsewhere on the site: the edge is
  // the button. Its whole hover is that edge darkening, which is why the
  // transition below carries border-color. Same border colour as the
  // outlined CTA on the zonnebank cards (border-line), not the darker
  // ink-primary edge BTN_OUTLINE_BORDER uses elsewhere.
  outline: "border border-line/30 text-zinc-600 hover:border-line hover:text-zinc-900",
} as const;

// Opacity is on this list because the way on spends most of its life waiting.
// It is the one property the disabled state changes, and left off the list it
// was the one property that snapped: swiping back to an answered question lit
// the button in a single frame while its colours were still easing.
const TRANSITION =
  "transform 150ms ease, background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease";

export function ctaClass(variant: keyof typeof VARIANTS, extra = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`;
}

export const CTA_TRANSITION: React.CSSProperties = { transition: TRANSITION };

/**
 * Both variants carry the arrow now, `hold` so the label never moves. The
 * existing 28px padding already clears ARROW_REACH (24px) on its own, so
 * `hold` does not need extra padding either — the earlier md:pr-9 bump was
 * unnecessary and only made the button lopsided at rest; plain, equal
 * px-[28px] was enough all along. The filled variant's extra span is the
 * icon/text gap some callers need (e.g. the WhatsApp links); CtaLabel wraps
 * around it so the arrow still anchors to the button's own trailing edge.
 */
export function CtaButton({
  variant = "accent",
  className = "",
  children,
  ...props
}: {
  variant?: keyof typeof VARIANTS;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const filled = variant === "accent";

  return (
    <button
      type="button"
      className={ctaClass(variant, className)}
      style={CTA_TRANSITION}
      {...props}
    >
      <CtaLabel hold>
        {filled ? (
          <span className="inline-flex items-center gap-2">{children}</span>
        ) : (
          children
        )}
      </CtaLabel>
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
  const filled = variant === "accent";

  return (
    <a
      className={ctaClass(variant, className)}
      style={CTA_TRANSITION}
      {...props}
    >
      <CtaLabel hold>
        {filled ? (
          // The gap comes along: these links carry an icon beside their label,
          // and the spacing that used to sit on the anchor now has to sit on
          // the row that actually holds the two of them.
          <span className="inline-flex items-center gap-2">{children}</span>
        ) : (
          children
        )}
      </CtaLabel>
    </a>
  );
}
