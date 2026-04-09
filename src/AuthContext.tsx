import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, serverTimestamp } from './firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'craftsman' | 'buyer';
  bio?: string;
  createdAt: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        } else {
          // Default to buyer if not exists, user will choose later
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: 'buyer',
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const { signInWithPopup, googleProvider } = await import('./firebase');
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    const { signOut: firebaseSignOut } = await import('./firebase');
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
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
