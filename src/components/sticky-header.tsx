"use client";

import { useState, useEffect } from "react";
import Logo from "@/components/logo";
import HamburgerIcon from "@/components/hamburger-icon";

export default function StickyHeader({
  onOpenMenu,
  isMenuOpen,
}: {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 550);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        marginLeft: isMenuOpen ? "-95%" : "0%",
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        transitionProperty: "transform, margin-left",
        transitionDuration: "800ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm h-14 flex items-center lg:hidden ${
        isVisible ? "" : "pointer-events-none"
      }`}
    >
      <div className="w-full flex items-center justify-between px-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
          className="flex flex-col items-end gap-[5px] p-2 cursor-pointer active:scale-90 transition-transform duration-200"
        >
          <HamburgerIcon />
        </button>
      </div>
    </header>
  );
}
