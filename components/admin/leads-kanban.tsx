"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { getSavedLeads, type CapturedLead } from "@/lib/leads-store";

/**
 * Contactos / leads kanban for the admin panel — same UI-shell-only status
 * as the rest of app/admin/page.tsx. Real WhatsApp/contact-form submissions
 * from the public site land here too (via lib/leads-store.ts's localStorage
 * bridge, seeded into "Nuevo" on load) alongside the demo seed leads. Stage
 * moves, deletes and notes from here on live only in local React state —
 * none of it writes back to leads-store or anywhere else.
 */

export type Stage = "nuevo" | "contactado" | "seguimiento" | "cerrado";

type Comment = { id: string; date: string; text: string };

export type Lead = {
  id: string;
  name: string;
  interest: string;
  phone: string;
  email: string;
  stage: Stage;
  source: string;
  nextStep: string;
  due: string;
  urgencyScore: number;
  comments: Comment[];
};

export const STAGES: { key: Stage; label: string }[] = [
  { key: "nuevo", label: "Nuevo" },
  { key: "contactado", label: "Contactado" },
  { key: "seguimiento", label: "En seguimiento" },
  { key: "cerrado", label: "Cerrado" },
];

export const STAGE_LABEL: Record<Stage, string> = Object.fromEntries(
  STAGES.map((s) => [s.key, s.label]),
) as Record<Stage, string>;

const SOURCE_OPTIONS = [
  "WhatsApp",
  "Instagram",
  "Sitio web",
  "Manual / directo",
  "Red de contactos",
  "Referido",
];

/** Shared with app/admin/page.tsx's Panel de control card, so the same
 * demo people show up consistently instead of two disconnected mock lists. */
export const SEED_LEADS: Lead[] = [
  {
    id: "martin-rodriguez",
    name: "Martín Rodríguez",
    interest: "Volkswagen Golf GTI",
    phone: "+598 99 123 456",
    email: "martin@example.com",
    stage: "nuevo",
    source: "WhatsApp",
    nextStep: "Llamar para coordinar prueba de manejo",
    due: "Hoy",
    urgencyScore: 9,
    comments: [
      {
        id: "c1",
        date: "10/9 14:30",
        text: "Primer contacto vía WhatsApp. Muy interesado, pide detalles de financiación a 60 meses.",
      },
    ],
  },
  {
    id: "camila-suarez",
    name: "Camila Suárez",
    interest: "Fiat Cronos",
    phone: "+598 98 222 111",
    email: "camila@example.com",
    stage: "nuevo",
    source: "Instagram",
    nextStep: "Responder consulta por WhatsApp",
    due: "Hoy",
    urgencyScore: 6,
    comments: [],
  },
  {
    id: "sofia-valdes",
    name: "Sofía Valdés",
    interest: "Hyundai Creta",
    phone: "+598 98 654 321",
    email: "sofia@example.com",
    stage: "contactado",
    source: "Sitio web",
    nextStep: "Enviar cotización de financiación",
    due: "Mañana",
    urgencyScore: 7,
    comments: [
      {
        id: "c2",
        date: "8/9 11:15",
        text: "Llamada telefónica realizada. Viene al local este sábado con permuta.",
      },
    ],
  },
  {
    id: "ignacio-silva",
    name: "Ignacio Silva",
    interest: "Chevrolet Cruze",
    phone: "+598 91 987 654",
    email: "ignacio@example.com",
    stage: "seguimiento",
    source: "Referido",
    nextStep: "Confirmar tasación de permuta",
    due: "Vie 12/9",
    urgencyScore: 8,
    comments: [],
  },
  {
    id: "lucia-fernandez",
    name: "Lucía Fernández",
    interest: "Renault Sandero",
    phone: "+598 97 333 222",
    email: "lucia@example.com",
    stage: "seguimiento",
    source: "Red de contactos",
    nextStep: "Reenviar link de la calculadora",
    due: "Vie 12/9",
    urgencyScore: 5,
    comments: [],
  },
  {
    id: "bruno-acosta",
    name: "Bruno Acosta",
    interest: "Fiat Cronos",
    phone: "+598 94 555 888",
    email: "bruno@example.com",
    stage: "cerrado",
    source: "Manual / directo",
    nextStep: "Venta concretada — coordinar entrega",
    due: "—",
    urgencyScore: 10,
    comments: [
      { id: "c3", date: "5/9 09:00", text: "Seña confirmada. Entrega coordinada para el viernes." },
    ],
  },
];

const sectionLabel =
  "text-[12px] font-semibold uppercase tracking-[0.1em] text-neutral-400";
