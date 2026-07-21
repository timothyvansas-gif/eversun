"use client";

import { useState } from "react";
import { m } from "framer-motion";
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
  const [secondaryHovered, setSecondaryHovered] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
      <button
        className="w-full sm:w-[212px] min-h-[48px] sm:min-h-[56px] px-0 sm:px-5 font-sans font-medium text-[14px] sm:text-[15px] md:text-[16px] text-[#FAF4EC] cursor-pointer active:scale-[0.98] transition-transform duration-200 relative overflow-hidden"
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
        <m.span
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

      <div className="w-full sm:w-auto">
        <button
          className="w-full sm:w-[212px] min-h-[48px] sm:min-h-[56px] px-0 sm:px-5 font-sans font-medium text-[14px] sm:text-[15px] md:text-[16px] text-white cursor-pointer active:scale-[0.98] border"
          onMouseEnter={() => {
            if (!window.matchMedia("(hover: hover)").matches) return;
            setSecondaryHovered(true);
          }}
          onMouseLeave={() => setSecondaryHovered(false)}
          onClick={() => document.getElementById("waarom")?.scrollIntoView({ behavior: "smooth" })}
          style={{
            ...baseStyle,
            borderColor: secondaryHovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.3)",
            transition: "border-color 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.2s ease",
          }}
        >
          De studio
        </button>
      </div>
    </div>
  );
}
