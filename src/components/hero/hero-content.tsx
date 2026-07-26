"use client";

import { useState } from "react";
import { m } from "framer-motion";
import HeroButtons from "./hero-buttons";
import HeroStatus from "./hero-status";
import HeroReviews from "./hero-reviews";
import DesktopMenu from "./desktop-menu";
import HeroLines from "./hero-lines";
import Logo from "@/components/logo";
import HamburgerIcon from "@/components/hamburger-icon";
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


export default function HeroContent({ onOpenMenu, onOpenOpeningstijden, onOpenAfspraak, statusButtonRef }: { onOpenMenu: () => void; onOpenOpeningstijden: () => void; onOpenAfspraak: () => void; statusButtonRef: React.RefObject<HTMLButtonElement | null> }) {
  // Desktop menu is a hero-scoped dropdown (see DesktopMenu), independent of the
  // mobile slide-in/push flow that `onOpenMenu` drives.
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

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
        className="max-w-[1280px] w-full mx-auto flex-1 flex flex-col justify-between lg:justify-start"
      >
        {/* Desktop Header */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex items-center justify-between"
        >
          <button
            onClick={scrollToTop}
            aria-label="Naar begin van de pagina"
            className="cursor-pointer active:scale-95 transition-transform duration-200 rounded-sm"
          >
            <Logo className="h-[52px] w-auto" textColor="#FFFFFF" iconColor="#FAF4EC" iconOpacity={0.8} iconScale={44 / 52} textOffsetX={-8} />
          </button>

          <div className="relative">
            <button
              onClick={() => setDesktopMenuOpen((o) => !o)}
              aria-label={desktopMenuOpen ? "Menu sluiten" : "Menu openen"}
              aria-haspopup="menu"
              aria-expanded={desktopMenuOpen}
              aria-controls="hero-desktop-menu"
              className="nav-link light cursor-pointer lg:!pr-0 lg:[&::after]:right-0"
            >
              <span className="flex flex-col items-end gap-[5px]">
                <HamburgerIcon open={desktopMenuOpen} />
              </span>
              Menu
            </button>
            <DesktopMenu open={desktopMenuOpen} onClose={() => setDesktopMenuOpen(false)} />
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
            <Logo className="h-[42px] w-auto" textColor="#FFFFFF" iconColor="#FAF4EC" iconOpacity={0.8} iconScale={34 / 42} />
          </button>
          <button
            onClick={onOpenMenu}
            aria-label="Menu openen"
            aria-expanded={false}
            className="flex flex-col items-end gap-[5px] p-2 -mr-2 cursor-pointer active:scale-90 transition-transform duration-200 rounded-sm"
          >
            <HamburgerIcon />
          </button>
        </m.div>

        <div className="flex-1 flex flex-col justify-end lg:justify-center lg:translate-y-15">
          {/* At 2xl+: titles/CTAs get max-w-[1280px] back so they stay in position */}
          <div className="mb-14 lg:mb-0">
            <div className="translate-y-4 lg:translate-y-8">
              <m.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.3}
                className="font-alice font-normal tracking-[-0.02em] lg:tracking-[-3px] text-[clamp(32px,7.5vw,88px)] leading-[clamp(40px,10vw,94px)] lg:text-[72px] lg:leading-[1.1] 2xl:text-[72px] 2xl:leading-[1.1]"
                style={{ marginLeft: "-3px", color: "#ffffff" }}
              >
                Een gouden gloed die blijft,{" "}<br className="hidden lg:inline" />
                begint bij{" "}
                <span className="relative inline-block">
                  Ever Sun
                  <HeroLines />
                </span>
              </m.h1>

              <m.p
                className="block mt-4 md:mt-3 font-sans font-normal text-[16px] md:text-[20px] leading-[25px] md:leading-[30px]"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.6}
                style={{ color: "rgba(255, 255, 255, 0.85)" }}
              >
                Even tijd voor jezelf in een zonnestudio met alle aandacht voor je huid.
              </m.p>

              <m.div
                className="mt-8 lg:mt-9 flex flex-row items-center w-full lg:w-auto gap-6 lg:gap-6"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.7}
              >
                <HeroButtons onOpenAfspraak={onOpenAfspraak} />
              </m.div>

              {/* Desktop: openingstijden (left) + reviews (right) on one row below the CTA */}
              <m.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.9}
                className="hidden lg:flex items-center justify-between w-full mt-10"
              >
                <HeroStatus onOpen={onOpenOpeningstijden} />
                <HeroReviews />
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
