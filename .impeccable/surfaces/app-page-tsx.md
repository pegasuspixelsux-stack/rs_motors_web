---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Surface brief — RS Motors marketplace (single-page site) + Instagram feed-post template

Scope: one long public marketing/marketplace page (nav, hero, inventory, calculators, nosotros, contacto, footer) plus a matching Instagram post template.
Visitor mode: Persuade — a Maldonado buyer on a phone, arriving from a social link, deciding whether this lot's current stock is worth a WhatsApp and a visit.
Audience / job / action: used-car buyers in Maldonado / Punta del Este; scan current stock, compare año / km / precio, run a quick finance or trade estimate, open WhatsApp about one specific car.
Proof / content: real current inventory with honest specs and photos; owner "RS" red wordmark; status tags "Disponible" / "Recién ingresado"; "100% inspeccionado" badge. No invented prices, testimonials, rates — finance/trade outputs are labelled estimates.
Constraints: Spanish only (Uruguayan). Mobile-first. WhatsApp is the primary conversion on every surface. Stack: Next.js App Router; page delivered as one client component (`app/page.tsx`), Tailwind v4, lucide-react icons. Real address: **Ave. Joaquín de Viana y Román Bergalli, Maldonado**. Logo files in `public/images/`.
Sections top-to-bottom: sticky nav (RS badge · anchor links · WhatsApp CTA) → hero (headline "Estándar de exigencia. Autos de todos los días.", sub, two CTAs) → inventario (title + search, 4×3 grid = 12/page, 16 items, pagination) → herramientas (tabbed: "Tasá tu usado" / "Calculadora de financiación" with sliders) → nosotros (two-column philosophy + metrics: 100% inspeccionado, precio sin vueltas) → contacto (centered WhatsApp/visit callout, address pinned at the bottom, clean margin) → footer.
Memorable moment: numeric readouts (precio, km, stock count, calculator cuota) count up with a soft ease as they enter view / on change (instant under prefers-reduced-motion).
Unresolved (owner-supplied later): inventory data source; real photos; phone number; hours; APR terms; nosotros copy.

## Direction contract

THESIS: A calm, premium used-car marketplace where every vehicle card feels like a single considered object floating on a matte dark surface. It refuses the category defaults: the full-bleed hero car photo, the translucent glass filter bar, and the hard-edged bordered-box grid.

OWN-WORLD: Matte near-black charcoal ground (#0A0A0B). Cards and primary panels are elevated surfaces (#161618) with **soft diffused shadows, not borders** — 20–24px radius, nothing sharp-cornered, no 1px keylines doing structural work. One automotive red (#DC2626 → hover #EF4444) for the primary action, active state, and the "recién ingresado" dot — nothing else. Type is Inter throughout (SF-Pro register): headings semibold, tight tracking (−0.02 to −0.03em), generous line-height, sporty through weight and size, never blocky or condensed. Numbers use Inter tabular figures. Generous padding everywhere (cards 20–28px, sections 80–120px), real breathing room, asymmetric where it helps — nothing cramped or rigidly stacked.

STORY: The visitor lands on a confident headline, sees a live count of available stock, scans a soft grid of floating vehicle cards comparing año / km / precio, optionally runs a slider finance estimate that eases into place, and taps WhatsApp on one car to open a pre-filled chat.

FIRST VIEWPORT (mobile, 390px): a slim sticky nav — RS mark left, rounded red WhatsApp pill right, links behind a menu. Below: headline "Estándar de exigencia. Autos de todos los días." in large tight Inter semibold with air around it, one-line sub, two rounded CTAs ("Ver inventario" solid red pill, "Financiación y permuta" ghost). Then a quiet inline stat: the stock count easing up to "16 vehículos disponibles". No hero image.

FORM: premium / Apple-inspired soft-surface system — brief-pinned by the user, overriding the earlier instrument-cluster roll (seed 340c766b, candidate 3); this contract replaces it.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
