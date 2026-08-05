export const NAV_ITEMS = ["Studio", "Banken", "Producten", "Over ons", "Contact"] as const;

/**
 * DOM id of the mobile menu panel. Lives here rather than in the component so
 * the two hamburger triggers (hero header, sticky header) can point
 * `aria-controls` at it without importing the panel itself.
 */
export const MOBILE_MENU_ID = "mobiel-menu";
