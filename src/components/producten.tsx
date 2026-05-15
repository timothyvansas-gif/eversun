"use client";

import Image from "next/image";
import { useHorizontalScroller } from "@/hooks/use-horizontal-scroller";
import { CarouselNavButton } from "@/components/ui/carousel-nav-button";
import imgDareToBeDark from "@/images/producten/eversun-Dare-to-be-dark.webp";
import imgWhiteBronzeCoconut from "@/images/producten/eversun-White-2-bronze-coconut.webp";
import imgBlackCrown from "@/images/producten/eversun-blackcrown.webp";
import imgBronzeButter from "@/images/producten/eversun-bronze-butter.webp";
import imgHimJet from "@/images/producten/eversun-him-jet.webp";
import imgHimSurf from "@/images/producten/eversun-him-surf.webp";
import imgSunHoney from "@/images/producten/eversun-sun-honey.webp";
import imgVault from "@/images/producten/eversun-vault.webp";

const products = [
  {
    id: 1,
    name: "Dare to be Dark",
    description: "Hypoallergene formule met komkommer en groene klei voor een rustige, gezonde teint.",
    image: imgDareToBeDark,
    labels: ["Gevoelige huid", "Hypoallergeen"],
    sachetPrice: "€ 4,99",
    containerLabel: "Fles",
    containerPrice: "€ 29,99",
  },
  {
    id: 2,
    name: "White 2 Bronze Coconut",
    description: "Kokos- en cactuswater voor een egale tropische teint zonder oranje gloed.",
    image: imgWhiteBronzeCoconut,
    labels: ["Voor beginners", "Natuurlijke kleur"],
    sachetPrice: "€ 4,99",
    containerLabel: "Fles",
    containerPrice: "€ 49,99",
  },
  {
    id: 3,
    name: "Black Crown",
    description: "Krachtige DHA-bronzer voor een direct intens donker resultaat.",
    image: imgBlackCrown,
    labels: ["Max effect", "Voor gevorderden"],
    sachetPrice: "€ 8,50",
    containerLabel: "Fles",
    containerPrice: "€ 84,99",
  },
  {
    id: 4,
    name: "Bronze Butter",
    description: "Zes voedende boters en vegan collageen voor een zijdezachte huid en natuurlijke glow.",
    image: imgBronzeButter,
    labels: ["Bronzervrij", "Hydraterend"],
    sachetPrice: "€ 4,99",
    containerLabel: "Fles",
    containerPrice: "€ 44,99",
  },
  {
    id: 5,
    name: "Him Jet",
    description: "Truffelextract en zwarte kombucha voor een diep, intens bruiningsresultaat.",
    image: imgHimJet,
    labels: ["Direct effect", "Deep bronzer"],
    sachetPrice: "€ 5,49",
    containerLabel: "Tube",
    containerPrice: "€ 34,99",
  },
  {
    id: 6,
    name: "Him Surf",
    description: "Beschermt tatoeages en voedt de huid met antioxidanten uit zeebes.",
    image: imgHimSurf,
    labels: ["Tattoo protection", "Trekt snel in"],
    sachetPrice: "€ 4,99",
    containerLabel: "Tube",
    containerPrice: "€ 29,99",
  },
  {
    id: 7,
    name: "Sun Honey",
    description: "Gouden glans, honingzoet. Agave en ceramiden herstellen vocht voor een egale kleur.",
    image: imgSunHoney,
    labels: ["Gouden glow", "Huidherstel"],
    sachetPrice: "€ 8,49",
    containerLabel: "Fles",
    containerPrice: "€ 69,99",
  },
  {
    id: 8,
    name: "Vault",
    description: "Ingekapselde DHA houdt je diepdonkere finish dagenlang perfect.",
    image: imgVault,
    labels: ["Kleurbehoud", "Premium finish"],
    sachetPrice: "€ 12,99",
    containerLabel: "Fles",
    containerPrice: "€ 134,99",
  },
];

export default function Producten() {
  const { scrollRef, canScroll, isAtEnd, scrollNext } = useHorizontalScroller();

  return (
    <section
      id="producten"
      className="relative w-full overflow-hidden py-16 xl:py-24"
      style={{ backgroundColor: "#FAF4EC" }}
    >
      <div
        className="relative z-10 w-full flex flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Header */}
          <div className="mb-9 xl:mb-14">
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-5 xl:gap-6">
              <div>
                <h2 className="text-[#1F1F1E] text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display">
                  Devoted Creations producten
                </h2>
                <h3 className="text-[#94825C] text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display mt-1">
                  voor jouw perfecte kleur
                </h3>
              </div>
              <p className="text-[#94825C] text-[15px] leading-[25px] max-w-[411px] tracking-[-0.01em] xl:mb-[2px]">
                Ontdek ons aanbod van hoogwaardige producten. Speciaal geselecteerd voor een optimaal resultaat.
              </p>
            </div>
          </div>

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="draggable-scroll flex overflow-x-auto gap-6 snap-x snap-mandatory cursor-grab pb-4"
            style={{
              marginRight: "calc(50% - 50vw)",
              paddingRight: "clamp(1.5rem, 4vw, 10rem)",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[clamp(260px,85vw,310px)] md:w-[411px] shrink-0 snap-start select-none flex flex-col"
              >
                <div
                  className="flex flex-col bg-white rounded-[8px] overflow-hidden flex-1"
                >
                  {/* Image */}
                  <div className="w-full aspect-[4/5] md:aspect-auto md:h-[480px] overflow-hidden relative bg-[#F0EAE0]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 220px, 280px"
                      draggable={false}
                    />
                    <div className="absolute bottom-3 right-3 md:bottom-6 md:right-6 flex gap-[4px]">
                      <span className="text-[14px] font-medium leading-none px-2.5 py-1.5 rounded-full" style={{ backgroundColor: "#FDC43F", color: "#111111" }}>Sachet {product.sachetPrice}</span>
                      <span className="text-[14px] font-medium leading-none px-2.5 py-1.5 rounded-full" style={{ backgroundColor: "#FDC43F", color: "#111111" }}>{product.containerLabel} {product.containerPrice}</span>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-[6px] flex-1" style={{ padding: "16px 24px 24px" }}>
                    <h4 className="text-[#1F1F1E] text-[18px] font-medium tracking-[-0.24px] font-display">
                      {product.name}
                    </h4>
                    <p className="text-zinc-500 text-[14px] leading-[22px] tracking-[-0.01em] font-sans">
                      {product.description}
                    </p>
                    <div className="flex flex-wrap gap-[6px] mt-auto pt-3">
                      {product.labels.map((label) => (
                        <span
                          key={label}
                          className="text-[#94825C] text-[14px] md:text-[12px] leading-none tracking-[-0.01em] font-sans px-[10px] py-[8px] rounded-[4px]"
                          style={{ backgroundColor: "#FEF9F5" }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 xl:mt-2">
            <p className="text-[#94825C] text-[14px] leading-[25px] tracking-[-0.01em] font-sans">
              Uitsluitend verkrijgbaar in de zonnestudio voor passend advies op maat. 15ml sachets zijn geschikt voor éénmalig gebruik.
            </p>
            {canScroll && (
              <CarouselNavButton
                variant="dark"
                isAtEnd={isAtEnd}
                onClick={scrollNext}
                className="hidden xl:flex"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
