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
