"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  phone?: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (password: string, userData: Omit<User, 'id' | 'avatar'>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Listen for Auth state changes
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extra profile data from Firestore
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          
          // Ensure professional name for the doctor role
          if (userData.role === 'doctor') {
            userData.name = 'Dr. Reetika Pal';
          }
          
          setUser({
            ...userData,
            id: firebaseUser.uid,
          });
        } else {
          // Fallback if firestore doc doesn't exist yet
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            role: 'patient', // Default role
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 1. Hardcoded Doctor Login Check
      if (email === 'reitika6@gmail.com' && password === '12345678') {
        const doctorUser: User = {
          id: 'doctor-reitika',
          name: 'Dr. Reetika Pal',
          email: 'reitika6@gmail.com',
          role: 'doctor',
          avatar: 'https://ui-avatars.com/api/?name=Dr+Reetika+Pal&background=0d9488&color=fff'
        };
        setUser(doctorUser);
        router.push('/doctor/dashboard');
        return;
      }

      // 2. Standard Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch role for redirect
      const docRef = doc(db, "users", userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data() as User;
        if (userData.role === 'doctor') {
          router.push('/doctor/dashboard');
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error("Login Error:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const signup = async (password: string, userData: Omit<User, 'id' | 'avatar'>) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        ...userData,
        id: firebaseUser.uid,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
      };

      // Save to Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      
      setUser(newUser);
      router.push('/');
    } catch (error: any) {
      console.error("Signup Error:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push('/');
    } catch (error: any) {
      console.error("Logout Error:", error.message);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      try {
        await setDoc(doc(db, "users", user.id), updatedUser, { merge: true });
        setUser(updatedUser);
      } catch (error: any) {
        console.error("Update User Error:", error.message);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateUser
    }}>
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
