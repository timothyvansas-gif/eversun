"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { arrangeForSlots, type Slot } from "@/lib/sheet-layout";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { Backdrop } from "@/components/ui/backdrop";
import { CloseButton } from "@/components/ui/close-button";
import tafelImg from "@/images/tafel.webp";
import bankRoodImg from "@/images/bank-rood.webp";
import stoelHoekImg from "@/images/stoel-hoek.webp";
import liggendImg from "@/images/liggend.webp";
import blueImg from "@/images/blue.webp";
import deurenImg from "@/images/deuren.webp";
import bankLiggendImg from "@/images/bank-liggend.webp";
import ergolineNeonImg from "@/images/ergoline-neon.webp";
import productenDisplayImg from "@/images/producten-display.webp";
import candyTheeImg from "@/images/candy-thee.webp";
import kopImg from "@/images/kop.webp";
import kop2Img from "@/images/kop2.webp";
import zakjesImg from "@/images/zakjes.webp";
import wastafelsImg from "@/images/wastafels.webp";

/**
 * A photo, what it shows, and where to hold it while cropping.
 *
 * The alt is per photo rather than generated, so a screen reader gets the room
 * instead of "impressie 7".
 *
 * `focus` is an object-position value and only matters where the tile crops
 * hard — a landscape shot in a single tile loses half its width, and a centred
 * crop lands wherever it lands. Leave it off and the crop stays centred.
 */
type SheetPhoto = { src: StaticImageData; alt: string; focus?: string };

// Order is reading order, nothing else. arrangeForSlots fits this list to the
// mosaic below, so adding, removing or reordering photos cannot put a portrait
// shot in a wide tile.
export const sheetPhotos: SheetPhoto[] = [
  { src: bankRoodImg, alt: "Een Ergoline-zonnebank in de cabine, badend in rood en paars licht" },
  {
    src: wastafelsImg,
    alt: "De wastafels met zwarte glazen kommen en een verlichte spiegel",
    // In a single tile only half this photo's width survives. Centred, that
    // half is the wall to the right of the bowls; held near the left edge it is
    // both bowls, the candles and the mirror. 15% rather than 0 so the frame
    // does not sit hard against the left wall.
    focus: "15% center",
  },
  // The first upright photo in the sheet. Third on purpose: on desktop that is
  // a 5/6 single, on phones the right half of the pair — both upright, so it is
  // the one slot in the sheet that costs it almost no crop.
  { src: stoelHoekImg, alt: "Een witte kuipstoel bij de spiegelwand, met dispenser en spiegel" },
  // Straight under the pair on phones, in the row of three singles on desktop.
  { src: liggendImg, alt: "Een geopende zonnebank in de cabine, met marmerwand en speakers" },
  // Beside the shot above it: same row of singles on desktop, straight under it
  // on phones. At 1.83 against a 5/6 tile, desktop keeps an upright slice
  // through the middle of the bed — the phone tile shows the whole frame.
  { src: blueImg, alt: "Een zonnebank in blauw licht, met de marmerwand ernaast" },
  // Een eigen rij tussen de twee rijen van drie: de schappen liggend op de
  // brede tegel, de snoepetagere staand ernaast. Op mobiel zijn het allebei
  // volle 16/9-tegels, dus daar staan ze gewoon liggend onder elkaar.
  { src: productenDisplayImg, alt: "De schappen met verzorgingsproducten voor en na het zonnen" },
  {
    src: candyTheeImg,
    alt: "Een etagere met snoep en een kistje thee op de leestafel",
    // Op mobiel blijft 44% van de hoogte over. Gecentreerd is dat 28 tot 72%:
    // de onderkant van de bovenste schaal en de stam, met het snoep net onder
    // de rand. Op 70% schuift de band naar 39 tot 83% en staan de schaal met
    // snoep en het theekistje er allebei heel in. Op desktop snijdt deze foto
    // maar 5% van zijn hoogte weg, dus daar verandert het nauwelijks iets.
    focus: "center 70%",
  },
  // Het tweede telefoonpaar, en op desktop de eerste twee van de rij van drie
  // singles eronder. Allebei staand, dus geen van beide snijdt veel weg.
  { src: kopImg, alt: "Het bedieningspaneel aan de kop van de zonnebank, met speakers" },
  { src: kop2Img, alt: "De kop van de zonnebank in blauw licht, met de marmerwand" },
  // Closes that row of three on desktop. Upright, so the full-width phone tile
  // keeps a band across the middle of the stack.
  { src: zakjesImg, alt: "Een stapel Ergoline-verfrissingsdoekjes, fresh & clean" },
  // Negende, dus op de brede tegel: deze foto moet liggend blijven, en dat is
  // de enige tegelvorm die dat op desktop garandeert.
  { src: bankLiggendImg, alt: "Een Ergoline-zonnebank in paars en roze licht, met de rotswand ernaast" },
  // Bewust in de smalle 5/6-tegel ernaast: op desktop staat de leestafel dus
  // staand. Dat snijdt deze lange lage foto tot de middelste helft van zijn
  // breedte — de tafel met tijdschriften blijft, de randen vallen weg. Op
  // mobiel is de tegel 16/9 en zie je hem alsnog liggend.
  { src: tafelImg, alt: "De leestafel van massief hout met tijdschriften" },
  // Dezelfde rij nog een keer, met de gang op de brede tegel in plaats van de
  // leestafel. Op 2,02 is dit de breedste foto van de set, dus de brede tegel
  // kost hem alleen wat aan de zijkanten.
  { src: deurenImg, alt: "De gang langs de cabines, met open deuren en gekleurd licht" },
  // Sluit de sheet af op de laatste staande tegel. Staand van zichzelf, dus op
  // desktop past hij bijna zonder uitsnede; op mobiel is de tegel 16/9 en wordt
  // het een band over het midden.
  {
    src: ergolineNeonImg,
    alt: "Het Ergoline-logo in roze neon boven de zonnebank",
    // Op mobiel overleeft maar 42% van de hoogte. Gecentreerd begint die band
    // op 29% en snijdt dwars door het logo, dat op 14 tot 44% zit — je leest
    // dan "goline". Op 20% begint de band op 12% en past het logo er heel in,
    // met het bedieningspaneel eronder nog mee.
    focus: "center 20%",
  },
];

