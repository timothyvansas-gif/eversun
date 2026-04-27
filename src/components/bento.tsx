"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import StickyCardWrapper from "@/components/sticky-card-wrapper";

// Direct imports for maximum stability
import PhotoCard from "@/components/photo-card";
import ParkingCard from "@/components/parking-card";
import MerkenCard from "@/components/merken-card";
import AdviesCard from "@/components/advies-card";
import LuxeCard from "@/components/luxe-card";

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  }),
};

export default function Bento() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(132);
  const [startVisible, setStartVisible] = useState(false);
  const isInView = useInView(headerRef, { once: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!headerRef.current) return;
      const { top } = headerRef.current.getBoundingClientRect();
      // in view OR already scrolled past (above viewport)
      if (top < window.innerHeight) setStartVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setHeaderHeight(entries[0].borderBoxSize[0].blockSize);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.section
      id="waarom"
      initial="hidden"
      animate={(mounted && (isInView || startVisible)) ? "visible" : "hidden"}
      className="w-full max-w-[1280px] mx-auto pt-8 pb-16 lg:py-16 min-h-[500px]"
      style={{ "--header-height": `${headerHeight}px` } as React.CSSProperties}
    >
      <motion.div
        ref={headerRef}
        variants={cardVariants}
        custom={-1}
        className="mb-6 lg:mb-10 w-full lg:w-bento-primary relative z-[40] max-lg:sticky max-lg:top-0 max-lg:pt-0 max-lg:pb-6 max-lg:mb-0 max-lg:bg-surface-page"
      >
        <h2 className="text-[28px] lg:text-[48px] font-semibold leading-none tracking-[-0.015em] text-zinc-900 font-display">
          Waarom Ever Sun
        </h2>
        <p className="mt-2 text-[15px] lg:text-[20px] font-normal lg:font-medium leading-[24px] lg:leading-8 tracking-[-0.02em] text-zinc-600">
          Je pakt je moment onder de beste banken, krijgt advies dat bij jou
          past en loopt twintig minuten later weer als herboren naar buiten.
        </p>
      </motion.div>

      <div className="flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-col gap-4 md:gap-4">
        {/* Row 1: Photo & Parking */}
        <div className="flex flex-col lg:flex-row gap-4 md:contents max-md:contents lg:flex">
          <div className="flex flex-col md:col-span-2 lg:flex-1 max-md:contents max-md:mb-4">
            <StickyCardWrapper 
              index={0} 
              total={5} 
              offsetTop={headerHeight}
              variants={cardVariants}
              custom={0}
            >
              <PhotoCard />
            </StickyCardWrapper>
          </div>
          <div className="flex flex-col md:col-span-1 lg:flex-1 max-md:contents max-md:mb-4">
            <StickyCardWrapper 
              index={1} 
              total={5} 
              offsetTop={headerHeight}
              variants={cardVariants}
              custom={1}
            >
              <ParkingCard />
            </StickyCardWrapper>
          </div>
        </div>

        {/* Row 2: Merken, Advies & Luxe */}
        <div className="flex flex-col lg:flex-row gap-4 md:contents max-md:contents lg:flex">
          <div className="flex flex-col md:col-span-1 lg:flex-1 max-md:contents max-md:mb-4">
            <StickyCardWrapper 
              index={2} 
              total={5} 
              offsetTop={headerHeight}
              variants={cardVariants}
              custom={2}
            >
              <MerkenCard />
            </StickyCardWrapper>
          </div>
          <div className="flex flex-col md:col-span-1 lg:flex-1 max-md:contents max-md:mb-4">
            <StickyCardWrapper 
              index={3} 
              total={5} 
              offsetTop={headerHeight}
              variants={cardVariants}
              custom={3}
            >
              <AdviesCard />
            </StickyCardWrapper>
          </div>
          <div className="flex flex-col md:col-span-1 lg:col-span-1 lg:w-[302px] lg:shrink-0 max-md:contents max-md:mb-4">
            <StickyCardWrapper 
              index={4} 
              total={5} 
              offsetTop={headerHeight}
              variants={cardVariants}
              custom={4}
            >
              <LuxeCard />
            </StickyCardWrapper>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
