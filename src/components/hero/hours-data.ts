export const HOURS = [
  { day: "Maandag", hours: "Gesloten", note: "Morgen open om 10:00" },
  { day: "Dinsdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00" },
  { day: "Woensdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00" },
  { day: "Donderdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00" },
  { day: "Vrijdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00" },
  { day: "Zaterdag", hours: "10:00 – 16:00", note: "na 16:00: Morgen open om 10:00" },
  { day: "Zondag", hours: "10:00 – 16:00", note: "na 16:00: Dinsdag open om 10:00" },
];

export function getCurrentDayIndex(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
  }).formatToParts(new Date());
  const dayStr = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = WEEKDAYS.indexOf(dayStr);
  return day === 0 ? 6 : day - 1;
}
