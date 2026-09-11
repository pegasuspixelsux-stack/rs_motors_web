"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Wordmark } from "./wordmark";
import { WhatsappCaptureButton } from "./whatsapp-capture-button";
import { SocialLinks } from "./social-links";
import { NAV_LINKS } from "@/lib/site";

/** Sticky site header — shared by the homepage and every route (e.g. vehicle detail pages). */
export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-ground/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 sm:px-8">
        <Link href="/#top" aria-label="RS Motors — inicio">
          <Wordmark height={19} priority />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[14px] font-medium text-ink-dim transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <SocialLinks
            className="hidden size-9 items-center justify-center rounded-full bg-surface text-ink-dim transition-colors hover:bg-surface-hi hover:text-ink sm:grid"
            iconSize={16}
          />
          <WhatsappCaptureButton
            buildMessage={(name, phone) =>
              `Hola RS Motors, mi nombre es ${name} (Tel: ${phone}) y quería hacer una consulta.`
            }
            source="Nav"
            buttonLabel="WhatsApp"
            buttonClassName="inline-flex items-center gap-2 rounded-full bg-red px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-hi"
          />
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
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium text-ink-dim transition-colors hover:bg-surface hover:text-ink"
            >
              {l.label}
              <ArrowRight className="size-4 text-ink-faint" />
            </Link>
          ))}
          <div className="mt-1 flex items-center gap-2 border-t border-hairline px-4 pt-3">
            <SocialLinks
              className="grid size-10 place-items-center rounded-full bg-surface text-ink-dim transition-colors hover:bg-surface-hi hover:text-ink"
              iconSize={17}
            />
          </div>
        </nav>
      )}
    </header>
  );
}
