"use client";

import Image, { StaticImageData } from "next/image";
import dynamic from "next/dynamic";
import { useState, type CSSProperties } from "react";
import { useHorizontalScroller } from "@/hooks/use-horizontal-scroller";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { CAROUSEL_TRACK_CLASS, CAROUSEL_CARD_CLASS, CAROUSEL_BLEED_STYLE } from "@/lib/carousel";
import { BTN_PILL_ACCENT } from "@/lib/button-styles";
import { CarouselNavButton } from "@/components/ui/carousel-nav-button";
import { PRODUCTEN, type Product } from "@/data/producten-data";

const AfspraakOverlay = dynamic(() => import("@/components/hero/afspraak-overlay"));
const PlanJeMomentSheet = dynamic(() => import("@/components/hero/plan-je-moment-sheet"));

// Cyclorama: de naadloze doorloop van achterwand naar vloer uit een productstudio.
// Vier lagen, van voor naar achter. De horizon zit rond 70%, net onder de voet
// van de fles, zodat het product op de vloer staat in plaats van ervoor te zweven.
const PRODUCT_BACKDROP = [
  // 1. Contactschaduw: smalle, brede ellips onder de fles. Zonder deze laag
  //    blijft het product los van de vloer hangen.
  "radial-gradient(ellipse 40% 6% at 50% 74%, rgba(122, 96, 61, 0.16) 0%, rgba(122, 96, 61, 0) 72%)",
  // 2. Lichtpool van de key light, met zijn hart op de horizon. Dit is wat de
  //    knik van wand naar vloer leesbaar maakt zonder er een lijn te trekken.
  "radial-gradient(ellipse 72% 46% at 50% 66%, rgba(255, 250, 240, 0.72) 0%, rgba(255, 250, 240, 0) 76%)",
  // 3. Vloervlak: vanaf de horizon loopt het naar de voorgrond weer iets terug.
  //    Licht dat wegvalt richting de kijker; zonder dit leest de onderhelft als
  //    een tweede wand.
  "linear-gradient(180deg, rgba(190, 162, 118, 0) 68%, rgba(190, 162, 118, 0.06) 88%, rgba(190, 162, 118, 0.10) 100%)",
  // 4. Achterwand, de diepste tint bovenin en oplopend naar de horizon.
  "linear-gradient(180deg, #EEE1CD 0%, #F2E8D8 42%, #F6F0E6 70%, #F4ECE0 100%)",
].join(", ");

