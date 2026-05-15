"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useImageHoverScale } from "@/hooks/use-image-hover-scale";
import { motion, useReducedMotion } from "framer-motion";
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
    image: blueVision,
    alt: "Ergoline Blue Vision zonnebad",
    title: "Ergoline Blue Vision",
    badge: "2 banken",
    description: [
      "De Blue Vision maakt gebruik van activerend blauw licht om de zuurstofopname in de huid te stimuleren, wat zorgt voor een direct zichtbaar en dieper resultaat.",
      "Via het display kies je eenvoudig jouw gewenste intensiteit: intensive voor de meest donkere teint, medium voor een vitale opbouw of sensitive voor een verfrissende, rustige activatie van de huid.",
    ],
    minuten: "20 min",
    prijs: "€ 19,50",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20Blue%20Vision",
  },
  {
    image: prestige1600,
    alt: "Ergoline Prestige 1600 zonnebad",
    title: "Ergoline Prestige 1600",
    badge: "2 banken",
    description: [
      "De Prestige 1600 is de ultieme combinatie van een diepe bruining en intensieve huidverzorging dankzij het rode Beauty Light.",
      "Met de ‘Personal Sunstyle’ functie stem je de bank direct af op jouw huidtype: kies voor intensive voor maximale kracht, medium voor een natuurlijke kleur of sensitive voor een milde, verzorgende sessie.",
    ],
    minuten: "20 min",
    prijs: "€ 18,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20Prestige%201600",
  },
  {
    image: ergoline700,
    alt: "Ergoline 770 Medium zonnebad",
    title: "Ergoline 770 medium",
    description: [
      "De Ergoline 770 is een vertrouwde krachtpatser die bekendstaat om zijn consistente en onberispelijk egale bruiningsresultaat.",
      "Deze bank focust op pure performance en is de ideale keuze voor de ervaren zonner die op zoek is naar een krachtige, betrouwbare sessie zonder poespas.",
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
      "De Ergoline 600 Light is een toegankelijke klassieker die comfort combineert met een betrouwbare, gelijkmatige bruining.",
      "Dankzij de ergonomische vormgeving en de verfrissende koeling geniet je van een ontspannen sessie met een natuurlijk en egaal resultaat als einddoel.",
    ],
    minuten: "20 min",
    prijs: "€ 12,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20600%20light",
  },
];

function CardWrapper({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex-1 flex flex-col gap-6"
    >
      {children}
    </motion.div>
  );
}

function AfspraakButton({ minuten, prijs, whatsappUrl }: { minuten: string; prijs: string; whatsappUrl: string }) {
  const [qrOpen, setQrOpen] = useState(false);

  const handleClick = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      window.open(whatsappUrl, "_blank");
    } else {
      setQrOpen(true);
    }
  };

  return (
    <>
      <div className="mt-auto">
        <div className="mt-4 flex items-center justify-between md:justify-start md:gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-900 shrink-0" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
                <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-zinc-900 text-[14px] font-sans tracking-[-0.01em]">{minuten}</span>
            </div>
            <span className="text-zinc-900 text-[15px] font-semibold font-sans tracking-[-0.01em]">{prijs}</span>
          </div>
          <button
            onClick={handleClick}
            className="text-zinc-900 text-[15px] font-normal font-sans tracking-[-0.01em] border border-[#ece2d2] rounded-full px-[18px] py-[10px] cursor-pointer hover:border-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors duration-150 flex-shrink-0"
          >
            Maak afspraak
          </button>
        </div>
      </div>

      <AfspraakOverlay isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  );
}

function ZonnebankCard({ data }: { data: Zonnebank }) {
  const { cardHandlers, imageStyle } = useImageHoverScale();
  return (
    <CardWrapper>
      <div className="flex flex-col gap-[10px] md:gap-[14px] xl:gap-[30px] xl:bg-[#FDF9F5] xl:p-10 xl:h-full xl:rounded-[8px]" {...cardHandlers}>
        <div className="relative min-h-[300px] md:min-h-[320px] rounded-[8px] xl:rounded-[4px] overflow-hidden">
          <div className="absolute inset-0" style={imageStyle}>
            <Image
              src={data.image}
              alt={data.alt}
              fill
              className="object-cover object-bottom"
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          </div>
          {data.badge && (
            <span className="absolute bottom-3 right-3 md:bottom-6 md:right-6 text-[14px] font-medium leading-none px-2.5 py-1.5 rounded-full bg-brand text-[#111111]">
              {data.badge}
            </span>
          )}
        </div>
        <h3 className="card-title text-zinc-900 mt-3 md:mt-0">{data.title}</h3>
        {data.description.map((paragraph, i) => (
          <p
            key={i}
            className={`text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans ${
              i === 0 ? "mt-[2px] md:mt-0 xl:-mt-3" : ""
            }`}
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
  return <div className="lg:hidden h-px my-2 bg-[#ece2d2]/50" />;
}

export default function OnzeZonnebanken() {
  return (
    <section id="banken" className="w-full bg-white py-16 xl:py-24">
      <div
        className="w-full flex flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="mb-8 xl:mb-10">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5 lg:gap-6">
              <div>
                <h2 className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-900 font-display">
                  Onze zes zonnebanken
                </h2>
                <p className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-400 font-display mt-1">
                  voor echt comfort
                </p>
              </div>
              <p className="text-zinc-600 text-[15px] leading-[25px] max-w-[411px] tracking-[-0.01em] lg:mb-[2px]">
                Ervaar de wereldwijde standaard in zonlicht. Met Ergoline kies je voor slimme sensoren, verfijnd ligcomfort en een resultaat dat gezien mag worden.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6 md:gap-10 xl:gap-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <ZonnebankCard data={ZONNEBANKEN[0]} />
              <MobileDivider />
              <ZonnebankCard data={ZONNEBANKEN[1]} />
            </div>
            <MobileDivider />
            <div className="flex flex-col lg:flex-row gap-6">
              <ZonnebankCard data={ZONNEBANKEN[2]} />
              <MobileDivider />
              <ZonnebankCard data={ZONNEBANKEN[3]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
