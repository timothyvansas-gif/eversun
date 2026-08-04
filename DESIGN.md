# Ever Sun — Design System

## Kleuren

| Token              | Hex       | Gebruik                        |
|--------------------|-----------|--------------------------------|
| `--color-brand`    | `#FDC43F` | Gele accenten, parkeren card   |
| `--color-surface-page` | `#FAF4EC` | Pagina achtergrond (warm crème) |

## Typografie

| Font     | Variabele          | Gebruik              |
|----------|--------------------|----------------------|
| Figtree  | `--font-display`   | Titels, headings     |
| Inter    | `--font-sans`      | Body, labels, UI     |

### Stijlen

| Naam           | Font    | Gewicht   | Grootte | Line-height | Letter-spacing |
|----------------|---------|-----------|---------|-------------|----------------|
| Sectie titel   | Figtree | Semibold  | 48px    | auto        | -1.5%          |
| Sectie body    | Inter   | Medium    | 20px    | 32px        | -2px           |
| Card titel     | Figtree | Semibold  | 24px    | auto        | -1.5%          |
| Card body      | Inter   | Regular   | 15px    | 24px        | -1%            |

CSS classes: `.card-title`, `.card-body` (gedefinieerd in `globals.css`)

## Bento — Afmetingen

| Card               | Breedte | Hoogte | Achtergrond            |
|--------------------|---------|--------|------------------------|
| 1 — Warm welkom    | 853px   | 431px  | `white`                |
| 2 — Parkeren       | 411px   | 431px  | `#FDC43F` + `bg-park-yellow.svg` (top 40px) |
| 3 — Exclusieve merken | 411px | 362px | `white`               |
| 4 — Persoonlijk advies | 535px | 362px | `zinc-800`           |
| 5 — Ultieme luxe   | 302px   | 362px  | `white`                |

Gap tussen cards: `16px`
Padding per card: `40px`
Border-radius: `8px`

## Spacing

Basis: **8px grid** — Tailwind mapping: `2=8px · 4=16px · 8=32px · 10=40px`
