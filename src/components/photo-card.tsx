"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import imageBig from "@/images/image-big.webp";
import imageRight from "@/images/image-right.webp";
import moreIcon from "@/images/camera-03.svg";
import FotoBottomSheet, { sheetPhotos } from "@/components/foto-bottom-sheet";

export default function PhotoCard() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const preloaded = useRef(new Set<string>());

  const preloadImage = useCallback((src: string) => {
    if (preloaded.current.has(src)) return;
    preloaded.current.add(src);
    const img = new window.Image();
    img.src = src;
  }, []);

  // Preload the gallery only when the visitor signals intent (hover, touch or
  // keyboard focus on the card) instead of on every page load. Same full-size
  // images — only the timing changes — so the sheet still opens instantly once
  // intent is shown, without costing ~0.5MB up front for visitors who never
  // open it.
  const preloadAll = useCallback(() => {
    sheetPhotos.forEach((p) => preloadImage(p.src));
  }, [preloadImage]);

  return (
    <>
      <div
        className="relative w-full h-[362px] xl:h-[431px] bg-white rounded-[12px] flex flex-col justify-between"
        style={{ padding: 'clamp(24px, 4vw, 40px)' }}
        onPointerEnter={preloadAll}
        onFocusCapture={preloadAll}
      >
        <div className="relative grid grid-cols-2 grid-rows-[134px_1fr] md:flex xl:flex gap-[1px] mb-4 h-[220px] xl:h-[270px] rounded-[12px] overflow-hidden">
          <button
            className="relative col-span-2 w-full h-full md:flex-[536] xl:flex-[536] cursor-pointer"
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            <Image
              src={imageBig}
              alt="Sfeervol interieur van Ever Sun zonnestudio met houten tafel en witte stoelen"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 536px"
            />
          </button>
          <button
            className="relative w-full h-full md:block xl:block md:flex-[235] xl:flex-[235] cursor-pointer"
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            <Image
              src={imageRight}
              alt="Interieur detail van de zonnestudio"
              fill
              className="object-cover"
              sizes="235px"
            />
          </button>
          <button
            className="relative w-full h-full md:hidden cursor-pointer"
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            <Image
              src={imageRight}
              alt="Interieur detail"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </button>
          <button
            className="md:hidden absolute bottom-3 right-3 z-10 flex items-center gap-2 text-sm font-medium text-zinc-500 cursor-pointer rounded-full border border-[#ece2d2] bg-surface-page px-[14px] py-1.5"
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            Meer
            <Image src={moreIcon} width={16} height={16} alt="Meer foto's bekijken" />
          </button>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="card-title text-zinc-900">Een warm welkom</h3>
            <p className="card-body text-zinc-500 mt-1">
              De koffie en thee staan klaar: jouw moment van rust begint hier
            </p>
          </div>
          <button
            className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-500 whitespace-nowrap ml-4 cursor-pointer rounded-full border border-[#ece2d2] hover:border-zinc-500 transition-colors duration-150  px-[20px] py-[10px] translate-y-[10px]"
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            Meer foto&apos;s
            <Image src={moreIcon} width={20} height={20} alt="Meer foto's bekijken" />
          </button>
        </div>
      </div>

      <FotoBottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
