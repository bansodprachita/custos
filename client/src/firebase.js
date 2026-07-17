import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Opens the Google account picker and returns a Firebase ID token the
// backend can verify — the app never sees the user's Google credentials.
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user.getIdToken();
}
