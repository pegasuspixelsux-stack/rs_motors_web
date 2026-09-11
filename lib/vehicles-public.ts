import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Vehicle } from "./inventory";

/**
 * Public-facing read of the real "vehicles" Firestore collection — the same
 * collection the admin panel (lib/inventory-store.ts) writes to. Only
 * documents with `publicado !== false` are shown. Zero published vehicles is
 * a legitimate real state (e.g. inventory being restocked) and renders as an
 * empty list, NOT the old static demo seed — that seed only exists now as
 * the admin panel's one-time "don't open to a blank table" convenience
 * (lib/inventory-store.ts) and must never leak onto the public site again.
 * The static seed is used here only as a last-resort fallback on a genuine
 * fetch error (offline build, misconfigured rules) so the page still renders.
 */

const COLLECTION = "vehicles";

function toVehicle(id: string, data: Record<string, unknown>): Vehicle {
  return {
    id,
    slug: (data.slug as string) ?? id,
    marca: (data.marca as string) ?? "",
    modelo: (data.modelo as string) ?? "",
    version: (data.version as string) ?? "",
    anio: (data.anio as number) ?? new Date().getFullYear(),
    km: (data.km as number) ?? 0,
    precioUSD: (data.precioUSD as number) ?? 0,
    combustible: (data.combustible as Vehicle["combustible"]) ?? "Nafta",
    transmision: (data.transmision as Vehicle["transmision"]) ?? "Automática",
    categoria: (data.categoria as Vehicle["categoria"]) ?? "Sedán",
    puertas: (data.puertas as number) ?? 4,
    status: (data.status as Vehicle["status"]) ?? "disponible",
    ingreso: (data.ingreso as string) ?? new Date().toISOString().slice(0, 10),
    ubicacion: (data.ubicacion as string) ?? "Maldonado",
    inspeccionado: Boolean(data.inspeccionado),
    imagen: (data.imagen as string) ?? "",
    destacado: Boolean(data.destacado),
    photos: Array.isArray(data.photos) ? (data.photos as string[]) : undefined,
  };
}

export async function getPublicVehicles(): Promise<Vehicle[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));

    const vehicles = snap.docs
      .filter((d) => d.data().publicado !== false)
      .map((d) => toVehicle(d.id, d.data()))
      .filter((v) => v.marca && v.modelo && v.imagen);

    return vehicles.sort((a, b) => b.ingreso.localeCompare(a.ingreso));
  } catch (err) {
    console.error("No se pudo cargar el inventario público de Firestore:", err);
    // Last-resort fallback so the page isn't blank on a genuine fetch error
    // (offline build, misconfigured rules) — NOT used for "zero published
    // vehicles", which is a legitimate real state handled above.
    const { getInventory } = await import("./inventory");
    return getInventory();
  }
}
