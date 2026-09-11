import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { getInventory, type Vehicle } from "./inventory";
import { SALESMEN } from "./salesmen";

/**
 * Real Firestore-backed inventory store for the admin panel ("vehicles"
 * collection). The PUBLIC site (app/page.tsx, /unidades/[slug]) still reads
 * the static seed in lib/inventory.ts — connecting the public listings to
 * this same collection is a separate, larger change (it'd need the
 * homepage's synchronous static data to become an async fetch) and is out
 * of scope for this pass. See lib/firebase.ts for the auth/rules caveat.
 */

export type AdminVehicle = Vehicle & {
  publicado: boolean;
  assignedSalesman: string;
  description: string;
  features: string;
  photos?: string[];
};

const COLLECTION = "vehicles";

function toAdminVehicle(id: string, data: Record<string, unknown>): AdminVehicle {
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
    publicado: data.publicado !== false,
    assignedSalesman: (data.assignedSalesman as string) ?? SALESMEN[0],
    description: (data.description as string) ?? "",
    features: (data.features as string) ?? "",
    photos: Array.isArray(data.photos) ? (data.photos as string[]) : undefined,
  };
}

/**
 * Reads the "vehicles" collection; the first time it's empty, seeds it from
 * the static demo inventory (lib/inventory.ts) so the admin doesn't open to
 * a blank table — a one-time migration, not an ongoing sync.
 */
export async function getAdminVehicles(): Promise<AdminVehicle[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  if (snap.empty) {
    const seed = getInventory();
    await Promise.all(
      seed.map((v, i) =>
        setDoc(doc(db, COLLECTION, v.id), {
          ...v,
          publicado: true,
          assignedSalesman: SALESMEN[i % SALESMEN.length],
          description: "",
          features: "",
        }),
      ),
    );
    const reseeded = await getDocs(collection(db, COLLECTION));
    return reseeded.docs.map((d) => toAdminVehicle(d.id, d.data()));
  }
  return snap.docs.map((d) => toAdminVehicle(d.id, d.data()));
}

export type NewVehicleInput = {
  marca: string;
  modelo: string;
  anio: number;
  precioUSD: number;
  km: number;
  transmision: Vehicle["transmision"];
  tagline: string;
  description: string;
  features: string;
  assignedSalesman: string;
  /** Firebase Storage download URLs, in photo-slot order. */
  photos: string[];
};

export async function createVehicle(
  input: NewVehicleInput,
  fallbackImage: string,
): Promise<void> {
  const slug =
    `${input.marca}-${input.modelo}-${input.anio}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `unidad-${Date.now()}`;

  await addDoc(collection(db, COLLECTION), {
    slug,
    marca: input.marca,
    modelo: input.modelo,
    version: input.tagline,
    anio: input.anio,
    km: input.km,
    precioUSD: input.precioUSD,
    combustible: "Nafta",
    transmision: input.transmision,
    categoria: "Sedán",
    puertas: 4,
    status: "recien-ingresado",
    ingreso: new Date().toISOString().slice(0, 10),
    ubicacion: "Maldonado",
    inspeccionado: false,
    imagen: input.photos[0] ?? fallbackImage,
    photos: input.photos,
    publicado: true,
    assignedSalesman: input.assignedSalesman,
    description: input.description,
    features: input.features,
  });
}

export async function updateVehicle(
  id: string,
  patch: Partial<AdminVehicle>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), patch);
}

export async function toggleVehiclePublished(
  id: string,
  current: boolean,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { publicado: !current });
}

export async function deleteVehicle(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
