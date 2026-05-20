"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SHADOW_DEFAULT, SHADOW_HOVER, SHADOW_EASE, BLOB_SIZE } from "@/components/hero/button-constants";

const baseStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  borderRadius: "9999px",
};


export default function HeroButtons({ onOpenAfspraak }: { onOpenAfspraak: () => void }) {
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  return (
    <>
      <button
        className="w-auto sm:w-[200px] lg:w-[232px] min-h-[48px] sm:min-h-[56px] px-[40px] sm:px-5 font-sans font-medium text-[14px] sm:text-[15px] text-[#FAF4EC] cursor-pointer active:scale-[0.98] transition-transform duration-200 relative overflow-hidden"
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
        <span className="relative z-10">Plan je moment</span>
      </button>
    </>
  );
}
