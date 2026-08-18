# Ever Sun livegang-checklist

Dit is het operationele geheugen voor de verhuizing van de Ever Sun-website
naar Cloudflare Workers. Lees dit document volledig voordat DNS of een Custom
Domain wordt gewijzigd.

Laatst gecontroleerd: 14 augustus 2026.

## Gewenste eindsituatie

- De Worker `ever-sun` serveert de website.
- `https://www.eversun-assen.nl` is het canonieke webadres.
- `https://eversun-assen.nl` stuurt permanent door naar de `www`-variant.
- Beide hostnames hebben een geldig, door Cloudflare beheerd TLS-certificaat.
- Facebook, WhatsApp, LinkedIn en X kunnen de Open Graph-afbeelding ophalen.
- E-mail via Yourfilter blijft zonder onderbreking werken.

De huidige Worker-test-URL is:
`https://ever-sun.ever-sun.workers.dev`.

## Huidige DNS-situatie

Op 14 augustus 2026 wees het domein nog naar Yourhosting/Plesk.

Authoritative nameservers:

- `ns215.premiumdns-yourhosting.nl`
- `ns221.premiumdns-yourhosting.eu`
- `ns66.premiumdns-yourhosting.net`

Bekende mailrecords:

- MX-prioriteit 10: `primary.yourfilter.nl`
- MX-prioriteit 20: `fallback.yourfilter.nl`
- SPF: `v=spf1 include:_spf.yourfilter.nl mx a ~all`

DNSSEC is actief. Er stond een DS-record gepubliceerd. Verander de
nameservers daarom niet terwijl de oude DNSSEC-koppeling nog actief is.

De publieke DNS-controle vond geen DMARC-record. Controleer het volledige
Yourhosting DNS-overzicht alsnog op DKIM, DMARC, verificatie-TXT-records en
mail-subdomeinen; een publieke momentopname is geen volledige inventarisatie.

## Voorbereiding — nog niets omschakelen

1. Voeg `eversun-assen.nl` als zone toe aan het juiste Cloudflare-account.
2. Exporteer of fotografeer het volledige DNS-overzicht bij Yourhosting.
3. Laat Cloudflare de bestaande records scannen.
4. Vergelijk daarna record voor record met Yourhosting. Neem minstens MX, SPF,
   DKIM, DMARC, verificatie-records en eventuele `mail`/`webmail`-records over.
5. Zet mailgerelateerde A-, AAAA- en CNAME-records op **DNS only**, tenzij de
   mailprovider expliciet iets anders voorschrijft.
6. Controleer dat de laatste versie van `main` naar de Worker is gedeployed en
   dat homepage, huidtest, contactformulier en de statische social image via de
   `workers.dev`-URL status 200 geven.
7. Houd de oude Plesk-site actief tijdens de migratie en propagatie.

## Omschakeling

1. Schakel DNSSEC bij Yourhosting tijdelijk uit en controleer dat het oude
   DS-record bij de registry is verdwenen.
2. Vervang bij Yourhosting de drie nameservers door de twee nameservers die
   Cloudflare specifiek aan deze zone heeft toegewezen.
3. Wacht totdat Cloudflare de zone als **Active** toont. Dit kan snel gaan,
   maar houd rekening met maximaal 24 uur.
4. Koppel in Cloudflare onder Worker `ever-sun` → Settings → Domains & Routes
   de volgende exacte Custom Domains:
   - `www.eversun-assen.nl`
   - `eversun-assen.nl`
5. Laat Cloudflare de bijbehorende DNS-records en TLS-certificaten aanmaken.
   Een conflicterend bestaand A-, AAAA- of CNAME-record moet mogelijk eerst
   worden vervangen; controleer altijd het exacte hostname-target.
6. Maak een permanente redirect van de apex (`eversun-assen.nl`) naar
   `https://www.eversun-assen.nl`, met behoud van pad en querystring.
7. Controleer pas daarna de website via beide hostnames.

