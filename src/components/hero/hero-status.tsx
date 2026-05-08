"use client";

import { forwardRef, useEffect, useRef } from "react";
import Image from "next/image";
import statusOpen from "@/images/status-open.svg";
import clock from "@/images/icon-clock.svg";

export function getStudioStatus(): { isOpen: boolean; label: string } {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayStr = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const day = WEEKDAYS.indexOf(dayStr);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;

  if (day === 1) {
    return { isOpen: false, label: "Morgen open om 10:00u" };
  }

  if (day >= 2 && day <= 5) {
    if (hour < 10) return { isOpen: false, label: "Geopend om 10:00u" };
    if (hour < 21) return { isOpen: true, label: "Geopend tot 21:00u" };
    return { isOpen: false, label: "Morgen open om 10:00u" };
  }

  if (day === 6) {
    if (hour < 10) return { isOpen: false, label: "Geopend om 10:00u" };
    if (hour < 16) return { isOpen: true, label: "Geopend tot 16:00u" };
    return { isOpen: false, label: "Morgen open om 10:00u" };
  }

  // Sunday
  if (hour < 10) return { isOpen: false, label: "Geopend om 10:00u" };
  if (hour < 16) return { isOpen: true, label: "Geopend tot 16:00u" };
  return { isOpen: false, label: "Dinsdag open om 10:00u" };
}

const HeroStatus = forwardRef<HTMLButtonElement, { onOpen: () => void }>(function HeroStatus({ onOpen }, ref) {
  const { isOpen, label } = getStudioStatus();

  const labelRef = useRef(label);
  useEffect(() => {
    const check = () => {
      const { label: newLabel } = getStudioStatus();
      if (newLabel !== labelRef.current) {
        window.location.reload();
      }
    };

    const interval = setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  return (
    <>
      <button ref={ref} onClick={onOpen} data-status-button className="relative flex flex-row items-center gap-3 md:gap-[14px] cursor-pointer group">
      <span className={`flex items-center ${isOpen ? "gap-4 md:gap-[18px]" : "gap-3 md:gap-[14px]"}`}>
        <span className="relative flex items-center justify-center w-2.5 h-2.5 md:w-4 md:h-4 shrink-0">
          {isOpen ? (
            <>
              <span className="absolute inline-flex w-[14px] h-[14px] md:w-[22px] md:h-[22px] rounded-full bg-[#4FA800] opacity-60 animate-ping" />
              <span className="absolute inline-flex w-[14px] h-[14px] md:w-[22px] md:h-[22px] rounded-full bg-[#4FA800] opacity-40 animate-ping" style={{ animationDelay: "0.75s" }} />
              <Image src={statusOpen} alt="" width={16} height={16} className="block w-full h-full" />
            </>
          ) : (
            <span className="absolute inline-flex w-[10px] h-[10px] md:w-[14px] md:h-[14px] rounded-full bg-[#E15E1D]" />
          )}
        </span>
        <span data-status-text className="font-sans font-medium text-[15px] leading-none" style={{ color: "rgba(255, 255, 255, 0.7)" }} suppressHydrationWarning>
          {label}
        </span>
      </span>

      <span data-status-dash className="font-sans text-[15px]" style={{ color: "rgba(255, 255, 255, 0.7)" }}>-</span>

      <span data-status-times className="flex items-center gap-2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
        <Image src={clock} alt="" width={16} height={16} className="hidden md:block shrink-0" />
        <span className="font-sans font-medium text-[15px] leading-none">
          <span className="md:hidden">Openingstijden</span>
          <span className="hidden md:inline">Alle openingstijden</span>
        </span>
      </span>
      <span className="hidden md:block absolute -bottom-[6px] left-0 right-0 h-[1px] bg-[#FAF4EC]/50 transition-transform duration-300 ease-out scale-x-0 group-hover:scale-x-100 origin-right group-hover:origin-left" />
    </button>
    </>
  );
});

export default HeroStatus;
