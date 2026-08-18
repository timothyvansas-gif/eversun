/**
 * The mobile menu's one movement, in one place.
 *
 * Opening the menu moves two things at once: the panel slides in from the
 * right, and <main> is pushed 95% of the viewport out to the left. They read as
 * a single gesture only while they share a curve and a duration exactly — the
 * panel animates through Framer Motion and the push is a plain CSS transition,
 * so nothing but this file keeps the two halves honest.
 *
 * The curve holds its speed through the middle and settles at the end. The
 * expo-out it replaced covered nine tenths of the distance in the first third
 * of its time and crawled the rest, which reads as a snap followed by a tail
 * rather than something sliding.
 */
export const MENU_EASE = [0.32, 0.72, 0, 1] as [number, number, number, number];

/** Seconds, for Framer Motion. */
export const MENU_DURATION = 0.9;

/** The same movement as a CSS shorthand, for the page push. */
export const MENU_PUSH_TRANSITION = `transform ${MENU_DURATION * 1000}ms cubic-bezier(${MENU_EASE.join(", ")})`;
