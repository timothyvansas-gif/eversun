# Handoff: refactor van de Ever Sun-huidtest

## Doel van dit document

Dit document beschrijft uitsluitend de technische bevindingen rond de huidtest en een veilige aanpak om `huidtest-quiz.tsx` op te splitsen zonder gedrag, adviesregels, toegankelijkheid of visuele presentatie te veranderen.

Uitgangspunt van de analyse:

- Commit: `f7d29d9`
- Hoofdbestand: `src/components/huidtest/huidtest-quiz.tsx`
- Omvang: 915 regels
- Dezelfde quiz draait in twee contexten:
  - als overlay via `src/components/huidtest/huidtest-overlay.tsx`;
  - als zelfstandige route via `src/app/huidtest/page.tsx`.

## Korte conclusie

De huidtest is inhoudelijk zorgvuldig gebouwd en de eigenlijke adviesregels zijn al goed afgescheiden en getest. Het probleem zit niet in de adviesengine, maar in de presentatiecontroller: `huidtest-quiz.tsx` beheert te veel verschillende soorten verantwoordelijkheid tegelijk.

Een veilige refactor moet daarom niet beginnen met componenten willekeurig uit het bestand knippen. Begin met karakteriseringstests en pure flowfuncties. Verplaats daarna per stap één verantwoordelijkheid, terwijl de bestaande DOM-structuur, Motion-variants en CSS-klassen intact blijven.

## Wat al goed gescheiden is

Deze onderdelen hoeven niet opnieuw ontworpen te worden:

- `src/lib/huidtest/decide.ts`: bepaalt bank, stand en product.
- `src/lib/huidtest/decide.test.ts`: de adviesregels hebben al uitgebreide unitdekking.
- `src/lib/huidtest/config.ts`: vragen, opties en klantcopy.
- `src/lib/huidtest/types.ts`: antwoorden, advies en banktypen.
- `src/lib/huidtest/share.ts`: coderen en decoderen van gedeelde resultaten.
- `question-card.tsx`, `result-screen.tsx`, `exit-screen.tsx`, `sticky-actions.tsx` en `step-card.tsx`: belangrijke presentatiestukken zijn al losse componenten.
- Overlay en route gebruiken bewust dezelfde `HuidtestQuiz`; er zijn dus geen twee onafhankelijke quizinstanties die uit elkaar kunnen lopen.

Behoud deze grenzen. De refactor is geen reden om adviesregels terug de UI in te trekken of een tweede quizimplementatie voor mobiel te maken.

## Bevindingen in `huidtest-quiz.tsx`

### 1. Flow en domeinbeslissingen zitten in de component

De component beheert onder meer:

- de `Step`-union (`intro`, `vraag`, `exit`, `resultaat`);
- de step-stack en antwoorden;
- vooruit- en terugnavigatie;
- browserhistorie voor de zelfstandige route;
- leeftijdscontrole;
- het bepalen van de volgende vraag;
- vroegtijdige exits voor minderjarig, huidtype 1 en rossig haar;
- het overslaan van `kleurstijl` wanneer `huidgevoel` dat al beslist;
- herstarten en compleetheidscontrole;
- voortgangsberekening.

Met name `openingStep`, `nextStep`, `isComplete` en de voortgangsberekening zijn domeinlogica die als pure functies rechtstreeks getest kan worden. Nu zijn alleen `openingStep` en `isComplete` buiten de React-component geplaatst; `nextStep` en progressie zijn nog lokaal en niet rechtstreeks getest.

### 2. Browser- en React-side-effects zitten door de flow heen

Dezelfde component beheert ook:

- `window.history.pushState`, `history.back` en `popstate`;
- focusverplaatsing naar de nieuwe heading;
- analytics voor start, antwoord, exit en resultaat;
- de timer waarmee de voltooide progressbar nog kort zichtbaar blijft.

Daardoor is de flow moeilijk geïsoleerd te testen. Side-effects moeten buiten een pure reducer of pure overgangsfunctie blijven.

### 3. Layoutmetingen zitten naast inhoudelijke state

De component meet en bewaakt:

- de stagebreedte via `ResizeObserver`;
- de grootste desktophoogte van een vraag;
- het verschil tussen mobiele natuurlijke hoogte en desktop-floor;
- de afstand waarover een stap moet bewegen.

Dit is geldige UI-logica, maar hoort niet in dezelfde laag die ook bepaalt of rossig haar tot een exit leidt.

