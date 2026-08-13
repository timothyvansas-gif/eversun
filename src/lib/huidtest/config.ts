import type { ProductSlug } from "@/data/producten-data";
import type { Answers, BankId, StandId } from "@/lib/huidtest/types";

/**
 * Every word the huidtest shows, and every rule that decides what it shows.
 *
 * Copy and logic sit together here, apart from the components, because both are
 * the studio's to change: a price moves, a rule turns out too strict, a line
 * reads better another way. None of that should mean opening a component.
 *
 * The text is verbatim from the brief. It is Dutch, informal, and deliberately
 * unexcited — leave it that way.
 */

export const HUIDTEST_PATH = "/huidtest";

const WHATSAPP_NUMBER = "31625306491";

export const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/* ------------------------------------------------------------------ */
/* Intro and the two exits                                             */
/* ------------------------------------------------------------------ */

export const INTRO = {
  kop: "Welke bank en welk product passen bij jouw huid?",
  body: "Vijf korte vragen, klaar in een minuutje. Aan het eind weet je waar je huid blij van wordt.",
  wettelijk: "Zonnebanken zijn in Nederland alleen toegestaan vanaf 18 jaar.",
  vraag: "Ben je 18 jaar of ouder?",
  ja: "Ja, ik ben 18+",
  nee: "Nee, nog niet",
} as const;

export const EXIT_MINOR = {
  kop: "Nog even geduld",
  body: "Zonnen onder de zonnebank mag in Nederland pas vanaf 18 jaar. Dat is niet onze regel, maar wel eentje waar we volledig achter staan. Kom je na je achttiende langs? De koffie staat klaar.",
  cta: "Huidtest sluiten",
} as const;

/** The studio's number, spaced the way the rest of the site writes it. */
export const TELEFOON = { weergave: "06 25 30 64 91", href: "tel:+31625306491" } as const;

export const EXIT_TYPE1 = {
  kop: "Jouw huid vraagt om persoonlijk advies",
  body: "Met een huid die snel verbrandt en moeilijk bruint, geven we je online geen bankadvies. Niet omdat we niet willen, maar omdat jouw huid echt maatwerk verdient. Loop even binnen: we kijken samen naar wat wél kan, van rustige opbouw tot verzorgende producten.",
  // No booking button on this screen. The advice is to come in and be looked
  // at, and a CTA that starts a chat would quietly turn it back into a
  // transaction. What is left is the number, for anyone who would rather ask
  // first than walk in.
  telefoonVoor: "Bel je liever even vooraf? Dat kan op ",
  telefoonNa: ". We denken graag met je mee.",
  ctaSecundair: "Huidtest sluiten",
} as const;

/* ------------------------------------------------------------------ */
/* The five questions                                                  */
/* ------------------------------------------------------------------ */

/** Which answer a question writes, which is also its analytics name. */
export type QuestionKey = "huidreactie" | "ervaring" | "doel" | "huidgevoel" | "kleurstijl";

export type QuestionOption<K extends QuestionKey> = {
  id: NonNullable<Answers[K]>;
  label: string;
};

export type Question<K extends QuestionKey = QuestionKey> = {
  key: K;
  vraag: string;
  hulptekst?: string;
  options: QuestionOption<K>[];
  /** Question 4 carries the tattoo checkbox, so it cannot auto-advance. */
  checkbox?: { key: "tattoo"; label: string };
};

