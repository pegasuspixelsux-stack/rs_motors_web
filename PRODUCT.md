# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: used-car buyers in Maldonado, Uruguay** and the wider Departamento de Maldonado / Punta del Este region. They arrive mostly on mobile, often from social media, looking for a specific kind of car within a budget. Their job: see what RS Motors currently has, judge whether a vehicle is worth a visit, and reach the dealership to ask questions or arrange to see it in person.

**Secondary: RS Motors sales staff** who receive the enquiries the site generates and respond to them (typically over WhatsApp/phone).

Interface language is Uruguayan Spanish.

## Product Purpose

A lead-generation website for RS Motors, an independent used-car dealership, plus a reusable Instagram feed-post graphic template that matches it. The website presents current inventory and turns interested visitors into direct contact — WhatsApp message, phone call, or enquiry form — tied to a specific vehicle where possible. The Instagram template is a standing blueprint the dealership reuses to post individual vehicles to social, where most traffic originates. Success is measured in qualified enquiries reaching the sales team, not on-site transactions.

## Deliverable Surfaces

1. **Website** — hero + fast inventory grid, per-vehicle detail, a "Nosotros" section, and a contact/location footer. "Newspaper classified" simplicity: no brand manifesto, minimal fluff, quick to scan on a phone.
2. **Instagram feed-post template** — a reusable layout specification (and reference implementation) for posting one vehicle per graphic. On-graphic copy is strictly Make / Model / Year / Status only; price, kilometres, and details belong in the caption, never the image.

## Positioning

Independent, all-makes used-car dealer with an established local presence in Maldonado. Not tied to any manufacturer franchise, so inventory spans many makes and price points rather than one brand's line-up. Any sharper positioning claim (specialisation, guarantees, years in business, reputation markers) is **undecided** and must not be invented.

## Operating Context

- Buyers browse predominantly on phones, frequently arriving from Instagram / Facebook Marketplace links.
- First contact almost always happens over WhatsApp; phone and in-person walk-ins at the physical lot also occur.
- Buying a car involves an in-person viewing and test drive at the dealership.
- Trade-in ("permuta") and financing are common expectations in this market; whether RS Motors offers them and on what terms is **undecided**.
- Used-car prices in Uruguay are commonly quoted in USD, sometimes UYU — the currency convention for this site is **undecided**.

## Capabilities and Constraints

Confirmed scope:
- Browsable inventory of vehicles for sale, with per-vehicle detail (make, model, year, mileage in km, price, photos).
- Fast client-side filtering of the inventory grid by category / model.
- Per-vehicle status tags in Spanish — confirmed values so far: **"Disponible"**, **"Recién Ingresado"**.
- Lead capture on every relevant surface: WhatsApp click-to-chat (primary), phone link, contact form, dealership location/map.
- A "Nosotros" section (short, factual — content pending from owner).
- Spanish-language UI throughout.
- Instagram feed-post template as a standalone deliverable surface (see Deliverable Surfaces).

Explicitly undecided (do not fabricate):
- Where inventory data comes from (CMS, manual entry, external feed) and how often it updates.
- Whether financing, trade-in valuation, or online reservation/deposit flows exist.
- Pricing currency (USD vs UYU) and whether prices are shown at all vs "consultar".
- Number of physical locations and exact address/hours.
- Any second language.

## Brand Commitments

- Name: **RS Motors**.
- **Colour direction (binding):** a high-contrast dark foundation (deep charcoal / near-black) paired with a bold automotive red accent — crimson, around `#DC2626` — reserved for CTAs, badges, and active states.
- **Positioning of the look (binding):** reads like an exclusive high-end showroom, but the inventory is honest everyday stock (Golf, Fiat, commuters). Confident, clean, unpretentious — not luxury cosplay.
- **Logo (received):** owner-supplied "RS" mark — a bold, sheared/italic monogram in vivid red on transparent. Files: `public/images/rs_logo.png` (red, for dark surfaces), `public/images/rs_logo_white.png` (white, for red surfaces), `app/icon.png` (favicon). It is the identity anchor; don't redraw it.
- Brand voice: direct and plain-spoken, Uruguayan Spanish. No superlatives, no invented awards. "Precio sin vueltas" over "no-bullshit".

## Evidence on Hand

None in the repository yet. No real vehicle photos, inventory data, pricing, testimonials, customer names, sales figures, awards, or marketing copy are available. Logo and colour palette are pending from the owner. Future work must not invent inventory, customer quotes, review scores, "trusted by" claims, or years-in-business figures.

## Product Principles

1. **Every screen serves the enquiry.** From any vehicle or page, contacting RS Motors about that car is one tap away — WhatsApp first.
2. **Mobile-first, social-referral-first.** The typical visitor is on a phone, arriving from a social post, deciding in seconds whether this dealer is worth their time.
3. **Spanish-first and Maldonado-local.** Language, currency, geography, and contact norms reflect the Uruguayan used-car market, never a generic dealership template.
4. **Trust is built from specifics.** Honest vehicle details (year, km, condition), real photography, and clear next steps persuade — not superlatives or invented social proof.
5. **The existing brand leads the look.** The pending RS Motors logo and palette are the visual foundation; design decisions defer to them rather than competing with them.
