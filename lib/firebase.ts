import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

/**
 * Firebase client SDK — real backend for the admin panel (Inventario,
 * Contactos, Usuarios) and for lib/leads-store.ts's public-site capture.
 *
 * The admin login uses real Firebase Auth (email/password) — but Firestore
 * and Storage security rules are currently wide open (`allow read, write:
 * if true`), not scoped to signed-in users. Anyone with `projectId` (public,
 * ships in the JS bundle) can read and write every document directly via
 * the SDK, login or not, until the rules are tightened to check
 * `request.auth`. Don't treat this as production-secure yet — see the
 * file-level note on app/admin/page.tsx.
 */

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);
