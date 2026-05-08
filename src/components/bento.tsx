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

const SITE_HEADER_H = 56;

export default function Bento() {
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const lastCardRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(132);
  const [startVisible, setStartVisible] = useState(false);
  const isInView = useInView(headerWrapperRef, { once: true });

  const modeRef = useRef<"sticky" | "fixed">("sticky");
  const releaseScrollY = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!headerWrapperRef.current) return;
      const { top } = headerWrapperRef.current.getBoundingClientRect();
      if (top < window.innerHeight) setStartVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!headerWrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setHeaderHeight(entries[0].borderBoxSize[0].blockSize);
    });
    observer.observe(headerWrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = headerWrapperRef.current;
    const ph = placeholderRef.current;
    if (!el || !ph) return;

    const toSticky = () => {
      modeRef.current = "sticky";
      el.style.cssText = "";
      ph.style.display = "none";
    };

    const update = () => {
      rafRef.current = null;
      if (!lastCardRef.current) return;

      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (!isMobile) {
        if (modeRef.current !== "sticky") toSticky();
        return;
      }

      const threshold = headerHeight + SITE_HEADER_H;
      const lastCardTop = lastCardRef.current.getBoundingClientRect().top;
      const scrollY = window.scrollY;

      if (modeRef.current === "sticky") {
        if (lastCardTop <= threshold) {
          const rect = el.getBoundingClientRect();
          modeRef.current = "fixed";
          releaseScrollY.current = scrollY;

          el.style.position = "fixed";
          el.style.top = `${SITE_HEADER_H}px`;
          el.style.left = `${rect.left}px`;
          el.style.width = `${rect.width}px`;
          el.style.zIndex = "40";

          ph.style.display = "block";
          ph.style.height = `${rect.height}px`;
        }
        return;
      }

      // fixed mode
      const delta = scrollY - releaseScrollY.current;
      if (delta <= 0) {
        toSticky();
        return;
      }
      el.style.top = `${SITE_HEADER_H - delta}px`;
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [headerHeight]);

  return (
    <motion.section
      id="waarom"
      initial="hidden"
      animate={(isInView || startVisible) ? "visible" : "hidden"}
      className="w-full max-w-[1280px] mx-auto pt-4 pb-16 md:pt-8 xl:pt-16 min-h-[500px]"
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
