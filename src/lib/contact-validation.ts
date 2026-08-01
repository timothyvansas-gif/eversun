/**
 * Validation rules for the contact form. Pure and framework-free on purpose:
 * the same module runs in the browser (instant feedback while typing) and in
 * the API route (the only check that actually protects the inbox, since a
 * client can post whatever it likes).
 */

export type ContactValues = {
  name: string;
  email: string;
  message: string;
};

export type ContactField = keyof ContactValues;

export type ContactErrors = Partial<Record<ContactField, string>>;

export const EMPTY_CONTACT_VALUES: ContactValues = {
  name: "",
  email: "",
  message: "",
};

/** Field order used for rendering and for focusing the first invalid field. */
export const CONTACT_FIELDS: readonly ContactField[] = ["name", "email", "message"] as const;

/** DOM ids, shared so the form markup and the focus-first-error logic agree. */
export const CONTACT_FIELD_IDS: Record<ContactField, string> = {
  name: "contact-naam",
  email: "contact-email",
  message: "contact-bericht",
};

export const CONTACT_LIMITS = {
  nameMax: 80,
  emailMax: 254,
  messageMin: 10,
  messageMax: 2000,
} as const;

// Deliberately permissive: "something@something.tld" with no whitespace. Strict
// RFC 5322 patterns reject valid addresses and still can't prove deliverability,
// so the only real test is whether a reply arrives.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function validateName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return "Vul je naam in.";
  if (name.length < 2) return "Je naam is te kort.";
  if (name.length > CONTACT_LIMITS.nameMax) return `Maximaal ${CONTACT_LIMITS.nameMax} tekens.`;
  return undefined;
}

function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Vul je e-mailadres in.";
  if (email.length > CONTACT_LIMITS.emailMax) return "Dit e-mailadres is te lang.";
  if (!EMAIL_PATTERN.test(email)) return "Dit lijkt geen geldig e-mailadres.";
  return undefined;
}

function validateMessage(value: string): string | undefined {
  const message = value.trim();
  if (!message) return "Schrijf even je bericht.";
  if (message.length < CONTACT_LIMITS.messageMin) {
    return `Nog even iets meer graag (minimaal ${CONTACT_LIMITS.messageMin} tekens).`;
  }
  if (message.length > CONTACT_LIMITS.messageMax) {
    return `Maximaal ${CONTACT_LIMITS.messageMax} tekens.`;
  }
  return undefined;
}

const VALIDATORS: Record<ContactField, (value: string) => string | undefined> = {
  name: validateName,
  email: validateEmail,
  message: validateMessage,
};

export function validateContactField(field: ContactField, value: string): string | undefined {
  return VALIDATORS[field](value);
}

/** All errors for the current values. An empty object means the form is valid. */
export function validateContactForm(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of CONTACT_FIELDS) {
    const error = VALIDATORS[field](values[field]);
    if (error) errors[field] = error;
  }
  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return CONTACT_FIELDS.some((field) => errors[field] !== undefined);
}

/** First invalid field in render order, so focus lands where the eye already is. */
export function firstInvalidField(errors: ContactErrors): ContactField | undefined {
  return CONTACT_FIELDS.find((field) => errors[field] !== undefined);
}

/**
 * Narrows an unknown JSON body to ContactValues. Missing or non-string fields
 * become "" so they fail validation with a normal message instead of throwing.
 */
export function parseContactValues(body: unknown): ContactValues {
  const source = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const read = (key: ContactField) => (typeof source[key] === "string" ? source[key] : "");
  return {
    name: read("name"),
    email: read("email"),
    message: read("message"),
  };
}