// Column spans on the desktop grid: a wide one beside a single, a row of three
// singles, that pair again, nog een rij van drie, en dan twee rijen met een
// brede naast een smalle. Every row adds up to the full three columns, so the
// mosaic never leaves a hole and no tile has to be reordered to fill one.
//
// The pattern used to run [2,1,1,1,1,1,2], with a second wide tile closing each
// cycle. That put a wide slot at index 6 — and the phone pairs need two singles
// side by side there, since a pair member lands in its own cell on desktop and
// an upright photo in a wide tile is cropped to a band across its middle. One
// wide tile per cycle is the price of the second pair.
//
// Rows are all the same height — the variety comes from the wide tiles, not
// from differing row heights. The singles carry the aspect ratio and so set
// that height; a wide tile is left to stretch into it.
// De cyclus is even lang als de lijst zelf: veertien tegels, achttien kolommen,
// zes volle rijen. Zodra er een rij tussen komt schuift alles erachter een plek
// op, en dan moet dit patroon mee — een brede tegel op de verkeerde index laat
// een rij een kolom openhouden. Wie hier een foto toevoegt, telt de rijen na.
const LG_SPANS: Slot[] = [2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1];

// Phones get one column of 16/9 tiles. These two are the exception: they share
// a single slot side by side, half width each, so the scroll opens with a wide
// shot and then a pair of upright ones instead of another letterbox.
//
// The pair sits in a wrapper that carries the 16/9 itself, which is what keeps
// its height exactly that of a full-width tile — no viewport arithmetic, no
// second aspect ratio to keep in sync. From md the wrapper is display:contents,
// so it drops out of the layout and the tablet and desktop grids receive the
// two tiles as their own cells. The mosaic above lg is untouched.
//
// Indices, not counts: they are positions in `arranged`, so a pair stays put if
// photos are added after it. Both members of a pair must sit in single slots on
// desktop — see LG_SPANS.
const MOBILE_PAIRS: readonly (readonly [number, number])[] = [
  [1, 2],
  [7, 8],
];

