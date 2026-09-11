"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Shared photo intake for both add-inventory-modal.tsx and
 * edit-inventory-modal.tsx: an interactive top-down car diagram (tap a
 * zone — front, rear, either side, interior — to jump to its photo slots)
 * sitting on top of the same upload mechanics both modals used to
 * duplicate (watermark API + Firebase Storage). The diagram is a fixed,
 * code-level layout (every vehicle has the same 5 zones), not per-vehicle
 * data — there's no Firestore schema for it.
 *
 * `initialPhotos` (an ordered array, slot 1..10) seeds previews when
 * editing an existing vehicle; `onChange` fires with the ordered array of
 * uploaded (http) URLs any time it changes, for the parent form to read at
 * submit time.
 */

type Slot = { id: number; label: string };

const PHOTO_SLOTS: Slot[] = [
  { id: 1, label: "Frente (ángulo 3/4 izquierdo)" },
  { id: 2, label: "Frente (centrado)" },
  { id: 3, label: "Frente (ángulo 3/4 derecho)" },
  { id: 4, label: "Trasera (ángulo 3/4 izquierdo)" },
  { id: 5, label: "Trasera (centrada)" },
  { id: 6, label: "Trasera (ángulo 3/4 derecho)" },
  { id: 7, label: "Lateral izquierdo completo" },
  { id: 8, label: "Lateral derecho completo" },
  { id: 9, label: "Interior · tablero y kilometraje" },
  { id: 10, label: "Interior · habitáculo general" },
];

const PHOTO_ZONES = [
  { key: "front", label: "Frente", x: 50, y: 14, slotIds: [1, 2, 3] },
  { key: "rear", label: "Trasera", x: 50, y: 86, slotIds: [4, 5, 6] },
  { key: "driver", label: "Lateral izquierdo", x: 12, y: 50, slotIds: [7] },
  { key: "passenger", label: "Lateral derecho", x: 88, y: 50, slotIds: [8] },
  { key: "interior", label: "Interior", x: 50, y: 50, slotIds: [9, 10] },
] as const;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function slotsFromArray(photos: string[] | undefined): Record<number, string> {
  const slots: Record<number, string> = {};
  (photos ?? []).forEach((url, i) => {
    if (i < PHOTO_SLOTS.length) slots[PHOTO_SLOTS[i].id] = url;
  });
  return slots;
}

