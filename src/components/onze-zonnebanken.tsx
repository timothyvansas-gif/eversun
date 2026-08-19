"use client";

import type { StaticImageData } from "next/image";
import { m } from "framer-motion";
import {
  BTN_CTA_HEIGHT,
  BTN_PILL_CTA,
} from "@/lib/button-styles";
import { CtaLabel } from "@/components/ui/cta-arrow";
import AfspraakOverlay from "@/components/hero/afspraak-overlay";
import PlanJeMomentSheet from "@/components/hero/plan-je-moment-sheet";
import ZonnebankMedia from "@/components/zonnebank-media";
import { ZONNEBANKEN, type Zonnebank } from "@/data/zonnebanken-data";
import { useAppointmentLauncher } from "@/hooks/use-appointment-launcher";
import { useZonnebankVideo } from "@/hooks/use-zonnebank-video";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

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
  minuten,
  prijs,
  className = "mt-3 md:mt-auto",
}: {
  whatsappUrl: string;
  qrCode: StaticImageData;
  title: string;
  minuten: string;
  prijs: string;
  className?: string;
}) {
  const appointment = useAppointmentLauncher();

  return (
    <>
      <div className={className}>
        {/* Mobiel: duur/prijs staan in de knop zelf, onder het label.
            Desktop: knop links, duur/prijs los ernaast, 16px gap. */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
          <button
            onClick={appointment.open}
            className={`group/cta ${BTN_PILL_CTA} ${BTN_CTA_HEIGHT} gap-2 w-full justify-center !px-6 lg:min-w-[184px] lg:w-auto lg:!px-6`}
          >
            <CtaLabel hold>Plan je moment</CtaLabel>
            <span className="lg:hidden text-[15px] font-normal leading-none text-white/70 font-sans tracking-[-0.01em] whitespace-nowrap">
              – {minuten} · {prijs}
            </span>
          </button>
          <span className="hidden lg:block">
            <SessionDetails minuten={minuten} prijs={prijs} />
          </span>
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
        className="flex flex-col gap-[10px] md:gap-[14px] xl:gap-[30px] xl:bg-surface-card xl:p-10 xl:h-full xl:rounded-[12px]"
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
        <div className="mt-3 md:mt-0">
          <div className="flex items-center gap-3">
            <h3 className="card-title text-zinc-900">{data.title}</h3>
            {data.tag && (
              <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold leading-none px-2.5 py-1.5 rounded-full bg-line/30 text-zinc-900">
                {data.tag}
              </span>
            )}
          </div>
        </div>
        {/* Eigen (kleinere) gap op desktop, los van de gap-[30px] die de
            kaart verder voor media/titel/knop gebruikt — anders staan de
            alinea's onderling te ver uit elkaar. */}
        <div className="flex flex-col gap-[10px] md:gap-[14px] xl:gap-3">
          {data.description.map((paragraph, i) => (
            <p
              key={i}
              className={`text-zinc-600 text-[15px] leading-[24px] tracking-[-0.01em] font-sans ${i === 0 ? "mt-[2px] md:mt-0 xl:-mt-3" : ""}`}
            >
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
          minuten={data.minuten}
          prijs={data.prijs}
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
