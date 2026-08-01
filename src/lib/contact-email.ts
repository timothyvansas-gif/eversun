import type { ContactValues } from "@/lib/contact-validation";

/**
 * Turns a validated submission into an email and hands it to Resend.
 *
 * Sender, recipient and API key all come from environment variables, so moving
 * from a test inbox to the studio's real inbox is a config change — no code
 * edit, no deploy of new logic. See README ("Contactformulier instellen").
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "provider-error"; detail: string };

/**
 * Escapes text before it goes into the HTML version of the email. A message
 * body is attacker-controlled input, and some mail clients render HTML: without
 * this, a submitted `<a href="...">` would arrive as a working link in the
 * studio's inbox.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Strips CR/LF and collapses whitespace. Newlines in a header value are the
 * classic header-injection trick (a submitted name could otherwise append a
 * Bcc: line), and a subject spanning two lines is malformed regardless.
 */
export function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

export type ContactEmail = {
  subject: string;
  text: string;
  html: string;
  replyTo: string;
};

export function buildContactEmail(values: ContactValues): ContactEmail {
  const name = sanitizeHeaderValue(values.name);
  const email = sanitizeHeaderValue(values.email);
  const message = values.message.trim();

  const text = [
    "Nieuw bericht via het contactformulier op eversun-assen.nl",
    "",
    `Naam:    ${name}`,
    `E-mail:  ${email}`,
    "",
    "Bericht:",
    message,
    "",
    "Antwoorden op deze mail gaat rechtstreeks naar de afzender.",
  ].join("\n");

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#1f1f1e;">
      <p style="margin:0 0 20px;color:#94825c;font-size:13px;">
        Nieuw bericht via het contactformulier op eversun-assen.nl
      </p>
      <p style="margin:0 0 4px;"><strong>Naam:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 20px;"><strong>E-mail:</strong> ${escapeHtml(email)}</p>
      <div style="padding:16px 20px;background:#faf4ec;border-radius:12px;white-space:pre-wrap;">${escapeHtml(
        message,
      )}</div>
      <p style="margin:20px 0 0;color:#94825c;font-size:13px;">
        Antwoorden op deze mail gaat rechtstreeks naar de afzender.
      </p>
    </div>
  `.trim();

  return {
    subject: sanitizeHeaderValue(`Nieuw bericht via de website — ${name}`),
    text,
    html,
    replyTo: email,
  };
}

export async function sendContactEmail(values: ContactValues): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    const missing = [
      !apiKey && "RESEND_API_KEY",
      !to && "CONTACT_TO_EMAIL",
      !from && "CONTACT_FROM_EMAIL",
    ]
      .filter(Boolean)
      .join(", ");
    return { ok: false, reason: "not-configured", detail: `ontbrekende variabelen: ${missing}` };
  }

  const email = buildContactEmail(values);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Replying in the inbox goes to the visitor, not to the sending domain.
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      // Without this the request can hang for the platform's full function
      // timeout, leaving the visitor staring at a spinner.
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        ok: false,
        reason: "provider-error",
        detail: `Resend antwoordde ${response.status}: ${body.slice(0, 300)}`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: "provider-error",
      detail: error instanceof Error ? error.message : "onbekende fout",
    };
  }
}
