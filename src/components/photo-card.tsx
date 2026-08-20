"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { m, AnimatePresence, useMotionValue, animate, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import imageBig from "@/images/links-home.webp";
import wastafelsImg from "@/images/wastafels.webp";
import cabinesMuurWitImg from "@/images/cabines-muur-wit.webp";
import sachetsImg from "@/images/sachets.webp";
import FotoBottomSheet from "@/components/foto-bottom-sheet";

/**
 * Inline, niet als <Image>: het bronbestand had stroke="#0B0B0B" ingebakken,
 * dus het icoon kon de kleur van zijn knop niet volgen. Met currentColor
 * bepaalt de tekstkleur van de knop nu ook het icoon, en scheelt het een
 * request.
 */
function CameraIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M2 7.8C2 6.11984 2 5.27976 2.32698 4.63803C2.6146 4.07354 3.07354 3.6146 3.63803 3.32698C4.27976 3 5.11984 3 6.8 3H17.2C18.8802 3 19.7202 3 20.362 3.32698C20.9265 3.6146 21.3854 4.07354 21.673 4.63803C22 5.27976 22 6.11984 22 7.8V16.2C22 17.8802 22 18.7202 21.673 19.362C21.3854 19.9265 20.9265 20.3854 20.362 20.673C19.7202 21 18.8802 21 17.2 21H6.8C5.11984 21 4.27976 21 3.63803 20.673C3.07354 20.3854 2.6146 19.9265 2.32698 19.362C2 18.7202 2 17.8802 2 16.2V7.8Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

import { OUTLINE_BORDER_COLOR } from "@/lib/button-styles";

const PHOTOS = [
  { src: imageBig, alt: "De balie van Ever Sun met verse bloemen, verzorgingsproducten en de lounge op de achtergrond" },
  { src: wastafelsImg, alt: "De wastafels van Ever Sun" },
  { src: sachetsImg, alt: "Sachets in de studio van Ever Sun" },
  { src: cabinesMuurWitImg, alt: "De gang langs de cabines van Ever Sun" },
];

// Per-slide mobile-only object-position: the box is narrower than these
// photos, so each one needs its own tuned crop on small screens.
const MOBILE_CROP = [
  "[object-position:28%_50%]",
  "[object-position:25%_50%]",
  "[object-position:50%_50%]",
  "[object-position:10%_50%]",
];

// Desktop (sm+) crop per slide — plain center except where tuned. The sm:
// prefix lives inside each string: Tailwind's static scanner needs the full
// class token (variant included) as one literal substring in this file, so
// building it by concatenating "sm:" with the value at runtime wouldn't
// generate the CSS.
const DESKTOP_CROP = [
  "sm:[object-position:50%_50%]",
  "sm:[object-position:50%_50%]",
  "sm:[object-position:50%_50%]",
  "sm:[object-position:50%_50%]",
];

const SLIDE_DURATION = 3.3;
const PILL_W = 56;
const DOT_W = 8;
const DOT_H = 8;
const SWIPE_THRESHOLD = 40;

