"use client";

import { useState } from "react";
import { useLenis } from "lenis/react";

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

export default function HeroButtons() {
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);
  const lenis = useLenis();

  return (
    <>
      <button
        className="w-[70%] md:w-[220px] font-sans font-medium text-[15px] text-[#FAF4EC] cursor-pointer active:scale-[0.98] transition-transform duration-200"
        onMouseEnter={() => {
          if (window.matchMedia("(hover: hover)").matches) setPrimaryHovered(true);
        }}
        onMouseLeave={() => setPrimaryHovered(false)}
        style={{
          ...baseStyle,
          transition: `background ${EASE}, box-shadow ${EASE}, transform 0.2s ease`,
          background: primaryHovered ? "#111" : "#E15E1D",
          boxShadow: primaryHovered ? shadowHover : shadowDefault,
        }}
      >
        Maak een afspraak
      </button>
      <button
        className="w-[70%] md:w-[220px] font-sans font-medium text-[15px] text-[#FAF4EC] cursor-pointer active:scale-[0.98] transition-transform duration-200"
        onMouseEnter={() => {
          if (window.matchMedia("(hover: hover)").matches) setSecondaryHovered(true);
        }}
        onMouseLeave={() => setSecondaryHovered(false)}
        onClick={() => {
          lenis?.scrollTo("#waarom", { offset: -20, duration: 1.5 });
        }}
        style={{
          ...baseStyle,
          transition: `border-color ${EASE}, transform 0.2s ease`,
          border: `1px solid ${secondaryHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.40)"}`,
        }}
      >
        Ontdek de studio
      </button>
    </>
  );
}
