"use client";

import { useState } from "react";
import Image from "next/image";
import AfspraakOverlay from "@/components/hero/afspraak-overlay";
import prestige1600 from "@/images/banken/eversun-ergoline-prestige-1600.webp";
import blueVision from "@/images/banken/eversun-ergoline-blue-vision.webp";

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
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-900 shrink-0">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
              <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-zinc-900 text-[14px] font-sans tracking-[-0.01em]">{minuten}</span>
          </div>
          <span className="text-zinc-900 text-[15px] font-semibold font-sans tracking-[-0.01em]">{prijs}</span>
        </div>
        <button
          onClick={handleClick}
          className="text-zinc-900 text-[15px] font-normal font-sans tracking-[-0.01em] border border-[#ece2d2] rounded-full px-[18px] py-[10px] cursor-pointer hover:border-zinc-400 transition-colors duration-150"
        >
          Maak afspraak
        </button>
      </div>

      <AfspraakOverlay isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  );
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
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-5 xl:gap-6">
              <div>
                <h2 className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-900 font-display">
                  Onze zes zonnebanken
                </h2>
                <h3 className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-400 font-display mt-1">
                  voor echt comfort
                </h3>
              </div>
              <p className="text-zinc-600 text-[15px] leading-[25px] max-w-[411px] tracking-[-0.01em] xl:mb-[2px]">
                Ervaar de wereldwijde standaard in zonlicht. Met Ergoline kies je voor slimme sensoren, verfijnd ligcomfort en een resultaat dat gezien mag worden.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6 md:gap-16">
            {/* Rij 1 */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-6">
                <div className="relative min-h-[300px] md:min-h-[320px] rounded-lg overflow-hidden">
                  <Image
                    src={blueVision}
                    alt="Ergoline Blue Vision zonnebad"
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 100vw, 50vw"
                  />
                  <span className="absolute bottom-3 right-3 md:bottom-6 md:right-6 text-[13px] font-medium leading-none px-2.5 py-1.5 rounded-full" style={{ backgroundColor: "#FDC43F", color: "#111111" }}>2 banken</span>
                </div>
                <div className="flex flex-col gap-[10px] md:pr-14">
                  <h3 className="text-zinc-900 text-[18px] font-semibold tracking-[-0.27px] font-sans">
                    Ergoline Blue Vision
                  </h3>
                  <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                    De Blue Vision maakt gebruik van activerend blauw licht om de zuurstofopname in de huid te stimuleren, wat zorgt voor een direct zichtbaar en dieper resultaat.
                  </p>
                  <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                    Via het display kies je eenvoudig jouw gewenste intensiteit: intensive voor de meest donkere teint, medium voor een vitale opbouw of sensitive voor een verfrissende, rustige activatie van de huid.
                  </p>
                  <AfspraakButton minuten="20 min" prijs="€ 19,50" whatsappUrl="https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20Blue%20Vision" />
                </div>
              </div>
              <div className="md:hidden h-px my-2" style={{ backgroundColor: "#ece2d2", opacity: 0.5 }} />
              <div className="flex-1 flex flex-col gap-6">
                <div className="relative min-h-[300px] md:min-h-[320px] rounded-lg overflow-hidden">
                  <Image
                    src={prestige1600}
                    alt="Ergoline Prestige 1600 zonnebad"
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 100vw, 50vw"
                  />
                  <span className="absolute bottom-3 right-3 md:bottom-6 md:right-6 text-[13px] font-medium leading-none px-2.5 py-1.5 rounded-full" style={{ backgroundColor: "#FDC43F", color: "#111111" }}>2 banken</span>
                </div>
                <div className="flex flex-col gap-[10px] md:pr-14">
                  <h3 className="text-zinc-900 text-[18px] font-semibold tracking-[-0.27px] font-sans">
                    Ergoline Prestige 1600
                  </h3>
                  <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                    De Prestige 1600 is de ultieme combinatie van een diepe bruining en intensieve huidverzorging dankzij het rode Beauty Light.
                  </p>
                  <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                    Met de 'Personal Sunstyle' functie stem je de bank direct af op jouw huidtype: kies voor intensive voor maximale kracht, medium voor een natuurlijke kleur of sensitive voor een milde, verzorgende sessie.
                  </p>
                  <AfspraakButton minuten="20 min" prijs="€ 18,00" whatsappUrl="https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20Prestige%201600" />
                </div>
              </div>
            </div>
            <div className="md:hidden h-px my-2" style={{ backgroundColor: "#ece2d2", opacity: 0.5 }} />
            {/* Rij 2 */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-6">
                <div className="relative min-h-[300px] md:min-h-[320px] bg-zinc-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-zinc-400 text-sm">Afbeelding</p>
                  </div>
                </div>
                <div className="flex flex-col gap-[10px] md:pr-14">
                  <h3 className="text-zinc-900 text-[18px] font-semibold tracking-[-0.27px] font-sans">
                    Ergoline 770 medium
                  </h3>
                  <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                    De Ergoline 770 is een vertrouwde krachtpatser die bekendstaat om zijn consistente en onberispelijk egale bruiningsresultaat.
                  </p>
                  <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                    Deze bank focust op pure performance en is de ideale keuze voor de ervaren zonner die op zoek is naar een krachtige, betrouwbare sessie zonder poespas.
                  </p>
                  <AfspraakButton minuten="20 min" prijs="€ 14,00" whatsappUrl="https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20770%20medium" />
                </div>
              </div>
              <div className="md:hidden h-px my-2" style={{ backgroundColor: "#ece2d2", opacity: 0.5 }} />
              <div className="flex-1 flex flex-col gap-6">
                <div className="relative min-h-[300px] md:min-h-[320px] bg-zinc-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-zinc-400 text-sm">Afbeelding</p>
                  </div>
                </div>
                <div className="flex flex-col gap-[10px] md:pr-14">
                  <h3 className="text-zinc-900 text-[18px] font-semibold tracking-[-0.27px] font-sans">
                    Ergoline 600 light
                  </h3>
                  <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                    De Ergoline 600 Light is een toegankelijke klassieker die comfort combineert met een betrouwbare, gelijkmatige bruining.
                  </p>
                  <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                    Dankzij de ergonomische vormgeving en de verfrissende koeling geniet je van een ontspannen sessie met een natuurlijk en egaal resultaat als einddoel.
                  </p>
                  <AfspraakButton minuten="20 min" prijs="€ 12,00" whatsappUrl="https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20600%20light" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
