"use client";

import { useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { m, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { BTN_PILL } from "@/lib/button-styles";
import { CtaArrow } from "@/components/ui/cta-arrow";
import AfspraakOverlay from "@/components/hero/afspraak-overlay";
import prestige1600 from "@/images/banken/Ergoline-Prestige-1600.webp";
import blueVision from "@/images/banken/Ergoline-Blue-Vision.webp";
import affinity600 from "@/images/banken/Ergoline-600-v2.webp";
import ergoline700 from "@/images/banken/Ergoline-770.webp";

type Zonnebank = {
  image: StaticImageData;
  alt: string;
  title: string;
  badge?: string;
  description: string[];
  minuten: string;
  prijs: string;
  whatsappUrl: string;
};

const ZONNEBANKEN: Zonnebank[] = [
  {
    image: prestige1600,
    alt: "Ergoline Prestige 1600 zonnebad",
    title: "Ergoline Prestige 1600",
    badge: "2 banken",
    description: [
      "Rood Beauty Light biedt de ultieme combinatie van een diepe, egale bruining en intensieve, hoogwaardige huidverzorging.",
      "Stem de bank via 'Personal Sunstyle' af op jouw huid: kies intensive voor maximale kracht, medium voor natuurlijk of sensitive voor mild.",
    ],
    minuten: "20 min",
    prijs: "€ 18,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20Prestige%201600",
  },
  {
    image: blueVision,
    alt: "Ergoline Blue Vision zonnebad",
    title: "Ergoline Blue Vision",
    badge: "2 banken",
    description: [
      "Activerend blauw licht stimuleert de zuurstofopname in je huid. Dit zorgt voor een direct zichtbaar en dieper bruiningsresultaat.",
      "Kies via het display jouw intensiteit: intensive voor de donkerste teint, medium voor opbouw of sensitive voor milde huidactivatie.",
    ],
    minuten: "20 min",
    prijs: "€ 19,50",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20Blue%20Vision",
  },
  {
    image: ergoline700,
    alt: "Ergoline 770 Medium zonnebad",
    title: "Ergoline 770 medium",
    description: [
      "Een vertrouwde en geliefde krachtpatser die garant staat voor een consistent, onberispelijk en egaal bruiningsresultaat.",
      "Deze bank focust op pure performance. De ideale keuze voor de ervaren zonner die gaat voor een krachtige, betrouwbare sessie zonder poespas.",
    ],
    minuten: "20 min",
    prijs: "€ 14,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20770%20medium",
  },
  {
    image: affinity600,
    alt: "Ergoline Affinity 600 zonnebad",
    title: "Ergoline 600 light",
    description: [
      "Een toegankelijke en comfortabele klassieker die zorgt voor een betrouwbare, mooie en gelijkmatige bruining.",
      "Dankzij de ergonomische vormgeving en de verfrissende koeling geniet je van een ontspannen sessie met een natuurlijk resultaat als einddoel.",
    ],
    minuten: "20 min",
    prijs: "€ 12,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20600%20light",
  },
];

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

function AfspraakButton({
  minuten,
  prijs,
  whatsappUrl,
  className = "mt-3 md:mt-auto",
  reverse = false,
}: {
  minuten: string;
  prijs: string;
  whatsappUrl: string;
  className?: string;
  reverse?: boolean;
}) {
  const [qrOpen, setQrOpen] = useState(false);

  const handleClick = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      window.open(whatsappUrl, "_blank");
    } else {
      setQrOpen(true);
    }
  };

  return (
    <>
      <div className={className}>
        <div className="flex items-center justify-between md:justify-start md:gap-6">
          <div className={`flex items-center gap-3 ${reverse ? "order-2" : ""}`}>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-900 shrink-0" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
                <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-zinc-900 text-[14px] font-sans tracking-[-0.01em]">{minuten}</span>
            </div>
            <span className="text-zinc-900 text-[15px] font-semibold font-sans tracking-[-0.01em]">{prijs}</span>
          </div>
          <button onClick={handleClick} className={`${BTN_PILL} !px-[28px] py-[10px] flex-shrink-0 ${reverse ? "order-1" : ""}`}>
            Plan je moment
            <CtaArrow />
          </button>
        </div>
      </div>

      <AfspraakOverlay isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile / tablet (< lg): production grid — unchanged live layout     */
/* ------------------------------------------------------------------ */

function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex-1 flex flex-col gap-6"
    >
      {children}
    </m.div>
  );
}

function ZonnebankCard({ data }: { data: Zonnebank }) {
  return (
    <CardWrapper>
      <div className="group flex flex-col gap-[10px] md:gap-[14px] xl:gap-[30px] xl:bg-[#FDF9F5] xl:p-10 xl:h-full xl:rounded-[12px]">
        <div className="relative min-h-[240px] md:min-h-[280px] rounded-[12px] overflow-hidden">
          <Image
            src={data.image}
            alt={data.alt}
            fill
            className="object-cover object-bottom transition-transform duration-200 ease-out xl:group-hover:scale-[1.04] xl:group-hover:duration-700"
            sizes="(max-width: 767px) 100vw, 50vw"
          />
          {data.badge && (
            <span className="absolute bottom-3 left-3 md:bottom-6 md:left-6 text-[14px] font-medium leading-none px-2.5 py-1.5 rounded-full bg-brand text-[#111111]">
              {data.badge}
            </span>
          )}
        </div>
        <h3 className="card-title text-zinc-900 mt-3 md:mt-0">{data.title}</h3>
        {data.description.map((paragraph, i) => (
          <p
            key={i}
            className={`text-zinc-600 text-[15px] leading-[24px] tracking-[-0.01em] font-sans ${i === 0 ? "mt-[2px] md:mt-0 xl:-mt-3" : ""}`}
          >
            {paragraph}
          </p>
        ))}
        <AfspraakButton minuten={data.minuten} prijs={data.prijs} whatsappUrl={data.whatsappUrl} />
      </div>
    </CardWrapper>
  );
}

