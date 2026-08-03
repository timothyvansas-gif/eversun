"use client";

import { forwardRef, useEffect, useState } from "react";
import Image from "next/image";
import statusOpen from "@/images/status-open.svg";
import clock from "@/images/icon-clock.svg";
import { getStudioStatus } from "@/lib/studio-status";

const HeroStatus = forwardRef<HTMLButtonElement, { onOpen: () => void }>(function HeroStatus({ onOpen }, ref) {
  const [status, setStatus] = useState<{ isOpen: boolean; label: string } | null>(null);

  useEffect(() => {
    setStatus(getStudioStatus());

    const check = () => {
      setStatus((prev) => {
        const newStatus = getStudioStatus();
        // Reload if the status text actually changes while the user is on the page
        if (prev && prev.label && newStatus.label !== prev.label) {
          window.location.reload();
        }
        return newStatus;
      });
    };

    const interval = setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  if (!status) return null;

  const { isOpen, label } = status;

  return (
    <>
      <button
        ref={ref}
        onClick={onOpen}
        data-status-button
        // The visible text drops to an icon on narrow phones (see below), so the
        // accessible name has to carry the affordance on every width.
        aria-label={`${label} — bekijk alle openingstijden`}
        className={`relative flex flex-row items-center ${isOpen ? "gap-4 md:gap-[18px]" : "gap-3 md:gap-[14px]"} cursor-pointer group`}
      >
        <span className="relative flex items-center justify-center w-2.5 h-2.5 md:w-4 md:h-4 shrink-0">
          {isOpen ? (
            <>
              <span className="absolute inline-flex w-[14px] h-[14px] md:w-[22px] md:h-[22px] rounded-full bg-[#4FA800] opacity-60 animate-ping" />
              <span className="absolute inline-flex w-[14px] h-[14px] md:w-[22px] md:h-[22px] rounded-full bg-[#4FA800] opacity-40 animate-ping" style={{ animationDelay: "0.75s" }} />
              <Image src={statusOpen} alt="" width={16} height={16} className="block w-full h-full" />
            </>
          ) : (
            <span className="absolute inline-flex w-[10px] h-[10px] md:w-[14px] md:h-[14px] rounded-full bg-accent" />
          )}
        </span>

        {/* Text group holds the hover underline, so it starts at the first
            letter (left-0 here) rather than at the pulsing dot.

            Measured: the full row needs 329px on one line — the longest label
            ("Dinsdag open om 10:00u", Sunday evening) is 177px,
            "Openingstijden" another 107px, plus the dot, gaps and dash.
            Viewports leave (width - 48px) of padding-free room, so it fits
            from ~377px up: comfortable on a 393px iPhone 16, 8px short on a
            375px SE, which is what split the sentence across two lines.
            Below 390px the word is therefore dropped and the clock icon
            carries the affordance on its own. The status text itself, which
            is the actual message, is never abbreviated.

            flex-wrap plus nowrap on each chunk is the backstop for anything
            the media query cannot predict (larger default font size, a longer
            label later): the row then breaks between chunks instead of
            splitting a sentence down the middle. */}
        <span key={label} className="relative flex flex-wrap items-center gap-x-2 gap-y-1 md:gap-x-[14px]">
          <span data-status-text className="font-sans font-normal text-[15px] leading-none whitespace-nowrap" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
            {label}
          </span>

          <span data-status-dash className="hidden min-[390px]:inline font-sans text-[15px]" style={{ color: "rgba(255, 255, 255, 0.85)" }}>-</span>

          <span data-status-times className="flex items-center gap-2 whitespace-nowrap" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
            {/* Below 390px the icon replaces the dropped word; between 390 and
                md the word is back and the icon would only cost the 24px that
                makes the line fit, so it steps aside there and returns on
                desktop. */}
            <Image src={clock} alt="" width={16} height={16} className="block min-[390px]:hidden md:block shrink-0" />
            <span className="hidden min-[390px]:inline font-sans font-normal text-[15px] leading-none">
              <span className="md:hidden">Openingstijden</span>
              <span className="hidden md:inline">Alle openingstijden</span>
            </span>
          </span>

          <span className="hidden md:block absolute -bottom-[6px] left-0 right-0 h-[1px] bg-surface-page/50 transition-transform duration-300 ease-out scale-x-0 group-hover:scale-x-100 origin-right group-hover:origin-left" />
        </span>
      </button>
    </>
  );
});

export default HeroStatus;
