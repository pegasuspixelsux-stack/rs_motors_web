/**
 * Bridges the public site's WhatsApp/contact captures to the admin panel's
 * Contactos tab. There's no backend yet (see app/admin/page.tsx's file
 * note), so this persists to the visitor's own browser via localStorage —
 * real, but scoped to one device/browser, not a shared database. Swap this
 * for an actual API call the same way lib/inventory.ts's getInventory() is
 * meant to be swapped for a live query.
 */

const STORAGE_KEY = "rsmotors_captured_leads";

export type CapturedLead = {
  id: string;
  name: string;
  phone: string;
  /** What they were asking about — a vehicle, financing, a trade-in, etc. */
  context: string;
  /** The message that would be / was sent to WhatsApp. */
  message: string;
  /** Where on the site this came from, e.g. "Ficha de vehículo". */
  source: string;
  createdAt: string;
};

export function saveLead(lead: Omit<CapturedLead, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedLeads();
    const entry: CapturedLead = {
      ...lead,
      id: `captured-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([entry, ...existing]),
    );
  } catch {
    // Private browsing / storage disabled — capture is best-effort, not critical.
  }
}

export function getSavedLeads(): CapturedLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
