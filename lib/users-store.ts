import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { SALESMEN } from "./salesmen";
import { DEMO_EMAIL } from "./admin-auth";

/**
 * Real Firestore-backed team/roles store for the Usuarios tab ("members"
 * collection). Roles here describe what a real permission system would
 * need to enforce — they don't gate anything yet, since Firestore/Storage
 * rules are wide open (see lib/firebase.ts).
 */

export type Role = "Administrador" | "Asesor de ventas" | "Solo lectura";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Activo" | "Invitado";
};

export const ROLES: Role[] = ["Administrador", "Asesor de ventas", "Solo lectura"];

export const ROLE_INFO: Record<Role, string> = {
  Administrador: "Acceso total: inventario, leads, usuarios y configuración.",
  "Asesor de ventas": "Inventario y los leads que tiene asignados.",
  "Solo lectura": "Puede ver el panel, sin crear ni editar nada.",
};

const COLLECTION = "members";

function toMember(id: string, data: Record<string, unknown>): Member {
  return {
    id,
    name: (data.name as string) ?? "",
    email: (data.email as string) ?? "",
    role: (data.role as Role) ?? "Asesor de ventas",
    status: (data.status as Member["status"]) ?? "Activo",
  };
}

/** Seeds the demo admin account + the sales roster the first time it's empty. */
export async function getMembers(): Promise<Member[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  if (snap.empty) {
    await setDoc(doc(db, COLLECTION, "cuenta-demo"), {
      name: "Cuenta demo",
      email: DEMO_EMAIL,
      role: "Administrador",
      status: "Activo",
    });
    await Promise.all(
      SALESMEN.map((name) =>
        setDoc(doc(db, COLLECTION, name.toLowerCase().replace(/\s+/g, "-")), {
          name,
          email: `${name.toLowerCase().split(" ")[0]}@rsmotors.uy`,
          role: "Asesor de ventas",
          status: "Activo",
        }),
      ),
    );
    const reseeded = await getDocs(collection(db, COLLECTION));
    return reseeded.docs.map((d) => toMember(d.id, d.data()));
  }
  return snap.docs.map((d) => toMember(d.id, d.data()));
}

export async function changeMemberRole(id: string, role: Role): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { role });
}

export async function inviteMember(input: {
  name: string;
  email: string;
  role: Role;
}): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    name: input.name,
    email: input.email,
    role: input.role,
    status: "Invitado",
  });
}

export async function removeMember(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
