export type StudioStatus = { isOpen: boolean; label: string };

/**
 * Current open/closed status of the studio, evaluated in the Europe/Amsterdam
 * timezone so it is correct regardless of the visitor's own clock.
 *
 * Hours: Mon closed · Tue–Fri 10:00–21:00 · Sat & Sun 10:00–16:00.
 */
export function getStudioStatus(now: Date = new Date()): StudioStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayStr = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const day = WEEKDAYS.indexOf(dayStr);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;

  if (day === 1) {
    return { isOpen: false, label: "Morgen open om 10:00u" };
  }

  if (day >= 2 && day <= 5) {
    if (hour < 10) return { isOpen: false, label: "Geopend om 10:00u" };
    if (hour < 21) return { isOpen: true, label: "Geopend tot 21:00u" };
    return { isOpen: false, label: "Morgen open om 10:00u" };
  }

  if (day === 6) {
    if (hour < 10) return { isOpen: false, label: "Geopend om 10:00u" };
    if (hour < 16) return { isOpen: true, label: "Geopend tot 16:00u" };
    return { isOpen: false, label: "Morgen open om 10:00u" };
  }

  // Sunday
  if (hour < 10) return { isOpen: false, label: "Geopend om 10:00u" };
  if (hour < 16) return { isOpen: true, label: "Geopend tot 16:00u" };
  return { isOpen: false, label: "Dinsdag open om 10:00u" };
}
