"use client";

import { useRef, useEffect } from "react";

const WHEEL_GESTURE_IDLE_MS = 120;
const WHEEL_AXIS_THRESHOLD_PX = 8;
const WHEEL_AXIS_RATIO = 1.2;

export function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = ref.current;
    if (!slider) return;
    // Desktop pointer only — mobile uses native momentum scroll (no snap, no drag hook).
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    slider.setAttribute("data-lenis-prevent-horizontal", "");

    let isDown = false;
    let startX: number;
    let scrollLeft: number;
    let wheelAxis: "x" | "y" | null = null;
    let wheelDeltaX = 0;
    let wheelDeltaY = 0;
    let wheelScrollX = 0;
    let wheelGestureTimer: number | null = null;

    const resetWheelGesture = () => {
      wheelAxis = null;
      wheelDeltaX = 0;
      wheelDeltaY = 0;
      wheelScrollX = 0;
      wheelGestureTimer = null;
    };

    const onWheel = (e: WheelEvent) => {
      // Ctrl+wheel is pinch-to-zoom on macOS; never turn that into scrolling.
      if (e.ctrlKey || slider.scrollWidth <= slider.clientWidth) return;

      const deltaX = e.deltaX || (e.shiftKey ? e.deltaY : 0);
      const deltaY = e.shiftKey ? 0 : e.deltaY;
      if (deltaX === 0 && deltaY === 0) return;

      if (wheelGestureTimer !== null) window.clearTimeout(wheelGestureTimer);
      wheelGestureTimer = window.setTimeout(resetWheelGesture, WHEEL_GESTURE_IDLE_MS);
      let horizontalScroll = deltaX;

      // The first trackpad event can be tiny or point slightly off-axis. Wait
      // for enough movement before locking the gesture's dominant direction.
      if (wheelAxis === null) {
        wheelDeltaX += Math.abs(deltaX);
        wheelDeltaY += Math.abs(deltaY);
        wheelScrollX += deltaX;

        if (
          wheelDeltaX >= WHEEL_AXIS_THRESHOLD_PX &&
          wheelDeltaX > wheelDeltaY * WHEEL_AXIS_RATIO
        ) {
          wheelAxis = "x";
          horizontalScroll = wheelScrollX;
        } else if (
          wheelDeltaY >= WHEEL_AXIS_THRESHOLD_PX &&
          wheelDeltaY > wheelDeltaX * WHEEL_AXIS_RATIO
        ) {
          wheelAxis = "y";
        } else {
          if (e.cancelable) e.preventDefault();
          return;
        }
      }

      if (wheelAxis === "y" || !e.cancelable) return;

      e.preventDefault();
      const deltaScale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? slider.clientWidth : 1;
      slider.scrollLeft += horizontalScroll * deltaScale;
    };

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add("active-drag");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const onMouseLeave = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove("active-drag");
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove("active-drag");
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
    slider.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      if (wheelGestureTimer !== null) window.clearTimeout(wheelGestureTimer);
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("mousemove", onMouseMove);
      slider.removeEventListener("wheel", onWheel);
      slider.removeAttribute("data-lenis-prevent-horizontal");
    };
  }, []);

  return ref;
}
