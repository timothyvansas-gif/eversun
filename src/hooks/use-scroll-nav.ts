const SECTION_MAP: Record<string, string> = {
  Studio: "#waarom",
  "Over ons": "#over-ons",
};

export function useScrollNav() {
  function scrollToNav(item: string, delay = 0) {
    const target = SECTION_MAP[item] ?? `#${item.toLowerCase().replace(" ", "-")}`;
    
    const go = () => {
      const element = document.querySelector(target);
      if (element) {
        // We use a slight offset (e.g. -56px for header height)
        const offset = 56;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    };
    
    delay > 0 ? setTimeout(go, delay) : go();
  }

  return { scrollToNav };
}
