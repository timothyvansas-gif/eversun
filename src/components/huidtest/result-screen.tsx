"use client";

import Image from "next/image";
import { useState } from "react";
import { ZONNEBANKEN } from "@/data/zonnebanken-data";
import { trackEvent } from "@/lib/analytics";
import { CtaButton, CtaLink } from "@/components/huidtest/cta";
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

  const bank = ZONNEBANKEN.find((z) => z.slug === BANK_SLUGS[advies.bank])!;
  const product = findProduct(advies.product);
  const waarom = buildWhy(answers, advies.bank);

  const toggleSachet = (aan: boolean) => {
    setSachet(aan);
    trackEvent("huidtest_sachet", { product: product.slug, aan });
  };

  return (
    <div>
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
      <p className="mt-4 max-w-[58ch] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-ink">
        {waarom}
      </p>

      {/* Bank card. Fixed aspect ratio so the advice does not jump when the
          photo lands — this screen is the payoff, and a reflow here reads as
          the answer changing its mind. */}
      <div className="mt-6 overflow-hidden rounded-[12px] border border-line bg-white">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
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

        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-6">
          <h3 className="font-display text-[22px] font-medium leading-tight tracking-[-0.01em] text-ink-strong">
            {bank.title}
          </h3>
          <div className="flex items-center gap-3 font-sans tracking-[-0.01em]">
            <span className="text-[14px] text-muted">{bank.minuten}</span>
            <span className="text-[15px] font-semibold text-ink-strong">{bank.prijs}</span>
          </div>
          {advies.stand && (
            <p className="w-full font-sans text-[15px] tracking-[-0.01em] text-ink">
              {RESULTAAT.standregel(advies.stand)}
            </p>
          )}
        </div>
      </div>

      {/* Kassakoopje. Smaller type, a tinted panel instead of a card, and no
          photo bigger than a thumbnail: everything here says "and one of
          these?" rather than "here is your second advice". */}
      <section
        aria-labelledby="huidtest-kassakoopje"
        className="mt-8 rounded-[12px] border border-line/70 bg-white/60 p-4 sm:p-5"
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
            <p className="mt-1 font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-ink">
              {PRODUCT_WAAROM[product.slug]}
            </p>
          </div>
        </div>

        {advies.tattooTip && (
          <p className="mt-3 font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-muted">
            {RESULTAAT.tattooTip}
          </p>
        )}

        {product.sachetPrice && (
          <>
            <label className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-3 font-sans text-[15px] tracking-[-0.01em] text-ink-strong">
              <input
                type="checkbox"
                checked={sachet}
                onChange={(event) => toggleSachet(event.target.checked)}
                className="size-5 shrink-0 cursor-pointer accent-[var(--color-accent)]"
              />
              {RESULTAAT.sachetToggle(product.sachetPrice)}
            </label>

            <p className="mt-2 font-sans text-[13px] leading-[20px] tracking-[-0.01em] text-muted">
              {RESULTAAT.sachetMicrocopy}
            </p>
          </>
        )}

        {/* No toggle: Barefoot Beachwood has no sachet, only a bottle. A switch
            that quietly added a €24,99 item to the message would not be a
            kassakoopje. */}
        <p className="mt-4 border-t border-line/60 pt-3 font-sans text-[13px] leading-[20px] tracking-[-0.01em] text-muted">
          {RESULTAAT.barefoot}
        </p>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <CtaLink
          href={buildWhatsappUrl(advies, sachet)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("huidtest_cta", { type: "whatsapp", sachet })}
        >
          {RESULTAAT.ctaPrimair}
        </CtaLink>

        <CtaButton
          variant="outline"
          onClick={() => {
            trackEvent("huidtest_cta", { type: "opnieuw", sachet });
            onRestart();
          }}
        >
          {RESULTAAT.ctaSecundair}
        </CtaButton>
      </div>

      <p className="mt-8 max-w-[62ch] font-sans text-[13px] leading-[20px] tracking-[-0.01em] text-muted">
        {RESULTAAT.disclaimer}
      </p>
    </div>
  );
}
