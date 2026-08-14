"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { DRAG_ELASTIC, STACK_SPRING } from "@/components/hero/sheet-stack";
import whatsappIcon from "@/images/whatsapp.svg";
import { CloseButton } from "@/components/ui/close-button";
import { CtaLink } from "@/components/huidtest/cta";
import { StepCard } from "@/components/huidtest/step-card";
import { useHuidtestSurface } from "@/components/huidtest/surface-context";
import { BOEKEN, TELEFOON } from "@/lib/huidtest/config";

/**
 * Booking, as a sheet inside the test rather than a modal on top of it.
 *
 * The site's own QR overlay was the obvious thing to reuse, and it was wrong
 * here: it brought its own full-page scrim, so opening it from the test put a
 * backdrop on a backdrop and dimmed the panel the visitor was reading. This
 * slides up from the bottom edge of that same panel instead — one surface, one
 * dim, and the advice stays legible above it.
 *
 * It covers the action bar on the way up, which is the point: the button that
 * opened it should not still be sitting there waiting to be pressed again.
 *
 * The QR is desktop-only. A phone taps straight through to WhatsApp and has no
 * use for a code it would have to scan with itself.
 */
export function BookingSheet({
  isOpen,
  onClose,
  whatsappUrl,
  qrSvg,
  bankTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  whatsappUrl: string;
  /** Drawn at call time, because the advice's message is not a committed asset. */
  qrSvg?: string;
  bankTitle: string;
}) {
  const { element: surface } = useHuidtestSurface();
  const [target, setTarget] = useState<HTMLElement | null>(null);

  // The portal needs a document, and on the route it needs the body rather than
  // a panel that is not there.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTarget(surface ?? document.body);
  }, [surface]);

  // Escape belongs to the sheet while it is up. Captured, because the panel's
  // own focus trap is listening too and would otherwise close the whole test
  // from under it.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  if (!target) return null;

  // Inside a panel the sheet is measured against that panel; on the route there
  // is no panel, and the viewport's own bottom edge is the right one.
  const pin = surface ? "absolute" : "fixed";

  const sheet = (
    <AnimatePresence>
      {isOpen && (
      <>
      {/* Only as far as the surface goes. The page behind the test is already
          dimmed by the test's own backdrop; dimming it twice is what this
          component exists to stop. */}
      <m.div
        onClick={onClose}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={`${pin} inset-0 z-10 cursor-pointer bg-black/35`}
      />

      {/* The site's own sheet motion, so this arrives the way every other sheet
          here does: a spring in, a shorter slide out. Dragging it back down
          closes it too, which is the gesture a sheet on a phone invites. */}
      <m.div
        role="dialog"
        aria-modal="true"
        aria-label="Plan je zonsessie"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
        transition={STACK_SPRING}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: DRAG_ELASTIC }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 400) onClose();
        }}
        className={`${pin} inset-x-0 bottom-0 z-20 mx-auto max-w-[520px] rounded-t-[20px] bg-surface-page px-6 pb-10 pt-5`}
      >
        {/* Its own row, not a button floated over the corner of the card: on
            the card it collided with the heading's box and read as damage. */}
        <div className="mb-3 flex justify-end">
          <CloseButton onClick={onClose} label="Sluit plannen" />
        </div>

        <StepCard>
        <h2 className="card-title text-center text-zinc-900">{BOEKEN.kop}</h2>

        <>
            <p className="mt-2 text-center font-sans text-[15px] leading-[24px] text-zinc-600">
              {BOEKEN.qrUitleg}
            </p>

            <div className="mx-auto mt-4 w-[220px]">
              {qrSvg ? (
                // The markup is ours — module rectangles and the glyph, with the
                // URL woven into the pattern rather than into the SVG — which is
                // what makes injecting it safe.
                <div
                  role="img"
                  aria-label={`QR code om via WhatsApp een zonsessie op de ${bankTitle} te boeken bij Ever Sun`}
                  className="w-full [&>svg]:h-auto [&>svg]:w-full [&>svg]:rounded-[8px]"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="aspect-square w-full animate-pulse rounded-[8px] bg-line/30" />
              )}
            </div>

            <p className="mt-4 text-center font-sans text-[15px] leading-[24px] text-zinc-600">
              {BOEKEN.ofHier}
            </p>
        </>

        <CtaLink
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full gap-2"
        >
          <Image
            src={whatsappIcon}
            alt=""
            width={18}
            height={18}
            className="h-[18px] w-[18px] brightness-0 invert"
          />
          {BOEKEN.whatsapp}
        </CtaLink>

        <div className="mt-5 border-t border-line/50 pt-4 text-center">
          <p className="card-title text-zinc-900">{BOEKEN.bellen}</p>
          <a
            href={TELEFOON.href}
            className="mt-1 block font-sans text-[15px] leading-[24px] text-zinc-600 underline decoration-dotted underline-offset-6"
          >
            {TELEFOON.weergave}
          </a>
        </div>
        </StepCard>
      </m.div>
      </>
      )}
    </AnimatePresence>
  );

  return createPortal(sheet, target);
}
