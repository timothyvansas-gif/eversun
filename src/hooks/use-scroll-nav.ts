import { animateScrollTo, prefersAnimatedScroll } from "@/lib/animate-scroll";

const SECTION_MAP: Record<string, string> = {
  Studio: "#waarom",
  "Over ons": "#over-ons",
};

export function useScrollNav() {
  function scrollToNav(item: string, delay = 0) {
    const target = SECTION_MAP[item] ?? `#${item.toLowerCase().replace(" ", "-")}`;

    const go = () => {
      const element = document.querySelector(target);
      if (!element) return;
      if (prefersAnimatedScroll()) {
        // Touch: native smooth is short and abrupt — use the eased rAF scroll.
        // Respect the element's responsive scroll-margin-top offset manually.
        const scrollMargin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
        animateScrollTo(window.scrollY + element.getBoundingClientRect().top - scrollMargin);
      } else {
        // Desktop: offsets live on the targets as `scroll-mt-*` classes; the
        // browser applies them automatically for scrollIntoView and #anchors.
        element.scrollIntoView({ behavior: "smooth" });
      }
    };

    if (delay > 0) {
      setTimeout(go, delay);
    } else {
      go();
    }
  }

  return { scrollToNav };
}
