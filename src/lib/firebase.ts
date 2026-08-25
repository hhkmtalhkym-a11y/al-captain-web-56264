import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Suppress benign connection logs in sandboxed/offline environments
try {
  setLogLevel('silent');
} catch {
  // Ignore if setLogLevel is not available
}

const env = (import.meta as any).env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyABAelUj5ln0bAPAnHlvbnsQG42zkJqwk0",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "al-captain-web-56264.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "al-captain-web-56264",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "al-captain-web-56264.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "584756964376",
  appId: env.VITE_FIREBASE_APP_ID || "1:584756964376:web:4d85337fe4d2bcc444a76d",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-XKLD6WYQP5"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase Authentication
export const auth = getAuth(app);

// Export Cloud Firestore with offline fallback support
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true
  });
} catch {
  try {
    firestoreInstance = getFirestore(app);
  } catch {
    firestoreInstance = {} as any;
  }
}
export const db = firestoreInstance;

// Export Firebase Storage
export const storage = getStorage(app);

// Export Google Auth Provider with custom parameters
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Safe Analytics initialization
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Non-blocking fallback
  });
}

export default { app, auth, db, storage, googleProvider, analytics };

