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
    <div className="absolute inset-0 flex flex-col px-[40px] py-6 lg:pl-[128px] lg:py-12 lg:pr-12">
      <div className="flex-1 flex flex-col justify-center">
      <div>
        <motion.h1
          className="font-display font-medium text-[#FAF4EC]"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          style={{
            fontSize: "clamp(52px, 7.5vw, 96px)",
            lineHeight: "clamp(54px, 7.8vw, 100px)",
            letterSpacing: "-3px",
            marginLeft: "-3px",
          }}
        >
          De perfecte gouden gloed
        </motion.h1>

        <motion.p
          className="mt-3 font-display font-normal text-[#FAF4EC]"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
          style={{
            fontSize: "clamp(22px, 3.44vw, 44px)",
            lineHeight: "clamp(28px, 4.06vw, 52px)",
            letterSpacing: "-1.5px",
          }}
        >
          begint bij zonnestudio{" "}
          <span className="relative inline-block">
            Ever Sun
            <HeroLines />
          </span>
        </motion.p>

        <motion.div
          className="mt-8 lg:mt-14 flex flex-col md:flex-row gap-3 md:gap-6"
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
        className="mb-[32px] lg:mb-[48px]"
      >
        <HeroStatus />
      </motion.div>
    </div>
  );
}
