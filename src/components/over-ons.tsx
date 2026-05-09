"use client";

import Image from "next/image";
import logoBackground from "@/images/people/logo-background.webp";
import teamAisha from "@/images/people/team-aisha.webp";
import teamDummy from "@/images/people/team-dummy.webp";
import teamDummy2 from "@/images/people/team-dummy2.webp";
import arrow from "@/images/arrow.svg";
import { useRef, useEffect, useState } from "react";

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

    const onWheel = (e: WheelEvent) => {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (isHorizontal) {
        // Prevent Lenis from picking up the slight vertical delta during horizontal swipes
        e.stopPropagation();
      }
    };

    slider.addEventListener("mousedown", onMouseDown);
    slider.addEventListener("mouseleave", onMouseLeave);
    slider.addEventListener("mouseup", onMouseUp);
    slider.addEventListener("mousemove", onMouseMove);
    slider.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("mousemove", onMouseMove);
      slider.removeEventListener("wheel", onWheel);
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
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = slider;
      setCanScroll(scrollWidth > clientWidth + 10); // 10px buffer
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 50);
    };

    const observer = new ResizeObserver(checkScroll);
    observer.observe(slider);

    slider.addEventListener("scroll", checkScroll);
    checkScroll(); // Initial check

    return () => {
      slider.removeEventListener("scroll", checkScroll);
      observer.disconnect();
    };
  }, []);

  const handleClick = () => {
    if (scrollRef.current) {
      if (isAtEnd) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const cardWidth = 411;
        const gap = 24;
        scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
      }
    }
  };

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
                Maak kennis met de experts die van jouw moment van rust een echte premium ervaring maken. Persoonlijk, vakkundig en altijd met een glimlach. ツ
              </p>
            </div>
          </div>

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 snap-x snap-mandatory cursor-grab pb-4 overscroll-x-contain"
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
                <div className="w-full h-[360px] bg-[#2A2A2A] rounded-[8px] overflow-hidden relative">
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

          {canScroll && (
            <div className="hidden xl:flex justify-end mt-2">
              <button
                onClick={handleClick}
                className="w-[60px] h-[60px] rounded-full border border-white/12 hover:border-white/24 flex items-center justify-center transition-colors cursor-pointer group"
              >
                <svg
                  width="20" height="15" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-500 ${isAtEnd ? "rotate-180" : ""}`}
                >
                  <path d="M9.73343 0.625L14.8921 5.85984C15.036 6.00628 15.036 6.24372 14.8921 6.39016L9.73343 11.625M14.7843 6.125H1" stroke="#ffffff" strokeWidth="1.25" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </button>
            </div>
          )}

          <style dangerouslySetInnerHTML={{
            __html: `
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
