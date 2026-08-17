import { describe, it, expect } from "vitest";
import { parseEuro, formatEuro, schemaPrice } from "./price";
import { ZONNEBANKEN } from "@/data/zonnebanken-data";

describe("parseEuro", () => {
  it("reads the display strings the cards use", () => {
    expect(parseEuro("€ 18,00")).toBe(18);
    expect(parseEuro("€ 19,50")).toBe(19.5);
    expect(parseEuro("4,99")).toBe(4.99);
  });

  it("returns NaN when there is no number to read", () => {
    expect(parseEuro("Op aanvraag")).toBeNaN();
    expect(parseEuro("")).toBeNaN();
  });

  // The structured data and the FAQ both quote these. A price that stops
  // parsing would silently ship "€ NaN" to Google rather than fail a build.
  it("parses every price on the site", () => {
    for (const bank of ZONNEBANKEN) {
      expect(parseEuro(bank.prijs), bank.title).not.toBeNaN();
    }
  });
});

describe("formatEuro", () => {
  it("writes a Dutch price", () => {
    expect(formatEuro(12)).toBe("€ 12,00");
    expect(formatEuro(19.5)).toBe("€ 19,50");
  });

  it("round-trips the cards' own strings", () => {
    for (const bank of ZONNEBANKEN) {
      expect(formatEuro(parseEuro(bank.prijs))).toBe(bank.prijs);
    }
  });
});

describe("schemaPrice", () => {
  it("uses a decimal point and two decimals", () => {
    expect(schemaPrice(12)).toBe("12.00");
    expect(schemaPrice(19.5)).toBe("19.50");
  });
});
