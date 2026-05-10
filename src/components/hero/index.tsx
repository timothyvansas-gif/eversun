"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/images/hero-backgournd.webp";
import dynamic from "next/dynamic";
import HeroContent from "./hero-content";
const OpeningstijdenOverlay = dynamic(() => import("./openingstijden-overlay"));
const AfspraakOverlay = dynamic(() => import("./afspraak-overlay"));

export default function HeroSection({ onOpenMenu }: { onOpenMenu: () => void }) {
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
      className="relative w-full h-svh lg:h-[calc(100svh-3rem)] min-[1920px]:max-h-[1000px] min-[1920px]:max-w-[1920px] min-[1920px]:mx-auto overflow-hidden bg-black"
    >
      <div className="absolute inset-0 animate-[hero-reveal_1.5s_ease-out_forwards]">
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
            className="object-cover object-[35%_50%] md:object-center"
          />
        </motion.div>

        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(0deg, rgba(225, 94, 29, 0.06) 0%, rgba(225, 94, 29, 0.06) 100%), linear-gradient(107deg, rgba(0, 0, 0, 0.00) 24.78%, rgba(0, 0, 0, 0.23) 42.77%, rgba(0, 0, 0, 0.48) 60.16%, rgba(0, 0, 0, 0.60) 93.14%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)",
          }}
        />

        <HeroContent
          onOpenMenu={onOpenMenu}
          onOpenOpeningstijden={() => setIsOpeningstijdenOpen(true)}
          onOpenAfspraak={() => setIsAfspraakOpen(true)}
          statusButtonRef={statusButtonRef}
        />
      </div>
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
