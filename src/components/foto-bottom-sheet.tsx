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
import cabinesMuurWitImg from "@/images/cabines-muur-wit.webp";
import bankLiggendImg from "@/images/bank-liggend.webp";
import ergolineNeonImg from "@/images/ergoline-neon.webp";
import productenDisplayImg from "@/images/producten-display.webp";
import candyTheeImg from "@/images/candy-thee.webp";
import koffieImg from "@/images/koffie.webp";
import balieBloemenImg from "@/images/balie-bloemen.webp";
import balieAchterImg from "@/images/balie-achter.webp";
import kopImg from "@/images/kop.webp";
import kop2Img from "@/images/kop2.webp";
import zakjesImg from "@/images/zakjes.webp";
import wastafelsImg from "@/images/wastafels.webp";
import bankHockerBloemenImg from "@/images/bank-hocker-bloemen.webp";

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
type SheetPhoto = {
  src: StaticImageData;
  alt: string;
  focus?: string;
  /**
   * Beperk deze foto tot één van de twee layouts. Zonder dit veld staat hij
   * overal.
   *
   * `"mobile"` voor tegels die alleen bestaan waar ze in paren naast elkaar
   * kunnen staan; `"desktop"` voor tegels die alleen in het mozaïek passen.
   * Dezelfde foto mag twee keer in de lijst staan met elk een eigen waarde —
   * dan verschijnt hij in beide layouts precies één keer, op een plek die daar
   * klopt.
   *
   * Verbergen met een class is niet genoeg: een lazy `next/image` in een
   * display:none-tegel wordt gewoon opgehaald, dus een telefoon zou betalen
   * voor een tegel die niemand ziet. De tegel valt daarom helemaal uit de boom.
   * Veilig om de boom hierop te vertakken: de sheet rendert pas na `mounted`,
   * dus er is geen servermarkup om het mee oneens te zijn.
   */
  only?: "mobile" | "desktop";
};

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
  // leestafel. Op 2,11 is dit de breedste foto van de set, dus de brede tegel
  // kost hem alleen wat aan de zijkanten.
  { src: cabinesMuurWitImg, alt: "De gang langs de cabines, met open deuren en gekleurd licht" },
  // Sluit de sheet af op de laatste staande tegel. Staand van zichzelf, dus op
  // desktop past hij bijna zonder uitsnede; op mobiel is de tegel 16/9 en wordt
  // het een band over het midden.
  {
    src: ergolineNeonImg,
    alt: "Het Ergoline-logo in roze neon boven de zonnebank",
    // Op mobiel overleeft maar 42% van de hoogte.
    focus: "center 25%",
  },
  // Opent een nieuwe rij op de brede tegel.
  { src: balieAchterImg, alt: "Achter de balie, met het scherm en de lounge op de achtergrond" },
  // Dezelfde koffiefoto als in het paar hieronder, maar dit is de desktopplek:
  // de smalle tegel naast balie-achter. Twee regels voor één foto, elk met hun
  // eigen `only`, zodat hij op de telefoon niet dubbel opduikt.
  {
    src: koffieImg,
    alt: "De koffiemachine van Douwe Egberts met het keuzescherm",
    focus: "center top",
    only: "desktop",
  },
  // Alleen op de telefoon, als paar onderaan. Allebei staand, dus in een halve
  // tegel houden ze hun vorm; op desktop is er geen plek waar ze die vorm
  // krijgen zonder de rijen overhoop te gooien.
  {
    src: koffieImg,
    alt: "De koffiemachine van Douwe Egberts met het keuzescherm",
    // De halve tegel toont 69% van de hoogte; gecentreerd begint die band op
    // 15,5% en dan valt het rode DE-logo er net boven weg — dat zit in de
    // bovenste paar procent. Vanaf de bovenrand staat het er wel op.
    focus: "center top",
    only: "mobile",
  },
  { src: balieBloemenImg, alt: "Verse bloemen en parfums op de balie", only: "mobile" },
  // Nieuwe laatste desktoprij, na het telefoonpaar hierboven — zo blijven
  // MOBILE_PAIRS' indices ongemoeid ("een pair stays put if photos are added
  // after it"). Kopie van de smalle koffie-tegel als opener, staand voor de
  // vorm; niet een nieuwe foto. LG_SPANS draait deze rij om (1, 2 in plaats
  // van 2, 1) — de cyclus alleen laten doorlopen had hier de verkeerde vorm
  // gegeven.
  {
    src: koffieImg,
    alt: "De koffiemachine van Douwe Egberts met het keuzescherm",
    focus: "center top",
    only: "desktop",
  },
  // Sluit de rij af op de brede tegel.
  { src: bankHockerBloemenImg, alt: "De lounge-bank met bloemboeket en hocker op de voorgrond" },
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
// from differing row heights. De smalle tegels dragen de verhouding en zetten
// daarmee die hoogte; een brede tegel rekt daarin mee.
//
// Een brede tegel draagt daarnaast zelf lg:aspect-[1.7] als terugval. Zolang er
// een smalle naast staat doet die niets — grid stretcht het item naar de
// rijhoogte en dat wint van de verhouding. Staat een brede tegel alleen in zijn
// rij, bijvoorbeeld omdat de plek ernaast bewust vrij is gehouden voor een foto
// die nog moet komen, dan is er niets dat de rij hoogte geeft en klapte hij
// zonder deze regel dicht tot nul. Vanaf 1280 is 1.7 exact; daaronder scheelt
// het een pixel of twee met de rijen die wel een partner hebben.
// De cyclus is even lang als de lijst zelf: achttien tegels, vierentwintig
// kolommen, acht volle rijen. Zodra er een rij tussen komt schuift alles
// erachter een plek op, en dan moet dit patroon mee — een brede tegel op de
// verkeerde index laat een rij een kolom openhouden. Wie hier een foto
// toevoegt, telt de rijen na.
//
// De laatste rij (1, 2) draait de vorm om: overal elders staat de brede tegel
// eerst. Hier begint de rij staand, met de brede/liggende tegel erna.
const LG_SPANS: Slot[] = [2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 2];

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
  [16, 17],
];

