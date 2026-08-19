"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { FAQ, type FaqItem } from "@/data/faq-data";
import { WHATSAPP_BOOKING_URL } from "@/lib/whatsapp";
import { PHONE_DISPLAY, PHONE_E164 } from "@/lib/site";

const DURATION = 360;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

const FAQ_LINK =
  "text-ink-strong underline decoration-zinc-400 decoration-1 underline-offset-6 hover:decoration-ink-strong transition-colors duration-150";

/**
 * The "moet ik reserveren" row, with WhatsApp and the phone number as live
 * links instead of plain words. Written out by hand rather than built by
 * splitting `item.antwoord` on those words: the string in `faq-data.ts` is
 * also what the JSON-LD and llms.txt read, so it has to stay plain text, and
 * matching against it here would silently drift the moment either copy
 * changes. Keep the two in sync by eye.
 */
function ReserverenAnswer() {
  return (
    <>
      Binnenlopen mag altijd tijdens onze openingstijden. Wil je zeker weten dat je bank vrij is,
      stuur dan even een{" "}
      <a href={WHATSAPP_BOOKING_URL} target="_blank" rel="noopener noreferrer" className={FAQ_LINK}>
        WhatsApp
      </a>{" "}
      of bel{" "}
      <a href={`tel:${PHONE_E164}`} className={FAQ_LINK}>
        {PHONE_DISPLAY}
      </a>
      , dan staat hij voor je klaar en sta je niet te wachten.
    </>
  );
}

const answerFor = (item: FaqItem): ReactNode =>
  item.id === "reserveren" ? <ReserverenAnswer /> : item.antwoord;

/**
 * One row, animated by hand with the Web Animations API rather than the
 * `::details-content`/`interpolate-size` CSS pair this used to lean on.
 *
 * That pair only exists in Chromium. Everywhere else — Safari included, so
 * every iPhone — it silently no-ops and the row snaps open, which is why
 * tuning its duration and easing changed nothing on a phone. Chromium itself
 * turned out to have its own bug: closing the row let its bottom padding
 * collapse before the height caught up, so the answer visibly hopped down
 * before it shrank.
 *
 * Tweening the answer's own wrapper from zero to its measured height with
 * `element.animate` sidesteps both, and runs the same way in every evergreen
 * browser (Safari back to 13.1).
 */
function FaqRow({ item, defaultOpen }: { item: FaqItem; defaultOpen: boolean }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const isClosingRef = useRef(false);

  const runAnimation = (content: HTMLElement, from: number, to: number, opening: boolean) => {
    animationRef.current?.cancel();
    animationRef.current = content.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration: DURATION, easing: EASING },
    );
    animationRef.current.onfinish = () => {
      animationRef.current = null;
      isClosingRef.current = false;
      content.style.height = "";
      if (!opening) detailsRef.current!.open = false;
    };
  };

  const onToggle = (event: MouseEvent) => {
    const details = detailsRef.current;
    const content = contentRef.current;
    if (!details || !content) return;

    // A reduced-motion visitor gets the plain, instant native toggle: not
    // intercepted at all, so there is nothing here for that preference to
    // fight.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    event.preventDefault();

    // Mid-animation this is the live, currently-tweening height rather than
    // either endpoint, which is what lets a second click reverse direction
    // instead of jumping.
    const current = details.open ? content.offsetHeight : 0;

    if (details.open && !isClosingRef.current) {
      isClosingRef.current = true;
      content.style.height = `${current}px`;
      runAnimation(content, current, 0, false);
      return;
    }

    isClosingRef.current = false;
    details.open = true;
    content.style.height = `${current}px`;
    // The frame after `open` lands is the first one where the browser has
    // laid the answer back out, so this is the first point its full height
    // can be read.
    requestAnimationFrame(() => runAnimation(content, current, content.scrollHeight, true));
  };

  return (
    <details
      ref={detailsRef}
      open={defaultOpen}
      className="faq-row group border-b border-line/30 pb-2.5 last:border-b-0"
    >
      {/* One padding in both states. It used to tighten to `pb-1.5` while
          open, to close the gap between a question and its own answer — but
          that swap fires the instant `open` flips, a step the height tween
          underneath knows nothing about. The row jumped to its open spacing
          first and only then began to grow, which read as the divider
          bouncing. The answer's own wrapper carries that spacing instead, so
          the seam stays put through the whole animation. */}
      <summary
        onClick={onToggle}
        className="flex cursor-pointer list-none items-start justify-between gap-6 pt-4 pb-1.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-details-marker]:hidden"
      >
        <h3 className="font-sans text-[16px] font-medium leading-[24px] tracking-[-0.01em] text-ink-strong transition-colors duration-150 group-hover:text-accent">
          {item.vraag}
        </h3>
        {/* Drawn, not a "+" glyph: a text plus sits off-centre in its own
            box at this size. Rotating it 45° is the open state — `rotate`
            is its own property in Tailwind v4, so the transition has to
            name it rather than `transform`. */}
        <span
          aria-hidden
          className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center text-zinc-500 transition-[rotate,color] duration-200 ease-out group-open:rotate-45 group-hover:text-accent"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M7 1.5v11M1.5 7h11" />
          </svg>
        </span>
      </summary>
      {/* The box the animation runs on, and the reason it is a wrapper rather
          than the row itself: tweening the row's height meant closing it to
          the summary's height, and anything the answer had pulled up into the
          summary's own padding stayed inside that box — the top line of the
          answer sat there, visible, until `open` flipped and it vanished.
          From zero, this box clips its contents cleanly the whole way down.
          The spacing above the answer lives here too, so nothing has to
          overlap the summary to get it. */}
      <div ref={contentRef} className="overflow-hidden">
        <p className="pb-4 pr-8 font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
          {answerFor(item)}
        </p>
      </div>
    </details>
  );
}

/**
 * The questions, as a list of disclosures. Two screens render this: the panel
 * the footer link opens, and `/veelgestelde-vragen` — the page that link points
 * at, which is what a crawler and a shared link get. Same component, so the two
 * can never answer the same question differently.
 *
 * Native `<details>` rather than a React accordion: the keyboard and
 * screen-reader behaviour comes free and correct, and a closed answer is
 * still in the HTML for anything that cannot run the animation below.
 */
export default function FaqList({
  /** The first answer stands open, unless the page around it opens cold. */
  defaultOpenIndex = 0,
}: {
  defaultOpenIndex?: number;
}) {
  return (
    <div>
      {FAQ.map((item, index) => (
        <FaqRow key={item.vraag} item={item} defaultOpen={index === defaultOpenIndex} />
      ))}
    </div>
  );
}
