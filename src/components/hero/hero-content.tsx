"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useScrollNav } from "@/hooks/use-scroll-nav";
import HeroLines from "./hero-lines";
import HeroButtons from "./hero-buttons";
import HeroStatus from "./hero-status";
import HeroReviews from "./hero-reviews";
import Logo from "@/components/logo";
import HamburgerIcon from "@/components/hamburger-icon";
import whatsappIcon from "@/images/whatsapp.svg";
import { NAV_ITEMS } from "@/lib/nav-items";

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
  const { scrollToNav } = useScrollNav();
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex items-center justify-between"
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Naar begin van de pagina"
            className="cursor-pointer active:scale-95 transition-transform duration-200 rounded-sm"
          >
            <Logo className="h-[52px] w-auto" textColor="#FFFFFF" iconColor="#FAF4EC" iconOpacity={0.8} iconScale={48 / 52} />
          </button>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="nav-link light"
                style={{ color: "rgba(255, 255, 255, 0.85)" }}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToNav(item);
                }}
              >
                {item}
              </a>
            ))}

            <div className="w-[1px] h-6 bg-[#FAF4EC]/20 mx-2" />

            <button
              onClick={onOpenAfspraak}
              className="nav-link light cursor-pointer lg:!pr-0"
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
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Naar begin van de pagina"
            className="cursor-pointer active:scale-95 transition-transform duration-200 rounded-sm"
          >
            <Logo className="h-[42px] w-auto" textColor="#FFFFFF" iconColor="#FAF4EC" iconOpacity={0.8} />
          </button>
          <button
            onClick={onOpenMenu}
            aria-label="Menu openen"
            aria-expanded={false}
            className="flex flex-col items-end gap-[5px] p-2 -mr-2 cursor-pointer active:scale-90 transition-transform duration-200 rounded-sm"
          >
            <HamburgerIcon />
          </button>
        </motion.div>

        <div className="flex-1 flex flex-col justify-end lg:justify-center lg:translate-y-14">
          {/* At 2xl+: titles/CTAs get max-w-[1280px] back so they stay in position */}
          <div className="mb-18 lg:mb-0">
            <div className="translate-y-4 lg:translate-y-0">
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.3}
                className="font-alice font-normal tracking-[-0.02em] lg:tracking-[-3px] text-[clamp(32px,7.5vw,88px)] leading-[clamp(45px,7.8vw,95px)] lg:text-[66px] lg:leading-[80px] 2xl:text-[72px] 2xl:leading-[78px]"
                style={{ marginLeft: "-3px", color: "#ffffff" }}
              >
                Een gouden gloed die blijft,{" "}<br className="hidden lg:inline" />
                begint bij{" "}
                <span className="relative inline-block">
                  Ever Sun
                  <HeroLines />
                </span>
              </motion.h1>

              <motion.p
                className="block mt-3 md:mt-4 font-sans font-normal text-[15px] leading-[24px]"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.6}
                style={{ color: "rgba(255, 255, 255, 0.75)" }}
              >
                Jouw zonnestudio voor persoonlijk advies, verantwoord zonnen en een natuurlijk resultaat.
              </motion.p>

              <motion.div
                className="mt-7 lg:mt-9 flex flex-row items-center w-full lg:w-auto gap-6 lg:gap-6"
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