function PlanMomentButton() {
  const [qrOpen, setQrOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleClick = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setSheetOpen(true);
    } else {
      setQrOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        // Filled at every breakpoint, so the section keeps one clear action
        // whether the pill fills the mobile column or hugs its desktop label.
        className={`${BTN_PILL_ACCENT} !px-[28px] w-full md:w-auto justify-center py-3 md:py-[10px] shrink-0`}
      >
        Plan je moment
      </button>
      <AfspraakOverlay isOpen={qrOpen} onClose={() => setQrOpen(false)} />
      <PlanJeMomentSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

function ProductCardItem({ product }: { product: Product }) {
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isPointerDismissed, setIsPointerDismissed] = useState(false);
  const [isKeyboardAction, setIsKeyboardAction] = useState(false);
  const isPointerExpanded = isPointerInside && !isPointerDismissed;
  const isExpanded = isPinnedOpen || isPointerExpanded;
  const descriptionId = `product-details-${product.id}`;

  const closeDetails = () => {
    setIsPinnedOpen(false);
    setIsPointerDismissed(true);
  };

  return (
    <div
      className={`${CAROUSEL_CARD_CLASS} product-card focus-ring-clipped select-none flex flex-col`}
      data-has-hover-description={Boolean(product.hoverDescription)}
      data-expanded={isExpanded}
      data-pointer-expanded={isPointerExpanded}
      data-keyboard-action={isKeyboardAction}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-controls={descriptionId}
      aria-label={`${isExpanded ? "Verberg" : "Toon"} meer informatie over ${product.name}`}
      onClick={(event) => {
        if (!window.matchMedia(MOBILE_QUERY).matches) return;
        setIsKeyboardAction(event.detail === 0);

        if (isExpanded) {
          closeDetails();
        } else {
          setIsPinnedOpen(true);
          setIsPointerDismissed(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isExpanded) {
          event.preventDefault();
          setIsKeyboardAction(true);
          closeDetails();
          return;
        }

        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        setIsKeyboardAction(true);

        if (isExpanded) {
          closeDetails();
        } else {
          setIsPinnedOpen(true);
          setIsPointerDismissed(false);
        }
      }}
    >
      <div className="product-card-surface flex flex-col bg-transparent rounded-[12px] overflow-hidden flex-1">
        {/* Image */}
        {/* Studio-backdrop in plaats van een vlakke vulling: wand die in een
            vloertje overloopt. Blijft binnen het zandpalet, zodat een productfoto
            met transparante achtergrond in een ruimte lijkt te staan in plaats
            van op een vlak. Opbouw staat bij PRODUCT_BACKDROP. */}
        <div
          className="product-card-image w-full aspect-[4/5] md:aspect-auto md:h-[464px] overflow-hidden relative"
          style={{ background: PRODUCT_BACKDROP }}
        >
          <ProductImage src={product.image} alt={product.name} nudgeY={product.imageNudgeY} />
          <div className="product-price-labels absolute bottom-6 left-6 flex gap-[4px]">
            {product.sachetPrice && (
              <span className="text-[14px] font-normal leading-none px-2.5 py-1.5 rounded-[4px] bg-brand text-[#0B0B0B]">Sachet {product.sachetPrice}</span>
            )}
            <span className="text-[14px] font-normal leading-none px-2.5 py-1.5 rounded-[4px] bg-brand text-[#0B0B0B]">{product.containerLabel} {product.containerPrice}</span>
          </div>
        </div>

        {/* Text */}
        {/* De hover zit op dit vlak en niet op de hele kaart: de foto erboven
            is geen aanleiding om tekst te openen, en met de kaarten naast
            elkaar in een carrousel raakt de cursor die foto's vaak in het
            voorbijgaan.

            Dit vlak zelf verschuift niet bij het openen — alleen de ::before
            erboven en de inhoud erbinnen bewegen — dus de cursor blijft staan
            waar hij stond en er ontstaat geen open/dicht-lus. Het uitgeschoven
            deel hoort qua hit-testing bij de foto, niet bij dit paneel: wie de
            cursor daarheen beweegt, sluit de kaart. */}
        <div
          className={`product-info-panel flex flex-col gap-[6px] rounded-[12px] px-6 pt-4 pb-6 md:pt-6 md:pb-8 ${product.hoverDescription ? "h-[209px] min-[360px]:h-[187px] md:h-[181px] flex-none" : "flex-1"}`}
          onPointerEnter={(event) => {
            if (event.pointerType !== "mouse") return;
            setIsPointerInside(true);
            setIsPointerDismissed(false);
            setIsKeyboardAction(false);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== "mouse") return;
            setIsPointerInside(false);
            setIsPointerDismissed(false);
          }}
        >
          <div className="product-moving-copy flex flex-col gap-[6px]">
            <div className="product-primary-copy flex flex-col gap-[6px]">
              <div className="flex items-center gap-3">
                <h3 className="min-w-0 text-ink-strong text-[18px] font-medium tracking-[-0.24px] font-display">
                  {product.name}
                </h3>
                <svg
                  aria-hidden="true"
                  className="ml-auto size-5 shrink-0 text-zinc-500 md:hidden"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="10" cy="10" r="7.5" />
                  <path d="M10 9v5" />
                  <path d="M10 6.25h.01" />
                </svg>
              </div>
              <p className="text-zinc-500 text-[14px] leading-[22px] tracking-[-0.01em] font-sans">
                {product.description}
              </p>
            </div>
            {product.hoverDescription && (
              <p
                id={descriptionId}
                aria-hidden={!isExpanded}
                className="product-hover-description text-zinc-500 text-[14px] leading-[22px] tracking-[-0.01em] font-sans"
              >
                {product.hoverDescription}
              </p>
            )}
          </div>
          <div className="product-category-labels flex flex-wrap gap-[6px] mt-auto pt-3">
            {product.labels.map((label) => (
              <span
                key={label}
                className="text-muted text-[14px] leading-none tracking-[-0.01em] font-sans px-[10px] py-[8px] rounded-[4px]"
                style={{ backgroundColor: "#FEF9F5" }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductImage({ src, alt, nudgeY }: { src: StaticImageData; alt: string; nudgeY?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: "linear-gradient(90deg, #F2E9DA 25%, #E8DAC1 50%, #F2E9DA 75%)", backgroundSize: "200% 100%" }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        // Op mobiel is de kaart smaller maar het beeld even hoog, waardoor het
        // product er kleiner uitziet dan op desktop. Eén set bestanden voor
        // beide, dus de correctie zit hier. Vanaf de onderrand schalen, niet
        // vanuit het midden: dan groeit de fles omhoog en blijft de strook voor
        // de prijslabels vrij. --nudge-y corrigeert per product de bodemlijn:
        // de fotografen kadreerden niet elke fles even hoog in het frame.
        className={`object-cover object-center origin-bottom scale-[1.08] translate-y-[calc(4%_+_var(--nudge-y))] md:scale-100 md:translate-y-[calc(8px_+_var(--nudge-y))] transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ "--nudge-y": nudgeY ?? "0px" } as CSSProperties}
        // De kaart is 310 px breed op mobiel en 260 op desktop; met de schaal
        // erbij vraagt mobiel dus het grootste beeld van de twee.
        sizes="(max-width: 768px) 340px, 280px"
        draggable={false}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}


export default function Producten() {
  const { scrollRef, canScroll, isAtStart, isAtEnd, scrollNext, scrollPrev } = useHorizontalScroller();

  return (
    <section
      className="relative w-full overflow-hidden py-16 xl:py-24"
      style={{ backgroundColor: "#FAF4EC" }}
    >
      <div
        className="relative z-10 w-full flex flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Header */}
          <div id="producten" className="mb-9 xl:mb-14 scroll-mt-20 lg:scroll-mt-10">
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-3 xl:gap-6">
              <div>
                <h2 className="text-ink-strong text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display">
                  Devoted Creations producten
                </h2>
                {/* Second line of the heading, not a subsection: as an <h3> it
                    announced a level of hierarchy that is not there. Same
                    pattern as onze-zonnebanken. */}
                <p className="text-muted text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display mt-1">
                  voor jouw perfecte kleur
                </p>
              </div>
              <p className="text-muted text-[15px] leading-[24px] max-w-[411px] tracking-[-0.01em] xl:mb-[2px]">
                Ontdek ons aanbod van hoogwaardige producten. Speciaal geselecteerd voor een optimaal resultaat.
              </p>
            </div>
          </div>

          {/* Scroll Container */}
          <div className="relative">
            {/* No tabIndex on the track, unlike the one in over-ons. A
                scrollable region only needs to be its own tab stop when it
                holds nothing focusable; here every card is a tab stop of its
                own and tabbing through them scrolls the track natively. The
                extra stop only added a focus ring around the whole strip
                before the same ring appeared on the first card. The region
                landmark and its name stay — those cost no tab stop. */}
            <div
              ref={scrollRef}
              role="region"
              aria-label="Producten carrousel"
              className={CAROUSEL_TRACK_CLASS}
              style={CAROUSEL_BLEED_STYLE}
            >
              {PRODUCTEN.map((product) => (
                <ProductCardItem key={product.id} product={product} />
              ))}
            </div>

            {/* Overlay nav buttons — desktop only, vertically centered on the 464px card image. */}
            {canScroll && (
              <>
                <div
                  className={`hidden xl:block absolute left-0 top-[232px] -translate-y-1/2 -translate-x-1/3 z-20 transition-all duration-300 ease-out ${isAtStart ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"}`}
                >
                  <CarouselNavButton
                    variant="dark"
                    reversed
                    onClick={scrollPrev}
                    className="bg-white/40 hover:bg-white/70 backdrop-blur-md duration-300 ease-out !border-muted/40 hover:!border-muted/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                  />
                </div>
                <div
                  className={`hidden xl:block absolute right-0 top-[232px] -translate-y-1/2 translate-x-1/3 z-20 transition-all duration-300 ease-out ${isAtEnd ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"}`}
                >
                  <CarouselNavButton
                    variant="dark"
                    onClick={scrollNext}
                    className="bg-white/40 hover:bg-white/70 backdrop-blur-md duration-300 ease-out !border-muted/40 hover:!border-muted/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-4 xl:mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-7 md:gap-8">
            <p className="text-muted text-[14px] leading-[25px] tracking-[-0.01em] font-sans">
              Uitsluitend verkrijgbaar in de zonnestudio voor passend advies op maat. 15 ml sachets zijn geschikt voor eenmalig gebruik.
            </p>
            <PlanMomentButton />
          </div>
        </div>
      </div>
    </section>
  );
}
