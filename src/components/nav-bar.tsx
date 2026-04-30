"use client";

import Logo from "@/components/logo";
import Image from "next/image";
import { useScrollNav } from "@/hooks/use-scroll-nav";
import whatsappIcon from "@/images/whatsapp.svg";

export default function NavBar() {
  const { scrollToNav } = useScrollNav();
  const navItems = ["Studio", "Banken", "Producten", "Over ons", "Contact"];

  const handleScroll = (e: React.MouseEvent, item: string) => {
    if (item === "Studio") {
      e.preventDefault();
      scrollToNav("Studio");
    }
  };

  return (
    <header className="w-full bg-surface-page hidden md:block">
      <div className="w-full h-16 lg:h-[105px] max-w-[1280px] mx-auto flex items-center justify-between px-6 lg:px-0">
        <Logo className="h-10 w-auto lg:h-[52px] text-black" />
        
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(" ", "-")}`} 
              className="nav-link"
              onClick={(e) => handleScroll(e, item)}
            >
              {item}
            </a>
          ))}
          
          <div className="w-[1px] h-6 bg-[#F5E9DA] mx-2" />
          
          <a href="#" className="nav-link">
            WhatsApp
            <Image 
              src={whatsappIcon} 
              alt="WhatsApp" 
              width={18} 
              height={18} 
              className="w-[18px] h-[18px]" 
            />
          </a>
        </nav>
      </div>
    </header>
  );
}
