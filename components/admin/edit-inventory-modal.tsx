"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { SALESMEN } from "@/lib/salesmen";
import type { AdminVehicle } from "@/lib/inventory-store";
import type { Vehicle } from "@/lib/inventory";

/**
 * "Editar unidad" modal — same photo-slot upload flow as
 * add-inventory-modal.tsx (watermark API + Firebase Storage), pre-filled
 * from the existing vehicle so photos can be added or replaced after
 * creation, not just at intake. Also fixes the old inline edit form's
 * cropping: the dialog panel scrolls internally (max-h + overflow-y-auto)
 * instead of relying on the outer overlay's scroll, which clipped the top
 * of the form on shorter viewports.
 */

const PHOTO_SLOTS = [
  { id: 1, label: "Frente (ángulo 3/4 izquierdo)", category: "Frontal · 3 fotos" },
  { id: 2, label: "Frente (centrado)", category: "Frontal · 3 fotos" },
  { id: 3, label: "Frente (ángulo 3/4 derecho)", category: "Frontal · 3 fotos" },
  { id: 4, label: "Trasera (ángulo 3/4 izquierdo)", category: "Trasera · 3 fotos" },
  { id: 5, label: "Trasera (centrada)", category: "Trasera · 3 fotos" },
  { id: 6, label: "Trasera (ángulo 3/4 derecho)", category: "Trasera · 3 fotos" },
  { id: 7, label: "Lateral izquierdo completo", category: "Laterales · 2 fotos" },
  { id: 8, label: "Lateral derecho completo", category: "Laterales · 2 fotos" },
  { id: 9, label: "Interior · tablero y kilometraje", category: "Interior · 2 fotos" },
  { id: 10, label: "Interior · habitáculo general", category: "Interior · 2 fotos" },
] as const;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const field =
  "mt-1.5 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[14px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-red focus:bg-white";
const label = "block text-[12px] font-medium text-neutral-500";
const sectionLabel =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400";

function photosToSlots(photos: string[] | undefined): Record<number, string> {
  const slots: Record<number, string> = {};
  (photos ?? []).forEach((url, i) => {
    if (i < PHOTO_SLOTS.length) slots[PHOTO_SLOTS[i].id] = url;
  });
  return slots;
}

