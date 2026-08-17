import type { Metadata } from "next";
import Link from "next/link";
import FaqList from "@/components/faq-list";
import { buildFaqJsonLd } from "@/lib/structured-data";
import { SOCIAL_IMAGE, TWITTER_IMAGE } from "@/lib/social-metadata";

/**
 * The questions as a page, which is what the footer link points at and what a
 * crawler gets. On the site itself the same list opens in a panel over the
 * homepage; both render `FaqList`, so the two cannot drift apart.
 *
 * Same arrangement as the huidtest: a panel for the visitor, a plain URL for
 * everything that cannot click.
 */

export const metadata: Metadata = {
  title: "Veelgestelde vragen | Ever Sun",
  description:
    "Wat kost een sessie, moet je reserveren, hoe laat is Ever Sun open en vanaf welke leeftijd mag je onder de zonnebank? De antwoorden van de zonnestudio in Assen.",
  alternates: { canonical: "/veelgestelde-vragen" },
  openGraph: {
    title: "Veelgestelde vragen | Ever Sun",
    description:
      "Prijzen, openingstijden, reserveren en betalen bij Ever Sun — zonnestudio in Assen.",
    url: "/veelgestelde-vragen",
    siteName: "Ever Sun",
    locale: "nl_NL",
    type: "website",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veelgestelde vragen | Ever Sun",
    description:
      "Prijzen, openingstijden, reserveren en betalen bij Ever Sun — zonnestudio in Assen.",
    images: [TWITTER_IMAGE],
  },
};

export default function VeelgesteldeVragenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }}
      />
      <main className="min-h-screen bg-surface-page px-6 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[720px]">
          <Link
            href="/"
            className="font-sans text-[15px] text-muted underline decoration-line decoration-1 underline-offset-6 transition-colors duration-150 hover:text-ink-strong hover:decoration-ink-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Terug naar Ever Sun
          </Link>

          <h1 className="mt-8 font-display text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] text-ink-strong xl:tracking-[-0.015em]">
            Veelgestelde vragen
          </h1>
          <p className="mt-3 max-w-[520px] font-sans text-[15px] leading-[24px] tracking-[-0.01em] text-muted">
            Prijzen, openingstijden, reserveren en betalen — kort beantwoord. Staat je vraag er niet
            tussen?{" "}
            <Link
              href="/#contact"
              className="text-muted underline decoration-line decoration-1 underline-offset-6 transition-colors duration-150 hover:text-ink-strong hover:decoration-ink-strong"
            >
              Stuur ons een bericht
            </Link>
            .
          </p>

          {/* Nothing opens by default here: the page is the list, and a first
              row standing open only makes the rest look like an afterthought. */}
          <div className="mt-10">
            <FaqList defaultOpenIndex={-1} />
          </div>
        </div>
      </main>
    </>
  );
}
