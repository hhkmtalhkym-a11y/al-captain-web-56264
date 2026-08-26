import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/helpers';

interface AuthContextType {
  firebaseUser: User | null;
  currentUser: UserProfile;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone: string, gov?: string) => Promise<void>;
  signInWithPhonePassword: (phone: string, pass: string) => Promise<boolean>;
  resetUserPassword: (email: string) => Promise<boolean>;
  deleteUserAccount: (reason: string) => Promise<boolean>;
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
    saveToLocalStorage('captain_auth_user', {
      uid: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      role: currentUser.role,
      isAdmin: currentUser.isAdmin
    });
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const isAdmin =
          user.email === 'family2016amer@gmail.com' ||
          currentUser.isAdmin ||
          currentUser.role === 'admin';

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
              role: isAdmin || data.role === 'admin' ? 'admin' : ((data.role as UserRole) || prev.role || 'captain')
            }));
          } else {
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
            role: isAdmin ? 'admin' : prev.role
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
        setAuthError(error.message || 'تعذر إكمال تسجيل الدخول عبر Google');
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      const isAdmin = user.email === 'family2016amer@gmail.com';

      const newProfile: UserProfile = {
        ...currentUser,
        id: user.uid,
        name: user.displayName || currentUser.name,
        email: user.email || email,
        isAdmin: isAdmin || currentUser.isAdmin,
        role: isAdmin ? 'admin' : currentUser.role
      };
      setCurrentUser(newProfile);
    } catch (error: any) {
      console.warn('Email login error:', error);
      setAuthError(error.message || 'فشل تسجيل الدخول بالبريد الإلكتروني');
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone: string, gov = 'دمشق') => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      await updateProfile(user, { displayName: name });

      const newProfile: UserProfile = {
        ...currentUser,
        id: user.uid,
        name,
        email,
        phone,
        governorate: gov as any,
        role: 'player',
        isAdmin: false
      };

      try {
        await setDoc(doc(db, 'users', user.uid), newProfile, { merge: true });
      } catch (e) {
        console.warn('User doc create notice:', e);
      }

      setCurrentUser(newProfile);
    } catch (error: any) {
      console.warn('Email sign up error:', error);
      setAuthError(error.message || 'فشل إنشاء الحساب');
      throw error;
    }
  };

  const signInWithPhonePassword = async (phone: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    
    // Check if matching Admin
    if (
      (cleanPhone === '0945688090' || cleanPhone === '+963945688090' || cleanPhone === '963945688090') &&
      pass === 'A123@123A'
    ) {
      const adminProfile: UserProfile = {
        ...currentUser,
        id: 'admin-master',
        name: 'المدير العام (الكابتن)',
        phone: '0945688090',
        email: 'family2016amer@gmail.com',
        role: 'admin',
        isAdmin: true
      };
      setCurrentUser(adminProfile);
      return true;
    }

    // Standard phone login fallback
    if (pass.length >= 6) {
      const playerProfile: UserProfile = {
        ...currentUser,
        phone: cleanPhone,
        name: currentUser.name || `كابتن ${cleanPhone.slice(-4)}`,
        role: currentUser.isAdmin ? 'admin' : (currentUser.role || 'player')
      };
      setCurrentUser(playerProfile);
      return true;
    }

    setAuthError('كلمة المرور يجب ألا تقل عن 6 خانات أو بيانات الدخول غير صحيحة');
    return false;
  };

  const resetUserPassword = async (email: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (error: any) {
      console.warn('Password reset notice:', error);
      setAuthError(error.message || 'تعذر إرسال رابط استعادة كلمة المرور');
      return false;
    }
  };

  const deleteUserAccount = async (reason: string): Promise<boolean> => {
    setAuthError(null);
    try {
      if (currentUser.id && currentUser.id !== 'usr-default') {
        try {
          await deleteDoc(doc(db, 'users', currentUser.id));
        } catch (e) {
          console.warn('Delete doc error:', e);
        }
      }
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      setCurrentUser(DEFAULT_USER);
      setFirebaseUser(null);
      localStorage.removeItem('captain_auth_user');
      localStorage.removeItem('kaptan_current_user');
      return true;
    } catch (error: any) {
      console.warn('Delete user account error:', error);
      setAuthError(error.message || 'تعذر حذف الحساب. يرجى تسجيل الدخول مجدداً ثم المحاولة.');
      return false;
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setCurrentUser(DEFAULT_USER);
      localStorage.removeItem('captain_auth_user');
      localStorage.removeItem('kaptan_current_user');
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
        signInWithEmail,
        signUpWithEmail,
        signInWithPhonePassword,
        resetUserPassword,
        deleteUserAccount,
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
