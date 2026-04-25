"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function HeroLines() {
  return (
    <motion.svg
      viewBox="0 0 169 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-0 -bottom-2 md:-bottom-3 w-full"
      style={{ height: 10, overflow: "visible" }}
    >
      <motion.path
        d="M1 6.56622C56.3941 3.06094 112.187 1.20107 168 1"
        stroke="#E15E1D"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[stroke-width:1.6] md:[stroke-width:1.25]"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 1.3, ease }}
      />
      <motion.path
        d="M32.1309 8.63371C68.2143 6.92799 104.462 6.13378 140.695 6.25107"
        stroke="#E15E1D"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[stroke-width:1.6] md:[stroke-width:1.25]"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 1.75, ease }}
      />
    </motion.svg>
  );
}
