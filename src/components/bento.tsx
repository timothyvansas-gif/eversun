"use client";
import React from "react";
import { motion } from "framer-motion";
import StickyCardWrapper from "@/components/sticky-card-wrapper";
import PhotoCard from "@/components/photo-card";
import ParkingCard from "@/components/parking-card";
import MerkenCard from "@/components/merken-card";
import AdviesCard from "@/components/advies-card";
import LuxeCard from "@/components/luxe-card";
import { useStickyBentoHeader, SITE_HEADER_H } from "@/hooks/use-sticky-bento-header";

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
  const { headerWrapperRef, placeholderRef, lastCardRef, headerHeight, startVisible, isInView } = useStickyBentoHeader();

  return (
    <motion.section
      id="waarom"
      initial="hidden"
      animate={(isInView || startVisible) ? "visible" : "hidden"}
      className="relative w-full max-w-[1280px] mx-auto pt-4 pb-16 md:pt-8 xl:pt-16 min-h-[500px]"
      style={{ "--header-height": `${headerHeight}px` } as React.CSSProperties}
    >
      <div
        ref={headerWrapperRef}
        className="mb-6 xl:mb-10 w-full xl:max-w-[849px] relative z-[40] max-md:sticky max-md:top-[56px] max-md:pt-6 max-md:pb-6 max-md:mb-0 max-md:bg-surface-page"
      >
        <motion.div variants={cardVariants} custom={-1}>
          <h2 className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-900 font-display">
            Waarom Ever Sun
          </h2>
          <p className="mt-2 text-[15px] xl:text-[20px] font-normal xl:font-medium leading-[24px] xl:leading-8 tracking-[-0.02em] text-zinc-600">
            Je pakt je moment onder de beste banken, krijgt advies dat bij jou
            past en loopt twintig minuten later weer als herboren naar buiten.
          </p>
        </motion.div>
      </div>
      <div ref={placeholderRef} style={{ display: "none" }} />

      <div className="flex flex-col md:grid md:grid-cols-2 xl:flex xl:flex-col gap-3 md:gap-4">
        {/* Row 1: Photo & Parking */}
        <div className="flex flex-col xl:flex-row gap-4 md:contents max-md:contents xl:flex">
          <div className="flex flex-col md:col-span-2 xl:[flex:849] max-md:contents max-md:mb-4">
            <StickyCardWrapper
              index={0}
              total={5}
              offsetTop={headerHeight + SITE_HEADER_H}
              variants={cardVariants}
              custom={0}
            >
              <PhotoCard />
            </StickyCardWrapper>
          </div>
          <div className="flex flex-col md:col-span-1 xl:[flex:411] max-md:contents max-md:mb-4">
            <StickyCardWrapper
              index={1}
              total={5}
              offsetTop={headerHeight + SITE_HEADER_H}
              variants={cardVariants}
              custom={1}
            >
              <ParkingCard />
            </StickyCardWrapper>
          </div>
        </div>

        {/* Row 2: Merken, Advies & Luxe */}
        <div className="flex flex-col xl:flex-row gap-4 md:contents max-md:contents xl:flex">
          <div className="flex flex-col md:col-span-1 xl:[flex:411] max-md:contents max-md:mb-4">
            <StickyCardWrapper
              index={2}
              total={5}
              offsetTop={headerHeight + SITE_HEADER_H}
              variants={cardVariants}
              custom={2}
            >
              <MerkenCard />
            </StickyCardWrapper>
          </div>
          <div className="flex flex-col md:col-span-1 xl:[flex:535] max-md:contents max-md:mb-4">
            <StickyCardWrapper
              index={3}
              total={5}
              offsetTop={headerHeight + SITE_HEADER_H}
              variants={cardVariants}
              custom={3}
            >
              <AdviesCard />
            </StickyCardWrapper>
          </div>
          <div className="flex flex-col md:col-span-1 xl:[flex:302] max-md:contents max-md:mb-4">
            <StickyCardWrapper
              ref={lastCardRef}
              index={4}
              total={5}
              offsetTop={headerHeight + SITE_HEADER_H}
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
