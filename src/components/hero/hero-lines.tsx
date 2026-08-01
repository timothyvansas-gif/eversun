"use client";

import { m } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function HeroLines({ play }: { play: boolean }) {
  return (
    <m.svg
      viewBox="0 0 169 10"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-0 -bottom-[6px] md:-bottom-2 lg:-bottom-[5px] w-full"
      style={{ height: 10, overflow: "visible" }}
    >
      <m.path
        d="M1 6.56622C56.3941 3.06094 112.187 1.20107 168 1"
        stroke="#f35b04"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[stroke-width:1.25] md:[stroke-width:3] lg:[stroke-width:1.75]"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={play ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease }}
      />
      <m.path
        d="M32.1309 8.63371C68.2143 6.92799 104.462 6.13378 140.695 6.25107"
        stroke="#f35b04"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[stroke-width:1.25] md:[stroke-width:3] lg:[stroke-width:1.75] translate-y-[1px] md:translate-y-[4px] lg:translate-y-[2px]"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={play ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: play ? 0.45 : 0, ease }}
      />
    </m.svg>
  );
}
