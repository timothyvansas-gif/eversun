"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import reviewer1 from "@/images/people/reviewer-1.webp";
import reviewer2 from "@/images/people/reviewer-2.webp";
import reviewer3 from "@/images/people/reviewer-3.webp";
import reviewer4 from "@/images/people/reviewer-4.webp";
import iconStar from "@/images/icon-star.svg";

const reviewers = [reviewer1, reviewer4, reviewer2, reviewer3];

const tooltips: Record<number, { quote: string; name: string }> = {
  0: { quote: "Schoon en vriendelijk personeel", name: "Diana Boonstra" },
  1: { quote: "Wat een heerlijk schone en moderne studio is Ever Sun. Fijn in het centrum van Assen & parkeren voor de deur (gratis op zondag). Vriendelijk ontvangst en goede kwaliteit zonnebank met allemaal opties om naar eigen smaak in te stellen (ik had de medium sterke bank). Hier kom ik vaker!", name: "Koosje van Goinga" },
  2: { quote: "Hier ga je altijd vrolijk en getint de deur uit!", name: "Jackelien Beikes" },
  3: { quote: "Mooie zonnestudio, vriendelijk personeel. Prachtig bruiningsresultaat en het ziet er brandschoon uit.", name: "Willeke Veenstra" },
};

export default function HeroReviews() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="hidden lg:flex items-center gap-4">
      {/* Photo stack */}
      <div className="flex -space-x-3">
        {reviewers.map((img, i) => (
          <div
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
          >
            <motion.div
              className="w-[48px] h-[48px] rounded-full overflow-hidden border border-[#111111]"
              animate={{
                y: hoveredIndex === i ? -4 : 0,
                opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.35,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              <Image
                src={img}
                alt={tooltips[i]?.name ?? `Reviewer ${i + 1}`}
                width={48}
                height={48}
                className="object-cover"
              />
            </motion.div>

            {tooltips[i] && (
              <AnimatePresence>
                {hoveredIndex === i && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 16px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      style={{
                        width: 320,
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 4,
                        borderRadius: 8,
                        border: "1px solid #111",
                        background: "rgba(0, 0, 0, 0.85)",
                        boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.22)",
                        backdropFilter: "blur(2px)",
                      }}
                    >
                      <div className="flex" style={{ gap: 4, marginBottom: 8 }}>
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Image key={s} src={iconStar} alt="" width={16} height={16} />
                        ))}
                      </div>
                      <span className="font-sans text-[15px] leading-[25px] text-white/90">
                        {tooltips[i].quote}
                      </span>
                      <span className="font-sans text-[13px] text-white/50">
                        {tooltips[i].name}
                      </span>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        ))}
      </div>

      {/* Text Container */}
      <div className="h-[40px] flex items-center">
        <span className="font-sans font-normal text-[15px] leading-[25px] whitespace-nowrap" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
          <span className="font-normal">4.9</span>/5 <span className="opacity-50">-</span> 176 reviews
        </span>
      </div>
    </div>
  );
}
