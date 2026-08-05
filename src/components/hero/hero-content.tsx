"use client";

import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import HeroButtons from "./hero-buttons";
import HeroStatus from "./hero-status";
import HeroReviews from "./hero-reviews";
import DesktopMenu from "./desktop-menu";
import HeroLines from "./hero-lines";
import Logo from "@/components/logo";
import HamburgerIcon from "@/components/hamburger-icon";
import { MOBILE_MENU_ID } from "@/lib/nav-items";
import { scrollToTop } from "@/lib/scroll-to-top";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};


export default function HeroContent({ onOpenMenu, isMenuOpen, onOpenOpeningstijden, onOpenAfspraak, onOpenPlanJeMoment, statusButtonRef }: { onOpenMenu: () => void; isMenuOpen: boolean; onOpenOpeningstijden: () => void; onOpenAfspraak: () => void; onOpenPlanJeMoment: () => void; statusButtonRef: React.RefObject<HTMLButtonElement | null> }) {
  // Desktop menu is a hero-scoped dropdown (see DesktopMenu), independent of the
  // mobile slide-in/push flow that `onOpenMenu` drives.
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const desktopToggleRef = useRef<HTMLButtonElement>(null);

  // The title underlines wait for the review avatars to finish gliding into
  // place (HeroReviews fires onSettled). Fallback timer covers the cases where
  // the avatars never signal — reduced motion, or the desktop-only stack being
  // display:none on mobile — so the underlines always draw.
  const [reviewsSettled, setReviewsSettled] = useState(false);
  useEffect(() => {
    // HeroReviews (the real settle cue) is desktop-only, so mobile always
    // rides this fallback — give it a shorter wait than desktop's.
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const t = setTimeout(() => setReviewsSettled(true), isDesktop ? 3200 : 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="absolute inset-0 flex flex-col z-20"
      style={{
        paddingTop: "calc(clamp(1.5rem, 4vw, 2.5rem) + env(safe-area-inset-top))",
        paddingBottom: "clamp(1.5rem, 4vw, 2.5rem)",
        paddingLeft: "clamp(1.5rem, 4vw, 3.5rem)",
        paddingRight: "clamp(1.5rem, 4vw, 3.5rem)"
      }}
    >
      <div
        className="relative min-h-0 max-w-[1280px] w-full mx-auto flex-1 flex flex-col justify-between lg:justify-start"
      >
        {/* Desktop Header */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex items-center justify-between"
        >
          <Logo className="h-[52px] w-auto" textColor="#FFFFFF" iconColor="#FAF4EC" iconOpacity={0.8} iconScale={44 / 52} textOffsetX={-8} />

          <div className="flex items-center gap-6">
            <HeroStatus onOpen={onOpenOpeningstijden} />
            <span aria-hidden="true" className="h-4 w-px shrink-0 bg-white/40" />

            <div className="relative">
              <button
                ref={desktopToggleRef}
                onClick={() => setDesktopMenuOpen((o) => !o)}
                aria-label={desktopMenuOpen ? "Menu sluiten" : "Menu openen"}
                aria-haspopup="true"
                aria-expanded={desktopMenuOpen}
                aria-controls="hero-desktop-menu"
                className={`nav-link light cursor-pointer relative z-[60] lg:!pr-0 lg:[&::after]:right-0 ${desktopMenuOpen ? "[&::after]:[transform:scaleX(0)]!" : ""}`}
              >
                <span className="flex flex-col items-end gap-[5px]">
                  <HamburgerIcon open={desktopMenuOpen} />
                </span>
                Menu
              </button>
              <DesktopMenu open={desktopMenuOpen} onClose={() => setDesktopMenuOpen(false)} triggerRef={desktopToggleRef} />
            </div>
          </div>
        </m.div>

        {/* Mobile Header */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:hidden flex items-center justify-between"
        >
          <button
            onClick={scrollToTop}
            aria-label="Naar begin van de pagina"
            className="cursor-pointer active:scale-95 transition-transform duration-200 rounded-sm"
          >
            <Logo className="h-[42px] w-auto" textColor="#FFFFFF" iconColor="#FAF4EC" iconOpacity={0.8} iconScale={34 / 42} textOffsetX={-10} />
          </button>
          <button
            onClick={onOpenMenu}
            aria-label={isMenuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={isMenuOpen}
            aria-controls={MOBILE_MENU_ID}
            className="flex flex-col items-end gap-[5px] p-2 -mr-2 cursor-pointer active:scale-90 transition-transform duration-200 rounded-sm"
          >
            <HamburgerIcon />
          </button>
        </m.div>

        <div className="flex-1 flex flex-col justify-end lg:absolute lg:inset-x-0 lg:bottom-6 lg:block">
          {/* At 2xl+: titles/CTAs get max-w-[1280px] back so they stay in position */}
          <div className="mb-14 lg:mb-0">
            <div className="translate-y-4 lg:translate-y-0">
              {/* w-fit sizes this wrapper to the title, so the subtitle below can
                  never run wider than it. The subtitle is w-0 min-w-full: width:0
                  keeps it out of the wrapper's intrinsic width (a percentage
                  min-width is ignored while that width is being resolved), then
                  min-width:100% stretches it back to the title's width.
                  On mobile the title has no forced break, so its max-content
                  exceeds the column and fit-content clamps to the full width —
                  same layout as before. */}
              <div className="w-fit">
                <m.h1
                  // Skip-link target. Not <main>: that starts at y=0 with the
                  // hero's own status and menu buttons first inside it, so
                  // jumping there skipped nothing and moved nothing. Landing on
                  // the heading puts the next Tab on "Plan je moment" and gives
                  // screen readers the title to announce.
                  id="hoofdinhoud"
                  tabIndex={-1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.3}
                  // The clamp floors used to be 32px/40px, which pinned the
                  // title flat below 427px and pushed it onto three lines on a
                  // 375px phone. The fluid 7.5vw already tracks the width the
                  // title needs — "Een gouden gloed die blijft," is 11.6x the
                  // font size, against (viewport - 48px) of room — so lowering
                  // the floors lets it govern down to 320px and the line breaks
                  // on the comma instead. Only widths below 427px change.
                  className="font-alice font-normal tracking-[-0.02em] lg:tracking-[-3px] text-[clamp(24px,7.5vw,88px)] leading-[clamp(30px,10vw,94px)] lg:text-[68px] lg:leading-[1.2] 2xl:text-[68px] 2xl:leading-[1.2]"
                  style={{ marginLeft: "-3px", color: "#ffffff" }}
                >
                  Een gouden gloed die blijft,{" "}<br className="hidden lg:inline" />
                  begint bij{" "}
                  <span className="relative inline-block">
                    Ever Sun
                    <HeroLines play={reviewsSettled} />
                  </span>
                </m.h1>

                <m.p
                  className="hidden lg:block w-0 min-w-full mt-2.5 md:mt-3 lg:mt-4 font-sans font-normal text-[15px] md:text-[20px] lg:text-[18px] leading-[25px] md:leading-[30px] lg:leading-[30px]"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.6}
                  style={{ color: "rgba(255, 255, 255, 0.75)" }}
                >
                  In onze zonnestudio draait het gewoon om jou.
                  <br />
                  Twintig minuten voor jezelf, zonder dat er iets van je gevraagd wordt.
                </m.p>

                <m.p
                  className="lg:hidden block w-0 min-w-full mt-2 md:mt-3 font-sans font-normal text-[15px] md:text-[20px] leading-[24px] md:leading-[30px]"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.6}
                  style={{ color: "rgba(255, 255, 255, 0.75)" }}
                >
                  In onze zonnestudio draait het gewoon om jou. Twintig minuten voor jezelf, zonder dat er iets van je gevraagd wordt.
                </m.p>
              </div>

              <m.div
                className="mt-6 md:mt-8 lg:mt-11 flex flex-row items-center justify-between w-full gap-6"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.7}
              >
                <HeroButtons onOpenAfspraak={onOpenAfspraak} onOpenPlanJeMoment={onOpenPlanJeMoment} />
                <HeroReviews onSettled={() => setReviewsSettled(true)} />
              </m.div>
            </div>
          </div>
        </div>

        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.9}
          className="mb-4 flex items-center justify-between lg:hidden"
        >
          <HeroStatus ref={statusButtonRef} onOpen={onOpenOpeningstijden} />
        </m.div>
      </div>
    </div>
  );
}
