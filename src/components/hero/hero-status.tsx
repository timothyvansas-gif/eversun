"use client";

import Image from "next/image";
import statusOpen from "@/images/status-open.svg";
import clock from "@/images/icon-clock.svg";

export default function HeroStatus() {
  return (
    <button className="flex flex-col items-start gap-5 md:flex-row md:items-center md:gap-[14px] cursor-pointer group">
      <span className="flex items-center gap-[14px]">
        <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
          <span className="absolute inline-flex w-[22px] h-[22px] rounded-full bg-[#4FA800] opacity-60 animate-ping" />
          <span className="absolute inline-flex w-[22px] h-[22px] rounded-full bg-[#4FA800] opacity-40 animate-ping" style={{ animationDelay: "0.75s" }} />
          <Image src={statusOpen} alt="" width={16} height={16} className="block" />
        </span>
        <span className="font-sans font-medium text-[15px] text-[#FAF4EC] leading-none">
          Geopend tot 21:00 uur
        </span>
      </span>

      <span className="hidden md:inline font-sans text-[15px] text-[#FAF4EC] opacity-50">—</span>

      <span className="flex items-center gap-[14px] md:gap-2">
        <Image src={clock} alt="" width={16} height={16} className="block shrink-0" />
        <span className="font-sans font-medium text-[15px] text-[#FAF4EC] leading-none">
          Alle openingstijden
        </span>
      </span>
    </button>
  );
}
