"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue } from "framer-motion";
import { animateScrollTo, prefersAnimatedScroll, scrollBehavior } from "@/lib/animate-scroll";
import { FloatingField } from "@/components/ui/floating-field";
import { useHoverBlob } from "@/components/ui/hover-blob";
import { useContactForm } from "@/hooks/use-contact-form";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { CONTACT_FIELD_IDS, CONTACT_LIMITS } from "@/lib/contact-validation";
import { BTN_CTA_HEIGHT, BTN_FILL_LABEL, BTN_PILL_BRAND } from "@/lib/button-styles";
import { groupOpeningHours } from "@/lib/opening-hours";
import {
  ADDRESS,
  EMAIL,
  MAPS_URL,
  PHONE_DISPLAY,
  PHONE_E164,
} from "@/lib/site";
import { stackedSheetHeight, STACK_SPRING } from "@/components/hero/sheet-stack";

const OpeningstijdenOverlay = dynamic(() => import("@/components/hero/openingstijden-overlay"));
const PlanJeMomentSheet = dynamic(() => import("@/components/hero/plan-je-moment-sheet"));

function DetailBlock({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  /** Grid placement from the consumer, e.g. spanning both columns. */
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-sans text-[15px] font-medium leading-[24px] tracking-[-0.01em] text-ink-primary">{label}</p>
      <div className="mt-0.5 font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-ink-primary">
        {children}
      </div>
    </div>
  );
}

const DETAIL_LINK =
  "text-zinc-600 underline decoration-zinc-400 decoration-1 underline-offset-6 hover:text-zinc-900 hover:decoration-ink-strong transition-colors duration-150";

function ContactDetails() {
  // Two columns at every width. Stacked, the four blocks run well past the
  // bottom of the form and leave a lopsided hole in the desktop layout; on
  // mobile they turn the tail of the page into a long ribbon of single lines.
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:gap-x-8">
      {/* Full width until sm: at 15px the address measures ~160px, which does
          not fit a half column on a 375px phone and would break mid-address. */}
      <DetailBlock label="E-mail" className="col-span-2 sm:col-span-1">
        <a href={`mailto:${EMAIL}`} className={DETAIL_LINK}>
          {EMAIL}
        </a>
      </DetailBlock>

      <DetailBlock label="Telefoon">
        <a href={`tel:${PHONE_E164}`} className={DETAIL_LINK}>
          {PHONE_DISPLAY}
        </a>
      </DetailBlock>

      <DetailBlock label="Adres">
        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={DETAIL_LINK}>
          {ADDRESS.street}
          <br />
          {ADDRESS.postalCode} {ADDRESS.city}
        </a>
      </DetailBlock>

      {/* Where the social links used to sit. Those are still one tap away in
          the slide-in menu, and the hours earn the slot: they were the one
          thing a visitor came to this block for that it did not say. Full
          width until sm, where the label and the range no longer fit beside
          each other in half a column on a phone. */}
      <DetailBlock label="Openingstijden" className="col-span-2 sm:col-span-1">
        {/* On a phone this block spans both columns, so it borrows the grid it
            sits in: same two halves, same gap, and the times land under the
            address instead of at their own arbitrary offset. From sm it is back
            in a half column of its own, where the label sets the width. */}
        <dl className="grid grid-cols-2 gap-x-5 gap-y-0.5 sm:grid-cols-[auto_1fr] sm:gap-x-4">
          {groupOpeningHours().map((groep) => (
            <div key={groep.label} className="contents">
              <dt className="text-zinc-600">{groep.label}</dt>
              <dd className="text-ink-primary">{groep.hours}</dd>
            </div>
          ))}
        </dl>
      </DetailBlock>
    </div>
  );
}

