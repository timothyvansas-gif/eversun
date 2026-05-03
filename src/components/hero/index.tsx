"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/images/hero-backgournd.webp";
import HeroContent from "./hero-content";
import OpeningstijdenOverlay from "./openingstijden-overlay";
import AfspraakOverlay from "./afspraak-overlay";

export default function HeroSection({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isOpeningstijdenOpen, setIsOpeningstijdenOpen] = useState(false);
  const [isAfspraakOpen, setIsAfspraakOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-svh md:h-[calc(100vh-32px)] md:max-h-[800px] overflow-hidden max-w-[1538px] mx-auto rounded-none md:rounded-[8px] bg-black"
    >
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ y, scale }}
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

      <HeroContent
        onOpenMenu={onOpenMenu}
        onOpenOpeningstijden={() => setIsOpeningstijdenOpen(true)}
        onOpenAfspraak={() => setIsAfspraakOpen(true)}
        statusButtonRef={statusButtonRef}
      />
      <OpeningstijdenOverlay
        isOpen={isOpeningstijdenOpen}
        onClose={() => setIsOpeningstijdenOpen(false)}
      />
      <AfspraakOverlay
        isOpen={isAfspraakOpen}
        onClose={() => setIsAfspraakOpen(false)}
      />
    </section>
  );
}
