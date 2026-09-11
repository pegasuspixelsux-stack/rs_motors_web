"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ArrowLeft, LogOut, Menu, Plus, Trash2, X } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { AddInventoryModal } from "@/components/admin/add-inventory-modal";
import { EditInventoryModal } from "@/components/admin/edit-inventory-modal";
import { LeadsKanban } from "@/components/admin/leads-kanban";
import { UsersPanel } from "@/components/admin/users-panel";
import { STATUS_LABEL } from "@/lib/inventory";
import {
  getAdminVehicles,
  createVehicle,
  updateVehicle,
  toggleVehiclePublished,
  deleteVehicle,
  type AdminVehicle,
  type NewVehicleInput,
} from "@/lib/inventory-store";
import { getLeads, STAGE_LABEL, type Lead } from "@/lib/leads-store";
import { fmtInt, fmtUSD } from "@/lib/format";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { auth } from "@/lib/firebase";
import { DEMO_EMAIL } from "@/lib/admin-auth";

/**
 * Internal admin UI shell — reachable from the site footer, but not part of
 * the public marketing experience.
 *   - Login is real Firebase Auth (email/password) now.
 *   - Inventario, Contactos and Usuarios are real Firestore data
 *     (lib/inventory-store.ts, lib/leads-store.ts, lib/users-store.ts).
 *   - Firestore/Storage security rules are currently wide open (not scoped
 *     to signed-in users) — see the file-level note on lib/firebase.ts.
 *     Tighten those before this protects anything real.
 */

type View = "login" | "dashboard";
type Tab = "panel" | "inventario" | "contactos" | "usuarios" | "config";

const TABS: { key: Tab; label: string }[] = [
  { key: "panel", label: "Panel de control" },
  { key: "inventario", label: "Inventario" },
  { key: "contactos", label: "Contactos / leads" },
  { key: "usuarios", label: "Usuarios" },
  { key: "config", label: "Configuración" },
];

