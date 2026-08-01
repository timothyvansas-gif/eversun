import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/contact-email";
import { hasErrors, parseContactValues, validateContactForm } from "@/lib/contact-validation";

// Reads the request body per call; nothing to prerender or cache.
export const dynamic = "force-dynamic";

const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 } as const;

// A legitimate submission is a name, an address and at most 2000 characters, so
// well under 10 KB. 64 KB leaves room for multi-byte characters and still means
// a junk payload is refused before it is parsed into memory. Chunked requests
// send no Content-Length; those fall through to validation, which caps the
// message at 2000 characters anyway.
const MAX_BODY_BYTES = 64 * 1024;

// Best-effort throttle. In-memory, so it resets on deploy and is per-instance —
// enough to stop a single script hammering the form, not a substitute for a
// shared store if this ever runs on more than one instance.
const hits = new Map<string, number[]>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < RATE_LIMIT.windowMs);

  if (recent.length >= RATE_LIMIT.max) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Drop keys that have aged out, so a long-running instance doesn't grow the
  // map forever.
  if (hits.size > 500) {
    for (const [entry, times] of hits) {
      if (times.every((at) => now - at >= RATE_LIMIT.windowMs)) hits.delete(entry);
    }
  }

  return false;
}

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json(
      { ok: false, message: "Je hebt net al een bericht gestuurd. Probeer het straks nog eens." },
      { status: 429 },
    );
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, message: "Dit bericht is te groot." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Ongeldig verzoek." }, { status: 400 });
  }

  // Honeypot: a real visitor never sees this field, so anything in it is a bot.
  // Answer 200 anyway — telling the bot it was caught only helps it retune.
  const honeypot = (body as Record<string, unknown> | null)?.website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // The client validates too, but that check is advisory — this is the one that
  // decides what reaches the inbox.
  const values = parseContactValues(body);
  const errors = validateContactForm(values);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { ok: false, message: "Controleer je gegevens en probeer het opnieuw.", errors },
      { status: 400 },
    );
  }

  const sent = await sendContactEmail(values);

  if (!sent.ok) {
    // Never answer 200 here. The form shows "Bericht verstuurd" on success, and
    // a visitor who is told their message arrived will not try again — so a
    // silent failure costs the studio the lead entirely.
    console.error(`[contact] versturen mislukt (${sent.reason}): ${sent.detail}`);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Versturen lukt op dit moment niet. Bel ons gerust even op 06 25 30 64 91, dat gaat ook prima.",
      },
      { status: sent.reason === "not-configured" ? 503 : 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
