/**
 * Move focus to `el` without flashing the focus ring.
 *
 * Returning focus to whatever opened an overlay is what keyboard and screen
 * reader users need — otherwise they land back at the top of the document. But
 * a ring appearing on an element the visitor never tabbed to reads as a glitch,
 * so the element is marked `data-quiet-focus` for exactly this one focus. The
 * marker clears on the next real interaction (blur or keydown), so ordinary Tab
 * focus still draws its ring.
 *
 * Pairs with the `[data-quiet-focus]:focus-visible` rule in globals.css.
 */
export function quietFocus(el: HTMLElement) {
  el.setAttribute("data-quiet-focus", "");
  el.focus({ preventScroll: true });
  const clear = () => el.removeAttribute("data-quiet-focus");
  el.addEventListener("blur", clear, { once: true });
  el.addEventListener("keydown", clear, { once: true });
}
