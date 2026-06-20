'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currency: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    currency: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateUserSettings: (settings: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        
        // Sync with server session cookie
        const idToken = await fbUser.getIdToken();
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        try {
          const profileDoc = await getDoc(doc(db, 'users', fbUser.uid));
          const profileData = profileDoc.data();
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            currency: profileData?.currency || 'USD',
            theme: profileData?.theme || 'system',
            language: profileData?.language || 'en',
            emailVerified: fbUser.emailVerified,
          });
        } catch {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            currency: 'USD',
            theme: 'system',
            language: 'en',
            emailVerified: fbUser.emailVerified,
          });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        
        // Clear server session cookie
        await fetch('/api/auth/session', {
          method: 'DELETE',
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    
    // Explicitly set cookie before navigating
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    
    router.push('/dashboard');
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    currency: string
  ) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    await sendEmailVerification(credential.user);
    
    await setDoc(doc(db, 'users', credential.user.uid), {
      displayName,
      email,
      currency,
      createdAt: new Date().toISOString(),
    });
    
    const idToken = await credential.user.getIdToken();
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    router.push('/dashboard');
  };

  const logout = async () => {
    await signOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerification = async () => {
    if (firebaseUser) {
      await sendEmailVerification(firebaseUser);
    }
  };

  const updateUserSettings = async (settings: Partial<UserProfile>) => {
    if (!firebaseUser) throw new Error("No authenticated user");
    
    // Update auth profile if displayName changed
    if (settings.displayName !== undefined) {
      await updateProfile(firebaseUser, { displayName: settings.displayName });
    }
    
    // Update firestore document
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, settings, { merge: true });
    
    // Update local state
    if (user) {
      setUser({ ...user, ...settings });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, loading, login, register, logout, forgotPassword, resendVerification, updateUserSettings }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
