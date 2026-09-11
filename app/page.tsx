"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import miAutoLogo from "@/public/images/mi_auto_logo.png";
import {
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  Search,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { Nav } from "@/components/site-nav";
import { Footer } from "@/components/site-footer";
import { Odometer } from "@/components/odometer";
import { VehicleCard } from "@/components/vehicle-card";
import { SalesAgentWidget } from "@/components/sales-agent-widget";
import { WhatsappGlyph } from "@/components/whatsapp-glyph";
import { WhatsappCaptureButton } from "@/components/whatsapp-capture-button";
import { getCategories, type Vehicle } from "@/lib/inventory";
import { getPublicVehicles } from "@/lib/vehicles-public";
import { fmtInt, fmtUSD } from "@/lib/format";
import { FINANCE } from "@/lib/finance";
import { SITE, waLink } from "@/lib/site";
import { saveLead } from "@/lib/leads-store";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useReveal, revealClassName } from "@/lib/use-reveal";

const CATEGORIES = getCategories();
const PER_PAGE = 8;
const EMPTY_VEHICLES: Vehicle[] = [];
/** Illustrative TNA tiers the visitor can pick in the calculator. */
const RATE_OPTIONS = [5.97, 6.97, 8.97, 10.97];

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
 *  Hero — looping video background
 * ------------------------------------------------------------------ */
