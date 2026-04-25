"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import heroImage from "@/images/hero-backgournd.webp";
import HeroContent from "./hero-content";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[85vh] min-[1538px]:h-[750px] overflow-hidden max-w-[1538px] mx-auto rounded-[8px] bg-[#684F37]">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
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
