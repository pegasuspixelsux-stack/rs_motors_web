"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { RSMark } from "@/components/rs-mark";
import { Odometer } from "@/components/odometer";
import { VehicleCard } from "@/components/vehicle-card";
import { WhatsappGlyph } from "@/components/whatsapp-glyph";
import { getCategories, getInventory } from "@/lib/inventory";
import { fmtInt, fmtUSD } from "@/lib/format";
import { FINANCE } from "@/lib/finance";
import { NAV_LINKS, SITE, waLink } from "@/lib/site";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/* ------------------------------------------------------------------ *
 *  Static data — the seam for a live backend (Supabase, an API, …).
 *  Read once at module scope; swap getInventory() for a fetch/hook.
 * ------------------------------------------------------------------ */
const ALL_VEHICLES = getInventory();
const CATEGORIES = getCategories();
const PER_PAGE = 12;

/* ------------------------------------------------------------------ *
 *  Wordmark — logo mark + "MOTORS"
 * ------------------------------------------------------------------ */
function Wordmark({ height = 20 }: { height?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <RSMark height={height} priority />
      <span
        className="font-semibold tracking-[0.14em] text-ink"
        style={{ fontSize: height * 0.62 }}
      >
        MOTORS
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  Section heading
 * ------------------------------------------------------------------ */
function SectionHeading({
  id,
  title,
  subtitle,
  aside,
}: {
  id: string;
  title: string;
  subtitle?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-ink-dim">
              {subtitle}
            </p>
          )}
        </div>
        {aside}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Nav
 * ------------------------------------------------------------------ */
function Nav() {
  const [open, setOpen] = useState(false);
  const wa = waLink("Hola RS Motors, quería hacer una consulta.");

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-ground/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 sm:px-8">
        <a href="#top" aria-label="RS Motors — inicio">
          <Wordmark height={19} />
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] font-medium text-ink-dim transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-red px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-hi"
          >
            <WhatsappGlyph size={15} />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-full bg-surface text-ink transition-colors hover:bg-surface-hi md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-hairline bg-ground px-4 py-2 md:hidden">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium text-ink-dim transition-colors hover:bg-surface hover:text-ink"
            >
              {l.label}
              <ArrowRight className="size-4 text-ink-faint" />
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero — looping video background
 * ------------------------------------------------------------------ */
function Hero() {
  const reduced = useReducedMotion();
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <video
          className="size-full object-cover"
          poster="/videos/hero-poster.jpg"
          autoPlay={!reduced}
          muted
          loop
          playsInline
          preload={reduced ? "none" : "auto"}
          aria-hidden="true"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-ground/75 via-ground/45 to-ground/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ground" />
      </div>

      <div className="mx-auto max-w-[1320px] px-5 pb-28 pt-36 sm:px-8 sm:pb-40 sm:pt-48">
        <h1 className="max-w-[17ch] text-[clamp(2.75rem,7.5vw,5.5rem)] font-semibold leading-[1.0] tracking-[-0.04em] text-ink [text-shadow:0_2px_28px_rgba(0,0,0,0.5)]">
          Estándar de exigencia.{" "}
          <span className="text-red-hi">Todos los días.</span>
        </h1>
        <p className="mt-7 max-w-[50ch] text-[17px] leading-relaxed text-ink-dim [text-shadow:0_1px_12px_rgba(0,0,0,0.7)] sm:text-[19px]">
          Una selección corta de usados en Maldonado. Cada unidad elegida y
          revisada punto por punto, con kilómetros reales y precio sin vueltas.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a
            href="#unidades"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-red-hi"
          >
            Ver unidades
            <ArrowRight className="size-4" />
          </a>
          <a
            href="#herramientas"
            className="inline-flex items-center justify-center rounded-full bg-white/10 px-7 py-3.5 text-[15px] font-semibold text-ink backdrop-blur-md transition-colors hover:bg-white/15"
          >
            Financiación y permuta
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Selección (inventory)
 * ------------------------------------------------------------------ */
function Seleccion() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("todos");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_VEHICLES.filter((v) => {
      if (category !== "todos" && v.categoria !== category) return false;
      if (!q) return true;
      return `${v.marca} ${v.modelo} ${v.version} ${v.anio} ${v.categoria}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  const resetToFirstPage = () => setPage(1);

  return (
    <section className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading
          id="unidades"
          title="Unidades seleccionadas"
          subtitle="Porque el auto con el que soñás ya está a tu alcance, diseñado para tu ritmo de vida."
          aside={
            <p className="tnum text-[14px] text-ink-dim">
              <span className="text-ink">{fmtInt(filtered.length)}</span> de{" "}
              {fmtInt(ALL_VEHICLES.length)} unidades
            </p>
          }
        />

        {/* controls */}
        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    setCategory(c.value);
                    resetToFirstPage();
                  }}
                  className={
                    "rounded-full px-4 py-2 text-[13px] font-medium transition-colors " +
                    (active
                      ? "bg-red text-white"
                      : "bg-surface text-ink-dim hover:bg-surface-hi hover:text-ink")
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-3 rounded-full bg-surface px-5 py-3 lg:w-80">
            <Search className="size-4 shrink-0 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetToFirstPage();
              }}
              placeholder="Marca, modelo o año…"
              className="w-full bg-transparent text-[14px] text-ink outline-none"
              aria-label="Buscar en la selección"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  resetToFirstPage();
                }}
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4 text-ink-faint transition-colors hover:text-ink" />
              </button>
            )}
          </label>
        </div>

        {/* grid */}
        {pageItems.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((v, i) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                priority={currentPage === 1 && i < 4}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[26px] bg-surface px-6 py-20 text-center shadow-soft">
            <p className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
              Sin resultados
            </p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-relaxed text-ink-dim">
              No hay unidades para esa búsqueda. Escribinos y te avisamos cuando
              entre algo así.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("todos");
                resetToFirstPage();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-2 px-5 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface-hi"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-full px-4 py-2 text-[13px] font-semibold text-ink-dim transition-colors hover:text-ink disabled:cursor-not-allowed disabled:text-ink-faint/50"
            >
              Anterior
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={
                    "tnum size-10 rounded-full text-[14px] font-medium transition-colors " +
                    (n === currentPage
                      ? "bg-red text-white"
                      : "bg-surface text-ink-dim hover:bg-surface-hi hover:text-ink")
                  }
                  aria-current={n === currentPage ? "page" : undefined}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full px-4 py-2 text-[13px] font-semibold text-ink-dim transition-colors hover:text-ink disabled:cursor-not-allowed disabled:text-ink-faint/50"
            >
              Siguiente
            </button>
          </div>
        )}

        <p className="mt-10 text-center text-[12px] text-ink-faint">
          Selección de demostración · fotos ilustrativas. Las unidades reales se
          cargan desde la base de datos de RS Motors.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Tools — trade appraisal + finance calculator
 * ------------------------------------------------------------------ */
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink-dim">{label}</span>
        <span className="tnum text-[16px] font-semibold text-ink">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3.5"
        aria-label={label}
      />
    </div>
  );
}

function Tools() {
  const [tab, setTab] = useState<"tasacion" | "calculadora">("calculadora");

  const [trade, setTrade] = useState({ marca: "", modelo: "", anio: "", km: "" });
  const tradeReady = Boolean(trade.marca && trade.modelo && trade.anio);
  const tradeMessage = `Hola RS Motors, quiero tasar mi usado para permuta:\n· Marca: ${trade.marca}\n· Modelo: ${trade.modelo}\n· Año: ${trade.anio}\n· Km: ${trade.km || "s/d"}`;

  const [precio, setPrecio] = useState<number>(18000);
  const [entrega, setEntrega] = useState<number>(
    Math.round(18000 * FINANCE.downPaymentPct),
  );
  const [plazo, setPlazo] = useState<number>(FINANCE.termMonths);

  const financiado = Math.max(0, precio - entrega);
  const r = FINANCE.apr / 12;
  const cuota =
    financiado === 0 ? 0 : (financiado * r) / (1 - Math.pow(1 + r, -plazo));
  const totalPagar = entrega + cuota * plazo;
  const financeMessage = `Hola RS Motors, quiero consultar financiación:\n· Precio: ${fmtUSD(precio)}\n· Entrega: ${fmtUSD(entrega)}\n· Plazo: ${plazo} meses\n· Cuota estimada: ${fmtUSD(cuota)}`;

  return (
    <section
      id="herramientas"
      className="scroll-mt-28 px-5 pb-24 pt-4 sm:px-8 sm:pb-32 sm:pt-8"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="flex gap-2 rounded-full bg-surface p-1.5">
          {(
            [
              ["calculadora", "Calculadora de Cuota"],
              ["tasacion", "Tasá tu usado"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={
                "flex-1 rounded-full px-5 py-3 text-[14px] font-semibold transition-colors " +
                (tab === key ? "bg-red text-white" : "text-ink-dim hover:text-ink")
              }
              aria-pressed={tab === key}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] bg-surface p-7 shadow-soft sm:p-12">
          {tab === "calculadora" ? (
            <div className="grid gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-16">
              {/* left — explainer + controls */}
              <div className="flex flex-col">
                <h3 className="text-[clamp(1.9rem,2.6vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink">
                  Financiación
                </h3>
                <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink-dim">
                  Mové los valores y mirá cómo cambia la cuota. Tomamos{" "}
                  {Math.round(FINANCE.downPaymentPct * 100)}% de entrega y{" "}
                  {FINANCE.termMonths} meses como referencia, y tu permuta también
                  cuenta como parte de la entrega. Es un número orientativo con
                  TNA estimada del {(FINANCE.apr * 100).toFixed(2)}%; la cuota
                  final la confirma la financiera.
                </p>
                <div className="mt-9 flex flex-1 flex-col justify-center gap-7">
                  <Slider
                    label="Precio del vehículo"
                    value={precio}
                    min={6000}
                    max={40000}
                    step={500}
                    onChange={(v) => {
                      setPrecio(v);
                      if (entrega > v) setEntrega(v);
                    }}
                    format={fmtUSD}
                  />
                  <Slider
                    label="Entrega inicial"
                    value={entrega}
                    min={0}
                    max={precio}
                    step={500}
                    onChange={setEntrega}
                    format={(v) =>
                      `${fmtUSD(v)} · ${Math.round((v / precio) * 100)}%`
                    }
                  />
                  <Slider
                    label="Plazo"
                    value={plazo}
                    min={12}
                    max={72}
                    step={6}
                    onChange={setPlazo}
                    format={(v) => `${v} meses`}
                  />
                </div>
              </div>

              {/* right — result */}
              <div className="flex flex-col justify-center rounded-3xl bg-surface-2 p-7 sm:p-9">
                <div className="text-[13px] font-medium text-ink-dim">
                  Cuota mensual estimada
                </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <Odometer
                      value={Math.round(cuota)}
                      prefix="US$ "
                      duration={550}
                      className="block text-[52px] font-bold leading-none tracking-[-0.035em] text-red-hi sm:text-[68px]"
                    />
                    <span className="text-[17px] font-semibold text-ink-dim">
                      /mes
                    </span>
                  </div>

                  <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
                    {[
                      ["Precio total", fmtUSD(precio)],
                      ["A financiar", fmtUSD(financiado)],
                      ["TNA estimada", `${(FINANCE.apr * 100).toFixed(2)}%`],
                      ["Total a pagar", fmtUSD(totalPagar)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[12px] font-medium text-ink-faint">
                          {k}
                        </dt>
                        <dd className="tnum mt-1 font-semibold text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-6 text-[12px] leading-relaxed text-ink-faint">
                    Cálculo orientativo. Sujeto a aprobación crediticia.
                  </p>
                  <a
                    href={waLink(financeMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-red-hi"
                  >
                    <WhatsappGlyph size={16} />
                    Consultar esta cuota
                  </a>
                </div>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              {/* left — explainer */}
              <div>
                <h3 className="text-[clamp(1.9rem,2.6vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink">
                  Permuta
                </h3>
                <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-ink">
                  Lo que hoy pensás que es imposible, no lo es. El vehículo que
                  estás manejando ahora mismo es el down payment que te separa del
                  auto con el que soñás.
                </p>
                <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-ink-dim">
                  Entregalo, estructurate en cuotas mensuales accesibles y empezá
                  a manejar todos los días el auto que querés tener. Cargá los
                  datos y te devolvemos un rango de tasación el mismo día.
                </p>
              </div>

              {/* right — form */}
              <div className="rounded-3xl bg-surface-2 p-7 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  {(
                    [
                      ["marca", "Marca", "text", "Volkswagen"],
                      ["modelo", "Modelo", "text", "Gol Trend"],
                      ["anio", "Año", "number", "2016"],
                      ["km", "Kilómetros", "number", "78500"],
                    ] as const
                  ).map(([key, label, type, ph]) => (
                    <label key={key} className="block">
                      <span className="text-[13px] font-medium text-ink-dim">
                        {label}
                      </span>
                      <input
                        type={type}
                        inputMode={type === "number" ? "numeric" : undefined}
                        value={trade[key]}
                        placeholder={ph}
                        onChange={(e) =>
                          setTrade((t) => ({ ...t, [key]: e.target.value }))
                        }
                        className="mt-2 w-full rounded-2xl bg-surface px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:bg-surface-hi"
                      />
                    </label>
                  ))}
                </div>
                <a
                  href={tradeReady ? waLink(tradeMessage) : undefined}
                  aria-disabled={!tradeReady}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-colors " +
                    (tradeReady
                      ? "bg-red text-white hover:bg-red-hi"
                      : "pointer-events-none bg-surface text-ink-faint")
                  }
                >
                  <WhatsappGlyph size={16} />
                  Pedir tasación
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  About
 * ------------------------------------------------------------------ */
function About() {
  const metrics = [
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Mecánicamente inspeccionado",
      note: "Cada unidad pasa por taller antes de publicarse.",
    },
    {
      icon: Tag,
      value: "Precio sin vueltas",
      label: "Publicado es real",
      note: "Sin cargos sorpresa ni gastos inventados.",
    },
    {
      icon: Check,
      value: "Km reales",
      label: "Historial verificado",
      note: "Kilometraje y documentación chequeados uno por uno.",
    },
  ];

  return (
    <section className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading id="nosotros" title="Nosotros" />

        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="max-w-[24ch] text-[clamp(1.75rem,2.6vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink">
              Porque el auto con el que soñás ya está a tu alcance.
            </p>
            <p className="mt-7 max-w-[52ch] text-[17px] leading-relaxed text-ink">
              Estamos acá para que dejes de conformarte con lo que podés pagar hoy
              y empieces a manejar lo que realmente querés. Te damos opciones
              reales, transparentes y a tu medida para que el auto de tus sueños
              deje de ser una idea lejana.
            </p>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-ink-dim">
              Una selección exclusiva y rigurosa en Maldonado. Elegimos cada
              unidad con un estándar absoluto, exhibiendo cada detalle con total
              transparencia para que encuentres la tuya en un entorno sin ruido.
            </p>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-ink-dim">
              Lo publicado es nuestra muestra actual; el resto lo conversamos de
              manera personalizada en nuestro espacio o a través de WhatsApp.
            </p>
            <a
              href="#contacto"
              className="mt-9 inline-flex items-center gap-2 text-[15px] font-semibold text-ink transition-colors hover:text-red-hi"
            >
              Cómo llegar
              <ArrowRight className="size-4" />
            </a>
          </div>

          <div className="grid gap-5">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex items-start gap-5 rounded-3xl bg-surface p-8 shadow-pop"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-2">
                  <m.icon className="size-5 text-red-hi" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[18px] font-semibold tracking-[-0.02em] text-ink">
                    {m.value}
                  </div>
                  <div className="mt-0.5 text-[13px] font-medium text-ink-dim">
                    {m.label}
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-faint">
                    {m.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Contact
 * ------------------------------------------------------------------ */
function Contact() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`;
  const [form, setForm] = useState({ nombre: "", contacto: "", mensaje: "" });

  const message = [
    `Hola RS Motors, soy ${form.nombre || "(sin nombre)"}.`,
    form.mensaje || "Quería hacer una consulta.",
    form.contacto ? `Me podés contactar en ${form.contacto}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const field =
    "w-full rounded-2xl bg-surface-2 px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:bg-surface-hi";

  return (
    <section
      id="contacto"
      className="scroll-mt-28 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* left — heading + contact data */}
        <div>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
            Pasá por el local
          </h2>
          <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-ink-dim sm:text-[17px]">
            Respondemos al toque por WhatsApp. O venís, lo ves y lo probás sin
            apuro. Estamos en Maldonado.
          </p>

          <div className="mt-10 flex items-start gap-3.5">
            <MapPin className="mt-0.5 size-5 shrink-0 text-red-hi" />
            <div>
              <div className="text-[12px] font-medium text-ink-faint">
                Dirección
              </div>
              <div className="mt-1 text-[17px] font-medium leading-snug text-ink">
                {SITE.address}
              </div>
              <a
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-dim transition-colors hover:text-ink"
              >
                Cómo llegar
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-8 text-[14px]">
            {[
              ["Horario", SITE.hours],
              ["Teléfono", SITE.phoneDisplay],
              ["WhatsApp", SITE.phoneDisplay],
              ["Instagram", `@${SITE.instagramHandle}`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] font-medium text-ink-faint">{k}</dt>
                <dd className="mt-1 text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* right — form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.open(waLink(message), "_blank", "noopener,noreferrer");
          }}
          className="rounded-[28px] bg-surface p-7 shadow-float sm:p-10"
        >
          <p className="text-[18px] font-semibold tracking-[-0.02em] text-ink">
            Escribinos
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-dim">
            Completá y seguimos por WhatsApp.
          </p>

          <div className="mt-7 flex flex-col gap-4">
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
                Teléfono o email
              </span>
              <input
                value={form.contacto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contacto: e.target.value }))
                }
                placeholder="Para poder responderte"
                className={`mt-2 ${field}`}
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-medium text-ink-dim">Mensaje</span>
              <textarea
                value={form.mensaje}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mensaje: e.target.value }))
                }
                rows={4}
                placeholder="¿Qué unidad te interesa?"
                className={`mt-2 resize-none ${field}`}
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-red-hi"
          >
            <WhatsappGlyph size={16} />
            Enviar por WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Footer
 * ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-hairline px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Wordmark height={15} />
          <span className="tnum text-[12px] text-ink-faint">
            © {new Date().getFullYear()} · Maldonado, Uruguay
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[12px] font-medium text-ink-faint transition-colors hover:text-ink-dim"
            >
              {l.label}
            </a>
          ))}
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-medium text-ink-faint transition-colors hover:text-ink-dim"
          >
            @{SITE.instagramHandle}
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ *
 *  Page
 * ------------------------------------------------------------------ */
export default function Page() {
  return (
    <div id="top">
      <Nav />
      <main>
        <Hero />
        <Seleccion />
        <Tools />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
