import { describe, it, expect } from "vitest";
import { buildSiteJsonLd, buildFaqJsonLd } from "./structured-data";
import { ZONNEBANKEN } from "@/data/zonnebanken-data";
import { FAQ } from "@/data/faq-data";
import { BASE_URL, FAQ_URL } from "@/lib/site";

type Node = Record<string, unknown>;

const graph = () => buildSiteJsonLd()["@graph"] as Node[];
const nodeOfType = (type: string) => graph().find((node) => node["@type"] === type) as Node;

describe("buildSiteJsonLd", () => {
  it("serialises to JSON without cycles or undefined leaks", () => {
    const json = JSON.stringify(buildSiteJsonLd());
    expect(json).not.toContain("undefined");
    expect(json).not.toContain("NaN");
  });

  it("names a studio and a website", () => {
    expect(graph().map((node) => node["@type"])).toEqual(["BeautySalon", "WebSite"]);
  });

  // The answers are in a panel on the homepage, rendered on click. Markup for
  // text a crawler cannot find is a mismatch, so the FAQ graph belongs on
  // /veelgestelde-vragen, where the same list is plain HTML.
  it("leaves the FAQ to its own page", () => {
    expect(JSON.stringify(buildSiteJsonLd())).not.toContain("FAQPage");
  });

  it("lets the other nodes reference the studio by the id it actually declares", () => {
    const studioId = nodeOfType("BeautySalon")["@id"];
    expect(nodeOfType("WebSite").publisher).toEqual({ "@id": studioId });

    const providers = (nodeOfType("BeautySalon").hasOfferCatalog as Node[])
      .flatMap((catalog) => catalog.itemListElement as Node[])
      .map((offer) => (offer.itemOffered as Node).provider)
      .filter(Boolean);
    for (const provider of providers) {
      expect(provider).toEqual({ "@id": studioId });
    }
  });

  it("lists six open days and leaves the closed Monday out", () => {
    const spec = nodeOfType("BeautySalon").openingHoursSpecification as Node[];
    expect(spec).toHaveLength(6);
    expect(spec.map((entry) => entry.dayOfWeek)).not.toContain("https://schema.org/Monday");
    expect(spec[0]).toMatchObject({ opens: "10:00", closes: "21:00" });
  });

  it("prices every bank the way the card does, in schema.org's decimal form", () => {
    const catalog = (nodeOfType("BeautySalon").hasOfferCatalog as Node[])[0];
    const offers = catalog.itemListElement as Node[];
    expect(offers).toHaveLength(ZONNEBANKEN.length);
    expect(offers.map((offer) => offer.price)).toEqual(["18.00", "14.00", "19.50", "12.00"]);
    for (const offer of offers) {
      expect(offer.priceCurrency).toBe("EUR");
    }
  });

  // Self-declared review scores on a business's own page are markup Google
  // discounts; the rating lives on the Google listing that `sameAs` points at.
  it("claims no rating of its own", () => {
    expect(JSON.stringify(buildSiteJsonLd())).not.toContain("aggregateRating");
  });

  it("points sameAs at the Google listing and both socials", () => {
    const sameAs = nodeOfType("BeautySalon").sameAs as string[];
    expect(sameAs).toHaveLength(3);
    for (const url of sameAs) expect(url).toMatch(/^https:\/\//);
  });

  it("keeps every url on the canonical domain", () => {
    const urls = JSON.stringify(buildSiteJsonLd()).match(/"url":"([^"]+)"/g) ?? [];
    for (const url of urls) {
      expect(url).toContain(BASE_URL);
    }
  });
});

describe("buildFaqJsonLd", () => {
  it("carries every question and answer over verbatim", () => {
    const questions = buildFaqJsonLd().mainEntity as Node[];
    expect(questions).toHaveLength(FAQ.length);
    expect(questions[0]).toEqual({
      "@type": "Question",
      name: FAQ[0].vraag,
      acceptedAnswer: { "@type": "Answer", text: FAQ[0].antwoord },
    });
  });

  it("sits on the FAQ page and points back at the studio and the site", () => {
    const faq = buildFaqJsonLd();
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.url).toBe(FAQ_URL);
    expect(faq.about).toEqual({ "@id": nodeOfType("BeautySalon")["@id"] });
    expect(faq.isPartOf).toEqual({ "@id": nodeOfType("WebSite")["@id"] });
  });

  it("is a document of its own, so it needs its own context", () => {
    expect(buildFaqJsonLd()["@context"]).toBe("https://schema.org");
  });
});
