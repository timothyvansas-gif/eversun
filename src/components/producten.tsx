"use client";

import Image, { StaticImageData } from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useHorizontalScroller } from "@/hooks/use-horizontal-scroller";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { CAROUSEL_TRACK_CLASS, CAROUSEL_CARD_CLASS, CAROUSEL_BLEED_STYLE } from "@/lib/carousel";
import { BTN_PILL_ACCENT } from "@/lib/button-styles";
import { CtaArrow } from "@/components/ui/cta-arrow";
import { CarouselNavButton } from "@/components/ui/carousel-nav-button";
import imgDareToBeDark from "@/images/producten/eversun-Dare-to-be-dark.webp";
import imgWhiteBronzeCoconut from "@/images/producten/eversun-White-2-bronze-coconut.webp";
import imgBlackCrown from "@/images/producten/eversun-blackcrown.webp";
import imgBronzeButter from "@/images/producten/eversun-bronze-butter.webp";
import imgHimJet from "@/images/producten/eversun-him-jet.webp";
import imgHimSurf from "@/images/producten/eversun-him-surf.webp";
import imgSunHoney from "@/images/producten/eversun-sun-honey.webp";
import imgVault from "@/images/producten/eversun-vault.webp";
import imgCocoCreamsicle from "@/images/producten/eversun-coco-creamsicle.webp";
import imgBarefootBeachwood from "@/images/producten/eversun-barefoot-beachwood.webp";
import imgEnchantedEmerald from "@/images/producten/eversun-enchanted-emerald.webp";

const AfspraakOverlay = dynamic(() => import("@/components/hero/afspraak-overlay"));
const PlanJeMomentSheet = dynamic(() => import("@/components/hero/plan-je-moment-sheet"));

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
        // Filled on mobile, where it is the full-width close of the section,
        // and the outline pill from md up, matching the one under the
        // zonnebanken. The md: colours land after the base utilities in
        // Tailwind's order, so they win from that breakpoint on.
        className={`${BTN_PILL_ACCENT} !px-[28px] w-full md:w-auto justify-center py-3 md:py-[10px] shrink-0 md:border md:border-line md:bg-transparent md:text-zinc-900 md:transition-[transform,border-color] md:hover:border-[#312019]`}
      >
        Plan je moment
        <CtaArrow />
      </button>
      <AfspraakOverlay isOpen={qrOpen} onClose={() => setQrOpen(false)} />
      <PlanJeMomentSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

type Product = (typeof products)[number];

