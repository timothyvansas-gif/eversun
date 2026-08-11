/**
 * Single source of truth for the mobile breakpoint media query, matching
 * Tailwind's `md` (min 768px) split. Use with matchMedia or useMediaQuery.
 */
export const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Matches Tailwind's `lg` (min 1024px) split — where the hamburger/mobile-menu
 * system (sticky-header, hero menu button, MobileMenu panel) gives way to the
 * desktop nav. Use to detect crossing into desktop so mobile-only UI state
 * (e.g. an open menu) can be reset; it does not close itself on resize.
 */
export const DESKTOP_NAV_QUERY = "(min-width: 1024px)";

/**
 * Matches Tailwind's `xl` (min 1280px) split — where the carousels' overlay
 * arrow buttons appear (`hidden xl:block`). Below it those buttons do not
 * exist, so a track whose cards are not focusable has to be its own tab stop
 * or its later cards cannot be reached by keyboard at all. See over-ons.
 */
export const CAROUSEL_NAV_QUERY = "(min-width: 1280px)";
