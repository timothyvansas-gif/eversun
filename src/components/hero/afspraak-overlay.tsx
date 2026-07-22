"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import qrCode from "@/images/qr-code-ever-sun.svg";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { CloseButton } from "@/components/ui/close-button";

export default function AfspraakOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // SSR hydration guard: intentionally set once on mount to enable client-only portal render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useFocusTrap(overlayRef, isOpen, onClose);
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const firstFocusable = overlayRef.current?.querySelector<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
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
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
            onClick={onClose}
          />

          <div ref={overlayRef}>
          <m.div
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Afspraak maken"
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FAF4EC] rounded-2xl z-50 w-[364px]"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.88, y: shouldReduceMotion ? 0 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 8, transition: { duration: 0.2, ease: [0.36, 0, 0.66, 0] } }}
            transition={{ type: "spring", damping: 14, stiffness: 260 }}
          >
            <div className="relative px-8 pb-8 pt-14">
              <CloseButton onClick={onClose} className="absolute top-4 right-4" />

              <div className="bg-white rounded-2xl p-2 w-[300px] mx-auto">
                <Image
                  src={qrCode}
                  alt="QR code om via WhatsApp een zonsessie te boeken bij Ever Sun"
                  width={300}
                  height={300}
                  className="w-full h-auto rounded-[8px]"
                />
              </div>

              <h2 className="card-title text-zinc-900 mt-8 text-center">Plan je zonsessie</h2>
              <p className="font-sans text-[15px] text-[#1a1a1a]/70 leading-[24px] mt-2 text-center">
                Scan de QR-code om direct via<br />WhatsApp een afspraak te maken.
              </p>

              <div className="mt-5 pt-5 border-t border-[#f6ecde] text-center">
                <p className="card-title text-zinc-900">Liever bellen?</p>
                <a
                  href="tel:+31625306491"
                  className="font-sans text-[15px] text-[#1a1a1a]/70 leading-[24px] mt-1 block underline decoration-dotted md:no-underline"
                >
                  06 25306491
                </a>
              </div>
            </div>
          </m.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
