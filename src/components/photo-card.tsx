"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import imageBig from "@/images/links-home.webp";
import FotoBottomSheet, { sheetPhotos } from "@/components/foto-bottom-sheet";

/**
 * Inline, niet als <Image>: het bronbestand had stroke="#0B0B0B" ingebakken,
 * dus het icoon kon de kleur van zijn knop niet volgen. Met currentColor
 * bepaalt de tekstkleur van de knop nu ook het icoon, en scheelt het een
 * request.
 */
function CameraIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M2 7.8C2 6.11984 2 5.27976 2.32698 4.63803C2.6146 4.07354 3.07354 3.6146 3.63803 3.32698C4.27976 3 5.11984 3 6.8 3H17.2C18.8802 3 19.7202 3 20.362 3.32698C20.9265 3.6146 21.3854 4.07354 21.673 4.63803C22 5.27976 22 6.11984 22 7.8V16.2C22 17.8802 22 18.7202 21.673 19.362C21.3854 19.9265 20.9265 20.3854 20.362 20.673C19.7202 21 18.8802 21 17.2 21H6.8C5.11984 21 4.27976 21 3.63803 20.673C3.07354 20.3854 2.6146 19.9265 2.32698 19.362C2 18.7202 2 17.8802 2 16.2V7.8Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

import { OUTLINE_BORDER_COLOR } from "@/lib/button-styles";

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
    sheetPhotos.forEach((p) => preloadImage(p.src.src));
  }, [preloadImage]);

  return (
    <>
      <div
        className="relative w-full h-[362px] xl:h-[431px] bg-white rounded-[12px] flex flex-col justify-between"
        style={{ padding: 'clamp(24px, 4vw, 40px)' }}
        onPointerEnter={preloadAll}
        onFocusCapture={preloadAll}
      >
        {/* One photo, at every width. It used to be a three-tile mosaic — a wide
            one over two halves on phones, a wide beside a single from md — and
            the grid/flex pair of layouts existed only to arrange those. With a
            single tile there is nothing left to arrange, so the container is a
            plain box and the button simply fills it.

            The photo button carries focus-ring-clipped: it runs edge to edge
            inside this rounded, clipping box, so the site's outward focus ring
            would be cut off. See globals.css. The "Meer" pill sits 12px inside
            the clip and keeps the normal ring. */}
        <div className="relative mb-4 h-[220px] xl:h-[270px] rounded-[8px] overflow-hidden">
          <button
            className="focus-ring-clipped relative block w-full h-full cursor-pointer"
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            <Image
              src={imageBig}
              alt="De balie van Ever Sun met verse bloemen, verzorgingsproducten en de lounge op de achtergrond"
              fill
              // Phones see only the middle ~50% of this photo — the box is 1.27
              // wide against the image's 2.53 — and the centre landed on the
              // white shelf and the glass bowl, the coolest corner of the room.
              // Shifting the window left to 28% brings the lit lounge into it
              // and still keeps the vase and bottles at the right edge; 0% was
              // too far and cut the bottles in half. Both sides are written as
              // the same arbitrary property so the sm rule reliably wins.
              className="object-cover [object-position:28%_50%] sm:[object-position:50%_50%]"
              sizes="(max-width: 768px) 100vw, 772px"
            />
          </button>
          <button
            className="md:hidden absolute bottom-3 right-3 z-10 flex items-center gap-2 text-sm font-medium cursor-pointer rounded-full text-ink-primary bg-white px-[14px] py-1.5"
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            Alle foto&apos;s
            <CameraIcon size={16} />
          </button>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="card-title text-zinc-900">Een warm welkom</h3>
            <p className="card-body text-zinc-500 mt-1">
              Geen haast, geen verplichting: jouw moment van rust begint hier
            </p>
          </div>
          <button
            // Niet BTN_OUTLINE_BORDER: die hovert naar zinc-900, en hier gaan
            // label en icoon naar ink-primary. In rust dragen ze de kleur van
            // de bodytekst ernaast (zinc-500), zodat de knop meeleest met de
            // kaart in plaats van erbovenop te liggen. Het icoon volgt vanzelf:
            // CameraIcon tekent met currentColor. Alleen de rand-hover uit de
            // gedeelde constante overnemen, zonder !important dat die hover zou
            // moeten overschrijven.
            className={`hidden md:flex items-center gap-2 text-sm font-medium whitespace-nowrap ml-4 cursor-pointer rounded-full border ${OUTLINE_BORDER_COLOR} hover:border-ink-primary text-zinc-500 hover:text-ink-primary transition-colors duration-150 px-[20px] py-[10px] translate-y-[10px]`}
            onClick={() => setSheetOpen(true)}
            aria-label="Alle foto's bekijken"
          >
            Alle foto&apos;s
            <CameraIcon size={20} />
          </button>
        </div>
      </div>

      <FotoBottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
