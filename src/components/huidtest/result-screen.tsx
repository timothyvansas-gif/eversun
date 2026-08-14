"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import { ZONNEBANKEN } from "@/data/zonnebanken-data";
import { trackEvent } from "@/lib/analytics";
import { CheckField } from "@/components/huidtest/check-field";
import { CtaButton } from "@/components/huidtest/cta";
import { BookingSheet } from "@/components/huidtest/booking-sheet";
import { useHuidtestSurface } from "@/components/huidtest/surface-context";
import { stackedSheetHeight, STACK_SPRING } from "@/components/hero/sheet-stack";
import { BOEKEN } from "@/lib/huidtest/config";

// The site's own booking sheet, which already carries the phone button and a
// review. On a phone it stacks on the test the way it stacks on the
// openingstijden sheet; the desktop panel gets the QR sheet instead, since a
// code is only useful on a screen you are not holding.
const PlanJeMomentSheet = dynamic(() => import("@/components/hero/plan-je-moment-sheet"));
import { StepCard } from "@/components/huidtest/step-card";
import { StickyActions } from "@/components/huidtest/sticky-actions";
import { PRODUCT_WAAROM, RESULTAAT } from "@/lib/huidtest/config";
import { buildWhatsappUrl, buildWhy, findProduct } from "@/lib/huidtest/decide";
import { BANK_SLUGS, type Advies, type QuizAnswers } from "@/lib/huidtest/types";

/**
 * The advice, and the one small thing to add to it.
 *
 * The hierarchy here is the whole design: the bank is the answer the visitor
 * came for and gets the photo, the price and the reasoning. The product is a
 * kassakoopje — a sachet by the till — so it sits in a smaller block, off by
 * default, one tap to add to the message. Giving it equal weight would turn an
 * advice into a sales page, which is exactly what it must not be.
 */
