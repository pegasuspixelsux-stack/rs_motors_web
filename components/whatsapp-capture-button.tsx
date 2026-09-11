"use client";

import { useState } from "react";
import { waLink } from "@/lib/site";
import { WhatsappGlyph } from "./whatsapp-glyph";

/**
 * A WhatsApp CTA that captures name + phone first, so the lead is legible
 * before the visitor lands in chat — the seam for later logging that lead to
 * a CRM/dashboard once one exists (see lib/inventory.ts's getInventory() for
 * the same "swap point" pattern this app uses for a future backend).
 *
 * Shared by the site nav and the vehicle detail page; only the message and
 * button styling differ per call site.
 */
export function WhatsappCaptureButton({
  buildMessage,
  context,
  buttonClassName,
  buttonLabel = "Consultar por WhatsApp",
}: {
  /** Builds the final WhatsApp message from the captured name + phone. */
  buildMessage: (name: string, phone: string) => string;
  /** Optional trailing context shown in the modal, e.g. "sobre el Volkswagen Golf GTI". */
  context?: string;
  buttonClassName: string;
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const field =
    "mt-2 w-full rounded-2xl bg-surface px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:bg-surface-hi";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClassName}>
        <WhatsappGlyph size={15} />
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[24px] border border-hairline bg-surface p-8 shadow-float"
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
                window.open(
                  waLink(buildMessage(name, phone)),
                  "_blank",
                  "noopener,noreferrer",
                );
                setOpen(false);
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
        </div>
      )}
    </>
  );
}