/** The section CTA pill, same size and type scale as the one under producten. */
function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const blob = useHoverBlob({ disabled: isSubmitting });

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      {...blob.hoverProps}
      // Width is content-driven from sm up. The label keeps a floor of its own
      // so swapping to the shorter submitting state does not resize the pill.
      className={`${BTN_PILL_BRAND} ${BTN_CTA_HEIGHT} relative w-full justify-center py-3 !px-[28px] disabled:cursor-not-allowed disabled:active:scale-100 sm:w-auto md:py-[10px]`}
    >
      {/* 114px is this label's own resting width, so the pill keeps its size
          when the text swaps to the shorter "Versturen…" (108px including the
          spinner). Re-measure it if the label changes. */}
      {blob.blob}
      <span className={`${BTN_FILL_LABEL} flex min-w-[114px] items-center justify-center gap-2.5 group-hover/cta:text-surface-page`}>
        {/* The ring is drawn in the label's own colour, so it flips with it:
            on yellow it is ink, and cream once the dark fill has arrived. */}
        {isSubmitting && (
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-current/40 border-t-current"
          />
        )}
        {isSubmitting ? "Versturen…" : "Verstuur bericht"}
      </span>
    </button>
  );
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    // The form is far taller than this panel, so swapping one for the other
    // collapses the page underneath the visitor's scroll position and leaves
    // the confirmation above the fold — on mobile you land on its last line
    // with the heading out of sight. Measured in a rAF because the page height
    // is still settling on the frame this effect runs in.
    const frame = requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      const offset = parseFloat(getComputedStyle(panel).scrollMarginTop) || 0;
      const alreadyInView = rect.top >= offset && rect.bottom <= window.innerHeight;

      if (!alreadyInView) {
        if (prefersAnimatedScroll()) {
          // Touch: the eased rAF scroll, same as the nav uses. Native smooth is
          // abrupt here. scroll-margin has to be applied by hand on this path.
          animateScrollTo(window.scrollY + rect.top - offset);
        } else {
          panel.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
        }
      }

      // Land keyboard and screen-reader users on the confirmation as well.
      // preventScroll because the scroll above already did the positioning.
      panel.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={panelRef}
      role="status"
      tabIndex={-1}
      // Focused programmatically, so suppress the ring (see globals.css).
      data-quiet-focus
      className="flex h-full min-h-[360px] scroll-mt-20 flex-col items-start justify-center rounded-[16px] bg-surface-page px-7 py-12 sm:px-10 lg:scroll-mt-10"
    >
      {/* Drawn rather than the "✓" glyph: a text character sits off-centre in
          its own box and its weight follows the font, which shows up as a
          lopsided, spindly tick inside a circle this size. */}
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-surface-page"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5 10 17.5 19 6.5" />
        </svg>
      </span>
      <h3 className="mt-5 font-display text-[24px] font-medium leading-none tracking-[-0.015em] text-ink-strong">
        Bericht verstuurd
      </h3>
      <p className="mt-2.5 max-w-[380px] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-muted">
        Dank je wel. We lezen het zo snel mogelijk en reageren meestal binnen één werkdag. Haast?
        Bel gerust even op{" "}
        <a href={`tel:${PHONE_E164}`} className={`${DETAIL_LINK} whitespace-nowrap sm:whitespace-normal text-ink-strong`}>
          {PHONE_DISPLAY}
        </a>
        .
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 cursor-pointer font-sans text-[15px] text-ink-strong underline decoration-zinc-400 decoration-1 underline-offset-6 transition-colors duration-150 hover:decoration-ink-strong"
      >
        Nog een bericht sturen
      </button>
    </div>
  );
}

function ContactForm() {
  const { values, errors, status, formError, honeypot, setHoneypot, setField, blurField, submit, reset } =
    useContactForm();

  if (status === "success") return <SuccessPanel onReset={reset} />;

  const isSubmitting = status === "submitting";

  const handleIdentityAutofill = (source: HTMLInputElement) => {
    // Autofill can apply to both identity fields in one browser action. Wait a
    // frame so both DOM values have landed, then advance only if the visitor is
    // still in that flow. This guard prevents a page-load autofill from pulling
    // someone down to the form or stealing focus from another control.
    window.requestAnimationFrame(() => {
      const name = document.getElementById(CONTACT_FIELD_IDS.name) as HTMLInputElement | null;
      const email = document.getElementById(CONTACT_FIELD_IDS.email) as HTMLInputElement | null;
      const message = document.getElementById(
        CONTACT_FIELD_IDS.message,
      ) as HTMLTextAreaElement | null;
      const active = document.activeElement;

      if (!name || !email || !message) return;
      if (!source.matches(":autofill")) return;
      if (active !== name && active !== email) return;
      if (!name.value.trim() || !email.value.trim() || message.value !== "") return;

      message.focus();
    });
  };

  return (
    <form
      noValidate
      suppressHydrationWarning
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="w-full"
    >
      {/* gap-y is the whole resting rhythm now that the error slots collapse to
          nothing, where it used to be a 4px seam on top of 30px of reserved
          space. From sm the fields sit two across, so gap-y matches gap-x and
          the grid reads as one even mesh rather than rows and columns pulling
          against each other. */}
      <fieldset disabled={isSubmitting} className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2 sm:gap-y-5">
        <FloatingField
          id={CONTACT_FIELD_IDS.name}
          name="name"
          label="Je naam"
          value={values.name}
          onChange={(value) => setField("name", value)}
          onBlur={() => blurField("name")}
          onAutofill={handleIdentityAutofill}
          error={errors.name}
          autoComplete="name"
          maxLength={CONTACT_LIMITS.nameMax}
          required
        />

        <FloatingField
          id={CONTACT_FIELD_IDS.email}
          name="email"
          label="E-mailadres"
          type="email"
          value={values.email}
          onChange={(value) => setField("email", value)}
          onBlur={() => blurField("email")}
          onAutofill={handleIdentityAutofill}
          error={errors.email}
          autoComplete="email"
          maxLength={CONTACT_LIMITS.emailMax}
          required
        />

        <FloatingField
          id={CONTACT_FIELD_IDS.message}
          name="message"
          label="Waar kunnen we je mee helpen?"
          value={values.message}
          onChange={(value) => setField("message", value)}
          onBlur={() => blurField("message")}
          error={errors.message}
          maxLength={CONTACT_LIMITS.messageMax}
          multiline
          required
          className="sm:col-span-2"
        />

        {/* Honeypot: hidden from sight, from keyboard and from screen readers,
            so only a form-filling bot ever puts anything in it. Clipped in place
            rather than pushed to left:-9999px — a negative offset that large
            puts a very wide box in the layout, and browsers disagree about
            whether that counts as overflow. */}
        <div
          aria-hidden
          className="absolute h-px w-px overflow-hidden whitespace-nowrap"
          style={{ clipPath: "inset(50%)" }}
        >
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            suppressHydrationWarning
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>
      </fieldset>

      <div className="mt-4 sm:mt-5">
        <SubmitButton isSubmitting={isSubmitting} />
      </div>

      {formError && (
        <p role="alert" className="mt-3 font-sans text-[15px] leading-[24px] text-danger">
          {formError}
        </p>
      )}

      <p className="mt-3 font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
        We gebruiken je gegevens alleen om je bericht te beantwoorden.
      </p>
    </form>
  );
}

