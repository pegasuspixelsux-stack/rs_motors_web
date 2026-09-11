"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";

/**
 * "Agregar vehículo" modal for the admin inventory tab.
 *
 * The photo grid is real: each slot POSTs to /api/vehicles/photos, which
 * watermarks the image server-side (sharp, see lib/watermark.ts) and saves
 * it under public/images/vehicles/uploads/ — the thumbnail shown is that
 * actual watermarked file, not a raw local preview.
 *
 * Everything else is still UI-shell only, matching the rest of
 * app/admin/page.tsx: there's no database, so the vehicle record itself
 * (and the uploaded photo's association with it) isn't persisted anywhere —
 * saving the form hands the data to the in-memory inventory list in
 * app/admin/page.tsx and nothing survives a refresh.
 */

type TabKey = "manual" | "excel";

type FormData = {
  brand: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  transmission: "Manual" | "Automática";
  tagline: string;
  description: string;
  features: string;
  assignedSalesman: string;
};

/** What a saved manual entry hands back to the caller — enough to build a full Vehicle row. */
export type NewVehicleInput = {
  marca: string;
  modelo: string;
  anio: number;
  precioUSD: number;
  km: number;
  transmision: "Manual" | "Automática";
  tagline: string;
  description: string;
  features: string;
  assignedSalesman: string;
};

export const SALESMEN = [
  "Martín Rodríguez",
  "Sofía Valdés",
  "Ignacio Silva",
  "Carlos Ferreira",
];

const EMPTY_FORM: FormData = {
  brand: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  transmission: "Automática",
  tagline: "",
  description: "",
  features: "",
  assignedSalesman: SALESMEN[0],
};

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

