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

## Correcties na codeverificatie

Dit document was richtinggevend maar nog niet veilig genoeg als implementatiespecificatie. Na verificatie tegen de code zijn de volgende punten bijgesteld; ze zijn verwerkt in de fasen hieronder.

1. **De voorgestelde hook was niet testbaar.** Vitest draait uitsluitend in Node en zoekt alleen `*.test.ts` (`vitest.config.ts`). Er is geen jsdom en geen testing-library. Een React-hook als drager van de flow zou dus ongetest blijven. Fase 1 en 2 zijn daarom herschreven naar een **pure transition engine met declaratieve effects**; de React-laag wordt een dunne interpreter.
2. **Vooraf te repareren: `huidtest_resultaat` vuurt vaker dan één keer.** `decide()` levert elke render een nieuw object en het effect luistert op die objectidentiteit; de progress-timer veroorzaakt gegarandeerd een parent-render na 560 ms. Dit hoort in een **afzonderlijke commit vóór de refactor**, anders is "analytics blijft gelijk" geen bruikbare kwaliteitspoort.
3. **Terug-swipe is asynchroon op de route, synchroon in de overlay.** Op `/huidtest` verandert de stack pas bij `popstate`, terwijl de swipe-vlag al in de volgende animation frame wordt gewist. Aangetoond risico, nog geen aangetoonde bug: eerst karakteriseren met een protocoltest plus een handmatige test op een telefoon, geen gedragswijziging in deze refactor.
4. **Drie gedragingen die op een fout lijken en toch moeten blijven:** de voortgangsnoemer verspringt al bij het *kiezen* van "gevoelig" (ongeveer 73,33% → 84%), elke pijltjestoets in de radiogroup stuurt een `huidtest_vraag`, en `restart()` pusht vraag 1 bovenop de bestaande stack in plaats van te resetten.
5. **Twee dingen die stilzwijgend breken bij een nette extractie:** `peekX` leest bewust de actuele DOM-breedte via de ref en mag niet worden vervangen door de gemeten `stageWidth`-state; en de objectidentiteit van `Step` is functioneel, omdat focus en exit-analytics op `[step]` luisteren.

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
src/lib/huidtest/
  flow.ts                           # pure engine: stappen, transitions, progressie, effects
  flow.test.ts                      # karakterisering van de volledige quizflow
src/components/huidtest/
  huidtest-quiz.tsx                 # dunne composition root
  huidtest-intro.tsx                # alleen intro/age gate
  huidtest-progress.tsx             # progressbar + result hold animation
  huidtest-step-stage.tsx           # AnimatePresence, drag, peek, richting en handover
  huidtest-question-actions.tsx      # vaste volgende/terug-actiebalk
  use-huidtest-flow.ts              # interpreter: React-state + history- en analytics-adapter
  use-huidtest-stage-metrics.ts      # ResizeObserver en desktophoogte
```

De pure engine staat in `src/lib/huidtest/`, naast `decide.ts` en `share.ts`: logica zonder React hoort daar, en de bestaande vitest-include dekt die map al.

De grens tussen engine en UI-laag is expliciet, omdat hij anders gaandeweg vervaagt:

| In `flow.ts` | In de UI-laag |
|---|---|
| `stack`, `answers`, `started` | `dragX`, `peekX`, `peekStep` |
| welke stap volgt op welke actie | `direction`, `swipedBack` |
| history `push` / `back` als effect | `stageWidth`, `questionStageHeight` |
| analytics-events en hun volgorde | `travel`, springwaarden, drempels |
| voortgangspercentage | `AnimatePresence`-mode, keys, variants |

`flow.ts` importeert niets uit `framer-motion`. `direction` en `swipedBack` zijn bewegingsbeleid: ze volgen uit de *oorzaak* van een overgang, die de engine rapporteert, en de stage vertaalt die naar richting en handover.

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

Screenshots met het oog vergelijken is hierbij de zwakste schakel. Leg daarom per staat ook de `outerHTML` van de quiz-root vast, met de inline `style`-attributen die Framer per frame schrijft eruit gestript. Klassen, ARIA, structuur en volgorde blijven dan in de vergelijking, en een diff na iedere fase wijst een ongewenste markupwijziging meteen aan. De screenshots blijven ernaast nodig: een diff ziet geen verkeerde springwaarde.

Noteer tot slot het aantal analytics-events per doorloop uit de console, zodat “analytics blijft gelijk” een getal heeft om tegen te toetsen.

### Fase 0,5 — de dubbele resultaatmeting, in een eigen commit

Repareer punt 2 uit “Correcties na codeverificatie” vóór de eerste structurele wijziging, als losse commit. Minimale ingreep: memoiseer het adviesobject, of laat het effect op stabiele primitieven luisteren (`bank`, `stand`, `product`). Werk daarna het genoteerde aantal analytics-events uit fase 0 bij.

Bouw hier nog niets om: de structurele oplossing — het event ontstaat bij de overgang naar `resultaat` in plaats van bij een render — komt vanzelf in fase 2. Het aantal blijft dan één, alleen de plek verschuift.

### Fase 1 — pure flowfuncties extraheren

Maak `src/lib/huidtest/flow.ts` en verplaats, zonder gedragswijziging:

- `Step`;
- `openingStep`;
- `isComplete`;
- `nextStep`;
- voortgangsberekening;
- eventueel `stepKey`, `currentAnswer` en `canSwipeBack` als pure selectors.

Gebruik functies met expliciete input, bijvoorbeeld:

```ts
nextStep(index, answers, questions)
progressFor(step, answers, questionCount)
openingStep(sharedAnswers)
```

Verplaats het commentaar mee met de code waarvan het de reden uitlegt. Voer analytics en history hier nog niet uit en voer ze ook later niet uit — in fase 2 worden het beschreven effects, geen aanroepen.

Voeg `flow.test.ts` toe voordat de component verder wordt opgesplitst.

### Fase 2 — transition engine met declaratieve effects

Breid `flow.ts` uit tot een engine die per actie zegt wat de nieuwe state is, welke gevolgen die heeft, en of het scherm wisselde:

```ts
export function init(
  shared: QuizAnswers | null,
  config: FlowConfig,
): { state: FlowState; effects: FlowEffect[] };

