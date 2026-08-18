"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useDragControls } from "framer-motion";
import FaqList from "@/components/faq-list";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { CloseButton } from "@/components/ui/close-button";
import { Backdrop } from "@/components/ui/backdrop";
import { DRAG_ELASTIC, STACK_SPRING } from "@/components/hero/sheet-stack";

const TITLE = "Veelgestelde vragen";

/**
 * The questions as a layer over the page, built to the huidtest's pattern: a
 * panel down the right-hand side on desktop, the site's usual sheet up from the
 * bottom on a phone, and the answers on a white card inside the cream surface.
 *
 * Same reason as the test for keeping the page behind it — "moet ik
 * reserveren?" comes up while reading about the beds, and sending someone to
 * another page to answer it takes away what they were looking at. The route at
 * /veelgestelde-vragen still exists, for shared links and for everything that
 * cannot click.
 *
 * One instance switched on a media query rather than two variants hidden with
 * CSS, so a question opened on a phone is still open after a rotate.
 */

/** Matches the other sheets: a slide out, quicker than the spring coming in. */
const SHEET_EXIT = { duration: 0.28, ease: [0.36, 0, 0.66, 0] as [number, number, number, number] };

/** How far a drag has to travel, or how fast, before it counts as a dismissal. */
const DISMISS_OFFSET = 80;
const DISMISS_VELOCITY = 400;

/** The width of the huidtest's panel. The two open onto the same page edge and
 *  a second, nearly-equal width would read as a mistake rather than a choice. */
const PANEL_WIDTH = 600;

export default function FaqOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

  const contents = (
    <>
      {/* Desktop only, like the test: the sheet closes by dragging it back down
          or tapping the page behind it, and a × on top of that is a second
          control for a gesture that is already there. The panel has no such
          gesture, so it keeps one. Escape closes either. */}
      {!isMobile && (
        <div className="flex shrink-0 items-center justify-end px-4 pt-3 sm:px-6">
          <CloseButton onClick={onClose} label="Vragen sluiten" />
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-6 pt-0 pb-6 md:pt-4">
        {/* The white sheet every huidtest step is written on, same radius and
            padding: the questions have to read as one thing rather than as text
            floating on the site's cream. */}
        <div className="rounded-2xl bg-white px-6 py-6">
          <h2 className="font-display text-ink-primary text-[clamp(24px,4.5vw,32px)] font-medium leading-tight tracking-[-0.01em]">
            {TITLE}
          </h2>
          <p className="mt-3 max-w-[54ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
            Prijzen, openingstijden, reserveren en betalen, kort beantwoord.
          </p>

          <div className="mt-6 border-t border-line/30 pt-2">
            <FaqList />
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClick={onClose} className="z-[54] cursor-pointer" scrollLock />

          {isMobile ? (
            <m.div
              ref={panelRef}
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label={TITLE}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: SHEET_EXIT }}
              transition={STACK_SPRING}
              // Dragging starts from the grabber only: the list scrolls, and a
              // drag listener on the whole surface would swallow that scroll.
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: DRAG_ELASTIC }}
              onDragEnd={(_, info) => {
                if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) onClose();
              }}
              // One height, whichever answers are open: sized to content the
              // sheet would grow and shrink under the reader as they tap.
              className="fixed inset-x-0 bottom-0 z-[55] flex h-[92svh] flex-col rounded-t-[20px] bg-surface-page"
            >
              {/* The strip the sheet is dragged by, not just the mark drawn on
                  it: a 4px bar asks for a thumb placed to the pixel. */}
              <div
                onPointerDown={(event) => dragControls.start(event)}
                className="flex shrink-0 cursor-grab justify-center pt-3 pb-6 active:cursor-grabbing"
              >
                <div className="h-1 w-10 rounded-full bg-ink/20" />
              </div>

              {contents}
            </m.div>
          ) : (
            <m.div
              ref={panelRef}
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label={TITLE}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%", transition: SHEET_EXIT }}
              transition={STACK_SPRING}
              style={{ maxWidth: PANEL_WIDTH }}
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
