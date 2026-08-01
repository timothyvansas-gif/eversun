"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { animateScrollTo, prefersAnimatedScroll } from "@/lib/animate-scroll";
import { BLOB_SIZE } from "@/components/hero/button-constants";
import facebookIcon from "@/images/socials/social-facebook.svg";
import instagramIcon from "@/images/socials/social-instagram.svg";
import { FloatingField } from "@/components/ui/floating-field";
import { useContactForm } from "@/hooks/use-contact-form";
import { CONTACT_FIELD_IDS, CONTACT_LIMITS } from "@/lib/contact-validation";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Ever+Sun+Assen&query_place_id=ChIJAe9RzRwlyEcR1wglglnLp4w";

const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/eversun.assen/", icon: facebookIcon },
  { label: "Instagram", href: "https://www.instagram.com/ever_sun_assen/", icon: instagramIcon },
];

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
      <p className="font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-muted">{label}</p>
      <div className="mt-0.5 font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-ink-strong">
        {children}
      </div>
    </div>
  );
}

const DETAIL_LINK =
  "underline decoration-line decoration-1 underline-offset-4 hover:decoration-ink-strong transition-colors duration-150";

function ContactDetails() {
  // Two columns at every width. Stacked, the four blocks run well past the
  // bottom of the form and leave a lopsided hole in the desktop layout; on
  // mobile they turn the tail of the page into a long ribbon of single lines.
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:gap-x-8">
      {/* Full width until sm: at 15px the address measures ~160px, which does
          not fit a half column on a 375px phone and would break mid-address. */}
      <DetailBlock label="E-mail" className="col-span-2 sm:col-span-1">
        <a href="mailto:info@eversun-assen.nl" className={DETAIL_LINK}>
          info@eversun-assen.nl
        </a>
      </DetailBlock>

      <DetailBlock label="Telefoon">
        <a href="tel:+31625306491" className={DETAIL_LINK}>
          06 25 30 64 91
        </a>
      </DetailBlock>

      <DetailBlock label="Adres">
        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={DETAIL_LINK}>
          Kloekhorststraat 4a
          <br />
          9401 BD Assen
        </a>
      </DetailBlock>

      {/* Hidden on mobile: the slide-in menu already carries the social links
          there, and dropping this block also clears the lone item that was
          left dangling on the last grid row. */}
      <div className="hidden sm:block">
        <p className="font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-muted">Volg ons</p>
        <div className="mt-2 flex items-center gap-2">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-strong transition-colors duration-200 hover:bg-[#f35b04]"
            >
              <Image
                src={social.icon}
                alt=""
                width={18}
                height={18}
                className="h-[18px] w-[18px] brightness-0 invert"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Same pill as the hero CTA — sizing, type scale and blob hover all mirror it. */
function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      onMouseEnter={(event) => {
        if (!window.matchMedia("(hover: hover)").matches) return;
        const rect = event.currentTarget.getBoundingClientRect();
        setOrigin({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className="relative flex w-[172px] min-h-[48px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-[#f35b04] px-0 font-sans text-[14px] font-medium text-surface-page transition-transform duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#C9906F] disabled:active:scale-100 sm:w-[200px] sm:min-h-[56px] sm:px-2 md:text-[16px] lg:min-h-[48px]"
    >
      <m.span
        aria-hidden
        className="pointer-events-none absolute rounded-full bg-[#111]"
        style={{
          width: BLOB_SIZE,
          height: BLOB_SIZE,
          left: origin.x - BLOB_SIZE / 2,
          top: origin.y - BLOB_SIZE / 2,
        }}
        initial={false}
        animate={{ scale: hovered && !isSubmitting ? 1 : 0, opacity: hovered && !isSubmitting ? 1 : 0 }}
        transition={{ duration: 0.75, ease: [0.25, 1, 0.35, 1] }}
      />
      <span className="relative z-10 flex items-center gap-2.5">
        {isSubmitting && (
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-surface-page/40 border-t-surface-page"
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
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
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
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f35b04] text-surface-page"
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
        <a href="tel:+31625306491" className={`${DETAIL_LINK} text-ink-strong`}>
          06 25 30 64 91
        </a>
        .
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 cursor-pointer font-sans text-[15px] text-ink-strong underline decoration-line decoration-1 underline-offset-4 transition-colors duration-150 hover:decoration-ink-strong"
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

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="w-full"
    >
      <fieldset disabled={isSubmitting} className="grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2">
        <FloatingField
          id={CONTACT_FIELD_IDS.name}
          name="name"
          label="Je naam"
          value={values.name}
          onChange={(value) => setField("name", value)}
          onBlur={() => blurField("name")}
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
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>
      </fieldset>

      <div className="mt-3">
        <SubmitButton isSubmitting={isSubmitting} />
      </div>

      {formError && (
        <p role="alert" className="mt-3 font-sans text-[15px] leading-[24px] text-[#A6371A]">
          {formError}
        </p>
      )}

      <p className="mt-3 font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-muted">
        We gebruiken je gegevens alleen om je bericht te beantwoorden.
      </p>
    </form>
  );
}

export default function Contact() {
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
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-x-10 lg:gap-y-9 xl:gap-x-20 xl:gap-y-12">
            {/* Heading */}
            <div className="lg:col-start-1 lg:row-start-1">
              <h2 className="font-display text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] text-ink-strong xl:tracking-[-0.015em]">
                Even contact?
              </h2>
              <h3 className="mt-1 font-display text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] text-muted xl:tracking-[-0.015em]">
                we horen graag van je
              </h3>

              <p className="mt-5 max-w-[411px] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-muted">
                Vraag over een bank, een product, of gewoon benieuwd wat bij jouw huid past? Stuur
                een bericht, we denken graag met je mee.
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
    </section>
  );
}
