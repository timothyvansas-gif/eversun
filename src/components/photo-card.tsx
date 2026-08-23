"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { m, AnimatePresence, useMotionValue, animate, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import imageBig from "@/images/links-home.webp";
import wastafelsImg from "@/images/wastafels.webp";
import cabinesMuurWitImg from "@/images/cabines-muur-wit.webp";
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
  { src: cabinesMuurWitImg, alt: "De gang langs de cabines van Ever Sun" },
];

// Per-slide mobile-only object-position: the box is narrower than these
// photos, so each one needs its own tuned crop on small screens.
const MOBILE_CROP = [
  "[object-position:28%_50%]",
  // Was 25%. Box shows ~76% of this photo's width regardless of X (the
  // other ~24% stays hidden) — 45% shifts that window right, trading dead
  // wall on the right for a touch more crop on the candles' side.
  "[object-position:45%_50%]",
  "[object-position:10%_50%]",
];

// Desktop (sm+) crop per slide — plain center except where tuned. The sm:
// prefix lives inside each string: Tailwind's static scanner needs the full
// class token (variant included) as one literal substring in this file, so
// building it by concatenating "sm:" with the value at runtime wouldn't
// generate the CSS.
const DESKTOP_CROP = [
  "sm:[object-position:50%_50%]",
  // From sm up this box is wider than the photo, so only the vertical axis
  // crops (~152px of slack at the xl size). Centered took ~76px off top and
  // bottom evenly; 80% takes ~121px off the top instead, shifting the
  // visible window down toward the sinks and countertop.
  "sm:[object-position:50%_80%]",
  "sm:[object-position:50%_50%]",
];

// Crop per slide for the peek slot only. That slot is roughly square against
// these 2.53-wide photos, so it shows less than half their width and needs a
// framing of its own — no variant prefix, because the slot itself does not
// exist below md.
const PEEK_CROP = [
  // The far left of this photo: the poster, the lounge and the low table,
  // with the copper vase just entering on the right. The bottles are the
  // wide slot's business — this window shows the room they stand in. 16%
  // holds that framing at both box heights: the slot is 235x270 from xl and
  // 235x220 below it, so it shows 34% of the photo's width there and 42%
  // here, and the vase has to land inside the narrower of the two.
  "[object-position:16%_50%]",
  // Not 55%: that put the window's left edge straight through the back bowl.
  // The two bowls span 130-450 of 900 and the window is 576 wide, so it has
  // to start left of 130 to hold both, which caps X at 40%.
  //
  // The only slide here that zooms. Vertically this photo has no slack — at
  // 1.67 wide against a window of 0.87 it already fits its full height, so Y
  // does nothing — and the bowls sat low with dead wall above them. Scaling
  // from the bottom edge lifts them into the frame and trims that wall
  // instead. It costs width too, which is why X drops to 22%: the zoom pulls
  // both sides in by 3% and the back bowl has no margin to spare.
  "[object-position:22%_50%] scale-[1.08] origin-bottom",
  // The open cabin with the purple light inside, the wall lamp, and the end
  // door with its sign holding the right edge. Anchored on that sign: it sits
  // at 73% of the photo's width, so the window has to reach it from xl too,
  // where it is only 34% wide.
  "[object-position:60%_50%]",
];

// Two slots from md: wide | 1px seam | peek, in the 536 : 235 ratio this card
// carried before it collapsed to a single tile, as percentages of the box so
// no width has to be measured. Below md the wide slot runs the full width and
// the peek is not rendered.
//
// The seam is a painted border on the peek, not a gap between the two. Leaving
// them 0.13% apart put a 1px sliver of card between them that rounded away on
// a 2x screen — the two edges landed on the same device pixel and the line
// disappeared. A border always paints.
const WIDE_SLOT =
  "absolute inset-y-0 left-0 right-0 md:right-[30.44%] overflow-hidden";
// overflow-hidden is load-bearing, not decoration: the wastafels slide scales
// itself up inside this slot, and without a clip that zoom spilled left over
// the seam and made the slot look like it had grown. The window is fixed; only
// the photo inside it moves.
const PEEK_SLOT =
  "hidden md:block absolute inset-y-0 right-0 w-[30.44%] overflow-hidden border-l border-white";

