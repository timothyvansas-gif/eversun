"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import dummyImg from "@/images/impressie/dummy.webp";
import dummy2Img from "@/images/impressie/dummy-2.webp";
import dummy3Img from "@/images/impressie/dummy-3.webp";
import dummy4Img from "@/images/impressie/dummy-4.webp";

export const sheetPhotos = [dummyImg, dummy2Img, dummy3Img, dummy4Img];

export default function FotoBottomSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            data-lenis-prevent
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <div ref={sheetRef} tabIndex={-1} className="outline-none">
            <motion.div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Binnenkijken bij Ever Sun"
              className="fixed bottom-0 inset-x-0 md:mx-auto md:w-[calc(90vw-0.9*clamp(3rem,8vw,20rem))] md:max-w-[1152px] bg-[#FAF4EC] rounded-t-[20px] z-50 h-[90vh] md:h-[94vh] flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
              transition={{ type: "spring", damping: 40, stiffness: 300 }}
              drag={canDrag ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) onClose();
              }}
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <div className="md:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing shrink-0">
                <div className="w-10 h-1 rounded-full bg-[#1a1a1a]/20" />
              </div>
              <div className="relative px-6 md:px-8 pt-5 md:pt-7 pb-4 md:pb-5 shrink-0">
                <h2 className="font-display text-[20px] md:text-[24px] font-medium text-[#1a1a1a] tracking-[-0.01em]">
                  Binnenkijken bij Ever Sun
                </h2>
                <p className="font-sans text-[15px] text-[#1a1a1a]/60 leading-[24px] mt-1">
                  Kloekhorststraat 4a, Assen · <a href="tel:+31625306491" className="text-[#1a1a1a]/60 underline decoration-dotted">06 25306491</a>
                </p>
                <button
                  className="hidden md:flex absolute top-7 right-6 items-center justify-center w-9 h-9 rounded-full text-[24px] leading-none text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors duration-150 cursor-pointer"
                  onClick={onClose}
                  aria-label="Sluiten"
                >
                  ×
                </button>
              </div>
              <div
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
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
