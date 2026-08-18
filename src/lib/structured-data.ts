import { ZONNEBANKEN } from "@/data/zonnebanken-data";
import { PRODUCTEN } from "@/data/producten-data";
import { FAQ } from "@/data/faq-data";
import { OPENING_HOURS } from "@/lib/opening-hours";
import { parseEuro, schemaPrice } from "@/lib/price";
import { SOCIAL_IMAGE_URL } from "@/lib/social-metadata";
import {
  ADDRESS,
  BASE_URL,
  EMAIL,
  FAQ_URL,
  MAPS_URL,
  PHONE_E164,
  SAME_AS,
  SITE_NAME,
} from "@/lib/site";

/**
 * What the page says about itself in machine-readable form.
 *
 * Search engines have read JSON-LD for years; the assistants that now answer
 * "welke zonnestudio in Assen is vanavond open" lean on it harder, because a
 * graph states plainly what their crawler would otherwise have to infer from
 * layout. The old block named the studio, its address and its phone number and
 * stopped there — enough to be listed, not enough to be quoted.
 *
 * Everything here is built from the data the page itself renders, so the graph
 * cannot claim a price or an opening hour the visitor does not see.
 */

type JsonLdNode = Record<string, unknown>;

/** Stable node ids, so the nodes can point at each other instead of repeating. */
const STUDIO_ID = `${BASE_URL}/#studio`;
const WEBSITE_ID = `${BASE_URL}/#website`;

/**
 * Closed days are left out rather than written as a zero-length range: an
 * absent day already means closed, and Google reads a 00:00–00:00 entry as
 * open around the clock often enough to be worth avoiding.
 */
function openingHoursSpecification(): JsonLdNode[] {
  return OPENING_HOURS.filter((day) => day.opens && day.closes).map((day) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${day.schemaDay}`,
    opens: day.opens,
    closes: day.closes,
  }));
}

function zonnebankenCatalog(): JsonLdNode {
  return {
    "@type": "OfferCatalog",
    name: "Zonnebanken",
    itemListElement: ZONNEBANKEN.map((bank) => ({
      "@type": "Offer",
      name: bank.title,
      price: schemaPrice(parseEuro(bank.prijs)),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/#banken`,
      itemOffered: {
        "@type": "Service",
        name: `${bank.title}, sessie van ${bank.minuten}`,
        serviceType: "Zonnebanksessie",
        description: bank.description.join(" ").replace(/\n/g, " "),
        provider: { "@id": STUDIO_ID },
      },
    })),
  };
}

/**
 * The shelf, priced per container — the sachet price is a second price for the
 * same product and schema.org has no clean way to say that, so the bottle or
 * tube is the one that goes in.
 */
function productenCatalog(): JsonLdNode {
  return {
    "@type": "OfferCatalog",
    name: "Zonnecosmetica",
    itemListElement: PRODUCTEN.map((product) => ({
      "@type": "Offer",
      price: schemaPrice(parseEuro(product.containerPrice)),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStoreOnly",
      url: `${BASE_URL}/#producten`,
      itemOffered: {
        "@type": "Product",
        name: product.name,
        description: product.description,
        category: product.labels.join(", "),
      },
    })),
  };
}

export function buildStudioNode(): JsonLdNode {
  return {
    "@type": "BeautySalon",
    "@id": STUDIO_ID,
    name: SITE_NAME,
    description:
      "Zonnestudio in Assen met zes Ergoline zonnebanken, persoonlijk huidadvies en zonnecosmetica. Doordeweeks open tot 21.00 uur, parkeren voor de deur.",
    url: BASE_URL,
    image: SOCIAL_IMAGE_URL,
    logo: SOCIAL_IMAGE_URL,
    telephone: PHONE_E164,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.city,
      postalCode: ADDRESS.postalCode,
      addressCountry: ADDRESS.country,
    },
    hasMap: MAPS_URL,
    sameAs: SAME_AS,
    areaServed: { "@type": "City", name: ADDRESS.city },
    openingHoursSpecification: openingHoursSpecification(),
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Pin, Contant, Creditcard, Apple Pay, Google Pay",
    hasOfferCatalog: [zonnebankenCatalog(), productenCatalog()],
  };
}

function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: BASE_URL,
    name: SITE_NAME,
    inLanguage: "nl-NL",
    publisher: { "@id": STUDIO_ID },
  };
}

/**
 * The FAQ's own graph, for `/veelgestelde-vragen` — the page the footer link
 * points at.
 *
 * It lives there rather than in the homepage's graph because the markup has to
 * sit on the page that shows the text: on the homepage the answers are in a
 * panel that renders on click, and structured data describing content a crawler
 * cannot find is the kind of mismatch Google treats as a reason to trust the
 * rest of the markup less.
 */
export function buildFaqJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${FAQ_URL}#faq`,
    url: FAQ_URL,
    name: "Veelgestelde vragen over Ever Sun",
    inLanguage: "nl-NL",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": STUDIO_ID },
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.vraag,
      acceptedAnswer: { "@type": "Answer", text: item.antwoord },
    })),
  };
}

/**
 * One graph rather than three separate script tags: the nodes reference each
 * other by `@id`, and that only holds together if a crawler reads them as one
 * document.
 *
 * The review score is deliberately absent. Self-declared `aggregateRating` on a
 * business's own page is the kind of markup Google ignores at best — the 4.9
 * belongs to the Google listing, which `sameAs` points at.
 */
export function buildSiteJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": [buildStudioNode(), websiteNode()],
  };
}
