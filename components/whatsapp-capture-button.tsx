"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { waLink } from "@/lib/site";
import { saveLead } from "@/lib/leads-store";
import { WhatsappGlyph } from "./whatsapp-glyph";

/**
 * A WhatsApp CTA that captures name + phone first, so the lead is legible
 * before the visitor lands in chat. Every submission is saved via
 * lib/leads-store.ts, which the admin panel's Contactos tab reads on load —
 * see that file for the (localStorage-only, no real backend) caveat.
 *
 * Used everywhere the site offers a WhatsApp CTA — nav, vehicle detail,
 * the financing calculator, the trade-in tool — so no WhatsApp button skips
 * capture. The one exception is the inline contact forms (vehicle detail
 * and the homepage Contacto section), which already ask for name/phone
 * directly and call saveLead themselves without this modal.
 *
 * The modal is portaled to document.body: the Nav's call site sits inside
 * a `backdrop-blur-xl` header, and a backdrop-filter (like `transform`)
 * makes its element the containing block for `position: fixed` descendants
 * — without the portal, the overlay would be confined to that ~64px header
 * box instead of the viewport, showing up squeezed against the top edge.
 */
export function WhatsappCaptureButton({
  buildMessage,
  context,
  source,
  buttonClassName,
  buttonLabel = "Consultar por WhatsApp",
  disabled = false,
}: {
  /** Builds the final WhatsApp message from the captured name + phone. */
  buildMessage: (name: string, phone: string) => string;
  /** Optional trailing context shown in the modal, e.g. "sobre el Volkswagen Golf GTI". */
  context?: string;
  /** Where this button lives, e.g. "Ficha de vehículo" — shown in the admin dashboard. */
  source: string;
  buttonClassName: string;
  buttonLabel?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const field =
    "mt-2 w-full rounded-2xl bg-surface px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:bg-surface-hi";

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={
          buttonClassName +
          (disabled ? " cursor-not-allowed opacity-40" : "")
        }
      >
        <WhatsappGlyph size={15} />
        {buttonLabel}
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              className="my-8 w-full max-w-md rounded-[24px] border border-hairline bg-surface p-8 shadow-float"
            >
            <h3 className="text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-ink">
              Contacto por WhatsApp
            </h3>
            <p className="mt-2 text-center text-[13px] leading-relaxed text-ink-faint">
              Dejanos tu nombre y número para abrir el chat directo con un
              asesor{context ? ` ${context}` : ""}.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const message = buildMessage(name, phone);
                saveLead({
                  name,
                  phone,
                  context: context ?? "Consulta general",
                  message,
                  source,
                });
                window.open(waLink(message), "_blank", "noopener,noreferrer");
                setOpen(false);
                setName("");
                setPhone("");
              }}
              className="mt-6 flex flex-col gap-4"
            >
              <label className="block">
                <span className="text-[13px] font-medium text-ink-dim">
                  Nombre
                </span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className={field}
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-ink-dim">
                  Número de WhatsApp
                </span>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 099 123 456"
                  className={field}
                />
              </label>

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-surface-2 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-dim transition-colors hover:bg-surface-hi hover:text-ink"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-red py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-hi"
                >
                  Continuar a chat
                </button>
              </div>
            </form>
          </div>
          </div>,
          document.body,
        )}
    </>
  );
}
