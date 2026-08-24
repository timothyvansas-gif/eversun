"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import type { Zonnebank } from "@/data/zonnebanken-data";
import sunIcon from "@/images/zon.svg";
import sunsetIcon from "@/images/zonsondergang.svg";

/**
 * Framing from lg up, where the media box is widest and these photos have the
 * most height to spare. `object-bottom` (50% 100%) pins the floor to the bottom
 * edge; a Y over 100% lifts the whole shot further, so the emblem on the back
 * wall clears the top of the bed instead of sitting behind it. Roughly 6px per
 * 10% at the lg box. A bank that needs its own framing sets `desktopFocus`.
 */
const DESKTOP_FOCUS = "lg:object-[50%_120%]";

export default function ZonnebankMedia({
  data,
  videoRef,
  videoPreload,
  isVideoReady,
  isVideoActive,
  isVideoAnimating,
  isVideoLoading,
  isVideoUnavailable,
  onVideoToggle,
  onVideoLoadedData,
  onVideoCanPlay,
  onVideoEnded,
  onVideoTimeUpdate,
  onVideoPlaying,
  onVideoWaiting,
  onVideoError,
}: {
  data: Zonnebank;
  videoRef: RefObject<HTMLVideoElement | null>;
  videoPreload: "none" | "metadata" | "auto";
  isVideoReady: boolean;
  isVideoActive: boolean;
  isVideoAnimating: boolean;
  isVideoLoading: boolean;
  isVideoUnavailable: boolean;
  onVideoToggle: () => void;
  onVideoLoadedData: () => void;
  onVideoCanPlay: () => void;
  onVideoEnded: () => void;
  onVideoTimeUpdate: () => void;
  onVideoPlaying: () => void;
  onVideoWaiting: () => void;
  onVideoError: () => void;
}) {
  return (
    // De toggle hangt hier en niet in de mediabox eronder: hij moet op desktop
    // half over de onderrand van die box steken, en die box klipt — `overflow
    // hidden` plus het masker dat iOS nodig heeft voor ronde hoeken op een
    // spelende video. Alles wat buiten zijn rand valt wordt daar afgesneden.
    // Dit vlak heeft dezelfde maat maar klipt niet, dus de knop kan eroverheen.
    <div className="relative w-full">
      {/* `w-full` staat er niet voor de sier. Deze box heeft een aspect-ratio én
          een min-height die hoger is dan die ratio bij deze breedte toelaat. Chrome
          houdt de breedte dan op de kolom en rekt alleen de hoogte op; WebKit
          rekent de breedte terug uit de ratio en maakt de box breder dan zijn
          kolom — in Safari stak de foto daardoor 32px (de padding van de kaart)
          buiten het witte vlak eronder. Een expliciete breedte laat niets te
          herleiden over. Nagemeten in Safari met een losse testpagina: zonder
          `w-full` 32px verschil, met `w-full` nul. */}
      <div
        className="group relative w-full aspect-[1.52/1] md:aspect-video md:min-h-[280px] lg:min-h-[248px] xl:min-h-[328px] rounded-[12px] lg:rounded-[8px] lg:rounded-bl-none lg:rounded-br-none overflow-hidden"
        // WebKit geeft een video een eigen systeemlaag, en die trekt zich niets
        // aan van de afgeronde `overflow: hidden` van deze box — zodra de clip
        // zichtbaar werd sprongen de hoeken op de telefoon vierkant. Een masker
        // dwingt de clip alsnog af, ook op die laag. De radial-gradient is dekkend
        // over het hele vlak; het gaat niet om zijn vorm maar om het bestaan van
        // het masker. Inline, want globals.css gooit eigenschappen die het niet
        // kent er stilzwijgend uit.
        style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
      >
        {/* De filter hangt op de foto en de video zelf, niet op dit vlak. Op een
            gedeelde ouder werkt hij ook, maar dan hangt hij boven een laag die
            iOS bij elke aanraking opnieuw tekent — een druk op de tekst eronder
            liet de correctie zichtbaar wegvallen. Per element is er geen ouder
            meer om kwijt te raken.

            Dat dit hetzelfde beeld geeft is geen toeval: de video vervaagt over
            de foto met opacity, en een feColorMatrix is lineair. Eerst mengen en
            dan corrigeren levert dezelfde pixels op als eerst corrigeren en dan
            mengen. */}
        <div className="absolute inset-x-0 top-0 bottom-0 lg:-top-6 lg:-bottom-2">
          <Image
            src={data.image}
            alt={data.alt}
            fill
            quality={data.imageQuality}
            className={`object-cover object-bottom ${data.desktopFocus ?? DESKTOP_FOCUS}`}
            sizes="(max-width: 767px) 100vw, 50vw"
            draggable={false}
          />
          {data.desktopVideo && (
            <video
              ref={videoRef}
              muted
              playsInline
              preload={videoPreload}
              disablePictureInPicture
              aria-hidden="true"
              onLoadedData={onVideoLoadedData}
              onCanPlay={onVideoCanPlay}
              onEnded={onVideoEnded}
              onTimeUpdate={onVideoTimeUpdate}
              onPlaying={onVideoPlaying}
              onWaiting={onVideoWaiting}
              onError={onVideoError}
              className={`absolute inset-0 h-full w-full object-cover object-bottom ${data.desktopFocus ?? DESKTOP_FOCUS} transition-opacity duration-300 ${
                isVideoReady ? "opacity-100" : "opacity-0"
              }`}
            >
              <source
                src={data.mobileVideo}
                media={MOBILE_QUERY}
                type="video/mp4"
              />
              <source src={data.desktopVideo} type="video/mp4" />
            </video>
          )}
        </div>
      </div>
      {/* Withdrawn when the clip cannot be played — a broken source, or a fetch
          that never arrived. A control that promises a state it cannot reach is
          worse than no control; the still image carries the card on its own.
          The hook puts it back if the data turns up after all. */}
      {data.desktopVideo && !isVideoUnavailable && (
        // duration-[1283ms] matches the toggle clip's one-way length (2.566667s / 2,
        // confirmed with ffprobe across all four renders) so the button fades in step
        // with the video instead of finishing early or lagging behind it.
        <button
          type="button"
          onClick={onVideoToggle}
          disabled={isVideoAnimating}
          aria-label={
            isVideoLoading
              ? "Zonnebankvideo laden"
              : isVideoActive
              ? "Toon zonnebank in het licht"
              : "Toon zonnebank in het donker"
          }
          aria-pressed={isVideoActive}
          // Op desktop hangt de knop op de naad tussen foto en het witte vlak,
          // 24px uit de rechterrand. Die naad ligt niet op de onderrand van de
          // media maar 12px erboven: het witte vlak schuift er met `lg:-mt-3`
          // overheen. `bottom` rekent vanaf de onderrand omhoog, dus met een knop
          // van 48 hoog geldt bottom = overlap - 24: `-12px` zet zijn hart precies
          // op die naad. Op hover wordt de overlap 20px (`lg:group-hover/card:-mt-5`)
          // en schuift de naad 8px omhoog; `bottom: -4px` volgt dat, met dezelfde
          // 300ms ease-out zodat knop en vlak samen bewegen.
          //
          // `lg:z-20` en niet de kale `z-10`: het witte vlak draagt zelf z-10 en
          // staat later in de DOM, dus bij gelijke z wint dat vlak en verdwijnt
          // de onderste helft van de knop eronder.
          className={`group/toggle absolute top-3 right-3 md:top-5 md:right-5 lg:top-auto lg:-bottom-3 lg:right-6 lg:z-20 lg:transition-[bottom] lg:duration-300 lg:ease-out lg:group-hover/card:-bottom-1 z-10 flex size-12 touch-manipulation items-center justify-center rounded-full active:scale-95 ${
            isVideoAnimating ? "cursor-default" : "cursor-pointer"
          }`}
        >
          {/* Circle only — the icons below sit outside it, as siblings, so
              they never inherit its hover scale. The scale grow gets its own
              fast timing on this span; background keeps the 1283ms
              tied to the video crossfade below.

              `inset-1` rather than `inset-0`: the drawn circle is 40px inside a
              button that stays 48, so the mark is smaller without touching the
              tap area — which has to clear 44 (see TAP_TARGET).

              The icons went 22 → 20 with it. Their stroke is authored at 1.25
              in the SVG and rides along with the box, so it now draws at about
              1.14px. Left alone on purpose: raising the number in the file to
              hold the old weight would change what the marks are drawn with
              everywhere they are used. */}
          <span
            aria-hidden="true"
            className={`absolute inset-1 rounded-full scale-100 group-hover/toggle:scale-110 ${
              // Wit op elke breedte, idle en hover. Vanaf lg stond hier de
              // off-white van de pagina, zodat de mark bij het kader hoorde in
              // plaats van als lichte stip op de foto te liggen. Dat kan niet
              // meer: de knop hangt nu op de naad en bedekt met zijn onderste
              // helft het witte vlak, waar een off-white als vlek zichtbaar zou
              // worden. Wit leest over foto en vlak als dezelfde mark.
              isVideoActive && !isVideoLoading ? "bg-void" : "bg-white"
            }`}
            style={{
              // Tailwind v4's scale-* utilities set the standalone CSS `scale`
              // property, not `transform` — listing `transform` here left the
              // hover grow untransitioned (it jumped straight to 110%).
              transitionProperty: "background-color, scale",
              transitionDuration: "1283ms, 300ms",
              transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1), ease-out",
            }}
          />
          <span
            className={`absolute size-5 rounded-full border-2 border-black/20 border-t-black transition-opacity duration-150 ${
              isVideoLoading ? "animate-spin opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />
          <span
            className={`absolute flex items-center justify-center transition-[opacity,transform] duration-[1283ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVideoActive || isVideoLoading
                ? "scale-75 rotate-45 opacity-0"
                : "scale-100 rotate-0 opacity-100"
            }`}
            aria-hidden="true"
          >
            <Image src={sunIcon} alt="" width={20} height={20} />
          </span>
          <span
            className={`absolute flex items-center justify-center transition-[opacity,transform] duration-[1283ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVideoActive && !isVideoLoading
                ? "scale-100 rotate-0 opacity-100"
                : "scale-75 -rotate-45 opacity-0"
            }`}
            aria-hidden="true"
          >
            <Image src={sunsetIcon} alt="" width={20} height={16} />
          </span>
        </button>
      )}
    </div>
  );
}
