"use client";

import { BTN_OUTLINE_BORDER } from "@/lib/button-styles";

/**
 * The huidtest's two buttons.
 *
 * They are close cousins of the site's pills but not the same animal, so they
 * live here rather than bending the shared constants: no arrow unfolding on
 * hover — inside the test a button is an answer, and a travelling arrow on
 * every one of them is motion where the eye should be reading — and the filled
 * one darkens to the page black on hover, the way the overlays' CTAs do.
 *
 * The transition is an inline style on purpose. Two `transition-property`
 * utilities on one element resolve by stylesheet order rather than by intent,
 * and this button needs both the press-scale and the colour.
 */

const BASE =
  "inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full px-[28px] py-3 font-sans text-[15px] font-medium tracking-[-0.01em] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS = {
  accent: "bg-accent text-surface-page hover:bg-[#111111]",
  // No fill at all, like the outline pills elsewhere on the site: the edge is
  // the button. Its whole hover is that edge darkening, which is why the
  // transition below carries border-color.
  outline: `text-ink-strong ${BTN_OUTLINE_BORDER}`,
} as const;

const TRANSITION = "transform 150ms ease, background-color 150ms ease, border-color 150ms ease";

export function ctaClass(variant: keyof typeof VARIANTS, extra = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`;
}

export const CTA_TRANSITION: React.CSSProperties = { transition: TRANSITION };

export function CtaButton({
  variant = "accent",
  className = "",
  ...props
}: {
  variant?: keyof typeof VARIANTS;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={ctaClass(variant, className)} style={CTA_TRANSITION} {...props} />;
}

export function CtaLink({
  variant = "accent",
  className = "",
  ...props
}: {
  variant?: keyof typeof VARIANTS;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={ctaClass(variant, className)} style={CTA_TRANSITION} {...props} />;
}
