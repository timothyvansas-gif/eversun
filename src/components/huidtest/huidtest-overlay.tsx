"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useDragControls } from "framer-motion";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { Backdrop } from "@/components/ui/backdrop";
import { CloseButton } from "@/components/ui/close-button";
import { DRAG_ELASTIC, STACK_SPRING } from "@/components/hero/sheet-stack";
import HuidtestQuiz from "@/components/huidtest/huidtest-quiz";

/**
 * The huidtest as a layer over the page: a panel down the right-hand side on
 * desktop, the site's usual sheet up from the bottom on a phone.
 *
 * Keeping the page behind it is the point — "which of these is mine?" is a
 * question that comes up while looking at the beds, and sending someone to
 * another page to answer it takes away the thing they were looking at. The
 * route at /huidtest still exists for shared links, running the same quiz.
 *
 * One instance, switched by a media query rather than two mounted variants
 * hidden with CSS: the quiz holds the answers, and two copies of it would mean
 * two half-finished tests and double the analytics.
 */

const PANEL_WIDTH = 520;

/** Matches the other sheets: a slide out, quicker than the spring coming in. */
const SHEET_EXIT = { duration: 0.28, ease: [0.36, 0, 0.66, 0] as [number, number, number, number] };

/** How far a drag has to travel, or how fast, before it counts as a dismissal. */
const DISMISS_OFFSET = 80;
const DISMISS_VELOCITY = 400;

export default function HuidtestOverlay({
  isOpen,
  onClose,
  entry,
}: {
  isOpen: boolean;
  onClose: () => void;
  entry: "home_sectie" | "hero_link" | "direct";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const dragControls = useDragControls();
  const [mounted, setMounted] = useState(false);

  useScrollLock(isOpen);
  useFocusTrap(panelRef, isOpen, onClose);

  useEffect(() => {
    // SSR hydration guard: intentionally set once on mount to enable client-only portal render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const closed = isMobile ? { y: "100%" } : { x: "100%" };
  const open = isMobile ? { y: 0 } : { x: 0 };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClick={onClose} className="z-[80] cursor-pointer" scrollLock />

          <m.div
            ref={panelRef}
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Huidtest"
            initial={closed}
            animate={open}
            exit={{ ...closed, transition: SHEET_EXIT }}
            transition={STACK_SPRING}
            // Dragging is the sheet's gesture, not the panel's, and even on the
            // sheet it starts from the grabber only: the quiz scrolls, and a
            // drag listener on the whole surface would swallow that scroll.
            drag={isMobile ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: DRAG_ELASTIC }}
            onDragEnd={(_, info) => {
              if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) onClose();
            }}
            // No bottom padding of its own: the sticky action bar inside runs
            // to the sheet's edge and carries the safe-area inset itself.
            // Padding here left a strip of page under the button that read as
            // the bar failing to reach the bottom.
            style={{ maxWidth: isMobile ? undefined : PANEL_WIDTH }}
            className={
              isMobile
                ? // One height for every step, not one per step. The result is
                  // the tallest screen and already fills this, so sizing to
                  // content meant the sheet grew and shrank underneath the
                  // reader as they answered — the surface moving while the
                  // content changed reads as two things happening at once.
                  // Fixed, the questions simply sit at the top with the action
                  // bar on the bottom edge, and nothing but the text changes.
                  "fixed inset-x-0 bottom-0 z-[90] flex h-[92svh] flex-col rounded-t-[20px] bg-surface-page"
                : "fixed inset-y-0 right-0 z-[90] flex w-full flex-col bg-surface-page shadow-[0_0_60px_rgba(0,0,0,0.25)]"
            }
          >
            {isMobile && (
              <div
                onPointerDown={(event) => dragControls.start(event)}
                className="flex shrink-0 cursor-grab justify-center pt-3 active:cursor-grabbing"
              >
                <div className="h-1 w-10 rounded-full bg-ink/20" />
              </div>
            )}

            {/* Desktop only. The sheet closes by dragging it back down or
                tapping the page behind it, the way the site's other sheets do;
                a × on top of that is a second control for a gesture that is
                already there. The panel has no such gesture, so it keeps one.
                Escape closes either, through the focus trap. */}
            {!isMobile && (
              <div className="flex shrink-0 items-center justify-end px-4 pt-3 sm:px-6">
                <CloseButton onClick={onClose} label="Huidtest sluiten" />
              </div>
            )}

            <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-6 pt-4">
              <HuidtestQuiz entry={entry} onClose={onClose} />
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
