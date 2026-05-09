"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import imageBig from "@/images/image-big.webp";
import imageRight from "@/images/image-right.webp";
import moreIcon from "@/images/camera-03.svg";
import dummyImg from "@/images/impressie/dummy.webp";
import dummy2Img from "@/images/impressie/dummy-2.webp";
import dummy3Img from "@/images/impressie/dummy-3.webp";
import dummy4Img from "@/images/impressie/dummy-4.webp";
import FotoBottomSheet from "@/components/foto-bottom-sheet";
import PhotoLightbox from "@/components/photo-lightbox";

const lightboxPhotos = [dummyImg, dummy2Img, dummy3Img, dummy4Img];

export default function PhotoCard() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const preloaded = useRef(new Set<string>());

  const preloadImage = useCallback((src: string) => {
    if (preloaded.current.has(src)) return;
    preloaded.current.add(src);
    const img = new window.Image();
    img.src = src;
  }, []);

  useEffect(() => {
    preloadImage(lightboxPhotos[0].src);
  }, [preloadImage]);

  useEffect(() => {
    const rIC = (window as Window & { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void }).requestIdleCallback;
    if (!rIC) return;
    const id = rIC(() => lightboxPhotos.slice(1).forEach((p) => preloadImage(p.src)));
    return () => window.cancelIdleCallback?.(id);
  }, [preloadImage]);

  const handleHoverPreload = useCallback(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    lightboxPhotos.slice(1).forEach((p) => preloadImage(p.src));
  }, [preloadImage]);

  const handlePhotoClick = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setLightboxOpen(true);
    } else {
      setSheetOpen(true);
    }
  };

  return (
    <>
      <div className="relative w-full h-[362px] xl:h-[431px] bg-white rounded-lg flex flex-col justify-between" style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
        <div className="relative grid grid-cols-2 grid-rows-[134px_1fr] md:flex xl:flex gap-[1px] mb-4 h-[220px] xl:h-[270px] rounded overflow-hidden">
          <button
            className="relative col-span-2 w-full h-full md:flex-[536] xl:flex-[536] cursor-pointer"
            onClick={handlePhotoClick}
            onMouseEnter={handleHoverPreload}
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
            onClick={handlePhotoClick}
            onMouseEnter={handleHoverPreload}
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
            className="md:hidden absolute bottom-3 right-3 z-10 flex items-center gap-2 text-sm font-medium text-zinc-500 cursor-pointer rounded-full border border-[#ece2d2] bg-[#faf4ec] px-[14px] py-1.5"
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
            className="hidden xl:flex items-center gap-2 text-sm font-medium text-zinc-500 whitespace-nowrap ml-4 cursor-pointer rounded-full border border-[#ece2d2] hover:border-zinc-500 transition-colors duration-150  px-[20px] py-[10px] translate-y-[10px]"
            onClick={() => setLightboxOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            Meer foto&apos;s
            <Image src={moreIcon} width={20} height={20} alt="Meer foto's bekijken" />
          </button>
        </div>
      </div>

      <FotoBottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
      <PhotoLightbox isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} photos={lightboxPhotos} />
    </>
  );
}
