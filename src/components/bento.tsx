"use client";
import React, { useState, useRef, useEffect } from "react";
import AdviesCard from "@/components/advies-card";
import PhotoCard from "@/components/photo-card";
import ParkingCard from "@/components/parking-card";
import MerkenCard from "@/components/merken-card";
import LuxeCard from "@/components/luxe-card";
import StickyCardWrapper from "@/components/sticky-card-wrapper";
import { motion } from "framer-motion";

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
  const [headerHeight, setHeaderHeight] = useState(132);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      // Get exact rendered height
      setHeaderHeight(entries[0].borderBoxSize[0].blockSize);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.01 }}
      className="w-full max-w-[1280px] mx-auto pt-8 pb-16 lg:py-16 min-h-[500px]"
      style={{ "--header-height": `${headerHeight}px` } as React.CSSProperties}
    >
      <motion.div
        ref={headerRef}
        variants={cardVariants}
        custom={-1}
        // Header now aligns naturally with the container padding
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

      <div className="flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-col gap-4">
        {/* Row 1: Photo & Parking */}
        <div className="flex flex-col lg:flex-row gap-4 md:contents max-lg:contents lg:flex">
          <div className="flex flex-col md:col-span-2 lg:flex-1 max-lg:contents">
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
          <div className="flex flex-col md:col-span-1 lg:flex-1 max-lg:contents">
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
        <div className="flex flex-col lg:flex-row gap-4 md:contents max-lg:contents lg:flex">
          <div className="flex flex-col md:col-span-1 lg:flex-1 max-lg:contents">
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
          <div className="flex flex-col md:col-span-1 lg:flex-1 max-lg:contents">
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
          <div className="flex flex-col md:col-span-1 lg:col-span-1 lg:w-[302px] lg:shrink-0 max-lg:contents">
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
