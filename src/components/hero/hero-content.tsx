"use client";

import { motion } from "framer-motion";
import HeroLines from "./hero-lines";
import HeroButtons from "./hero-buttons";
import HeroStatus from "./hero-status";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export default function HeroContent() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="w-full max-w-[1280px] mx-auto flex-1 flex flex-col justify-end px-6 pb-8 lg:px-0 lg:py-12 lg:justify-start">
        <div className="mb-18 lg:mb-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
          <div>
            <motion.h1
              className="font-display font-medium text-[#FAF4EC] tracking-[-0.02em] lg:tracking-[-3px]"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
              style={{
                fontSize: "clamp(52px, 7.5vw, 96px)",
                lineHeight: "clamp(54px, 7.8vw, 100px)",
                marginLeft: "-3px",
              }}
            >
              De perfecte gouden gloed
            </motion.h1>

            <motion.p
              className="mt-3 font-display font-normal text-[#FAF4EC] tracking-[-0.5px] lg:tracking-[-1.5px]"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.5}
              style={{
                fontSize: "clamp(20px, 3.44vw, 44px)",
                lineHeight: "clamp(26px, 4.06vw, 52px)",
              }}
            >
              begint bij zonnestudio{" "}
              <span className="relative inline-block">
                Ever Sun
                <HeroLines />
              </span>
            </motion.p>

            <motion.div
              className="mt-8 lg:mt-11 flex flex-col md:flex-row gap-4 md:gap-6"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.7}
            >
              <HeroButtons />
            </motion.div>
          </div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.9}
          className="mb-2 lg:mb-[48px]"
        >
          <HeroStatus />
        </motion.div>
      </div>
    </div>
  );
}
