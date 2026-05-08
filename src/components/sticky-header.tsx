"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, type Transition, type TargetAndTransition } from "framer-motion";
import { useLenis } from "lenis/react";
import Logo from "@/components/logo";
import HamburgerIcon from "@/components/hamburger-icon";

export default function StickyHeader({
  onOpenMenu,
  animate,
  transition
}: {
  onOpenMenu: () => void;
  animate: TargetAndTransition;
  transition: Transition;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const lenis = useLenis();

  useEffect(() => {
    if (window.scrollY > 570) {
      setIsVisible(true);
    }
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 550) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0, ...animate }}
          exit={{ y: -100 }}
          transition={{
            y: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
            marginLeft: transition
          }}
          className="fixed top-0 left-0 right-0 z-50 bg-black h-14 flex items-center lg:hidden"
        >
          <div className="w-full flex items-center justify-between px-6">
            {/* Smaller logo with specific colors */}
            <button
              onClick={() => lenis?.scrollTo(0, { duration: 1.0 })}
              className="cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <Logo
                className="h-8 w-auto"
                textColor="#FFFFFF"
                iconColor="#FAF4EC"
              />
            </button>

            <button
              onClick={onOpenMenu}
              className="flex flex-col items-end gap-[5px] p-2 cursor-pointer active:scale-90 transition-transform duration-200"
            >
              <HamburgerIcon />
            </button>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
