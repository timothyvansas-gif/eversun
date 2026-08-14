/**
 * How wide the test's desktop panel is.
 *
 * Its own module because two components need it and neither should import the
 * other: the panel draws itself with it, and the result screen does arithmetic
 * with it to place the QR overlay over the panel rather than over the page.
 */
export const HUIDTEST_PANEL_WIDTH = 600;
