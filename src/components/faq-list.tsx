import { FAQ } from "@/data/faq-data";
import "./faq-list.css";

/**
 * The questions, as a list of disclosures. Two screens render this: the panel
 * the footer link opens, and `/veelgestelde-vragen` — the page that link points
 * at, which is what a crawler and a shared link get. Same component, so the two
 * can never answer the same question differently.
 *
 * Native `<details>` rather than a React accordion: the keyboard and
 * screen-reader behaviour comes free and correct, it needs no JavaScript, and a
 * closed answer is still in the HTML.
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
        <details key={item.vraag} open={index === defaultOpenIndex} className="faq-row group border-b border-line/30 last:border-b-0">
          {/* The bottom padding is what spaces a closed row; with the row open
              that same padding reads as a gap between the question and its own
              answer, so it gives most of it back. Done here rather than with a
              negative margin on the answer: `::details-content` clips what it
              animates, and a margin pulled the first line up out of the box. */}
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 transition-colors duration-150 group-open:pb-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
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
          <p className="pb-4 pr-8 font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-zinc-600">
            {item.antwoord}
          </p>
        </details>
      ))}
    </div>
  );
}
