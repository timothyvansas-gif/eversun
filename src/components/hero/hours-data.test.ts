import { describe, it, expect } from "vitest";
import { HOURS, getCurrentDayIndex } from "./hours-data";

// UTC instants; comments give the Europe/Amsterdam wall-clock they map to.
// July = CEST (UTC+2). getCurrentDayIndex returns a Monday=0 .. Sunday=6 index.
const utc = (iso: string) => new Date(iso);

describe("getCurrentDayIndex", () => {
  it("maps Monday to 0 and Sunday to 6", () => {
    expect(getCurrentDayIndex(utc("2026-07-06T10:00:00Z"))).toBe(0); // Mon
    expect(getCurrentDayIndex(utc("2026-07-07T10:00:00Z"))).toBe(1); // Tue
    expect(getCurrentDayIndex(utc("2026-07-08T10:00:00Z"))).toBe(2); // Wed
    expect(getCurrentDayIndex(utc("2026-07-09T10:00:00Z"))).toBe(3); // Thu
    expect(getCurrentDayIndex(utc("2026-07-10T10:00:00Z"))).toBe(4); // Fri
    expect(getCurrentDayIndex(utc("2026-07-11T10:00:00Z"))).toBe(5); // Sat
    expect(getCurrentDayIndex(utc("2026-07-12T10:00:00Z"))).toBe(6); // Sun
  });

  it("uses the Amsterdam day, not UTC (late-night rollover)", () => {
    // UTC Sun 2026-07-12 22:30 == Amsterdam Mon 2026-07-13 00:30 -> index 0
    expect(getCurrentDayIndex(utc("2026-07-12T22:30:00Z"))).toBe(0);
  });

  it("returns an index that is a valid entry in HOURS", () => {
    const i = getCurrentDayIndex(utc("2026-07-12T10:00:00Z"));
    expect(HOURS[i].day).toBe("Zondag");
  });
});
