/**
 * The admin login (app/admin/page.tsx) authenticates against a real
 * Firebase Auth account now — this is just the email shown as a
 * placeholder/hint and used to seed the Usuarios tab's "Administrador" row
 * with the same address as the one that actually logs in, without
 * app/admin/page.tsx and lib/users-store.ts importing each other. The
 * password lives only in Firebase Auth — nothing here knows it.
 */
export const DEMO_EMAIL = "admin@rsmotors.uy";
