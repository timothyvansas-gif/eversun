import type { ProductSlug } from "@/data/producten-data";
import type { ZonnebankSlug } from "@/lib/whatsapp";

/**
 * What the visitor told us. Nothing derived lives here: the bank, the product
 * and the reasoning are all functions of these answers, which is what makes
 * the result shareable as a URL — encode the answers, rebuild everything else.
 */
export type Answers = {
  age: "ok" | "minor";
  huidreactie: "type1" | "type2" | "type3" | "type4";
  haarkleur: "rossig" | "anders";
  ervaring: "nooit" | "soms" | "regelmatig";
  doel: "basis" | "snel" | "verdiepen" | "behoud";
  huidgevoel: "droog" | "gevoelig" | "normaal";
  tattoo: boolean;
  /** Not asked when the skin is sensitive — that answer already fixes the product. */
  kleurstijl?: "direct" | "natuurlijk";
};

/** The six questions, minus the age check, which gates rather than advises. */
export type QuizAnswers = Omit<Answers, "age">;

export type BankId = "600-light" | "770-medium" | "prestige-1600" | "blue-vision";

/** Only the Prestige 1600 and the Blue Vision have a stand to pick. */
export type StandId = "sensitive" | "medium" | "intensive";

export type Advies = {
  bank: BankId;
  stand: StandId | null;
  product: ProductSlug;
};

/**
 * The answers that end the test without a bank advice. None can be reached
 * past this point — including through a shared URL.
 */
export type ExitReason = "minor" | "type1" | "rossig";

/**
 * The bank ids the rules are written against, mapped onto the slugs the rest of
 * the site already uses for photos, prices and booking links. Two vocabularies
 * for one set of four beds, joined here rather than anywhere a rule can see.
 */
export const BANK_SLUGS: Record<BankId, ZonnebankSlug> = {
  "600-light": "ergoline-600-light",
  "770-medium": "ergoline-770-medium",
  "prestige-1600": "ergoline-prestige-1600",
  "blue-vision": "ergoline-blue-vision",
};
