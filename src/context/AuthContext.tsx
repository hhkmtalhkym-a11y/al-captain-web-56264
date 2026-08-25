import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/helpers';

interface AuthContextType {
  firebaseUser: User | null;
  currentUser: UserProfile;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateCurrentUser: (updated: UserProfile) => Promise<void>;
  clearAuthError: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-default',
  name: 'كابتن المنصة',
  phone: '0945688090',
  email: 'hhkmtalhkym@gmail.com',
  governorate: 'دمشق',
  role: 'captain',
  isAdmin: false,
  position: 'مهاجم صريح (ST)',
  favoritePlaygrounds: ['pg-1', 'pg-2']
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadFromLocalStorage('kaptan_current_user', DEFAULT_USER)
  );

  useEffect(() => {
    saveToLocalStorage('kaptan_current_user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const isAdmin =
          user.email === 'family2016amer@gmail.com' ||
          currentUser.isAdmin ||
          currentUser.role === 'admin';

        // Check if user profile exists in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<UserProfile>;
            setCurrentUser((prev) => ({
              ...prev,
              ...data,
              id: user.uid,
              email: user.email || data.email || prev.email,
              name: data.name || user.displayName || prev.name || 'كابتن المنصة',
              image: data.image || user.photoURL || prev.image,
              avatar: data.avatar || user.photoURL || prev.avatar,
              isAdmin: isAdmin || !!data.isAdmin,
              role: isAdmin || data.role === 'admin' ? 'admin' : (data.role || prev.role || 'captain')
            }));
          } else {
            // Create user document in Firestore
            const initialProfile: UserProfile = {
              ...currentUser,
              id: user.uid,
              name: user.displayName || currentUser.name || 'كابتن المنصة',
              email: user.email || currentUser.email,
              image: user.photoURL || currentUser.image,
              avatar: user.photoURL || currentUser.avatar,
              isAdmin,
              role: isAdmin ? 'admin' : (currentUser.role || 'captain')
            };

            await setDoc(userDocRef, initialProfile, { merge: true });
            setCurrentUser(initialProfile);
          }
        } catch (err) {
          console.warn('Firestore user fetch notice (using local profile):', err);
          setCurrentUser((prev) => ({
            ...prev,
            id: user.uid,
            name: user.displayName || prev.name || 'كابتن المنصة',
            email: user.email || prev.email,
            image: user.photoURL || prev.image,
            avatar: user.photoURL || prev.avatar,
            isAdmin,
            role: isAdmin ? 'admin' : (prev.role || 'captain')
          }));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const isAdmin = user.email === 'family2016amer@gmail.com';

      const newProfile: UserProfile = {
        ...currentUser,
        id: user.uid,
        name: user.displayName || currentUser.name || 'كابتن المنصة',
        email: user.email || currentUser.email,
        image: user.photoURL || currentUser.image,
        avatar: user.photoURL || currentUser.avatar,
        isAdmin: isAdmin || currentUser.isAdmin,
        role: isAdmin ? 'admin' : currentUser.role
      };

      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, newProfile, { merge: true });
      } catch (e) {
        console.warn('Firestore user save notice:', e);
      }

      setCurrentUser(newProfile);
    } catch (error: any) {
      console.warn('Firebase Google Auth popup notice:', error);
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/unauthorized-domain' || error?.message) {
        setAuthError(error.message || 'تعذر إكمال تسجيل الدخول عبر النافذة المنبثقة');
      }
      throw error;
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setCurrentUser((prev) => ({
        ...prev,
        isAdmin: false,
        role: 'captain',
        email: undefined
      }));
    } catch (error: any) {
      console.error('Error signing out:', error);
      setAuthError(error.message || 'تعذر تسجيل الخروج');
    }
  };

  const updateCurrentUser = async (updated: UserProfile) => {
    setCurrentUser(updated);
    if (updated.id) {
      try {
        const userDocRef = doc(db, 'users', updated.id);
        await setDoc(userDocRef, updated, { merge: true });
      } catch (err) {
        console.warn('Firestore user update notice:', err);
      }
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        loading,
        authError,
        signInWithGoogle,
        signOutUser,
        updateCurrentUser,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
