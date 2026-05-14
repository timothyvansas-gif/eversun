"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import manAdvies from "@/images/people/man-advies.webp";
import meisjeRood from "@/images/people/meisje-rood-advies.webp";
import vrouwOuder from "@/images/people/vrouw-ouder-advies.webp";

const GRADIENT =
  "linear-gradient(78deg, rgba(0,0,0,0.70) 6.7%, rgba(0,0,0,0.70) 26.82%, rgba(0,0,0,0.49) 42.53%, rgba(0,0,0,0.00) 62.73%)";

const SLIDES = [
  { image: manAdvies },
  { image: meisjeRood },
  { image: vrouwOuder },
];

const DURATION = 4.5;
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

  const isInView = useInView(containerRef, {
    once: false,
    amount: isMobile ? 0.2 : 0.01, // Immediate on desktop (0.01 threshold)
  });

  useEffect(() => {
    if (isInView) {
      const delay = isMobile ? 300 : 0; // Immediate on desktop (0 delay)
      const timer = setTimeout(() => {
        setStarted(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setStarted(false);
    }
  }, [isInView, isMobile]);

  useEffect(() => {
    if (!started) return;
    
    progress.set(0);
    const ctrl = animate(progress, 1, {
      duration: DURATION,
      ease: "linear",
      onComplete: () => setActive((p) => (p + 1) % SLIDES.length),
    });
    return () => ctrl.stop();
  }, [active, progress, started]);

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
    <div ref={containerRef} className="w-full h-[362px] bg-[#1F1F1E] rounded-lg overflow-hidden relative">
      <AnimatePresence initial={false}>
        <motion.div
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

      <div className="absolute top-[52px] xl:top-[40px] z-10" style={{ left: 'clamp(24px, 4vw, 40px)' }}>
        <h3 className="card-title text-white">Persoonlijk advies</h3>
        <p className="card-body text-white/90 mt-1">Afgestemd op jouw unieke huid</p>
      </div>

      <div
        className="absolute bottom-[52px] xl:bottom-[40px] z-10"
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
            <motion.circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              fill="none"
              stroke="#FDC43F"
              strokeWidth={STROKE}
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {SLIDES.map((slide, i) => (
          <motion.button
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
            <img
              src={slide.image.src}
              alt={`Foto ${i + 1} van Ever Sun klanten`}
              className="w-full h-full object-cover object-center"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
