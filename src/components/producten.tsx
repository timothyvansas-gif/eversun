"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import imgDareToBeDark from "@/images/producten/eversun-Dare-to-be-dark.webp";
import imgWhiteBronzeCoconut from "@/images/producten/eversun-White-2-bronze-coconut.webp";
import imgBlackCrown from "@/images/producten/eversun-blackcrown.webp";
import imgBronzeButter from "@/images/producten/eversun-bronze-butter.webp";
import imgHimJet from "@/images/producten/eversun-him-jet.webp";
import imgHimSurf from "@/images/producten/eversun-him-surf.webp";
import imgSunHoney from "@/images/producten/eversun-sun-honey.webp";
import imgVault from "@/images/producten/eversun-vault.webp";

function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = ref.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add("active-drag");
      slider.style.scrollSnapType = "none";
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const onMouseLeave = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove("active-drag");
      slider.style.scrollSnapType = "x mandatory";
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove("active-drag");
      slider.style.scrollSnapType = "x mandatory";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", onMouseDown);
    slider.addEventListener("mouseleave", onMouseLeave);
    slider.addEventListener("mouseup", onMouseUp);
    slider.addEventListener("mousemove", onMouseMove);

    return () => {
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return ref;
}

const products = [
  {
    id: 1,
    name: "Dare to be Dark",
    description: "Optimale bruining voor de gevoelige huid. Hypoallergene formule met kalmerende komkommer en groene klei voor een gezonde, rustige teint.",
    image: imgDareToBeDark,
    labels: ["Gevoelige huid", "Hypoallergeen"],
  },
  {
    id: 2,
    name: "White 2 Bronze Coconut",
    description: "Vakantie in een flesje. Diepe hydratatie met kokos- en cactuswater voor een egale, tropische teint zonder oranje gloed.",
    image: imgWhiteBronzeCoconut,
    labels: ["Voor beginners", "Natuurlijke kleur"],
  },
  {
    id: 3,
    name: "Black Crown",
    description: "De 'holy grail' voor gevorderde zonners. Krachtige DHA-bronzer die de huid verstevigt en een direct, intens donker resultaat geeft.",
    image: imgBlackCrown,
    labels: ["Max effect", "Voor gevorderden"],
  },
  {
    id: 4,
    name: "Bronze Butter",
    description: "Luxe, bronzervrije butter met zes voedende boters en vegan collageen. Hydrateert intensief voor een zijdezachte huid en een natuurlijke glow.",
    image: imgBronzeButter,
    labels: ["Bronzervrij", "Hydraterend"],
  },
  {
    id: 5,
    name: "Him Jet",
    description: "Performance-grade bronzer voor directe impact. Versnelt de bruining met truffelextract en zwarte kombucha voor een ongeëvenaard diep resultaat.",
    image: imgHimJet,
    labels: ["Direct effect", "Deep bronzer"],
  },
  {
    id: 6,
    name: "Him Surf",
    description: "Verfrissende intensifier voor mannen. Trekt direct in, beschermt tatoeages en voedt de huid met antioxidanten en elektrolyten uit zeebes.",
    image: imgHimSurf,
    labels: ["Tattoo protection", "Trekt snel in"],
  },
  {
    id: 7,
    name: "Sun Honey",
    description: "Gouden glans, honingzoet. Agave en ceramiden herstellen vocht voor een egale kleur.",
    image: imgSunHoney,
    labels: ["Gouden glow", "Huidherstel"],
  },
  {
    id: 8,
    name: "Vault",
    description: "Maximale kleurbehoud door ingekapselde DHA. Kleurfixatie zorgt ervoor dat je diepdonkere, airbrushed finish dagenlang perfect blijft.",
    image: imgVault,
    labels: ["Kleurbehoud", "Premium finish"],
  },
];

export default function Producten() {
  const scrollRef = useDraggableScroll();
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = slider;
      setCanScroll(scrollWidth > clientWidth + 200);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 50);
    };

    const observer = new ResizeObserver(checkScroll);
    observer.observe(slider);

    slider.addEventListener("scroll", checkScroll);
    checkScroll();

    return () => {
      slider.removeEventListener("scroll", checkScroll);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (scrollRef.current) {
      if (isAtEnd) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const cardWidth = 280;
        const gap = 16;
        scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
      }
    }
  };

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
                <h3 className="text-[#A0906E] text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display mt-1">
                  voor jouw perfecte kleur
                </h3>
              </div>
              <p className="text-[#6B5C40] text-[15px] leading-[25px] max-w-[411px] tracking-[-0.01em] xl:mb-[2px]">
                Ontdek ons aanbod van hoogwaardige producten. Speciaal geselecteerd voor een optimaal resultaat.
              </p>
            </div>
          </div>

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 snap-x snap-mandatory cursor-grab pb-4"
            style={{
              marginRight: "calc(50% - 50vw)",
              paddingRight: "clamp(1.5rem, 4vw, 10rem)",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[clamp(220px,70vw,280px)] md:w-[280px] shrink-0 snap-start select-none flex flex-col"
              >
                <div
                  className="flex flex-col bg-white rounded-[8px] overflow-hidden flex-1"
                >
                  {/* Image */}
                  <div className="w-full aspect-[4/5] overflow-hidden relative bg-[#F0EAE0]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 220px, 280px"
                      draggable={false}
                    />
                    <span className="absolute bottom-3 right-3 text-[13px] font-medium leading-none px-2.5 py-1.5 rounded-full" style={{ backgroundColor: "#FDC43F", color: "#111111" }}>€ bedrag</span>
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
                          className="text-[#6B5C40] text-[12px] leading-none tracking-[-0.01em] font-sans px-[10px] py-[8px] rounded-full"
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

          {canScroll && (
            <div className="hidden xl:flex justify-end mt-2">
              <button
                onClick={handleClick}
                className="w-[60px] h-[60px] rounded-full border border-[#1F1F1E]/12 hover:border-[#1F1F1E]/24 flex items-center justify-center transition-colors cursor-pointer group"
              >
                <svg
                  width="20" height="15" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-500 ${isAtEnd ? "rotate-180" : ""}`}
                >
                  <path d="M9.73343 0.625L14.8921 5.85984C15.036 6.00628 15.036 6.24372 14.8921 6.39016L9.73343 11.625M14.7843 6.125H1" stroke="#1F1F1E" strokeWidth="1.25" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </button>
            </div>
          )}

          <style dangerouslySetInnerHTML={{
            __html: `
            #producten .overflow-x-auto::-webkit-scrollbar {
              display: none;
            }
            #producten .overflow-x-auto {
              scrollbar-width: none;
            }
            #producten .active-drag {
              cursor: grabbing !important;
            }
          `}} />
        </div>
      </div>
    </section>
  );
}