export function transition(
  state: FlowState,
  action: FlowAction,
  config: FlowConfig,
): { state: FlowState; effects: FlowEffect[]; transition: Transition };
```

```ts
type FlowState = { stack: Step[]; answers: Partial<QuizAnswers>; started: boolean };

type FlowAction =
  | { type: "confirmAge"; age: "ok" | "minor" }
  | { type: "select"; index: number; id: string }
  | { type: "toggleTattoo"; checked: boolean }
  | { type: "advance"; index: number }
  | { type: "backRequest" }
  | { type: "popstate" }
  | { type: "restart" };

type FlowEffect =
  | { type: "track"; event: AnalyticsEvent["name"]; props: Record<string, unknown> }
  | { type: "historyPush" }
  | { type: "historyBack" };

/** `null` als het scherm niet wisselt. */
type Transition = { from: Step; to: Step; cause: "advance" | "back" | "browser-back" | "restart" } | null;
```

Belangrijk:

- History en analytics worden **beschreven** in de engine en **uitgevoerd** in de interpreter. Zo leggen gewone `toEqual`-tests het aantal, de payload en de volgorde vast, in de Node-omgeving die er al staat.
- `init` is een volwaardige actie, geen constructor. Een gedeelde URL kan direct op een exit of een resultaat openen, dus die schermen leveren hun eigen `huidtest_exit` respectievelijk `huidtest_resultaat`. Resultaat- en exit-effecten mogen niet uitsluitend uit “volgende vraag”-acties ontstaan. `init` pusht nooit history.
- Effecten hangen aan echte overgangen, niet aan toevallige objectidentiteit. Een actie die het scherm niet wisselt geeft `transition: null` en **dezelfde `stack`-referentie** terug. Dat is wat `useEffect(..., [step])` voor focus en exit-analytics ongewijzigd bruikbaar houdt.
- Behoud exact het verschil tussen `historyBacked=true` op de route en `false` in de overlay. Op de route verandert `backRequest` de stack niet; pas `popstate` popt.
- Behoud dat antwoordselectie niet automatisch doorgaat; pas de knop “Volgende” bevestigt een keuze.
- Behoud de timing van de swipe-handover exact, inclusief het risico uit punt 3. De oorzaak van een openstaande `backRequest` meedragen door `popstate` heen zou dat oplossen — dat is de fix, niet de refactor.

De interpreter (`use-huidtest-flow.ts`) voert effects uit in de event handler, nooit binnen een `setState`-updater: React kan zo’n updater opnieuw aanroepen, en dan verdubbelen de analytics precies zoals in punt 2.

```ts
const dispatch = useCallback((action: FlowAction) => {
  const result = transition(stateRef.current, action, config);
  stateRef.current = result.state;
  setState(result.state);
  for (const effect of result.effects) run(effect);
  return result.transition;
}, [config]);
```

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

Let op: een hook die netjes `stageWidth` teruggeeft nodigt uit om die waarde ook in `peekX` en in het doel van de release-animatie te gebruiken. Dat is een gedragswijziging. Die twee lezen bewust `stageRef.current?.offsetWidth`, omdat de transform niet-reactief is en de actuele breedte moet zien op het moment dat hij wordt geëvalueerd.

### Fase 5 — stage en gestures isoleren

Verplaats daarna pas het blok met `dragX`, `peekX`, `AnimatePresence`, `peekStep` en de release-animation naar `huidtest-step-stage.tsx`. Hier landen ook `direction` en `swipedBack`: de stage leest de `cause` die de engine teruggeeft en vertaalt die naar richting — `advance` en `restart` vooruit, `back` en `browser-back` terug. `swipedBack` blijft gezet worden door de gesture zelf en niet door de oorzaak, anders verandert de timing op de route.

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

### Start en gedeelde links (`init`)

- zonder gedeelde antwoorden opent de intro, zonder effects;
- complete veilige gedeelde antwoorden openen resultaat, met één `huidtest_resultaat` en de payload van `decide()`;
- onvolledige gedeelde antwoorden openen het “nog niet af”-scherm, zonder effects;
- gedeelde antwoorden met huidtype 1 openen de juiste exit, met één `huidtest_exit`;
- gedeelde antwoorden met rossig haar openen de juiste exit, met één `huidtest_exit`;
- `init` pusht nooit history, ook niet met `historyBacked=true`.

### Leeftijd en veiligheids-exits

- minderjarig gaat naar `exit/minor`;
- huidtype 1 gaat na bevestiging naar `exit/type1`;
- rossig haar gaat na bevestiging naar `exit/rossig`;
- er wordt in deze gevallen nooit een advies berekend of getoond.

### Vraagvolgorde

- een antwoord selecteren wijzigt answers maar niet direct de step: `transition: null` en dezelfde `stack`-referentie;
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

Leg de exacte waarden vast, inclusief de afronding die `aria-valuenow` toont:

| Stap | `progress` | `aria-valuenow` |
|---|---|---|
| intro | 10 | 10 |
| vraag 1 (index 0) | 20 | 20 |
| vraag 2 | 33,33 | 33 |
| vraag 5, nog niets gekozen | 73,33 | 73 |
| vraag 5, “gevoelig” gekozen | 84 | 84 |
| vraag 6 (index 5) | 86,67 | 87 |
| elke exit | 20 | 20 |
| resultaat | 100 | 100 |

De sprong van 73 naar 84 op vraag 5 is bestaand gedrag: de noemer leest `answers.huidgevoel`, dat al bij het kiezen wordt geschreven. Vastleggen, niet repareren.

### Effects, volgorde en identiteit

- op de route levert `advance` een `historyPush`, in de overlay niets;
- na elke reeks acties op de route geldt: aantal pushes = `stack.length - 1`;
- `backRequest` levert op de route `historyBack` en laat de stack ongemoeid; `popstate` popt daarna met `cause: "browser-back"`;
- `confirmAge("ok")` levert `huidtest_start` precies één keer per sessie, ook na herstart; `confirmAge("minor")` levert het niet;
- `select` levert altijd `huidtest_vraag`, ook bij dezelfde optie, en nooit een exit- of resultaat-event;
- elke overgang naar een exit of naar een compleet resultaat levert het bijbehorende event precies één keer;
- stappen die blijven staan houden hun objectreferentie: `next.stack[0] === state.stack[0]`.

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
- `peekX` en het doel van de release-animatie blijven de actuele DOM-breedte via `stageRef` lezen, niet de gemeten `stageWidth`-state.
- De objectidentiteit van een `Step` verandert alleen bij een echte schermwissel, zodat focus en exit-analytics niet per render opnieuw afgaan.
- `flow.ts` importeert niets uit `framer-motion`, en de stage bevat geen enkele flowbeslissing.

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

1. `fix(huidtest): report the result once`
2. `test: characterize huidtest flow`
3. `refactor: extract pure huidtest flow`
4. `refactor: isolate huidtest state and history`
5. `refactor: extract huidtest progress and metrics`
6. `refactor: isolate huidtest step stage`
7. `refactor: simplify huidtest composition`

Iedere commit moet zelfstandig lint, typecheck en tests doorstaan.

## Startprompt voor een volgende Codex-sessie

Gebruik desgewenst deze tekst samen met dit document:

> Refactor de Ever Sun-huidtest volgens `docs/HUIDTEST_REFACTOR_HANDOFF.md`. Lees “Correcties na codeverificatie” eerst; die gaat vóór de rest van het document. Werk gefaseerd: eerst de dubbele resultaatmeting in een eigen commit, dan karakteriseringstests, dan een pure transition engine met declaratieve effects. Behoud alle adviesuitkomsten, analytics, browserhistory, DOM-structuur, CSS-klassen, responsive layout en Motion-gedrag. Laat de bestaande devserver draaien. Voer na iedere fase lint, typecheck en tests uit en controleer overlay, `/huidtest`, mobiel, desktop en terug-swipe visueel. Stop niet bij een half werkende tussenstaat en combineer dit niet met functionele of visuele wijzigingen.

## Definitie van klaar

De refactor is klaar wanneer:

- de pure flow volledig unit-getest is, inclusief `init`, history-effects en analytics-volgorde;
- `huidtest-quiz.tsx` vooral compositie bevat;
- flow, progressie, metingen en stage/gesture elk een duidelijke eigenaar hebben, en de grens uit “Voorgestelde doelstructuur” overeind staat;
- overlay en route dezelfde quiz blijven gebruiken;
- alle bestaande tests en nieuwe flowtests slagen;
- de visuele en gedragsmatige invarianten hierboven op mobiel en desktop zijn bevestigd;
- er geen wijziging is in welk advies een klant ontvangt.
