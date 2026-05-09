"use client";

import { useState } from "react";
import Image from "next/image";
import imageBig from "@/images/image-big.webp";
import imageRight from "@/images/image-right.webp";
import moreIcon from "@/images/more-icon.svg";
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
        <div className="relative grid grid-cols-2 grid-rows-[134px_1fr] md:flex xl:flex gap-[1px] xl:gap-[2px] mb-4 h-[220px] xl:h-[270px] rounded overflow-hidden">
          <button
            className="relative col-span-2 w-full h-full md:flex-[536] xl:flex-[536] cursor-pointer"
            onClick={handlePhotoClick}
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
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="card-title text-zinc-900">Een warm welkom</h3>
            <p className="card-body text-zinc-500 mt-1">
              De koffie en thee staan klaar: jouw moment van rust begint hier
            </p>
          </div>
          <button
            className="md:hidden flex items-center justify-center flex-shrink-0 ml-4 mb-[4px]"
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            <Image src={moreIcon} width={20} height={20} alt="Meer foto's bekijken" />
          </button>
          <button
            className="hidden xl:flex items-center gap-2 text-sm font-medium text-zinc-500 whitespace-nowrap ml-4 cursor-pointer"
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
