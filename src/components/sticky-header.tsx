"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Logo from "@/components/logo";

export default function StickyHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Show header after scrolling past the hero (roughly 700px)
    if (latest > 700) {
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
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-50 bg-black h-14 flex items-center md:hidden"
        >
          <div className="w-full flex items-center justify-between px-6">
            {/* Smaller logo with specific colors */}
            <Logo 
              className="h-8 w-auto" 
              textColor="#FAF4EC" 
              iconColor="#FAF4EC" 
            />

            {/* Hamburger Menu */}
            <button className="flex flex-col items-end gap-[5px] p-2 cursor-pointer active:scale-90 transition-transform duration-200">
              <span className="w-6 h-[1.5px] bg-[#FAF4EC] rounded-full" />
              <span className="w-4 h-[1.5px] bg-[#FAF4EC] rounded-full" />
              <span className="w-6 h-[1.5px] bg-[#FAF4EC] rounded-full" />
            </button>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