export default function AdminPage() {
  const [view, setView] = useState<View>("login");
  const [tab, setTab] = useState<Tab>("panel");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [recentVehicles, setRecentVehicles] = useState<AdminVehicle[]>([]);
  const reduced = useReducedMotion();

  // Firebase Auth persists sessions across reloads — restore the dashboard
  // view when one already exists instead of always defaulting to login.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setView("dashboard");
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (view !== "dashboard") return;
    let cancelled = false;
    getLeads()
      .then((data) => {
        if (!cancelled) setLeads(data);
      })
      .catch((err) => console.error("No se pudieron cargar los leads:", err));
    getAdminVehicles()
      .then((data) => {
        if (!cancelled) setRecentVehicles(data);
      })
      .catch((err) => console.error("No se pudo cargar el inventario:", err));
    return () => {
      cancelled = true;
    };
  }, [view]);

  const field =
    "mt-2 w-full rounded-2xl bg-surface-2 px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:bg-surface-hi";

  if (view === "login") {
    return (
      <div className="grid min-h-screen bg-ground text-ink lg:grid-cols-2">
        <div className="relative isolate hidden overflow-hidden lg:flex lg:flex-col lg:p-12">
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
            <div className="absolute inset-0 bg-ground/56" />
          </div>

          <div>
            <h1 className="max-w-sm text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-ink [text-shadow:0_2px_20px_rgba(0,0,0,0.5)]">
              Sistema de Ventas y Gestión de Clientes
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-dim [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
              Panel interno para el concesionario: inventario, leads y
              configuración en un solo lugar.
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-1">
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
              RS Motors · Enterprise
            </span>
            <span className="tnum text-[11px] text-ink-faint">
              Versión 1.0 · © {new Date().getFullYear()} RS Motors · by
              Pegasus Pixels
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-16 sm:px-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="flex items-center justify-between">
              <Wordmark height={22} />
              <Link
                href="/"
                className="text-[12px] font-medium text-ink-faint transition-colors hover:text-ink"
              >
                ← Volver al sitio
              </Link>
            </div>

            <h2 className="mt-10 text-[26px] font-semibold tracking-[-0.02em] text-ink">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-[13px] text-ink-faint">
              Acceso interno para el equipo de RS Motors.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAuthBusy(true);
                setAuthError(null);
                try {
                  await signInWithEmailAndPassword(auth, email, password);
                  setView("dashboard");
                } catch {
                  setAuthError("Correo o contraseña incorrectos.");
                } finally {
                  setAuthBusy(false);
                }
              }}
              className="mt-8 flex flex-col gap-4"
            >
              <label className="block">
                <span className="text-[13px] font-medium text-ink-dim">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={DEMO_EMAIL}
                  className={field}
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-ink-dim">
                  Contraseña
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={field}
                />
              </label>

              {authError && (
                <p className="text-[13px] font-medium text-red-hi">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authBusy}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red px-6 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-red-hi disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authBusy ? "Accediendo…" : "Acceder al panel"}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-faint">
              Acceso real vía Firebase Authentication — iniciá sesión con tu
              cuenta de RS Motors (ej. {DEMO_EMAIL}).
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mainTabs = TABS.filter((t) => t.key !== "config");
  const configTab = TABS.find((t) => t.key === "config")!;

  // Real, derived from the Firestore data already fetched above — not a
  // tracked sales record, so "Autos vendidos" is a proxy from leads that
  // reached the "Cerrado" stage, not a separate ledger.
  const publishedCount = recentVehicles.filter((v) => v.publicado).length;
  const closedLeads = leads.filter((l) => l.stage === "cerrado").length;
  const newLeads = leads.filter((l) => l.stage === "nuevo").length;
  const conversionRate = leads.length ? (closedLeads / leads.length) * 100 : 0;

  const kpis = [
    {
      label: "Inventario actual",
      value: fmtInt(recentVehicles.length),
      detail: `${fmtInt(publishedCount)} publicados · ${fmtInt(recentVehicles.length - publishedCount)} sin publicar`,
    },
    {
      label: "Contactos / leads",
      value: fmtInt(leads.length),
      detail: `${fmtInt(newLeads)} nuevos · ${fmtInt(closedLeads)} cerrados`,
    },
    {
      label: "Autos vendidos",
      value: fmtInt(closedLeads),
      detail: "Leads en etapa Cerrado — sin registro de ventas separado todavía",
    },
    {
      label: "Tasa de conversión",
      value: leads.length ? `${conversionRate.toFixed(1).replace(".", ",")}%` : "—",
      detail: `${fmtInt(closedLeads)} cerrados de ${fmtInt(leads.length)} leads totales`,
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-ground text-ink lg:flex-row">
      {/* mobile top bar — replaces the sidebar's role below lg */}
      <div className="flex items-center justify-between border-b border-hairline bg-surface px-5 py-4 lg:hidden">
        <Wordmark height={17} />
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Abrir menú"
          className="grid size-9 place-items-center rounded-full bg-surface-2 text-ink transition-colors hover:bg-surface-hi"
        >
          <Menu className="size-4" />
        </button>
      </div>

      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* nav — sticky sidebar on desktop, slide-in drawer on mobile */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col justify-between border-r border-hairline bg-surface transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:w-64 lg:translate-x-0 " +
          (navOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Wordmark height={18} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Panel
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Cerrar menú"
              className="grid size-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
            >
              <X className="size-4" />
            </button>
          </div>
          <nav className="mt-8 flex flex-col gap-1">
            {mainTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setNavOpen(false);
                }}
                className={
                  "rounded-xl px-4 py-3 text-left text-[13px] font-medium transition-colors " +
                  (tab === t.key
                    ? "bg-red text-white"
                    : "text-ink-dim hover:bg-surface-2 hover:text-ink")
                }
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-hairline p-6">
          <button
            type="button"
            onClick={() => {
              setTab(configTab.key);
              setNavOpen(false);
            }}
            className={
              "w-full rounded-xl px-4 py-3 text-left text-[13px] font-medium transition-colors " +
              (tab === configTab.key
                ? "bg-red text-white"
                : "text-ink-dim hover:bg-surface-2 hover:text-ink")
            }
          >
            {configTab.label}
          </button>
          <Link
            href="/"
            className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-medium text-ink-dim transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Volver al sitio
          </Link>
          <div className="mt-3 border-t border-hairline px-4 pt-4">
            <p className="text-[11px] text-ink-faint">Sesión de Firebase</p>
            <button
              type="button"
              onClick={() => {
                signOut(auth).finally(() => setView("login"));
              }}
              className="mt-2 inline-flex items-center gap-2 text-[13px] font-medium text-ink-dim transition-colors hover:text-red-hi"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* main — light, for data-dense working space */}
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-5 text-neutral-900 sm:p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          {tab === "panel" && (
            <div className="space-y-10">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
                <div>
                  <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-neutral-900">
                    Panel de control
                  </h1>
                  <p className="mt-1 text-[13px] text-neutral-400">
                    Datos reales de Firestore — &quot;Autos vendidos&quot; y la
                    tasa de conversión son un estimado a partir de los leads
                    en Cerrado, no un registro de ventas.
                  </p>
                </div>
              </header>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400">
                      {kpi.label}
                    </div>
                    <div className="tnum mt-2 text-[30px] font-semibold tracking-[-0.02em] text-neutral-900">
                      {kpi.value}
                    </div>
                    <div className="tnum mt-3 border-t border-neutral-100 pt-3 text-[11px] text-neutral-400">
                      {kpi.detail}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                      Último inventario agregado
                    </h3>
                    <button
                      type="button"
                      onClick={() => setTab("inventario")}
                      className="text-[12px] font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                      Ver todo →
                    </button>
                  </div>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {recentVehicles.slice(0, 3).map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                      >
                        <div>
                          <div className="text-[14px] font-medium text-neutral-900">
                            {v.marca} {v.modelo}
                          </div>
                          <div className="tnum text-[12px] text-neutral-400">
                            {v.anio} · {fmtUSD(v.precioUSD)}
                          </div>
                        </div>
                        <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-500">
                          {v.status === "recien-ingresado"
                            ? "Recién ingresado"
                            : "Disponible"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                      Últimos contactos / leads
                    </h3>
                    <button
                      type="button"
                      onClick={() => setTab("contactos")}
                      className="text-[12px] font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                      Ver todo →
                    </button>
                  </div>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {[...leads]
                      .sort((a, b) => b.urgencyScore - a.urgencyScore)
                      .slice(0, 3)
                      .map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                        >
                          <div>
                            <div className="text-[14px] font-medium text-neutral-900">
                              {lead.name}
                            </div>
                            <div className="text-[12px] text-neutral-400">
                              Interés: {lead.interest}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] text-neutral-400">
                              {STAGE_LABEL[lead.stage]}
                            </div>
                            <span className="mt-1 inline-block rounded-full bg-red/10 px-2 py-0.5 text-[11px] font-medium text-red">
                              {lead.source}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "inventario" && <InventoryPanel />}
          {tab === "contactos" && <LeadsKanban />}
          {tab === "usuarios" && <UsersPanel />}
          {tab === "config" && (
            <EmptyPanel
              title="Configuración"
              subtitle="Datos de contacto, horarios y financiación."
              body="Próximamente: edición de los valores hoy fijados en lib/site.ts y lib/finance.ts."
            />
          )}
        </div>
      </main>
    </div>
  );
}

function InventoryPanel() {
  const [rows, setRows] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminVehicle | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminVehicles()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        console.error("No se pudo cargar el inventario:", err);
        if (!cancelled) {
          setLoadError(
            err instanceof Error && err.message.includes("permission")
              ? "Firestore rechazó la lectura — revisá las reglas de seguridad."
              : "No se pudo cargar el inventario.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function togglePublished(v: AdminVehicle) {
    setRows((prev) =>
      prev.map((r) => (r.id === v.id ? { ...r, publicado: !r.publicado } : r)),
    );
    toggleVehiclePublished(v.id, v.publicado).catch((err) =>
      console.error("No se pudo actualizar la publicación:", err),
    );
  }

  function saveEdit(id: string, patch: Partial<AdminVehicle>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    updateVehicle(id, patch).catch((err) =>
      console.error("No se pudo guardar la unidad:", err),
    );
    setEditing(null);
  }

  function addVehicle(input?: NewVehicleInput) {
    if (!input || !input.marca || !input.modelo) return;
    const fallbackImage = rows[0]?.imagen ?? "";
    createVehicle(input, fallbackImage)
      .then(() => getAdminVehicles())
      .then(setRows)
      .catch((err) => console.error("No se pudo crear el vehículo:", err));
  }

  function removeVehicle(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setArmedDeleteId(null);
    deleteVehicle(id).catch((err) =>
      console.error("No se pudo eliminar la unidad:", err),
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-neutral-900">
            Inventario de vehículos
          </h1>
          <p className="mt-1 text-[13px] text-neutral-400">
            {fmtInt(rows.length)} unidades en Firestore.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-red px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-hi"
        >
          <Plus className="size-4" />
          Agregar vehículo
        </button>
      </header>

      {loadError && (
        <div className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-[13px] font-medium text-red-hi">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center text-[13px] text-neutral-400 shadow-sm">
          Cargando inventario desde Firestore…
        </div>
      ) : (
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-neutral-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                <th className="px-5 py-3 font-semibold">Unidad</th>
                <th className="px-5 py-3 font-semibold">Año</th>
                <th className="tnum px-5 py-3 font-semibold">Km</th>
                <th className="tnum px-5 py-3 font-semibold">Precio</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">Publicación</th>
                <th className="px-5 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-neutral-900">
                      {v.marca} {v.modelo}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Asesor: {v.assignedSalesman}
                    </div>
                  </td>
                  <td className="tnum px-5 py-3 text-neutral-600">
                    {v.anio}
                  </td>
                  <td className="tnum px-5 py-3 text-neutral-600">
                    {fmtInt(v.km)}
                  </td>
                  <td className="tnum px-5 py-3 text-neutral-600">
                    {fmtUSD(v.precioUSD)}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
                      {STATUS_LABEL[v.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => togglePublished(v)}
                      className={
                        "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors " +
                        (v.publicado
                          ? "bg-red/10 text-red hover:bg-red/15"
                          : "border border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100")
                      }
                    >
                      {v.publicado ? "Publicado" : "No publicado"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {armedDeleteId === v.id ? (
                      <span className="inline-flex items-center gap-2 text-[12px] font-medium">
                        <button
                          type="button"
                          onClick={() => setArmedDeleteId(null)}
                          className="text-neutral-400 hover:text-neutral-700"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVehicle(v.id)}
                          className="text-red-hi hover:underline"
                        >
                          Eliminar
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(v)}
                          className="rounded-full border border-neutral-200 px-3 py-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setArmedDeleteId(v.id)}
                          aria-label={`Eliminar ${v.marca} ${v.modelo}`}
                          className="rounded-full border border-neutral-200 p-2 text-neutral-400 transition-colors hover:border-red/30 hover:bg-red/5 hover:text-red-hi"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {editing && (
        <EditInventoryModal
          key={editing.id}
          vehicle={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}

      <AddInventoryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(vehicle) => {
          addVehicle(vehicle);
          setAddOpen(false);
        }}
      />
    </div>
  );
}

function EmptyPanel({
  title,
  subtitle,
  body,
}: {
  title: string;
  subtitle: string;
  body: string;
}) {
  return (
    <div className="space-y-6">
      <header className="border-b border-neutral-200 pb-6">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-neutral-900">
          {title}
        </h1>
        <p className="mt-1 text-[13px] text-neutral-400">{subtitle}</p>
      </header>
      <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
        <p className="mx-auto max-w-md text-[14px] leading-relaxed text-neutral-500">
          {body}
        </p>
      </div>
    </div>
  );
}
