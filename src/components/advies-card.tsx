"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { m, AnimatePresence, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import manAdvies from "@/images/people/man-advies.webp";
import meisjeRood from "@/images/people/meisje-rood-advies.webp";
import vrouwOuder from "@/images/people/vrouw-ouder-advies.webp";

const GRADIENT =
  "linear-gradient(78deg, rgba(0,0,0,0.70) 6.7%, rgba(0,0,0,0.70) 26.82%, rgba(0,0,0,0.49) 42.53%, rgba(0,0,0,0.00) 62.73%)";

const SLIDES = [
  { image: meisjeRood },
  { image: manAdvies },
  { image: vrouwOuder },
];

const DURATION = 4.5;

// De ring begint leeg. Hij stond op een tiende gevuld, omdat een aftelling die
// bij niets begint kapot kan lijken, maar dat kostte de eerste 10% van de sweep
// en op deze kaart weegt dat zwaarder: hij loopt maar één keer per dwell.
const THUMB = 44;
const OVERLAP = 16;
const GAP = 12;
const R = 26;
const STROKE = 2;
const RING = (R + STROKE) * 2;
const CIRC = 2 * Math.PI * R;

const SLOT_FIRST = 0;
const SLOT_SECOND = THUMB - OVERLAP;
const SLOT_ACTIVE = SLOT_SECOND + THUMB + GAP;
const CONTAINER_W = SLOT_ACTIVE + THUMB;

export default function AdviesCard() {
  const [active, setActive] = useState(0);
  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, [0, 1], [CIRC, 0]);

  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 1279px)");
  const [started, setStarted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const isInView = useInView(containerRef, {
    // Desktop waits until 60% of the card is in the viewport. At 0.01 the
    // slideshow started the moment its top edge appeared, so the first slide
    // had largely played out before the card was even worth looking at. It ran
    // at 0.8 for a while, back when the photo carousel next to it played by
    // itself and the two had to take turns; now that the carousel only runs
    // when someone presses Play, there is nothing to wait for and the number
    // only has to mean "worth looking at".
    // Mobile keeps its own pair of numbers: the card fills far more of a
    // phone screen, so 20% plus a 300ms delay already lands it in view.
    //
    // once, because the same threshold decides both directions. At 0.8 the
    // ring froze as soon as the card dipped under 80% visible — still plainly
    // on screen — and rewound to zero on the way back up. A latch keeps the
    // waiting to the first arrival, which is all it was ever for.
    once: true,
    amount: isMobile ? 0.2 : 0.6,
  });

  useEffect(() => {
    if (!isInView) return;
    const delay = isMobile ? 300 : 0; // Immediate on desktop (0 delay)
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [isInView, isMobile]);

  useEffect(() => {
    // The slideshow advances itself every 4.5s and then starts over, which is
    // the longest-running motion on the page. Under reduced motion it does not
    // run at all: the thumbnails below are already the control, so the photo
    // changes when the visitor asks for it. The ring stops being a countdown and
    // simply sits closed around the active thumbnail, marking which one shows.
    if (shouldReduceMotion) {
      progress.set(1);
      return;
    }

    if (!started) return;

    progress.set(0);
    const ctrl = animate(progress, 1, {
      duration: DURATION,
      ease: "linear",
      onComplete: () => setActive((p) => (p + 1) % SLIDES.length),
    });
    return () => ctrl.stop();
  }, [active, progress, started, shouldReduceMotion]);

  const first = (active + 1) % SLIDES.length;
  const second = (active + 2) % SLIDES.length;

  const getX = (i: number) => {
    if (i === active) return SLOT_ACTIVE;
    if (i === first) return SLOT_FIRST;
    return SLOT_SECOND;
  };

  const getZ = (i: number) => {
    if (i === active) return 3;
    if (i === second) return 2;
    return 1;
  };

  return (
    <div ref={containerRef} className="w-full h-[362px] bg-ink-strong rounded-[12px] overflow-hidden relative">
      <AnimatePresence initial={false}>
        <m.div
          key={active}
          className="absolute inset-0"
          style={{
            background: `${GRADIENT}, url(${SLIDES[active].image.src}) lightgray center / cover no-repeat`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>

      <div
        className="absolute z-10"
        style={{ top: "clamp(24px, 4vw, 40px)", left: "clamp(24px, 4vw, 40px)" }}
      >
        <h3 className="card-title text-white">Persoonlijk advies</h3>
        <p className="card-body text-white/90 mt-1">Afgestemd op jouw unieke huid</p>
      </div>

      <div
        className="absolute bottom-[30px] md:bottom-[52px] xl:bottom-[40px] z-10"
        style={{ left: 'clamp(24px, 4vw, 40px)', width: CONTAINER_W, height: THUMB }}
      >
        {/* Ring — static at active slot */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: SLOT_ACTIVE - (RING - THUMB) / 2,
            top: -(RING - THUMB) / 2,
            width: RING,
            height: RING,
            zIndex: 10,
          }}
        >
          <svg width={RING} height={RING} style={{ transform: "rotate(-90deg)" }}>
            <m.circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth={STROKE}
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {SLIDES.map((slide, i) => (
          <m.button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Bekijk foto ${i + 1}`}
            className="absolute top-0 rounded-full overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            initial={{ x: getX(i) }}
            animate={{ x: getX(i) }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{
              width: THUMB,
              height: THUMB,
              border: "1px solid #D4C4B1",
              zIndex: getZ(i),
            }}
          >
            <Image
              src={slide.image}
              alt={`Foto ${i + 1} van Ever Sun klanten`}
              width={THUMB}
              height={THUMB}
              className="w-full h-full object-cover object-center"
            />
          </m.button>
        ))}
      </div>
    </div>
  );
}
