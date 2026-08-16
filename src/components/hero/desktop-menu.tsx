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

/**
 * How far a row steps aside when the pointer reaches it. Half a character at
 * this size: enough to register as the row answering, small enough that running
 * down the list does not read as the column coming apart.
 */
const NAV_ITEM_TRAVEL = 8;

/**
 * The glide, and the settle at the end of it.
 *
 * A spring rather than a duration, because the ask was for damping and a curve
 * cannot give it: a tween arrives at a fixed time no matter where the row was
 * when the pointer turned around, so sweeping down the list snaps every
 * half-finished row back to a clock it never started on. A spring carries the
 * velocity the row already had into the move that interrupts it, which is what
 * makes the return read as the same object coming back rather than a second
 * animation cancelling the first.
 *
 * Stiffer and lighter than the sheets' own `STACK_SPRING` (300/40), which is
 * tuned for a panel the size of the screen. Critical damping — the point where
 * a spring settles without ever crossing its target — is `2 * sqrt(stiffness *
 * mass)`, about 32 here. Sitting under it leaves roughly a 3% overshoot, which
 * over 8px is a quarter of a pixel: invisible as a bounce, but it is what makes
 * the landing feel soft instead of parked.
 */
const NAV_ITEM_SPRING = { type: "spring", stiffness: 260, damping: 24, mass: 1 } as const;

/**
 * One row of the menu. Shared by the section links and WhatsApp below them,
 * which sit in the same column and should not answer the pointer differently.
 *
 * Only colour is left to CSS. The travel is framer's, and the two must not both
 * claim `transform` — a CSS transition on a property framer rewrites every
 * frame fights it for the same value.
 */
const NAV_ITEM_CLASS =
  "py-2 text-[18px] font-semibold tracking-tight text-nav-ink/85 " +
  "transition-colors duration-300 hover:text-nav-ink focus-visible:text-nav-ink";

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
          className="absolute -right-9 -top-4 z-50 w-[340px] rounded-2xl bg-void px-9 pb-9 pt-[58px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)]"
        >
          <nav aria-label="Hoofdmenu" className="flex flex-col">
            {NAV_ITEMS.map((label) => (
              <m.a
                key={label}
                href={resolveNavTarget(label)}
                onClick={(e) => handleNav(e, label)}
                whileHover={{ x: NAV_ITEM_TRAVEL }}
                whileFocus={{ x: NAV_ITEM_TRAVEL }}
                transition={NAV_ITEM_SPRING}
                className={NAV_ITEM_CLASS}
              >
                {label}
              </m.a>
            ))}

            <div className="my-3 h-px w-full bg-nav-ink/10" />

            <m.a
              href={WHATSAPP_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              whileHover={{ x: NAV_ITEM_TRAVEL }}
              whileFocus={{ x: NAV_ITEM_TRAVEL }}
              transition={NAV_ITEM_SPRING}
              className={`flex items-center gap-2.5 ${NAV_ITEM_CLASS}`}
            >
              WhatsApp
              <Image src={whatsappIcon} alt="" width={20} height={20} className="h-5 w-5" style={{ filter: "brightness(0) invert(93%)" }} />
            </m.a>

            <div className="mt-1 flex flex-col gap-0.5">
              <p className="text-[16px] leading-[24px] font-medium text-nav-ink/65">Ever Sun Zonnestudio</p>
              <p className="text-[16px] leading-[24px] font-medium text-nav-ink/65">Kloekhorststraat 4a Assen</p>
              <a
                href="tel:0625306491"
                className="mt-1 w-fit text-[16px] leading-[24px] font-medium text-nav-ink/65 underline decoration-dotted underline-offset-6 transition-colors hover:text-nav-ink/85 focus-visible:text-nav-ink/85"
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
                className="-ml-2 rounded-sm p-2 text-nav-ink/70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
              >
                <Image src={facebookIcon} alt="" width={20} height={20} className="h-5 w-5" style={{ filter: "brightness(0) invert(93%)" }} />
              </a>
              <a
                href="https://www.instagram.com/ever_sun_assen/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-sm p-2 text-nav-ink/70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
              >
                <Image src={instagramIcon} alt="" width={20} height={20} className="h-5 w-5" style={{ filter: "brightness(0) invert(93%)" }} />
              </a>
            </div>
          </nav>
        </m.div>
      )}
    </AnimatePresence>
  );
}