function MobileDivider() {
  return <div className="md:hidden h-px my-2 bg-[#ece2d2]/50" />;
}

function ProductionGrid() {
  return (
    <div className="lg:hidden flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        <ZonnebankCard data={ZONNEBANKEN[0]} />
        <MobileDivider />
        <ZonnebankCard data={ZONNEBANKEN[1]} />
      </div>
      <MobileDivider />
      <div className="flex flex-col md:flex-row gap-6">
        <ZonnebankCard data={ZONNEBANKEN[2]} />
        <MobileDivider />
        <ZonnebankCard data={ZONNEBANKEN[3]} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop (>= lg): scroll-driven timeline                             */
/* ------------------------------------------------------------------ */

function TimelineRow({ data, index, total, progress }: { data: Zonnebank; index: number; total: number; progress: MotionValue<number> }) {
  const imageLeft = false; // photo sits on the right in every card
  // This card's bar fills only during its slice of the section scroll, so each
  // bar starts only once the bar above it is completely full.
  const fill = useTransform(progress, [index / total, (index + 1) / total], [0, 1], { clamp: true });

  // Fade in place — no positional glide, which read as dated. Opacity only.
  const imageMotion = { initial: { opacity: 0 }, whileInView: { opacity: 1 } };
  const textMotion = { initial: { opacity: 0 }, whileInView: { opacity: 1 } };

  return (
    <div className="relative grid grid-cols-2 gap-10 xl:gap-14 items-center bg-[#FEF9F5] rounded-[24px] p-8 xl:p-10">
      {/* Per-card progress bar: track + fill (fill driven by the section scroll) */}
      <m.div
        aria-hidden
        className="absolute left-1/2 top-8 bottom-8 xl:top-10 xl:bottom-10 w-px -translate-x-1/2 bg-line/40"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.8, ease: EASE }}
      />
      <m.div
        aria-hidden
        className="absolute left-1/2 top-8 bottom-8 xl:top-10 xl:bottom-10 w-[2px] -translate-x-1/2 bg-[#D6CDBB] origin-top"
        style={{ scaleY: fill }}
      />

      {/* Image */}
      <m.div
        {...imageMotion}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.9, ease: EASE }}
        className={imageLeft ? "order-1" : "order-2"}
      >
        <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-[16px]">
          <Image
            src={data.image}
            alt={data.alt}
            fill
            className="object-cover object-bottom transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            sizes="50vw"
          />
          {data.badge && (
            <span className="absolute bottom-5 left-5 text-[14px] font-medium leading-none px-2.5 py-1.5 rounded-full bg-brand text-[#111111]">
              {data.badge}
            </span>
          )}
        </div>
      </m.div>

      {/* Text + CTA */}
      <m.div
        {...textMotion}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
        className={`flex flex-col ${imageLeft ? "order-2" : "order-1"}`}
      >
        <h3 className="font-display text-[clamp(26px,2.6vw,36px)] leading-[1.05] tracking-[-0.01em] text-zinc-900">
          {data.title}
        </h3>
        <div className="mt-4 flex flex-col gap-3">
          {data.description.map((paragraph, i) => (
            <p key={i} className="text-zinc-600 text-[15px] leading-[24px] tracking-[-0.01em] font-sans">
              {paragraph}
            </p>
          ))}
        </div>
        <AfspraakButton minuten={data.minuten} prijs={data.prijs} whatsappUrl={data.whatsappUrl} className="mt-9" reverse />
      </m.div>
    </div>
  );
}

function DesktopTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  // One progress value for the whole timeline; each card fills its own slice of
  // it in sequence (see TimelineRow), so a bar only starts once the one above
  // it is completely full.
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start 0.85", "end 0.15"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 30, restDelta: 0.001 });

  return (
    <div ref={timelineRef} className="relative hidden lg:flex lg:flex-col gap-6">
      {ZONNEBANKEN.map((bank, i) => (
        <TimelineRow key={bank.title} data={bank} index={i} total={ZONNEBANKEN.length} progress={progress} />
      ))}
    </div>
  );
}

export default function OnzeZonnebanken() {
  return (
    <section className="w-full bg-white py-16 xl:py-24">
      <div
        className="w-full flex flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div className="w-full max-w-[1280px] mx-auto">
          <div id="banken" className="mb-8 xl:mb-10 scroll-mt-20 lg:scroll-mt-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-5 md:gap-6">
              <div>
                <h2 className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-900 font-display">
                  Onze zes zonnebanken
                </h2>
                <p className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-400 font-display mt-1">
                  voor echt comfort
                </p>
              </div>
              <p className="text-zinc-600 text-[15px] leading-[24px] max-w-[411px] tracking-[-0.01em] md:mb-[2px]">
                Kies voor de wereldwijde standaard van Ergoline. Slimme sensoren, verfijnd comfort en een topresultaat door altijd preventief vernieuwde lampen.
              </p>
            </div>
          </div>

          <ProductionGrid />
          <DesktopTimeline />
        </div>
      </div>
    </section>
  );
}
