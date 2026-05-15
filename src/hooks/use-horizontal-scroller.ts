"use client";

import { useCallback, useEffect, useState } from "react";
import { useDraggableScroll } from "@/hooks/use-draggable-scroll";

const CARD_WIDTH = 411;
const GAP = 24;

export function useHorizontalScroller() {
  const scrollRef = useDraggableScroll();
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = slider;
      setCanScroll(scrollWidth > clientWidth + 200);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 50);
    };

    const observer = new ResizeObserver(checkScroll);
    observer.observe(slider);

    slider.addEventListener("scroll", checkScroll);
    checkScroll();

    return () => {
      slider.removeEventListener("scroll", checkScroll);
      observer.disconnect();
    };
  }, [scrollRef]);

  const scrollNext = useCallback(() => {
    const slider = scrollRef.current;
    if (!slider) return;
    if (isAtEnd) {
      slider.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      slider.scrollBy({ left: (CARD_WIDTH + GAP) * 2, behavior: "smooth" });
    }
  }, [isAtEnd, scrollRef]);

  return { scrollRef, canScroll, isAtEnd, scrollNext };
}
