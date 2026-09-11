import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Real Firestore-backed leads store ("leads" collection) — the single
 * source for both the public site's WhatsApp/contact captures (saveLead)
 * and the admin Contactos kanban (everything else here). See lib/firebase.ts
 * for the no-real-auth/open-rules caveat this all currently runs under.
 */

export type Stage = "nuevo" | "contactado" | "seguimiento" | "cerrado";

export type Comment = { id: string; date: string; text: string };

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

export const SOURCE_OPTIONS = [
  "WhatsApp",
  "Instagram",
  "Sitio web",
  "Manual / directo",
  "Red de contactos",
  "Referido",
];

const COLLECTION = "leads";

function toLead(id: string, data: Record<string, unknown>): Lead {
  return {
    id,
    name: typeof data.name === "string" ? data.name : "Sin nombre",
    interest: typeof data.interest === "string" ? data.interest : "Consulta general",
    phone: typeof data.phone === "string" ? data.phone : "No registrado",
    email: typeof data.email === "string" ? data.email : "No registrado",
    stage: (data.stage as Stage) ?? "nuevo",
    source: typeof data.source === "string" ? data.source : "Sitio web",
    nextStep: typeof data.nextStep === "string" ? data.nextStep : "Responder consulta",
    due: typeof data.due === "string" ? data.due : "Hoy",
    urgencyScore: typeof data.urgencyScore === "number" ? data.urgencyScore : 5,
    comments: Array.isArray(data.comments) ? (data.comments as Comment[]) : [],
  };
}

/**
 * Called from every public WhatsApp/contact touchpoint. Fire-and-forget by
 * design (callers don't await it — the WhatsApp redirect shouldn't wait on
 * a network write); failures are logged, not surfaced to the visitor.
 */
export function saveLead(input: {
  name: string;
  phone: string;
  context: string;
  message: string;
  source: string;
}): void {
  const comment: Comment = {
    id: `c-${Date.now()}`,
    date: "Recién",
    text: input.message,
  };
  addDoc(collection(db, COLLECTION), {
    name: input.name,
    interest: input.context,
    phone: input.phone || "No registrado",
    email: "No registrado",
    stage: "nuevo",
    source: input.source,
    nextStep: "Responder consulta",
    due: "Hoy",
    urgencyScore: 7,
    comments: [comment],
    createdAt: serverTimestamp(),
  }).catch((err) => {
    console.error("No se pudo guardar el lead en Firestore:", err);
  });
}

export async function getLeads(): Promise<Lead[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => toLead(d.id, d.data()));
}

/** Admin's "Agregar lead externo" — a prospect that came in off-site. */
export async function createLead(input: {
  name: string;
  interest: string;
  phone: string;
  email: string;
  source: string;
  urgencyScore: number;
  note: string;
}): Promise<void> {
  const comments: Comment[] = input.note.trim()
    ? [{ id: `c-${Date.now()}`, date: "Recién", text: input.note.trim() }]
    : [];
  await addDoc(collection(db, COLLECTION), {
    name: input.name,
    interest: input.interest || "Vehículo a definir",
    phone: input.phone || "No registrado",
    email: input.email || "No registrado",
    stage: "nuevo",
    source: input.source,
    nextStep: "Primer contacto pendiente",
    due: "Hoy",
    urgencyScore: input.urgencyScore,
    comments,
    createdAt: serverTimestamp(),
  });
}

export async function moveLeadStage(id: string, stage: Stage): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { stage });
}

export async function addLeadComment(id: string, text: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  const existing =
    snap.exists() && Array.isArray(snap.data().comments) ? snap.data().comments : [];
  const comment: Comment = { id: `c-${Date.now()}`, date: "Recién", text };
  await updateDoc(ref, { comments: [comment, ...existing] });
}

export async function deleteLead(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
