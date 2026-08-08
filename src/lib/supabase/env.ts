/**
 * Reads the Supabase connection settings from the environment.
 *
 * Same principle as the contact form: keys live in env vars, never in source.
 * Moving from a local project to the live one is a config change, not a code
 * change. See README ("Planomgeving instellen").
 *
 * The publishable key is safe to ship to the browser — it only grants what Row
 * Level Security allows. The secret key is not, and is read separately by
 * server-only code.
 */

export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

class MissingSupabaseEnvError extends Error {
  constructor(names: string[]) {
    super(
      `Supabase is niet ingesteld: ${names.join(" en ")} ontbreekt. ` +
        `Vul de waarden in .env.local in (zie .env.example) en herstart de dev-server.`,
    );
    this.name = "MissingSupabaseEnvError";
  }
}

/**
 * Both values must be referenced as full `process.env.X` expressions rather
 * than looked up dynamically: Next.js inlines `NEXT_PUBLIC_*` at build time by
 * literal text match, so `process.env[name]` would come back undefined in the
 * browser bundle.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (missing.length > 0) throw new MissingSupabaseEnvError(missing);

  return { url: url!, publishableKey: publishableKey! };
}

/**
 * Lets a route or page check for configuration before using it, so a missing
 * key surfaces as a handled error state instead of a crash — the same way the
 * contact route reports `not-configured`.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
