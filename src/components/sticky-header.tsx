"use client";

import { useState, useEffect } from "react";
import Logo from "@/components/logo";
import HamburgerIcon from "@/components/hamburger-icon";
import { scrollToTop } from "@/lib/scroll-to-top";

export default function StickyHeader({
  onOpenMenu,
  isMenuOpen,
}: {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 550);
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
      style={{
        marginLeft: isMenuOpen ? "-95%" : "0%",
        transform: isShown ? "translateY(0)" : "translateY(-100%)",
        transitionProperty: "transform, margin-left",
        transitionDuration: "800ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm h-14 flex items-center lg:hidden ${
        isShown ? "" : "pointer-events-none"
      }`}
    >
      <div className="w-full flex items-center justify-between px-6">
        <button
          onClick={scrollToTop}
          aria-label="Naar begin van de pagina"
          className="cursor-pointer active:scale-95 transition-transform duration-200"
        >
          <Logo
            className="h-8 w-auto"
            textColor="#FFFFFF"
            iconColor="#FAF4EC"
          />
        </button>

        <button
          onClick={onOpenMenu}
          aria-label="Menu openen"
          className="flex flex-col items-end gap-[5px] p-2 cursor-pointer active:scale-90 transition-transform duration-200"
        >
          <HamburgerIcon />
        </button>
      </div>
    </header>
  );
}
