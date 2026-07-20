"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence, animate } from "framer-motion";
import Image from "next/image";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import AfspraakOverlay from "@/components/hero/afspraak-overlay";
import dummyImg from "@/images/impressie/dummy.webp";
import dummy2Img from "@/images/impressie/dummy-2.webp";
import dummy3Img from "@/images/impressie/dummy-3.webp";
import dummy4Img from "@/images/impressie/dummy-4.webp";

export const sheetPhotos = [dummyImg, dummy2Img, dummy3Img, dummy4Img, dummyImg, dummy2Img];

export default function FotoBottomSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [canDrag, setCanDrag] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false
  );

  useEffect(() => {
    // SSR hydration guard: intentionally set once on mount to enable client-only portal render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = (e: MediaQueryListEvent) => setCanDrag(e.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useScrollLock(isOpen);

  // One-time peek after the sheet lands: scroll the grid down a bit and spring
  // back, so visitors see there are more photos below the fold. Skipped for
  // prefers-reduced-motion and when everything already fits; aborted the
  // moment the visitor scrolls or touches the grid themselves.
  useEffect(() => {
    if (!isOpen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = gridRef.current;
    if (!el) return;

    let controls: ReturnType<typeof animate> | undefined;
    const stop = () => controls?.stop();
    const timeout = setTimeout(() => {
      if (el.scrollHeight <= el.clientHeight || el.scrollTop > 0) return;
      el.addEventListener("pointerdown", stop);
      el.addEventListener("wheel", stop);
      controls = animate(0, 64, {
        type: "spring",
        damping: 22,
        stiffness: 180,
        onUpdate: (v) => { el.scrollTop = v; },
        onComplete: () => {
          controls = animate(64, 0, {
            type: "spring",
            damping: 24,
            stiffness: 160,
            onUpdate: (v) => { el.scrollTop = v; },
          });
        },
      });
    }, 600);

    return () => {
      clearTimeout(timeout);
      stop();
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("wheel", stop);
    };
  }, [isOpen]);

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
          <m.div
            data-lenis-prevent
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
          />

          <div ref={sheetRef} tabIndex={-1} className="outline-none">
            <m.div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Binnenkijken bij Ever Sun"
              className="fixed bottom-0 inset-x-0 md:mx-auto md:w-[calc(90vw-0.9*clamp(3rem,8vw,20rem))] md:max-w-[1152px] bg-[#FAF4EC] rounded-t-[20px] z-50 h-[90svh] md:h-[94svh] flex flex-col"
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
                <div className="w-10 h-1 rounded-full bg-[#1a1a1a]/20" />
              </div>
              <div className="px-6 md:px-8 pt-5 md:pt-7 pb-4 md:pb-5 shrink-0 md:flex md:items-center md:justify-between md:gap-4">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="font-display text-[20px] md:text-[24px] font-medium text-[#1a1a1a] tracking-[-0.01em]">
                      Binnenkijken bij Ever Sun
                    </h2>
                    <span className="font-sans text-[15px] text-[#1a1a1a]/40 tracking-[-0.01em] whitespace-nowrap">
                      {`${sheetPhotos.length} foto's`}
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-[#1a1a1a]/60 leading-[24px] mt-1">
                    Kloekhorststraat 4a, Assen · <a href="tel:+31625306491" className="text-[#1a1a1a]/60 underline decoration-dotted">06 25306491</a>
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setQrOpen(true)}
                    className="text-zinc-900 text-[15px] font-normal font-sans tracking-[-0.01em] border border-[#d5be9c] rounded-full px-[18px] py-[10px] cursor-pointer hover:border-[#312019] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors duration-150 flex-shrink-0"
                  >
                    Plan je moment
                  </button>
                  <button
                    className="flex items-center justify-center w-9 h-9 rounded-full text-[24px] leading-none text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors duration-150 cursor-pointer"
                    onClick={handleClose}
                    aria-label="Sluiten"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div
                ref={gridRef}
                className="px-6 md:px-8 pb-4 md:pb-8 grid grid-cols-1 md:grid-cols-2 gap-4 content-start overflow-y-auto"
                style={{ overscrollBehavior: "contain" }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {sheetPhotos.map((photo, i) => (
                  <div key={i} className="relative w-full shrink-0 pb-[56.04%]">
                    <Image
                      src={photo}
                      alt={`Impressie Ever Sun zonnestudio ${i + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 767px) 100vw, 536px"
                    />
                  </div>
                ))}
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
