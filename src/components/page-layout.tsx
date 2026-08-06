"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LazyMotion, MotionConfig } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
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

const PUSH_TRANSITION = "transform 800ms cubic-bezier(0.16, 1, 0.3, 1)";

// `reducedMotion="user"` is the one switch that reaches every `m.*` on the page.
// framer-motion then drops transform and layout animations whenever the OS asks
// for less motion, while opacity and colour keep animating — so the hero still
// arrives, the bento cards still appear and the sheets still read as covering
// the page; nothing travels to get there. Every component keeps its own
// durations and easing, because the switch changes which properties animate,
// not how long they take.
//
// Effects driven by a MotionValue or a ScrollTrigger never pass through it and
// are gated where they are created (hero parallax, sticky cards, advies-card).

// `footer` is rendered by the server page and passed in as a slot, so the
// static Footer stays a server component instead of being pulled into this
// client bundle.
export default function PageLayout({ footer }: { footer: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Which hamburger opened the menu, so closing can hand focus back to it.
  // Captured here, on the click, rather than left to the focus trap's own
  // activeElement snapshot: by the time that effect runs <main> is already
  // inert, and the browser has moved focus off the button to <body>.
  const menuTriggerRef = useRef<HTMLElement | null>(null);

  const toggleMenu = () => {
    if (!isMenuOpen) menuTriggerRef.current = document.activeElement as HTMLElement | null;
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <LazyMotion features={loadMotionFeatures} strict>
    <MotionConfig reducedMotion="user">
    <div className="relative bg-black min-h-screen">
      {/* First tabbable on the page, so the keyboard route to the content does
          not run through the header and the whole menu. Hidden until focused. */}
      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-surface-page focus:px-5 focus:py-3 focus:font-sans focus:text-[15px] focus:font-medium focus:text-ink"
      >
        Naar hoofdinhoud
      </a>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        returnFocusRef={menuTriggerRef}
      />

      {/* Both go inert while the menu is open: the panel declares
          `aria-modal="true"`, and that has to be true of the page as well or
          Tab and the screen reader keep reaching content shoved 95% off-screen.
          The header sits outside <main>, so it needs saying twice. */}
      <StickyHeader onOpenMenu={toggleMenu} isMenuOpen={isMenuOpen} inert={isMenuOpen} />

      <main
        inert={isMenuOpen}
        style={{
          // `none` when closed, not `translateX(0)`: any transform value other
          // than none makes this element the containing block for every
          // `position: fixed` descendant, and the openingstijden overlay is
          // fixed and still renders inside <main> (the other sheets portal to
          // <body>). Keeping the transform off at rest means that only holds
          // while the menu is open — where the page behind is inert anyway, so
          // no overlay can be opened into it. Portal any new fixed overlay in
          // here, or it will position against <main> during the push.
          //
          // Worth the constraint: margin-left animated layout and paint for the
          // whole page across 800ms, where transform stays on the compositor.
          transform: isMenuOpen ? "translateX(-95%)" : "none",
          // The push is the largest single movement on the site — the whole page
          // travelling 95% of the viewport. Under reduced motion the menu simply
          // takes its place; the page is where it needs to be either way.
          transition: shouldReduceMotion ? "none" : PUSH_TRANSITION,
          width: "100%",
        }}
        className="min-h-screen flex flex-col items-center relative z-10"
      >
        <div className="w-full bg-surface-page lg:pb-12 lg:[&>*]:rounded-b-[24px] lg:[&>*]:overflow-hidden">
          <HeroSection onOpenMenu={toggleMenu} isMenuOpen={isMenuOpen} />
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
    </MotionConfig>
    </LazyMotion>
  );
}
