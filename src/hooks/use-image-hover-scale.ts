"use client";

import { useState } from "react";
import { useMediaQuery } from "./use-media-query";

export function useImageHoverScale() {
  const [hovered, setHovered] = useState(false);
  const canHover = useMediaQuery("(hover: hover)");

  return {
    cardHandlers: {
      onMouseEnter: () => { if (canHover) setHovered(true); },
      onMouseLeave: () => setHovered(false),
    },
    imageStyle: {
      transform: hovered ? "scale(1.05)" : "scale(1)",
      transition: "transform 500ms ease-out",
    } as React.CSSProperties,
  };
}