export default function ResultScreen({
  answers,
  advies,
  headingRef,
  onRestart,
}: {
  answers: QuizAnswers;
  advies: Advies;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}) {
  const [sachet, setSachet] = useState(false);
  const [boekenOpen, setBoekenOpen] = useState(false);
  const { element: surface, stackDepth } = useHuidtestSurface();

  const bank = ZONNEBANKEN.find((z) => z.slug === BANK_SLUGS[advies.bank])!;
  const product = findProduct(advies.product);
  const waarom = buildWhy(answers, advies.bank);

  const whatsappUrl = buildWhatsappUrl(advies, sachet);
  const isDesktop = useIsDesktop();

  // Drawn while the advice is being read, and redrawn the moment the sachet
  // toggle changes the message it carries, so the code is ready and current
  // before anyone asks for it. Only where it can be shown: a phone taps
  // through to WhatsApp and never sees a code.
  const qrSvg = useQrSvg(isDesktop ? whatsappUrl : null);

  // The test sinks while the booking sheet covers it, and comes back as it
  // leaves. Animated on the shared value rather than toggled, so a drag that
  // starts to dismiss the sheet in front hands the size back on the way.
  useEffect(() => {
    if (!stackDepth) return;
    const controls = animate(stackDepth, boekenOpen ? 1 : 0, STACK_SPRING);
    return () => controls.stop();
  }, [boekenOpen, stackDepth]);

  const toggleSachet = (aan: boolean) => {
    setSachet(aan);
    trackEvent("huidtest_sachet", { product: product.slug, aan });
  };

  return (
    <div className="flex flex-1 flex-col">
      <StepCard>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-ink-strong text-[clamp(26px,5.5vw,38px)] font-medium leading-tight tracking-[-0.01em] outline-none"
      >
        {RESULTAAT.kop}
      </h2>

      {/* The reasoning sits between the title and the card, where it reads as
          the sentence that introduces the advice. Under the card it was a
          footnote to a decision already made. */}
      <p className="mt-3 max-w-[58ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
        {waarom}
      </p>

      {/* Bank card. Fixed aspect ratio so the advice does not jump when the
          photo lands — this screen is the payoff, and a reflow here reads as
          the answer changing its mind. */}
      <div className="mt-6">
        {/* The radius belongs to the photo, not to the block that also holds
            the name and the price: on the wrapper it rounded the top corners
            and left the bottom two square where the text took over. */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px] sm:aspect-[16/9]">
          <Image
            src={bank.image}
            alt={bank.alt}
            fill
            quality={bank.imageQuality}
            className="object-cover object-bottom"
            sizes="(max-width: 767px) 100vw, 640px"
            priority
          />
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-4">
          <h3 className="font-display text-[22px] font-medium leading-tight tracking-[-0.01em] text-ink-strong">
            {bank.title}
          </h3>
          <div className="flex items-center gap-3 font-sans tracking-[-0.01em]">
            <span className="text-[14px] text-muted">{bank.minuten}</span>
            <span className="text-[15px] font-semibold text-ink-strong">{bank.prijs}</span>
          </div>
          {advies.stand && (
            <p className="w-full font-sans text-[15px] tracking-[-0.01em] text-zinc-600">
              {RESULTAAT.standregel(advies.stand)}
            </p>
          )}
        </div>
      </div>

      {/* Kassakoopje. Smaller type, a thumbnail rather than a photo, and a
          rule instead of a panel: everything here says "and one of these?"
          rather than "here is your second advice". The tint it used to sit on
          made it a second card, which is the one thing it must not be. */}
      <section
        aria-labelledby="huidtest-kassakoopje"
        className="mt-8 border-t border-line/50 pt-5"
      >
        <h3
          id="huidtest-kassakoopje"
          className="font-sans text-[13px] font-semibold uppercase tracking-[0.08em] text-muted"
        >
          {RESULTAAT.kassakoopjeKop}
        </h3>

        <div className="mt-3 flex items-start gap-4">
          <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[8px] bg-[#F4ECE0]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover object-center"
              sizes="72px"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h4 className="font-sans text-[16px] font-medium tracking-[-0.01em] text-ink-strong">
                {product.name}
              </h4>
              {product.sachetPrice && (
                <span className="font-sans text-[15px] font-semibold tracking-[-0.01em] text-ink-strong">
                  € {product.sachetPrice}
                </span>
              )}
            </div>
            {/* Two lines, whatever the product: this is a nudge at the till,
                and a paragraph here starts competing with the advice above it.
                Clamped rather than rewritten per product, so a longer line
                added later cannot quietly turn the block into a page. */}
            <p className="line-clamp-2 font-sans text-[14px] leading-[22px] tracking-[-0.01em] text-zinc-600">
              {PRODUCT_WAAROM[product.slug]}
            </p>
          </div>
        </div>


        {product.sachetPrice && (
          <div className="mt-4">
            <CheckField checked={sachet} onChange={toggleSachet}>
              {RESULTAAT.sachetToggle(product.sachetPrice)}
            </CheckField>
          </div>
        )}

      </section>

      <p className="mt-6 max-w-[62ch] font-sans text-[13px] leading-[20px] tracking-[-0.01em] text-zinc-600">
        {RESULTAAT.disclaimer}
      </p>

      <div className="mt-5">
        <CtaButton
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => {
            trackEvent("huidtest_cta", { type: "opnieuw", sachet });
            onRestart();
          }}
        >
          {RESULTAAT.ctaSecundair}
        </CtaButton>
      </div>

      </StepCard>

      <div className="flex-1 md:hidden" />

      {/* The one thing this screen is for, kept within reach: the result is
          the longest screen in the test, and on a phone the button that books
          it sat below a photo, a price, the reasoning and the sachet block.

          The sachet line rides along because this button is what sends the
          message: what is switched on above should still be visible at the
          moment of sending, not four hundred pixels up the page. */}
      <StickyActions className="mt-6 shrink-0 md:mt-4 md:pt-5 md:pb-5">
        <CtaButton
          className="w-full"
          onClick={() => {
            trackEvent("huidtest_cta", { type: "whatsapp", sachet });
            setBoekenOpen(true);
          }}
        >
          {RESULTAAT.ctaPrimair}
        </CtaButton>
      </StickyActions>

      {isDesktop ? (
        <BookingSheet
          isOpen={boekenOpen}
          onClose={() => setBoekenOpen(false)}
          whatsappUrl={whatsappUrl}
          qrSvg={qrSvg}
          bankTitle={bank.title}
        />
      ) : (
        <PlanJeMomentSheet
          isOpen={boekenOpen}
          onClose={() => setBoekenOpen(false)}
          whatsappUrl={whatsappUrl}
          title={BOEKEN.kop}
          description={BOEKEN.body}
          stackDepth={stackDepth ?? undefined}
          stackedMinHeight={stackedSheetHeight(surface)}
        />
      )}
    </div>
  );
}

/**
 * Which of the site's two booking surfaces this screen should reach for. The
 * same query the rest of the site splits on, read as state so the answer
 * survives a window that changes size mid-visit.
 */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsDesktop(!query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}

/**
 * The QR for a link, drawn in the browser and redrawn whenever the link
 * changes — which it does the moment the sachet toggle moves, because that
 * adds a line to the message the code carries.
 *
 * The generator is imported on demand rather than at module scope: it is
 * desktop-only, it is the heaviest thing this screen can reach for, and most
 * visitors never open the overlay that needs it. `null` means "not wanted yet",
 * and the overlay falls back to its own committed code until one arrives.
 */
function useQrSvg(url: string | null): string | undefined {
  const [svg, setSvg] = useState<string>();

  useEffect(() => {
    if (!url) return;

    let current = true;
    void import("@/lib/qr-svg").then(({ renderQrSvg }) => {
      if (current) setSvg(renderQrSvg(url));
    });

    return () => {
      current = false;
    };
  }, [url]);

  return url ? svg : undefined;
}
