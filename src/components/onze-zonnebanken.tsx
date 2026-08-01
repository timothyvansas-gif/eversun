"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { BTN_PILL } from "@/lib/button-styles";
import { CtaArrow } from "@/components/ui/cta-arrow";
import AfspraakOverlay from "@/components/hero/afspraak-overlay";
import PlanJeMomentSheet from "@/components/hero/plan-je-moment-sheet";
import ZonnebankMedia from "@/components/zonnebank-media";
import { ZONNEBANKEN, type Zonnebank } from "@/data/zonnebanken-data";
import { useZonnebankVideo } from "@/hooks/use-zonnebank-video";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

function AfspraakButton({
  minuten,
  prijs,
  whatsappUrl,
  className = "mt-3 md:mt-auto",
}: {
  minuten: string;
  prijs: string;
  whatsappUrl: string;
  className?: string;
}) {
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
      <div className={className}>
        <div className="flex items-center justify-between md:justify-start md:gap-6">
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
          <button onClick={handleClick} className={`${BTN_PILL} !px-[28px] py-[10px] flex-shrink-0`}>
            Plan je moment
            <CtaArrow />
          </button>
        </div>
      </div>

      <AfspraakOverlay isOpen={qrOpen} onClose={() => setQrOpen(false)} />
      <PlanJeMomentSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        whatsappUrl={whatsappUrl}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Grid: photo on top, text below, cards side by side                  */
/* ------------------------------------------------------------------ */

function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.9, ease: EASE }}
      className="flex-1 flex flex-col gap-6"
    >
      {children}
    </m.div>
  );
}

function ZonnebankCard({ data }: { data: Zonnebank }) {
  const {
    cardRef,
    videoRef,
    shouldLoadVideo,
    isVideoReady,
    isVideoActive,
    isVideoLoading,
    handleVideoToggle,
    handleVideoLoadedData,
    handleVideoCanPlay,
    handleVideoPlaying,
    handleVideoWaiting,
    handleVideoError,
  } = useZonnebankVideo();

  return (
    <CardWrapper>
      <div
        ref={cardRef}
        className="flex flex-col gap-[10px] md:gap-[14px] xl:gap-[30px] xl:bg-[#FDF9F5] xl:p-10 xl:h-full xl:rounded-[12px]"
      >
        <ZonnebankMedia
          data={data}
          videoRef={videoRef}
          shouldLoadVideo={shouldLoadVideo}
          isVideoReady={isVideoReady}
          isVideoActive={isVideoActive}
          isVideoLoading={isVideoLoading}
          onVideoToggle={handleVideoToggle}
          onVideoLoadedData={handleVideoLoadedData}
          onVideoCanPlay={handleVideoCanPlay}
          onVideoPlaying={handleVideoPlaying}
          onVideoWaiting={handleVideoWaiting}
          onVideoError={handleVideoError}
        />
        <div className="flex items-center gap-3 mt-3 md:mt-0">
          <h3 className="card-title text-zinc-900">{data.title}</h3>
          {data.tag && (
            <span className="shrink-0 whitespace-nowrap text-[14px] font-normal leading-none px-2.5 py-1.5 rounded-full bg-line/30 text-zinc-900">
              {data.tag}
            </span>
          )}
        </div>
        {data.description.map((paragraph, i) => (
          <p
            key={i}
            className={`text-zinc-600 text-[15px] leading-[24px] tracking-[-0.01em] font-sans ${i === 0 ? "mt-[2px] md:mt-0 xl:-mt-3" : ""}`}
          >
            {paragraph}
          </p>
        ))}
        <AfspraakButton
          minuten={data.minuten}
          prijs={data.prijs}
          whatsappUrl={data.whatsappUrl}
        />
      </div>
    </CardWrapper>
  );
}

function MobileDivider() {
  return <div className="md:hidden h-px my-2 bg-[#ece2d2]/50" />;
}

function ProductionGrid() {
  return (
    <div className="flex flex-col gap-6">
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

export default function OnzeZonnebanken() {
  return (
    <section className="w-full bg-white py-16 xl:py-24">
      <div
        className="w-full flex flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div className="w-full max-w-[1280px] mx-auto">
          <div id="banken" className="mb-8 xl:mb-10 scroll-mt-20 lg:scroll-mt-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 md:gap-6">
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
        </div>
      </div>
    </section>
  );
}
