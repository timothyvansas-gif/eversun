"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Bento from "@/components/bento";
import HeroSection from "@/components/hero";
import StickyHeader from "@/components/sticky-header";
import MobileMenu from "@/components/mobile-menu";
import Footer from "@/components/footer";

const OnzeZonnebanken = dynamic(() => import("@/components/onze-zonnebanken"));
const Producten = dynamic(() => import("@/components/producten"));
const OverOns = dynamic(() => import("@/components/over-ons"));

const PUSH_TRANSITION = "margin-left 800ms cubic-bezier(0.16, 1, 0.3, 1)";

export default function PageLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="relative bg-black min-h-screen">
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <StickyHeader onOpenMenu={toggleMenu} isMenuOpen={isMenuOpen} />

      <main
        style={{
          marginLeft: isMenuOpen ? "-95%" : "0%",
          transition: PUSH_TRANSITION,
          width: "100%",
        }}
        className="min-h-screen flex flex-col items-center relative z-10"
      >
        {/* bg: black on mobile so Safari's toolbar/home-bar zone samples dark; beige frame look on lg */}
        <div className="w-full bg-black lg:bg-surface-page lg:p-6 lg:[&>*]:rounded-lg lg:[&>*]:overflow-hidden">
          <HeroSection onOpenMenu={toggleMenu} />
        </div>
        <div
          className="relative z-10 w-full flex flex-col items-center bg-surface-page "
          style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
        >
          <Bento />
        </div>
        <OnzeZonnebanken />
        <Producten />
        <OverOns />
        <Footer />
      </main>

      <div
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
        className={`fixed inset-0 z-20 cursor-pointer transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
      />
    </div>
  );
}
