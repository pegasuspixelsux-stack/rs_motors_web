"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  STAGES,
  SOURCE_OPTIONS,
  getLeads,
  createLead as createLeadDoc,
  moveLeadStage,
  addLeadComment,
  deleteLead,
  type Lead,
  type Stage,
} from "@/lib/leads-store";

/**
 * Contactos / leads kanban for the admin panel — real Firestore data now
 * (lib/leads-store.ts's "leads" collection), shared with every public
 * WhatsApp/contact capture point on the site. See that file and
 * lib/firebase.ts for the current no-real-auth/open-rules caveat.
 */

const sectionLabel =
  "text-[12px] font-semibold uppercase tracking-[0.1em] text-neutral-400";
const stageSelect =
  "rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600 outline-none transition-colors focus:border-red";
const field =
  "w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[13px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-red focus:bg-white";

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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newLead, setNewLead] = useState(EMPTY_NEW_LEAD);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLeads()
      .then((data) => {
        if (!cancelled) setLeads(data);
      })
      .catch((err) => {
        console.error("No se pudieron cargar los leads:", err);
        if (!cancelled) {
          setLoadError(
            err instanceof Error && err.message.includes("permission")
              ? "Firestore rechazó la lectura — revisá las reglas de seguridad."
              : "No se pudieron cargar los leads.",
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

  const active = leads.find((l) => l.id === activeId) ?? null;

  function moveStage(id: string, stage: Stage) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
    moveLeadStage(id, stage).catch((err) =>
      console.error("No se pudo mover el lead de etapa:", err),
    );
  }

  function removeLead(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setArmedDeleteId(null);
    setActiveId((prev) => (prev === id ? null : prev));
    deleteLead(id).catch((err) =>
      console.error("No se pudo eliminar el lead:", err),
    );
  }

  function addComment(id: string) {
    const text = draft.trim();
    if (!text) return;
    const optimistic = { id: `pending-${Date.now()}`, date: "Recién", text };
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, comments: [optimistic, ...l.comments] } : l,
      ),
    );
    setDraft("");
    addLeadComment(id, text).catch((err) =>
      console.error("No se pudo guardar la nota:", err),
    );
  }

  async function createLead(e: FormEvent) {
    e.preventDefault();
    const name = newLead.name.trim();
    if (!name) return;
    setSaving(true);
    try {
      await createLeadDoc({
        name,
        interest: newLead.interest.trim(),
        phone: newLead.phone.trim(),
        email: newLead.email.trim(),
        source: newLead.source,
        urgencyScore: Math.min(10, Math.max(1, Number(newLead.urgencyScore) || 5)),
        note: newLead.note,
      });
      const data = await getLeads();
      setLeads(data);
      setNewLead(EMPTY_NEW_LEAD);
      setAddOpen(false);
    } catch (err) {
      console.error("No se pudo crear el lead:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-neutral-900">
            Contactos y leads
          </h1>
          <p className="mt-1 text-[13px] text-neutral-400">
            Los WhatsApp y formularios del sitio caen acá en Nuevo, en tiempo
            real vía Firestore.
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

      {loadError && (
        <div className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-[13px] font-medium text-red-hi">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center text-[13px] text-neutral-400 shadow-sm">
          Cargando leads desde Firestore…
        </div>
      ) : (
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
      )}

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
                  disabled={saving}
                  className="rounded-full bg-red px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-hi disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "Guardando…" : "Guardar lead"}
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
