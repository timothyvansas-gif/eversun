"use client";

import Image, { type StaticImageData } from "next/image";
import logoBackground from "@/images/people/logo-background.webp";
import teamAisha from "@/images/people/team-aisha.webp";
import teamDummy from "@/images/people/team-dummy.webp";
import teamDummy2 from "@/images/people/team-dummy2.webp";
import { useHorizontalScroller } from "@/hooks/use-horizontal-scroller";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CAROUSEL_NAV_QUERY } from "@/lib/breakpoints";
import { CarouselNavButton } from "@/components/ui/carousel-nav-button";
import { CAROUSEL_TRACK_CLASS, CAROUSEL_CARD_CLASS, CAROUSEL_BLEED_STYLE } from "@/lib/carousel";

/**
 * `description` is optional on purpose. Three of these cards carried the
 * layout placeholder ("Hier gaan we een kort stukje tekst plaatsen…") in
 * production, where it was indexed along with everything else and could be
 * quoted straight back at the studio. A card without a line is quiet; a card
 * with that line is wrong. Fill them in and the text returns.
 */
const teamMembers: { id: number; name: string; image: StaticImageData; description?: string }[] = [
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
  },
  {
    id: 3,
    name: "Chloe",
    image: teamDummy2,
  },
  {
    id: 4,
    name: "Yara",
    image: teamDummy,
  }
];

export default function OverOns() {
  const { scrollRef, canScroll, isAtStart, isAtEnd, scrollNext, scrollPrev } = useHorizontalScroller();

  // A team card is not focusable — there is nothing on it to activate — so the
  // track itself has to carry the keyboard path to the cards further along.
  // From xl up the overlay arrows do that job, and a tab stop on the track only
  // ringed the whole strip on the way past. Below xl those arrows are not
  // rendered, and without the tab stop the last cards cannot be reached by
  // keyboard at all, so there it stays.
  //
  // useMediaQuery reports false until mounted, so the server always ships the
  // reachable version and the tab stop is only dropped once we know the arrows
  // are really there. tabIndex -1 rather than no attribute: it also tells the
  // browsers that hand scrollable containers their own tab stop to stay out.
  const hasArrowButtons = useMediaQuery(CAROUSEL_NAV_QUERY) && canScroll;

  return (
    <section
      className="relative w-full overflow-hidden bg-surface-dark py-16 xl:py-24"
    >
      <Image
        src={logoBackground}
        alt=""
        className="absolute top-0 right-0 pointer-events-none select-none opacity-40"
        style={{ objectFit: "none", objectPosition: "top right" }}
        aria-hidden
      />

      <div
        className="relative z-10 w-full flex flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Header Area */}
          <div id="over-ons" className="mb-9 xl:mb-14 scroll-mt-20 lg:scroll-mt-10">
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-3 xl:gap-6">
              <div>
                <h2 className="text-nav-ink text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display">
                  De zonnestralen
                </h2>
                {/* Second line of the heading, not a subsection — see producten. */}
                <p className="text-on-dark-secondary text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] font-display mt-1">
                  van Ever Sun
                </p>
              </div>
              {/* #888888, the same grey the member descriptions use below. It
                  was #818181, which measures 4.23:1 on this section's
                  background and misses 1.4.3 at 15px; this one clears at
                  4.65:1. Two greys doing one job was also how the miss went
                  unnoticed. */}
              <p className="text-on-dark-muted text-[15px] leading-[24px] max-w-[411px] tracking-[-0.01em] xl:mb-[2px]">
                Maak kennis met de zonnestralen die van jouw moment van rust een echte premium ervaring maken. Persoonlijk, vakkundig en altijd met een glimlach. ツ
              </p>
            </div>
          </div>

          {/* Scroll Container. carousel-shell: the track below is a tab stop
              of its own (unlike the products one, whose cards are focusable),
              and it wears the focus ring on behalf of that track — see
              globals.css. */}
          <div className="carousel-shell relative">
            <div
              ref={scrollRef}
              tabIndex={hasArrowButtons ? -1 : 0}
              role="region"
              aria-label="Team carrousel"
              className={CAROUSEL_TRACK_CLASS}
              style={CAROUSEL_BLEED_STYLE}
            >
              {teamMembers.map((member) => (
              <div
                key={member.id}
                className={`${CAROUSEL_CARD_CLASS} flex flex-col gap-6 select-none`}
              >
                {/* Image */}
                <div className="w-full h-[400px] bg-[#2A2A2A] rounded-[12px] overflow-hidden relative">
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
                    style={{ background: "linear-gradient(180deg, rgba(11, 11, 11, 0.00) 71.16%, rgba(11, 11, 11, 0.90) 99.64%)" }}
                  />
                </div>

                {/* Text Area */}
                <div className="flex flex-col gap-[10px] pr-4">
                  <h3 className="card-title text-nav-ink">
                    {member.name}
                  </h3>
                  {member.description && (
                    <p className="text-on-dark-muted text-[15px] leading-[24px] tracking-[-0.01em] font-sans">
                      {member.description}
                    </p>
                  )}
                </div>
              </div>
              ))}
            </div>

            {/* Overlay nav buttons — desktop only, vertically centered on the member photo (h-400px) */}
            {canScroll && (
              <>
                <div
                  className={`hidden xl:block absolute left-0 top-[200px] -translate-y-1/2 -translate-x-1/3 z-20 transition-[opacity,transform] duration-300 ease-out ${isAtStart ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"}`}
                >
                  <CarouselNavButton
                    variant="light"
                    reversed
                    onClick={scrollPrev}
                    className="bg-ink-strong/50 hover:bg-ink-strong/75 backdrop-blur-md duration-300 ease-out !border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  />
                </div>
                <div
                  className={`hidden xl:block absolute right-0 top-[200px] -translate-y-1/2 translate-x-1/3 z-20 transition-[opacity,transform] duration-300 ease-out ${isAtEnd ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"}`}
                >
                  <CarouselNavButton
                    variant="light"
                    onClick={scrollNext}
                    className="bg-ink-strong/50 hover:bg-ink-strong/75 backdrop-blur-md duration-300 ease-out !border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
