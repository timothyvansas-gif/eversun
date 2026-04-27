"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import HeroLines from "./hero-lines";
import HeroButtons from "./hero-buttons";
import HeroStatus from "./hero-status";
import HeroReviews from "./hero-reviews";
import Logo from "@/components/logo";

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
    <div className="absolute inset-0 flex flex-col z-20">
      <div
        className="w-full max-w-[1280px] mx-auto flex-1 flex flex-col justify-between px-6 pb-8 lg:px-0 lg:py-12 lg:justify-start"
        style={{ paddingTop: "max(2rem, env(safe-area-inset-top))" }}
      >
        {/* Mobile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:hidden flex items-center justify-between"
        >
          <Logo className="h-[42px] w-auto" textColor="#FAF4EC" iconColor="#FAF4EC" />
          <button className="flex flex-col items-end gap-[5px] p-2 -mr-2 cursor-pointer active:scale-90 transition-transform duration-200">
            <span className="w-6 h-[1.5px] bg-[#FAF4EC] rounded-full" />
            <span className="w-4 h-[1.5px] bg-[#FAF4EC] rounded-full" />
            <span className="w-6 h-[1.5px] bg-[#FAF4EC] rounded-full" />
          </button>
        </motion.div>

        <div className="flex-1 flex flex-col justify-end">
          <div className="mb-18 lg:mb-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
            <div>
              <motion.h1
                className="font-alice font-medium text-[#FAF4EC] tracking-[-0.02em] lg:tracking-[-3px]"
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
                className="mt-4 lg:mt-3 font-alice font-normal text-[#FAF4EC] tracking-[-0.5px] lg:tracking-[-1.5px]"
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
                className="mt-10 lg:mt-11 flex flex-col md:flex-row gap-4 md:gap-6"
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
            className="mb-10 lg:mb-[48px] flex items-center justify-between"
          >
            <HeroStatus />
            <HeroReviews />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
