"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useDragControls, useMotionValue, useTransform } from "framer-motion";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { Backdrop } from "@/components/ui/backdrop";
import { CloseButton } from "@/components/ui/close-button";
import { BEHIND_LIFT, BEHIND_SCALE, DRAG_ELASTIC, STACK_SPRING } from "@/components/hero/sheet-stack";
import { HUIDTEST_PANEL_WIDTH } from "@/components/huidtest/panel-metrics";
import HuidtestQuiz from "@/components/huidtest/huidtest-quiz";
import { HuidtestSurfaceContext } from "@/components/huidtest/surface-context";

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
  // State as well as a ref: the booking sheet portals into this element, and a
  // ref alone would not tell React when it finally exists.
  const [surface, setSurface] = useState<HTMLDivElement | null>(null);

  // How far this sheet has sunk behind whatever is stacked on it. Written by
  // the sheet in front, including mid-drag, so pulling that one back down hands
  // this one its size back on the way.
  const stackDepth = useMotionValue(0);
  const behindScale = useTransform(stackDepth, [0, 1], [1, BEHIND_SCALE]);
  const behindLift = useTransform(stackDepth, [0, 1], [0, BEHIND_LIFT]);

  // Whether something is covering it. Read off the same value rather than
  // tracked separately, so the two can never disagree: while it is behind, this
  // sheet gives up its focus trap and goes inert, or two traps would answer the
  // same Escape and close both.
  const [isBehind, setIsBehind] = useState(false);
  useEffect(() => stackDepth.on("change", (depth) => setIsBehind(depth > 0.5)), [stackDepth]);

  // Whether the content has moved under the sheet's own edge. Text ending
  // hard against the drag handle reads as content that has been cut off, so a
  // short fade takes over there — but only once there is something to fade,
  // or the card's top edge would look tinted at rest.
  const [isScrolled, setIsScrolled] = useState(false);

  const isMobile = useMediaQuery(MOBILE_QUERY);
  const dragControls = useDragControls();
  const [mounted, setMounted] = useState(false);

  useScrollLock(isOpen);
  useFocusTrap(panelRef, isOpen && !isBehind, onClose);

  useEffect(() => {
    // SSR hydration guard: intentionally set once on mount to enable client-only portal render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const surfaceRef = (node: HTMLDivElement | null) => {
    panelRef.current = node;
    setSurface(node);
  };

  const contents = (
    <>
      {/* Desktop only. The sheet closes by dragging it back down or tapping the
          page behind it, the way the site's other sheets do; a × on top of that
          is a second control for a gesture that is already there. The panel has
          no such gesture, so it keeps one. Escape closes either. */}
      {!isMobile && (
        <div className="flex shrink-0 items-center justify-end px-4 pt-3 sm:px-6">
          <CloseButton onClick={onClose} label="Huidtest sluiten" />
        </div>
      )}

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Sits over the top of the scroll area, not in it, so it fades what
            passes beneath rather than moving with it. Sheet only: it is there
            for the drag handle, and the panel has no handle to run into. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-surface-page to-transparent transition-opacity duration-200 md:hidden ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          onScroll={(event) => setIsScrolled(event.currentTarget.scrollTop > 4)}
          className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-6 pt-6 md:pt-4"
        >
          <HuidtestSurfaceContext.Provider value={{ element: surface, stackDepth }}>
            <HuidtestQuiz entry={entry} onClose={onClose} />
          </HuidtestSurfaceContext.Provider>
        </div>
      </div>
    </>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* z-[55], the same rung the openingstijden sheet sits on: below
              plan-je-moment's z-[60], which is what stacks on top of this when
              the advice is booked. */}
          <Backdrop onClick={onClose} className="z-[54] cursor-pointer" scrollLock />

          {isMobile ? (
            /* Two elements, because two transforms have to live side by side:
               the outer one sinks the sheet back into the stack, the inner one
               slides it in, out and under the finger. On one element the drag
               fights the sink and framer keeps whichever wrote last — which is
               exactly how the entrance went missing. */
            <m.div
              className="fixed inset-x-0 bottom-0 z-[55]"
              style={{ y: behindLift, scale: behindScale, transformOrigin: "bottom center" }}
              inert={isBehind}
            >
              <m.div
                ref={surfaceRef}
                data-lenis-prevent
                role="dialog"
                aria-modal="true"
                aria-label="Huidtest"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%", transition: SHEET_EXIT }}
                transition={STACK_SPRING}
                // Dragging starts from the grabber only: the quiz scrolls, and a
                // drag listener on the whole surface would swallow that scroll.
                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: DRAG_ELASTIC }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) onClose();
                }}
                // One height for every step. The result is the tallest screen
                // and already fills this, so sizing to content meant the sheet
                // grew and shrank underneath the reader as they answered.
                className="flex h-[92svh] flex-col rounded-t-[20px] bg-surface-page"
              >
                <div
                  onPointerDown={(event) => dragControls.start(event)}
                  className="flex shrink-0 cursor-grab justify-center pt-3 active:cursor-grabbing"
                >
                  <div className="h-1 w-10 rounded-full bg-ink/20" />
                </div>

                {contents}
              </m.div>
            </m.div>
          ) : (
            <m.div
              ref={surfaceRef}
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Huidtest"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%", transition: SHEET_EXIT }}
              transition={STACK_SPRING}
              style={{ maxWidth: HUIDTEST_PANEL_WIDTH }}
              className="fixed inset-y-0 right-0 z-[55] flex w-full flex-col bg-surface-page shadow-[0_0_60px_rgba(0,0,0,0.25)]"
            >
              {contents}
            </m.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
