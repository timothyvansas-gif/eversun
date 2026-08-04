"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LazyMotion } from "framer-motion";
import HeroSection from "@/components/hero";
import StickyHeader from "@/components/sticky-header";
import MobileMenu from "@/components/mobile-menu";
import { BACKDROP_SCRIM } from "@/components/ui/backdrop";

// Bento sits below the hero fold and pulls in six framer-motion card
// components. Loading it as a dynamic chunk (ssr:true, so the HTML and SEO
// content stay server-rendered) keeps its script out of the initial <script>
// set — trimming the eager JS the desktop audit flags as unused.
const Bento = dynamic(() => import("@/components/bento"));
const OnzeZonnebanken = dynamic(() => import("@/components/onze-zonnebanken"));
const Producten = dynamic(() => import("@/components/producten"));
const OverOns = dynamic(() => import("@/components/over-ons"));
const Contact = dynamic(() => import("@/components/contact"));

// LazyMotion ships only the tiny `m` component in the initial bundle; the full
// DOM feature set (gestures, drag, layout, the animation engine) loads as a
// separate async chunk after hydration, off the critical path. `domMax`
// (not `domAnimation`) because the overlays and photo sheet use drag.
const loadMotionFeatures = () =>
  import("framer-motion").then((mod) => mod.domMax);

const PUSH_TRANSITION = "margin-left 800ms cubic-bezier(0.16, 1, 0.3, 1)";

// `footer` is rendered by the server page and passed in as a slot, so the
// static Footer stays a server component instead of being pulled into this
// client bundle.
export default function PageLayout({ footer }: { footer: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
    <div className="relative bg-black min-h-screen">
      {/* First tabbable on the page, so the keyboard route to the content does
          not run through the header and the whole menu. Hidden until focused. */}
      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-surface-page focus:px-5 focus:py-3 focus:font-sans focus:text-[15px] focus:font-medium focus:text-ink"
      >
        Naar hoofdinhoud
      </a>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <StickyHeader onOpenMenu={toggleMenu} isMenuOpen={isMenuOpen} />

      <main
        id="hoofdinhoud"
        // tabIndex -1 so the skip link moves focus here, not just the scroll
        // position — without it the next Tab lands back at the top of the page.
        tabIndex={-1}
        style={{
          marginLeft: isMenuOpen ? "-95%" : "0%",
          transition: PUSH_TRANSITION,
          width: "100%",
        }}
        className="min-h-screen flex flex-col items-center relative z-10"
      >
        <div className="w-full bg-surface-page lg:p-3 lg:[&>*]:rounded-[24px] lg:[&>*]:overflow-hidden">
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
        <Contact />
        {footer}
      </main>

      <div
        data-lenis-prevent
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
        className={`fixed inset-0 z-20 cursor-pointer transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={BACKDROP_SCRIM}
      />
    </div>
    </LazyMotion>
  );
}
