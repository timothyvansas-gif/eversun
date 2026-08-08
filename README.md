This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Contactformulier instellen

Het formulier onderaan de site verstuurt e-mail via [Resend](https://resend.com).
Zonder de instellingen hieronder werkt het formulier **niet**: een bezoeker krijgt
dan netjes de melding dat versturen niet lukt, met het telefoonnummer erbij. Hij
krijgt nooit een "verstuurd"-melding terwijl er in werkelijkheid niets aankomt.

### Stap 1: Account en sleutel

1. Maak een gratis account op [resend.com](https://resend.com) met **timothyvansas@gmail.com**.
2. Ga naar **API Keys → Create API Key**, geef hem een naam (bv. "Ever Sun site").
3. Kopieer de sleutel. Hij begint met `re_` en is daarna nooit meer op te vragen,
   dus bewaar hem goed. Kwijt? Maak gewoon een nieuwe aan.

### Stap 2: Sleutel in het project

Maak in de projectmap een bestand `.env.local` (zie `.env.example` als voorbeeld):

```
RESEND_API_KEY=re_jouw_sleutel_hier
CONTACT_TO_EMAIL=timothyvansas@gmail.com
CONTACT_FROM_EMAIL=onboarding@resend.dev
```

Herstart daarna `npm run dev`, want omgevingsvariabelen worden alleen bij het
opstarten ingelezen.

`.env.local` staat in `.gitignore` en komt dus nooit in git of op GitHub terecht.
Dat is de bedoeling: een API-sleutel hoort niet in de broncode.

### Stap 3: Testen

Vul het formulier in op de site. De mail komt binnen op **timothyvansas@gmail.com**.
Klik je in je mailprogramma op "Beantwoorden", dan gaat het antwoord rechtstreeks
naar de bezoeker, niet naar het afzenderdomein.

> **Let op tijdens de testfase:** het afzenderadres `onboarding@resend.dev` is van
> Resend zelf. Daarmee kun je alleen mailen naar het adres waarmee je het account
> hebt aangemaakt. Naar een ander adres sturen mislukt totdat stap 4 klaar is.
> Dat is geen fout in de site.

### Stap 4: Live zetten op het eigen domein

1. In Resend: **Domains → Add Domain** → `eversun-assen.nl`.
2. Resend toont een paar DNS-records (SPF en DKIM). Die moeten bij de partij waar
   het domein geregistreerd staat in het DNS-beheer worden gezet. Ze bewijzen aan
   Gmail en Outlook dat deze server namens dit domein mag mailen. Zonder die
   records belandt de mail in de spammap.
3. Zodra Resend het domein als "verified" toont, pas je de twee regels aan:

```
CONTACT_TO_EMAIL=info@eversun-assen.nl
CONTACT_FROM_EMAIL=Ever Sun website <site@eversun-assen.nl>
```

Meer is er niet nodig, de code verandert niet mee.

### Waar de instellingen live moeten staan

`.env.local` werkt alleen op deze computer. Wanneer de site online gezet wordt
(bv. via Vercel), moeten dezelfde drie variabelen in het dashboard van die
hostingpartij worden ingevuld onder *Environment Variables*.

## Planomgeving instellen

De planomgeving (medewerkers plannen afspraken per bank, achter een login) draait op
[Supabase](https://supabase.com): dat is een Postgres-database met inlogbeheer
erbovenop.

### Stap 1: Sleutels in `.env.local`

In het Supabase-dashboard: **Project Settings → API Keys**. Zet in `.env.local`
(zie `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://jouwproject.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Herstart daarna `npm run dev`; omgevingsvariabelen worden alleen bij het
opstarten ingelezen.

> De publieke sleutel mág in de browser staan. Hij opent niets uit zichzelf: wat
> iemand mag zien, bepalen de databaseregels (Row Level Security). De geheime
> sleutel (`SUPABASE_SECRET_KEY`) is het tegenovergestelde — die stapt overal
> langs. Die hoort alleen in `.env.local` en in het Vercel-dashboard, nooit in
> een `NEXT_PUBLIC_`-variabele en nooit in een berichtje.

### Stap 2: De CLI aan het project koppelen

De Supabase CLI staat al in `devDependencies`; los installeren hoeft niet.

```bash
npx supabase login
```

Daarna koppelen aan het juiste project. De `project-ref` is het stuk uit de URL
van het dashboard (`https://supabase.com/dashboard/project/<project-ref>`):

```bash
npx supabase link --project-ref <project-ref>
```

### Stap 3: Databasewijzigingen

Alle wijzigingen aan de database gaan via migratiebestanden in
`supabase/migrations/`. Nooit met de hand klikken in het dashboard: dan staat de
live database anders dan wat er in git zit, en weet niemand meer wat de waarheid
is.

```bash
# nieuw migratiebestand aanmaken
npx supabase migration new beschrijvende_naam

# naar de gekoppelde database sturen
npx supabase db push
```

Omdat het project aan GitHub gekoppeld is, draait Supabase nieuwe migraties zelf
bij een push naar `main`. `db push` is er voor het testen vooraf.

### Stap 4: Live zetten

Dezelfde drie variabelen moeten in het Vercel-dashboard onder *Environment
Variables*. Zonder die waarden werkt de site gewoon door; alleen de
planomgeving meldt dan dat hij niet beschikbaar is.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