const stageSelect =
  "rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600 outline-none transition-colors focus:border-red";
const field =
  "w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[13px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-red focus:bg-white";

function capturedToLead(c: CapturedLead): Lead {
  const date = new Date(c.createdAt);
  const dateLabel = Number.isNaN(date.getTime())
    ? "Recién"
    : date.toLocaleString("es-UY", { dateStyle: "short", timeStyle: "short" });
  return {
    id: c.id,
    name: c.name,
    interest: c.context,
    phone: c.phone || "No registrado",
    email: "No registrado",
    stage: "nuevo",
    source: c.source,
    nextStep: "Responder consulta",
    due: "Hoy",
    urgencyScore: 7,
    comments: [{ id: `${c.id}-0`, date: dateLabel, text: c.message }],
  };
}

const EMPTY_NEW_LEAD = {
  name: "",
  interest: "",
  phone: "",
  email: "",
  source: SOURCE_OPTIONS[0],
  urgencyScore: "8",
  note: "",
};

export function LeadsKanban() {
  const [leads, setLeads] = useState<Lead[]>(() => [
    ...getSavedLeads().map(capturedToLead),
    ...SEED_LEADS,
  ]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newLead, setNewLead] = useState(EMPTY_NEW_LEAD);

  const active = leads.find((l) => l.id === activeId) ?? null;

  function moveStage(id: string, stage: Stage) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  }

  function removeLead(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setArmedDeleteId(null);
    setActiveId((prev) => (prev === id ? null : prev));
  }

  function addComment(id: string) {
    const text = draft.trim();
    if (!text) return;
    const comment: Comment = {
      id: `${id}-${leads.find((l) => l.id === id)?.comments.length ?? 0}-${text.length}`,
      date: "Recién",
      text,
    };
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, comments: [comment, ...l.comments] } : l,
      ),
    );
    setDraft("");
  }

  function createLead(e: FormEvent) {
    e.preventDefault();
    const name = newLead.name.trim();
    if (!name) return;

    const lead: Lead = {
      id: `${name.toLowerCase().replace(/\s+/g, "-")}-${leads.length}`,
      name,
      interest: newLead.interest.trim() || "Vehículo a definir",
      phone: newLead.phone.trim() || "No registrado",
      email: newLead.email.trim() || "No registrado",
      stage: "nuevo",
      source: newLead.source,
      nextStep: "Primer contacto pendiente",
      due: "Hoy",
      urgencyScore: Math.min(10, Math.max(1, Number(newLead.urgencyScore) || 5)),
      comments: newLead.note.trim()
        ? [{ id: `${name}-0`, date: "Recién", text: newLead.note.trim() }]
        : [],
    };

    setLeads((prev) => [lead, ...prev]);
    setNewLead(EMPTY_NEW_LEAD);
    setAddOpen(false);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-neutral-900">
            Contactos y leads
          </h1>
          <p className="mt-1 text-[13px] text-neutral-400">
            Los WhatsApp y formularios del sitio (en este navegador) caen acá
            en Nuevo. Movés etapas y agregás notas, pero nada de eso se
            guarda todavía.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-red px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-hi"
        >
          <Plus className="size-4" />
          Agregar lead externo
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.key);
          return (
            <div key={stage.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className={sectionLabel}>{stage.label}</h3>
                <span className="tnum text-[11px] font-medium text-neutral-400">
                  {stageLeads.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-white">
                          {lead.source}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-600">
                          Urgencia {lead.urgencyScore}/10
                        </span>
                      </div>
                      {armedDeleteId === lead.id ? (
                        <div className="flex shrink-0 items-center gap-2 text-[11px] font-medium">
                          <button
                            type="button"
                            onClick={() => setArmedDeleteId(null)}
                            className="text-neutral-400 hover:text-neutral-700"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLead(lead.id)}
                            className="text-red-hi hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setArmedDeleteId(lead.id)}
                          aria-label="Eliminar lead"
                          className="shrink-0 text-neutral-300 transition-colors hover:text-red-hi"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>

                    <div className="mt-2 text-[14px] font-medium text-neutral-900">
                      {lead.name}
                    </div>
                    <div className="text-[12px] text-neutral-400">
                      {lead.interest}
                    </div>

                    <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                        Próximo paso
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-neutral-600">
                        {lead.nextStep}
                      </p>
                      <span className="tnum mt-2 inline-block rounded-full bg-red/10 px-2 py-0.5 text-[10px] font-medium text-red">
                        {lead.due}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                      <select
                        value={lead.stage}
                        onChange={(e) =>
                          moveStage(lead.id, e.target.value as Stage)
                        }
                        aria-label="Mover de etapa"
                        className={stageSelect}
                      >
                        {STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setActiveId(lead.id)}
                        className="text-[12px] font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                      >
                        {lead.comments.length} notas · Abrir →
                      </button>
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-neutral-200 p-4 text-center text-[12px] text-neutral-400">
                    Sin leads en esta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setAddOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-lg rounded-[28px] border border-neutral-200 bg-white p-8 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-6">
              <div>
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-neutral-900">
                  Registrar lead externo
                </h2>
                <p className="mt-1 text-[13px] text-neutral-400">
                  Para prospectos que llegaron fuera del sitio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={createLead} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-[12px] font-medium text-neutral-500">
                  Nombre del prospecto
                </span>
                <input
                  required
                  value={newLead.name}
                  onChange={(e) =>
                    setNewLead({ ...newLead, name: e.target.value })
                  }
                  placeholder="Ej. Carlos Ferreira"
                  className={field + " mt-1.5"}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[12px] font-medium text-neutral-500">
                    Origen
                  </span>
                  <select
                    value={newLead.source}
                    onChange={(e) =>
                      setNewLead({ ...newLead, source: e.target.value })
                    }
                    className={field + " mt-1.5"}
                  >
                    {SOURCE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[12px] font-medium text-neutral-500">
                    Urgencia (1–10)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newLead.urgencyScore}
                    onChange={(e) =>
                      setNewLead({ ...newLead, urgencyScore: e.target.value })
                    }
                    className={field + " mt-1.5"}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[12px] font-medium text-neutral-500">
                    Teléfono / WhatsApp
                  </span>
                  <input
                    value={newLead.phone}
                    onChange={(e) =>
                      setNewLead({ ...newLead, phone: e.target.value })
                    }
                    placeholder="+598…"
                    className={field + " mt-1.5"}
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-medium text-neutral-500">
                    Interés vehicular
                  </span>
                  <input
                    value={newLead.interest}
                    onChange={(e) =>
                      setNewLead({ ...newLead, interest: e.target.value })
                    }
                    placeholder="Ej. Toyota Corolla"
                    className={field + " mt-1.5"}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[12px] font-medium text-neutral-500">
                  Nota inicial de conversación
                </span>
                <textarea
                  rows={3}
                  value={newLead.note}
                  onChange={(e) =>
                    setNewLead({ ...newLead, note: e.target.value })
                  }
                  placeholder="Detalles del primer contacto..."
                  className={field + " mt-1.5"}
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-full bg-neutral-100 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-neutral-600 transition-colors hover:bg-neutral-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-red px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-hi"
                >
                  Guardar lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setActiveId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[28px] border border-neutral-200 bg-white p-8 shadow-xl sm:p-10"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-6">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-white">
                    {active.source}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-600">
                    Urgencia {active.urgencyScore}/10
                  </span>
                </div>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-neutral-900">
                  {active.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:grid-cols-2">
              <div>
                <span className={sectionLabel}>Interés principal</span>
                <div className="mt-1 text-[14px] font-medium text-neutral-900">
                  {active.interest}
                </div>
              </div>
              <div>
                <span className={sectionLabel}>Teléfono / WhatsApp</span>
                <div className="tnum mt-1 text-[14px] font-medium text-neutral-900">
                  {active.phone}
                </div>
              </div>
              <div>
                <span className={sectionLabel}>Correo electrónico</span>
                <div className="mt-1 text-[14px] font-medium text-neutral-900">
                  {active.email}
                </div>
              </div>
              <div>
                <span className={sectionLabel}>Estado en el pipeline</span>
                <select
                  value={active.stage}
                  onChange={(e) => moveStage(active.id, e.target.value as Stage)}
                  className={field + " mt-1.5"}
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className={sectionLabel}>
                Historial de conversaciones y notas
              </h3>
              <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                {active.comments.length === 0 ? (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center text-[12px] text-neutral-400">
                    Sin notas registradas todavía.
                  </div>
                ) : (
                  active.comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-neutral-100 bg-neutral-50 p-3"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-1 text-[10px] font-medium uppercase tracking-[0.05em] text-neutral-400">
                        <span>Nota del asesor</span>
                        <span className="tnum">{c.date}</span>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-700">
                        {c.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2 border-t border-neutral-100 pt-6">
              <label className="block text-[12px] font-medium text-neutral-500">
                Agregar nota de conversación
              </label>
              <textarea
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Detalles de la última charla, objeciones o acuerdos con el cliente..."
                className={field}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!draft.trim()}
                  onClick={() => addComment(active.id)}
                  className="rounded-full bg-red px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-hi disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Registrar nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