### 4. Gesture-state en flow-state zijn sterk verweven

De horizontale terug-swipe gebruikt:

- `dragX` en `peekX` als MotionValues;
- `peekStep` om de vorige kaart achter de huidige te renderen;
- `swipedBack` om een dubbele entrance-animation te voorkomen;
- breedte plus `STEP_GAP` als gedeelde reisafstand;
- een velocity- en offsetdrempel;
- een handmatige release-animation voordat de stack wordt gepopt.

Dit gedeelte is gevoelig. Een onschuldige wijziging in mountvolgorde, key, overflow of grid/flex-opbouw kan leiden tot:

- een dubbele animatie na een swipe;
- twee kaarten die door elkaar heen bewegen;
- een zichtbare kaartrand buiten de stage;
- verlies van verticaal scrollen in de mobiele sheet;
- een action bar die niet meer sticky is.

Verplaats deze logica pas nadat de pure flow is afgescheiden. Verander tijdens de eerste refactor geen Motion-variant, key, DOM-wrapper of overflow-class.

### 5. Eén renderfunctie kent alle schermtypen

`renderStep` rendert intro, vraag, exit en resultaat en sluit direct over vrijwel alle state en callbacks van de hoofdcomponent. Dit maakt extractie lastiger dan nodig.

De intro kan veilig een los presentational component worden. Vraag, exit en resultaat zijn al grotendeels los. Een kleine `HuidtestStepContent`-dispatcher kan later de switch centraliseren, maar dit is niet de eerste stap: eerst moeten de benodigde props uit een flowmodel komen.

### 6. Het bestand bevat waardevolle maar omvangrijke regressiekennis

Veel commentaar documenteert eerder gevonden fouten rond sticky positioning, `overflow: clip`, Framer Motion presence, swipe-handover en mobiele hoogte. Die kennis is waardevol en moet bij de relevante geëxtraheerde component of hook blijven staan.

Verwijder het commentaar niet als cosmetische opschoning. Verplaats het mee naar de code waarvan het de reden uitlegt. Kort pas daarna dubbele of verouderde passages in.

## Voorgestelde doelstructuur

Een praktische eindstructuur, zonder over-engineering:

```text
src/components/huidtest/
  huidtest-quiz.tsx                 # dunne composition root
  huidtest-intro.tsx                # alleen intro/age gate
  huidtest-progress.tsx             # progressbar + result hold animation
  huidtest-step-stage.tsx           # AnimatePresence, drag, peek en metingen
  huidtest-question-actions.tsx      # vaste volgende/terug-actiebalk
  use-huidtest-flow.ts              # React-state, actions en history-adapter
  use-huidtest-stage-metrics.ts      # ResizeObserver en desktophoogte
  flow.ts                           # pure stappen, transitions en progressie
  flow.test.ts                      # karakterisering van de volledige quizflow
```

`huidtest-quiz.tsx` blijft verantwoordelijk voor compositie: flow ophalen, stage en progressie aan elkaar knopen, en props doorgeven. Het bestand hoeft niet extreem klein te worden; ongeveer 180–300 regels is realistisch als de complexe Motion-compositie leesbaar bij elkaar blijft.

## Aanpak in veilige fasen

### Fase 0 — baseline en karakterisering

Voer vóór de eerste structurele wijziging uit:

```bash
npm run lint
npm run typecheck
npm run test
```

Leg daarna minimaal deze visuele staten vast op mobiel en desktop:

1. intro;
2. eerste vraag, zonder en met selectie;
3. vraag met tattoo-checkbox;
4. terugknop;
5. resultaatscherm;
6. type-1-exit;
7. rossig-haar-exit;
8. gedeelde URL die direct op resultaat opent;
9. mobiele horizontale terug-swipe;
10. reduced-motion indien praktisch.

Controleer zowel overlay als `/huidtest`, omdat alleen de route browserhistorie gebruikt.

### Fase 1 — pure flowfuncties extraheren

Maak `flow.ts` en verplaats, zonder gedragswijziging:

- `Step`;
- `openingStep`;
- `isComplete`;
- `nextStep`;
- voortgangsberekening;
- eventueel `stepKey`, `currentAnswer` en `canSwipeBack` als pure selectors.

Gebruik bij voorkeur functies met expliciete input, bijvoorbeeld:

```ts
nextStep(index, answers, questions)
progressFor(step, answers, questionCount)
openingStep(sharedAnswers)
```

Laat analytics, history en React-state hier volledig buiten.

