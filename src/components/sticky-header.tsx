"use client";

import { useState, useEffect } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import Logo from "@/components/logo";
import { MENU_DURATION, MENU_EASE } from "@/lib/menu-motion";
import { MOBILE_MENU_ID } from "@/lib/nav-items";
import { TAP_TARGET } from "@/lib/button-styles";
import HamburgerIcon from "@/components/hamburger-icon";
import { scrollToTop } from "@/lib/scroll-to-top";

/**
 * How far down the bar arrives. Was 550, which kept it away until well past the
 * hero; 80 is just past the point where the hero's own logo has scrolled out,
 * so the two are never on screen together (that logo sits about 56px down: a
 * 1.5rem top padding plus its own 32px).
 *
 * Earlier also means the bar — fixed, top-0, bg-void — reaches the top of the
 * screen sooner, and on iOS that is what keeps the status bar dark while
 * Safari's toolbar is collapsed. That is a side effect worth knowing about, not
 * the reason it lives here: it narrows the window where the hero photo shows
 * through the status bar, it does not close it.
 */
const REVEAL_AT = 80;

export default function StickyHeader({
  onOpenMenu,
  isMenuOpen,
  inert = false,
}: {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
  /** True while the mobile menu owns the screen; see page-layout. */
  inert?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > REVEAL_AT);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Safari on iOS pins position:fixed to the *layout* viewport. Focus a contact
  // field and the keyboard slides the *visual* viewport down inside that layout
  // viewport to uncover the input — which drags this header up past the top of
  // the screen, so it looks like it tears loose and vanishes mid-focus.
  // Re-anchoring to visualViewport.offsetTop only half works: iOS reports the
  // shift late and stops updating while the keyboard animates, so the header
  // settles somewhere cut off. Retracting it for as long as the keyboard is up
  // is deterministic, and a phone showing a keyboard has no room to spare for a
  // 56px bar anyway. It slides back in on blur, on its usual curve.
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    // Collapsing browser toolbars account for well under 150px of difference;
    // no phone keyboard is anywhere near that small.
    const sync = () => setIsKeyboardOpen(window.innerHeight - viewport.height > 150);
    sync();
    viewport.addEventListener("resize", sync);
    return () => viewport.removeEventListener("resize", sync);
  }, []);

  const isShown = isVisible && !isKeyboardOpen;

  return (
    <header
      inert={inert}
      style={{
        // Two movements, two properties, because they are two different things
        // on two different clocks. The menu push rides the standalone
        // `translate` property so it can share the menu's exact timing; the
        // reveal-on-scroll keeps its own on `transform`. Both are still pure
        // translations on the compositor — the push used to be a margin-left
        // animation, which laid out and painted the bar every frame.
        //
        // On one property they could only have one timing, and this bar was
        // left on the old 800ms expo while the panel and the page moved to the
        // shared curve. Expo covers most of its distance in the first third, so
        // the header shot aside ahead of them and opened a gap under itself.
        translate: isMenuOpen ? "-95% 0" : "0 0",
        transform: `translateY(${isShown ? "0" : "-100%"})`,
        // Neither is a movement the visitor asked for — the bar arriving on
        // scroll, and the menu shoving it aside. Under reduced motion it is
        // simply there or not; `pointer-events-none` and the off-screen offset
        // already handle the rest.
        transitionProperty: shouldReduceMotion ? "none" : "translate, transform",
        transitionDuration: `${MENU_DURATION * 1000}ms, 800ms`,
        transitionTimingFunction: `cubic-bezier(${MENU_EASE.join(", ")}), cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
      className={`fixed top-0 left-0 right-0 z-50 bg-status-bar backdrop-blur-sm h-12 flex items-center lg:hidden ${
        isShown ? "" : "pointer-events-none"
      }`}
    >
      <div className="w-full flex items-center justify-between px-6">
        {/* 48px, not 56: lighter over the page, and still roomy enough for the
            44px tap targets its two controls carry. */}
        <button
          onClick={scrollToTop}
          aria-label="Naar begin van de pagina"
          className={`inline-flex items-center ${TAP_TARGET} cursor-pointer active:scale-95 transition-transform duration-200`}
        >
          <Logo
            className="h-8 w-auto"
            textColor="var(--color-nav-ink)"
            iconColor="var(--color-nav-ink)"
          />
        </button>

        <button
          onClick={onOpenMenu}
          aria-label={isMenuOpen ? "Menu sluiten" : "Menu openen"}
          aria-expanded={isMenuOpen}
          aria-controls={MOBILE_MENU_ID}
          className={`flex flex-col items-end gap-[5px] p-2 ${TAP_TARGET} cursor-pointer active:scale-90 transition-transform duration-200`}
        >
          <HamburgerIcon colorClassName="bg-nav-ink" />
        </button>
      </div>
    </header>
  );
}