// The two slots do not cross at the same instant: the peek changes first and
// the wide slot follows a beat later, so the card reads as two photos taking
// their own turn instead of one switch thrown twice. The beat is in the state
// itself — the two slots hold their own index and the tick moves them 350ms
// apart — not in the animations. That keeps the indicator honest for free:
// it marks the wide slot, and it moves when the wide slot's index does.
// Desktop: the arriving photo slides in from the right edge of its own slot
// and covers the one already there, which drifts a little to the left under
// it. The drift is what sells the overlap — two planes at different speeds
// rather than one sheet swapping — and it also keeps the outgoing photo
// mounted for the whole move, since an exit that animates nothing unmounts
// on the spot and would leave a hole under the incoming slide.
//
// A spring rather than a curve: `bounce` is the damping, and at 0.1 the
// photo settles with a hint of overshoot instead of stopping dead.
// One knob for the whole move. Everything else is derived from it, so slowing
// the carousel down cannot quietly break the hand-off.
const SLIDE_SEC = 1.4;

// A phone moves one window over less distance, so a shorter clock was the
// obvious call -- but every shortening cost the spring its settle and the swap
// read as a snap. Same clock as desktop, then: the damping is the point, not
// the speed. Kept as its own name so the phone can be tuned back off desktop.
const MOBILE_SEC = SLIDE_SEC;

const SPRING = { type: "spring" as const, duration: SLIDE_SEC, bounce: 0.1 };
const SPRING_MOBILE = { ...SPRING, duration: MOBILE_SEC };

// Desktop moves both windows at once, so there is no beat to wait out there.
// The phone still needs one: its single window changes the moment the pill
// fills, and without a pause the photo swaps under the indicator's reset.
const MOBILE_STAGGER_MS = Math.round(SLIDE_SEC * 100);
/**
 * The arriving photo enters from the side the carousel is heading toward and
 * covers the one already there, which sinks away underneath it.
 *
 * `dir` is what makes a backwards swipe read as backwards: auto-advance always
 * runs forward, but a swipe to the right walks the list back, and entering
 * from the right there would fight the finger. It has to travel as a variant
 * with `custom` rather than as a plain prop, because a leaving child keeps the
 * props of its last render — its exit would still point the old way.
 *
 * `exitPct` is how far the outgoing photo travels. The wide slot only drifts,
 * because the overlap is the effect there. The peek clears out completely: its
 * photo has to be seen leaving through the seam, since that is the photo the
 * wide slot is about to receive, and a drift left it hanging there and broke
 * the hand-off.
 */
const slide = (dir: number, exitPct: number, transition: typeof SPRING) => ({
  custom: dir,
  variants: {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%" }),
    center: { x: 0 },
    exit: (d: number) => ({ x: `${d > 0 ? -exitPct : exitPct}%` }),
  },
  initial: "enter",
  animate: "center",
  exit: "exit",
  transition,
});

const SLIDE_DURATION = 3;

// How far into the pass the advies card is allowed to take over (see
// `onHandoff`). Keep it under 1: at 1 the point falls outside the last dwell
// and nothing would ever schedule it.
const HANDOFF = 0.8;
const PILL_W = 56;
const DOT_W = 8;
const DOT_H = 8;
const SWIPE_THRESHOLD = 40;

/**
 * `onHandoff` fires once the carousel is HANDOFF of the way through its single
 * pass. The bento uses it to hold the advies card's slideshow until this one
 * has had its turn, so the row does not have two things moving at once.
 */
