"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PROGRAMMATIC_SCROLL_EVENT } from "@/lib/scroll-to-top";
import heroImage from "@/images/hero-eversun-3.webp";

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

  // Desktop (fine pointer) fires scroll events every frame, so the parallax
  // tracks scroll 1:1 there — any smoothing would lag behind fast jumps
  // (Cmd+↑, Home, scrollbar drags) and make the image glide into place.
  const isFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  // Touch devices fire scroll events sparsely during momentum scrolling, which
  // makes a directly-linked transform step visibly. The spring interpolates
  // between those events on every animation frame.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Touch only: during a programmatic scroll-to-top (logo tap) any parallax
  // motion reads as the image "gliding into place". So while that scroll runs
  // we pin the image at its final resting position (progress 0): the hero
  // arrives with the photo already in place, like a fresh page load.
  useEffect(() => {
    let pinned = false;
    let settleTimer: ReturnType<typeof setTimeout>;

    const release = () => {
      pinned = false;
      clearTimeout(settleTimer);
    };

    const onProgrammaticScroll = () => {
      pinned = true;
      clearTimeout(settleTimer);
      smoothProgress.set(0);
    };

    // NB: no wheel/touch release listeners — macOS trackpads keep firing
    // momentum wheel events after the click, which would drop the pin
    // immediately. If the user genuinely interrupts, the browser cancels the
    // programmatic scroll and the settle timer below releases the pin.
    const unsubscribe = scrollYProgress.on("change", () => {
      if (!pinned) return;
      // useSpring re-targets to the source on every change; keep steering it
      // back to 0 (set = spring-animated, so a partially-visible hero eases
      // into place instead of snapping).
      smoothProgress.set(0);
      clearTimeout(settleTimer);
      // No scroll updates for 200ms → arrived; smoothing resumes (progress is 0
      // at the top, so there is no visual jump on release).
      settleTimer = setTimeout(release, 200);
    });

    window.addEventListener(PROGRAMMATIC_SCROLL_EVENT, onProgrammaticScroll);
    return () => {
      unsubscribe();
      window.removeEventListener(PROGRAMMATIC_SCROLL_EVENT, onProgrammaticScroll);
      clearTimeout(settleTimer);
    };
  }, [scrollYProgress, smoothProgress]);

  // Desktop: raw 1:1 progress. Touch: spring-smoothed progress.
  const parallaxProgress = isFinePointer ? scrollYProgress : smoothProgress;

  // The image layer bleeds 30% above the section (see the motion.div below), so
  // the spring can lag behind fast upward scrolls without exposing the black
  // section background. 19% of the 130%-tall layer ≈ the original 25% travel.
  const y = useTransform(parallaxProgress, [0, 1], ["0%", "19%"]);
  const scale = useTransform(parallaxProgress, [0, 1], [1, 1.05]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-svh lg:h-[calc(100svh-3rem)] min-[1920px]:max-h-[1000px] min-[1920px]:max-w-[1920px] min-[1920px]:mx-auto overflow-hidden bg-black"
    >
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-x-0 overflow-hidden"
          style={{ y, scale, willChange: "transform", top: "-30%", height: "130%" }}
        >
          <Image
            src={heroImage}
            alt="EverSun"
            fill
            priority
            fetchPriority="high"
            quality={80}
            placeholder="blur"
            sizes="100vw"
            className="object-cover object-[60%_50%] md:object-center animate-[hero-reveal_1.5s_ease-out_forwards]"
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
          className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
          style={{
            height: "250px",
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.55) 8%, rgba(0,0,0,0.45) 18%, rgba(0,0,0,0.33) 30%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.13) 60%, rgba(0,0,0,0.06) 75%, rgba(0,0,0,0.02) 88%, rgba(0,0,0,0) 100%)",
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
