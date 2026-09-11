"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { saveLead } from "@/lib/leads-store";

/**
 * Floating lead-qualification widget — a scripted, multi-step chat that
 * narrows a visitor down to vehicle type / budget / urgency / permuta before
 * asking for contact details. Auto-opens shortly after the page loads.
 *
 * Like WhatsappCaptureButton, the qualified lead is saved via
 * lib/leads-store.ts (localStorage, no real backend — see that file) so it
 * shows up in the admin panel's Contactos tab, same as every other capture
 * point on the site.
 */

type LeadData = {
  vehicleType: string;
  budget: string;
  urgency: string;
  tradeIn: string;
  visitTiming: string;
  name: string;
  phone: string;
  email: string;
};

const EMPTY_LEAD: LeadData = {
  vehicleType: "",
  budget: "",
  urgency: "",
  tradeIn: "",
  visitTiming: "",
  name: "",
  phone: "",
  email: "",
};

const VEHICLE_TYPES = [
  "Automóvil / sedán",
  "SUV / camioneta",
  "Deportivo / alta gama",
  "Moto / scooter",
];

const BUDGETS = [
  "Hasta USD 30.000",
  "USD 30.000 – 70.000",
  "USD 70.000 – 150.000",
  "Más de USD 150.000",
];

const URGENCY_OPTIONS = [
  "Inmediata (esta semana)",
  "Próximo mes",
  "Evaluando opciones, sin apuro",
];

const AGENT_BUBBLE =
  "rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-neutral-600 shadow-sm";
const USER_BUBBLE =
  "rounded-2xl bg-red px-3.5 py-2 text-[13px] font-medium text-white";
const OPTION_BUTTON =
  "flex w-full items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-left text-[13px] text-neutral-600 shadow-sm transition-colors hover:border-red hover:bg-red hover:text-white";
