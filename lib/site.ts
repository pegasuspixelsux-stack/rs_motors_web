/**
 * Static site configuration. Replace the placeholder contact details with the
 * real ones before launch — see the `TODO` markers.
 */
export const SITE = {
  name: "RS Motors",
  city: "Maldonado",
  region: "Maldonado · Punta del Este",
  tagline: "Estándar de exigencia. Autos de todos los días.",

  // TODO: real dealership WhatsApp line (international format, no +).
  whatsappNumber: "59894000000",
  phoneDisplay: "094 000 000",

  address: "Ave. Joaquín de Viana y Román Bergalli, Maldonado",
  // TODO: confirm opening hours.
  hours: "Lun–Vie 9–19 · Sáb 9–13",
  mapsQuery: "Joaquín de Viana y Román Bergalli, Maldonado, Uruguay",

  instagramHandle: "rsmotors.uy",
  instagramUrl: "https://instagram.com/rsmotors.uy",

  // TODO: confirm real Facebook page and TikTok account.
  facebookUrl: "https://facebook.com/rsmotors.uy",
  tiktokUrl: "https://tiktok.com/@rsmotors.uy",
} as const;

export function waLink(message: string, number: string = SITE.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// Leading "/" so these resolve correctly from any route (home included) —
// Nav and Footer are shared across the homepage and vehicle detail pages.
export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#unidades", label: "Unidades" },
  { href: "/#herramientas", label: "Financiación" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#contacto", label: "Contacto" },
] as const;
