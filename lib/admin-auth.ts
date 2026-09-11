/**
 * Mock-only demo credentials for the admin shell (app/admin/page.tsx). Not
 * real authentication — anyone can read these in the page source. Kept here
 * (rather than declared inline) so the Usuarios tab's demo "Administrador"
 * row can reference the same address as the one that actually logs in,
 * without app/admin/page.tsx and components/admin/* importing each other.
 */
export const DEMO_EMAIL = "admin@rsmotors.uy";
export const DEMO_PASSWORD = "rsmotors2026";
