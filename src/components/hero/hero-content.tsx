"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useScrollNav } from "@/hooks/use-scroll-nav";
import HeroLines from "./hero-lines";
import HeroButtons from "./hero-buttons";
import HeroStatus from "./hero-status";
import HeroReviews from "./hero-reviews";
import Logo from "@/components/logo";
import HamburgerIcon from "@/components/hamburger-icon";
import whatsappIcon from "@/images/whatsapp.svg";

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
  const lenis = useLenis();
  const { scrollToNav } = useScrollNav();
  return (
    <div
      className="absolute inset-0 flex flex-col z-20"
      style={{
        paddingTop: "calc(clamp(1.5rem, 4vw, 3.5rem) + env(safe-area-inset-top))",
        paddingBottom: "clamp(1.5rem, 4vw, 3.5rem)",
        paddingLeft: "clamp(1.5rem, 4vw, 3.5rem)",
        paddingRight: "clamp(1.5rem, 4vw, 3.5rem)"
      }}
    >
      {/* Below 2xl: max-w-[1280px] contains everything (MacBook). At 2xl+: max-w-none so header/status go edge-to-edge. */}
      <div
        className="max-w-[1280px] w-full mx-auto 2xl:max-w-none flex-1 flex flex-col justify-between lg:justify-start"
      >
        {/* Desktop Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex items-center justify-between"
        >
          <button
            onClick={() => lenis?.scrollTo(0, { duration: 1.0 })}
            className="cursor-pointer active:scale-95 transition-transform duration-200"
          >
            <Logo className="h-[52px] w-auto" textColor="#FFFFFF" iconColor="#FAF4EC" iconOpacity={0.8} iconScale={48 / 52} />
          </button>

          <nav className="flex items-center gap-1">
            {["Studio", "Banken", "Producten", "Over ons", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="nav-link light"
                style={{ color: "rgba(255, 255, 255, 0.96)" }}
                onClick={(e) => {
                  if (item === "Studio") {
                    e.preventDefault();
                    scrollToNav("Studio");
                  }
                }}
              >
                {item}
              </a>
            ))}

            <div className="w-[1px] h-6 bg-[#FAF4EC]/20 mx-2" />

            <button
              onClick={onOpenAfspraak}
              className="nav-link light cursor-pointer"
            >
              WhatsApp
              <Image
                src={whatsappIcon}
                alt="WhatsApp"
                width={18}
                height={18}
                className="w-[18px] h-[18px] brightness-0 invert"
              />
            </button>
          </nav>
        </motion.div>

        {/* Mobile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:hidden flex items-center justify-between"
        >
          <button
            onClick={() => lenis?.scrollTo(0, { duration: 1.0 })}
            className="cursor-pointer active:scale-95 transition-transform duration-200"
          >
            <Logo className="h-[38px] w-auto" textColor="#FFFFFF" iconColor="#FAF4EC" iconOpacity={0.8} />
          </button>
          <button
            onClick={onOpenMenu}
            className="flex flex-col items-end gap-[5px] p-2 -mr-2 cursor-pointer active:scale-90 transition-transform duration-200"
          >
            <HamburgerIcon />
          </button>
        </motion.div>

        <div className="flex-1 flex flex-col justify-end lg:translate-y-8">
          {/* At 2xl+: titles/CTAs get max-w-[1280px] back so they stay in position */}
          <div className="mb-18 lg:mb-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center 2xl:max-w-[1280px] 2xl:w-full 2xl:mx-auto">
            <div className="lg:translate-y-10">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.3}>
                <h1
                  className="font-alice font-medium tracking-[-0.02em] lg:tracking-[-3px] text-[clamp(56px,7.5vw,96px)] leading-[clamp(58px,7.8vw,100px)] 2xl:text-[clamp(56px,7.5vw,112px)] 2xl:leading-[clamp(58px,7.8vw,118px)]"
                  style={{ marginLeft: "-3px", color: "rgba(255, 255, 255, 1)" }}
                >
                  De perfecte gouden gloed
                </h1>
              </motion.div>

              <motion.p
                className="mt-4 lg:mt-3 font-alice font-normal tracking-[-0.5px] lg:tracking-[-1.5px]"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.5}
                style={{
                  fontSize: "clamp(21px, 3.44vw, 44px)",
                  lineHeight: "clamp(27px, 4.06vw, 52px)",
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                begint bij zonnestudio{" "}
                <span className="relative inline-block">
                  Ever Sun
                  <HeroLines />
                </span>
              </motion.p>

              <motion.div
                className="mt-10 lg:mt-11 flex flex-col sm:flex-row gap-4 md:gap-6"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.7}
              >
                <HeroButtons onOpenAfspraak={onOpenAfspraak} />
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.9}
          className="mb-4 lg:mb-0 flex items-center justify-between"
        >
          <HeroStatus ref={statusButtonRef} onOpen={onOpenOpeningstijden} />
          <HeroReviews />
        </motion.div>
      </div>
    </div>
  );
}
