/**
 * One seam for product analytics, deliberately empty.
 *
 * The site carries no analytics script today, and adding one is a decision
 * about cookies and consent that a quiz does not get to make on its own. What
 * the quiz can do is call the events at the right moments, so wiring a provider
 * later is one function body rather than an archaeology dig through components.
 *
 * In development the calls are visible in the console, which is also how the
 * flow gets checked without a provider attached.
 */
export type AnalyticsEvent =
  | { name: "huidtest_start"; props: { entry: "home_sectie" | "hero_link" | "direct" } }
  | { name: "huidtest_vraag"; props: { vraag: string; antwoord: string } }
  | { name: "huidtest_exit"; props: { reden: "minor" | "type1" } }
  | { name: "huidtest_resultaat"; props: { bank: string; stand: string | null; product: string } }
  | { name: "huidtest_sachet"; props: { product: string; aan: boolean } }
  | { name: "huidtest_cta"; props: { type: "whatsapp" | "opnieuw"; sachet: boolean } };

export function trackEvent<E extends AnalyticsEvent>(name: E["name"], props: E["props"]): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", name, props);
  }
}
