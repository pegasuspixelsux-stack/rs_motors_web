# RS Motors — plantilla de Instagram (feed)

Reusable blueprint for posting **one vehicle per graphic**. A live reference
implementation renders at `/plantilla-instagram`.

## Frame

| | |
|---|---|
| Size | **1080 × 1350 px** (4:5, feed portrait) |
| Background | `#0B0C0E` (instrument ground) |
| Safe margin | 64 px on every edge |

## What goes ON the graphic

Only four fields — nothing else:

1. **Marca** — Saira Condensed, 42 px, semibold, uppercase, tracking 0.12em, `#9C988C`
2. **Modelo** — Saira Condensed, 110 px, bold, uppercase, tracking -0.02em, `#ECE8E0`
3. **Año** — Azeret Mono, 92 px, medium, `#F5433B` (the only large red element)
4. **Estado** — lamp + label. Saira Condensed 34 px semibold uppercase.
   - `Recién ingresado` → solid `#F5433B` 24 px square + 24 px glow
   - `Disponible` → hollow 2 px `#3A3D43` square

**Never on the graphic:** price, kilómetros, motor, transmisión, financiación,
teléfono. Those live in the caption.

## Layout (top → bottom)

| Band | Height | Contents |
|---|---|---|
| Top chrome | y 56–120 | RS mark (red, 44 px tall) left · `MALDONADO` (24 px, tracking 0.24em, dim) right |
| Photo | y 0 → 783 (58%) | vehicle photo, `object-fit: cover`, saturation 0.9, gradient `from-ground/30 via-transparent to-ground` |
| Lower panel | y 783 → 1350 | gauge-scale hairline · Marca / Modelo (left) + Año (right, baseline-aligned) · divider · Estado (left) + `Consultá por WhatsApp` (right) |

## Caption template

```
{Marca} {Modelo} {Versión} · {Año}
{km} km · {combustible} · {transmisión}
Precio: {US$ precio}  |  Permuta y financiación

100% inspeccionado antes de publicar.
Escribinos por WhatsApp 👉 {link}
Ref. {ID} · Maldonado
#autosusados #maldonado #puntadeleste #{marca}{modelo}
```

## Producing a post

1. Open `/plantilla-instagram`, choose the unit.
2. Set preview zoom to 100 %.
3. Capture the 1080 × 1350 frame (browser screenshot / device-toolbar capture).
4. Paste the caption from the template above, fill the bracketed fields.

## Story / Reel variant (later)

Same system at 1080 × 1920: photo fills the top 62 %, the lower panel keeps the
Marca / Modelo / Año / Estado stack, add a bottom sticker zone for the swipe-up.
