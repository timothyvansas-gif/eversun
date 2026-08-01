import { describe, it, expect } from "vitest";
import { buildContactEmail, escapeHtml, sanitizeHeaderValue } from "./contact-email";

describe("escapeHtml", () => {
  it("neutralises tags so a submitted link can't render in the inbox", () => {
    expect(escapeHtml('<a href="http://evil.test">klik</a>')).toBe(
      "&lt;a href=&quot;http://evil.test&quot;&gt;klik&lt;/a&gt;",
    );
  });

  it("escapes the ampersand first, so entities aren't double-broken", () => {
    expect(escapeHtml("Jansen & Zn <b>")).toBe("Jansen &amp; Zn &lt;b&gt;");
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeHtml("Gewoon een bericht, met komma's.")).toBe(
      "Gewoon een bericht, met komma&#39;s.",
    );
  });
});

describe("sanitizeHeaderValue", () => {
  it("removes newlines used for header injection", () => {
    expect(sanitizeHeaderValue("Timothy\r\nBcc: spam@evil.test")).toBe(
      "Timothy Bcc: spam@evil.test",
    );
  });

  it("collapses runs of whitespace and trims", () => {
    expect(sanitizeHeaderValue("  Aisha   van   Sas  ")).toBe("Aisha van Sas");
  });
});

describe("buildContactEmail", () => {
  const values = {
    name: "Timothy",
    email: "timothyvansas@gmail.com",
    message: "Graag een afspraak.\nKan het donderdag?",
  };

  it("puts the visitor's address in replyTo", () => {
    expect(buildContactEmail(values).replyTo).toBe("timothyvansas@gmail.com");
  });

  it("names the sender in the subject, on one line", () => {
    const { subject } = buildContactEmail({ ...values, name: "Timothy\nvan Sas" });
    expect(subject).toBe("Nieuw bericht via de website — Timothy van Sas");
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it("keeps the plain-text body readable and complete", () => {
    const { text } = buildContactEmail(values);
    expect(text).toContain("Naam:    Timothy");
    expect(text).toContain("E-mail:  timothyvansas@gmail.com");
    expect(text).toContain("Kan het donderdag?");
  });

  it("escapes the message in the HTML body", () => {
    const { html } = buildContactEmail({ ...values, message: "<script>alert(1)</script>" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes the name and address in the HTML body", () => {
    const { html } = buildContactEmail({ ...values, name: '"><img src=x>' });
    expect(html).not.toContain("<img");
  });

  it("trims surrounding whitespace off the message", () => {
    expect(buildContactEmail({ ...values, message: "  hallo  " }).text).toContain("\nhallo\n");
  });
});
