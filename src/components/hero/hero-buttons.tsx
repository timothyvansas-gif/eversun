"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useScrollNav } from "@/hooks/use-scroll-nav";

import { SHADOW_DEFAULT, SHADOW_HOVER, SHADOW_EASE, BLOB_SIZE } from "@/components/hero/button-constants";

const baseStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "56px",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  borderRadius: "9999px",
};


export default function HeroButtons({ onOpenAfspraak }: { onOpenAfspraak: () => void }) {
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const { scrollToNav } = useScrollNav();

  return (
    <>
      <button
        className="w-[calc(70%-28px)] sm:w-[220px] px-6 sm:px-8 font-sans font-medium text-[15px] text-[#FAF4EC] cursor-pointer active:scale-[0.98] transition-transform duration-200 relative overflow-hidden"
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
          transition: `box-shadow ${SHADOW_EASE}, transform 0.2s ease`,
          background: "#E15E1D",
          boxShadow: primaryHovered ? SHADOW_HOVER : SHADOW_DEFAULT,
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
          animate={{ scale: primaryHovered ? 1 : 0, opacity: primaryHovered ? 1 : 0 }}
          transition={{ duration: 0.75, ease: [0.25, 1, 0.35, 1] }}
        />
        <span className="relative z-10">Maak een afspraak</span>
      </button>
      <button
        className="w-[calc(70%-28px)] sm:w-[220px] px-6 sm:px-8 font-sans font-medium text-[15px] cursor-pointer active:scale-[0.98] transition-transform duration-200"
        onMouseEnter={() => {
          if (window.matchMedia("(hover: hover)").matches) setSecondaryHovered(true);
        }}
        onMouseLeave={() => setSecondaryHovered(false)}
        onClick={() => {
          scrollToNav("Studio");
        }}
        style={{
          ...baseStyle,
          transition: `border-color ${SHADOW_EASE}, transform 0.2s ease`,
          border: `1px solid ${secondaryHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.60)"}`,
          color: "#ffffff",
        }}
      >
        Ontdek de studio
      </button>
    </>
  );
}
