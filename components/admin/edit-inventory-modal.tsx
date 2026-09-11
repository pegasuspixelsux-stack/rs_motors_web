"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SALESMEN } from "@/lib/salesmen";
import type { AdminVehicle } from "@/lib/inventory-store";
import type { Vehicle } from "@/lib/inventory";
import { VehiclePhotoUploader } from "./vehicle-photo-uploader";

/**
 * "Editar unidad" modal — the photo intake (interactive car-diagram +
 * per-slot upload) lives in vehicle-photo-uploader.tsx, shared with
 * add-inventory-modal.tsx, pre-filled here from the existing vehicle so
 * photos can be added or replaced after creation, not just at intake.
 * Also fixes the old inline edit form's cropping: the dialog panel scrolls
 * internally (max-h + overflow-y-auto) instead of relying on the outer
 * overlay's scroll, which clipped the top of the form on shorter viewports.
 */

const field =
  "mt-1.5 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[14px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-red focus:bg-white";
const label = "block text-[12px] font-medium text-neutral-500";
const sectionLabel =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400";

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
  const [photoUrls, setPhotoUrls] = useState<string[]>(vehicle.photos ?? []);
  const [anyUploading, setAnyUploading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (anyUploading) return;
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

          <div className="border-t border-neutral-100 pt-6">
            <VehiclePhotoUploader
              initialPhotos={vehicle.photos}
              onChange={setPhotoUrls}
              onUploadingChange={setAnyUploading}
            />
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
