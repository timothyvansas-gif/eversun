import { useRef, useEffect } from "react";

export function useContainerScale(designWidth: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const applyScale = (width: number) => {
      content.style.transform = `scale(${width / designWidth})`;
    };

    const observer = new ResizeObserver(([entry]) => {
      applyScale(entry.contentRect.width);
    });

    applyScale(container.getBoundingClientRect().width);
    observer.observe(container);
    return () => observer.disconnect();
  }, [designWidth]);

  return { containerRef, contentRef };
}
