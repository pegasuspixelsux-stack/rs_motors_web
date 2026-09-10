# Design

<!-- impeccable:design-schema 1 -->

Soft premium surface system for the RS Motors marketplace. Matte charcoal ground;
cards and panels float on diffused shadows rather than borders. Inter throughout,
tight tracking, generous air. One automotive red.

## Foundations

**Platform:** web · Next.js App Router (16), React 19, Tailwind CSS v4, TypeScript.
The homepage ships as one client component (`app/page.tsx`); shared primitives in
`components/`, data/config in `lib/`.

**Theme:** dark only.

## Color

Tokens live in `app/globals.css` under `@theme` (`--color-*`).

| Token | Value | Role |
|---|---|---|
| `ground` | `#0a0a0b` | page background |
| `surface` | `#161618` | cards, panels, nav |
| `surface-2` | `#1e1e22` | nested surface (inputs, inner cards) |
| `surface-hi` | `#26262b` | hover / focus fill |
| `ink` | `#f5f5f7` | primary text |
| `ink-dim` | `#a8a8b2` | secondary text |
| `ink-faint` | `#8a8a94` | tertiary text, labels, disclaimers |
| `hairline` | `rgba(255,255,255,.07)` | the only borders — nav + footer rules |
| `red` | `#dc2626` | primary action, active state |
| `red-hi` | `#ef4444` | hover, and the large accent numerals / accent words |

Red is the single accent: primary buttons, the active tab/filter/page pill, the
"recién ingresado" dot, the large payment figure, and the one red phrase in the
hero headline. Never decorative.

## Type

`Inter` (variable, self-hosted via `next/font`) for everything, with
`letter-spacing: -0.011em` on `body`.

- Display / H1: `clamp(2.75rem, 7.5vw, 5.5rem)`, weight 600, tracking `-0.04em`, line-height ~1.0
- Section H2: `clamp(2rem, 4vw, 3rem)`, weight 600, tracking `-0.03em`
- In-panel H3: `clamp(1.9rem, 2.6vw, 2.5rem)`, weight 600
- Body: 16–19px, line-height ~1.6, `ink-dim`
- Payment figure: 52 → 68px, weight **700**, `red-hi` — the primary visual anchor
- Labels / meta: 11–13px, weight 500, `ink-faint`
- Numeric data: add `.tnum` (tabular figures)

## Shape & depth

- Radius: cards `22px`, big panels `28–32px`, inputs / small controls `14–16px`, pills `999px`
- No structural borders. Elevation = shadow only:
  - `--shadow-pop` — subtle lift (metric cards)
  - `--shadow-soft` — standard float (vehicle cards, tool panels)
  - `--shadow-float` — prominent (contact panel, hover state of vehicle cards)
- Vehicle cards lift `-4px` + upgrade to `--shadow-float` on hover; photo scales `1.03`.

## Layout

- Content max-width `1320px`, side padding `20px` → `32px` (sm+)
- Section rhythm: `py-24` → `py-32` (sm+); a section with no heading drops its top padding
- 2-column sections (Nosotros, Contacto, tool panels) are `lg:grid-cols-2` with
  `lg:items-center` (or `lg:items-stretch` when the columns should match height),
  `gap` 14 → 20
- Inventory grid: `grid-cols-1 → 2 → 3 → 4` (xl), `gap-6`

## Motion

- `Odometer` — numeric readouts ease from previous to next value (`easeOutExpo`,
  ~0.5–1.1s); honours `prefers-reduced-motion` (snaps).
- Hero background: muted looping `<video>` (`/videos/hero.mp4`, ~900 KB) with a
  poster; `autoPlay` disabled under reduced motion. Two stacked gradient scrims
  (`from-ground/75 via-ground/45 to-ground/10` + a bottom fade to `ground`) keep
  text legible; hero H1/P also carry a `text-shadow`.
- Hover/press transitions ~150–300ms ease-out. `html { scroll-behavior: smooth }`
  (auto under reduced motion).

## Components

- `RSMark` — owner logo (`public/images/rs_logo.png` red / `rs_logo_white.png`);
  `Wordmark` pairs it with a tracked "MOTORS".
- `VehicleCard` — photo (4:3, status pill overlay) + body: title (min 2 lines) ·
  spec line · **cuota `/mes`** (primary) · price (secondary) · finance disclaimer ·
  red "Consultar" pill → prefilled WhatsApp · faint ID/ingreso/ubicación line.
- `Odometer`, `WhatsappGlyph` (authored single-colour SVG).
- Segmented controls (filters, tabs, pagination): pill children, active = `red`,
  idle = `surface` → `surface-hi` on hover.
- Inputs: `surface-2` fill, `rounded-2xl`, no border, `focus:bg-surface-hi`.
  Range sliders: 6px rounded track, 22px white circular thumb (themed in globals).

## Content & data

- Language: Uruguayan Spanish only.
- `lib/inventory.ts` — 16 mock vehicles; `getInventory()` is the single swap point
  for a live backend (Supabase). Photos in `public/images/vehicles/` are
  illustrative stock (see `SOURCES.md`) — replace before launch.
- `lib/finance.ts` — cuota = 30% down · 60 months · TNA 6.97% (illustrative;
  every quote "sujeto a aprobación crediticia").
- `lib/site.ts` — contact config. Address is real
  (Ave. Joaquín de Viana y Román Bergalli, Maldonado); phone number and hours are
  placeholders pending the owner.
- Instagram feed-post template: `/plantilla-instagram` + `INSTAGRAM_TEMPLATE.md`
  (1080×1350; on-graphic copy limited to marca / modelo / año / estado).
