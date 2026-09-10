"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RSMark } from "@/components/rs-mark";
import { getInventory, STATUS_LABEL } from "@/lib/inventory";
import type { Vehicle, VehicleStatus } from "@/lib/inventory";

/*
 * Instagram feed-post template — reusable blueprint + reference build.
 * On-graphic copy is limited to Marca / Modelo / Año / Estado.
 * Price, kilómetros and details go in the caption, never the image.
 * Frame: 1080 × 1350 (4:5, Instagram feed portrait).
 */
const FRAME_W = 1080;
const FRAME_H = 1350;
const VEHICLES = getInventory();

function StatusRow({ status }: { status: VehicleStatus }) {
  const live = status === "recien-ingresado";
  return (
    <div className="flex items-center gap-4">
      <span
        className={
          "size-4 rounded-full " + (live ? "bg-red-hi" : "bg-ink-faint")
        }
      />
      <span className="text-[32px] font-semibold tracking-[-0.01em] text-ink">
        {STATUS_LABEL[status]}
      </span>
    </div>
  );
}

function PostFrame({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[8px] bg-ground"
      style={{ width: FRAME_W, height: FRAME_H }}
    >
      <div className="absolute inset-x-0 top-0" style={{ height: FRAME_H * 0.6 }}>
        <Image
          src={vehicle.imagen}
          alt=""
          fill
          sizes="1080px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-ground" />
      </div>

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-16 py-16">
        <RSMark height={46} tone="red" />
        <span className="text-[24px] font-medium tracking-[0.02em] text-ink-dim">
          Maldonado
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-16 pb-20">
        <div className="text-[40px] font-medium tracking-[-0.01em] text-ink-dim">
          {vehicle.marca}
        </div>
        <div className="mt-1 flex items-end justify-between gap-8">
          <div className="text-[112px] font-semibold leading-[0.92] tracking-[-0.04em] text-ink">
            {vehicle.modelo}
          </div>
          <div className="tnum pb-4 text-[88px] font-semibold leading-none tracking-[-0.03em] text-red-hi">
            {vehicle.anio}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <StatusRow status={vehicle.status} />
          <span className="text-[26px] font-medium text-ink-dim">
            Consultá por WhatsApp
          </span>
        </div>
      </div>
    </div>
  );
}

export default function InstagramTemplatePage() {
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(0.42);
  const vehicle = VEHICLES[index];

  return (
    <div className="min-h-screen px-5 py-14 sm:px-10">
      <div className="mx-auto max-w-[1320px]">
        <Link
          href="/"
          className="text-[13px] font-medium text-ink-faint transition-colors hover:text-ink"
        >
          ← RS Motors
        </Link>
        <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] text-ink">
          Plantilla de Instagram
        </h1>
        <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-ink-dim">
          Blueprint reutilizable para publicar una unidad por placa. En la imagen
          van sólo <strong className="font-semibold text-ink">marca, modelo,
          año y estado</strong>. El precio, los kilómetros y el resto van en el
          epígrafe. Formato <span className="tnum">1080 × 1350</span>.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="flex flex-col gap-6">
            <label className="block">
              <span className="text-[13px] font-medium text-ink-dim">Unidad</span>
              <select
                value={index}
                onChange={(e) => setIndex(Number(e.target.value))}
                className="mt-2 w-full rounded-2xl bg-surface px-4 py-3 text-[14px] text-ink outline-none"
              >
                {VEHICLES.map((v, i) => (
                  <option key={v.id} value={i}>
                    {v.marca} {v.modelo} {v.anio} · {v.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[13px] font-medium text-ink-dim">
                Zoom de vista previa · {Math.round(scale * 100)}%
              </span>
              <input
                type="range"
                min={0.2}
                max={0.7}
                step={0.02}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="mt-3"
              />
            </label>

            <div className="rounded-3xl bg-surface p-6 text-[14px] leading-relaxed text-ink-dim shadow-pop">
              <p className="text-[13px] font-semibold text-ink">Para exportar</p>
              <p className="mt-2">
                Poné el zoom en 100% y capturá el marco{" "}
                <span className="tnum">1080 × 1350</span> con la herramienta de
                captura del navegador. La especificación completa está en{" "}
                <span className="tnum">INSTAGRAM_TEMPLATE.md</span>.
              </p>
            </div>
          </div>

          <div className="overflow-auto rounded-3xl bg-surface p-6 shadow-soft">
            <div style={{ width: FRAME_W * scale, height: FRAME_H * scale }}>
              <div
                style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
              >
                <PostFrame vehicle={vehicle} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
