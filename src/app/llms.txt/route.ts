import { ZONNEBANKEN } from "@/data/zonnebanken-data";
import { PRODUCTEN } from "@/data/producten-data";
import { FAQ } from "@/data/faq-data";
import { OPENING_HOURS } from "@/lib/opening-hours";
import {
  ADDRESS,
  BASE_URL,
  EMAIL,
  FAQ_URL,
  MAPS_URL,
  PHONE_DISPLAY,
  SITE_NAME,
  FACEBOOK_URL,
  INSTAGRAM_URL,
} from "@/lib/site";

/**
 * /llms.txt — the site in plain markdown, for a model reading it rather than a
 * browser rendering it.
 *
 * The page itself is one long animated document: the hours sit behind a click,
 * the products behind a carousel, the prices on cards. An assistant that has to
 * reconstruct "wat kost de goedkoopste bank en hoe laat kan ik langs" out of
 * that markup will get it right most of the time. This file removes the "most".
 *
 * Built from the same data modules the page renders, so it cannot describe a
 * studio that no longer exists.
 */

export const dynamic = "force-static";

function build(): string {
  const uren = OPENING_HOURS.map((day) => `- ${day.day}: ${day.hours}`).join("\n");

  const banken = ZONNEBANKEN.map(
    (bank) =>
      `- **${bank.title}**: ${bank.prijs} voor ${bank.minuten}. ${bank.description
        .join(" ")
        .replace(/\n/g, " ")}`,
  ).join("\n");

  const producten = PRODUCTEN.map(
    (product) =>
      `- **${product.name}** (${product.labels.join(", ")}): ${product.containerLabel} € ${
        product.containerPrice
      }${product.sachetPrice ? `, sachet 15 ml € ${product.sachetPrice}` : ""}. ${
        product.description
      }`,
  ).join("\n");

  const faq = FAQ.map((item) => `### ${item.vraag}\n${item.antwoord}`).join("\n\n");

  return `# ${SITE_NAME}

> Zonnestudio in ${ADDRESS.city} met zes Ergoline zonnebanken, persoonlijk huidadvies en zonnecosmetica. Sessies van 20 minuten, doordeweeks open tot 21.00 uur, parkeren voor de deur.

## Contact en locatie

- Adres: ${ADDRESS.street}, ${ADDRESS.postalCode} ${ADDRESS.city}, Nederland
- Telefoon en WhatsApp: ${PHONE_DISPLAY}
- E-mail: ${EMAIL}
- Website: ${BASE_URL}
- Google Maps: ${MAPS_URL}
- Instagram: ${INSTAGRAM_URL}
- Facebook: ${FACEBOOK_URL}

## Openingstijden (Europe/Amsterdam)

${uren}

## Zonnebanken en prijzen

Alle banken zijn van Ergoline. Een sessie duurt 20 minuten en wordt per keer
afgerekend; er zijn geen abonnementen. Betalen kan met pin,
contant, creditcard, Apple Pay en Google Pay.

${banken}

## Zonnecosmetica

Uitsluitend in de studio verkrijgbaar, zodat er advies bij hoort.

${producten}

## Veelgestelde vragen

${faq}

## Pagina's

- [Home](${BASE_URL}/): studio, banken, producten, team en contact
- [Veelgestelde vragen](${FAQ_URL}): prijzen, reserveren, openingstijden, betalen, leeftijd
- [Huidtest](${BASE_URL}/huidtest): vijf vragen, advies over bank en product
`;
}

export function GET(): Response {
  return new Response(build(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
