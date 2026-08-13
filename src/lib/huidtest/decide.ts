import { PRODUCTEN, type Product, type ProductSlug } from "@/data/producten-data";
import { ZONNEBANK_BOOKINGS } from "@/lib/whatsapp";
import {
  BANK_REGELS,
  DOEL_FRAGMENT,
  DOEL_FRAGMENT_RUSTIG,
  HUID_FRAGMENT,
  HUID_FRAGMENT_GEVOELIG,
  PRODUCT_REGELS,
  STAND_TABEL,
  WAAROM_EERSTE_KEER,
  whatsappUrl,
} from "@/lib/huidtest/config";
import { BANK_SLUGS, type Advies, type QuizAnswers, type StandId } from "@/lib/huidtest/types";

/**
 * The advice, derived from the answers and nothing else.
 *
 * Pure on purpose, and separate from the config beside it: the rules are the
 * studio's to tune, the evaluation order is not. Everything here is covered by
 * a test per rule, because a wrong bank is not a wrong pixel — someone lies
 * under it for twenty minutes.
 */

/** Whether the last question is asked. A sensitive skin already fixes the product. */
export function skipsKleurstijl(huidgevoel: QuizAnswers["huidgevoel"]): boolean {
  return huidgevoel === "gevoelig";
}

export function decideBank(a: QuizAnswers): { bank: Advies["bank"]; stand: StandId | null } {
  const regel = BANK_REGELS.find((r) => r.when(a));

  // Unreachable: B9 has no condition beyond `behoud`, and the four doel values
  // are covered between B4, B5/B6, B7 and B8/B9. Kept as a real throw rather
  // than a `!`, so a future rule edit that opens a gap says so.
  if (!regel) throw new Error(`Geen bankregel matcht: ${JSON.stringify(a)}`);

  const stand =
    regel.stand === "tabel"
      ? a.huidreactie === "type1"
        ? null
        : STAND_TABEL[a.huidreactie]
      : regel.stand;

  return { bank: regel.bank, stand };
}

export function decideProduct(a: QuizAnswers): ProductSlug {
  const regel = PRODUCT_REGELS.find((r) => r.when(a));
  if (!regel) throw new Error(`Geen productregel matcht: ${JSON.stringify(a)}`);
  return regel.product;
}

export function decide(a: QuizAnswers): Advies {
  const { bank, stand } = decideBank(a);

  return {
    bank,
    stand,
    product: decideProduct(a),
    tattooTip: a.huidgevoel === "gevoelig" && a.tattoo,
  };
}

/**
 * The line under the bank card: why this bed, in the visitor's own terms.
 *
 * Two fragments, one about the skin and one about the goal — except where a
 * fragment would describe a bank the visitor is not being sent to. See
 * DOEL_FRAGMENT_RUSTIG.
 */
export function buildWhy(a: QuizAnswers, bank: Advies["bank"]): string {
  if (a.ervaring === "nooit") return WAAROM_EERSTE_KEER;

  const huid =
    a.huidgevoel === "gevoelig"
      ? HUID_FRAGMENT_GEVOELIG
      : a.huidreactie === "type1"
        ? ""
        : HUID_FRAGMENT[a.huidreactie];

  const doel =
    a.huidgevoel === "gevoelig" && bank === "600-light"
      ? DOEL_FRAGMENT_RUSTIG
      : DOEL_FRAGMENT[a.doel];

  return [huid, doel].filter(Boolean).join(" ");
}

export function findProduct(slug: ProductSlug): Product {
  const product = PRODUCTEN.find((p) => p.slug === slug);
  if (!product) throw new Error(`Onbekend product: ${slug}`);
  return product;
}

/**
 * The prefilled WhatsApp message. The sachet line is there only when the
 * visitor switched the toggle on — the whole point of the kassakoopje is that
 * it is opt-in, and a message that asks for one anyway would break that promise
 * at the counter.
 */
export function buildWhatsappMessage(advies: Advies, sachet: boolean): string {
  const bankNaam = ZONNEBANK_BOOKINGS[BANK_SLUGS[advies.bank]];
  const standSuffix = advies.stand ? ` (stand ${advies.stand})` : "";
  const sachetRegel = sachet
    ? `Leggen jullie een sachet ${findProduct(advies.product).name} voor me klaar?\n`
    : "";

  return `Hoi Ever Sun,\nik heb de huidtest gedaan. Mijn advies: ${bankNaam}${standSuffix}.\n${sachetRegel}Ik wil graag een sessie plannen.`;
}

export function buildWhatsappUrl(advies: Advies, sachet: boolean): string {
  return whatsappUrl(buildWhatsappMessage(advies, sachet));
}
