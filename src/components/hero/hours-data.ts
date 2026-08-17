import { OPENING_HOURS } from "@/lib/opening-hours";

/**
 * The hours table's own view of the schedule. The data itself moved to
 * `@/lib/opening-hours`, where the structured data in `layout.tsx` can reach it
 * too; this stays the shape the overlay already renders.
 */
export const HOURS = OPENING_HOURS;

export function getCurrentDayIndex(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
  }).formatToParts(now);
  const dayStr = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = WEEKDAYS.indexOf(dayStr);
  return day === 0 ? 6 : day - 1;
}
