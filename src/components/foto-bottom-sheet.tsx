"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { BTN_PILL } from "@/lib/button-styles";
import { Backdrop } from "@/components/ui/backdrop";
import { CloseButton } from "@/components/ui/close-button";
import { CtaLabel } from "@/components/ui/cta-arrow";
import AfspraakOverlay from "@/components/hero/afspraak-overlay";
import dummyImg from "@/images/impressie/dummy.webp";
import dummy2Img from "@/images/impressie/dummy-2.webp";
import dummy3Img from "@/images/impressie/dummy-3.webp";
import dummy4Img from "@/images/impressie/dummy-4.webp";
import tafelImg from "@/images/tafel.webp";

// Mostly still placeholders, so the dummies cycle around the real photos. The
// length is a multiple of LG_SPANS' cycle, which is what keeps the last row of
// the desktop grid full — a real photo therefore replaces a dummy rather than
// being appended.
//
// Index 0 is a wide tile, and wide is where a landscape photo belongs: the
// singles carry the aspect ratio (lg:aspect-[5/6], portrait) and a landscape
// shot dropped in one would be cropped to its middle third.
export const sheetPhotos = [
  tafelImg, dummy2Img, dummy3Img, dummy4Img, dummyImg, dummy2Img, dummy3Img,
  dummy4Img, dummyImg, dummy2Img, dummy3Img, dummy4Img, dummyImg, dummy2Img,
];

// Column spans on the desktop grid, repeating every seven tiles: a wide one
// beside a single, then three singles, then a single beside a wide. Every row
// adds up to the full three columns, so the mosaic never leaves a hole and no
// tile has to be reordered to fill one.
//
// Rows are all the same height — the variety comes from the wide tiles, not
// from differing row heights. The singles carry the aspect ratio and so set
// that height; a wide tile is left to stretch into it.
const LG_SPANS = [2, 1, 1, 1, 1, 1, 2];

export default function FotoBottomSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [canDrag, setCanDrag] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false
  );

  useEffect(() => {
    // SSR hydration guard: intentionally set once on mount to enable client-only portal render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = (e: MediaQueryListEvent) => setCanDrag(e.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useScrollLock(isOpen);

  // Paused while the QR overlay is open on top: that overlay has its own
  // focus trap, and without the guard one Escape would close both layers.
  useEffect(() => {
    if (!isOpen || qrOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusable = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    sheetRef.current?.focus({ preventScroll: true });

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, qrOpen, onClose]);

  if (!mounted) return null;

  const handleClose = () => {
    setQrOpen(false);
    onClose();
  };

  return createPortal(
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClick={handleClose} className="z-50" scrollLock />

          <div ref={sheetRef} tabIndex={-1} className="outline-none">
            <m.div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Binnenkijken bij Ever Sun"
              className="fixed bottom-0 inset-x-0 bg-surface-page rounded-t-[20px] z-50 max-h-[95dvh] flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
              transition={{ type: "spring", damping: 40, stiffness: 300 }}
              drag={canDrag ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) handleClose();
              }}
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <div className="md:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing shrink-0">
                <div className="w-10 h-1 rounded-full bg-ink/20" />
              </div>
              <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 pt-5 md:pt-7 pb-4 md:pb-5 shrink-0 md:flex md:items-center md:justify-between md:gap-4">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="font-display text-[20px] md:text-[24px] font-medium text-zinc-900 tracking-[-0.01em]">
                      Binnenkijken bij Ever Sun
                    </h2>
                    <span className="font-sans text-[15px] text-zinc-600 tracking-[-0.01em] whitespace-nowrap">
                      {`${sheetPhotos.length} foto's`}
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-zinc-600 leading-[24px] mt-1">
                    Kloekhorststraat 4a, Assen · <a href="tel:+31625306491" className="text-zinc-600 underline decoration-dotted underline-offset-6">06 25306491</a>
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setQrOpen(true)}
                    className={`group/cta ${BTN_PILL} !px-[28px] py-[10px] flex-shrink-0 justify-center min-w-[200px]`}
                  >
                    <CtaLabel hold>Plan je moment</CtaLabel>
                  </button>
                  <CloseButton onClick={handleClose} />
                </div>
              </div>
              <div
                className="w-full max-w-[1280px] mx-auto px-6 md:px-8 pb-4 md:pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start overflow-y-auto min-h-0"
                style={{ overscrollBehavior: "contain" }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {sheetPhotos.map((photo, i) => {
                  const wide = LG_SPANS[i % LG_SPANS.length] === 2;
                  return (
                    <div
                      key={i}
                      // One aspect utility per breakpoint, never two competing
                      // at the same one: which of a pair wins comes down to the
                      // order Tailwind emits them, not the order they are
                      // written here.
                      className={`relative w-full shrink-0 aspect-[16/9] ${
                        wide ? "lg:col-span-2 lg:aspect-auto" : "lg:aspect-[5/6]"
                      }`}
                    >
                      <Image
                        src={photo}
                        alt={`Impressie Ever Sun zonnestudio ${i + 1}`}
                        fill
                        placeholder="blur"
                        className="object-cover rounded-[12px]"
                        sizes={
                          wide
                            ? "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 66vw"
                            : "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
    <AfspraakOverlay isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </>,
    document.body
  );
}
