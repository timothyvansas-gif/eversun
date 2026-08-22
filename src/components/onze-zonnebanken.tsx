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
        <div className="flex">
          <button
            onClick={appointment.open}
            className={`group/cta ${BTN_PILL_CTA} ${BTN_CTA_HEIGHT} w-full justify-center !px-6 lg:min-w-[300px] lg:w-auto lg:!px-6`}
          >
            <CtaLabel hold className="gap-1.5">
              Plan je moment
              <span className="inline-flex items-center gap-1.5 text-[15px] font-normal leading-none text-white font-sans tracking-[-0.01em] whitespace-nowrap">
                <span aria-hidden="true">–</span>
                <span>{minuten} · {prijs}</span>
              </span>
            </CtaLabel>
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
        className="flex flex-col gap-[10px] md:gap-[14px] sm:bg-surface-card sm:p-8 sm:rounded-[24px] lg:gap-0 lg:p-8 xl:h-full"
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
        <div className="mt-3 md:mt-0 lg:relative lg:z-10 lg:-mt-3 lg:flex lg:flex-1 lg:flex-col lg:rounded-[12px] lg:bg-white lg:p-8">
          <div className="flex items-center gap-3">
            <h3 className="card-title text-zinc-900">{data.title}</h3>
            {data.tag && (
              <span className="shrink-0 whitespace-nowrap text-[13px] font-normal leading-none px-2.5 py-1.5 rounded-[4px] bg-line/30 text-zinc-900">
                {data.tag}
              </span>
            )}
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
