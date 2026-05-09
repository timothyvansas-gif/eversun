"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import qrCode from "@/images/qr-code-ever-sun.svg";
import CloseIcon from "@/components/ui/close-icon";

export default function AfspraakOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !overlayRef.current) return;
      const focusable = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(
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

    const firstFocusable = overlayRef.current?.querySelector<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <div ref={overlayRef}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Afspraak maken"
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FAF4EC] rounded-2xl z-50 w-[364px]"
            initial={{ opacity: 0, scale: 0.88, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2, ease: [0.36, 0, 0.66, 0] } }}
            transition={{ type: "spring", damping: 14, stiffness: 260 }}
          >
            <div className="relative px-8 pb-8 pt-14">
              <button
                onClick={onClose}
                aria-label="Sluiten"
                className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-[6px] text-[#1a1a1a]/80 md:hover:bg-[#ffffff] md:hover:text-[#000000] transition-colors cursor-pointer"
              >
                <CloseIcon />
              </button>

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
                  className="font-sans text-[15px] text-[#1a1a1a]/70 leading-[24px] mt-1 block"
                >
                  06 25306491
                </a>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
