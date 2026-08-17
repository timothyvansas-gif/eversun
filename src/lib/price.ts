/**
 * The prices on the cards are display strings — "€ 18,00", with a comma, the
 * way a Dutch price is written. schema.org wants "18.00", and the FAQ wants to
 * say "van € 12,00 tot € 19,50" without a second list of numbers to keep in
 * step.
 *
 * Both read the card's own string through here, so there is still one price per
 * bank and it lives where the bank is described.
 */

/** "€ 18,00" → 18. Returns NaN if the string holds no number. */
export function parseEuro(price: string): number {
  const digits = price.replace(/[^\d,.-]/g, "").replace(",", ".");
  return digits === "" ? NaN : Number(digits);
}

/** 18 → "€ 18,00". The comma and the space match the cards. */
export function formatEuro(amount: number): string {
  return `€ ${amount.toFixed(2).replace(".", ",")}`;
}

/** 18 → "18.00", the decimal form schema.org's `price` expects. */
export function schemaPrice(amount: number): string {
  return amount.toFixed(2);
}
