"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CONTACT_FIELD_IDS,
  EMPTY_CONTACT_VALUES,
  firstInvalidField,
  hasErrors,
  validateContactForm,
  type ContactErrors,
  type ContactField,
  type ContactValues,
} from "@/lib/contact-validation";

export type ContactStatus = "idle" | "submitting" | "success" | "error";

const GENERIC_ERROR =
  "Versturen lukte niet. Probeer het zo nog eens, of bel ons gewoon even.";

/**
 * State for the contact form: values, when to show which error, and the POST.
 *
 * Errors are computed from the current values on every render (validation is
 * pure and cheap) but only *shown* once a field has been blurred or the form
 * has been submitted — nagging about an empty field the visitor hasn't reached
 * yet is the classic way to make a short form feel hostile.
 */
export function useContactForm() {
  const [values, setValues] = useState<ContactValues>(EMPTY_CONTACT_VALUES);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  // Bots fill every field they find; humans never see this one.
  const [honeypot, setHoneypot] = useState("");

  const errors = useMemo(() => validateContactForm(values), [values]);

  const visibleErrors = useMemo<ContactErrors>(() => {
    if (submitAttempted) return errors;
    const shown: ContactErrors = {};
    for (const field of Object.keys(errors) as ContactField[]) {
      if (touched[field]) shown[field] = errors[field];
    }
    return shown;
  }, [errors, touched, submitAttempted]);

  const setField = useCallback((field: ContactField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // A failed send is stale the moment the visitor edits something.
    setStatus((prev) => (prev === "error" ? "idle" : prev));
  }, []);

  const blurField = useCallback((field: ContactField) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(EMPTY_CONTACT_VALUES);
    setTouched({});
    setSubmitAttempted(false);
    setFormError(null);
    setHoneypot("");
    setStatus("idle");
  }, []);

  const submit = useCallback(async () => {
    setSubmitAttempted(true);

    const invalid = firstInvalidField(errors);
    if (invalid) {
      setStatus("idle");
      setFormError(null);
      document.getElementById(CONTACT_FIELD_IDS[invalid])?.focus();
      return;
    }

    setStatus("submitting");
    setFormError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setFormError(
          (body && typeof body.message === "string" ? body.message : null) ?? GENERIC_ERROR,
        );
        setStatus("error");
        return;
      }

      setValues(EMPTY_CONTACT_VALUES);
      setTouched({});
      setSubmitAttempted(false);
      setHoneypot("");
      setStatus("success");
    } catch {
      // Offline, DNS failure, request blocked — nothing the visitor can fix by
      // retrying the same second, so point them at the phone as well.
      setFormError(GENERIC_ERROR);
      setStatus("error");
    }
  }, [errors, values, honeypot]);

  return {
    values,
    errors: visibleErrors,
    isValid: !hasErrors(errors),
    status,
    formError,
    honeypot,
    setHoneypot,
    setField,
    blurField,
    submit,
    reset,
  };
}
