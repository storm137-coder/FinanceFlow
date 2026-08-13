import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    
    // Only initialize if we have a real private key, not the placeholder
    if (serviceAccount.privateKey && !serviceAccount.privateKey.includes('Your\nActual\nKey\nHere')) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId,
      });
    } else {
      console.warn('Firebase Admin SDK: Using default credentials because private key is missing or is a placeholder.');
      // We skip initializeApp() here to prevent crashes.
      // Without it, adminAuth will fail to initialize below, so we mock it if empty.
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminAuth = getApps().length > 0 ? getAuth() : {
  verifyIdToken: async () => { throw new Error('Firebase Admin not configured'); },
  createSessionCookie: async () => { throw new Error('Firebase Admin not configured'); },
  verifySessionCookie: async () => { throw new Error('Firebase Admin not configured'); },
  revokeRefreshTokens: async () => { throw new Error('Firebase Admin not configured'); }
} as unknown as ReturnType<typeof getAuth>;

export const adminDb = getApps().length > 0 ? getFirestore() : null as any;

