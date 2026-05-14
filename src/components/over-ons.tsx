"use client";

import Image from "next/image";
import logoBackground from "@/images/people/logo-background.webp";
import teamAisha from "@/images/people/team-aisha.webp";
import teamDummy from "@/images/people/team-dummy.webp";
import teamDummy2 from "@/images/people/team-dummy2.webp";
import { useHorizontalScroller } from "@/hooks/use-horizontal-scroller";
import { CarouselNavButton } from "@/components/ui/carousel-nav-button";

const teamMembers = [
  {
    id: 1,
    name: "Aisha",
    image: teamAisha,
    description: "Passie voor ondernemen en een hart voor haar klanten. Al tien jaar aan het roer van Ever Sun, maar thuis vooral de trotse moeder van een eigenwijze zoon. De perfecte balans tussen vakvrouw en familiemens.",
  },
  {
    id: 2,
    name: "Sofie",
    image: teamDummy,
    description: "Hier gaan we een kort stukje tekst plaatsen van de medewerker. Lachen gieren brullen natuurlijk.",
  },
  {
    id: 3,
    name: "Chloe",
    image: teamDummy2,
    description: "Hier gaan we een kort stukje tekst plaatsen van de medewerker. Lachen gieren brullen natuurlijk.",
  },
  {
    id: 4,
    name: "Yara",
    image: teamDummy,
    description: "Hier gaan we een kort stukje tekst plaatsen van de medewerker. Lachen gieren brullen natuurlijk.",
  }
];

export default function OverOns() {
  const { scrollRef, canScroll, isAtEnd, scrollNext } = useHorizontalScroller();

  return (
    <section
      id="over-ons"
      className="relative w-full overflow-hidden py-16 xl:py-24"
      style={{ backgroundColor: "#1F1F1E" }}
    >
      <Image
        src={logoBackground}
        alt=""
        className="absolute top-0 right-0 pointer-events-none select-none"
        style={{ objectFit: "none", objectPosition: "top right" }}
        aria-hidden
      />

      <div
        className="relative z-10 w-full flex flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Header Area */}
          <div className="mb-9 xl:mb-14">
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-5 xl:gap-6">
              <div>
                <h2 className="text-white text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display">
                  De zonnestralen
                </h2>
                <h3 className="text-[#808080] text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display mt-1">
                  van Ever Sun
                </h3>
              </div>
              <p className="text-[#818181] text-[15px] leading-[25px] max-w-[411px] tracking-[-0.01em] xl:mb-[2px]">
                Maak kennis met de zonnestralen die van jouw moment van rust een echte premium ervaring maken. Persoonlijk, vakkundig en altijd met een glimlach. ツ
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
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="w-[clamp(260px,85vw,310px)] md:w-[411px] shrink-0 snap-start flex flex-col gap-6 select-none"
              >
                {/* Image */}
                <div className="w-full h-[400px] bg-[#2A2A2A] rounded-[8px] overflow-hidden relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 310px, 411px"
                    draggable={false}
                  />
                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(180deg, rgba(31, 31, 30, 0.00) 71.16%, rgba(31, 31, 30, 0.90) 99.64%)" }}
                  />
                </div>

                {/* Text Area */}
                <div className="flex flex-col gap-[10px] pr-4">
                  <h4 className="text-white text-[20px] font-medium tracking-[-0.27px] font-display">
                    {member.name}
                  </h4>
                  <p className="text-[#888888] text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {canScroll && (
            <div className="hidden xl:flex justify-end mt-2">
              <CarouselNavButton
                variant="light"
                isAtEnd={isAtEnd}
                onClick={scrollNext}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