export default function Contact() {
  const [isOpeningstijdenOpen, setIsOpeningstijdenOpen] = useState(false);
  const [isPlanJeMomentOpen, setIsPlanJeMomentOpen] = useState(false);

  // Same stacking as the hero: "Plan je moment" opens over the openingstijden
  // sheet instead of the WhatsApp fallback, and closing it returns you there.
  const openingstijdenPanelRef = useRef<HTMLDivElement>(null);
  const [stackedMinHeight, setStackedMinHeight] = useState<number | undefined>();
  const openPlanJeMomentStacked = () => {
    setStackedMinHeight(stackedSheetHeight(openingstijdenPanelRef.current));
    setIsPlanJeMomentOpen(true);
  };

  const shouldReduceMotion = useReducedMotion();
  const stackDepth = useMotionValue(0);
  useEffect(() => {
    const sunk = isPlanJeMomentOpen ? 1 : 0;
    if (shouldReduceMotion) {
      stackDepth.set(sunk);
      return;
    }
    const controls = animate(stackDepth, sunk, STACK_SPRING);
    return () => controls.stop();
  }, [isPlanJeMomentOpen, stackDepth, shouldReduceMotion]);

  return (
    <section className="relative w-full bg-white py-16 xl:py-24">
      <div
        className="relative z-10 flex w-full flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div
          id="contact"
          className="mx-auto w-full max-w-[1280px] scroll-mt-20 lg:scroll-mt-10"
        >
          {/* Mobile stacks in DOM order: heading, form, details — the form is
              what the visitor came for, so it sits above the address block
              instead of below it. From lg up the three blocks are placed
              explicitly into two columns, restoring the side-by-side layout. */}
          {/* lg:gap-y follows the form's tightened rhythm, but stays a step
              above the 28px the details block uses between its own rows —
              undercut that and "E-mail" reads as a fourth line of the intro
              paragraph instead of the start of a new block.
              grid-rows-[auto_1fr] is what makes that number the number you see.
              The form spans both rows and is the taller column, so with two
              content-sized rows the surplus height splits between them and half
              of it lands under the intro paragraph, on top of the gap. Pinning
              row 1 to its content sends all of the slack to row 2, where
              items-start parks the details block at the top and the leftover
              falls harmlessly below it. */}
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-10 lg:gap-y-8 xl:gap-x-20">
            {/* Heading */}
            <div className="lg:col-start-1 lg:row-start-1">
              <h2 className="font-display text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] text-ink-strong xl:tracking-[-0.015em]">
                Even contact?
              </h2>
              {/* Second line of the heading, not a subsection — see producten. */}
              <p className="mt-1 font-display text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] text-zinc-500 xl:tracking-[-0.015em]">
                We horen graag van je
              </p>

              <p className="mt-3 max-w-[411px] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
                Vraag over een bank of een product? Stuur een bericht, of loop langs tijdens
                onze{" "}
                <button
                  type="button"
                  onClick={() => setIsOpeningstijdenOpen(true)}
                  className={`${DETAIL_LINK} inline cursor-pointer text-zinc-600`}
                >
                  openingstijden.
                </button>
              </p>

            </div>

            {/* Form — right column on desktop, spanning both rows */}
            <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:pt-2">
              <ContactForm />
            </div>

            {/* Contact details */}
            <div className="lg:col-start-1 lg:row-start-2">
              <ContactDetails />
            </div>
          </div>
        </div>
      </div>

      <OpeningstijdenOverlay
        isOpen={isOpeningstijdenOpen}
        onClose={() => setIsOpeningstijdenOpen(false)}
        onPlanJeMoment={openPlanJeMomentStacked}
        isBehind={isPlanJeMomentOpen}
        panelRef={openingstijdenPanelRef}
        stackDepth={stackDepth}
      />
      <PlanJeMomentSheet
        isOpen={isPlanJeMomentOpen}
        onClose={() => setIsPlanJeMomentOpen(false)}
        stackedMinHeight={isOpeningstijdenOpen ? stackedMinHeight : undefined}
        stackDepth={isOpeningstijdenOpen && !shouldReduceMotion ? stackDepth : undefined}
      />
    </section>
  );
}
