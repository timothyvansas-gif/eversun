import { useLenis } from "lenis/react";

const SCROLL_OPTIONS = { offset: -56, duration: 1.5 } as const;

const SECTION_MAP: Record<string, string> = {
  Studio: "#waarom",
  "Over ons": "#over-ons",
};

export function useScrollNav() {
  const lenis = useLenis();

  function scrollToNav(item: string, delay = 0) {
    const target = SECTION_MAP[item] ?? `#${item.toLowerCase().replace(" ", "-")}`;
    
    const go = () => {
      document.body.classList.add("is-programmatic-scrolling");
      window.dispatchEvent(new Event("programmatic-scroll-start"));
      
      const cleanup = () => {
        document.body.classList.remove("is-programmatic-scrolling");
        window.dispatchEvent(new Event("programmatic-scroll-end"));
      };
      const fallbackTimeout = setTimeout(cleanup, 2000); // Fallback if onComplete doesn't fire

      lenis?.scrollTo(target, { 
        ...SCROLL_OPTIONS,
        onComplete: () => {
          clearTimeout(fallbackTimeout);
          cleanup();
        }
      });
    };
    
    delay > 0 ? setTimeout(go, delay) : go();
  }

  return { scrollToNav };
}
