'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
  isFamilyMember: boolean;
  canEdit: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchOrCreateProfile(firebaseUser: User): Promise<UserProfile> {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const profile = { id: snap.id, ...snap.data() } as UserProfile;
      // Update lastLoginAt
      await setDoc(ref, { lastLoginAt: new Date().toISOString() }, { merge: true });
      return { ...profile, lastLoginAt: new Date().toISOString() };
    }

    // New user - create profile
    const newProfile: Omit<UserProfile, 'id'> = {
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Family Member',
      email: firebaseUser.email || '',
      profilePhoto: firebaseUser.photoURL || '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      role: 'VIEWER', // Default role — admin must promote
    };

    await setDoc(ref, newProfile);
    return { id: firebaseUser.uid, ...newProfile };
  }

  async function refreshProfile() {
    if (user) {
      const profile = await fetchOrCreateProfile(user);
      setUserProfile(profile);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await fetchOrCreateProfile(firebaseUser);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string, displayName: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    // Profile will be created in onAuthStateChanged
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function logout() {
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  const isAdmin = userProfile?.role === 'ADMIN';
  const isFamilyMember = userProfile?.role === 'FAMILY_MEMBER' || isAdmin;
  const canEdit = isFamilyMember;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        resetPassword,
        isAdmin,
        isFamilyMember,
        canEdit,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