export function VehiclePhotoUploader({
  initialPhotos,
  onChange,
  onUploadingChange,
}: {
  initialPhotos?: string[];
  onChange: (urls: string[]) => void;
  /** Fires whenever any slot's upload starts/finishes, so the parent form
   * can disable submit while a watermark+upload round-trip is in flight. */
  onUploadingChange?: (anyUploading: boolean) => void;
}) {
  const [previews, setPreviews] = useState<Record<number, string>>(() =>
    slotsFromArray(initialPhotos),
  );
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [activeZone, setActiveZone] = useState<(typeof PHOTO_ZONES)[number]["key"]>(
    "front",
  );

  function emitChange(next: Record<number, string>) {
    const urls = PHOTO_SLOTS.map((s) => next[s.id]).filter(
      (url): url is string => Boolean(url) && url.startsWith("http"),
    );
    onChange(urls);
  }

  function updatePreview(slotId: number, url: string | undefined) {
    setPreviews((prev) => {
      if (prev[slotId]?.startsWith("blob:")) URL.revokeObjectURL(prev[slotId]);
      const next = { ...prev };
      if (url) next[slotId] = url;
      else delete next[slotId];
      emitChange(next);
      return next;
    });
  }

  async function handlePhotoChange(slotId: number, file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((prev) => ({ ...prev, [slotId]: "Supera los 5 MB." }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    updatePreview(slotId, URL.createObjectURL(file));

    setUploading((prev) => {
      const next = { ...prev, [slotId]: true };
      onUploadingChange?.(Object.values(next).some(Boolean));
      return next;
    });
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
      updatePreview(slotId, downloadURL);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [slotId]: err instanceof Error ? err.message : "Error al subir la foto.",
      }));
    } finally {
      setUploading((prev) => {
        const next = { ...prev, [slotId]: false };
        onUploadingChange?.(Object.values(next).some(Boolean));
        return next;
      });
    }
  }

  const photoCount = Object.keys(previews).length;
  const zone = PHOTO_ZONES.find((z) => z.key === activeZone) ?? PHOTO_ZONES[0];
  const zoneSlots = PHOTO_SLOTS.filter((s) => (zone.slotIds as readonly number[]).includes(s.id));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
          2. Fotos (hasta 10 · máx. 5 MB c/u)
        </h3>
        <span className="text-[11px] font-medium text-neutral-500">
          {photoCount}/10 cargadas
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
        {/* diagram */}
        <div className="mx-auto w-full max-w-[180px] sm:mx-0">
          <div className="relative aspect-[5/8] rounded-2xl bg-neutral-50">
            {/* simple top-down car silhouette */}
            <svg
              viewBox="0 0 200 320"
              className="absolute inset-0 size-full p-4"
              aria-hidden="true"
            >
              <rect x="20" y="20" width="160" height="280" rx="40" className="fill-neutral-200" />
              <rect x="45" y="95" width="110" height="115" rx="18" className="fill-neutral-300" />
            </svg>
            {PHOTO_ZONES.map((z) => {
              const done = z.slotIds.filter((id) => previews[id]).length;
              const total = z.slotIds.length;
              const complete = done === total;
              const active = z.key === activeZone;
              return (
                <button
                  key={z.key}
                  type="button"
                  onClick={() => setActiveZone(z.key)}
                  style={{ left: `${z.x}%`, top: `${z.y}%` }}
                  className={
                    "tnum absolute -translate-x-1/2 -translate-y-1/2 rounded-full text-[11px] font-semibold shadow-sm transition-all " +
                    (active
                      ? "size-9 bg-red text-white ring-2 ring-red/30"
                      : complete
                        ? "size-8 bg-red/15 text-red-hi hover:bg-red/25"
                        : "size-8 border border-neutral-300 bg-white text-neutral-500 hover:border-neutral-400")
                  }
                  aria-label={`${z.label}: ${done}/${total} fotos`}
                  aria-pressed={active}
                >
                  {done}/{total}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-[11px] text-neutral-400">
            Tocá una zona del diagrama para cargar sus fotos.
          </p>
        </div>

        {/* zone tabs + slot list */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {PHOTO_ZONES.map((z) => {
              const done = z.slotIds.filter((id) => previews[id]).length;
              const active = z.key === activeZone;
              return (
                <button
                  key={z.key}
                  type="button"
                  onClick={() => setActiveZone(z.key)}
                  className={
                    "tnum rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors " +
                    (active
                      ? "bg-red text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200")
                  }
                >
                  {z.label} · {done}/{z.slotIds.length}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {zoneSlots.map((slot) => {
              const preview = previews[slot.id];
              const isUploading = uploading[slot.id];
              const error = errors[slot.id];
              return (
                <div
                  key={slot.id}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                    {preview && (
                      // eslint-disable-next-line @next/next/no-img-element -- transient local/uploaded preview, not an optimizable static asset
                      <img src={preview} alt="" className="size-full object-cover" />
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
                        onClick={() => updatePreview(slot.id, undefined)}
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
                      id={`photo-slot-${slot.id}`}
                      disabled={isUploading}
                      onChange={(e) => handlePhotoChange(slot.id, e.target.files?.[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor={`photo-slot-${slot.id}`}
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
        </div>
      </div>

      <p className="text-[11px] text-neutral-400">
        Cada foto se sube y se marca con agua (sharp, centrada, apenas
        visible) al instante — la miniatura ya muestra el resultado final.
        Tocar &quot;Subir foto&quot; en el celular abre la cámara
        directamente.
      </p>
    </div>
  );
}

