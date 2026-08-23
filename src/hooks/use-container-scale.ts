import { useRef, useEffect } from "react";

export function useContainerScale(designWidth: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const applyScale = (width: number) => {
      const scale = Math.min(1, width / designWidth);
      const xOffset = (width - designWidth * scale) / 2;
      const transform = `translateX(${xOffset}px) scale(${scale})`;
      content.style.transform = transform;
      // Published on the container so siblings outside the scaled canvas can
      // still line up with things inside it. Anything that carries text wants
      // to sit out here — inside, its type would shrink with the canvas — but
      // it still has to land on a coordinate expressed in design units.
      container.style.setProperty("--canvas-scale", String(scale));
      container.style.setProperty("--canvas-x", `${xOffset}px`);
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
