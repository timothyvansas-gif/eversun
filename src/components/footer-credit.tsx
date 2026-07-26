"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { CloseButton } from "@/components/ui/close-button";
import timothyPhoto from "@/images/timothy.webp";

// base64 of the address. atob() is decoded at runtime and is not
// constant-folded by the bundler, so the plaintext email never appears in
// the built JS or the server HTML (the popover is client-only and starts
// closed) — keeping it out of reach of email harvesters.
const EMAIL_B64 = "dGltb3RoeXZhbnNhc0BnbWFpbC5jb20=";

export default function FooterCredit() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    // Land focus inside the popover without ring-flashing a control: focus the
    // dialog container (tabIndex -1), not the close button. After a keyboard
    // ESC the focus-visible modality stays "keyboard", so focusing the × here
    // would draw a ring on it every reopen.
    dialogRef.current?.focus({ preventScroll: true });

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
        className="underline decoration-dotted underline-offset-2 hover:text-white focus-visible:[outline:none]! focus-visible:text-white rounded-sm transition-colors cursor-pointer"
      >
        Realisatie Timothy
      </button>

      <AnimatePresence>
        {open && (
          <m.span
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-label="Contact Timothy van Sas"
            // Programmatic focus target, not a control: kill its own ring
            // (inline beats the unlayered global *:focus-visible rule, which no
            // Tailwind utility can). The × and Contact keep their rings.
            style={{ outline: "none" }}
            className="block fixed bottom-16 left-6 right-6 origin-bottom md:absolute md:bottom-full md:left-1/2 md:ml-[-170px] md:right-auto md:mb-3 md:w-[340px] rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 z-50 text-left"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98, y: shouldReduceMotion ? 0 : 6, transition: { duration: 0.15, ease: [0.36, 0, 0.66, 0] } }}
            transition={{ type: "spring", damping: 20, stiffness: 320 }}
          >
            <CloseButton onClick={close} size="sm" className="absolute top-3 right-3" />

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
                  href={`mailto:${atob(EMAIL_B64)}?subject=${encodeURIComponent("Ik wil ook een gave website")}`}
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