const FIELD =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-[13px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-red focus:bg-white";
const FIELD_LABEL =
  "text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400";

export function SalesAgentWidget() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(1);
  const [lead, setLead] = useState<LeadData>(EMPTY_LEAD);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [dismissed]);

  function choose(field: "vehicleType" | "budget" | "urgency", value: string) {
    setLead((prev) => ({ ...prev, [field]: value }));
    setStep((prev) => prev + 1);
  }

  function close() {
    setOpen(false);
    setDismissed(true);
  }

  function handleFinalSubmit(e: FormEvent) {
    e.preventDefault();

    let urgencyScore = 5;
    const urgency = lead.urgency.toLowerCase();
    const visit = lead.visitTiming.toLowerCase();
    if (urgency.includes("inmediata")) urgencyScore += 3;
    if (visit.includes("esta semana") || visit.includes("hoy")) urgencyScore += 2;
    urgencyScore = Math.min(urgencyScore, 10);

    saveLead({
      name: lead.name || "Sin nombre",
      phone: lead.phone,
      context: lead.vehicleType || "Consulta general",
      message: [
        `Interés: ${lead.vehicleType}`,
        `Presupuesto: ${lead.budget}`,
        `Urgencia: ${lead.urgency} (score ${urgencyScore}/10)`,
        `Permuta: ${lead.tradeIn}`,
        `Visita: ${lead.visitTiming}`,
        lead.email ? `Email: ${lead.email}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      source: "Asesor virtual",
    });
    setStep(6);
  }

  const dotPing = reduced ? "" : "animate-ping ";

  if (!open) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setDismissed(false);
          }}
          className="flex items-center gap-3 rounded-full bg-white px-5 py-3.5 text-ground shadow-float transition-transform hover:scale-105"
        >
          <span className="relative flex size-3">
            <span
              className={
                dotPing +
                "absolute inline-flex size-full rounded-full bg-red/70 opacity-75"
              }
            />
            <span className="relative inline-flex size-3 rounded-full bg-red" />
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">
            Agente RS
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-[380px] sm:max-w-[420px]">
      <div
        role="dialog"
        aria-modal="false"
        className="flex max-h-[min(640px,80vh)] flex-col overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="relative flex size-2.5">
              <span
                className={
                  dotPing +
                  "absolute inline-flex size-full rounded-full bg-red/70 opacity-75"
                }
              />
              <span className="relative inline-flex size-2.5 rounded-full bg-red" />
            </span>
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-900">
                Asesor virtual RS
              </h3>
              <span className="text-[11px] text-neutral-400">
                En línea · Calificación instantánea
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto bg-neutral-50 p-5">
          <AgentTurn>
            ¡Hola! Bienvenido a RS Motors. Estoy acá para ayudarte a encontrar
            exactamente lo que buscás. ¿Qué tipo de vehículo te interesa?
          </AgentTurn>

          {step === 1 && (
            <Options>
              {VEHICLE_TYPES.map((opt) => (
                <OptionButton
                  key={opt}
                  onClick={() => choose("vehicleType", opt)}
                  label={opt}
                />
              ))}
            </Options>
          )}
          {lead.vehicleType && <UserTurn>{lead.vehicleType}</UserTurn>}

          {step >= 2 && (
            <AgentTurn>
              Perfecto. ¿Qué presupuesto aproximado estás manejando?
            </AgentTurn>
          )}
          {step === 2 && (
            <Options>
              {BUDGETS.map((opt) => (
                <OptionButton
                  key={opt}
                  onClick={() => choose("budget", opt)}
                  label={opt}
                />
              ))}
            </Options>
          )}
          {lead.budget && <UserTurn>{lead.budget}</UserTurn>}

          {step >= 3 && (
            <AgentTurn>¿Con qué urgencia necesitás concretar la compra?</AgentTurn>
          )}
          {step === 3 && (
            <Options>
              {URGENCY_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt}
                  onClick={() => choose("urgency", opt)}
                  label={opt}
                />
              ))}
            </Options>
          )}
          {lead.urgency && <UserTurn>{lead.urgency}</UserTurn>}

          {step >= 4 && (
            <AgentTurn>
              ¿Contás con algún vehículo para permuta y cuándo podrías
              visitarnos en el local?
            </AgentTurn>
          )}
          {step === 4 && (
            <div className="ml-9 flex flex-col gap-3">
              <label className="block">
                <span className={FIELD_LABEL}>¿Tenés vehículo para permuta?</span>
                <select
                  value={lead.tradeIn}
                  onChange={(e) =>
                    setLead((prev) => ({ ...prev, tradeIn: e.target.value }))
                  }
                  className={FIELD + " mt-1.5"}
                >
                  <option value="">Seleccionar…</option>
                  <option value="Sí, tengo vehículo para permuta">
                    Sí, tengo vehículo para permuta
                  </option>
                  <option value="No, compra directa">No, compra directa</option>
                </select>
              </label>
              <label className="block">
                <span className={FIELD_LABEL}>
                  ¿Cuándo podrías venir al local?
                </span>
                <input
                  value={lead.visitTiming}
                  onChange={(e) =>
                    setLead((prev) => ({ ...prev, visitTiming: e.target.value }))
                  }
                  placeholder="Ej. Este sábado de tarde"
                  className={FIELD + " mt-1.5"}
                />
              </label>
              <button
                type="button"
                disabled={!lead.tradeIn || !lead.visitTiming}
                onClick={() => setStep(5)}
                className="w-full rounded-full bg-red py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-hi disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuar
              </button>
            </div>
          )}

          {step >= 5 && step < 6 && (
            <div className="flex items-start gap-2">
              <Avatar />
              <div className={AGENT_BUBBLE + " flex-1 space-y-2.5"}>
                <p>
                  ¡Excelente! Vamos a armar una selección de vehículos a tu
                  medida. Dejanos tus datos para enviártela:
                </p>
                <form onSubmit={handleFinalSubmit} className="space-y-2">
                  <input
                    required
                    value={lead.name}
                    onChange={(e) =>
                      setLead((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Tu nombre"
                    className={FIELD}
                  />
                  <input
                    type="tel"
                    value={lead.phone}
                    onChange={(e) =>
                      setLead((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Teléfono / WhatsApp (opcional)"
                    className={FIELD}
                  />
                  <input
                    type="email"
                    value={lead.email}
                    onChange={(e) =>
                      setLead((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Correo electrónico (opcional)"
                    className={FIELD}
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-red py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-hi"
                  >
                    Generar mi lista personalizada
                  </button>
                </form>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="flex items-start gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-red text-white">
                <Check className="size-3.5" />
              </div>
              <div className="flex-1 space-y-1 rounded-2xl border border-red/20 bg-red/5 px-3.5 py-2.5 text-[13px] leading-relaxed text-neutral-600">
                <p className="font-semibold text-neutral-900">¡Listo, {lead.name}!</p>
                <p>
                  Tu perfil quedó registrado. Un asesor te va a contactar a la
                  brevedad con la selección de vehículos.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50 px-3 py-2.5 text-center text-[11px] text-neutral-400">
          RS Motors · Asesor de compra automatizado
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-red text-[10px] font-semibold text-white">
      RS
    </div>
  );
}

function AgentTurn({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Avatar />
      <div className={AGENT_BUBBLE}>{children}</div>
    </div>
  );
}

function UserTurn({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className={USER_BUBBLE}>{children}</div>
    </div>
  );
}

function Options({ children }: { children: ReactNode }) {
  return <div className="ml-9 flex flex-col gap-2">{children}</div>;
}

function OptionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={OPTION_BUTTON}>
      <ArrowRight className="size-3.5 shrink-0" />
      {label}
    </button>
  );
}