export default function PhotoCard({ onHandoff }: { onHandoff?: () => void } = {}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  // Two indices, always one apart: `active` drives the wide slot and the
  // indicator, `peek` runs one photo ahead in the narrow slot and hands its
  // photo over on the next tick.
  const [active, setActive] = useState(0);
  const [peek, setPeek] = useState(1);
  const progress = useMotionValue(0);
  const photoBoxRef = useRef<HTMLDivElement>(null);
  // Advances made so far. On desktop the carousel walks the list once and parks
  // on the photo it opened with, so this counts ticks rather than tracking a "done"
  // flag: a ref costs no render and, more to the point, no effect dep — and
  // the effect below must NOT re-run when the pass ends, because on mobile its
  // cleanup would clear the stagger timer that still has to land the last tick.
  const ticksRef = useRef(0);
  // Through a ref, not straight off the prop: the handoff below lives inside an
  // effect, and a caller passing an inline arrow would change the dep on every
  // render — restarting the dwell and, on mobile, clearing the stagger timer.
  const onHandoffRef = useRef(onHandoff);
  useEffect(() => {
    onHandoffRef.current = onHandoff;
  });
  const [started, setStarted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  // State, not a ref: it decides what gets rendered, and it is always set in
  // the same breath as the index it belongs to, so the two land in one render.
  const [dir, setDir] = useState(1);
  // Both windows now make the same move on the same clock, so the peek gets
  // the wide slot's config: enter from its own right edge, let the outgoing
  // photo sink away underneath. Its old full-width exit and shorter spring
  // only existed to sell the hand-off, and there is no hand-off left to sell.
  const motion = slide(dir, 15, isMobile ? SPRING_MOBILE : SPRING);

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

    // Full pass done: park here. `active` is back at 0 and the pill stays
    // filled instead of resetting, so the indicator reads as finished rather
    // than as a beat about to start. Desktop only — parking exists because the
    // card sits in a grid next to other moving things, and on a phone the bento
    // is a single stacked column where this card is the only thing on screen.
    // Nothing to compete with there, so it keeps going round.
    if (!isMobile && ticksRef.current >= PHOTOS.length) {
      progress.set(1);
      return;
    }

    progress.set(0);

    // How far into THIS dwell the pass as a whole crosses HANDOFF. Negative
    // means it already passed (nothing left to schedule), a full dwell or more
    // means it lands in a later one. Only the dwell that actually contains the
    // point schedules the call, so it fires once per pass — and it re-arms
    // correctly if the dwell restarts after the card scrolls back into view.
    const handoffIn = (HANDOFF * PHOTOS.length - ticksRef.current) * SLIDE_DURATION;
    let handoff: ReturnType<typeof setTimeout> | undefined;
    if (handoffIn >= 0 && handoffIn < SLIDE_DURATION) {
      handoff = setTimeout(() => onHandoffRef.current?.(), handoffIn * 1000);
    }

    let timer: ReturnType<typeof setTimeout>;
    const ctrl = animate(progress, 1, {
      duration: SLIDE_DURATION,
      ease: "linear",
      onComplete: () => {
        ticksRef.current += 1;
        setDir(1);
        setPeek((p) => (p + 1) % PHOTOS.length);
        // Desktop advances in the same breath, so both windows start on the
        // same render and therefore the same frame. A setTimeout of 0 would
        // still cost a macrotask and could hand the peek a frame's head start.
        if (isMobile) {
          timer = setTimeout(() => setActive((p) => (p + 1) % PHOTOS.length), MOBILE_STAGGER_MS);
        } else {
          setActive((p) => (p + 1) % PHOTOS.length);
        }
      },
    });

    // The indicator follows `active`, so on desktop it now resets in the same
    // frame as both photos, and on mobile it still waits out the stagger.
    return () => {
      ctrl.stop();
      clearTimeout(timer);
      clearTimeout(handoff);
    };
  }, [active, progress, started, shouldReduceMotion, isMobile]);

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
    // A swipe moves both slots at once — no stagger to wait out when the
    // visitor is the one asking.
    setDir(dx < 0 ? 1 : -1);
    const step = dx < 0 ? 1 : PHOTOS.length - 1;
    setActive((p) => (p + step) % PHOTOS.length);
    setPeek((p) => (p + step) % PHOTOS.length);
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
        {/* Two slots from md, one photo below it. Neither slot moves: each is
            a fixed window that crossfades its own photo, the way the advies
            card does. On a tick the wide slot fades to the photo the peek was
            showing and the peek fades to the one after it, so the pair walks
            the list together and every photo passes through both slots.

            The peek doubles as the preload it replaced: the next photo is
            mounted a full slide before the wide slot ever needs it, and on
            mobile — where the slot is display:none — it still loads.

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
            <div className={WIDE_SLOT}>
              <AnimatePresence initial={false} custom={dir}>
                <m.div key={active} className="absolute inset-0" {...motion}>
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
                    sizes="(max-width: 768px) 100vw, 536px"
                    quality={90}
                  />
                </m.div>
              </AnimatePresence>
            </div>

            <div className={PEEK_SLOT}>
              <AnimatePresence initial={false} custom={dir}>
                <m.div key={peek} className="absolute inset-0" {...motion}>
                  <Image
                    src={PHOTOS[peek].src}
                    alt={PHOTOS[peek].alt}
                    fill
                    className={`object-cover ${PEEK_CROP[peek]}`}
                    // Below md this slot is display:none but still loads, and
                    // that is the point: at 100vw it pulls the exact file the
                    // wide slot will ask for one slide later, which is the
                    // preload the phone would otherwise have lost.
                    sizes="(max-width: 768px) 100vw, 235px"
                    quality={90}
                  />
                </m.div>
              </AnimatePresence>
            </div>
          </button>

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
            <h3 className="card-title text-zinc-900">Binnenkijken bij Ever Sun</h3>
            <p className="card-body text-zinc-500 mt-1">
              Stap alvast binnen en zie waar jouw moment van rust begint
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
