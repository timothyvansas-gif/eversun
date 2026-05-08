"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useScrollNav } from "@/hooks/use-scroll-nav";

const EASE = "0.4s cubic-bezier(0.22, 1, 0.36, 1)";

const shadowDefault =
  "0 -2px 0 0 #D45110 inset, 0 0 0 1px rgba(255, 255, 255, 0.16) inset, 0 0 0 1px #B53B02, -93px 101px 38px 0 rgba(46, 14, 0, 0.00), -59px 64px 35px 0 rgba(46, 14, 0, 0.04), -33px 36px 30px 0 rgba(46, 14, 0, 0.12), -15px 16px 22px 0 rgba(46, 14, 0, 0.21), -4px 4px 12px 0 rgba(46, 14, 0, 0.24)";

const shadowHover =
  "0 -3px 0 0 rgba(0, 0, 0, 0.40) inset, 0 1px 0 1px rgba(255, 255, 255, 0.11) inset, 0 0 0 1px #000, -93px 101px 38px 0 rgba(46, 14, 0, 0.00), -59px 64px 35px 0 rgba(46, 14, 0, 0.04), -33px 36px 30px 0 rgba(46, 14, 0, 0.12), -15px 16px 22px 0 rgba(46, 14, 0, 0.21), -4px 4px 12px 0 rgba(46, 14, 0, 0.24)";

const baseStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "56px",
  padding: "0 32px",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  borderRadius: "16px",
};

// Large enough to cover the button from any cursor entry point
const BLOB_SIZE = 460;

export default function HeroButtons({ onOpenAfspraak }: { onOpenAfspraak: () => void }) {
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const { scrollToNav } = useScrollNav();

  return (
    <>
      <button
        className="w-[70%] sm:w-[220px] font-sans font-medium text-[15px] text-[#FAF4EC] cursor-pointer active:scale-[0.98] transition-transform duration-200 relative overflow-hidden"
        onMouseEnter={(e) => {
          if (!window.matchMedia("(hover: hover)").matches) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          setPrimaryHovered(true);
        }}
        onMouseLeave={() => setPrimaryHovered(false)}
        onClick={() => {
          if (window.innerWidth < 768) {
            window.open("https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken", "_blank");
          } else {
            onOpenAfspraak();
          }
        }}
        style={{
          ...baseStyle,
          transition: `box-shadow ${EASE}, transform 0.2s ease`,
          background: "#E15E1D",
          boxShadow: primaryHovered ? shadowHover : shadowDefault,
        }}
      >
        <motion.span
          aria-hidden
          className="absolute rounded-full bg-[#111] pointer-events-none"
          style={{
            width: BLOB_SIZE,
            height: BLOB_SIZE,
            left: origin.x - BLOB_SIZE / 2,
            top: origin.y - BLOB_SIZE / 2,
          }}
          initial={false}
          animate={{ scale: primaryHovered ? 1 : 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        />
        <span className="relative z-10">Maak een afspraak</span>
      </button>
      <button
        className="w-[70%] sm:w-[220px] font-sans font-medium text-[15px] cursor-pointer active:scale-[0.98] transition-transform duration-200"
        onMouseEnter={() => {
          if (window.matchMedia("(hover: hover)").matches) setSecondaryHovered(true);
        }}
        onMouseLeave={() => setSecondaryHovered(false)}
        onClick={() => {
          scrollToNav("Studio");
        }}
        style={{
          ...baseStyle,
          transition: `border-color ${EASE}, transform 0.2s ease`,
          border: `1px solid ${secondaryHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.40)"}`,
          color: secondaryHovered ? "rgba(255, 255, 255, 0.96)" : "rgba(255, 255, 255, 0.8)",
        }}
      >
        Ontdek de studio
      </button>
    </>
  );
}
