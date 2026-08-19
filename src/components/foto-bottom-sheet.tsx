"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { arrangeForSlots, type Slot } from "@/lib/sheet-layout";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { Backdrop } from "@/components/ui/backdrop";
import { CloseButton } from "@/components/ui/close-button";
import dummyImg from "@/images/impressie/dummy.webp";
import dummy2Img from "@/images/impressie/dummy-2.webp";
import dummy3Img from "@/images/impressie/dummy-3.webp";
import dummy4Img from "@/images/impressie/dummy-4.webp";
import tafelImg from "@/images/tafel.webp";
import wastafelsImg from "@/images/wastafels.webp";

/**
 * A photo, what it shows, and where to hold it while cropping.
 *
 * The alt is per photo rather than generated, so a screen reader gets the room
 * instead of "impressie 7".
 *
 * `focus` is an object-position value and only matters where the tile crops
 * hard — a landscape shot in a single tile loses half its width, and a centred
 * crop lands wherever it lands. Leave it off and the crop stays centred.
 */
type SheetPhoto = { src: StaticImageData; alt: string; focus?: string };

// Order is reading order, nothing else. arrangeForSlots fits this list to the
// mosaic below, so adding, removing or reordering photos cannot put a portrait
// shot in a wide tile. Dummies are placeholders and go as real photos arrive.
export const sheetPhotos: SheetPhoto[] = [
  { src: tafelImg, alt: "De leestafel van massief hout met tijdschriften" },
  {
    src: wastafelsImg,
    alt: "De wastafels met zwarte glazen kommen en een verlichte spiegel",
    // In a single tile only half this photo's width survives. Centred, that
    // half is the wall to the right of the bowls; held near the left edge it is
    // both bowls, the candles and the mirror. 15% rather than 0 so the frame
    // does not sit hard against the left wall.
    focus: "15% center",
  },
  { src: dummy2Img, alt: "Impressie van de zonnestudio" },
  { src: dummy3Img, alt: "Impressie van de zonnestudio" },
  { src: dummy4Img, alt: "Impressie van de zonnestudio" },
  { src: dummyImg, alt: "Impressie van de zonnestudio" },
  { src: dummy2Img, alt: "Impressie van de zonnestudio" },
  { src: dummy3Img, alt: "Impressie van de zonnestudio" },
  { src: dummy4Img, alt: "Impressie van de zonnestudio" },
  { src: dummyImg, alt: "Impressie van de zonnestudio" },
  { src: dummy2Img, alt: "Impressie van de zonnestudio" },
  { src: dummy3Img, alt: "Impressie van de zonnestudio" },
  { src: dummy4Img, alt: "Impressie van de zonnestudio" },
  { src: dummyImg, alt: "Impressie van de zonnestudio" },
];

// Column spans on the desktop grid, repeating every seven tiles: a wide one
// beside a single, then three singles, then a single beside a wide. Every row
// adds up to the full three columns, so the mosaic never leaves a hole and no
// tile has to be reordered to fill one.
//
// Rows are all the same height — the variety comes from the wide tiles, not
// from differing row heights. The singles carry the aspect ratio and so set
// that height; a wide tile is left to stretch into it.
const LG_SPANS: Slot[] = [2, 1, 1, 1, 1, 1, 2];

// Photos are written above in reading order and fitted to the pattern here, so
// nobody has to count slots while adding one. A static import carries the
// file's own width and height, which is all arrangeForSlots needs to keep a
// portrait shot out of a wide tile. Every photo in the sheet is landscape
// today, so this currently returns the list untouched.
const arranged = arrangeForSlots(
  sheetPhotos.map((photo) => ({ ...photo, width: photo.src.width, height: photo.src.height })),
  LG_SPANS,
);

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

  const handleClose = () => {
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
                <div className="hidden md:flex shrink-0">
                  <CloseButton onClick={handleClose} />
                </div>
              </div>
              <div
                className="w-full max-w-[1280px] mx-auto px-6 md:px-8 pb-4 md:pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start overflow-y-auto min-h-0"
                style={{ overscrollBehavior: "contain" }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {arranged.map((photo, i) => {
                  const wide = LG_SPANS[i % LG_SPANS.length] === 2;
                  return (
                    <div
                      key={i}
                      // One aspect utility per breakpoint, never two competing
                      // at the same one: which of a pair wins comes down to the
                      // order Tailwind emits them, not the order they are
                      // written here.
                      //
                      // Below lg every tile is 16/9 whatever its photo is: one
                      // column, one shape, so the scroll keeps an even rhythm.
                      className={`relative w-full shrink-0 aspect-[16/9] ${
                        wide ? "lg:col-span-2 lg:aspect-auto" : "lg:aspect-[5/6]"
                      }`}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        placeholder="blur"
                        className="object-cover rounded-[12px]"
                        style={photo.focus ? { objectPosition: photo.focus } : undefined}
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
    </>,
    document.body
  );
}
