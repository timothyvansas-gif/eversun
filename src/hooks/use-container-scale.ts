import { useRef, useEffect } from "react";

export function useContainerScale(designWidth: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const applyScale = (width: number) => {
      const scale = Math.min(1, width / designWidth);
      const xOffset = (width - designWidth * scale) / 2;
      const transform = `translateX(${xOffset}px) scale(${scale})`;
      content.style.transform = transform;
      if (bgRef.current) bgRef.current.style.transform = transform;
    };

    const observer = new ResizeObserver(([entry]) => {
      applyScale(entry.contentRect.width);
    });

    applyScale(container.getBoundingClientRect().width);
    observer.observe(container);
    return () => observer.disconnect();
  }, [designWidth]);

  return { containerRef, contentRef, bgRef };
}
