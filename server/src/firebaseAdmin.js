import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// FIREBASE_SERVICE_ACCOUNT holds the full service-account JSON as a string
// (from Firebase Console > Project settings > Service accounts > Generate
// new private key). Real secret — only ever set as a platform env var.
//
// Initialized lazily, on first use, so a missing/unset env var only breaks
// the Google sign-in route rather than crashing the whole server on boot.
export function getFirebaseAuth() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getAuth();
}
