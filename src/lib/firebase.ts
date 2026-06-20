import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase configuration sourced from environment variables.
 * All values are prefixed with NEXT_PUBLIC_ so they are available in the browser.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-auth-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-storage-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'demo-sender-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
};

/**
 * Initialize Firebase only once — subsequent imports reuse the existing app.
 * This is essential in Next.js where modules may be re-evaluated.
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/** Firebase Authentication instance */
export const auth = getAuth(app);

/** Cloud Firestore instance */
export const db = getFirestore(app);

/** Firebase Cloud Storage instance */
export const storage = getStorage(app);

/**
 * Enable IndexedDB-backed offline persistence for Firestore.
 *
 * This is critical for the Spark (free) plan:
 * - Cached documents are served from IndexedDB, reducing read counts
 * - The app works offline and syncs when connectivity returns
 *
 * Only runs in the browser (typeof window !== 'undefined').
 * Errors are caught gracefully — common failures include:
 * - failed-precondition: multiple tabs open (only one can enable persistence)
 * - unimplemented: browser doesn't support IndexedDB
 */
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err: { code: string }) => {
    if (err.code === 'failed-precondition') {
      console.warn(
        'Firestore persistence unavailable: multiple tabs are open. ' +
        'Offline caching is only available in one tab at a time.'
      );
    } else if (err.code === 'unimplemented') {
      console.warn(
        'Firestore persistence unavailable: this browser does not support ' +
        'all of the features required for IndexedDB persistence.'
      );
    } else {
      console.warn('Firestore persistence error:', err.code);
    }
  });
}

export default app;
