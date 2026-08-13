import { QUESTIONS } from "@/lib/huidtest/config";
import { skipsKleurstijl } from "@/lib/huidtest/decide";
import type { QuizAnswers } from "@/lib/huidtest/types";

/**
 * The answers as one query parameter, so a result can be reloaded, bookmarked
 * or sent to someone.
 *
 * The answers travel, not the advice: the rules may be tuned next month, and a
 * link that outlived a rule change should show what the studio advises now
 * rather than what it advised then. It also keeps the reasoning rebuildable —
 * the why-line is a function of the answers, not of the bank.
 *
 * Positional and unpadded, because it ends up in a URL people paste into
 * WhatsApp: `?a=type3.soms.snel.normaal.0.direct`.
 */

export const SHARE_PARAM = "a";

const OPTION_IDS = Object.fromEntries(
  QUESTIONS.map((q) => [q.key, q.options.map((o) => o.id as string)]),
) as Record<(typeof QUESTIONS)[number]["key"], string[]>;

/** Stands in for kleurstijl when the question was skipped. */
const GEEN_KLEURSTIJL = "x";

export function encodeAnswers(a: QuizAnswers): string {
  return [
    a.huidreactie,
    a.ervaring,
    a.doel,
    a.huidgevoel,
    a.tattoo ? "1" : "0",
    a.kleurstijl ?? GEEN_KLEURSTIJL,
  ].join(".");
}

/**
 * Rebuild the answers from the parameter, or null for anything that does not
 * parse — a truncated paste, a hand-edited value, an older format. The caller
 * starts the quiz normally on null; there is nothing to explain to someone who
 * followed a broken link, and a half-decoded answer set would advise on
 * guesses.
 */
export function decodeAnswers(value: string | null | undefined): QuizAnswers | null {
  if (!value) return null;

  const parts = value.split(".");
  if (parts.length !== 6) return null;

  const [huidreactie, ervaring, doel, huidgevoel, tattoo, kleurstijl] = parts;

  if (!OPTION_IDS.huidreactie.includes(huidreactie)) return null;
  if (!OPTION_IDS.ervaring.includes(ervaring)) return null;
  if (!OPTION_IDS.doel.includes(doel)) return null;
  if (!OPTION_IDS.huidgevoel.includes(huidgevoel)) return null;
  if (tattoo !== "0" && tattoo !== "1") return null;

  const answers = {
    huidreactie,
    ervaring,
    doel,
    huidgevoel,
    tattoo: tattoo === "1",
  } as QuizAnswers;

  // A sensitive skin never sees question 5, so a link claiming an answer to it
  // is inconsistent with itself — and a link missing one for any other skin is
  // incomplete. Either way there is no honest advice to rebuild.
  if (skipsKleurstijl(answers.huidgevoel)) {
    if (kleurstijl !== GEEN_KLEURSTIJL) return null;
    return answers;
  }

  if (!OPTION_IDS.kleurstijl.includes(kleurstijl)) return null;
  return { ...answers, kleurstijl: kleurstijl as QuizAnswers["kleurstijl"] };
}

export function shareHref(path: string, a: QuizAnswers): string {
  return `${path}?${SHARE_PARAM}=${encodeAnswers(a)}`;
}
