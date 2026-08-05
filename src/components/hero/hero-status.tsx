"use client";

import { forwardRef, useEffect, useState } from "react";
import Image from "next/image";
import statusOpen from "@/images/status-open.svg";
import clock from "@/images/icon-clock.svg";
import { getStudioStatus } from "@/lib/studio-status";

const HeroStatus = forwardRef<HTMLButtonElement, { onOpen: () => void }>(function HeroStatus({ onOpen }, ref) {
  const [status, setStatus] = useState<{ isOpen: boolean; label: string } | null>(null);

  // Re-read every minute and whenever the tab comes back, so the studio does
  // not stay "Geopend tot 21:00u" at five past nine.
  //
  // The label used to reload the whole page when it changed. That threw away
  // the visitor's scroll position, any open sheet and a half-typed contact
  // form to update one line of text this very state already updates — and it
  // sat inside the updater, which React is free to call twice. Everything else
  // that reads the status (the hours table, the dot in the overlay) mounts when
  // its overlay opens, so it computes a fresh answer without any help.
  useEffect(() => {
    const check = () => setStatus(getStudioStatus());
    check();

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
    <button
      ref={ref}
      onClick={onOpen}
      data-status-button
      // The visible text drops to an icon on narrow phones (see below), so the
      // accessible name has to carry the affordance on every width.
      aria-label={`${label} — bekijk alle openingstijden`}
      // Closed sits tighter than open, and by more than the marks differ on
      // paper. Open is a 16px badge with two ping rings breathing past it, so
      // it fills its slot and holds the label at arm's length; closed is a
      // bare 10px dot that reads as adrift at the same distance. Optical
      // spacing, so the number is what looks equal, not what measures equal.
      className={`relative flex flex-row items-center ${isOpen ? "gap-4 md:gap-[18px]" : "gap-2 md:gap-[10px]"} cursor-pointer group`}
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

          Two widths for the trailing link, measured against the longest
          label ("Dinsdag open om 10:00u", Sunday evening, 177px). Viewports
          leave (width - 48px) of padding-free room:

            "Tijden"      288px total → fits from ~336px, so every phone in
                          use: 327px of room on a 375px SE, 345px on a 393px
                          iPhone 16
            icon only     222px total → the 320px fallback

          One word at every width. The clock already says what this is, and
          the full sentence needed 351px — it only fit from ~399px up, which
          is what split the row across two lines on a 375px SE. The status
          text itself, which is the actual message, is never abbreviated.

          flex-wrap plus nowrap on each chunk is the backstop for anything
          the media query cannot predict (larger default font size, a longer
          label later): the row then breaks between chunks instead of
          splitting a sentence down the middle. */}
      <span key={label} className="relative flex flex-wrap items-center gap-x-2 gap-y-1 md:gap-x-[14px]">
        <span data-status-text className="font-sans font-normal text-[15px] leading-none whitespace-nowrap" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
          {label}
        </span>

        <span data-status-dash className="font-sans text-[15px]" style={{ color: "rgba(255, 255, 255, 0.85)" }}>-</span>

        <span data-status-times className="flex items-center gap-2 whitespace-nowrap" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
          <Image src={clock} alt="" width={16} height={16} className="block shrink-0" />
          <span className="hidden min-[340px]:inline font-sans font-normal text-[15px] leading-none">
            Tijden
          </span>
        </span>

        <span className="hidden md:block absolute -bottom-[6px] left-0 right-0 h-[1px] bg-surface-page/50 transition-transform duration-300 ease-out scale-x-0 group-hover:scale-x-100 origin-right group-hover:origin-left" />
      </span>
    </button>
  );
});

export default HeroStatus;
