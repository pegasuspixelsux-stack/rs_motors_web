import type { Vehicle } from "./inventory";

/**
 * Shared demo photo pool (see public/images/vehicles/SOURCES.md). Real
 * listings will carry their own multi-photo sets from the dealership; until
 * then each vehicle's detail-page gallery leads with its card photo and
 * rounds itself out from this pool, deterministically, so a given vehicle
 * always shows the same set.
 */
const PHOTO_POOL = [
  "/images/vehicles/car-1.jpg",
  "/images/vehicles/car-2.jpg",
  "/images/vehicles/car-5.jpg",
  "/images/vehicles/car-12.jpg",
  "/images/vehicles/car-15.jpg",
  "/images/vehicles/car-16.jpg",
  "/images/vehicles/car-17.jpg",
];

export function galleryFor(vehicle: Vehicle, count = 4): string[] {
  const others = PHOTO_POOL.filter((p) => p !== vehicle.imagen);
  const seed = [...vehicle.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const offset = seed % others.length;
  const rotated = [...others.slice(offset), ...others.slice(0, offset)];
  return [vehicle.imagen, ...rotated].slice(0, count);
}
