/**
 * Eased programmatic page scroll for touch devices.
 *
 * Mobile browsers implement `behavior: "smooth"` with a short, fairly linear
 * animation that feels abrupt over long distances. This drives the scroll with
 * requestAnimationFrame instead: distance-based duration and an ease-in-out
 * curve. A touch or wheel input cancels the animation immediately so the user
 * always stays in control.
 */

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Has the visitor asked their OS for less motion? */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * `behavior` for a native `scrollTo` / `scrollBy` / `scrollIntoView` call.
 *
 * The CSS `scroll-behavior` property cannot switch these off: an explicit
 * `behavior` in the options object outranks it, so a `prefers-reduced-motion`
 * stylesheet rule leaves every one of them animating. Passing the behaviour in
 * is the only thing the browser honours (WCAG 2.3.3).
 */
export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

let rafId: number | null = null;

function cancelAnimation() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  window.removeEventListener("touchstart", cancelAnimation);
  window.removeEventListener("wheel", cancelAnimation);
}

export function animateScrollTo(targetY: number) {
  cancelAnimation();

  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;
  const target = Math.max(0, Math.min(targetY, maxScroll));
  const start = window.scrollY;
  const distance = target - start;
  if (distance === 0) return;

  // WCAG 2.3.3: no scroll animation for users who prefer reduced motion.
  if (prefersReducedMotion()) {
    window.scrollTo(0, target);
    return;
  }

  // ~0.35ms per px, clamped: short hops stay snappy, long jumps get room.
  const duration = Math.min(1100, Math.max(500, Math.abs(distance) * 0.35));

  window.addEventListener("touchstart", cancelAnimation, { passive: true });
  window.addEventListener("wheel", cancelAnimation, { passive: true });

  let startTime: number | null = null;
  const step = (now: number) => {
    if (startTime === null) startTime = now;
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));
    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      cancelAnimation();
    }
  };
  rafId = requestAnimationFrame(step);
}

/** Touch/coarse-pointer device → use the custom eased scroll there. */
export function prefersAnimatedScroll(): boolean {
  return !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