export const QUESTIONS: [
  Question<"huidreactie">,
  Question<"ervaring">,
  Question<"doel">,
  Question<"huidgevoel">,
  Question<"kleurstijl">,
] = [
  {
    key: "huidreactie",
    vraag: "Hoe reageert je huid op zon?",
    hulptekst: "Denk aan een zomerdag buiten, zonder bescherming.",
    // Third, not first. It is the rarest answer here and the one that ends the
    // test, so leading with it put the exit at the top of the very first
    // question. The order the options are read in has no bearing on the rules;
    // `id` is what those match on.
    options: [
      { id: "type2", label: "Ik verbrand snel, daarna word ik licht bruin" },
      { id: "type3", label: "Ik word makkelijk bruin en verbrand zelden" },
      { id: "type1", label: "Ik verbrand altijd en word eigenlijk nooit bruin" },
      { id: "type4", label: "Ik word diep bruin en verbrand bijna nooit" },
    ],
  },
  {
    key: "ervaring",
    vraag: "Hoe vaak lig je onder de zonnebank?",
    options: [
      { id: "nooit", label: "Nooit gedaan, dit wordt m'n eerste keer" },
      { id: "soms", label: "Af en toe, een paar keer per jaar" },
      { id: "regelmatig", label: "Regelmatig, ik weet hoe mijn huid reageert" },
    ],
  },
  {
    key: "doel",
    vraag: "Wat wil je bereiken?",
    options: [
      { id: "basis", label: "Rustig een basiskleur opbouwen" },
      { id: "snel", label: "Snel zichtbare kleur" },
      { id: "verdiepen", label: "Mijn kleur dieper maken" },
      { id: "behoud", label: "Mijn kleur vasthouden" },
    ],
  },
  {
    key: "huidgevoel",
    vraag: "Hoe voelt je huid meestal aan?",
    options: [
      { id: "droog", label: "Snel droog of trekkerig" },
      { id: "gevoelig", label: "Gevoelig, snel rood of geïrriteerd" },
      { id: "normaal", label: "Normaal, weinig gedoe" },
    ],
    checkbox: { key: "tattoo", label: "Ik heb tattoos die ik mooi wil houden" },
  },
  {
    key: "kleurstijl",
    vraag: "Wat past bij jou?",
    options: [
      { id: "direct", label: "Meteen resultaat zien, ook al is het deels van het product" },
      { id: "natuurlijk", label: "Liever mijn eigen kleur, ook als dat langer duurt" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* The result screen                                                   */
/* ------------------------------------------------------------------ */

export const RESULTAAT = {
  kop: "Dit past bij jou",
  standregel: (stand: StandId) => `Begin op de stand ${stand}.`,
  kassakoopjeKop: "Voor erbij",
  sachetToggle: (prijs: string) => `Leg een sachet voor me klaar · € ${prijs}`,
  ctaPrimair: "Plan je moment",
  ctaSecundair: "Opnieuw doen",
  disclaimer:
    "Deze test geeft een indicatie. In de studio kijken we altijd nog even samen naar je huid. Dat advies is leidend.",
} as const;

export const HUID_FRAGMENT: Record<Exclude<Answers["huidreactie"], "type1">, string> = {
  type2:
    "Je huid verbrandt snel en bruint voorzichtig, en verdient dus een rustige, gecontroleerde opbouw.",
  type3: "Je huid bruint makkelijk en kan goed tegen een stevige sessie.",
  type4: "Je huid bruint diep en snel, daar mag best wat kracht achter.",
};

export const DOEL_FRAGMENT: Record<Answers["doel"], string> = {
  basis: "Voor een basiskleur die rustig opbouwt is dit de fijnste start.",
  snel: "Het blauwe licht zet je pigment al aan vóór het zonnen, dus je kleur komt sneller op gang.",
  verdiepen: "Het rode Beauty Light stimuleert je doorbloeding, zodat je kleur dieper wordt.",
  behoud:
    "Een constante, betrouwbare sessie is precies wat je nodig hebt om je kleur vast te houden.",
};

/** First time under a bank: the reasoning is about the visit, not the machine. */
export const WAAROM_EERSTE_KEER =
  "Voor je eerste keer kiezen we bewust de rustigste bank. Zo went je huid ontspannen aan de zon, en kijken we in de studio samen hoe je huid reageert.";

export const HUID_FRAGMENT_GEVOELIG = "Je huid reageert snel, dus we beginnen bewust rustig.";

/**
 * The doelFragment above names a feature of the bank it assumes — blue light,
 * red Beauty Light — but rule B3 sends a sensitive skin to the 600 light, which
 * has neither. Saying it anyway would promise something the advised bed cannot
 * do, so that combination gets a line about the choice instead of the hardware.
 */
export const DOEL_FRAGMENT_RUSTIG =
  "We beginnen bewust op de rustigste bank, zodat je huid stap voor stap kan wennen.";

export const PRODUCT_WAAROM: Record<ProductSlug, string> = {
  "dare-to-be-dark":
    "Geen bronzer, geen parfum, geen olie, alleen activatoren die je eigen kleur aanzetten. Precies wat een gevoelige huid wil.",
  "him-surf": "Beschermt je tattoos, trekt snel in en versterkt je kleur zonder bronzer.",
  "him-jet": "Diepe bronzer die je tattoos ontziet, met resultaat vanaf de eerste sessie.",
  "white-2-bronze":
    "Directe bronzer met anti-oranje technologie. Je ziet meteen kleur, en die blijft natuurlijk.",
  "black-crown":
    "Zware bronzer voor gevorderden. Direct resultaat dat de dagen erna nog dieper wordt.",
  vault:
    "Ingekapselde DHA komt langzaam vrij en color lock-agenten zetten je kleur vast, dagen lang egaal.",
  "bronze-butter":
    "Zes boters en vegan collageen tegen een droge, trekkende huid. De kleur komt van jezelf.",
  "sun-honey":
    "Maakt je huid ontvankelijker voor kleur. Fijn als je kleur sneller wil opbouwen of al een tijdje stilstaat.",
  // Never advised as the main product: it is the fixed after-sun line at the
  // bottom of the block, and the two moisturisers are not in the rules at all.
  "barefoot-beachwood": "",
  "coco-creamsicle": "",
  "enchanted-emerald": "",
};

/** The after-sun under every advice, whatever the quiz decided. */
export const SECUNDAIR_PRODUCT: ProductSlug = "barefoot-beachwood";

/* ------------------------------------------------------------------ */
/* Entry points                                                        */
/* ------------------------------------------------------------------ */

export const TEASER = {
  kop: "Welke bank past bij jouw huid?",
  body: "Doe de huidtest: vijf korte vragen en je weet welke bank en welk product bij je passen. Duurt nog geen minuut.",
  cta: "Doe de huidtest",
} as const;

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

/** Which stand a skin starts on, where the bank has stands to choose from. */
export const STAND_TABEL: Record<Exclude<Answers["huidreactie"], "type1">, StandId> = {
  type2: "sensitive",
  type3: "medium",
  type4: "intensive",
};

export type BankRegel = {
  /** B1–B9, kept as the name the brief gives them so a report can cite one. */
  id: string;
  when: (a: Pick<Answers, "huidreactie" | "ervaring" | "doel" | "huidgevoel">) => boolean;
  bank: BankId;
  /** A fixed stand, `"tabel"` to read STAND_TABEL, or null for a bank without stands. */
  stand: StandId | "tabel" | null;
};

/** First match wins, so order is the rule. `type1` is already filtered out. */
export const BANK_REGELS: BankRegel[] = [
  { id: "B1", when: (a) => a.ervaring === "nooit", bank: "600-light", stand: null },
  {
    id: "B2",
    when: (a) => a.huidgevoel === "gevoelig" && a.doel === "snel" && a.ervaring === "regelmatig",
    bank: "blue-vision",
    stand: "sensitive",
  },
  { id: "B3", when: (a) => a.huidgevoel === "gevoelig", bank: "600-light", stand: null },
  { id: "B4", when: (a) => a.doel === "snel", bank: "blue-vision", stand: "tabel" },
  {
    id: "B5",
    when: (a) => a.doel === "basis" && a.huidreactie === "type2",
    bank: "600-light",
    stand: null,
  },
  // Starting gently is the whole point of a base tan, so this one overrides the
  // table rather than reading it.
  { id: "B6", when: (a) => a.doel === "basis", bank: "prestige-1600", stand: "sensitive" },
  { id: "B7", when: (a) => a.doel === "verdiepen", bank: "prestige-1600", stand: "tabel" },
  {
    id: "B8",
    when: (a) => a.doel === "behoud" && a.huidgevoel === "droog",
    bank: "prestige-1600",
    stand: "tabel",
  },
  { id: "B9", when: (a) => a.doel === "behoud", bank: "770-medium", stand: null },
];

export type ProductRegel = {
  id: string;
  when: (a: Omit<Answers, "age">) => boolean;
  product: ProductSlug;
};

export const PRODUCT_REGELS: ProductRegel[] = [
  { id: "P1", when: (a) => a.huidgevoel === "gevoelig", product: "dare-to-be-dark" },
  {
    id: "P2",
    when: (a) => a.tattoo && a.kleurstijl === "direct" && a.ervaring === "regelmatig",
    product: "him-jet",
  },
  { id: "P3", when: (a) => a.tattoo, product: "him-surf" },
  { id: "P4", when: (a) => a.kleurstijl === "direct" && a.doel === "behoud", product: "vault" },
  {
    id: "P5",
    when: (a) =>
      a.kleurstijl === "direct" &&
      a.ervaring === "regelmatig" &&
      (a.huidreactie === "type3" || a.huidreactie === "type4"),
    product: "black-crown",
  },
  { id: "P6", when: (a) => a.kleurstijl === "direct", product: "white-2-bronze" },
  { id: "P7", when: (a) => a.huidgevoel === "droog", product: "bronze-butter" },
  {
    id: "P8",
    when: (a) => a.doel === "verdiepen" || a.doel === "behoud" || a.doel === "snel",
    product: "sun-honey",
  },
  // basis + natuurlijk + normaal, the one path the eight above leave open.
  { id: "P9", when: () => true, product: "bronze-butter" },
];
