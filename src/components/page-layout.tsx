"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Bento from "@/components/bento";
import HeroSection from "@/components/hero-section";
import StickyHeader from "@/components/sticky-header";
import MobileMenu from "@/components/mobile-menu";

export default function PageLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const pushTransition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };
  const pushAnimation = { marginLeft: isMenuOpen ? "-95%" : "0%" };

  return (
    <div className="relative bg-black min-h-screen">
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <StickyHeader
        onOpenMenu={toggleMenu}
        animate={pushAnimation}
        transition={pushTransition}
      />

      <motion.main
        animate={pushAnimation}
        transition={pushTransition}
        className="min-h-screen bg-surface-page flex flex-col items-center relative z-10"
        style={{ width: "100%" }}
      >
        <div className="w-full sticky top-0 z-0">
          <HeroSection onOpenMenu={toggleMenu} />
        </div>
        <div className="relative z-10 w-full flex flex-col items-center px-[24px] md:px-10 bg-surface-page rounded-t-[16px]">
          <Bento />
        </div>
      </motion.main>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-20 cursor-pointer"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
