# Ever Sun — Design System

Beschrijft wat de code doet. Bron van waarheid is `src/app/globals.css`; deze
pagina is de leesbare vorm ervan. Wijk je hiervan af in een component, zet er
dan bij waarom.

## Kleuren

Alle tokens staan in het `@theme`-blok van `globals.css` en zijn als Tailwind-
utility beschikbaar (`text-muted`, `bg-brand`, `border-line`, …).

| Token | Hex | Gebruik |
|---|---|---|
| `--color-brand` | `#FDC43F` | Geel: parkeerkaart, prijs- en productlabels |
| `--color-surface-page` | `#FAF4EC` | Pagina-achtergrond, warm crème |
| `--color-ink` | `#1A1A1A` | Tekst op lichte vlakken |
| `--color-ink-strong` | `#1F1F1E` | Koppen, donkere secties (over ons) |
| `--color-muted` | `#76684A` | Secundaire tekst, bijschriften, labels |
| `--color-accent` | `#F35B04` | De enige oranje: knoppen, statusdot, pin, sterren, hero-rules |
| `--color-line` | `#D5BE9C` | Randen, scheidingslijnen, outline-knoppen |

Naast de tokens: `--width-bento-primary: 853px`.

### Contrast

Doorgerekend en vastgelegd, niet op gevoel:

- `--color-muted` is bewust donkerder dan zijn voorganger `#94825c`, die maar
  3,4:1 haalde. Nu 4,99:1 in het slechtste geval (op `surface-page`).
- Gebruik **geen** alfa-varianten van `--color-ink` voor tekst. `ink/60` komt
  op 4,44:1 en `ink/40` op 2,47:1 — beide onder de norm. `text-muted` is de
  bedoelde secundaire kleur.
- **Open punt:** `surface-page` op `accent` haalt 3,05:1. Dat is de vulling van
  de primaire CTA en voldoet niet aan WCAG 1.4.3. Zie `AUDIT.md`, bevinding 2.

## Typografie

| Rol | Font | CSS-variabele | Utility |
|---|---|---|---|
| Display | **PT Serif** (400) | `--font-serif` → `--font-display` | `font-display` |
| Body / UI | **Inter** | `--font-inter` → `--font-sans` | `font-sans` |

Beide via `next/font/google` in `src/app/layout.tsx`. Er is één utility per rol;
gebruik `font-display`, niet de onderliggende variabele.

### Stijlen

| Naam | Font | Gewicht | Grootte | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Hero-titel | PT Serif | Regular | `clamp(24px, 7.5vw, 88px)` · desktop 68px | `clamp(30px, 10vw, 94px)` · desktop 1.2 | -0.02em · desktop -3px |
| Sectietitel | PT Serif | Medium | `clamp(28px, 3.75vw, 48px)` | none | -0.01em · xl -0.015em |
| Card-titel | PT Serif | Medium | 22px · xl 24px | none | -0.015em |
| Card-body | Inter | Regular | 15px | 24px | -0.01em |
| Sectie-intro | Inter | Regular | 15px | 24px | -0.01em |

Sectietitels bestaan uit twee regels: een `<h2>` plus een `<p>` in
`--color-muted`. Die tweede regel is opzettelijk **geen** `<h3>` — het is de
tweede helft van dezelfde kop, geen niveau lager.

CSS-classes in `globals.css`: `.card-title`, `.card-body`.

## Componentclasses

Naast de twee kaartclasses definieert `globals.css`:

| Class | Waarvoor |
|---|---|
| `.nav-link` | Navigatie-item met uitschuivende onderlijn; `.light` voor donkere achtergrond |
| `.sticky-card` | Sticky positionering van bento-kaarten onder 1024px |
| `.ff-input` / `.ff-textarea` / `.ff-label` | Floating labels, zie `components/ui/floating-field.tsx` |
| `.draggable-scroll` | Carrouseltrack zonder zichtbare scrollbar |

Gedeelde class-strings in `src/lib/button-styles.ts`: `BTN_PILL` (outline-CTA),
`BTN_PILL_ACCENT` (gevulde CTA), `TAP_TARGET` (44×44 minimum raakvlak voor
icoonknoppen). Carrousels: `src/lib/carousel.ts`.

## Bento — verhoudingen

De kaarten hebben **geen vaste breedtes**. Op xl verdelen ze de rij via
`flex`-groeifactoren; daaronder stapelen ze (mobiel) of vallen ze in twee
kolommen (md).

| Kaart | xl `flex` | Achtergrond |
|---|---|---|
| 1 — Warm welkom (foto) | 849 | wit |
| 2 — Parkeren | 411 | `--color-brand` + `bg-park-yellow.svg` |
| 3 — Persoonlijk advies | 535 | `--color-ink-strong` |
| 4 — Exclusieve merken | 411 | wit |
| 5 — Ultieme luxe | 302 | wit |

De getallen zijn de oorspronkelijke pixelbreedtes, hergebruikt als
verhoudingsgetallen — daarom tellen rij 1 (849 + 411) en rij 2 (535 + 411 +
302) niet op tot hetzelfde.

Gap: `12px` mobiel, `16px` vanaf md. Border-radius: `12px`.

## Spacing

Basis: **8px-grid**. Tailwind-mapping: `2=8px · 4=16px · 8=32px · 10=40px`.

Horizontale pagina-marge is vloeiend, niet stapsgewijs:
`clamp(1.5rem, 4vw, 10rem)`. Content-kolom kapt op `max-w-[1280px]`.
De hero gebruikt een eigen, smallere variant: `clamp(1.5rem, 4vw, 3.5rem)`.

## Motion

`prefers-reduced-motion` wordt afgehandeld waar de beweging vandaan komt, niet
met een globale CSS-kill:

- `MotionConfig reducedMotion="user"` in `page-layout.tsx` dekt elke `m.*` —
  transform- en layoutanimaties vervallen, opacity blijft.
- Wat daar niet doorheen loopt (MotionValues, gsap ScrollTrigger, inline CSS-
  transities, autoplay) heeft een eigen check via `hooks/use-reduced-motion.ts`.
  Gebruik díé hook, niet die van framer-motion: die leest de voorkeur één keer
  bij de eerste render en werkt bij SSR nooit bij.
- Native scroll-calls krijgen hun gedrag mee via `scrollBehavior()` uit
  `lib/animate-scroll.ts`; de CSS-property `scroll-behavior` wordt door een
  expliciete `behavior`-optie overruled.

Feedback-transities (hover, focus, validatie) blijven bij reduced motion staan.
Die bewegen niets en zijn juist wat iemand nodig heeft om de interface te volgen.

## Toegankelijkheid

- Focusring: 2px `--color-accent`, offset 3px. Programmatisch teruggegeven focus
  krijgt `data-quiet-focus` en toont geen ring — zie `lib/quiet-focus.ts`.
- Icoonknoppen halen minimaal 44×44 via `TAP_TARGET`.
- Overlays gebruiken `hooks/use-focus-trap.ts` (Escape, Tab-trap, focus-return).
  Het mobiele menu zet daarnaast `<main>` en `<header>` op `inert`.
