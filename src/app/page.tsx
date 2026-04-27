"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Bento from "@/components/bento";
import HeroSection from "@/components/hero-section";
import NavBar from "@/components/nav-bar";
import StickyHeader from "@/components/sticky-header";
import MobileMenu from "@/components/mobile-menu";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const pushTransition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };
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
        <NavBar />
        <div className="w-full px-0 md:px-4 min-[1538px]:px-0">
          <HeroSection onOpenMenu={toggleMenu} />
        </div>
        <div className="w-full flex flex-col items-center px-[24px] md:px-10 lg:px-0">
          <Bento />
        </div>
      </motion.main>

      {/* Overlay to close menu when clicking main content */}
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
