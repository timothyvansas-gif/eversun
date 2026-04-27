"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/images/hero-backgournd.webp";
import HeroContent from "./hero-content";

export default function HeroSection({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[98vh] md:h-[85vh] md:max-h-[750px] overflow-hidden max-w-[1538px] mx-auto rounded-none md:rounded-[8px] bg-black"
    >
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ y, scale }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={heroImage}
          alt="EverSun"
          fill
          priority
          placeholder="blur"
          className={`object-cover transition-all duration-[1500ms] ease-out ${
            isImageLoaded ? "scale-100 blur-0" : "scale-110 blur-xl"
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />
        {/* Subtle overlay to soften the transition from bg color */}
        <div
          className={`absolute inset-0 bg-[#684F37]/20 transition-opacity duration-1000 ${
            isImageLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
      </motion.div>

      {/* Top gradient — always visible, not affected by image fade-in animation */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10" />

      <HeroContent onOpenMenu={onOpenMenu} />
    </section>
  );
}
