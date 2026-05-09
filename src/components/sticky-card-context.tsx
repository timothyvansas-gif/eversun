"use client";
import { createContext, useContext } from "react";

export const StickyCardContext = createContext({
  isCovered: false,
});

export function useStickyCard() {
  return useContext(StickyCardContext);
}
