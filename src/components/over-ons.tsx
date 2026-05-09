"use client";

import Image from "next/image";
import logoBackground from "@/images/people/logo-background.webp";
import teamAisha from "@/images/people/team-aisha.webp";
import teamDummy from "@/images/people/team-dummy.webp";
import teamDummy2 from "@/images/people/team-dummy2.webp";
import { useRef, useEffect } from "react";

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

const teamMembers = [
  {
    id: 1,
    name: "Aisha Uktolseja",
    image: teamAisha,
    description: "Passie voor ondernemen en een hart voor haar klanten. Al tien jaar aan het roer van Ever Sun, maar thuis vooral de trotse moeder van een eigenwijze zoon. De perfecte balans tussen vakvrouw en familiemens.",
  },
  {
    id: 2,
    name: "Naam medewerker",
    image: teamDummy,
    description: "Hier gaan we een kort stukje tekst plaatsen van de medewerker. Lachen gieren brullen natuurlijk.",
  },
  {
    id: 3,
    name: "Naam medewerker",
    image: teamDummy2,
    description: "Hier gaan we een kort stukje tekst plaatsen van de medewerker. Lachen gieren brullen natuurlijk.",
  },
  {
    id: 4,
    name: "Naam medewerker",
    image: teamDummy,
    description: "Hier gaan we een kort stukje tekst plaatsen van de medewerker. Lachen gieren brullen natuurlijk.",
  }
];

export default function OverOns() {
  const scrollRef = useDraggableScroll();

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
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-5 xl:gap-6 mb-9 xl:mb-14">
            <div>
              <h2 className="text-white text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display">
                De zonnestralen
              </h2>
              <h3 className="text-[#808080] text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display mt-1">
                van Ever Sun
              </h3>
            </div>
            <p className="text-[#818181] text-[15px] leading-[25px] max-w-[400px] tracking-[-0.01em]">
              Maak kennis met de deskundige experts die van jouw moment van rust een echte premium ervaring maken. Persoonlijk, vakkundig en altijd met een glimlach. ツ
            </p>
          </div>

          {/* Scroll Container */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 snap-x snap-mandatory cursor-grab pb-4"
            style={{
              marginRight: "calc(50% - 50vw)",
              paddingRight: "clamp(1.5rem, 4vw, 10rem)",
              scrollbarWidth: "none"
            }}
          >
            {teamMembers.map((member) => (
              <div 
                key={member.id}
                className="w-[clamp(260px,85vw,310px)] md:w-[411px] shrink-0 snap-start flex flex-col gap-6 select-none"
              >
                {/* Image */}
                <div className="w-full h-[360px] md:h-[415px] bg-[#2A2A2A] rounded-[8px] overflow-hidden relative">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill 
                    className="object-cover"
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
                  <h4 className="text-white text-[18px] font-semibold tracking-[-0.27px] font-sans">
                    {member.name}
                  </h4>
                  <p className="text-[#888888] text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            #over-ons .overflow-x-auto::-webkit-scrollbar {
              display: none;
            }
            #over-ons .active-drag {
              cursor: grabbing !important;
            }
          `}} />
        </div>
      </div>
    </section>
  );
}
