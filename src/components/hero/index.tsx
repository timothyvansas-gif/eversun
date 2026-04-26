"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/images/hero-backgournd.webp";
import HeroContent from "./hero-content";

export default function HeroSection() {
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
      className="relative w-full h-[98vh] md:h-[85vh] md:max-h-[750px] overflow-hidden max-w-[1538px] mx-auto rounded-none md:rounded-[8px] bg-[#684F37]"
    >
      <motion.div
        className="absolute inset-0"
        style={{ y, scale }}
        initial={{ scale: 1.12, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Image
          src={heroImage}
          alt="EverSun"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      <HeroContent />
    </section>
  );
}
