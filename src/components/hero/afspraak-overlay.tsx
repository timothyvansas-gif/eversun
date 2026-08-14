"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image, { type StaticImageData } from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import defaultQrCode from "@/images/qr/algemeen.svg";
import whatsappIcon from "@/images/whatsapp.svg";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { CloseButton } from "@/components/ui/close-button";
import { Backdrop } from "@/components/ui/backdrop";
import { BTN_PILL_ACCENT } from "@/lib/button-styles";
import { WHATSAPP_BOOKING_URL } from "@/lib/whatsapp";

export default function AfspraakOverlay({
  isOpen,
  onClose,
  whatsappUrl = WHATSAPP_BOOKING_URL,
  qrCode = defaultQrCode,
  bankTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Booking link for both routes out of this overlay: the code and the button. */
  whatsappUrl?: string;
  /** Must encode `whatsappUrl` — the pairing is set up in `zonnebanken-data.ts`. */
  qrCode?: StaticImageData;
  /** Names the bank in the QR's alt text, for anyone who cannot see the code. */
  bankTitle?: string;
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
          <Backdrop
            onClick={onClose}
            className="z-50"
            scrollLock
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          />

          <div ref={overlayRef}>
          <m.div
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Afspraak maken"
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-page rounded-2xl z-50 w-[364px]"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.88, y: shouldReduceMotion ? 0 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 8, transition: { duration: 0.2, ease: [0.36, 0, 0.66, 0] } }}
            transition={{ type: "spring", damping: 14, stiffness: 260 }}
          >
            <div className="relative px-8 pb-6 pt-8">
              <CloseButton onClick={onClose} className="absolute top-4 right-4" />

              <h2 className="card-title text-zinc-900 text-center">Plan je zonsessie</h2>
              <p className="font-sans text-[15px] text-zinc-600 leading-[24px] mt-2 text-center">
                Scan met je telefoon, dan opent WhatsApp met je aanvraag al ingevuld.
              </p>

              <div className="bg-white rounded-2xl p-2 w-[300px] mx-auto mt-4">
                <Image
                  src={qrCode}
                  alt={
                    bankTitle
                      ? `QR code om via WhatsApp een zonsessie op de ${bankTitle} te boeken bij Ever Sun`
                      : "QR code om via WhatsApp een zonsessie te boeken bij Ever Sun"
                  }
                  width={300}
                  height={300}
                  className="w-full h-auto rounded-[8px]"
                />
              </div>

              <p className="font-sans text-[15px] text-zinc-600 leading-[24px] mt-4 text-center">
                Of gewoon vanaf dit scherm.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_PILL_ACCENT} w-full justify-center gap-2 min-h-[48px] mt-4 hover:bg-[#111111]`}
                style={{ transition: "background-color 150ms ease, transform 150ms ease" }}
              >
                <Image src={whatsappIcon} alt="" width={18} height={18} className="w-[18px] h-[18px] brightness-0 invert" />
                Open WhatsApp
              </a>

              <div className="mt-6 pt-6 border-t border-line/50 text-center">
                <p className="card-title text-zinc-900">Liever bellen?</p>
                <a
                  href="tel:+31625306491"
                  className="font-sans text-[15px] text-zinc-600 leading-[24px] mt-1 block underline decoration-dotted underline-offset-6 md:no-underline"
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
