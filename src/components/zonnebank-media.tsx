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

/**
 * Witbalans van de bankmedia. De clips en de stills zijn onder hetzelfde warme
 * kunstlicht opgenomen: gemeten over de lichte frames zit blauw rond 75% van
 * rood en 85% van groen (neutraal = 100%), en dat leest als een gele waas over
 * de hele kaart.
 *
 * Dit was een `feColorMatrix`, en dat is op papier het juiste gereedschap: het
 * schaalt per kanaal, precies wat een witbalansknop doet. Op iOS werkt het
 * alleen niet. Zodra de kaart wordt aangeraakt laadt hij zijn clip en legt hij
 * die over de foto (zie `handleCardPointerEnter` in use-zonnebank-video), en
 * WebKit geeft een spelende video een eigen systeemlaag. Een CSS-filter — op de
 * video zelf of op een vlak eromheen — bereikt die laag niet, dus sprong het
 * beeld op de telefoon terug naar geel op het moment dat de video verscheen.
 * Nagemeten op een iPhone met vier varianten naast elkaar: filter op de video
 * en filter op de ouder vielen allebei weg, een laag erbovenop bleef staan.
 *
 * Vandaar een echte laag in de pagina in plaats van een filter: een heel donker
 * blauw vlak met `mix-blend-mode: color-dodge`. Dodge rekent uit als
 * `onder / (1 - laag)`, dus het schaalt blauw met een vaste factor en laat rood
 * en groen ongemoeid — precies wat de matrix deed. Screen (`1 - (1 - onder)(1 -
 * laag)`) was de eerste keus maar tilt donkere delen veel harder op dan lichte,
 * en dat zou de rode gloed van de 770 in zijn donkere fase naar paars trekken.
 * Wat wegvalt tegenover de matrix is de 1,6% waarmee rood werd teruggenomen;
 * een laag kan alleen optellen.
 *
 * `MEDIA_WARMTH_CORRECTION` is de knop: 0 laat de media zoals ze gerenderd zijn,
 * 1 is de volle correctie. Een bank die anders belicht is zet zijn eigen waarde
 * met `mediaWarmth` in de data.
 *
 * Hoe ver je kunt gaan heeft een bovengrens die niet in de belichting zit: de
 * wand en de vloer zijn ook echt beige geverfd, terwijl het kunststof van de
 * bank al neutraal wit is (gemeten B/R exact 1,00). Corrigeer je het beeld ver
 * genoeg om de wand neutraal te krijgen, dan is de bank zelf allang blauw.
 */
const MEDIA_WARMTH_CORRECTION = 0.6;

// Blauwwaarde van de laag bij factor 1, als fractie van 255. Ingemeten tegen de
// oude matrix op de gerenderde pagina: bij 0,6 komt B/R uit op 0,937, hetzelfde
// als `B x 1,072` opleverde. Dat is 22/255 bij die sterkte, dus 14,4% vol.
const WARMTH_BLUE_AT_FULL = 0.144;

const warmthOverlay = (factor: number) =>
  `rgb(0 0 ${Math.round(255 * WARMTH_BLUE_AT_FULL * factor)})`;

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
    // `w-full` staat er niet voor de sier. Deze box heeft een aspect-ratio én
    // een min-height die hoger is dan die ratio bij deze breedte toelaat. Chrome
    // houdt de breedte dan op de kolom en rekt alleen de hoogte op; WebKit
    // rekent de breedte terug uit de ratio en maakt de box breder dan zijn
    // kolom — in Safari stak de foto daardoor 32px (de padding van de kaart)
    // buiten het witte vlak eronder. Een expliciete breedte laat niets te
    // herleiden over. Nagemeten in Safari met een losse testpagina: zonder
    // `w-full` 32px verschil, met `w-full` nul.
    // `WebkitTouchCallout` inline en niet in globals.css: die build gooit
    // eigenschappen die hij niet kent er stilzwijgend uit, en dit is er zo een.
    //
    // Waarom hij er staat: een lange druk op de foto zet iOS Safari aan het
    // werk voor zijn eigen callout — bewaar-menu en sleepvoorbeeld. Daarvoor
    // hertekent WebKit de laag vanaf het bronbeeld, en de filter hierboven gaat
    // dan verloren; de correctie viel zichtbaar weg. Zonder callout gebeurt dat
    // niet. Wat de bezoeker kwijtraakt is "afbeelding bewaren" op een foto die
    // sowieso als knop werkt — de kaart opent een boeking.
    <div
      className="group relative isolate w-full select-none aspect-[1.52/1] md:aspect-video md:min-h-[280px] lg:min-h-[248px] xl:min-h-[328px] rounded-[12px] lg:rounded-[8px] lg:rounded-bl-none lg:rounded-br-none overflow-hidden"
      style={{
        WebkitTouchCallout: "none",
        // Zelfde oorzaak als de kleurcorrectie hierboven: WebKit geeft een video
        // een eigen systeemlaag, en die trekt zich niets aan van de afgeronde
        // `overflow: hidden` van deze box — zodra de clip zichtbaar werd sprongen
        // de hoeken op de telefoon vierkant. Een masker dwingt de clip alsnog af,
        // ook op die laag. De radial-gradient is dekkend over het hele vlak; het
        // gaat niet om zijn vorm maar om het bestaan van het masker.
        WebkitMaskImage: "-webkit-radial-gradient(white, black)",
      }}
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
          // Zelfde reden als de callout hierboven: een sleepvoorbeeld laat
          // WebKit het bronbeeld apart tekenen, buiten de filter om.
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
      {/* De correctielaag. Boven foto en video, onder de toggle (die zit op
          z-10). `pointer-events-none` zodat hij geen aanraking opvangt. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] mix-blend-color-dodge"
        style={{ backgroundColor: warmthOverlay(data.mediaWarmth ?? MEDIA_WARMTH_CORRECTION) }}
      />
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
          className={`group/toggle absolute top-3 right-3 md:top-5 md:right-5 lg:top-3 lg:right-3 z-10 flex size-12 touch-manipulation items-center justify-center rounded-full active:scale-95 ${
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
              // Idle is the page's own off-white from lg up, so the mark reads
              // as part of the frame instead of a bright dot on the photo. The
              // phone keeps plain white: there the button sits on a much
              // smaller image and needs the contrast to stay findable.
              isVideoActive && !isVideoLoading ? "bg-void" : "bg-white lg:bg-surface-pill"
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
