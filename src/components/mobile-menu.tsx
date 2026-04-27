"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import whatsappIcon from "@/images/whatsapp.svg";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navItems = ["Studio", "Banken", "Producten", "Over ons", "Contact"];

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? "0%" : "100%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 right-0 w-[95%] h-full bg-black z-[200] p-8 flex flex-col md:hidden"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="self-end p-2 mb-12 text-[#FAF4EC] active:scale-90 transition-transform"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-8">
        {navItems.map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase().replace(" ", "-")}`} 
            onClick={onClose}
            className="text-[28px] font-semibold text-[#FAF4EC] tracking-tight active:opacity-60 transition-opacity"
          >
            {item}
          </a>
        ))}
        
        <div className="h-[1px] bg-[#FAF4EC]/10 w-full my-2" />
        
        <a 
          href="https://wa.me/31625306491" 
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center gap-3 text-[28px] font-semibold text-[#FAF4EC] tracking-tight active:opacity-60 transition-opacity"
        >
          WhatsApp
          <Image 
            src={whatsappIcon} 
            alt="WhatsApp" 
            width={24} 
            height={24} 
            className="w-6 h-6 brightness-0 invert" 
          />
        </a>
      </nav>

      {/* Footer Info */}
      <div className="mt-auto pt-8 pb-8 flex flex-col gap-1">
        <p className="text-[#FAF4EC]/40 text-sm font-medium">
          Ever Sun Zonnestudio
        </p>
        <p className="text-[#FAF4EC]/40 text-sm font-medium">
          Kloekhorststraat 4a Assen
        </p>
        <a 
          href="tel:0625306491" 
          className="text-[#FAF4EC]/40 text-sm font-medium active:text-[#FAF4EC]"
        >
          Telefoon: 06 25306491
        </a>
      </div>
    </motion.div>
  );
}
