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

export default function HeroContent({ onOpenMenu }: { onOpenMenu: () => void }) {
  const lenis = useLenis();
  const { scrollToNav } = useScrollNav();

  return (
    <div className="absolute inset-0 flex flex-col z-20">
      <div
        className="w-full max-w-[1440px] mx-auto flex-1 flex flex-col justify-between lg:justify-start"
        style={{ 
          paddingTop: "calc(clamp(1.5rem, 4vw, 3.5rem) + env(safe-area-inset-top))",
          paddingBottom: "clamp(1.5rem, 4vw, 3.5rem)",
          paddingLeft: "clamp(1.5rem, 4vw, 5rem)",
          paddingRight: "clamp(1.5rem, 4vw, 5rem)"
        }}
      >
        {/* Desktop Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex items-center justify-between"
        >
          <button 
            onClick={() => lenis?.scrollTo(0)}
            className="cursor-pointer active:scale-95 transition-transform duration-200"
          >
            <Logo className="h-[52px] w-auto" textColor="#FAF4EC" iconColor="#FAF4EC" />
          </button>
          
          <nav className="flex items-center gap-1">
            {["Studio", "Banken", "Producten", "Over ons", "Contact"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(" ", "-")}`} 
                className="nav-link light"
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
            
            <a 
              href="#" 
              className="nav-link light"
            >
              WhatsApp
              <Image 
                src={whatsappIcon} 
                alt="WhatsApp" 
                width={18} 
                height={18} 
                className="w-[18px] h-[18px] brightness-0 invert" 
              />
            </a>
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
            onClick={() => lenis?.scrollTo(0)}
            className="cursor-pointer active:scale-95 transition-transform duration-200"
          >
            <Logo className="h-[42px] w-auto" textColor="#FAF4EC" iconColor="#FAF4EC" />
          </button>
          <button
            onClick={onOpenMenu}
            className="flex flex-col items-end gap-[5px] p-2 -mr-2 cursor-pointer active:scale-90 transition-transform duration-200"
          >
            <HamburgerIcon />
          </button>
        </motion.div>

        <div className="flex-1 flex flex-col justify-end lg:translate-y-8">
          <div className="mb-18 lg:mb-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
            <div>
              <motion.h1
                className="font-alice font-medium text-[#FAF4EC] tracking-[-0.02em] lg:tracking-[-3px]"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.3}
                style={{
                  fontSize: "clamp(56px, 7.5vw, 96px)",
                  lineHeight: "clamp(58px, 7.8vw, 100px)",
                  marginLeft: "-3px",
                }}
              >
                De perfecte gouden gloed
              </motion.h1>

              <motion.p
                className="mt-4 lg:mt-3 font-alice font-normal text-[#FAF4EC] tracking-[-0.5px] lg:tracking-[-1.5px]"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.5}
                style={{
                  fontSize: "clamp(21px, 3.44vw, 44px)",
                  lineHeight: "clamp(27px, 4.06vw, 52px)",
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
                <HeroButtons />
              </motion.div>
            </div>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.9}
            className="mb-10 lg:mb-[48px] flex items-center justify-between"
          >
            <HeroStatus />
            <HeroReviews />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
