"use client";

import { useRef, useEffect } from "react";

export function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = ref.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add("active-drag");
      slider.style.scrollSnapType = "none";
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const snapToNearest = () => {
      const firstChild = slider.firstElementChild as HTMLElement | null;
      if (!firstChild) {
        slider.style.scrollSnapType = "x mandatory";
        return;
      }
      const gap = parseFloat(window.getComputedStyle(slider).gap) || 0;
      const itemStep = firstChild.offsetWidth + gap;
      const nearest = Math.round(slider.scrollLeft / itemStep) * itemStep;
      slider.scrollTo({ left: nearest, behavior: "smooth" });
      setTimeout(() => {
        slider.style.scrollSnapType = "x mandatory";
      }, 500);
    };

    const onMouseLeave = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove("active-drag");
      snapToNearest();
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove("active-drag");
      snapToNearest();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", onMouseDown);
    slider.addEventListener("mouseleave", onMouseLeave);
    slider.addEventListener("mouseup", onMouseUp);
    slider.addEventListener("mousemove", onMouseMove);

    return () => {
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return ref;
}