function Hero() {
  const reduced = useReducedMotion();
  return (
    <section className="relative isolate overflow-hidden bg-ground">
      <div className="absolute inset-0 -z-10">
        {/* Optimized, priority-loaded poster paints immediately (and stays
            as the background if the video is still loading on a slow
            mobile connection) — the video plays on top once it's ready. */}
        <Image
          src="/videos/hero-poster.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <video
          className="absolute inset-0 size-full object-cover"
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-10% via-ground/32 via-60% to-ground" />
      </div>

      <div className="mx-auto max-w-[1320px] px-5 pb-28 pt-36 sm:px-8 sm:pb-40 sm:pt-48">
        <div className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-yellow-400 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
          <MapPin className="size-3.5 shrink-0" />
          {SITE.address}
        </div>
        <h1 className="max-w-[17ch] text-[clamp(2.75rem,7.5vw,5.5rem)] font-semibold leading-[1.0] tracking-[-0.04em] text-ink [text-shadow:0_2px_28px_rgba(0,0,0,0.5)]">
          Estándar de exigencia.{" "}
          <span className="text-red-hi">Todos los días.</span>
        </h1>
        <p className="mt-7 max-w-[50ch] text-[17px] leading-relaxed text-ink-dim [text-shadow:0_1px_12px_rgba(0,0,0,0.7)] sm:text-[19px]">
          Una selección exclusiva de usados en Maldonado. Cada unidad elegida y
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
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useReveal(sectionRef);
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("todos");
  const [marca, setMarca] = useState<string>("todas");
  const [transmision, setTransmision] = useState<string>("todas");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    getPublicVehicles()
      .then((data) => {
        if (cancelled) return;
        setVehicles(data);
        setMaxPrice(data.length ? Math.max(...data.map((v) => v.precioUSD)) : 0);
      })
      .catch((err) => {
        console.error("No se pudo cargar la selección:", err);
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ALL_VEHICLES = vehicles ?? EMPTY_VEHICLES;
  const MARCAS = useMemo(
    () => Array.from(new Set(ALL_VEHICLES.map((v) => v.marca))).sort(),
    [ALL_VEHICLES],
  );
  const MAX_PRICE = useMemo(
    () => (ALL_VEHICLES.length ? Math.max(...ALL_VEHICLES.map((v) => v.precioUSD)) : 0),
    [ALL_VEHICLES],
  );
  const MIN_PRICE = useMemo(
    () => (ALL_VEHICLES.length ? Math.min(...ALL_VEHICLES.map((v) => v.precioUSD)) : 0),
    [ALL_VEHICLES],
  );
  const effectiveMaxPrice = maxPrice ?? MAX_PRICE;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_VEHICLES.filter((v) => {
      if (category !== "todos" && v.categoria !== category) return false;
      if (marca !== "todas" && v.marca !== marca) return false;
      if (transmision !== "todas" && v.transmision !== transmision) return false;
      if (v.precioUSD > effectiveMaxPrice) return false;
      if (!q) return true;
      return `${v.marca} ${v.modelo} ${v.version} ${v.anio} ${v.categoria}`
        .toLowerCase()
        .includes(q);
    });
  }, [ALL_VEHICLES, query, category, marca, transmision, effectiveMaxPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  const resetToFirstPage = () => setPage(1);

  return (
    <section
      ref={sectionRef}
      className={"px-5 py-24 sm:px-8 sm:py-32 " + revealClassName(visible)}
    >
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading
          id="unidades"
          title="Unidades Seleccionadas"
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

        {/* advanced filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Marca"
            value={marca}
            onChange={(v) => {
              setMarca(v);
              resetToFirstPage();
            }}
            options={[
              { value: "todas", label: "Todas las marcas" },
              ...MARCAS.map((m) => ({ value: m, label: m })),
            ]}
          />
          <FilterSelect
            label="Transmisión"
            value={transmision}
            onChange={(v) => {
              setTransmision(v);
              resetToFirstPage();
            }}
            options={[
              { value: "todas", label: "Todas" },
              { value: "Manual", label: "Manual" },
              { value: "Automática", label: "Automática" },
            ]}
          />
          <label className="flex items-center gap-3 rounded-full bg-surface px-5 py-3">
            <span className="text-[13px] font-medium text-ink-dim">
              Precio máx.
            </span>
            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={1000}
              value={effectiveMaxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                resetToFirstPage();
              }}
              className="w-32 sm:w-40"
              aria-label="Precio máximo"
            />
            <span className="tnum text-[13px] font-semibold text-ink">
              {fmtUSD(effectiveMaxPrice)}
            </span>
          </label>
        </div>

        {/* grid */}
        {vehicles === null ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-[22px] bg-surface"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="mt-10 rounded-[26px] bg-surface px-6 py-20 text-center shadow-soft">
            <p className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
              No pudimos cargar la selección
            </p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-relaxed text-ink-dim">
              Probá recargar la página en un momento, o escribinos por
              WhatsApp y te pasamos el catálogo directamente.
            </p>
          </div>
        ) : pageItems.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((v, i) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                priority={currentPage === 1 && i < 4}
                showMeta={false}
              />
            ))}
          </div>
        ) : ALL_VEHICLES.length === 0 ? (
          <div className="mt-10 rounded-[26px] bg-surface px-6 py-20 text-center shadow-soft">
            <p className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
              Estamos renovando la selección
            </p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-relaxed text-ink-dim">
              En este momento no tenemos unidades publicadas. Escribinos por
              WhatsApp y te contamos qué está por entrar.
            </p>
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
                setMarca("todas");
                setTransmision("todas");
                setMaxPrice(null);
                resetToFirstPage();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-2 px-5 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface-hi"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* pagination — always visible once there's at least one result, even
            on a single page, so the page-number row is a stable fixture at
            the bottom of the grid rather than popping in/out. */}
        {filtered.length > 0 && (
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

      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative flex items-center gap-2 rounded-full bg-surface pl-5 pr-9 py-3">
      <span className="text-[13px] font-medium text-ink-dim">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none bg-transparent text-[13px] font-medium text-ink outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 size-3.5 text-ink-faint" />
    </label>
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
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useReveal(sectionRef);
  const [tab, setTab] = useState<"tasacion" | "calculadora">("calculadora");

  // Deep-linked from other pages, e.g. /?tab=permuta#herramientas
  useEffect(() => {
    queueMicrotask(() => {
      if (new URLSearchParams(window.location.search).get("tab") === "permuta") {
        setTab("tasacion");
      }
    });
  }, []);

  const [trade, setTrade] = useState({ marca: "", modelo: "", anio: "", km: "" });
  const tradeReady = Boolean(trade.marca && trade.modelo && trade.anio);
  const tradeMessage = `Hola RS Motors, quiero tasar mi usado para permuta:\n· Marca: ${trade.marca}\n· Modelo: ${trade.modelo}\n· Año: ${trade.anio}\n· Km: ${trade.km || "s/d"}`;

  const [precio, setPrecio] = useState<number>(18000);
  const [entrega, setEntrega] = useState<number>(
    Math.round(18000 * FINANCE.downPaymentPct),
  );
  const [plazo, setPlazo] = useState<number>(FINANCE.termMonths);
  const [tna, setTna] = useState<number>(FINANCE.apr * 100);

  const financiado = Math.max(0, precio - entrega);
  const r = tna / 100 / 12;
  const cuota =
    financiado === 0 ? 0 : (financiado * r) / (1 - Math.pow(1 + r, -plazo));
  const totalPagar = entrega + cuota * plazo;
  const financeMessage = `Hola RS Motors, quiero consultar financiación:\n· Precio: ${fmtUSD(precio)}\n· Entrega: ${fmtUSD(entrega)}\n· Plazo: ${plazo} meses\n· TNA: ${tna.toFixed(2)}%\n· Cuota estimada: ${fmtUSD(cuota)}`;

  return (
    <section
      ref={sectionRef}
      id="herramientas"
      className={
        "scroll-mt-28 px-5 pb-24 pt-4 sm:px-8 sm:pb-32 sm:pt-8 " +
        revealClassName(visible)
      }
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="flex gap-2 rounded-full bg-surface p-1.5">
          {(
            [
              ["calculadora", "Calculadora de Cuota"],
              ["tasacion", "Entregá tu usado"],
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
                  Mové los valores y elegí una tasa para ver cómo cambia la
                  cuota. Tomamos {Math.round(FINANCE.downPaymentPct * 100)}% de
                  entrega y {FINANCE.termMonths} meses como referencia, y tu
                  permuta también cuenta como parte de la entrega. Es un número
                  orientativo; la cuota final la confirma la financiera.
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

                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] font-medium text-ink-dim">
                        Tasa de interés (TNA)
                      </span>
                      <span className="tnum text-[16px] font-semibold text-ink">
                        {tna.toFixed(2)}%
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {RATE_OPTIONS.map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setTna(rate)}
                          className={
                            "tnum rounded-full px-4 py-2 text-[13px] font-medium transition-colors " +
                            (rate === tna
                              ? "bg-red text-white"
                              : "bg-surface-2 text-ink-dim hover:bg-surface-hi hover:text-ink")
                          }
                          aria-pressed={rate === tna}
                        >
                          {rate.toFixed(2)}%
                        </button>
                      ))}
                    </div>
                  </div>
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
                      ["TNA seleccionada", `${tna.toFixed(2)}%`],
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

                  <div className="mt-5 flex items-center gap-3">
                    <span className="text-[11px] font-medium text-ink-faint">
                      En alianza con
                    </span>
                    <Image
                      src={miAutoLogo}
                      alt="Mi Auto by Santander"
                      height={44}
                      style={{ height: 44, width: "auto" }}
                    />
                  </div>

                  <WhatsappCaptureButton
                    buildMessage={(name, phone) =>
                      `Hola RS Motors, mi nombre es ${name} (Tel: ${phone}). ${financeMessage}`
                    }
                    context="sobre financiación"
                    source="Calculadora de financiación"
                    buttonLabel="Consultar esta cuota"
                    buttonClassName="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-red-hi"
                  />

                  <p className="mt-5 text-[11px] leading-relaxed text-ink-faint">
                    Los montos de las cuotas y las tasas de interés presentadas
                    son de carácter estimativo y promedio. Cada cliente cuenta
                    con un perfil crediticio único, por lo que los valores
                    definitivos pueden variar según la evaluación de su
                    historial de crédito y las condiciones específicas
                    aprobadas por la entidad financiera.
                  </p>
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
                  Lo que en ocasiones parece fuera de alcance, se vuelve posible
                  a través de una planificación adecuada. El vehículo que
                  conduce actualmente representa el pago inicial (down payment)
                  que lo separa de la unidad que realmente desea.
                </p>
                <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-ink-dim">
                  Entregue su usado, configure cuotas mensuales acordes a su
                  capacidad y comience a disfrutar todos los días del automóvil
                  que eligió.
                </p>
                <div className="mt-7 flex flex-col gap-5">
                  {(
                    [
                      [
                        "Tasación ágil",
                        "Ingrese los datos de su vehículo y obtenga un rango de cotización estimado en el transcurso del día.",
                      ],
                      [
                        "Transparencia absoluta",
                        "El valor tasado se aplica de forma directa sobre la unidad seleccionada, sin complicaciones ni sorpresas.",
                      ],
                    ] as const
                  ).map(([title, body]) => (
                    <div key={title}>
                      <div className="text-[14px] font-semibold text-ink">
                        {title}
                      </div>
                      <p className="mt-1 max-w-[42ch] text-[14px] leading-relaxed text-ink-dim">
                        {body}
                      </p>
                    </div>
                  ))}
                </div>
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
                <WhatsappCaptureButton
                  buildMessage={(name, phone) =>
                    `Hola RS Motors, mi nombre es ${name} (Tel: ${phone}). ${tradeMessage}`
                  }
                  context="sobre una tasación de permuta"
                  source="Formulario de permuta"
                  disabled={!tradeReady}
                  buttonLabel="Pedir tasación"
                  buttonClassName="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-red-hi"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Dealership — boxed static photo of the real RS Motors location.
 *  Drop the photo at public/images/dealer.jpg (any size — it's cropped to
 *  fill the box via object-cover) and it appears here automatically.
 * ------------------------------------------------------------------ */
function Dealership() {
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useReveal(sectionRef);
  return (
    <section
      ref={sectionRef}
      className={"px-5 sm:px-8 " + revealClassName(visible)}
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="relative h-[75vh] overflow-hidden rounded-[32px] shadow-float">
          <Image
            src="/images/dealer.jpg"
            alt="Local de RS Motors en Maldonado"
            fill
            sizes="(max-width: 1320px) 100vw, 1320px"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
          <div className="absolute bottom-0 left-0 p-7 sm:p-10">
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-yellow-400 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
              <MapPin className="size-3.5 shrink-0" />
              {SITE.address}
            </div>
            <p className="mt-2 max-w-[38ch] text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.5)]">
              Nuestro local en Maldonado
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  About
 * ------------------------------------------------------------------ */
function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useReveal(sectionRef);
  const metrics = [
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Mecánicamente inspeccionado",
      note: "Cada unidad pasa por taller antes de publicarse.",
    },
    {
      icon: Tag,
      value: "Transparencia absoluta",
      label: null,
      note: "El precio publicado es real, definitivo y sin cargos sorpresas ni gastos ocultos.",
    },
    {
      icon: Check,
      value: "Certificación rigurosa",
      label: null,
      note: "Verificamos minuciosamente el kilometraje y la documentación de cada unidad para garantizarle total tranquilidad y confianza absoluta.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={"px-5 py-24 sm:px-8 sm:py-32 " + revealClassName(visible)}
    >
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading id="nosotros" title="Nosotros" />

        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="max-w-[52ch] text-[16px] leading-relaxed text-ink-dim">
              Una selección exclusiva y rigurosa en Maldonado. Elegimos cada
              unidad bajo estrictos estándares de calidad, exhibiendo cada
              detalle con total transparencia para que encuentre el vehículo
              ideal en un entorno sin distracciones. Lo publicado corresponde a
              nuestra muestra actual; el resto de las alternativas las
              conversamos de manera personalizada en nuestro espacio o a través
              de WhatsApp.
            </p>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-ink-dim">
              Nuestro propósito es acercarle opciones reales y estructuradas
              para que el vehículo que desea esté a su alcance, transformando
              aspiraciones en realidades tangibles.
            </p>
            <p className="mt-7 max-w-[26ch] text-[clamp(1.75rem,2.6vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink">
              Porque el auto con el que sueña ya está a su alcance, diseñado
              para su ritmo de vida.
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
                key={m.value}
                className="flex items-start gap-5 rounded-3xl bg-surface p-8 shadow-pop"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-2">
                  <m.icon className="size-5 text-red-hi" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[18px] font-semibold tracking-[-0.02em] text-ink">
                    {m.value}
                  </div>
                  {m.label && (
                    <div className="mt-0.5 text-[13px] font-medium text-ink-dim">
                      {m.label}
                    </div>
                  )}
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
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useReveal(sectionRef);
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
      ref={sectionRef}
      id="contacto"
      className={
        "scroll-mt-28 px-5 py-24 sm:px-8 sm:py-32 " + revealClassName(visible)
      }
    >
      <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* left — heading + contact data */}
        <div>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
            Visite nuestro local
          </h2>
          <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-ink-dim sm:text-[17px]">
            Lo invitamos a visitarnos en nuestro local en Maldonado para conocer
            y probar las unidades sin apuro, o bien a comunicarse con nosotros a
            través de WhatsApp para una respuesta ágil y personalizada.
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
            saveLead({
              name: form.nombre || "Sin nombre",
              phone: form.contacto,
              context: "Consulta general",
              message,
              source: "Formulario de contacto — Inicio",
            });
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
        <Dealership />
        <Contact />
      </main>
      <Footer />
      <SalesAgentWidget />
    </div>
  );
}
