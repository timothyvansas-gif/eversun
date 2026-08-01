"use client";

import Image from "next/image";
import { useState } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import reviewer1 from "@/images/people/reviewer-1.webp";
import reviewer2 from "@/images/people/reviewer-2.webp";
import reviewer3 from "@/images/people/reviewer-3.webp";
import reviewer4 from "@/images/people/reviewer-4.webp";
import StarIcon from "@/components/ui/star-icon";

const reviewers = [reviewer1, reviewer4, reviewer2, reviewer3];

// On load every avatar sits stacked behind the last one (the top of the z-stack,
// on the right); the rest then glide out to the left into place with an elastic
// bounce. STACK_STEP = 56px avatar − 16px (-space-x-4) overlap.
const STACK_STEP = 40;
const ENTRANCE_DELAY = 1.4; // wait for the review row to finish fading in
const ENTRANCE_STAGGER = 0.1;
const ANCHOR = reviewers.length - 1;

const tooltips: Record<number, { quote: string; name: string }> = {
  0: { quote: "Schoon en vriendelijk personeel", name: "Diana Boonstra" },
  1: { quote: "Wat een heerlijk schone en moderne studio is Ever Sun. Fijn in het centrum van Assen & parkeren voor de deur (gratis op zondag). Vriendelijk ontvangst en goede kwaliteit zonnebank met allemaal opties om naar eigen smaak in te stellen (ik had de medium sterke bank). Hier kom ik vaker!", name: "Koosje van Goinga" },
  2: { quote: "Hier ga je altijd vrolijk en getint de deur uit!", name: "Jackelien Beikes" },
  3: { quote: "Mooie zonnestudio, vriendelijk personeel. Prachtig bruiningsresultaat en het ziet er brandschoon uit.", name: "Willeke Veenstra" },
};

export default function HeroReviews({ onSettled }: { onSettled?: () => void }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <div className="hidden lg:flex items-center gap-4">
      {/* Photo stack */}
      <div className="flex -space-x-4">
        {reviewers.map((img, i) => (
          <m.div
            key={i}
            className="relative"
            style={{ zIndex: hoveredIndex === i ? 10 : i }}
            onMouseEnter={() => {
              if (!window.matchMedia("(hover: hover)").matches) return;
              setHoveredIndex(i);
            }}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => setHoveredIndex(i)}
            onBlur={() => setHoveredIndex(null)}
            tabIndex={0}
            role="button"
            aria-label={tooltips[i] ? `Review van ${tooltips[i].name}: ${tooltips[i].quote}` : undefined}
            initial={{ x: reduce ? 0 : (ANCHOR - i) * STACK_STEP }}
            animate={{ x: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.85, delay: reduce ? 0 : ENTRANCE_DELAY + (ANCHOR - i) * ENTRANCE_STAGGER }}
            // The furthest-travelling avatar (i=0) settles last — its finish is
            // the cue for the title underlines to draw.
            onAnimationComplete={i === 0 ? () => onSettled?.() : undefined}
          >
            <m.div
              className="w-[56px] h-[56px] rounded-full overflow-hidden"
              animate={{
                y: hoveredIndex === i ? -8 : 0,
                scale: hoveredIndex === i ? 64 / 56 : 48 / 56,
                opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.35,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              <Image
                src={img}
                alt={tooltips[i]?.name ?? `Reviewer ${i + 1}`}
                width={56}
                height={56}
                className="object-cover"
              />
            </m.div>

            {tooltips[i] && (
              <AnimatePresence>
                {hoveredIndex === i && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 32px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <m.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      style={{
                        width: 400,
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 4,
                        borderRadius: 16,
                        border: "1px solid #111",
                        background: "rgba(0, 0, 0, 0.85)",
                        boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.22)",
                        backdropFilter: "blur(2px)",
                      }}
                    >
                      <div className="flex" style={{ gap: 4, marginBottom: 8 }}>
                        {Array.from({ length: 5 }).map((_, s) => (
                          <StarIcon key={s} size={16} />
                        ))}
                      </div>
                      <span className="font-sans text-[15px] leading-[24px] text-white/90">
                        {tooltips[i].quote}
                      </span>
                      <span className="font-sans text-[13px] text-white/50" style={{ marginTop: 12 }}>
                        {tooltips[i].name}
                      </span>
                    </m.div>
                  </div>
                )}
              </AnimatePresence>
            )}
          </m.div>
        ))}
      </div>

      {/* Text Container */}
      <div className="h-[40px] flex items-center">
        <span className="font-sans font-normal text-[15px] leading-none whitespace-nowrap" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
          <span className="font-normal">4.9</span>/5 <span className="opacity-50">-</span> 176 reviews
        </span>
      </div>
    </div>
  );
}
