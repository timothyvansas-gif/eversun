import { describe, it, expect } from "vitest";
import { OPENING_HOURS, groupOpeningHours } from "./opening-hours";

describe("OPENING_HOURS", () => {
  it("covers all seven days", () => {
    expect(OPENING_HOURS).toHaveLength(7);
  });

  it("gives every open day a machine-readable range, and the closed day none", () => {
    for (const day of OPENING_HOURS) {
      if (day.hours === "Gesloten") {
        expect(day.opens, day.day).toBeUndefined();
        expect(day.closes, day.day).toBeUndefined();
      } else {
        expect(day.hours, day.day).toBe(`${day.opens} – ${day.closes}`);
      }
    }
  });
});

describe("groupOpeningHours", () => {
  it("collapses runs of identical days", () => {
    expect(groupOpeningHours()).toEqual([
      { label: "Maandag", hours: "Gesloten" },
      { label: "Dinsdag t/m vrijdag", hours: "10:00 – 21:00" },
      { label: "Zaterdag & zondag", hours: "10:00 – 16:00" },
    ]);
  });

  it("writes a pair with & and a longer run with t/m", () => {
    const days = OPENING_HOURS.slice(0, 3).map((day, i) => ({ ...day, hours: i === 0 ? "A" : "B" }));
    expect(groupOpeningHours(days)).toEqual([
      { label: "Maandag", hours: "A" },
      { label: "Dinsdag & woensdag", hours: "B" },
    ]);
  });

  it("does not merge two runs that are separated by a different day", () => {
    const days = OPENING_HOURS.map((day, i) => ({ ...day, hours: i === 3 ? "Gesloten" : day.hours }));
    const labels = groupOpeningHours(days).map((group) => group.label);
    expect(labels).toEqual([
      "Maandag",
      "Dinsdag & woensdag",
      "Donderdag",
      "Vrijdag",
      "Zaterdag & zondag",
    ]);
  });
});
