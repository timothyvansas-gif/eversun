"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import MotionProvider from "@/components/motion-provider";
import { DESKTOP_NAV_QUERY } from "@/lib/breakpoints";
import { MENU_PUSH_TRANSITION } from "@/lib/menu-motion";
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

// Declarative Framer Motion is governed by the shared MotionProvider. This local
// preference remains necessary for the page push below: it is a plain inline
// CSS transition and therefore sits outside Framer Motion's policy.

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

  // The mobile menu (and the inert/scrim/push it drives) has no desktop
  // equivalent: MobileMenu's panel is `lg:hidden`, but isMenuOpen itself isn't
  // breakpoint-aware. Crossing into desktop mid-open — resize, rotate, an
  // external monitor — otherwise leaves <main> permanently inert behind an
  // invisible scrim, with no visible menu left to close it.
  const isDesktopNav = useMediaQuery(DESKTOP_NAV_QUERY);
  useEffect(() => {
    // Syncing to an external signal (the media query), not deriving from
    // props/state React already has — the effect-body exception the rule allows.
    if (isDesktopNav && isMenuOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMenuOpen(false);
    }
  }, [isDesktopNav, isMenuOpen]);

  return (
    <MotionProvider>
    <div className="relative bg-void min-h-screen">
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
          // `position: fixed` descendant. All overlay sheets portal to <body>
          // now, so none live inside <main> — keep it that way, or a new one
          // would position against <main> during the push instead of the
          // viewport.
          //
          // Worth the constraint: margin-left animated layout and paint for the
          // whole page across the push, where transform stays on the compositor.
          transform: isMenuOpen ? "translateX(-95%)" : "none",
          // The push is the largest single movement on the site — the whole page
          // travelling 95% of the viewport — and the panel sliding in is the
          // other half of it, so both read their timing from the same constant.
          // Under reduced motion the menu simply takes its place; the page is
          // where it needs to be either way.
          transition: shouldReduceMotion ? "none" : MENU_PUSH_TRANSITION,
          width: "100%",
        }}
        className="min-h-screen flex flex-col items-center relative z-10"
      >
        <div className="w-full bg-surface-page lg:pb-12 lg:[&>*]:rounded-b-[24px] lg:[&>*]:overflow-hidden">
          <HeroSection onOpenMenu={toggleMenu} isMenuOpen={isMenuOpen} />
        </div>
        <div
          className="relative z-10 w-full flex flex-col items-center bg-surface-page"
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
        // invisible, niet alleen opacity-0: op nul blijft dit een geschilderde
        // laag, en BACKDROP_SCRIM zet er een backdrop-filter op. Die dwong dus
        // op elke pagina, elk frame, een render surface en een blur-pass af
        // voor een scrim die niemand ziet. visibility zit in de transition, dus
        // hij klapt pas om als de fade klaar is en de fade-out blijft heel.
        className={`fixed inset-0 z-20 cursor-pointer transition-[opacity,visibility] duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        style={BACKDROP_SCRIM}
      />
    </div>
    </MotionProvider>
  );
}