const isPaired = (i: number) => MOBILE_PAIRS.some(([start, end]) => i >= start && i <= end);

// Photos are written above in reading order and fitted to the pattern here, so
// nobody has to count slots while adding one. A static import carries the
// file's own width and height, which is all arrangeForSlots needs to keep a
// portrait shot out of a wide tile.
//
// Foto's met only "mobile" doen daar niet aan mee. Ze bestaan op desktop niet, dus ze
// horen er ook geen slot te bezetten: deden ze dat wel, dan kon zo'n staande
// foto op een brede slot vallen en ging de sorteerder de rest van de lijst
// verschuiven om hem daar weg te houden — precies het paar dat op de telefoon
// naast elkaar moest staan, uit elkaar getrokken.
//
// Ze houden dus hun geschreven plek, en de rest wordt eromheen op het patroon
// gepast. `desktopSlot` telt daarbij alleen de foto's die desktop wél haalt, zo
// schuift een telefoon-only foto de spans van alles erachter niet op.
const withShape = (photo: SheetPhoto) => ({
  ...photo,
  width: photo.src.width,
  height: photo.src.height,
});

const fittedForDesktop = arrangeForSlots(
  sheetPhotos.filter((photo) => photo.only !== "mobile").map(withShape),
  LG_SPANS,
);

const arranged = (() => {
  let next = 0;
  return sheetPhotos.map((photo) =>
    photo.only === "mobile" ? withShape(photo) : fittedForDesktop[next++]
  );
})();

/** Index in het desktoprooster, of -1 voor een foto die daar niet bestaat. */
const desktopSlot = (() => {
  let next = 0;
  return sheetPhotos.map((photo) => (photo.only === "mobile" ? -1 : next++));
})();

export default function FotoBottomSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Eén bron voor "dit is een telefoon": hij bepaalt of het paneel te slepen is
  // en welke foto's er bestaan. Beperkte tegels mogen niet alleen verborgen
  // worden, ze moeten uit de boom blijven.
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false
  );

  useEffect(() => {
    // SSR hydration guard: intentionally set once on mount to enable client-only portal render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = (e: MediaQueryListEvent) => setIsMobile(e.matches);
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
    if (photo.only === "mobile" ? !isMobile : photo.only === "desktop" && isMobile) return null;
    const slot = desktopSlot[i];
    const wide = slot >= 0 && LG_SPANS[slot % LG_SPANS.length] === 2;
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
        } ${wide ? "lg:col-span-2 lg:aspect-[1.7]" : "lg:aspect-[5/6]"}`}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          placeholder="blur"
          // 90 in plaats van de standaard 75, en dat is hier geen smaakkwestie.
          // De optimizer zet op zijn antwoorden max-age=315360000, immutable:
          // een browser die een van deze tegels al in AVIF heeft opgehaald,
          // vraagt die URL nooit meer opnieuw op. Alleen een andere URL bereikt
          // wie de sheet al eens open had, en q is de enige parameter die we in
          // de hand hebben — het bestand zelf heeft dezelfde inhoudshash.
          quality={90}
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

  // Wat er werkelijk te zien is, niet wat er in de lijst staat: een beperkte foto
  // bestaan vanaf md niet, en dan moet de kop ze ook niet meetellen.
  const visibleCount = sheetPhotos.filter(
    (photo) => photo.only === undefined || photo.only === (isMobile ? "mobile" : "desktop")
  ).length;

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
              drag={isMobile ? "y" : false}
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
                      {`${visibleCount} foto's`}
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-zinc-600 leading-[24px] mt-1">
                    Kloekhorststraat 4a, Assen · <a href="tel:+31625306491" className="text-zinc-600 underline decoration-zinc-300 decoration-1 underline-offset-6 hover:decoration-ink-strong transition-colors duration-150">06 25306491</a>
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
