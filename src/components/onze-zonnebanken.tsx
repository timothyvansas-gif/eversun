"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { StaticImageData } from "next/image";
import { m } from "framer-motion";
import {
  BTN_CTA_HEIGHT,
  BTN_PILL_CTA,
  BTN_PILL_LIGHT_OUTLINE,
} from "@/lib/button-styles";
import AfspraakOverlay from "@/components/hero/afspraak-overlay";
import PlanJeMomentSheet from "@/components/hero/plan-je-moment-sheet";
import { CtaLabel } from "@/components/ui/cta-arrow";
import ZonnebankMedia from "@/components/zonnebank-media";
import { ZONNEBANKEN, type Zonnebank } from "@/data/zonnebanken-data";
import { useAppointmentLauncher } from "@/hooks/use-appointment-launcher";
import { useZonnebankVideo } from "@/hooks/use-zonnebank-video";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const HuidtestOverlay = dynamic(() => import("@/components/huidtest/huidtest-overlay"));

function SessionDetails({ minuten, prijs }: { minuten: string; prijs: string }) {
  return (
    <div className="flex items-center gap-3 text-zinc-600 font-sans">
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
          <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="whitespace-nowrap text-[15px] tracking-[-0.01em]">{minuten}</span>
      </div>
      <span className="whitespace-nowrap text-[15px] tracking-[-0.01em]">{prijs}</span>
    </div>
  );
}

function AfspraakButton({
  whatsappUrl,
  qrCode,
  title,
  slug,
  minuten,
  prijs,
  className = "mt-3 md:mt-auto",
}: {
  whatsappUrl: string;
  qrCode: StaticImageData;
  title: string;
  slug: Zonnebank["slug"];
  minuten: string;
  prijs: string;
  className?: string;
}) {
  const appointment = useAppointmentLauncher();
  const [huidtestOpen, setHuidtestOpen] = useState(false);

  return (
    <>
      <div className={className}>
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:gap-2">
          <button
            onClick={appointment.open}
            className={`group/cta ${BTN_PILL_CTA} ${BTN_CTA_HEIGHT} w-full overflow-hidden justify-center !px-6 lg:w-auto lg:min-w-[180px] xl:min-w-[190px]`}
          >
            <span className="inline-flex items-center gap-1.5 lg:hidden">
              Plan je moment
              <span className="inline-flex items-center gap-1.5 text-[15px] font-normal leading-none text-white font-sans tracking-[-0.01em] whitespace-nowrap">
                <span aria-hidden="true">–</span>
                <span>{minuten} · {prijs}</span>
              </span>
            </span>
            <CtaLabel hold className="max-lg:hidden!">Plan je moment</CtaLabel>
          </button>
          <p className="text-center font-sans text-[15px] text-zinc-600 lg:hidden">
            De juiste bank voor mij?{" "}
            <button
              type="button"
              onClick={() => setHuidtestOpen(true)}
              className="cursor-pointer underline decoration-zinc-300 decoration-1 underline-offset-6 transition-colors duration-150 hover:decoration-ink-strong"
            >
              Doe de huidtest
            </button>
            .
          </p>
          <button
            type="button"
            onClick={() => setHuidtestOpen(true)}
            className={`group/cta ${BTN_PILL_LIGHT_OUTLINE} ${BTN_CTA_HEIGHT} w-full overflow-hidden justify-center border-line/30! text-zinc-600! hover:border-line! hover:text-ink-primary! max-lg:hidden! lg:w-auto lg:!px-5 xl:min-w-[190px]`}
          >
            <CtaLabel hold>Doe de huidtest</CtaLabel>
          </button>
        </div>
      </div>

      <AfspraakOverlay
        isOpen={appointment.qrOpen}
        onClose={appointment.closeQr}
        whatsappUrl={whatsappUrl}
        qrCode={qrCode}
        bankTitle={title}
      />
      <PlanJeMomentSheet
        isOpen={appointment.sheetOpen}
        onClose={appointment.closeSheet}
        whatsappUrl={whatsappUrl}
        description={
          <>
            Voor de {title} kun je ons appen of bellen. Dan plannen we een moment dat jou uitkomt.
          </>
        }
      />
      <HuidtestOverlay
        isOpen={huidtestOpen}
        onClose={() => setHuidtestOpen(false)}
        entry="zonnebank_kaart"
        bekekenBank={slug}
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
      className="min-w-0 flex-1 flex flex-col gap-6"
    >
      {children}
    </m.div>
  );
}

