"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Vehicle } from "@/lib/inventory";
import { STATUS_LABEL } from "@/lib/inventory";
import { fmtInt, fmtIngreso, fmtUSD } from "@/lib/format";
import { FINANCE, monthlyPayment } from "@/lib/finance";
import { galleryFor } from "@/lib/gallery";
import { highlightsFor, narrativeFor } from "@/lib/narrative";
import { waLink } from "@/lib/site";
import { saveLead } from "@/lib/leads-store";
import { VehicleGallery } from "./vehicle-gallery";
import { WhatsappCaptureButton } from "./whatsapp-capture-button";

/**
 * One-column editorial flow: header → tagline → story → specs, with
 * pricing, financing, permuta, and every conversion action bottom-loaded
 * into a single closing block.
 */
export function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const title = `${vehicle.marca} ${vehicle.modelo}`;
  const cuota = monthlyPayment(vehicle.precioUSD);
  const photos = galleryFor(vehicle);
  const [tagline, ...highlights] = highlightsFor(vehicle);
  const paragraphs = narrativeFor(vehicle);
  const live = vehicle.status === "recien-ingresado";

  return (
    <article>
      <VehicleGallery photos={photos} alt={`${title} ${vehicle.anio}`} />

      <div className="mx-auto max-w-[800px] px-5 sm:px-8">
        <Link
          href="/#unidades"
          className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-ink-dim transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Unidades
        </Link>

        {/* header */}
        <header className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <span
              className={"size-1.5 rounded-full " + (live ? "bg-red-hi" : "bg-ink-dim")}
            />
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
              {STATUS_LABEL[vehicle.status]} · {vehicle.categoria}
            </span>
          </div>
          <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-semibold uppercase tracking-[0.01em] text-ink">
            {title}
          </h1>
          <p className="tnum mt-3 text-[13px] font-medium uppercase tracking-[0.16em] text-ink-faint">
            {vehicle.anio} — {fmtInt(vehicle.km)} km — {vehicle.transmision}
          </p>
        </header>

        {/* tagline + story */}
        <div className="mt-12">
          <p className="text-center text-[19px] font-medium leading-snug text-ink">
            {tagline}
          </p>
          <div className="mx-auto my-8 h-px w-12 bg-hairline" />

          <p className="text-[17px] leading-[1.75] text-ink-dim [&::first-letter]:mr-2.5 [&::first-letter]:float-left [&::first-letter]:text-[58px] [&::first-letter]:font-semibold [&::first-letter]:leading-[0.85] [&::first-letter]:text-ink">
            {paragraphs[0]}
          </p>
          {paragraphs.slice(1).map((p, i) => (
            <p key={i} className="mt-5 text-[17px] leading-[1.75] text-ink-dim">
              {p}
            </p>
          ))}

          {highlights.length > 0 && (
            <ul className="mt-8 flex flex-col gap-2.5 border-t border-hairline pt-8">
              {highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-ink-dim">
                  <span className="mt-2.5 size-1 shrink-0 rounded-full bg-red-hi" />
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* specs — after the story, in a clean minimal grid */}
        <div className="mt-14">
          <h2 className="text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Ficha técnica
          </h2>
          <dl className="tnum mt-6 grid grid-cols-2 gap-x-6 gap-y-6 text-[14px]">
            {[
              ["Marca", vehicle.marca],
              ["Modelo", vehicle.modelo],
              ["Versión", vehicle.version],
              ["Año", `${vehicle.anio}`],
              ["Kilometraje", `${fmtInt(vehicle.km)} km`],
              ["Combustible", vehicle.combustible],
              ["Transmisión", vehicle.transmision],
              ["Categoría", vehicle.categoria],
              ["Puertas", `${vehicle.puertas}`],
              ["Ubicación", vehicle.ubicacion],
              ["Estado", STATUS_LABEL[vehicle.status]],
              ["Ingreso", fmtIngreso(vehicle.ingreso)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] font-medium text-ink-faint">{k}</dt>
                <dd className="mt-1 font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* pricing, financing, permuta, and every conversion action — bottom-loaded */}
        <div className="mt-14 space-y-8 border-t border-hairline pt-12 text-center">
          {/* monthly payment is the primary anchor; total price is secondary */}
          <div className="rounded-2xl border border-hairline bg-surface-2 p-8">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Cuota estimada mensual
            </span>
            <div className="tnum mt-2 flex items-baseline justify-center gap-2">
              <span className="text-[44px] font-bold leading-none tracking-[-0.03em] text-red-hi">
                {fmtUSD(cuota)}
              </span>
              <span className="text-[16px] font-medium text-ink-dim">/mes</span>
            </div>
            <p className="tnum mt-4 text-[13px] text-ink-dim">
              Precio total de contado:{" "}
              <span className="font-semibold text-ink">
                {fmtUSD(vehicle.precioUSD)}
              </span>
            </p>
            <p className="tnum mx-auto mt-4 max-w-md text-balance border-t border-hairline pt-4 text-center text-[11px] leading-relaxed text-ink-faint">
              Calculado con {Math.round(FINANCE.downPaymentPct * 100)}% de
              entrega inicial (
              {fmtUSD(vehicle.precioUSD * FINANCE.downPaymentPct)}), TNA
              estimada del {(FINANCE.apr * 100).toFixed(2)}% y{" "}
              {FINANCE.termMonths} cuotas mensuales. Sujeto a aprobación
              crediticia.
            </p>
          </div>

          <Panel title="Simulador y solicitud de financiación">
            <p className="text-center text-[14px] text-ink-dim">
              Personalizá tu plan de pagos según tu entrega inicial y el plazo
              que prefieras en nuestra{" "}
              <Link
                href="/#herramientas"
                className="font-semibold text-ink underline decoration-hairline underline-offset-2 transition-colors hover:text-red-hi"
              >
                calculadora de financiación
              </Link>
              .
            </p>
            <p className="mt-3 text-center text-[12px] italic leading-relaxed text-ink-faint">
              La consulta se coordina por WhatsApp; la documentación final se
              completa en persona, en nuestro local en {vehicle.ubicacion}.
            </p>
          </Panel>

          <Panel title="Tasación de tu usado (permuta)">
            <p className="text-center text-[14px] text-ink-dim">
              Tomamos tu vehículo actual como parte de pago, tras una revisión
              técnica presencial en nuestro{" "}
              <Link
                href="/?tab=permuta#herramientas"
                className="font-semibold text-ink underline decoration-hairline underline-offset-2 transition-colors hover:text-red-hi"
              >
                formulario de tasación
              </Link>
              .
            </p>
            <p className="mt-3 text-center text-[12px] italic leading-relaxed text-ink-faint">
              Cargá marca, modelo, año y kilómetros, y te respondemos con un
              valor estimado el mismo día en {vehicle.ubicacion}.
            </p>
          </Panel>

          <WhatsappCaptureButton
            buildMessage={(name, phone) =>
              `Hola RS Motors, mi nombre es ${name} (Tel: ${phone}) y quiero consultar por el ${title} ${vehicle.version} ${vehicle.anio} (${vehicle.id}). ¿Sigue disponible?`
            }
            context={`sobre el ${title}`}
            source={`Ficha de vehículo — ${title}`}
            buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-hi sm:w-auto"
          />

          <ContactForm vehicle={vehicle} title={title} />
        </div>
      </div>
    </article>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface-2 p-6">
      <h3 className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ContactForm({ vehicle, title }: { vehicle: Vehicle; title: string }) {
  const [form, setForm] = useState({ nombre: "", contacto: "", mensaje: "" });

  const message = [
    `Hola RS Motors, soy ${form.nombre || "(sin nombre)"}.`,
    `Me interesa el ${title} ${vehicle.version} ${vehicle.anio} (${vehicle.id}).`,
    form.mensaje || "",
    form.contacto ? `Me podés contactar en ${form.contacto}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const field =
    "w-full rounded-2xl bg-surface px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:bg-surface-hi";

  return (
    <div id="contact-form" className="rounded-2xl border border-hairline bg-surface-2 p-6 text-left">
      <h3 className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        Contacto directo con un asesor
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveLead({
            name: form.nombre || "Sin nombre",
            phone: form.contacto,
            context: `sobre el ${title}`,
            message,
            source: `Formulario de contacto — ${title}`,
          });
          window.open(waLink(message), "_blank", "noopener,noreferrer");
        }}
        className="mt-4 flex flex-col gap-4"
      >
        <label className="block">
          <span className="text-[13px] font-medium text-ink-dim">Nombre</span>
          <input
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Tu nombre"
            className={`mt-2 ${field}`}
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-ink-dim">
            Teléfono / WhatsApp
          </span>
          <input
            value={form.contacto}
            onChange={(e) => setForm((f) => ({ ...f, contacto: e.target.value }))}
            placeholder="Tu número de contacto"
            className={`mt-2 ${field}`}
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-ink-dim">
            Mensaje / consulta
          </span>
          <textarea
            value={form.mensaje}
            onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
            rows={3}
            placeholder="¿Querés coordinar una visita, consultar por financiación o permuta?"
            className={`mt-2 resize-none ${field}`}
          />
        </label>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ground transition-colors hover:bg-ink-dim"
        >
          Enviar consulta al asesor
        </button>
      </form>
    </div>
  );
}
