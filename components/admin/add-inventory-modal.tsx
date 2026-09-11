"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SALESMEN } from "@/lib/salesmen";
import type { NewVehicleInput } from "@/lib/inventory-store";
import { VehiclePhotoUploader } from "./vehicle-photo-uploader";

/**
 * "Agregar vehículo" modal for the admin inventory tab.
 *
 * The photo intake (interactive car-diagram + per-slot upload) lives in
 * vehicle-photo-uploader.tsx, shared with edit-inventory-modal.tsx — see
 * that file for the watermark-API + Firebase Storage upload mechanics.
 *
 * Submitting the form writes a real Firestore document via
 * lib/inventory-store.ts — see that file and lib/firebase.ts for the
 * current no-real-auth/open-rules state this all runs under.
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
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [anyUploading, setAnyUploading] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  // Bumped on close so <VehiclePhotoUploader> remounts fresh next open —
  // this component stays mounted across open/close (gated by the early
  // return below), so its own state wouldn't otherwise clear.
  const [resetKey, setResetKey] = useState(0);

  if (!open) return null;

  function reset() {
    setForm(EMPTY_FORM);
    setPhotoUrls([]);
    setAnyUploading(false);
    setExcelFile(null);
    setTab("manual");
    setResetKey((k) => k + 1);
  }

  function close() {
    reset();
    onClose();
  }

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
              if (anyUploading) return;
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
                photos: photoUrls,
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

            <div className="border-t border-neutral-100 pt-6">
              <VehiclePhotoUploader
                key={resetKey}
                onChange={setPhotoUrls}
                onUploadingChange={setAnyUploading}
              />
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
                disabled={anyUploading}
                className="rounded-full bg-red px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-hi disabled:cursor-not-allowed disabled:opacity-40"
              >
                {anyUploading ? "Subiendo fotos…" : "Guardar vehículo"}
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
