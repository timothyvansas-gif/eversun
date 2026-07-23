"use client";

import { useEffect, useState } from "react";
import { m } from "framer-motion";
import Image from "next/image";
import { useScrollNav } from "@/hooks/use-scroll-nav";
import whatsappIcon from "@/images/whatsapp.svg";
import facebookIcon from "@/images/socials/social-facebook.svg";
import instagramIcon from "@/images/socials/social-instagram.svg";
import { NAV_ITEMS } from "@/lib/nav-items";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { scrollToNav } = useScrollNav();
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Feature-detect after mount to avoid a hydration mismatch — the Web Share
    // API only exists in (mostly mobile) browsers, never during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Lock page scroll while the menu is open. overflow:hidden alone is not
  // enough: wheel/touch input over the fixed menu chains straight to the
  // viewport in Chromium. Blocking the input events themselves is reliable on
  // iOS (momentum) and Android alike, and causes no layout shift.
  useEffect(() => {
    if (!isOpen) return;
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });
    document.addEventListener("wheel", prevent, { passive: false });
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("touchmove", prevent);
      document.removeEventListener("wheel", prevent);
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const handleNavClick = (e: React.MouseEvent, item: string) => {
    e.preventDefault();
    onClose();
    scrollToNav(item, 900);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Ever Sun",
        text: "Een gouden gloed die blijft — Ever Sun, jouw zonnestudio in Assen.",
        url: window.location.href,
      });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  };

  return (
    <m.div
      data-lenis-prevent
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? "0%" : "100%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed top-0 right-0 w-[95%] h-full bg-black z-[200] p-8 flex flex-col lg:hidden"
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      {/* Top Bar: Social Icons + Close */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2">
          <a
            href="https://www.facebook.com/eversun.assen/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-surface-page active:opacity-60 transition-opacity"
            aria-label="Facebook"
          >
            <Image src={facebookIcon} alt="Facebook" width={24} height={24} className="w-6 h-6 brightness-0 invert" />
          </a>
          <a
            href="https://www.instagram.com/ever_sun_assen/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-surface-page active:opacity-60 transition-opacity"
            aria-label="Instagram"
          >
            <Image src={instagramIcon} alt="Instagram" width={24} height={24} className="w-6 h-6 brightness-0 invert" />
          </a>
          {canShare && (
            <button
              onClick={handleShare}
              aria-label="Pagina delen"
              className="p-2 text-surface-page active:opacity-60 transition-opacity"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Menu sluiten"
          className="p-2 text-surface-page active:scale-90 transition-transform"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-8">
        {NAV_ITEMS.map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase().replace(" ", "-")}`} 
            onClick={(e) => handleNavClick(e, item)}
            className="text-[28px] font-semibold text-surface-page tracking-tight active:opacity-60 transition-opacity"
          >
            {item}
          </a>
        ))}
        
        <div className="h-[1px] bg-surface-page/10 w-full my-2" />
        
        <a 
          href="https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center gap-3 text-[28px] font-semibold text-surface-page tracking-tight active:opacity-60 transition-opacity"
        >
          WhatsApp
          <Image
            src={whatsappIcon}
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 brightness-0 invert"
          />
        </a>
      </nav>

      {/* Footer Info */}
      <div className="mt-auto pt-4 pb-8 flex flex-col gap-1">
        <p className="text-surface-page/40 text-sm font-medium">
          Ever Sun Zonnestudio
        </p>
        <p className="text-surface-page/40 text-sm font-medium mb-2">
          Kloekhorststraat 4a Assen
        </p>
        <a 
          href="tel:0625306491" 
          className="text-surface-page/40 text-sm font-medium active:text-surface-page underline decoration-dotted"
        >
          06 25306491
        </a>
      </div>
    </m.div>
  );
}
