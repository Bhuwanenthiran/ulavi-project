import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app = null;
let db = null;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    console.log('[Firebase] Firebase initialized');
    db = getFirestore(app);
    console.log('[Firebase] Firestore connected');
  } catch (error) {
    console.error('[Firebase] Initialization error:', error.stack || error);
  }
} else {
  console.warn('[Firebase] Configuration is missing or incomplete. Running in local-only mode. Missing keys:', {
    VITE_FIREBASE_API_KEY: !firebaseConfig.apiKey ? 'MISSING' : 'OK',
    VITE_FIREBASE_PROJECT_ID: !firebaseConfig.projectId ? 'MISSING' : 'OK',
    VITE_FIREBASE_APP_ID: !firebaseConfig.appId ? 'MISSING' : 'OK'
  });
}

export { app, db };
export const isFirebaseAvailable = () => !!db;
