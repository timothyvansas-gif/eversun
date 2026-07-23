import { describe, it, expect } from "vitest";
import { getStudioStatus } from "./studio-status";

// Helper: build a UTC instant. Comments give the equivalent Europe/Amsterdam
// wall-clock time, which is what the function evaluates against.
// July = CEST (UTC+2): Amsterdam HH:00 == UTC (HH-2):00.
// January = CET (UTC+1): Amsterdam HH:00 == UTC (HH-1):00.
const utc = (iso: string) => new Date(iso);

describe("getStudioStatus", () => {
  describe("Monday — always closed", () => {
    it("is closed regardless of the hour", () => {
      // Amsterdam Mon 2026-07-06 12:00
      expect(getStudioStatus(utc("2026-07-06T10:00:00Z"))).toEqual({
        isOpen: false,
        label: "Morgen open om 10:00u",
      });
      // Amsterdam Mon 2026-07-06 09:00 (before opening hour still closed)
      expect(getStudioStatus(utc("2026-07-06T07:00:00Z")).isOpen).toBe(false);
    });
  });

  describe("Tuesday–Friday — 10:00 to 21:00", () => {
    it("closed before 10:00", () => {
      // Amsterdam Tue 09:00
      expect(getStudioStatus(utc("2026-07-07T07:00:00Z"))).toEqual({
        isOpen: false,
        label: "Geopend om 10:00u",
      });
    });

    it("opens exactly at 10:00", () => {
      // Amsterdam Tue 10:00
      expect(getStudioStatus(utc("2026-07-07T08:00:00Z"))).toEqual({
        isOpen: true,
        label: "Geopend tot 21:00u",
      });
    });

    it("open at 20:00", () => {
      // Amsterdam Tue 20:00
      expect(getStudioStatus(utc("2026-07-07T18:00:00Z")).isOpen).toBe(true);
    });

    it("closes exactly at 21:00", () => {
      // Amsterdam Tue 21:00
      expect(getStudioStatus(utc("2026-07-07T19:00:00Z"))).toEqual({
        isOpen: false,
        label: "Morgen open om 10:00u",
      });
    });

    it("applies to Friday too", () => {
      // Amsterdam Fri 2026-07-10 10:00
      expect(getStudioStatus(utc("2026-07-10T08:00:00Z"))).toEqual({
        isOpen: true,
        label: "Geopend tot 21:00u",
      });
    });
  });

  describe("Saturday — 10:00 to 16:00", () => {
    it("closed before 10:00", () => {
      // Amsterdam Sat 2026-07-11 09:00
      expect(getStudioStatus(utc("2026-07-11T07:00:00Z")).label).toBe("Geopend om 10:00u");
    });

    it("open at 15:00", () => {
      // Amsterdam Sat 15:00
      expect(getStudioStatus(utc("2026-07-11T13:00:00Z"))).toEqual({
        isOpen: true,
        label: "Geopend tot 16:00u",
      });
    });

    it("closes exactly at 16:00", () => {
      // Amsterdam Sat 16:00
      expect(getStudioStatus(utc("2026-07-11T14:00:00Z"))).toEqual({
        isOpen: false,
        label: "Morgen open om 10:00u",
      });
    });
  });

  describe("Sunday — 10:00 to 16:00, next open Tuesday", () => {
    it("closed before 10:00", () => {
      // Amsterdam Sun 2026-07-12 09:00
      expect(getStudioStatus(utc("2026-07-12T07:00:00Z")).label).toBe("Geopend om 10:00u");
    });

    it("open at 15:00", () => {
      // Amsterdam Sun 15:00
      expect(getStudioStatus(utc("2026-07-12T13:00:00Z"))).toEqual({
        isOpen: true,
        label: "Geopend tot 16:00u",
      });
    });

    it("after 16:00 points to Tuesday", () => {
      // Amsterdam Sun 16:00
      expect(getStudioStatus(utc("2026-07-12T14:00:00Z"))).toEqual({
        isOpen: false,
        label: "Dinsdag open om 10:00u",
      });
    });
  });

  describe("timezone correctness", () => {
    it("handles winter time (CET, UTC+1)", () => {
      // Amsterdam Tue 2026-01-06 10:00 -> UTC 09:00 (offset differs from summer)
      expect(getStudioStatus(utc("2026-01-06T09:00:00Z"))).toEqual({
        isOpen: true,
        label: "Geopend tot 21:00u",
      });
    });

    it("a UTC Monday-night instant is already Tuesday in Amsterdam", () => {
      // UTC Mon 2026-07-06 22:30 == Amsterdam Tue 2026-07-07 00:30
      expect(getStudioStatus(utc("2026-07-06T22:30:00Z"))).toEqual({
        isOpen: false,
        label: "Geopend om 10:00u",
      });
    });
  });
});
