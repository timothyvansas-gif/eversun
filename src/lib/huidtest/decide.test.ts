import { describe, expect, it } from "vitest";
import { BANK_REGELS, PRODUCT_REGELS, RESULTAAT } from "@/lib/huidtest/config";
import {
  buildWhatsappMessage,
  buildWhy,
  decide,
  decideBank,
  decideProduct,
  skipsKleurstijl,
} from "@/lib/huidtest/decide";
import type { QuizAnswers } from "@/lib/huidtest/types";

/**
 * A middle-of-the-road set of answers, so each test can state only the answer
 * it is about. On its own it lands on B7 → prestige-1600 / medium.
 */
const base: QuizAnswers = {
  huidreactie: "type3",
  ervaring: "soms",
  doel: "verdiepen",
  huidgevoel: "normaal",
  tattoo: false,
  kleurstijl: "natuurlijk",
};

const answers = (over: Partial<QuizAnswers>): QuizAnswers => ({ ...base, ...over });

describe("decideBank", () => {
  it("B1 — a first-timer gets the calmest bed, whatever else they said", () => {
    expect(decideBank(answers({ ervaring: "nooit", doel: "snel", huidreactie: "type4" }))).toEqual({
      bank: "600-light",
      stand: null,
    });
  });

  it("B2 — sensitive but experienced and in a hurry: Blue Vision on sensitive", () => {
    expect(
      decideBank(answers({ huidgevoel: "gevoelig", doel: "snel", ervaring: "regelmatig" })),
    ).toEqual({ bank: "blue-vision", stand: "sensitive" });
  });

  it("B3 — any other sensitive skin goes to the 600 light", () => {
    expect(decideBank(answers({ huidgevoel: "gevoelig", doel: "snel", ervaring: "soms" }))).toEqual({
      bank: "600-light",
      stand: null,
    });
  });

  it("B4 — colour in a hurry means Blue Vision, on the stand the skin asks for", () => {
    expect(decideBank(answers({ doel: "snel", huidreactie: "type4" }))).toEqual({
      bank: "blue-vision",
      stand: "intensive",
    });
  });

  it("B5 — a base tan on a skin that burns fast stays on the 600 light", () => {
    expect(decideBank(answers({ doel: "basis", huidreactie: "type2" }))).toEqual({
      bank: "600-light",
      stand: null,
    });
  });

  it("B6 — any other base tan starts on the Prestige, always on sensitive", () => {
    // The stand table would say `intensive` here. Building up slowly wins.
    expect(decideBank(answers({ doel: "basis", huidreactie: "type4" }))).toEqual({
      bank: "prestige-1600",
      stand: "sensitive",
    });
  });

  it("B7 — going deeper is the Prestige, on the table's stand", () => {
    expect(decideBank(answers({ doel: "verdiepen", huidreactie: "type2" }))).toEqual({
      bank: "prestige-1600",
      stand: "sensitive",
    });
  });

  it("B8 — holding colour on a dry skin gets the Prestige's care", () => {
    expect(decideBank(answers({ doel: "behoud", huidgevoel: "droog", huidreactie: "type3" }))).toEqual(
      { bank: "prestige-1600", stand: "medium" },
    );
  });

  it("B9 — holding colour otherwise is the 770", () => {
    expect(decideBank(answers({ doel: "behoud", huidgevoel: "normaal" }))).toEqual({
      bank: "770-medium",
      stand: null,
    });
  });

  it("advises exactly one bank for every combination of answers", () => {
    // The acceptance criterion, brute-forced: 3 skins × 3 experience × 4 goals
    // × 3 feels × tattoo, minus the type1 exit. No gaps, no throws.
    for (const huidreactie of ["type2", "type3", "type4"] as const) {
      for (const ervaring of ["nooit", "soms", "regelmatig"] as const) {
        for (const doel of ["basis", "snel", "verdiepen", "behoud"] as const) {
          for (const huidgevoel of ["droog", "gevoelig", "normaal"] as const) {
            const kleurstijl = skipsKleurstijl(huidgevoel) ? undefined : ("direct" as const);
            const advies = decide({ huidreactie, ervaring, doel, huidgevoel, tattoo: true, kleurstijl });

            expect(advies.bank).toBeTruthy();
            expect(advies.product).toBeTruthy();
            // Only the two banks with a display carry a stand.
            if (advies.stand !== null) {
              expect(["prestige-1600", "blue-vision"]).toContain(advies.bank);
            }
          }
        }
      }
    }
  });

  it("keeps the rules in the order the advice depends on", () => {
    // B3 catches every sensitive skin, so it has to sit behind B2 or the Blue
    // Vision case can never be reached.
    expect(BANK_REGELS.map((r) => r.id)).toEqual(["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"]);
  });
});

