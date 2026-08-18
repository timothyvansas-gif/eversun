"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { quietFocus } from "@/lib/quiet-focus";
import { useScrollNav } from "@/hooks/use-scroll-nav";
import whatsappIcon from "@/images/whatsapp.svg";
import facebookIcon from "@/images/socials/social-facebook.svg";
import instagramIcon from "@/images/socials/social-instagram.svg";
import { MENU_DURATION, MENU_EASE } from "@/lib/menu-motion";
import { MOBILE_MENU_ID, NAV_ITEMS } from "@/lib/nav-items";
import { WHATSAPP_BOOKING_URL } from "@/lib/whatsapp";
import { TAP_TARGET } from "@/lib/button-styles";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  /** The hamburger that opened the menu, captured before <main> went inert. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export default function MobileMenu({ isOpen, onClose, returnFocusRef }: MobileMenuProps) {
  const { scrollToNav } = useScrollNav();
  const [canShare, setCanShare] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // The same trap the hero overlays use. This panel claimed `aria-modal="true"`
  // while Tab walked straight out of it into the page behind — which is pushed
  // 95% off-screen, so focus went somewhere nobody could see. The trap also
  // brings Escape and hands focus back to whichever hamburger opened it.
  // `inert` on <main> and the sticky header (see page-layout) closes the other
  // half: pointer and AT cannot reach the background either.
  useFocusTrap(panelRef, isOpen, onClose);

  // Focus in on open, back to the hamburger on close. This effect is declared
  // after useFocusTrap, so its cleanup runs first and lands on <body> (the trap
  // captured that, because <main> was already inert by then) — a no-op we then
  // correct. By the time this runs React has lifted `inert` again, so the
  // button can actually take focus.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      panelRef.current?.focus({ preventScroll: true });
      return;
    }

    if (!wasOpenRef.current) return;
    wasOpenRef.current = false;

    const trigger = returnFocusRef?.current;
    if (trigger?.isConnected) quietFocus(trigger);
  }, [isOpen, returnFocusRef]);

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
  //
  // The panel is exempt, but only while it actually overflows — on a short
  // viewport it becomes its own scroller and swallowing the gesture would
  // strand the footer below the fold. When everything fits there is nothing to
  // scroll, so the block stays total and iOS cannot rubber-band the page.
  // `overscroll-contain` on the panel stops a scroll that reaches the end from
  // chaining onward.
  useEffect(() => {
    if (!isOpen) return;
    const prevent = (e: Event) => {
      const panel = panelRef.current;
      if (
        panel &&
        panel.scrollHeight > panel.clientHeight &&
        e.target instanceof Node &&
        panel.contains(e.target)
      ) {
        return;
      }
      e.preventDefault();
    };
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
    // Viewport-sized clipping frame. The panel parks itself one screen to the
    // right while closed, and `overflow-x: clip` on <html> does not reach it:
    // a position:fixed box hangs off the viewport, not off the element it is
    // drawn inside, so no ancestor's overflow can clip it. On iOS Safari that
    // parked panel is pannable, which shows up as the whole page sliding
    // sideways. Wrapping it in a fixed, viewport-sized box and making the panel
    // `absolute` puts it back under this frame's control, where clipping works.
    //
    // `clip` (not `hidden`) on the x-axis only, so the y-axis keeps its
    // `visible` behaviour — `hidden` would force overflow-y to `auto` and turn
    // this into a scroll container, which would swallow the touch handling.
    // `pointer-events-none` keeps the invisible frame from intercepting taps;
    // the panel re-enables them for itself.
    <div className="fixed inset-0 z-[200] overflow-x-clip pointer-events-none lg:hidden">
      <div
        ref={panelRef}
        data-lenis-prevent
        // A CSS transition rather than Framer, even though the timing is the
        // same either way. The page push and the header beside it are plain
        // transitions, and Framer starts a frame later than a style flush does
        // — one frame of 900ms across 95vw is a visible few pixels of daylight
        // between this panel's edge and the page it is pushing. Same engine,
        // same tick.
        //
        // On `translate` rather than `transform`, matching the header: it is
        // the property the shared timing is written against there, and keeping
        // both on it means neither can drift on a transform someone adds later.
        style={{
          translate: isOpen ? "0 0" : "100% 0",
          // Motion here is the menu arriving, not something the visitor asked
          // to watch. Framer's reducedMotion policy used to cover this element;
          // a CSS transition sits outside it, so the gate has to be explicit.
          transitionProperty: shouldReduceMotion ? "none" : "translate",
          transitionDuration: `${MENU_DURATION * 1000}ms`,
          transitionTimingFunction: `cubic-bezier(${MENU_EASE.join(", ")})`,
          // The panel is a full-screen layer of text and images; promoting it
          // before the gesture starts means the first frame is a composite
          // rather than a paint.
          willChange: "translate",
        }}
        id={MOBILE_MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        // Focus target on open, so the dialog is where the keyboard lands and
        // the trap has something inside itself to hold on to.
        tabIndex={-1}
        // The vertical rhythm is keyed to viewport height, not fixed: the panel
        // is exactly one screen tall and the nav alone used to eat 461px of it,
        // so on anything shorter than roughly 700px the footer was pushed past
        // the bottom edge and the phone number was clipped away. The clamps let
        // a tall phone keep the roomy spacing and a short one give the space
        // back, floors included so it never collapses into a cramped list.
        //
        // Bottom padding is the single source of the breathing room under the
        // phone number — the footer adds none — and carries the iOS home
        // indicator, which sits on top of the panel and would otherwise crowd
        // the link on exactly the phones that have one.
        className="absolute top-0 right-0 w-[95%] h-full bg-void px-8 pt-8 pb-[calc(env(safe-area-inset-bottom)+clamp(1.5rem,7.5vh,4rem))] flex flex-col overflow-y-auto overscroll-contain pointer-events-auto"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        {/* Top Bar: Social Icons + Close */}
        <div className="flex items-center justify-between mb-[clamp(1.5rem,4.5vh,3rem)] shrink-0">
          <div className="flex items-center gap-2">
            <a
              href="https://www.facebook.com/eversun.assen/"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center p-2 ${TAP_TARGET} text-nav-ink active:opacity-60 transition-opacity`}
              aria-label="Facebook"
            >
              <Image src={facebookIcon} alt="Facebook" width={24} height={24} className="w-6 h-6" style={{ filter: "brightness(0) invert(93%)" }} />
            </a>
            <a
              href="https://www.instagram.com/ever_sun_assen/"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center p-2 ${TAP_TARGET} text-nav-ink active:opacity-60 transition-opacity`}
              aria-label="Instagram"
            >
              <Image src={instagramIcon} alt="Instagram" width={24} height={24} className="w-6 h-6" style={{ filter: "brightness(0) invert(93%)" }} />
            </a>
            {canShare && (
              <button
                onClick={handleShare}
                aria-label="Pagina delen"
                className={`inline-flex items-center p-2 ${TAP_TARGET} text-nav-ink active:opacity-60 transition-opacity`}
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
            className="p-2 text-nav-ink active:scale-90 transition-transform"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
  
        {/* Navigation Items */}
        <nav className="flex flex-col gap-[clamp(0.875rem,2.6vh,2rem)] shrink-0">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(" ", "-")}`} 
              onClick={(e) => handleNavClick(e, item)}
              className="text-[28px] font-semibold text-nav-ink tracking-tight active:opacity-60 transition-opacity"
            >
              {item}
            </a>
          ))}

          <div className="h-[1px] bg-nav-ink/10 w-full my-2" />

          <a
            href={WHATSAPP_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 text-[28px] font-semibold text-nav-ink tracking-tight active:opacity-60 transition-opacity"
          >
            WhatsApp
            <Image
              src={whatsappIcon}
              alt=""
              width={24}
              height={24}
              className="w-6 h-6"
              style={{ filter: "brightness(0) invert(93%)" }}
            />
          </a>
        </nav>
  
        {/* Footer Info */}
        <div className="mt-auto pt-6 shrink-0 flex flex-col gap-1">
          <p className="text-nav-ink/65 text-sm font-medium">
            Ever Sun Zonnestudio
          </p>
          <p className="text-nav-ink/65 text-sm font-medium mb-2">
            Kloekhorststraat 4a Assen
          </p>
          <a
            href="tel:0625306491"
            className="text-nav-ink/65 text-sm font-medium active:text-nav-ink underline decoration-dotted underline-offset-6"
          >
            06 25306491
          </a>
        </div>
      </div>
    </div>
  );
}
