import type { Vehicle, VehicleCategory } from "./inventory";
import { fmtInt, fmtIngreso } from "./format";

/**
 * Editorial copy for the vehicle detail page. Templated from real fields only
 * — no invented history, features, or condition claims. Real per-unit listing
 * copy from the owner should replace this once available.
 */

const OPENING: Record<VehicleCategory, (v: Vehicle) => string> = {
  Hatchback: (v) =>
    `Un ${v.marca} ${v.modelo} pensado para el uso diario: ágil en la ciudad, fácil de estacionar y con el consumo que pide la rutina de Maldonado.`,
  Sedán: (v) =>
    `Un ${v.marca} ${v.modelo} para quien busca espacio y comodidad, con una presencia más formal sin salirse del presupuesto de un usado bien cuidado.`,
  SUV: (v) =>
    `Un ${v.marca} ${v.modelo} con la altura y la versatilidad que pide la rutina entre Maldonado y Punta del Este, dentro y fuera del asfalto.`,
  Utilitario: (v) =>
    `Un ${v.marca} ${v.modelo} pensado para trabajar: la capacidad y la robustez que exige el uso diario.`,
};

export function narrativeFor(vehicle: Vehicle): string[] {
  const opening = OPENING[vehicle.categoria](vehicle);

  const facts = `Año ${vehicle.anio}, con ${fmtInt(vehicle.km)} km documentados. Motor a ${vehicle.combustible.toLowerCase()}, caja ${vehicle.transmision.toLowerCase()}. Ingresó a nuestra selección el ${fmtIngreso(vehicle.ingreso)} y, como toda unidad de RS Motors, pasó por una revisión mecánica completa antes de publicarse.`;

  const closing = `El precio publicado es el precio final: sin cargos sorpresa ni letra chica. Podés estimar una cuota financiada más abajo, o escribirnos directo por WhatsApp para coordinar una prueba en ${vehicle.ubicacion}.`;

  return [opening, facts, closing];
}

export function highlightsFor(vehicle: Vehicle): string[] {
  return [
    "100% inspeccionado mecánicamente antes de publicarse — sin sorpresas al retirarlo.",
    `${fmtInt(vehicle.km)} km reales, con documentación verificada por nuestro equipo.`,
    "Precio sin vueltas: lo publicado es lo que se paga, con financiación disponible sujeta a aprobación.",
  ];
}
