"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import FaqList from "@/components/faq-list";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { CloseButton } from "@/components/ui/close-button";
import { Backdrop } from "@/components/ui/backdrop";
import { STACK_SPRING } from "@/components/hero/sheet-stack";

const TITLE = "Veelgestelde vragen";

/**
 * The FAQ as a sheet on mobile and a panel on desktop, built on the same
 * geometry as the openingstijden overlay so the two read as one family — same
 * scrim, same spring, same drag-to-dismiss, same close control.
 *
 * It does not stack on another sheet, so none of the depth machinery from that
 * one is here.
 */
export default function FaqOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useFocusTrap(overlayRef, isOpen, onClose);
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    overlayRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  if (!mounted) return null;

  // Portalled to <body> for the same reason as the other overlays: rendered
  // inside <main> it could never clear the sticky header, which sits outside it.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClick={onClose} className="z-[55]" scrollLock />

          <div ref={overlayRef} tabIndex={-1} className="outline-none">
            {/* Mobile: bottom sheet */}
            <m.div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label={TITLE}
              className="md:hidden fixed bottom-0 inset-x-0 z-[55] flex max-h-[85vh] flex-col rounded-t-[20px] bg-surface-page"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
              transition={STACK_SPRING}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) onClose();
              }}
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex shrink-0 justify-center pt-3 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-ink/20" />
              </div>
              <div className="shrink-0 px-6 pt-5 pb-1">
                <h2 className="card-title text-zinc-900">{TITLE}</h2>
              </div>
              {/* The list scrolls, the header stays. `overscroll-contain` so
                  reaching the end of it does not hand the gesture to the page
                  underneath, and `touch-pan-y` so a scroll here is never
                  mistaken for the drag that dismisses the sheet. */}
              <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-6 pt-3">
                <FaqList />
              </div>
            </m.div>

            {/* Desktop: modal panel */}
            <m.div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label={TITLE}
              className="hidden md:flex fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[55] w-[min(560px,calc(100vw-4rem))] max-h-[80vh] flex-col rounded-2xl bg-surface-page"
              initial={{ opacity: 0, scale: 0.88, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2, ease: [0.36, 0, 0.66, 0] } }}
              transition={{ type: "spring", damping: 14, stiffness: 260 }}
            >
              <div className="relative shrink-0 px-8 pt-8 pb-1">
                <CloseButton onClick={onClose} className="absolute top-4 right-4" />
                <h2 className="card-title text-zinc-900">{TITLE}</h2>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pt-3 pb-8">
                <FaqList />
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
