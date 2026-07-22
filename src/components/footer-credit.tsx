"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import timothyPhoto from "@/images/timothy.webp";

const EMAIL = "timothyvansas@gmail.com";

export default function FooterCredit() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    // Land keyboard focus inside the popover.
    closeRef.current?.focus();

    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <span ref={ref} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="underline decoration-dotted underline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 rounded-sm transition-colors cursor-pointer"
        style={{ color: "inherit" }}
      >
        Realisatie Timothy
      </button>

      <AnimatePresence>
        {open && (
          <m.span
            role="dialog"
            aria-label="Contact Timothy van Sas"
            className="block fixed bottom-16 left-6 right-6 origin-bottom md:absolute md:bottom-full md:left-0 md:right-auto md:mb-3 md:w-[340px] md:origin-bottom-left rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 z-50 text-left"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98, y: shouldReduceMotion ? 0 : 6, transition: { duration: 0.15, ease: [0.36, 0, 0.66, 0] } }}
            transition={{ type: "spring", damping: 20, stiffness: 320 }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Sluiten"
              className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full border border-transparent text-[22px] leading-none text-[#1a1a1a]/50 hover:text-[#1a1a1a] hover:border-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors duration-150 cursor-pointer"
            >
              ×
            </button>

            <span className="flex items-center gap-5">
              <Image
                src={timothyPhoto}
                alt="Timothy van Sas"
                width={80}
                height={80}
                className="block h-[80px] w-[80px] shrink-0 rounded-[12px] object-cover bg-neutral-200"
              />

              <span className="block min-w-0">
                <span className="block text-[#000] text-[17px] font-semibold leading-[1.2] font-sans">
                  Timothy van Sas
                </span>
                <span className="block text-[#000] text-[15px] font-normal leading-[1.2] font-sans mt-1">
                  Product/UX designer
                </span>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-block mt-2.5 text-[15px] font-sans underline underline-offset-2 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#046ADF] rounded-sm transition-opacity"
                  style={{ color: "#046ADF" }}
                >
                  Contact
                </a>
              </span>
            </span>
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}
