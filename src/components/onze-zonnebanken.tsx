"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { StaticImageData } from "next/image";
import { m } from "framer-motion";
import {
  BTN_CTA_HEIGHT,
  BTN_PILL,
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

// This is only needed after someone asks for advice, so it stays out of the
// initial bundle for a section that most visitors simply browse.
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
  onStartHuidtest,
  className = "mt-3 md:mt-auto",
}: {
  whatsappUrl: string;
  qrCode: StaticImageData;
  title: string;
  onStartHuidtest: () => void;
  className?: string;
}) {
  const appointment = useAppointmentLauncher();

  return (
    <>
      <div className={className}>
        {/* No row-reverse any more: the filled button is first in the DOM —
            which is what makes it the one Enter submits and the one a screen
            reader meets first — and it now reads first on screen too, at every
            width. The reverse used to flip only the mobile row, putting the
            outline button on the left there and nowhere else. */}
        <div className="flex w-full gap-3 lg:w-auto">
          <button
            onClick={appointment.open}
            // Swaps the orange for zinc-900 on this card's booking button,
            // rather than touching bg-cta everywhere else it's used.
            className={`group/cta ${BTN_PILL_CTA} ${BTN_CTA_HEIGHT} flex-1 justify-center !px-6 lg:min-w-[184px] lg:w-auto lg:flex-none lg:!px-6 !bg-zinc-900`}
          >
            {/* White label throughout; the fill above swapped from orange to
                zinc-900. */}
            <CtaLabel hold>Plan je moment</CtaLabel>
          </button>
          <button
            type="button"
            onClick={onStartHuidtest}
            // Darker edge than BTN_PILL's default border-ink-primary/20, to
            // match the filled button's zinc-900 next to it. lg:min-w is
            // narrower than it was for "Doe de huidtest" (178px), but still
            // wider than "Huidtest" alone needs — reads better next to the
            // filled pill than a button that hugs its own padding exactly.
            className={`group/cta ${BTN_PILL} ${BTN_CTA_HEIGHT} flex-none justify-center !px-8 lg:min-w-[132px] lg:w-auto lg:!px-6 !border-zinc-900`}
          >
            <CtaLabel hold>Huidtest</CtaLabel>
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
      className="flex-1 flex flex-col gap-6"
    >
      {children}
    </m.div>
  );
}

function ZonnebankCard({ data }: { data: Zonnebank }) {
  const [huidtestOpen, setHuidtestOpen] = useState(false);
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
          <div className="mt-2">
            <SessionDetails minuten={data.minuten} prijs={data.prijs} />
          </div>
        </div>
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
        <AfspraakButton
          whatsappUrl={data.whatsappUrl}
          qrCode={data.qrCode}
          title={data.title}
          onStartHuidtest={() => setHuidtestOpen(true)}
        />
      </div>
      <HuidtestOverlay
        isOpen={huidtestOpen}
        onClose={() => setHuidtestOpen(false)}
        entry="zonnebank_kaart"
        bekekenBank={data.slug}
      />
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