const isPaired = (i: number) => MOBILE_PAIRS.some(([start, end]) => i >= start && i <= end);

// Photos are written above in reading order and fitted to the pattern here, so
// nobody has to count slots while adding one. A static import carries the
// file's own width and height, which is all arrangeForSlots needs to keep a
// portrait shot out of a wide tile. Every photo below is written into a slot
// that already suits it, so this currently returns the list untouched.
const arranged = arrangeForSlots(
  sheetPhotos.map((photo) => ({ ...photo, width: photo.src.width, height: photo.src.height })),
  LG_SPANS,
);

export default function FotoBottomSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [canDrag, setCanDrag] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false
  );

  useEffect(() => {
    // SSR hydration guard: intentionally set once on mount to enable client-only portal render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = (e: MediaQueryListEvent) => setCanDrag(e.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusable = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    sheetRef.current?.focus({ preventScroll: true });

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const handleClose = () => {
    onClose();
  };

  const tiles = arranged.map((photo, i) => {
    const wide = LG_SPANS[i % LG_SPANS.length] === 2;
    const paired = isPaired(i);
    return (
      <div
        key={i}
        // One aspect utility per breakpoint, never two competing at the same
        // one: which of a pair wins comes down to the order Tailwind emits
        // them, not the order they are written here.
        //
        // Below lg every tile is 16/9 whatever its photo is: one column, one
        // shape, so the scroll keeps an even rhythm. The paired tiles are the
        // exception on phones — they take their height from the wrapper that
        // holds them and only pick up an aspect of their own from md, where
        // that wrapper is gone.
        className={`relative w-full shrink-0 ${
          paired ? "h-full md:h-auto md:aspect-[16/9]" : "aspect-[16/9]"
        } ${wide ? "lg:col-span-2 lg:aspect-auto" : "lg:aspect-[5/6]"}`}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          placeholder="blur"
          // 80 in plaats van de standaard 75, en dat is hier geen smaakkwestie.
          // De optimizer zet op zijn antwoorden max-age=315360000, immutable:
          // een browser die een van deze tegels al in AVIF heeft opgehaald,
          // vraagt die URL nooit meer opnieuw op. Alleen een andere URL bereikt
          // wie de sheet al eens open had, en q is de enige parameter die we in
          // de hand hebben — het bestand zelf heeft dezelfde inhoudshash.
          quality={80}
          className="object-cover rounded-[12px]"
          style={photo.focus ? { objectPosition: photo.focus } : undefined}
          // Pixels, niet vw, zodra het rooster niet meer meegroeit. De grid zit
          // vast op max-w-[1280px] met px-8, dus vanaf een viewport van 1280 is
          // een single altijd 395px en een brede tegel 805px, hoe breed het
          // scherm daarna ook wordt. Met 33vw bleef de browser doorrekenen: op
          // 1920 bij dpr 2 haalde een tegel van 395px een variant van 1920px op
          // en een brede tegel er een van 3840 — bijna zes keer zoveel pixels
          // om te decoderen als er getoond worden, opgeschaald uit bronnen die
          // zelf maar 1700px zijn. Zestien tegels die bij een snelle scroll
          // tegelijk opnieuw gedecodeerd moeten worden, halen dat niet binnen
          // een frame.
          //
          // Tussen lg en 1280 groeit het rooster nog wel mee, vandaar dat daar
          // een vw-waarde blijft staan.
          sizes={
            paired
              ? "(min-width: 1280px) 400px, (min-width: 1024px) 31vw, 50vw"
              : wide
                ? "(min-width: 1280px) 810px, (min-width: 1024px) 63vw, (min-width: 768px) 50vw, 100vw"
                : "(min-width: 1280px) 400px, (min-width: 1024px) 31vw, (min-width: 768px) 50vw, 100vw"
          }
        />
      </div>
    );
  });

  // Pairs are wrapped, everything else goes in as its own cell. Walking the
  // list rather than slicing around fixed indices keeps this honest when a
  // third pair shows up.
  const cells: ReactNode[] = [];
  for (let i = 0; i < tiles.length; ) {
    const pair = MOBILE_PAIRS.find(([start]) => start === i);
    if (!pair) {
      cells.push(tiles[i]);
      i++;
      continue;
    }
    cells.push(
      <div key={`pair-${pair[0]}`} className="aspect-[16/9] grid grid-cols-2 gap-2 md:contents">
        {tiles.slice(pair[0], pair[1] + 1)}
      </div>
    );
    i = pair[1] + 1;
  }

  return createPortal(
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Zonder blur: dit paneel is ondoorzichtig en beslaat tot 95dvh, dus
              van de blur zie je alleen een strook bovenaan. Wat hij wel deed was
              per frame een render surface en een backdrop scope afdwingen onder
              een scrollend paneel — 432 surfaces over 108 frames, tegen 216
              zonder. */}
          <Backdrop onClick={handleClose} className="z-50" blur={false} scrollLock />

          <div ref={sheetRef} tabIndex={-1} className="outline-none">
            <m.div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Binnenkijken bij Ever Sun"
              // will-change-transform is not a superstition here. The scrim
              // behind this panel carries backdrop-filter: blur(2px) over the
              // whole viewport, and this panel is opaque and painted straight
              // on top of it at the same z-index. A backdrop-filter makes the
              // browser re-sample everything beneath it; while the panel shares
              // an invalidation region with that layer, its re-paint and the
              // re-blur need not land in the same frame, and a frame that
              // misses shows as a ghost across the photos while scrolling.
              //
              // framer already promotes this panel to its own layer while the
              // open spring runs — and drops it again the moment the spring
              // settles, which is exactly when the flicker starts. This keeps
              // the promotion for as long as the sheet is open, which is the
              // only time it exists at all: AnimatePresence unmounts the panel
              // on close, so nothing holds a full-screen layer in the
              // background.
              className="fixed bottom-0 inset-x-0 bg-surface-page rounded-t-[20px] z-50 max-h-[95dvh] flex flex-col will-change-transform"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: { duration: 0.28, ease: [0.36, 0, 0.66, 0] } }}
              transition={{ type: "spring", damping: 40, stiffness: 300 }}
              drag={canDrag ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) handleClose();
              }}
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <div className="md:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing shrink-0">
                <div className="w-10 h-1 rounded-full bg-ink/20" />
              </div>
              <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 pt-5 md:pt-7 pb-4 md:pb-5 shrink-0 md:flex md:items-center md:justify-between md:gap-4">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="font-display text-[20px] md:text-[24px] font-medium text-zinc-900 tracking-[-0.01em]">
                      Binnenkijken bij Ever Sun
                    </h2>
                    <span className="font-sans text-[15px] text-zinc-600 tracking-[-0.01em] whitespace-nowrap">
                      {`${sheetPhotos.length} foto's`}
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-zinc-600 leading-[24px] mt-1">
                    Kloekhorststraat 4a, Assen · <a href="tel:+31625306491" className="text-zinc-600 underline decoration-dotted underline-offset-6">06 25306491</a>
                  </p>
                </div>
                <div className="hidden md:flex shrink-0">
                  <CloseButton onClick={handleClose} />
                </div>
              </div>
              <div
                className="w-full max-w-[1280px] mx-auto px-6 md:px-8 pb-4 md:pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 content-start overflow-y-auto min-h-0"
                style={{ overscrollBehavior: "contain" }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {cells}
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
    </>,
    document.body
  );
}
