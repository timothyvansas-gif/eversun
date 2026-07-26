"use client";

import { useEffect } from "react";
import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import { NAV_ITEMS } from "@/lib/nav-items";
import { resolveNavTarget, useScrollNav } from "@/hooks/use-scroll-nav";
import whatsappIcon from "@/images/whatsapp.svg";
import facebookIcon from "@/images/socials/social-facebook.svg";
import instagramIcon from "@/images/socials/social-instagram.svg";

const WHATSAPP_URL =
  "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

/**
 * Desktop-only navigation dropdown that unfolds from under the hero's Menu
 * button (top-right). It does not push or cover the hero — the photo stays
 * visible — mirroring the mobile menu's items in a compact card.
 */
export default function DesktopMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { scrollToNav } = useScrollNav();

  // A dropdown should not linger while the page moves or on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onClose();
      // Esc is a keyboard event, so the toggle button would regain focus with a
      // visible focus ring. Drop focus instead — closing stays visually quiet.
      (document.activeElement as HTMLElement | null)?.blur();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onClose, { passive: true, once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onClose);
    };
  }, [open, onClose]);

  const handleNav = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    onClose();
    // Small delay lets the card's exit animation play before the page scrolls.
    scrollToNav(label, 200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Transparent catcher: outside click closes, hero stays visible. */}
          <button
            type="button"
            aria-label="Menu sluiten"
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default"
          />

          {/* One unit: the whole card (and every item inside it) fades in
              together on a single soft opacity/drop — no per-item stagger. */}
          <m.div
            id="hero-desktop-menu"
            role="menu"
            aria-label="Hoofdmenu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-full mt-3 z-50 w-[340px] rounded-[20px] bg-black p-9 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)]"
          >
            <nav className="flex flex-col">
              {NAV_ITEMS.map((label) => (
                <a
                  key={label}
                  role="menuitem"
                  href={resolveNavTarget(label)}
                  onClick={(e) => handleNav(e, label)}
                  className="py-2 text-[18px] font-semibold tracking-tight text-white/85 transition-all duration-200 hover:translate-x-1 hover:text-white focus-visible:translate-x-1 focus-visible:text-white focus-visible:outline-none"
                >
                  {label}
                </a>
              ))}

              <div className="my-3 h-px w-full bg-white/10" />

              <a
                role="menuitem"
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-[18px] font-semibold tracking-tight text-white/85 transition-all duration-200 hover:translate-x-1 hover:text-white focus-visible:translate-x-1 focus-visible:text-white focus-visible:outline-none"
              >
                WhatsApp
                <Image src={whatsappIcon} alt="" width={20} height={20} className="h-5 w-5 brightness-0 invert" />
              </a>

              <div className="mt-1 flex flex-col gap-0.5">
                <p className="text-[16px] leading-[24px] font-medium text-white/55">Ever Sun Zonnestudio</p>
                <p className="text-[16px] leading-[24px] font-medium text-white/55">Kloekhorststraat 4a Assen</p>
                <a
                  href="tel:0625306491"
                  className="mt-1 w-fit text-[16px] leading-[24px] font-medium text-white/55 underline decoration-dotted transition-colors hover:text-white/85 focus-visible:text-white/85 focus-visible:outline-none"
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
                  className="-ml-2 rounded-sm p-2 text-white/70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                >
                  <Image src={facebookIcon} alt="" width={20} height={20} className="h-5 w-5 brightness-0 invert" />
                </a>
                <a
                  href="https://www.instagram.com/ever_sun_assen/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-sm p-2 text-white/70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                >
                  <Image src={instagramIcon} alt="" width={20} height={20} className="h-5 w-5 brightness-0 invert" />
                </a>
              </div>
            </nav>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
