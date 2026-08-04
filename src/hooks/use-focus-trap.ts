"use client";

import { RefObject, useEffect, useRef } from "react";
import { quietFocus } from "@/lib/quiet-focus";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Rendered and laid out. Covers `display:none` (the mobile/desktop variants
 *  both live in the tree) without the `offsetParent` trick, which reports null
 *  for anything positioned fixed. */
function isVisible(el: HTMLElement) {
  return el.getClientRects().length > 0;
}

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onEscape: () => void,
) {
  const returnToRef = useRef<HTMLElement | null>(null);

  // Remember what had focus when the trap engaged, and hand it back when the
  // trap lets go. Without this, closing an overlay drops focus on <body> and
  // the next Tab restarts from the top of the page.
  useEffect(() => {
    if (!isOpen) return;
    // Captured now, not read in the cleanup: by then the ref may already point
    // at a different node (or none), and the panel we care about is this one.
    const panel = ref.current;
    returnToRef.current = document.activeElement as HTMLElement | null;

    return () => {
      const el = returnToRef.current;
      returnToRef.current = null;
      if (!el || !el.isConnected) return;

      // Only reclaim focus if it is still ours to give. When a second sheet
      // stacks on top, this trap stands down (isBehind) while the new sheet
      // takes focus — yanking it back to our trigger would fight it.
      const active = document.activeElement;
      const stillOurs =
        active === document.body ||
        active === null ||
        panel?.contains(active) === true;
      if (!stillOurs) return;

      quietFocus(el);
    };
  }, [isOpen, ref]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // No blur() here: dropping focus on <body> is what broke the return
        // path. The cleanup above moves focus deliberately instead.
        onEscape();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;

      const focusable = Array.from(
        ref.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(isVisible);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Focus sitting outside the dialog — on <body>, or on background content
      // it should never have reached — means Tab would walk the page behind the
      // overlay. Pull it back to the near edge instead of only wrapping at the
      // ends, which is all the previous version did.
      if (!ref.current.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onEscape, ref]);
}