export default function PhotoCard() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [active, setActive] = useState(0);
  const progress = useMotionValue(0);
  const photoBoxRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const nextIndex = (active + 1) % PHOTOS.length;

  // amount: 0 — starts the moment the box is even a pixel into the
  // viewport, not after some fraction of it has scrolled in.
  const isInView = useInView(photoBoxRef, { once: false, amount: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStarted(isInView);
  }, [isInView]);

  useEffect(() => {
    // Same rationale as the advies-card slideshow: freeze under reduced
    // motion instead of auto-advancing, and only run once the card is
    // actually in view.
    if (shouldReduceMotion) {
      progress.set(1);
      return;
    }

    if (!started) return;

    progress.set(0);
    const ctrl = animate(progress, 1, {
      duration: SLIDE_DURATION,
      ease: "linear",
      onComplete: () => setActive((p) => (p + 1) % PHOTOS.length),
    });
    return () => ctrl.stop();
  }, [active, progress, started, shouldReduceMotion]);

  const touchStartXRef = useRef<number | null>(null);
  const swipedRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;

    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    swipedRef.current = true;
    setActive((p) => (dx < 0 ? (p + 1) % PHOTOS.length : (p - 1 + PHOTOS.length) % PHOTOS.length));
  };

  const handlePhotoClick = () => {
    // A swipe fires a click on release too; skip opening the sheet for that
    // one tap so a swipe doesn't also pop it open.
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }
    setSheetOpen(true);
  };

  return (
    <>
      <div
        className="relative w-full h-[362px] xl:h-[431px] bg-white rounded-[12px] flex flex-col justify-between"
        style={{ padding: 'clamp(24px, 4vw, 40px)' }}
      >
        {/* One photo, at every width. It used to be a three-tile mosaic — a wide
            one over two halves on phones, a wide beside a single from md — and
            the grid/flex pair of layouts existed only to arrange those. With a
            single tile there is nothing left to arrange, so the container is a
            plain box and the button simply fills it.

            The photo button carries focus-ring-clipped: it runs edge to edge
            inside this rounded, clipping box, so the site's outward focus ring
            would be cut off. See globals.css. The "Meer" pill sits 12px inside
            the clip and keeps the normal ring. */}
        <div ref={photoBoxRef} className="relative mb-4 h-[220px] xl:h-[270px] rounded-[8px] overflow-hidden">
          <button
            className="focus-ring-clipped relative block w-full h-full cursor-pointer touch-pan-y"
            onClick={handlePhotoClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-label="Alle foto's bekijken"
          >
            <AnimatePresence initial={false}>
              <m.div
                key={active}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src={PHOTOS[active].src}
                  alt={PHOTOS[active].alt}
                  fill
                  // Phones see only the middle ~50% of this photo — the box is 1.27
                  // wide against the image's 2.53 — and the centre landed on the
                  // white shelf and the glass bowl, the coolest corner of the room.
                  // Shifting the window left to 28% brings the lit lounge into it
                  // and still keeps the vase and bottles at the right edge; 0% was
                  // too far and cut the bottles in half. Both sides are written as
                  // the same arbitrary property so the sm rule reliably wins.
                  // Each slide gets its own crop below and above the sm
                  // breakpoint — the two boxes have different proportions,
                  // so a shift tuned for one axis doesn't carry to the other.
                  className={`object-cover ${MOBILE_CROP[active]} ${DESKTOP_CROP[active]}`}
                  sizes="(max-width: 768px) 100vw, 772px"
                  quality={90}
                />
              </m.div>
            </AnimatePresence>
          </button>

          {/* Silent fetch for the slide that's coming up next: same fill +
              sizes + quality as the real render above, so it resolves to the
              exact same optimizer URL and is already cached by the time
              AnimatePresence mounts it for real. loading="eager" (not
              priority) — it should fetch now without claiming to be the
              page's LCP image or emitting a <link rel=preload>. */}
          <Image
            key={`preload-${nextIndex}`}
            src={PHOTOS[nextIndex].src}
            alt=""
            aria-hidden="true"
            fill
            loading="eager"
            sizes="(max-width: 768px) 100vw, 772px"
            quality={90}
            className="hidden"
          />
          <button
            className="md:hidden absolute bottom-3 right-3 z-10 flex items-center gap-2 text-sm font-medium cursor-pointer rounded-full text-ink-primary bg-white px-[14px] py-1.5"
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            Alle foto&apos;s
            <CameraIcon size={16} />
          </button>

          {/* Carousel progress: the active slot is a pill that fills left to
              right over SLIDE_DURATION; the other two are empty ovals. When
              it completes, that pill shrinks to an oval and the next slot
              grows into the filling pill — the role moves, the slots don't. */}
          <div
            className="absolute bottom-3 left-3 md:left-6 z-10 h-8 flex items-center gap-1.5 pointer-events-none"
            aria-hidden="true"
          >
            {PHOTOS.map((_, i) => {
              const isActive = i === active;
              return (
                <m.div
                  key={i}
                  className="relative overflow-hidden rounded-full"
                  style={{ height: DOT_H, border: "1px solid white" }}
                  animate={{ width: isActive ? PILL_W : DOT_W }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                >
                  <m.div
                    className="absolute inset-0 rounded-full bg-white"
                    style={{ scaleX: isActive ? progress : 0, transformOrigin: "left" }}
                  />
                </m.div>
              );
            })}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="card-title text-zinc-900">Een warm welkom</h3>
            <p className="card-body text-zinc-500 mt-1">
              Geen haast, geen verplichting: jouw moment van rust begint hier
            </p>
          </div>
          <button
            // Niet BTN_OUTLINE_BORDER: die hovert naar zinc-900, en hier gaan
            // label en icoon naar ink-primary. In rust dragen ze de kleur van
            // de bodytekst ernaast (zinc-500), zodat de knop meeleest met de
            // kaart in plaats van erbovenop te liggen. Het icoon volgt vanzelf:
            // CameraIcon tekent met currentColor. Alleen de rand-hover uit de
            // gedeelde constante overnemen, zonder !important dat die hover zou
            // moeten overschrijven.
            className={`hidden md:flex items-center gap-2 text-sm font-medium whitespace-nowrap ml-4 cursor-pointer rounded-full border ${OUTLINE_BORDER_COLOR} hover:border-ink-primary text-zinc-500 hover:text-ink-primary transition-colors duration-150 px-[20px] py-[10px] translate-y-[10px]`}
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            Alle foto&apos;s
            <CameraIcon size={20} />
          </button>
        </div>
      </div>

      <FotoBottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