describe("decideProduct", () => {
  it("P1 — a sensitive skin gets the mild one, before anything else is weighed", () => {
    expect(decideProduct(answers({ huidgevoel: "gevoelig", tattoo: true, kleurstijl: undefined }))).toBe(
      "dare-to-be-dark",
    );
  });

  it("P2 — tattoos, instant colour and experience: H.I.M. Jet", () => {
    expect(
      decideProduct(answers({ tattoo: true, kleurstijl: "direct", ervaring: "regelmatig" })),
    ).toBe("him-jet");
  });

  it("P3 — any other tattooed skin: H.I.M. Surf", () => {
    expect(decideProduct(answers({ tattoo: true, kleurstijl: "natuurlijk" }))).toBe("him-surf");
  });

  it("P4 — instant colour that has to last is Vault", () => {
    expect(decideProduct(answers({ kleurstijl: "direct", doel: "behoud" }))).toBe("vault");
  });

  it("P5 — instant colour on an experienced, easily-tanning skin is Black Crown", () => {
    expect(
      decideProduct(answers({ kleurstijl: "direct", ervaring: "regelmatig", huidreactie: "type3" })),
    ).toBe("black-crown");
  });

  it("P6 — instant colour otherwise is White 2 Bronze", () => {
    expect(
      decideProduct(answers({ kleurstijl: "direct", ervaring: "soms", huidreactie: "type2" })),
    ).toBe("white-2-bronze");
  });

  it("P7 — a dry skin gets the butter", () => {
    expect(decideProduct(answers({ huidgevoel: "droog", kleurstijl: "natuurlijk" }))).toBe(
      "bronze-butter",
    );
  });

  it("P8 — deepening, holding or hurrying without a bronzer is Sun Honey", () => {
    expect(
      decideProduct(answers({ doel: "verdiepen", huidgevoel: "normaal", kleurstijl: "natuurlijk" })),
    ).toBe("sun-honey");
  });

  it("P9 — the one path left over: a base tan, naturally, on an easy skin", () => {
    expect(
      decideProduct(answers({ doel: "basis", huidgevoel: "normaal", kleurstijl: "natuurlijk" })),
    ).toBe("bronze-butter");
  });

  it("keeps the rules in the order the advice depends on", () => {
    expect(PRODUCT_REGELS.map((r) => r.id)).toEqual([
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "P9",
    ]);
  });
});

describe("decide", () => {
  it("adds the tattoo tip when the mild product wins from inked skin", () => {
    const advies = decide(answers({ huidgevoel: "gevoelig", tattoo: true, kleurstijl: undefined }));

    expect(advies.product).toBe("dare-to-be-dark");
    expect(advies.tattooTip).toBe(true);
    expect(RESULTAAT.tattooTip).toContain("H.I.M. Surf");
  });

  it("leaves the tip off when there are no tattoos to protect", () => {
    expect(decide(answers({ huidgevoel: "gevoelig", tattoo: false, kleurstijl: undefined })).tattooTip).toBe(
      false,
    );
  });
});

describe("skipsKleurstijl", () => {
  it("skips question 5 for a sensitive skin, because P1 already decided", () => {
    expect(skipsKleurstijl("gevoelig")).toBe(true);
  });

  it("asks it for every other skin", () => {
    expect(skipsKleurstijl("droog")).toBe(false);
    expect(skipsKleurstijl("normaal")).toBe(false);
  });
});

describe("buildWhy", () => {
  it("replaces the whole line for a first-timer", () => {
    const why = buildWhy(answers({ ervaring: "nooit" }), "600-light");

    expect(why).toContain("Voor je eerste keer");
    expect(why).not.toContain("Het rode Beauty Light");
  });

  it("pairs a skin fragment with a goal fragment", () => {
    expect(buildWhy(answers({ huidreactie: "type4", doel: "verdiepen" }), "prestige-1600")).toBe(
      "Je huid bruint diep en snel — daar mag best wat kracht achter. Het rode Beauty Light stimuleert je doorbloeding, zodat je kleur dieper wordt.",
    );
  });

  it("softens the skin fragment when the skin is sensitive", () => {
    const why = buildWhy(
      answers({ huidgevoel: "gevoelig", doel: "snel", ervaring: "regelmatig" }),
      "blue-vision",
    );

    expect(why).toContain("Je huid reageert snel");
    // B2 really is the Blue Vision, so the blue-light sentence is honest here.
    expect(why).toContain("Het blauwe licht");
  });

  it("never claims a feature the advised bank does not have", () => {
    // The regression this exists for: B3 sends a sensitive skin to the 600
    // light, which has neither the blue LEDs nor the red Beauty Light.
    for (const doel of ["snel", "verdiepen"] as const) {
      const why = buildWhy(answers({ huidgevoel: "gevoelig", doel, ervaring: "soms" }), "600-light");

      expect(why).not.toContain("Het blauwe licht");
      expect(why).not.toContain("Het rode Beauty Light");
      expect(why).toContain("de rustigste bank");
    }
  });
});

describe("buildWhatsappMessage", () => {
  it("names the bank and its stand", () => {
    const message = buildWhatsappMessage(
      { bank: "prestige-1600", stand: "medium", product: "sun-honey", tattooTip: false },
      false,
    );

    expect(message).toBe(
      "Hoi Ever Sun,\nik heb de huidtest gedaan. Mijn advies: Ergoline Prestige 1600 (stand medium).\nIk wil graag een sessie plannen.",
    );
  });

  it("leaves the stand out for a bank that has none", () => {
    const message = buildWhatsappMessage(
      { bank: "770-medium", stand: null, product: "sun-honey", tattooTip: false },
      false,
    );

    expect(message).toContain("Ergoline 770 medium.");
    expect(message).not.toContain("stand");
  });

  it("asks for a sachet only when the toggle is on", () => {
    const advies = { bank: "770-medium", stand: null, product: "vault", tattooTip: false } as const;

    expect(buildWhatsappMessage(advies, true)).toContain(
      "Leggen jullie een sachet Vault voor me klaar?",
    );
    expect(buildWhatsappMessage(advies, false)).not.toContain("sachet");
  });
});
