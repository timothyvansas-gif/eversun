import { ZONNEBANKEN } from "@/data/zonnebanken-data";
import { PRODUCTEN } from "@/data/producten-data";
import { groupOpeningHours } from "@/lib/opening-hours";
import { formatEuro, parseEuro } from "@/lib/price";
import { ADDRESS, PHONE_DISPLAY } from "@/lib/site";

/**
 * The questions people ask at the counter, answered on the page.
 *
 * This exists for two readers at once. A visitor scanning for "moet ik
 * reserveren" is the obvious one. The other is an assistant answering that
 * question about Assen: it can only quote a site that states the answer in
 * plain sentences, and until now the price of a session lived on a card, the
 * hours lived behind a click, and nothing on the page said anything about
 * pinnen or leeftijd at all.
 *
 * Prices and hours are read from the same data the cards and the overlay use —
 * an answer here that drifts from the card above it is worse than no answer.
 */

export type FaqItem = {
  vraag: string;
  antwoord: string;
  /**
   * Handle for a row whose answer needs live links instead of plain text —
   * WhatsApp and `tel:`, here. `antwoord` stays the plain sentence regardless:
   * the JSON-LD and llms.txt only ever read that string, and `faq-list.tsx`
   * swaps in the interactive version by matching this id.
   */
  id?: "reserveren";
};

const prijzen = ZONNEBANKEN.map((bank) => parseEuro(bank.prijs));
const goedkoopste = formatEuro(Math.min(...prijzen));
const duurste = formatEuro(Math.max(...prijzen));

const sachet = PRODUCTEN.find((product) => product.sachetPrice)?.sachetPrice;

const urenZin = groupOpeningHours()
  .map((groep) => `${groep.label.toLowerCase()} ${groep.hours.replace(" – ", " tot ")}`)
  .join(", ");

export const FAQ: FaqItem[] = [
  {
    vraag: "Wat kost een zonnebanksessie bij Ever Sun?",
    antwoord: `Een sessie duurt 20 minuten en kost ${goedkoopste} tot ${duurste}, afhankelijk van de bank. De Ergoline 600 light is de voordeligste, de Blue Vision de meest uitgebreide. Je rekent per sessie af; we werken niet met abonnementen.`,
  },
  {
    vraag: "Moet ik reserveren of kan ik binnenlopen?",
    antwoord: `Binnenlopen mag altijd tijdens onze openingstijden. Wil je zeker weten dat je bank vrij is, stuur dan even een WhatsApp of bel ${PHONE_DISPLAY}, dan staat hij voor je klaar en sta je niet te wachten.`,
    id: "reserveren",
  },
  {
    vraag: "Wat zijn de openingstijden?",
    antwoord: `We zijn open op ${urenZin}. Maandag zijn we gesloten.`,
  },
  {
    vraag: "Hoe kan ik betalen?",
    antwoord:
      "Met pin, contant, creditcard of contactloos via Apple Pay en Google Pay. Je betaalt in de studio, per sessie.",
  },
  {
    vraag: "Vanaf welke leeftijd mag ik onder de zonnebank?",
    antwoord:
      "Vanaf 18 jaar. Dat is geen huisregel van ons maar wettelijk vastgelegd: onder de 18 mag een zonnestudio in Nederland geen sessie verkopen. We kunnen om een legitimatie vragen.",
  },
  {
    vraag: "Welke zonnebanken staan er in de studio?",
    antwoord: `Zes banken in vier modellen, allemaal van Ergoline: ${ZONNEBANKEN.map((bank) => bank.title).join(", ")}. De lampen vervangen we preventief, dus een sessie geeft altijd dezelfde kracht, ook aan het eind van de levensduur van een lamp.`,
  },
  {
    vraag: "Welke bank past bij mijn huid?",
    antwoord:
      "Doe de huidtest op de site: vijf korte vragen en je weet welke bank en welk verzorgingsproduct bij je huid passen. Twijfel je nog, dan kijken we in de studio met je mee voordat je gaat liggen.",
  },
  {
    vraag: "Hoe vaak kan ik zonnen?",
    antwoord:
      "Nooit twee sessies op dezelfde dag: je huid heeft minstens 24 uur nodig om de kleur op te bouwen. Hoe vaak per week verstandig is, hangt af van je huidtype. Daar geven we je in de studio persoonlijk advies over.",
  },
  {
    vraag: "Verkopen jullie ook zonnecosmetica?",
    antwoord: `Ja. We voeren ${PRODUCTEN.length} producten voor voor, tijdens en na het zonnen${sachet ? `, vanaf € ${sachet} voor een sachet van 15 ml` : ""}. Ze zijn uitsluitend in de studio te koop, zodat je er meteen advies bij krijgt over wat bij jouw huid past.`,
  },
  {
    vraag: "Waar kan ik parkeren?",
    antwoord: `We zitten aan de ${ADDRESS.street} in ${ADDRESS.city}. Je parkeert direct voor de deur, en als het daar vol staat is parkeergarage Citadel om de hoek.`,
  },
];