`wrangler.jsonc` bevatte op 14 augustus 2026 nog geen Custom Domain-routes.
Voeg die tijdens de livegang bewust toe via Wrangler óf via het Cloudflare-
dashboard; DNS wijzigen zonder Worker-koppeling is niet voldoende.

## Directe controles na omschakeling

Controleer minimaal:

- Homepage en alle secties op desktop en mobiel.
- Huidtest openen, doorlopen, resultaat delen en afspraakoverlay openen.
- Contactformulier verzenden en ontvangst van het bericht bevestigen.
- Inkomende én uitgaande e-mail op het domein.
- `http://` stuurt door naar `https://`.
- Apex stuurt met 301/308 door naar `www`, inclusief pad en querystring.
- SSL-certificaten zijn geldig voor beide hostnames.
- `/robots.txt` en `/sitemap.xml` geven status 200.
- `/social/ever-sun-share-1200x630.png` geeft status 200 en `image/png`.
- Homepage en `/huidtest` bevatten `og:image`, afmetingen 1200×630,
  `og:image:alt` en `twitter:card=summary_large_image`.
- Gebruik Facebook Sharing Debugger en kies **Scrape Again** om oude previews
  uit de Facebook-cache te verwijderen.

### AI-crawlers: robots.txt is niet het enige gate

`robots.txt` staat GPTBot, ClaudeBot, PerplexityBot e.a. expliciet toe (zie
`src/app/robots.ts`), maar Cloudflare kan die crawlers al blokkeren vóórdat
de request `robots.txt` bereikt. Dat gebeurt buiten de applicatiecode om en is
dus met geen enkele lokale of `workers.dev`-test te zien — pas te controleren
zodra het echte domein op Cloudflare draait.

1. Cloudflare-dashboard, zone `eversun-assen.nl`:
   - **Security → Bots**: check of "Block AI Bots" aanstaat, ook als
     onderdeel van een preset die niet bewust is aangezet.
   - **Security → WAF → Custom rules**: een losse regel die op user-agent
     filtert (bv. bevat "GPTBot" → Block) zit hier, niet bij Bots.
   - **Security → Settings**: Bot Fight Mode / Security Level kan agressief
     user-agents weigeren zonder een expliciete AI-regel.
2. Test met echte crawler-user-agents:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)" https://www.eversun-assen.nl/
   curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://www.anthropic.com/claudebot)" https://www.eversun-assen.nl/
   curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)" https://www.eversun-assen.nl/
   ```
   200 = doorgelaten. 403, of een Cloudflare-uitdagingspagina in de body
   (`curl -s ... | head -50`), betekent geblokkeerd ondanks een toestemmende
   `robots.txt`.

Na een geslaagde controle mag de social image-URL desgewenst van de
`workers.dev`-URL naar de canonieke `www`-URL worden gezet. Functioneel is dat
niet noodzakelijk; de absolute Worker-URL is juist tijdens de migratie
betrouwbaar.

## DNSSEC afronden

1. Activeer DNSSEC in Cloudflare.
2. Plaats de nieuwe Cloudflare DS-gegevens bij Yourhosting als registrar.
3. Controleer extern dat alleen het nieuwe DS-record gepubliceerd is en het
   domein via meerdere resolvers correct blijft werken.

## Stop- en rollbackcriteria

- Stop vóór de nameserverwijziging als niet alle mailrecords bekend zijn.
- Stop als DNSSEC niet aantoonbaar uit staat bij de oude provider.
- Verwijder of overschrijf nooit mailrecords om een webrecordconflict op te
  lossen.
- Bij een ernstig probleem: houd Cloudflare en Plesk intact, herstel zo nodig
  de oude Yourhosting-nameservers en laat DNSSEC uit totdat DNS opnieuw stabiel
  resolveert. Houd rekening met DNS-cache en propagatietijd.

## Officiële referenties

- Cloudflare Workers Custom Domains:
  https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Cloudflare full DNS setup en nameservermigratie:
  https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/