export function EditInventoryModal({
  vehicle,
  onClose,
  onSave,
}: {
  vehicle: AdminVehicle;
  onClose: () => void;
  onSave: (id: string, patch: Partial<AdminVehicle>) => void;
}) {
  const [marca, setMarca] = useState(vehicle.marca);
  const [modelo, setModelo] = useState(vehicle.modelo);
  const [anio, setAnio] = useState(vehicle.anio);
  const [precioUSD, setPrecioUSD] = useState(vehicle.precioUSD);
  const [km, setKm] = useState(vehicle.km);
  const [transmision, setTransmision] = useState<Vehicle["transmision"]>(
    vehicle.transmision,
  );
  const [assignedSalesman, setAssignedSalesman] = useState(
    vehicle.assignedSalesman,
  );
  const [description, setDescription] = useState(vehicle.description);
  const [features, setFeatures] = useState(vehicle.features);

  const [previews, setPreviews] = useState<Record<number, string>>(() =>
    photosToSlots(vehicle.photos),
  );
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [photoErrors, setPhotoErrors] = useState<Record<number, string>>({});

  function setPreview(slotId: number, url: string) {
    setPreviews((prev) => {
      if (prev[slotId]?.startsWith("blob:")) URL.revokeObjectURL(prev[slotId]);
      return { ...prev, [slotId]: url };
    });
  }

  function removePhoto(slotId: number) {
    setPreviews((prev) => {
      if (prev[slotId]?.startsWith("blob:")) URL.revokeObjectURL(prev[slotId]);
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }

  async function handlePhotoChange(slotId: number, file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoErrors((prev) => ({ ...prev, [slotId]: "Supera los 5 MB." }));
      return;
    }
    setPhotoErrors((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    setPreview(slotId, URL.createObjectURL(file));

    setUploading((prev) => ({ ...prev, [slotId]: true }));
    try {
      const body = new FormData();
      body.append("photo", file);
      const res = await fetch("/api/vehicles/photos", {
        method: "POST",
        body,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Error al marcar la foto con agua.");
      }
      const watermarked = await res.blob();
      const path = `inventory/${Date.now()}-slot${slotId}-${file.name}`.replace(/\s+/g, "-");
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, watermarked, { contentType: file.type });
      const downloadURL = await getDownloadURL(storageRef);
      setPreview(slotId, downloadURL);
    } catch (err) {
      setPhotoErrors((prev) => ({
        ...prev,
        [slotId]: err instanceof Error ? err.message : "Error al subir la foto.",
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [slotId]: false }));
    }
  }

  const anyUploading = Object.values(uploading).some(Boolean);
  const photoCount = Object.keys(previews).length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (anyUploading) return;
    const photoUrls = PHOTO_SLOTS.map((s) => previews[s.id]).filter(
      (url): url is string => Boolean(url) && url.startsWith("http"),
    );
    onSave(vehicle.id, {
      marca: marca.trim(),
      modelo: modelo.trim(),
      anio,
      precioUSD,
      km,
      transmision,
      assignedSalesman,
      description: description.trim(),
      features: features.trim(),
      photos: photoUrls,
      imagen: photoUrls[0] ?? vehicle.imagen,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[28px] border border-neutral-200 bg-white p-8 shadow-xl sm:p-10"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-6">
          <div>
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-neutral-900">
              Editar unidad
            </h2>
            <p className="mt-1 text-[13px] text-neutral-400">
              {vehicle.marca} {vehicle.modelo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-8">
          <div className="space-y-4">
            <h3 className={sectionLabel}>1. Especificaciones del vehículo</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className={label}>Marca</span>
                <input
                  required
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className={field}
                />
              </label>
              <label className="block">
                <span className={label}>Modelo</span>
                <input
                  required
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className={field}
                />
              </label>
              <label className="block">
                <span className={label}>Año</span>
                <input
                  required
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(Number(e.target.value))}
                  className={field}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className={label}>Precio de venta (USD)</span>
                <input
                  required
                  type="number"
                  value={precioUSD}
                  onChange={(e) => setPrecioUSD(Number(e.target.value))}
                  className={field}
                />
              </label>
              <label className="block">
                <span className={label}>Kilometraje (km)</span>
                <input
                  required
                  type="number"
                  value={km}
                  onChange={(e) => setKm(Number(e.target.value))}
                  className={field}
                />
              </label>
              <label className="block">
                <span className={label}>Transmisión</span>
                <select
                  value={transmision}
                  onChange={(e) =>
                    setTransmision(e.target.value as Vehicle["transmision"])
                  }
                  className={field}
                >
                  <option value="Automática">Automática</option>
                  <option value="Manual">Manual</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className={label}>Descripción y detalles</span>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Estado general, procedencia, historial..."
                className={field}
              />
            </label>

            <label className="block">
              <span className={label}>Equipamiento (separado por comas)</span>
              <input
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Ej. Cuero, Techo panorámico, Llantas 19 pulgadas"
                className={field}
              />
            </label>

            <label className="block">
              <span className={label}>Asesor asignado</span>
              <select
                value={assignedSalesman}
                onChange={(e) => setAssignedSalesman(e.target.value)}
                className={field}
              >
                {SALESMEN.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-4 border-t border-neutral-100 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className={sectionLabel}>
                2. Fotos (hasta 10 · máx. 5 MB c/u)
              </h3>
              <span className="text-[11px] font-medium text-neutral-500">
                {photoCount}/10 cargadas
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PHOTO_SLOTS.map((slot) => {
                const preview = previews[slot.id];
                const isUploading = uploading[slot.id];
                const error = photoErrors[slot.id];
                return (
                  <div
                    key={slot.id}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                      {preview && (
                        // eslint-disable-next-line @next/next/no-img-element -- transient local/uploaded preview, not an optimizable static asset
                        <img
                          src={preview}
                          alt=""
                          className="size-full object-cover"
                        />
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-600">
                        Foto {slot.id}
                      </span>
                      <div className="mt-1 truncate text-[13px] font-medium text-neutral-900">
                        {slot.label}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {slot.category}
                      </div>
                      {error && (
                        <div className="mt-0.5 text-[11px] font-medium text-red-hi">
                          {error}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {preview && !isUploading && (
                        <button
                          type="button"
                          onClick={() => removePhoto(slot.id)}
                          aria-label={`Quitar foto ${slot.id}`}
                          className="rounded-full border border-neutral-200 p-1.5 text-neutral-400 transition-colors hover:border-red/30 hover:bg-red/5 hover:text-red-hi"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        id={`edit-photo-slot-${slot.id}`}
                        disabled={isUploading}
                        onChange={(e) =>
                          handlePhotoChange(slot.id, e.target.files?.[0])
                        }
                        className="hidden"
                      />
                      <label
                        htmlFor={`edit-photo-slot-${slot.id}`}
                        className={
                          "inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors " +
                          (isUploading
                            ? "cursor-wait border border-neutral-300 bg-white text-neutral-400"
                            : preview
                              ? "bg-red text-white"
                              : "border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100")
                        }
                      >
                        {!isUploading && preview && <Check className="size-3" />}
                        {isUploading ? "Subiendo…" : preview ? "Cambiar" : "Subir foto"}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-400">
              Cada foto se sube y se marca con agua (sharp, centrada, apenas
              visible) al instante — la miniatura ya muestra el resultado
              final.
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-neutral-100 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-neutral-600 transition-colors hover:bg-neutral-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={anyUploading}
              className="rounded-full bg-red px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-hi disabled:cursor-not-allowed disabled:opacity-40"
            >
              {anyUploading ? "Subiendo fotos…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
