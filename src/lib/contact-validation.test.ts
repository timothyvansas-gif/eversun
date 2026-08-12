import { describe, it, expect } from "vitest";
import {
  CONTACT_LIMITS,
  EMPTY_CONTACT_VALUES,
  firstInvalidField,
  hasErrors,
  parseContactValues,
  validateContactField,
  validateContactForm,
  type ContactValues,
} from "./contact-validation";

const VALID: ContactValues = {
  name: "Aisha",
  email: "aisha@eversun-assen.nl",
  message: "Graag een afspraak voor volgende week donderdag.",
};

describe("validateContactField — name", () => {
  it("requires a value", () => {
    expect(validateContactField("name", "")).toBe("Vul je naam in.");
    expect(validateContactField("name", "   ")).toBe("Vul je naam in.");
  });

  it("rejects a single character", () => {
    expect(validateContactField("name", "A")).toBe("Je naam is te kort.");
  });

  it("rejects names past the max length", () => {
    expect(validateContactField("name", "a".repeat(CONTACT_LIMITS.nameMax))).toBeUndefined();
    expect(validateContactField("name", "a".repeat(CONTACT_LIMITS.nameMax + 1))).toBeDefined();
  });

  it("accepts a normal name", () => {
    expect(validateContactField("name", "Timothy")).toBeUndefined();
  });
});

describe("validateContactField — email", () => {
  it("requires a value", () => {
    expect(validateContactField("email", "  ")).toBe("Vul je e-mailadres in.");
  });

  it.each([
    "geen-email",
    "mist@tld",
    "twee@@apenstaartjes.nl",
    "spatie in@adres.nl",
    "@eversun-assen.nl",
    "info@.nl",
  ])("rejects %s", (value) => {
    expect(validateContactField("email", value)).toBe("Dit lijkt geen geldig e-mailadres.");
  });

  it.each([
    "info@eversun-assen.nl",
    "voor.naam+tag@sub.domein.co.uk",
    "  padded@example.com  ",
  ])("accepts %s", (value) => {
    expect(validateContactField("email", value)).toBeUndefined();
  });

  it("rejects addresses past the max length", () => {
    const long = `${"a".repeat(CONTACT_LIMITS.emailMax)}@example.com`;
    expect(validateContactField("email", long)).toBe("Dit e-mailadres is te lang.");
  });
});

describe("validateContactField — message", () => {
  it("requires a value", () => {
    expect(validateContactField("message", "")).toBe("Vul je bericht in.");
  });

  it("rejects messages under the minimum", () => {
    expect(validateContactField("message", "a".repeat(CONTACT_LIMITS.messageMin - 1))).toBeDefined();
    expect(validateContactField("message", "a".repeat(CONTACT_LIMITS.messageMin))).toBeUndefined();
  });

  it("counts trimmed length, so whitespace can't pad a message to valid", () => {
    expect(validateContactField("message", `  ${" ".repeat(20)}  `)).toBe("Vul je bericht in.");
  });

  it("rejects messages past the maximum", () => {
    expect(validateContactField("message", "a".repeat(CONTACT_LIMITS.messageMax + 1))).toBeDefined();
  });
});

describe("validateContactForm", () => {
  it("returns no errors for valid values", () => {
    const errors = validateContactForm(VALID);
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it("reports every empty field at once", () => {
    const errors = validateContactForm(EMPTY_CONTACT_VALUES);
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
    expect(hasErrors(errors)).toBe(true);
  });

  it("reports only the invalid field", () => {
    const errors = validateContactForm({ ...VALID, email: "kapot" });
    expect(errors.email).toBeDefined();
    expect(errors.name).toBeUndefined();
    expect(errors.message).toBeUndefined();
  });
});

describe("firstInvalidField", () => {
  it("follows render order, not object key order", () => {
    expect(firstInvalidField(validateContactForm(EMPTY_CONTACT_VALUES))).toBe("name");
    expect(firstInvalidField(validateContactForm({ ...VALID, message: "" }))).toBe("message");
    expect(firstInvalidField(validateContactForm({ ...VALID, email: "x", message: "" }))).toBe("email");
  });

  it("returns undefined when everything is valid", () => {
    expect(firstInvalidField(validateContactForm(VALID))).toBeUndefined();
  });
});

describe("parseContactValues", () => {
  it("keeps string fields", () => {
    expect(parseContactValues(VALID)).toEqual(VALID);
  });

  it("coerces missing, null and non-string fields to empty strings", () => {
    expect(parseContactValues({ name: 42, email: null, extra: "genegeerd" })).toEqual(
      EMPTY_CONTACT_VALUES,
    );
  });

  it("survives a non-object body", () => {
    expect(parseContactValues(null)).toEqual(EMPTY_CONTACT_VALUES);
    expect(parseContactValues("string")).toEqual(EMPTY_CONTACT_VALUES);
    expect(parseContactValues(undefined)).toEqual(EMPTY_CONTACT_VALUES);
  });

  it("produces values that fail validation rather than throwing", () => {
    expect(hasErrors(validateContactForm(parseContactValues({})))).toBe(true);
  });
});
