import { useLenis } from "lenis/react";

const SCROLL_OPTIONS = { offset: -20, duration: 1.5 } as const;

const SECTION_MAP: Record<string, string> = {
  Studio: "#waarom",
};

export function useScrollNav() {
  const lenis = useLenis();

  function scrollToNav(item: string, delay = 0) {
    const target = SECTION_MAP[item] ?? `#${item.toLowerCase().replace(" ", "-")}`;
    const go = () => lenis?.scrollTo(target, SCROLL_OPTIONS);
    delay > 0 ? setTimeout(go, delay) : go();
  }

  return { scrollToNav };
}
