import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

export const SITE_HEADER_H = 56;

export function useStickyBentoHeader() {
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const lastCardRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(132);
  const [startVisible, setStartVisible] = useState(false);
  const isInView = useInView(headerWrapperRef, { once: true });
  const modeRef = useRef<"sticky" | "absolute">("sticky");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!headerWrapperRef.current) return;
      const { top } = headerWrapperRef.current.getBoundingClientRect();
      if (top < window.innerHeight) setStartVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!headerWrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setHeaderHeight(entries[0].borderBoxSize[0].blockSize);
    });
    observer.observe(headerWrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = headerWrapperRef.current;
    const ph = placeholderRef.current;
    if (!el || !ph) return;

    const toSticky = () => {
      modeRef.current = "sticky";
      el.style.cssText = "";
      ph.style.display = "none";
    };

    const update = () => {
      rafRef.current = null;
      if (!lastCardRef.current) return;

      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (!isMobile) {
        if (modeRef.current !== "sticky") toSticky();
        return;
      }

      const threshold = headerHeight + SITE_HEADER_H;
      const lastCardTop = lastCardRef.current.getBoundingClientRect().top;
      if (modeRef.current === "sticky") {
        if (lastCardTop <= threshold) {
          const rect = el.getBoundingClientRect();
          const sectionRect = el.closest("section")!.getBoundingClientRect();

          modeRef.current = "absolute";
          el.style.position = "absolute";
          el.style.top = `${rect.top - sectionRect.top}px`;
          el.style.left = `${rect.left - sectionRect.left}px`;
          el.style.width = `${rect.width}px`;
          el.style.zIndex = "40";

          ph.style.display = "block";
          ph.style.height = `${rect.height}px`;
        }
        return;
      }

      if (lastCardTop > threshold) toSticky();
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [headerHeight]);

  return { headerWrapperRef, placeholderRef, lastCardRef, headerHeight, startVisible, isInView };
}
