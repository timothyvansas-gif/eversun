import { describe, it, expect } from "vitest";
import { resolveNavTarget } from "./use-scroll-nav";
import { NAV_ITEMS } from "@/lib/nav-items";

describe("resolveNavTarget", () => {
  it("uses explicit SECTION_MAP entries", () => {
    expect(resolveNavTarget("Studio")).toBe("#waarom");
    expect(resolveNavTarget("Over ons")).toBe("#over-ons");
  });

  it("slugifies unmapped labels", () => {
    expect(resolveNavTarget("Banken")).toBe("#banken");
    expect(resolveNavTarget("Producten")).toBe("#producten");
    expect(resolveNavTarget("Contact")).toBe("#contact");
  });

  it("replaces every space, not just the first", () => {
    expect(resolveNavTarget("Foo Bar Baz")).toBe("#foo-bar-baz");
  });

  it("resolves every real nav item to a non-empty anchor", () => {
    for (const item of NAV_ITEMS) {
      const target = resolveNavTarget(item);
      expect(target.startsWith("#")).toBe(true);
      expect(target.length).toBeGreaterThan(1);
    }
  });
});