Voeg `flow.test.ts` toe voordat de component verder wordt opgesplitst.

### Fase 2 — flowstate in een hook/reducer

Maak `use-huidtest-flow.ts`. Een reducer is hier geschikt omdat een stapwissel meerdere samenhangende waarden raakt: stack, richting en swipe-handover.

Mogelijke state:

```ts
type HuidtestFlowState = {
  stack: Step[];
  answers: Partial<QuizAnswers>;
  direction: 1 | -1;
  swipedBack: boolean;
};
```

Mogelijke acties:

```ts
answer
advance
back
backViaSwipe
restart
syncBrowserBack
clearSwipeHandover
```

Belangrijk:

- Houd `window.history` buiten de reducer; de hook mag na een actie `pushState` of `history.back` uitvoeren.
- Houd analytics eveneens als side-effect rond de acties, niet in de reducer.
- Behoud exact het verschil tussen `historyBacked=true` op de route en `false` in de overlay.
- Behoud dat antwoordselectie niet automatisch doorgaat; pas de knop “Volgende” bevestigt een keuze.

### Fase 3 — progressie isoleren

Verplaats progressbar, result-hold timer en exit-animation naar `huidtest-progress.tsx` of een kleine hook plus component.

Behoud exact:

- intro op 10%;
- eerste vraag op 20%;
- resultaat op 100%;
- dynamische noemer van vijf of zes vragen;
- 560 ms hold normaal;
- 240 ms bij reduced motion;
- transform-based barvulling, niet width/scaleX.

### Fase 4 — metingen isoleren

Maak `use-huidtest-stage-metrics.ts` voor:

- `stageRef`;
- `stageWidth` via `ResizeObserver`;
- grootste desktopvraaghoogte;
- `recordQuestionHeight` met de bestaande mobiele `matchMedia`-guard.

Geef de hook alleen meetwaarden terug. Hij hoort geen quizstappen of analytics te kennen.

### Fase 5 — stage en gestures isoleren

Verplaats daarna pas het blok met `dragX`, `peekX`, `AnimatePresence`, `peekStep` en de release-animation naar `huidtest-step-stage.tsx`.

Tijdens deze fase:

- behoud dezelfde DOM-wrappers;
- behoud dezelfde React keys;
- behoud `mode={isMobile ? "popLayout" : "sync"}`;
- behoud `overflow-x-clip` op mobiel en `md:overflow-clip` op desktop;
- behoud de aparte drag-wrapper en transition-wrapper;
- behoud `requestAnimationFrame(() => setSwipedBack(false))` totdat tests aantonen dat een alternatief identiek werkt;
- verander geen springwaarden of swipe-drempels.

Dit is een mechanische verplaatsing, geen motion-redesign.

### Fase 6 — presentational componenten

Als de flow en stage stabiel zijn:

- extraheer de intro naar `huidtest-intro.tsx`;
- extraheer de vraagactiebalk naar `huidtest-question-actions.tsx`;
- laat `Resultaat` eventueel in een klein `result-guard.tsx` landen, of voeg die guard toe aan `result-screen.tsx` als dat component daardoor niet twee verantwoordelijkheden krijgt.

Stop wanneer de composition root duidelijk leesbaar is. Splits niet elk JSX-fragment op puur om regelaantallen te verlagen.

## Minimale testmatrix voor `flow.test.ts`

Test ten minste:

### Start en gedeelde links

- zonder gedeelde antwoorden opent de intro;
- complete veilige gedeelde antwoorden openen resultaat;
- gedeelde antwoorden met huidtype 1 openen de juiste exit;
- gedeelde antwoorden met rossig haar openen de juiste exit.

### Leeftijd en veiligheids-exits

- minderjarig gaat naar `exit/minor`;
- huidtype 1 gaat na bevestiging naar `exit/type1`;
- rossig haar gaat na bevestiging naar `exit/rossig`;
- er wordt in deze gevallen nooit een advies berekend of getoond.

### Vraagvolgorde

- een antwoord selecteren wijzigt answers maar niet direct de step;
- bevestigen gaat naar de volgende vraag;
- een huidgevoel dat `kleurstijl` overslaat gaat direct naar resultaat;
- overige huidgevoelens tonen `kleurstijl`;
- de laatste vraag gaat naar resultaat.

### Herstart en terug