export function AddInventoryModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  /** Called with the new vehicle's data on the manual-entry tab; called with
   * no argument from the Excel tab, since there's no per-row data to hand
   * back yet — see the file note on /api/vehicles/photos for the same gap. */
  onSave: (vehicle?: NewVehicleInput) => void;
}) {
  const [tab, setTab] = useState<TabKey>("manual");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [photos, setPhotos] = useState<Record<number, File>>({});
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [photoErrors, setPhotoErrors] = useState<Record<number, string>>({});
  const [excelFile, setExcelFile] = useState<File | null>(null);

  if (!open) return null;

  function revokeAllPreviews() {
    Object.values(previews).forEach(
      (url) => url.startsWith("blob:") && URL.revokeObjectURL(url),
    );
  }

  function reset() {
    revokeAllPreviews();
    setForm(EMPTY_FORM);
    setPhotos({});
    setPreviews({});
    setUploading({});
    setPhotoErrors({});
    setExcelFile(null);
    setTab("manual");
  }

  function setPreview(slotId: number, url: string) {
    setPreviews((prev) => {
      if (prev[slotId]?.startsWith("blob:")) URL.revokeObjectURL(prev[slotId]);
      return { ...prev, [slotId]: url };
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
    setPhotos((prev) => ({ ...prev, [slotId]: file }));
    // Instant local preview while the real upload (and watermark) runs.
    setPreview(slotId, URL.createObjectURL(file));

    setUploading((prev) => ({ ...prev, [slotId]: true }));
    try {
      const body = new FormData();
      body.append("photo", file);
      const res = await fetch("/api/vehicles/photos", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al subir la foto.");
      // Swap the raw local preview for the real, watermarked file.
      setPreview(slotId, json.url);
    } catch (err) {
      setPhotoErrors((prev) => ({
        ...prev,
        [slotId]: err instanceof Error ? err.message : "Error al subir la foto.",
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [slotId]: false }));
    }
  }

  function close() {
    reset();
    onClose();
  }

  const photoCount = Object.keys(photos).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={close}
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
              Agregar vehículo
            </h2>
            <p className="mt-1 text-[13px] text-neutral-400">
              Elegí el método de carga para la unidad.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          {(
            [
              { key: "manual", tabLabel: "Carga manual asistida" },
              { key: "excel", tabLabel: "Carga masiva vía Excel" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={
                "rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors " +
                (tab === t.key
                  ? "bg-red text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200")
              }
            >
              {t.tabLabel}
            </button>
          ))}
        </div>

        {tab === "manual" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave({
                marca: form.brand.trim(),
                modelo: form.model.trim(),
                anio: Number(form.year) || new Date().getFullYear(),
                precioUSD: Number(form.price) || 0,
                km: Number(form.mileage.replace(/[^\d]/g, "")) || 0,
                transmision: form.transmission,
                tagline: form.tagline.trim(),
                description: form.description.trim(),
                features: form.features.trim(),
                assignedSalesman: form.assignedSalesman,
              });
              close();
            }}
            className="mt-8 space-y-8"
          >
            <div className="space-y-4">
              <h3 className={sectionLabel}>1. Especificaciones del vehículo</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className={label}>Marca</span>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Ej. Volkswagen"
                    className={field}
                  />
                </label>
                <label className="block">
                  <span className={label}>Modelo</span>
                  <input
                    required
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="Ej. Golf GTI"
                    className={field}
                  />
                </label>
                <label className="block">
                  <span className={label}>Año</span>
                  <input
                    required
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="2022"
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
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="23400"
                    className={field}
                  />
                </label>
                <label className="block">
                  <span className={label}>Kilometraje (km)</span>
                  <input
                    required
                    value={form.mileage}
                    onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                    placeholder="45.000"
                    className={field}
                  />
                </label>
                <label className="block">
                  <span className={label}>Transmisión</span>
                  <select
                    value={form.transmission}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        transmission: e.target.value as FormData["transmission"],
                      })
                    }
                    className={field}
                  >
                    <option value="Automática">Automática</option>
                    <option value="Manual">Manual</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className={label}>Eslogan / título editorial</span>
                <input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="Ej. Único dueño, service oficial al día."
                  className={field}
                />
              </label>

              <label className="block">
                <span className={label}>Descripción y detalles</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Estado general, procedencia, historial..."
                  className={field}
                />
              </label>

              <label className="block">
                <span className={label}>Equipamiento (separado por comas)</span>
                <input
                  value={form.features}
                  onChange={(e) =>
                    setForm({ ...form, features: e.target.value })
                  }
                  placeholder="Ej. Cuero, Techo panorámico, Llantas 19 pulgadas"
                  className={field}
                />
              </label>

              <label className="block">
                <span className={label}>Asesor asignado</span>
                <select
                  value={form.assignedSalesman}
                  onChange={(e) =>
                    setForm({ ...form, assignedSalesman: e.target.value })
                  }
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
                  const loaded = photos[slot.id];
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
                      <div className="shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          id={`photo-slot-${slot.id}`}
                          disabled={isUploading}
                          onChange={(e) =>
                            handlePhotoChange(slot.id, e.target.files?.[0])
                          }
                          className="hidden"
                        />
                        <label
                          htmlFor={`photo-slot-${slot.id}`}
                          className={
                            "inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors " +
                            (isUploading
                              ? "cursor-wait border border-neutral-300 bg-white text-neutral-400"
                              : loaded
                                ? "bg-red text-white"
                                : "border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100")
                          }
                        >
                          {!isUploading && loaded && <Check className="size-3" />}
                          {isUploading ? "Subiendo…" : loaded ? "Cambiar" : "Subir foto"}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-neutral-400">
                Cada foto se sube y se marca con agua (sharp, centrada, apenas
                visible) al instante — la miniatura ya muestra el resultado
                final. Tocar &quot;Subir foto&quot; en el celular abre la
                cámara directamente.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-100 pt-6">
              <button
                type="button"
                onClick={close}
                className="rounded-full bg-neutral-100 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-neutral-600 transition-colors hover:bg-neutral-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-full bg-red px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-hi"
              >
                Guardar vehículo
              </button>
            </div>
          </form>
        )}

        {tab === "excel" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!excelFile) return;
              onSave(undefined);
              close();
            }}
            className="mt-8 space-y-6"
          >
            <div className="space-y-3 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
              <h3 className={sectionLabel}>Importación masiva de catálogo</h3>
              <p className="mx-auto max-w-md text-[13px] text-neutral-500">
                Subí una planilla con marca, modelo, año, precio y
                kilometraje. Las fotos de cada unidad se cargan después,
                desde el listado.
              </p>
              <div className="pt-2">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setExcelFile(e.target.files?.[0] ?? null)}
                  className="mx-auto block text-[13px] text-neutral-600 file:mr-4 file:rounded-full file:border-0 file:bg-red file:px-4 file:py-2 file:text-[12px] file:font-semibold file:uppercase file:tracking-[0.04em] file:text-white hover:file:bg-red-hi"
                />
              </div>
              {excelFile && (
                <p className="text-[13px] font-medium text-red-hi">
                  Archivo seleccionado: {excelFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="rounded-full bg-neutral-100 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-neutral-600 transition-colors hover:bg-neutral-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!excelFile}
                className="rounded-full bg-red px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-hi disabled:cursor-not-allowed disabled:opacity-40"
              >
                Procesar archivo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
