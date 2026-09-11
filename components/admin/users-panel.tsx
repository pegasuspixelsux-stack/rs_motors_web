"use client";

import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { SALESMEN } from "./add-inventory-modal";
import { DEMO_EMAIL } from "@/lib/admin-auth";

/**
 * "Usuarios" tab — the panel's roles/permissions screen. Same UI-shell-only
 * status as the rest of app/admin/page.tsx: roles here don't gate anything
 * real, they just describe what a real permission system would need to
 * enforce once one exists (see the file-level note on app/admin/page.tsx).
 */

type Role = "Administrador" | "Asesor de ventas" | "Solo lectura";

type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Activo" | "Invitado";
};

const ROLE_INFO: Record<Role, string> = {
  Administrador: "Acceso total: inventario, leads, usuarios y configuración.",
  "Asesor de ventas": "Inventario y los leads que tiene asignados.",
  "Solo lectura": "Puede ver el panel, sin crear ni editar nada.",
};

const ROLES: Role[] = ["Administrador", "Asesor de ventas", "Solo lectura"];

const SEED_MEMBERS: Member[] = [
  {
    id: "cuenta-demo",
    name: "Cuenta demo",
    email: DEMO_EMAIL,
    role: "Administrador",
    status: "Activo",
  },
  ...SALESMEN.map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    email: `${name.toLowerCase().split(" ")[0]}@rsmotors.uy`,
    role: "Asesor de ventas" as Role,
    status: "Activo" as const,
  })),
];

const field =
  "w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[13px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-red focus:bg-white";
const EMPTY_INVITE = { name: "", email: "", role: "Asesor de ventas" as Role };

export function UsersPanel() {
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [armedRemoveId, setArmedRemoveId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [invite, setInvite] = useState(EMPTY_INVITE);
  const [guardMessage, setGuardMessage] = useState<string | null>(null);

  const adminCount = members.filter((m) => m.role === "Administrador").length;

  function changeRole(id: string, role: Role) {
    const target = members.find((m) => m.id === id);
    if (target?.role === "Administrador" && role !== "Administrador" && adminCount <= 1) {
      setGuardMessage("Tiene que quedar al menos un administrador.");
      return;
    }
    setGuardMessage(null);
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  function removeMember(id: string) {
    const target = members.find((m) => m.id === id);
    if (target?.role === "Administrador" && adminCount <= 1) {
      setGuardMessage("Tiene que quedar al menos un administrador.");
      setArmedRemoveId(null);
      return;
    }
    setGuardMessage(null);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setArmedRemoveId(null);
  }

  function createInvite(e: FormEvent) {
    e.preventDefault();
    const name = invite.name.trim();
    const email = invite.email.trim();
    if (!name || !email) return;
    setMembers((prev) => [
      ...prev,
      {
        id: `${name.toLowerCase().replace(/\s+/g, "-")}-${prev.length}`,
        name,
        email,
        role: invite.role,
        status: "Invitado",
      },
    ]);
    setInvite(EMPTY_INVITE);
    setAddOpen(false);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-neutral-900">
            Usuarios
          </h1>
          <p className="mt-1 text-[13px] text-neutral-400">
            Accesos y permisos del equipo — roles de demostración, no
            controlan accesos reales todavía.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-red px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-hi"
        >
          <Plus className="size-4" />
          Invitar usuario
        </button>
      </header>

      {guardMessage && (
        <div className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-[13px] font-medium text-red-hi">
          {guardMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-neutral-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="px-5 py-3 font-semibold">Correo</th>
                <th className="px-5 py-3 font-semibold">Rol</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-5 py-3 font-medium text-neutral-900">
                    {m.name}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">{m.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={m.role}
                      onChange={(e) =>
                        changeRole(m.id, e.target.value as Role)
                      }
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[12px] font-medium text-neutral-700 outline-none transition-colors focus:border-red"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-[11px] font-medium " +
                        (m.status === "Activo"
                          ? "border border-neutral-200 bg-neutral-50 text-neutral-500"
                          : "bg-red/10 text-red")
                      }
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {armedRemoveId === m.id ? (
                      <span className="inline-flex items-center gap-2 text-[12px] font-medium">
                        <button
                          type="button"
                          onClick={() => setArmedRemoveId(null)}
                          className="text-neutral-400 hover:text-neutral-700"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMember(m.id)}
                          className="text-red-hi hover:underline"
                        >
                          Quitar
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setArmedRemoveId(m.id)}
                        className="rounded-full border border-neutral-200 px-3 py-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        Quitar acceso
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
          Qué puede hacer cada rol
        </h3>
        <dl className="mt-4 space-y-3">
          {ROLES.map((r) => (
            <div key={r} className="flex items-start gap-3">
              <dt className="w-36 shrink-0 text-[13px] font-medium text-neutral-900">
                {r}
              </dt>
              <dd className="text-[13px] text-neutral-500">{ROLE_INFO[r]}</dd>
            </div>
          ))}
        </dl>
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
            className="my-8 w-full max-w-md rounded-[28px] border border-neutral-200 bg-white p-8 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-6">
              <div>
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-neutral-900">
                  Invitar usuario
                </h2>
                <p className="mt-1 text-[13px] text-neutral-400">
                  Le llegaría un enlace de acceso una vez que haya login real.
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

            <form onSubmit={createInvite} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-[12px] font-medium text-neutral-500">
                  Nombre
                </span>
                <input
                  required
                  value={invite.name}
                  onChange={(e) =>
                    setInvite({ ...invite, name: e.target.value })
                  }
                  placeholder="Ej. Valentina Acosta"
                  className={field + " mt-1.5"}
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-medium text-neutral-500">
                  Correo electrónico
                </span>
                <input
                  required
                  type="email"
                  value={invite.email}
                  onChange={(e) =>
                    setInvite({ ...invite, email: e.target.value })
                  }
                  placeholder="nombre@rsmotors.uy"
                  className={field + " mt-1.5"}
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-medium text-neutral-500">
                  Rol
                </span>
                <select
                  value={invite.role}
                  onChange={(e) =>
                    setInvite({ ...invite, role: e.target.value as Role })
                  }
                  className={field + " mt-1.5"}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
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
                  Enviar invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