function ProductCardItem({ product }: { product: Product }) {
  return (
    <div className={`${CAROUSEL_CARD_CLASS} select-none flex flex-col`}>
      <div className="flex flex-col bg-white rounded-[12px] overflow-hidden flex-1">
        {/* Image */}
        {/* Verloop in plaats van een vlakke vulling: bovenin de diepste tint,
            naar beneden oplopend naar de warme paginakleur. Blijft binnen het
            zandpalet, zodat een productfoto met transparante achtergrond in een
            ruimte lijkt te staan in plaats van op een vlak. */}
        <div
          className="w-full aspect-[4/5] md:aspect-auto md:h-[480px] overflow-hidden relative"
          style={{ background: "linear-gradient(180deg, #EBDCC5 0%, #F2E9DA 55%, #F6F0E7 100%)" }}
        >
          <ProductImage src={product.image} alt={product.name} />
          <div className="absolute bottom-6 left-6 flex gap-[4px]">
            {product.sachetPrice && (
              <span className="text-[14px] font-normal leading-none px-2.5 py-1.5 rounded-[4px] bg-brand text-[#111111]">Sachet {product.sachetPrice}</span>
            )}
            <span className="text-[14px] font-normal leading-none px-2.5 py-1.5 rounded-[4px] bg-brand text-[#111111]">{product.containerLabel} {product.containerPrice}</span>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-[6px] flex-1" style={{ padding: "16px 24px 24px" }}>
          <h3 className="text-ink-strong text-[18px] font-medium tracking-[-0.24px] font-display">
            {product.name}
          </h3>
          <p className="text-zinc-500 text-[14px] leading-[22px] tracking-[-0.01em] font-sans">
            {product.description}
          </p>
          <div className="flex flex-wrap gap-[6px] mt-auto pt-3">
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

function ProductImage({ src, alt }: { src: StaticImageData; alt: string }) {
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
        // de prijslabels vrij.
        className={`object-cover object-center origin-bottom scale-[1.08] translate-y-[4%] md:scale-100 md:translate-y-0 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        // De kaart is 310 px breed op mobiel en 260 op desktop; met de schaal
        // erbij vraagt mobiel dus het grootste beeld van de twee.
        sizes="(max-width: 768px) 340px, 280px"
        draggable={false}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

const products = [
  {
    id: 9,
    name: "Coco Creamsicle",
    description: "Romige moisturizer met sinaasappelolie die je huid zacht houdt tussen sessies door.",
    image: imgCocoCreamsicle,
    labels: ["Moisturizer", "Vitamine C"],
    containerLabel: "Fles",
    containerPrice: "24,99",
  },
  {
    id: 11,
    name: "Enchanted Emerald",
    description: "Frambozenextract en cactuswater voor dagelijkse hydratatie en een frisse glow.",
    image: imgEnchantedEmerald,
    labels: ["Dagverzorging", "Antioxidanten"],
    containerLabel: "Fles",
    containerPrice: "24,99",
  },
  {
    id: 6,
    name: "Him Surf",
    description: "Beschermt je tatoeages en trekt snel in. Versterkt je kleur zonder bronzer.",
    image: imgHimSurf,
    labels: ["Voor hem", "Beschermt tattoos"],
    sachetPrice: "4,99",
    containerLabel: "Tube",
    containerPrice: "29,99",
  },
  {
    id: 4,
    name: "Bronze Butter",
    description: "Zes boters en vegan collageen. Je huid blijft zacht, de kleur komt van jezelf.",
    image: imgBronzeButter,
    labels: ["Zonder bronzer", "Hydraterend"],
    sachetPrice: "4,99",
    containerLabel: "Fles",
    containerPrice: "44,99",
  },
  {
    id: 10,
    name: "Barefoot Beachwood",
    description: "Aftersun met cacayolie en kokosmelk. Kalmeert je huid na het zonnen.",
    image: imgBarefootBeachwood,
    labels: ["Aftersun", "Hele dag hydratatie"],
    containerLabel: "Fles",
    containerPrice: "24,99",
  },
  {
    id: 3,
    name: "Black Crown",
    description: "Zware bronzer met DHA. Direct resultaat dat de dagen erna nog dieper wordt.",
    image: imgBlackCrown,
    labels: ["Voor gevorderden", "Zeer donker"],
    sachetPrice: "8,50",
    containerLabel: "Fles",
    containerPrice: "84,99",
  },
  {
    id: 1,
    name: "Dare to be Dark",
    description: "Milde formule met komkommer en groene klei. Fijn als je huid snel reageert.",
    image: imgDareToBeDark,
    labels: ["Gevoelige huid", "Parfumvrij"],
    sachetPrice: "4,99",
    containerLabel: "Fles",
    containerPrice: "29,99",
  },
  {
    id: 5,
    name: "Him Jet",
    description: "Truffelextract en zwarte kombucha. Diep resultaat vanaf de eerste sessie.",
    image: imgHimJet,
    labels: ["Voor hem", "Diepe bronzer"],
    sachetPrice: "5,49",
    containerLabel: "Tube",
    containerPrice: "34,99",
  },
  {
    id: 2,
    name: "White 2 Bronze Coconut",
    description: "Directe bronzer op kokoswater. Anti oranje technologie houdt de kleur natuurlijk.",
    image: imgWhiteBronzeCoconut,
    labels: ["Directe kleur", "Anti oranje"],
    sachetPrice: "4,99",
    containerLabel: "Fles",
    containerPrice: "49,99",
  },
  {
    id: 7,
    name: "Sun Honey",
    description: "Honing en agave binden vocht, ceramiden herstellen je huidbarrière.",
    image: imgSunHoney,
    labels: ["Zonder bronzer", "Gouden glans"],
    sachetPrice: "8,49",
    containerLabel: "Fles",
    containerPrice: "69,99",
  },
  {
    id: 8,
    name: "Vault",
    description: "Ingekapselde DHA komt langzaam vrij, zo blijft je kleur dagen egaal.",
    image: imgVault,
    labels: ["Kleurbehoud", "Anti oranje"],
    sachetPrice: "12,99",
    containerLabel: "Fles",
    containerPrice: "134,99",
  },
];

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
            <div
              ref={scrollRef}
              tabIndex={0}
              role="region"
              aria-label="Producten carrousel"
              className={CAROUSEL_TRACK_CLASS}
              style={CAROUSEL_BLEED_STYLE}
            >
              {products.map((product) => (
                <ProductCardItem key={product.id} product={product} />
              ))}
            </div>

            {/* Overlay nav buttons — desktop only, vertically centered on the card image (h-480px) */}
            {canScroll && (
              <>
                <div
                  className={`hidden xl:block absolute left-0 top-[240px] -translate-y-1/2 -translate-x-1/3 z-20 transition-all duration-300 ease-out ${isAtStart ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"}`}
                >
                  <CarouselNavButton
                    variant="dark"
                    reversed
                    onClick={scrollPrev}
                    className="bg-white/40 hover:bg-white/70 backdrop-blur-md duration-300 ease-out !border-muted/40 hover:!border-muted/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                  />
                </div>
                <div
                  className={`hidden xl:block absolute right-0 top-[240px] -translate-y-1/2 translate-x-1/3 z-20 transition-all duration-300 ease-out ${isAtEnd ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"}`}
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