function ZonnebankCard({ data }: { data: Zonnebank }) {
  const {
    cardRef,
    videoRef,
    videoPreload,
    handleCardPointerEnter,
    isVideoReady,
    isVideoActive,
    isVideoAnimating,
    isVideoLoading,
    isVideoUnavailable,
    handleVideoToggle,
    handleVideoLoadedData,
    handleVideoCanPlay,
    handleVideoEnded,
    handleVideoTimeUpdate,
    handleVideoPlaying,
    handleVideoWaiting,
    handleVideoError,
  } = useZonnebankVideo();

  return (
    <CardWrapper>
      <div
        ref={cardRef}
        // Pointer over the card upgrades the clip from metadata to a full
        // fetch, so the toggle is ready by the time the cursor reaches it.
        onPointerEnter={handleCardPointerEnter}
        // `group/card` en niet het kale `group`: de mediabox eronder voert al
        // een eigen `group`, en een naamloze tweede zou die overschaduwen.
        //
        // De hoverkleur (`--color-surface-hover`) staat op 60% dekking. De sectie eronder is wit, dus die
        // 40% mengt wit terug in en het verschil met de rustkleur zakt van 5,5
        // naar 2,2 dE — genoeg om te merken dat de kaart reageert, te weinig om
        // de aandacht van de foto weg te trekken. Volle #F2ECE2 was te zwaar.
        className="group/card flex flex-col gap-[10px] md:gap-[14px] sm:bg-surface-card sm:p-8 sm:rounded-[24px] lg:gap-0 lg:p-8 lg:rounded-[12px] lg:transition-colors lg:duration-300 lg:ease-out lg:hover:bg-surface-hover/60 xl:h-full"
      >
        <ZonnebankMedia
          data={data}
          videoRef={videoRef}
          videoPreload={videoPreload}
          isVideoReady={isVideoReady}
          isVideoActive={isVideoActive}
          isVideoAnimating={isVideoAnimating}
          isVideoLoading={isVideoLoading}
          isVideoUnavailable={isVideoUnavailable}
          onVideoToggle={handleVideoToggle}
          onVideoLoadedData={handleVideoLoadedData}
          onVideoCanPlay={handleVideoCanPlay}
          onVideoEnded={handleVideoEnded}
          onVideoTimeUpdate={handleVideoTimeUpdate}
          onVideoPlaying={handleVideoPlaying}
          onVideoWaiting={handleVideoWaiting}
          onVideoError={handleVideoError}
        />
        {/* Hover op de kaart — niet alleen op dit vlak — tilt de bovenrand 12px
            verder over de media (-mt-3 → -mt-5, 12px wordt 20px). De padding
            groeit met diezelfde 8px, dus de kop en alles eronder blijven staan
            waar ze stonden: het vlak groeit, de inhoud verschuift niet. Beide
            eigenschappen animeren, dus heen en terug lezen hetzelfde. */}
        <div className="mt-3 md:mt-0 lg:relative lg:z-10 lg:-mt-3 lg:flex lg:flex-1 lg:flex-col lg:rounded-b-[8px] lg:bg-white lg:p-8 lg:transition-[margin-top,padding-top] lg:duration-300 lg:ease-out lg:group-hover/card:-mt-5 lg:group-hover/card:pt-10">
          <div className="flex items-center gap-3">
            <h3 className="card-title text-zinc-900">{data.title}</h3>
            {data.tag && (
              // Zelfde pil als de categorielabels op de productkaarten: dezelfde
              // achtergrond, tekstkleur, padding en radius. Alleen de tekst is
              // hier 13px in plaats van 15 — dit label staat naast een kop en
              // moet die niet beconcurreren.
              <span className="shrink-0 whitespace-nowrap bg-surface-pill text-muted text-[13px] leading-none tracking-[-0.01em] font-sans px-[10px] py-[8px] rounded-[4px]">
                {data.tag}
              </span>
            )}
          </div>
          <div className="mt-2 hidden lg:block">
            <SessionDetails minuten={data.minuten} prijs={data.prijs} />
          </div>
          <div className="mt-[10px] flex flex-col gap-3 md:mt-[14px] md:gap-4 lg:mt-[10px]">
            {data.description.map((paragraph) => (
              <p key={paragraph} className="text-zinc-600 text-[15px] leading-[24px] tracking-[-0.01em] font-sans">
                {/* A \n in the copy is a desktop-only break: the <br> is display:none
                    below xl, where the sentences read better as one flowing block.
                    The leading space keeps them apart on mobile and collapses at the
                    start of the broken line on desktop. */}
                {paragraph.split("\n").map((sentence, j) => (
                  <span key={j}>
                    {j > 0 && <br className="hidden xl:inline" />}
                    {j > 0 && " "}
                    {sentence}
                  </span>
                ))}
              </p>
            ))}
          </div>
          <AfspraakButton
            whatsappUrl={data.whatsappUrl}
            qrCode={data.qrCode}
            title={data.title}
            slug={data.slug}
            minuten={data.minuten}
            prijs={data.prijs}
            className="mt-[22px] md:mt-[14px] lg:mt-[30px]"
          />
        </div>
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
                <p className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-500 font-display mt-1">
                  voor echt comfort
                </p>
              </div>
              <p className="text-zinc-600 text-[15px] leading-[24px] max-w-[411px] tracking-[-0.01em] md:mb-[2px]">
                Alle banken zijn van Ergoline, de standaard in de branche. We vervangen de lampen preventief, dus elke sessie geeft dezelfde kracht.
              </p>
            </div>
          </div>

          <ProductionGrid />
        </div>
      </div>
    </section>
  );
}
