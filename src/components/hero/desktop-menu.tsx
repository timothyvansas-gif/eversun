"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import { NAV_ITEMS } from "@/lib/nav-items";
import { resolveNavTarget, useScrollNav } from "@/hooks/use-scroll-nav";
import { quietFocus } from "@/lib/quiet-focus";
import whatsappIcon from "@/images/whatsapp.svg";
import facebookIcon from "@/images/socials/social-facebook.svg";
import instagramIcon from "@/images/socials/social-instagram.svg";
import { WHATSAPP_BOOKING_URL } from "@/lib/whatsapp";

/**
 * Desktop-only navigation dropdown that unfolds from under the hero's Menu
 * button (top-right). It does not push or cover the hero — the photo stays
 * visible — mirroring the mobile menu's items in a compact card.
 */
export default function DesktopMenu({
  open,
  onClose,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  /** The toggle button, so Escape can return focus to it (WAI-ARIA disclosure). */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { scrollToNav } = useScrollNav();
  const menuRef = useRef<HTMLDivElement>(null);

  // No backdrop on desktop, so an outside click needs its own listener to close the menu.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open, onClose, triggerRef]);

  // A dropdown should not linger while the page moves or on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onClose();
      // Return focus to the toggle so keyboard/SR users keep their place,
      // without flashing a ring on a focus they did not ask for.
      if (triggerRef.current) quietFocus(triggerRef.current);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onClose, { passive: true, once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onClose);
    };
  }, [open, onClose, triggerRef]);

  const handleNav = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    onClose();
    // Small delay lets the card's exit animation play before the page scrolls.
    scrollToNav(label, 200);
  };

  return (
    <AnimatePresence>
      {open && (
        // One unit: the whole card (and every item inside it) fades in
        // together on a single soft opacity/drop — no per-item stagger.
        <m.div
          ref={menuRef}
          id="hero-desktop-menu"
          initial={{ opacity: 0, scale: 0.88, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2, ease: [0.36, 0, 0.66, 0] } }}
          transition={{ type: "spring", damping: 14, stiffness: 260 }}
          style={{ transformOrigin: "top right" }}
          className="absolute -right-9 -top-4 z-50 w-[340px] rounded-2xl bg-black px-9 pb-9 pt-[58px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)]"
        >
          <nav aria-label="Hoofdmenu" className="flex flex-col">
            {NAV_ITEMS.map((label) => (
              <a
                key={label}
                href={resolveNavTarget(label)}
                onClick={(e) => handleNav(e, label)}
                className="py-2 text-[18px] font-semibold tracking-tight text-white/85 transition-all duration-200 hover:translate-x-1 hover:text-white focus-visible:translate-x-1 focus-visible:text-white"
              >
                {label}
              </a>
            ))}

            <div className="my-3 h-px w-full bg-white/10" />

            <a
              href={WHATSAPP_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-2.5 py-2 text-[18px] font-semibold tracking-tight text-white/85 transition-all duration-200 hover:translate-x-1 hover:text-white focus-visible:translate-x-1 focus-visible:text-white"
            >
              WhatsApp
              <Image src={whatsappIcon} alt="" width={20} height={20} className="h-5 w-5 brightness-0 invert" />
            </a>

            <div className="mt-1 flex flex-col gap-0.5">
              <p className="text-[16px] leading-[24px] font-medium text-white/55">Ever Sun Zonnestudio</p>
              <p className="text-[16px] leading-[24px] font-medium text-white/55">Kloekhorststraat 4a Assen</p>
              <a
                href="tel:0625306491"
                className="mt-1 w-fit text-[16px] leading-[24px] font-medium text-white/55 underline decoration-dotted underline-offset-6 transition-colors hover:text-white/85 focus-visible:text-white/85"
              >
                06 25306491
              </a>
            </div>

            <div className="mt-6 flex items-center gap-1">
              <a
                href="https://www.facebook.com/eversun.assen/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="-ml-2 rounded-sm p-2 text-white/70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
              >
                <Image src={facebookIcon} alt="" width={20} height={20} className="h-5 w-5 brightness-0 invert" />
              </a>
              <a
                href="https://www.instagram.com/ever_sun_assen/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-sm p-2 text-white/70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
              >
                <Image src={instagramIcon} alt="" width={20} height={20} className="h-5 w-5 brightness-0 invert" />
              </a>
            </div>
          </nav>
        </m.div>
      )}
    </AnimatePresence>
  );
}
