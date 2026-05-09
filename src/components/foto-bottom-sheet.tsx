"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import dummyImg from "@/images/impressie/dummy.webp";

export default function FotoBottomSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

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
            className="fixed inset-0 z-50 md:hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <div ref={sheetRef} tabIndex={-1} className="outline-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Alle foto's"
              className="md:hidden fixed bottom-0 inset-x-0 bg-[#FAF4EC] rounded-t-[20px] z-50 h-[90vh] flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
              transition={{ type: "spring", damping: 40, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) onClose();
              }}
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing shrink-0">
                <div className="w-10 h-1 rounded-full bg-[#1a1a1a]/20" />
              </div>
              <div className="px-6 pt-5 pb-4 shrink-0">
                <h2 className="card-title text-zinc-900">Alle foto&apos;s</h2>
                <p className="font-sans text-[15px] text-[#1a1a1a]/60 leading-[24px] mt-[6px]">
                  Kloekhorststraat 4a, Assen, 9401 BD
                  <br />
                  <a href="tel:+31625306491" className="text-[#1a1a1a]/60">06 25306491</a>
                </p>
              </div>
              <div
                className="px-6 pb-4 flex flex-col gap-4 overflow-y-auto"
                style={{ overscrollBehavior: "contain" }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="relative w-full shrink-0" style={{ paddingBottom: "66.67%" }}>
                    <Image
                      src={dummyImg}
                      alt={`Impressie Ever Sun zonnestudio ${i + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="100vw"
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
