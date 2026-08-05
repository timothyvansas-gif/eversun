# Ever Sun — Technische audit

**Datum:** 4 augustus 2026 · **Basis:** commit `9007632` · **Scope:** `src/`
**Bijgewerkt:** 5 augustus 2026 — twaalf bevindingen opgelost, zie [Opgelost](#opgelost).

Code-level audit: accessibility, performance, theming, responsive gedrag en implementatie-integriteit. Geen UX-critique.

**Hoe gemeten.** Detector uit de impeccable-skill over `src` (0 findings, controlerun op een ander bestand geeft exit 1 — de detector werkt dus). `npm run lint`, `npx tsc --noEmit`, `npx vitest run`: alle drie schoon, 60/60 tests. Contrastwaarden zijn narekend met de WCAG 2.x relatieve-luminantieformule, inclusief alfa-blending tegen de werkelijke achtergrond — niet geschat.

---

## Score

| # | Dimensie | Bij audit | Nu | Kernbevinding |
|---|-----------|-----------|----|---------------|
| 1 | Accessibility | 2/4 | **3/4** | Eén AA-schending over: de primaire CTA haalt 3.05:1 (#2). Modal, semantiek, sheet-contrast en reduced motion zijn geregeld |
| 2 | Performance | 3/4 | **4/4** | Videopreload en de layout-animatie van de pagina-push zijn weg |
| 3 | Responsive Design | 3/4 | **4/4** | Fluid systeem, en elk icoonvlak haalt nu 44×44 |
| 4 | Theming | 2/4 | **3/4** | 62 hard-coded hex; `DESIGN.md` klopt nu wel met de code |
| 5 | Implementation Integrity | 2/4 | **3/4** | Team en galerij zijn nog placeholders — bewust, pre-productie |
| **Totaal** | | **12/20** | **17/20** | **Good — address weak dimensions** |

De score meet meetbare failures, niet vakmanschap. De codekwaliteit ligt aantoonbaar hoog — zie [Positieve bevindingen](#positieve-bevindingen). Wat de score nog drukt is bijna volledig contentblokkade (team, galerij) plus één kleurbeslissing die nooit is doorgerekend.

Accessibility staat op 3 en niet hoger omdat de primaire CTA sitebreed onder de norm blijft; dat is één beslissing, geen reeks fouten. Theming blijft op 3 door de 62 losse hex-waarden. Integrity komt op 4 zodra team en galerij echte content hebben — daar hoeft geen code voor om.

## Verdict implementatie-integriteit

**Pass op de bouw, open op de content.** Het systeem is coherent en productspecifiek: gedeelde tokens, gedeelde class-libs (`button-styles`, `carousel`), één breakpoint-bron, commentaar dat *waarom* vastlegt in plaats van *wat*. `DESIGN.md` beschrijft sinds deze ronde ook echt wat de code doet.

Wat open blijft is geen bouwfout: team en galerij draaien op placeholders. De site staat nog niet live, dus dat is scaffolding — maar het is wel de laatste horde voor productie.

---

## Bevindingen

Severity: **P1** fix vóór release · **P2** volgende ronde · **P3** als er tijd is. Wat op content wacht staat apart onder [Release gate](#release-gate--wacht-op-content).

### Opgelost

| # | Bevinding | Commit |
|---|-----------|--------|
| 4 | `prefers-reduced-motion` dekte de grote bewegingen niet | `a312c6e` |
| 3 | Mobiel menu was een modal zonder containment | 5 aug |
| 5 | ~18 MB desktopvideo eager geladen | 5 aug |
| 6 | Tekstcontrast in overlays en fotosheet | 5 aug |
| 8 | Afgekeurde kleur `#94825c` nog in de mailtemplate | 5 aug |
| 11 | Avatars waren `role="button"` zonder toetsenbordactie | 5 aug |
| 12 | `aria-expanded` loog op beide hamburgers | 5 aug |
| 13 | Pagina-push animeerde `margin-left` | 5 aug |
| 16 | 10,4 MB dode assets | 5 aug |
| 17 | Icoonknoppen onder de 44pt | 5 aug |
| 10 | `DESIGN.md` beschreef een ander systeem | 5 aug |
| 19 | Reviewcijfer hard in de JSX | 5 aug |

Details per stuk hieronder.

#### 3. Mobiel menu was een modal zonder containment

`mobile-menu.tsx`, `page-layout.tsx`, `sticky-header.tsx`

Het panel declareerde `role="dialog" aria-modal="true"` zonder focus trap en zonder Escape, terwijl `<main>` alleen wegschoof. Nu draait het op dezelfde `useFocusTrap` als de hero-overlays, en `<main>` plus `<header>` gaan `inert` zolang het menu open is.

Eén valkuil onderweg: de hamburger die het menu opent zit zelf in `<main>`, dus die wordt mee-inert en kan de focus niet terugkrijgen. De trigger wordt daarom op het klikmoment vastgelegd in `page-layout` — vóór `inert` bestaat — en `mobile-menu` geeft de focus daaraan terug via `quietFocus`.

Geverifieerd: focus start binnen het panel, vijf keer Tab ontsnapt niet, `heroBurger.focus()` levert `false` op zolang het menu open is, Escape sluit en zet de focus terug op de hamburger.

#### 5. ~18 MB desktopvideo eager geladen

`use-zonnebank-video.ts`, `zonnebank-media.tsx`, `onze-zonnebanken.tsx`

`preload` is nu drietrapsraket in plaats van aan/uit: `none` → `metadata` zodra de kaart in zicht komt → `auto` bij `pointerenter` op de kaart. Hover is de betrouwbare voorbode van de klik en geeft de fetch een voorsprong. Touch slaat de hovertrap over; daar zet de tap zelf `auto`, zoals eerder.

Geverifieerd: vier kaarten op `metadata` na scrollen, alleen de gehoverde kaart op `auto`.

#### 6. Tekstcontrast in overlays en fotosheet

`foto-bottom-sheet.tsx`, `plan-je-moment-sheet.tsx`, `openingstijden-overlay.tsx`

`text-ink/40` (2.47:1) en `text-ink/60` (4.44:1 op de sheet, 4.48:1 op de witte kaart) vervangen door het bestaande `text-muted`. Gemeten in de browser: **4.99:1** op alle vier de plekken.

#### 8. Afgekeurde kleur nog in de mailtemplate

`contact-email.ts` — `#94825c` → `#76684a`. De inline hex staan er noodgedwongen (mail krijgt geen stylesheet), nu met een comment dat ze handmatig in de pas moeten blijven met `globals.css`.

#### 11. Avatars waren `role="button"` zonder toetsenbordactie

`hero-reviews.tsx` — nu een echte `<button type="button">` met `aria-expanded` dat de quote-panel volgt. Focus opent de quote (zoals hover altijd al deed), Enter sluit en heropent.

#### 12. `aria-expanded` loog

`hero-content.tsx`, `sticky-header.tsx`, `page-layout.tsx`, `mobile-menu.tsx`, `nav-items.ts`

`isMenuOpen` loopt nu door naar beide hamburgers. `aria-expanded` gaat `false → true`, het label van "Menu openen" naar "Menu sluiten", en beide wijzen met `aria-controls` naar `#mobiel-menu`. De id staat in `lib/nav-items.ts`, zodat de triggers de menumodule niet hoeven te importeren voor één string.

#### 13. Pagina-push animeerde `margin-left`

`page-layout.tsx`, `sticky-header.tsx` — beide draaien op `transform`. De header combineert de reveal (Y) en de push (X) in één property.

**Let op bij nieuwe overlays:** `<main>` staat bewust op `transform: none` in rust. Elke andere waarde maakt het element het containing block voor `position: fixed` erbinnen, en `openingstijden-overlay` is de enige overlay die nog binnen `<main>` rendert — de rest portalt naar `<body>`. Portal nieuwe fixed overlays, of ze positioneren tijdens de push tegen `<main>`.

#### 16. Dode assets — 10,4 MB

Verwijderd: `src/images/banken/*-closed.png` (4), `src/images/timothy.{png,webp}`, en `public/{file,globe,next,vercel,window}.svg` uit de Next-scaffold.

#### 10. `DESIGN.md` beschreef een ander systeem

`DESIGN.md`, `layout.tsx`, `globals.css`, `hero-content.tsx`, `opengraph-image.tsx`

Het doc noemde **Figtree** als display-font. De code laadt **PT Serif** — en deed dat onder de variabelenaam `alice`, met `--font-alice` twee keer aan zichzelf gealiast in `globals.css` en een losse `font-alice` utility op precies één element. Vier namen voor één lettertype, waarvan er één in het doc stond en nergens in de code voorkwam.

Bij het opruimen bleek waar die naam vandaan kwam, en dat het meer was dan een naamkwestie: **`opengraph-image.tsx` haalde daadwerkelijk Alice op van Google Fonts** — met het commentaar "the brand serif used on the site" erboven. Elke gedeelde link liet dus een sharecard zien in een letter die nergens op de site staat. Nu PT Serif, gecontroleerd door de kaart te renderen.

Verder gelijkgetrokken: alle 7 tokens in plaats van 2, de bento als flex-verhoudingen in plaats van vaste px (en in de volgorde die de code aanhoudt — advies staat op positie 3, niet 4), gap 12/16px en radius 12px in plaats van 16/8, plus secties over motion en toegankelijkheid die er nog niet waren.

#### 19. Reviewcijfer hard in de JSX

`lib/reviews.ts`, `hero-reviews.tsx` — `4.9/5 - 176 reviews` stond in de opmaak. Staat nu als `REVIEW_SUMMARY` naast de quotes die het samenvat, met een `checked`-datum erbij: beide komen van dezelfde Google-listing en verouderen samen.

#### 17. Icoonknoppen onder de 44pt

`button-styles.ts` (nieuwe `TAP_TARGET`), `hero-content.tsx`, `sticky-header.tsx`, `mobile-menu.tsx`

Gemeten voor: hamburgers 40×31, sticky logo 118×32, social-links 40×40. Alles haalde WCAG 2.5.8 — de twee kleinste (status 256×23, telefoonlink 292×20) via de spacing-uitzondering, nagerekend op 40px en 129px tot de dichtstbijzijnde andere target. Dit ging dus om de duim, niet om de norm.

Padding alleen komt er niet: de drie hamburgerlijnen zijn samen 14,5px hoog, dus zelfs `p-3` blijft op 39 steken. `TAP_TARGET` zet daarom een expliciete `min-h/min-w-[44px]` met `justify-center`, zodat het getekende icoon zijn maat én zijn plek houdt en alleen de doos eromheen groeit. Op de hero-hamburger vangt de bestaande `-mr-2` de extra breedte op — `items-end` duwt die naar links, dus de rechterrand verschuift niet.

Na: alles 44×44 of meer, hamburgerlijnen nog altijd 24×1,5 / 16×1,5 / 24×1,5 met rechterrand op 351px.

#### 4. `prefers-reduced-motion` dekte de grote bewegingen niet

Twee fouten tegelijk. De CSS-blok in `globals.css` zette globaal `transition-duration: 0s !important` — dat sloopte juist de nuttige feedback (hover, focus, foutkleuren sprongen zonder overgang). En het raakte framer-motion en gsap niet, want die animeren in JS. Wie reduced motion aanzette kreeg dus géén state-feedback meer, maar wél de hero fade-up, de scroll-parallax, de bento-reveal, het inschuivende menu en de sheet-springs op volle amplitude.

Daaronder zat een stillere fout: framer-motion's eigen `useReducedMotion` leest de voorkeur één keer in `useState` bij de eerste render en werkt nooit bij (staat als TODO in hun source). Bij SSR is die eerste render de server, dus hydrateerde hij op `false` en bleef daar — de drie componenten die hem al gebruikten deden niets.

Aanpak: eigen `src/hooks/use-reduced-motion.ts` op `useMediaQuery`/`useSyncExternalStore`, `MotionConfig reducedMotion="user"` in `page-layout`, expliciete gates voor wat die switch niet bereikt (MotionValues, ScrollTrigger, inline CSS-transities, autoplay), en `scrollBehavior()` voor de zes native scroll-calls — een expliciete `behavior`-optie overrulet de CSS-property `scroll-behavior`, dus die animeerden door.

Geverifieerd met Playwright onder beide mediastates. Zonder voorkeur: elke gemeten waarde ongewijzigd. Met `reduce`: parallax `none`, push `none`, header `none`, carrousel bevroren — terwijl de feedbacktransities van 0.3s en 0.2s intact blijven.

---

### Release gate — wacht op content

De site staat nog niet live. Onderstaande twee zijn dus bewuste scaffolding, geen fouten in de bouw: de code eromheen is af en heeft geen wijziging nodig zodra het materiaal er is. Ze staan hier omdat ze **niet mee mogen naar productie**.

#### 1. Drie van de vier teamleden zijn placeholders

`src/components/over-ons.tsx:12-37` · Implementation Integrity

Sofie, Chloe en Yara bestaan niet. Alle drie dragen dezelfde regel — `"Hier gaan we een kort stukje tekst plaatsen van de medewerker. Lachen gieren brullen natuurlijk."` — en Sofie en Yara delen dezelfde foto (`team-dummy.webp`). Alleen Aisha is echt.

**Nodig:** namen, foto's en teksten. Alternatief tot die er zijn: de sectie terugbrengen tot Aisha.

#### 7. Galerij toont 14 foto's die 4 foto's zijn

`src/components/foto-bottom-sheet.tsx:21-24,144,182` · Implementation Integrity

`src/images/impressie/` bevat vier bestanden, alle vier `dummy*.webp`. Die worden 3,5× herhaald tot veertien items, het label telt ze op als `14 foto's`, en de alt-teksten nummeren door tot "Impressie Ever Sun zonnestudio 14".

**Nodig:** echte studiofoto's. De lijst en de telling volgen dan vanzelf.

---

### P1

#### 2. Primaire CTA faalt tekstcontrast — sitebreed

- **Locatie:** `src/lib/button-styles.ts:20` (`BTN_PILL_ACCENT`), `src/components/hero/hero-buttons.tsx:22`
- **Standaard:** WCAG 2.2 AA 1.4.3

`#FAF4EC` op `#F35B04` = **3.05:1** bij 14/15/16px medium. Nodig is 4.5:1 (de large-text-drempel van 3:1 geldt pas vanaf 18.66px bold of 24px). Raakt "Plan je moment" in de hero, "Verstuur bericht" in het contactformulier en de producten-CTA — precies de drie conversiepunten.

**Fix:** accent donkerder (~`#C7460A` geeft 4.6:1 met het lichte label), of een donker label op het oranje (`#1F1F1E` op `#F35B04` = 5.3:1). Als grafisch element blijft `#F35B04` bruikbaar: 3.05:1 haalt 1.4.11.

#### 7. Galerij toont 14 foto's die 4 foto's zijn

- **Locatie:** `src/components/foto-bottom-sheet.tsx:21-24,141,179`

`sheetPhotos` herhaalt vier dummy's tot veertien items, het label zegt letterlijk `14 foto's`, en de alt-teksten nummeren door tot "Impressie Ever Sun zonnestudio 14". De bezoeker scrolt door dezelfde ruimte en telt vier keer hetzelfde bed.

**Fix:** echte studiofoto's, of lijst en telling terugbrengen tot wat er is.

---

### P2

#### 9. Tokens naast literals

62 hex-literals in `src/components` + `src/lib`. Daarvan dupliceren `#FAF4EC` (5×) en `#1F1F1E` (5×) bestaande tokens, en de foutkleur `#A6371A` (4×) heeft er geen. **Fix:** `--color-error` en `--color-error-surface` toevoegen, duplicaten door de bestaande tokens routeren — zoals commit `628c466` al deed voor het brand-geel.

#### 14. Outline-pill randcontrast

`button-styles.ts:11` — `border-line` (`#D5BE9C`) op `#FAF4EC` = **1.65:1**, terwijl de rand de enige begrenzing van de knop is. WCAG 1.4.11 vraagt 3:1.

#### 15. Advies-carrousel wisselt automatisch zonder pauze

`src/components/advies-card.tsx` — elke 4,5s een volgende foto, doorlopend. WCAG 2.2.2 wil dan een pauze-, stop- of verbergmechanisme. De thumbnails wisselen wel, maar pauzeren niet. Sinds `a312c6e` staat de autoplay stil bij reduced motion; voor iedereen daarbuiten loopt hij door.

---

### P3

- **18. `will-change: transform` permanent.** `hero/index.tsx` — blijft staan als de hero uit beeld is. Sinds `a312c6e` valt hij weg bij reduced motion; daarbuiten nog altijd permanent.

---

## Patronen

- **Contrast was het enige systematische a11y-gat.** Geen toeval: `--color-muted` is aantoonbaar doorgerekend (`globals.css:45-47` documenteert 4.99:1), maar `--color-accent` als knopvlak en de `ink/40`–`ink/60`-alfa's zijn dat nooit geweest. De alfa-tekst is opgeruimd (6); accent staat nog open (2) en is daarmee het laatste restant van dit patroon.
- **Placeholders zijn structureel, niet incidenteel.** Team, galerij, en `src/images/impressie/` bestaat volledig uit dummy's. Dit is één contentblokkade, geen reeks bugs — en na deze ronde het enige wat de score nog echt drukt.
- **De drie hero-overlays waren het goede voorbeeld** (`useFocusTrap`, Escape, focus-return). Het menu is er nu op aangesloten; de fotosheet heeft nog steeds een eigen, met de hand geschreven trap en zou dezelfde hook kunnen gebruiken.

## Positieve bevindingen

- **Commentaar legt oorzaken vast, niet code.** Safari's keyframe-gedrag boven 2x playbackRate, `visualViewport` versus `position: fixed` op iOS, `overflow-x: clip` dat een `fixed` panel niet bereikt, waarom `video.load()` de `play()` afbreekt. Dat is de duurste soort kennis om te herontdekken.
- **Perf-architectuur is bewust:** `LazyMotion` met `strict` + `domMax`, dynamische sectiechunks met SSR aan, Lenis pas op `requestIdleCallback` en alleen bij fine pointer, `inlineCss`, `optimizePackageImports`.
- **Het formulier is af:** honeypot via `clipPath` (met uitleg waarom niet `left:-9999px`), rate limiting met bodylimiet, `aria-invalid`/`aria-describedby`, een foutmelding die opent via `0fr→1fr`, een succespaneel dat focus én scrollpositie herstelt, `pointer-coarse:text-[16px]` tegen iOS-autozoom.
- **De skip-link mikt op de `<h1>` in plaats van `<main>`** — met de reden erbij. Zelden goed gedaan.
- **Toolchain groen:** lint 0, `tsc` 0, 60 tests, detector 0 findings.

---

## Volgorde

Wat er nog ligt, in volgorde:

1. **Release gate** — echte content voor team en galerij (1, 7). Vraagt assets van de klant; alles eromheen is af.
2. **P1** — accent doorrekenen naar 4.5:1 als knopvlak (2). De enige AA-schending die over is, en hij staat op de drie conversiepunten.
3. **P2** — error-token en duplicaten naar bestaande tokens (9), randcontrast van de outline-pill (14).
4. **P2** — pauzeknop of langere interval op de advies-carrousel (15).
5. **P3** — `will-change` staat permanent op de hero-laag (18).

## Opnieuw draaien

```
/impeccable audit
```

Het project heeft geen `PRODUCT.md`. Niet nodig voor een audit, wel voor nieuw werk — `/impeccable init` legt dat vast.