- terug verwijdert precies één step;
- de overlay gebruikt geen browserhistory;
- de route pusht history bij vooruitgaan en reageert eenmaal op `popstate`;
- herstart wist alle oude antwoorden behalve de standaard `tattoo: false` en opent vraag 1;
- een oud resultaat mag na herstart niet via de mobiele swipe als geldig advies terugkomen.

### Progressie

- intro = 10;
- vraag 1 = 20;
- resultaat = 100;
- de progressie gebruikt vijf vragen wanneer `kleurstijl` wordt overgeslagen;
- de progressie gebruikt zes vragen wanneer `kleurstijl` wel wordt gesteld.

## Visuele en gedragsmatige invarianten

De refactor is alleen geslaagd als onderstaande punten gelijk blijven:

- Geen zichtbare layoutverschuiving tussen vragen op desktop.
- Op mobiel blijft de sheet 92svh en verticaal scrollbaar.
- De action bar blijft sticky en remount niet per vraag.
- “Volgende” blijft disabled totdat een antwoord gekozen is.
- Focus gaat na iedere stepwissel stil naar de nieuwe heading.
- Pijltjestoetsen blijven binnen de radiogroup werken.
- Horizontaal swipen verhindert verticaal scrollen niet.
- Een afgebroken swipe veert terug zonder stepwissel.
- Een geldige swipe speelt geen tweede entrance-animation af.
- Vooruit en terug gebruiken hun bestaande richting.
- Desktop gebruikt synchrone kaartovergang; mobiel `popLayout`.
- Reduced motion verwijdert verplaatsing zonder belangrijke statusfeedback weg te nemen.
- Resultaat, bank, stand en product zijn voor iedere antwoordset identiek aan vóór de refactor.
- Analytics-eventnamen en payloads blijven gelijk.
- De gedeelde URL blijft server-side direct op het juiste scherm openen.

## Wat niet combineren met deze refactor

Neem tijdens deze wijziging niet tegelijk mee:

- nieuwe vragen of antwoordopties;
- wijzigingen aan de zonnebankadviesregels;
- nieuwe motioncurves of swipegevoeligheid;
- redesign van progressbar of action bar;
- wijziging van overlayhoogte, panelbreedte of scrollgedrag;
- hernoemen van analytics-events;
- algemene kleur- of typografiewijzigingen.

Dat soort wijzigingen maakt regressies moeilijk te herleiden en maakt visuele vergelijking waardeloos.

## Operationele aandachtspunten

- Laat de bestaande devserver draaien als die voor mobiele LAN-tests wordt gebruikt.
- Draai niet achteloos `next build` in dezelfde `.next`-map terwijl `next dev` actief is; dat kan de devserver tijdelijk verstoren.
- Voer na iedere fase lint, typecheck en tests uit.
- Maak per fase een kleine commit. Zo kan de gesture-extractie afzonderlijk worden teruggedraaid zonder de pure flowverbeteringen kwijt te raken.

## Aanbevolen commitvolgorde

1. `test: characterize huidtest flow`
2. `refactor: extract pure huidtest flow`
3. `refactor: isolate huidtest state and history`
4. `refactor: extract huidtest progress and metrics`
5. `refactor: isolate huidtest step stage`
6. `refactor: simplify huidtest composition`

Iedere commit moet zelfstandig lint, typecheck en tests doorstaan.

## Startprompt voor een volgende Codex-sessie

Gebruik desgewenst deze tekst samen met dit document:

> Refactor de Ever Sun-huidtest volgens `docs/HUIDTEST_REFACTOR_HANDOFF.md`. Werk gefaseerd en begin met karakteriseringstests en pure flowfuncties. Behoud alle adviesuitkomsten, analytics, browserhistory, DOM-structuur, CSS-klassen, responsive layout en Motion-gedrag. Laat de bestaande devserver draaien. Voer na iedere fase lint, typecheck en tests uit en controleer overlay, `/huidtest`, mobiel, desktop en terug-swipe visueel. Stop niet bij een half werkende tussenstaat en combineer dit niet met functionele of visuele wijzigingen.

## Definitie van klaar

De refactor is klaar wanneer:

- de pure flow volledig unit-getest is;
- `huidtest-quiz.tsx` vooral compositie bevat;
- flow, progressie, metingen en stage/gesture elk een duidelijke eigenaar hebben;
- overlay en route dezelfde quiz blijven gebruiken;
- alle bestaande tests en nieuwe flowtests slagen;
- de visuele en gedragsmatige invarianten hierboven op mobiel en desktop zijn bevestigd;
- er geen wijziging is in welk advies een klant ontvangt.
