/**
 * The opening hours, once — as the table shows them and as a machine reads
 * them.
 *
 * The display strings used to be the only copy, which meant the JSON-LD in
 * `layout.tsx` carried a second, hand-typed set that nobody would remember to
 * change. `opens`/`closes` are the same numbers in the 24-hour format
 * schema.org wants, so a change to the studio's hours moves the table, the
 * open/closed dot and the structured data together.
 */

export type OpeningDay = {
  /** Dutch label, as the table shows it. */
  day: string;
  /** Display value: a range, or "Gesloten". */
  hours: string;
  note: string;
  /** English day name, which is what schema.org's `dayOfWeek` expects. */
  schemaDay: string;
  /** 24-hour times. Absent on a closed day. */
  opens?: string;
  closes?: string;
};

export const OPENING_HOURS: OpeningDay[] = [
  { day: "Maandag", hours: "Gesloten", note: "Morgen open om 10:00", schemaDay: "Monday" },
  { day: "Dinsdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00", schemaDay: "Tuesday", opens: "10:00", closes: "21:00" },
  { day: "Woensdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00", schemaDay: "Wednesday", opens: "10:00", closes: "21:00" },
  { day: "Donderdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00", schemaDay: "Thursday", opens: "10:00", closes: "21:00" },
  { day: "Vrijdag", hours: "10:00 – 21:00", note: "na 21:00: Morgen open om 10:00", schemaDay: "Friday", opens: "10:00", closes: "21:00" },
  { day: "Zaterdag", hours: "10:00 – 16:00", note: "na 16:00: Morgen open om 10:00", schemaDay: "Saturday", opens: "10:00", closes: "16:00" },
  { day: "Zondag", hours: "10:00 – 16:00", note: "na 16:00: Dinsdag open om 10:00", schemaDay: "Sunday", opens: "10:00", closes: "16:00" },
];

export type OpeningHoursGroup = { label: string; hours: string };

/**
 * Runs of days that share the same hours, as "Dinsdag t/m vrijdag" rather than
 * four identical lines.
 *
 * The contact block shows this shorter form: seven rows there would dwarf the
 * address next to it, and three lines is all a visitor — or a crawler pulling
 * "hoe laat is Ever Sun open" out of the page — needs. The full table stays in
 * the overlay. Grouping instead of a second hand-written list, so the short
 * form cannot fall behind the long one.
 */
export function groupOpeningHours(days: OpeningDay[] = OPENING_HOURS): OpeningHoursGroup[] {
  const groups: OpeningHoursGroup[] = [];
  let run: OpeningDay[] = [];

  const flush = () => {
    if (run.length === 0) return;
    const first = run[0].day;
    const last = run[run.length - 1].day.toLowerCase();
    const label =
      run.length === 1 ? first : run.length === 2 ? `${first} & ${last}` : `${first} t/m ${last}`;
    groups.push({ label, hours: run[0].hours });
    run = [];
  };

  for (const day of days) {
    if (run.length > 0 && run[0].hours !== day.hours) flush();
    run.push(day);
  }
  flush();

  return groups;
}
