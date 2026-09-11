import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Vehicle } from "@/lib/inventory";
import { STATUS_LABEL } from "@/lib/inventory";
import { fmtIngreso, fmtInt, fmtUSD } from "@/lib/format";
import { FINANCE, monthlyPayment } from "@/lib/finance";
import { Wordmark } from "./wordmark";

function StatusPill({ status }: { status: Vehicle["status"] }) {
  const live = status === "recien-ingresado";
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-medium text-ink backdrop-blur-md">
      <span className={"size-1.5 rounded-full " + (live ? "bg-red-hi" : "bg-ink-dim")} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function VehicleCard({
  vehicle,
  priority = false,
  /** ID · ingreso · ubicación footer — internal tracking info. Hidden on the
   * public site; kept on for dashboard/back-office listings. */
  showMeta = true,
}: {
  vehicle: Vehicle;
  priority?: boolean;
  showMeta?: boolean;
}) {
  const title = `${vehicle.marca} ${vehicle.modelo}`;
  const cuota = monthlyPayment(vehicle.precioUSD);

  const specs = [
    `${vehicle.anio}`,
    `${fmtInt(vehicle.km)} km`,
    vehicle.transmision,
    vehicle.combustible,
  ];

  return (
    <article className="group flex flex-col overflow-hidden rounded-[22px] bg-surface shadow-soft transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-float">
      <Link
        href={`/unidades/${vehicle.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <Image
          src={vehicle.imagen}
          alt={`${title} ${vehicle.anio}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <StatusPill status={vehicle.status} />
        </div>
      </Link>

      {/* branding strip — sits below the photo so it never crops it; the
          card grows to make room instead of overlaying the image */}
      <div className="flex shrink-0 items-center justify-center bg-ground py-2.5">
        <Wordmark height={15} />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-h-[2.5em] text-[19px] font-semibold leading-tight tracking-[-0.02em] text-ink">
            <Link
              href={`/unidades/${vehicle.slug}`}
              className="transition-colors hover:text-red-hi"
            >
              {title}
            </Link>
          </h3>
          {vehicle.inspeccionado && (
            <span
              className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-dim"
              title="100% inspeccionado"
            >
              <ShieldCheck className="size-3.5 text-red-hi" strokeWidth={2.25} />
              Inspeccionado
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] text-ink-faint">{vehicle.version}</p>

        <p className="tnum mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] text-ink-dim">
          {specs.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-x-1.5">
              {i > 0 && <span className="text-ink-faint">·</span>}
              <span className="whitespace-nowrap">{s}</span>
            </span>
          ))}
        </p>

        {/* monthly payment — primary anchor */}
        <div className="mt-auto pt-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-faint">
            Cuota estimada
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="tnum text-[28px] font-semibold leading-none tracking-[-0.02em] text-ink">
              {fmtUSD(cuota)}
            </span>
            <span className="text-[14px] font-medium text-ink-dim">/mes</span>
          </div>
          <div className="tnum mt-2 text-[13px] text-ink-dim">
            Precio {fmtUSD(vehicle.precioUSD)}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
            {Math.round(FINANCE.downPaymentPct * 100)}% de entrega ·{" "}
            {FINANCE.termMonths} meses · TNA {(FINANCE.apr * 100).toFixed(2)}% ·
            sujeto a aprobación
          </p>
        </div>

        <Link
          href={`/unidades/${vehicle.slug}`}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-red px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-red-hi"
        >
          Ver ficha
          <ArrowRight className="size-4" />
        </Link>

        {showMeta && (
          <p className="tnum mt-4 text-center text-[11px] text-ink-faint">
            {vehicle.id} · Ingreso {fmtIngreso(vehicle.ingreso)} ·{" "}
            {vehicle.ubicacion}
          </p>
        )}
      </div>
    </article>
  );
}
