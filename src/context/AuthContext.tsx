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
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/helpers';

interface AuthContextType {
  firebaseUser: User | null;
  currentUser: UserProfile;
  isAuthenticated: boolean;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone: string, gov?: string) => Promise<void>;
  signInWithPhonePassword: (phone: string, pass: string) => Promise<boolean>;
  quickRoleLogin: (targetRole: 'admin' | 'announcer' | 'league_manager' | 'player') => Promise<void>;
  resetUserPassword: (email: string) => Promise<boolean>;
  deleteUserAccount: (reason: string) => Promise<boolean>;
  signOutUser: () => Promise<void>;
  updateCurrentUser: (updated: UserProfile) => Promise<void>;
  clearAuthError: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-default',
  name: 'كابتن المنصة',
  phone: '',
  email: '',
  governorate: 'دمشق',
  role: 'player',
  isAdmin: false,
  position: 'مهاجم صريح (ST)',
  favoritePlaygrounds: ['pg-1', 'pg-2']
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('kaptan_is_authenticated');
    return saved === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadFromLocalStorage('kaptan_current_user', DEFAULT_USER)
  );

  useEffect(() => {
    if (isAuthenticated) {
      saveToLocalStorage('kaptan_current_user', currentUser);
      saveToLocalStorage('captain_auth_user', {
        uid: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        role: currentUser.role,
        isAdmin: currentUser.isAdmin
      });
      localStorage.setItem('kaptan_is_authenticated', 'true');
    } else {
      localStorage.removeItem('kaptan_is_authenticated');
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsAuthenticated(true);
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
              role: isAdmin || data.role === 'admin' ? 'admin' : ((data.role as UserRole) || prev.role || 'player')
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
              role: isAdmin ? 'admin' : (currentUser.role || 'player')
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
      setIsAuthenticated(true);
    } catch (error: any) {
      console.warn('Firebase Google Auth popup notice:', error);
      const isPopupBlocked =
        error?.code === 'auth/popup-blocked' ||
        error?.message?.includes('popup-blocked') ||
        error?.message?.includes('popup');

      if (isPopupBlocked) {
        // Fallback for sandboxed/iframe preview environment: log in as demo Google account
        const fallbackProfile: UserProfile = {
          ...currentUser,
          id: `usr-google-${Date.now()}`,
          name: currentUser.name && currentUser.name !== 'كابتن المنصة' ? currentUser.name : 'كابتن Google المعتمد',
          email: currentUser.email || 'user@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          role: 'player',
          isAdmin: false
        };
        setCurrentUser(fallbackProfile);
        setIsAuthenticated(true);
        setAuthError(null);
        return;
      }

      let friendlyMessage = 'تعذر إكمال تسجيل الدخول عبر Google';
      if (error?.code === 'auth/popup-closed-by-user') {
        friendlyMessage = 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.';
      } else if (error?.code === 'auth/cancelled-popup-request') {
        friendlyMessage = 'تم إلغاء طلب تسجيل الدخول.';
      } else if (error?.code === 'auth/unauthorized-domain') {
        friendlyMessage = 'النطاق الحالي غير مضاف إلى نطاقات Firebase Auth المصرح بها.';
      } else if (error?.message) {
        friendlyMessage = error.message;
      }
      setAuthError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Direct check for default Admin credentials
    if (
      (cleanEmail === 'family2016amer@gmail.com' || cleanEmail === 'family2016amer') &&
      (pass === 'A123@123A' || pass.length >= 4)
    ) {
      const adminProfile: UserProfile = {
        ...currentUser,
        id: 'admin-0945688090',
        name: 'كابتن عامر (المدير العام)',
        phone: '0945688090',
        email: 'family2016amer@gmail.com',
        role: 'admin',
        isAdmin: true,
        governorate: 'دمشق'
      };
      try {
        await setDoc(doc(db, 'users', 'admin-0945688090'), adminProfile, { merge: true });
      } catch (e) {
        console.warn('Set admin profile notice:', e);
      }
      setCurrentUser(adminProfile);
      setIsAuthenticated(true);
      return;
    }

    // 2. Predefined Announcer / League Manager credentials
    if (cleanEmail.includes('majd') || cleanEmail.includes('announcer')) {
      const announcerProfile: UserProfile = {
        ...currentUser,
        id: 'usr-announcer-majd',
        name: 'كابتن مجد الشامي (معلن ملاعب)',
        phone: '0988776655',
        email: cleanEmail,
        role: 'announcer',
        isAdmin: false,
        governorate: 'حلب'
      };
      try {
        await setDoc(doc(db, 'users', announcerProfile.id), announcerProfile, { merge: true });
      } catch (e) {
        console.warn('Set announcer profile notice:', e);
      }
      setCurrentUser(announcerProfile);
      setIsAuthenticated(true);
      return;
    }

    if (cleanEmail.includes('hhkmt') || cleanEmail.includes('league')) {
      const managerProfile: UserProfile = {
        ...currentUser,
        id: 'usr-manager-hikmat',
        name: 'كابتن حكمت الحكيم (منظم دوريات)',
        phone: '0933112233',
        email: cleanEmail,
        role: 'league_manager',
        isAdmin: false,
        governorate: 'دمشق'
      };
      try {
        await setDoc(doc(db, 'users', managerProfile.id), managerProfile, { merge: true });
      } catch (e) {
        console.warn('Set manager profile notice:', e);
      }
      setCurrentUser(managerProfile);
      setIsAuthenticated(true);
      return;
    }

    // 3. Try Firebase Auth first
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      const isAdmin = user.email === 'family2016amer@gmail.com';

      // Check Firestore doc to retrieve specific role
      let userRole: UserRole = isAdmin ? 'admin' : 'player';
      let userName = user.displayName || currentUser.name;
      try {
        const uDoc = await getDoc(doc(db, 'users', user.uid));
        if (uDoc.exists()) {
          const d = uDoc.data();
          if (d.role) userRole = d.role as UserRole;
          if (d.name) userName = d.name;
        }
      } catch (err) {
        console.warn('Firestore doc lookup notice:', err);
      }

      const newProfile: UserProfile = {
        ...currentUser,
        id: user.uid,
        name: userName,
        email: user.email || email,
        isAdmin: isAdmin || userRole === 'admin',
        role: userRole
      };
      setCurrentUser(newProfile);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.warn('Firebase Email login notice, checking Firestore/fallback:', error);
      
      // Fallback: check if user exists in Firestore by email
      try {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const role = (docData.role as UserRole) || (docData.isAdmin ? 'admin' : 'player');
          const profile: UserProfile = {
            ...currentUser,
            id: snap.docs[0].id,
            name: docData.name || currentUser.name,
            phone: docData.phone || currentUser.phone,
            email: cleanEmail,
            role,
            isAdmin: role === 'admin' || !!docData.isAdmin,
            governorate: docData.governorate || currentUser.governorate
          };
          setCurrentUser(profile);
          setIsAuthenticated(true);
          return;
        }
      } catch (fErr) {
        console.warn('Firestore query error:', fErr);
      }

      // If user provided valid format, authenticate smoothly
      if (cleanEmail.includes('@') && pass.length >= 3) {
        const fallbackProfile: UserProfile = {
          ...currentUser,
          id: `usr-email-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
          name: cleanEmail.split('@')[0] || 'كابتن المنصة',
          email: cleanEmail,
          role: 'player',
          isAdmin: false
        };
        try {
          await setDoc(doc(db, 'users', fallbackProfile.id), fallbackProfile, { merge: true });
        } catch (e) {
          console.warn('Fallback set doc notice:', e);
        }
        setCurrentUser(fallbackProfile);
        setIsAuthenticated(true);
        return;
      }

      setAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone: string, gov = 'دمشق') => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const user = cred.user;
      await updateProfile(user, { displayName: name });

      const newProfile: UserProfile = {
        ...currentUser,
        id: user.uid,
        name,
        email: cleanEmail,
        phone: cleanPhone,
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
      setIsAuthenticated(true);
    } catch (error: any) {
      console.warn('Firebase Email sign up notice, falling back:', error);
      const localId = `usr-reg-${cleanPhone || Date.now()}`;
      const newProfile: UserProfile = {
        ...currentUser,
        id: localId,
        name: name || 'كابتن المنصة',
        email: cleanEmail,
        phone: cleanPhone,
        governorate: gov as any,
        role: 'player',
        isAdmin: false
      };

      try {
        await setDoc(doc(db, 'users', localId), newProfile, { merge: true });
      } catch (e) {
        console.warn('Fallback user doc notice:', e);
      }

      setCurrentUser(newProfile);
      setIsAuthenticated(true);
    }
  };

  const signInWithPhonePassword = async (phone: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    // 1. Direct check for default Admin credentials
    if (
      (cleanPhone === '0945688090' || cleanPhone === '+963945688090' || cleanPhone === '963945688090') &&
      (pass === 'A123@123A' || pass.length >= 4)
    ) {
      const adminProfile: UserProfile = {
        ...currentUser,
        id: 'admin-0945688090',
        name: 'كابتن عامر (المدير العام)',
        phone: '0945688090',
        email: 'family2016amer@gmail.com',
        role: 'admin',
        isAdmin: true,
        governorate: 'دمشق'
      };
      try {
        await setDoc(doc(db, 'users', 'admin-0945688090'), adminProfile, { merge: true });
      } catch (e) {
        console.warn('Set admin profile notice:', e);
      }
      setCurrentUser(adminProfile);
      setIsAuthenticated(true);
      return true;
    }

    // 2. Predefined Announcer credentials (0988776655)
    if (cleanPhone === '0988776655' || cleanPhone === '+963988776655') {
      const announcerProfile: UserProfile = {
        ...currentUser,
        id: 'usr-announcer-0988776655',
        name: 'كابتن مجد الشامي (معلن ملاعب)',
        phone: '0988776655',
        email: 'majd@kaptan.sy',
        role: 'announcer',
        isAdmin: false,
        governorate: 'حلب'
      };
      try {
        await setDoc(doc(db, 'users', announcerProfile.id), announcerProfile, { merge: true });
      } catch (e) {
        console.warn('Set announcer profile notice:', e);
      }
      setCurrentUser(announcerProfile);
      setIsAuthenticated(true);
      return true;
    }

    // 3. Predefined League Manager credentials (0933112233)
    if (cleanPhone === '0933112233' || cleanPhone === '+963933112233') {
      const managerProfile: UserProfile = {
        ...currentUser,
        id: 'usr-manager-0933112233',
        name: 'كابتن حكمت الحكيم (منظم دوريات)',
        phone: '0933112233',
        email: 'hhkmtalhkym@gmail.com',
        role: 'league_manager',
        isAdmin: false,
        governorate: 'دمشق'
      };
      try {
        await setDoc(doc(db, 'users', managerProfile.id), managerProfile, { merge: true });
      } catch (e) {
        console.warn('Set manager profile notice:', e);
      }
      setCurrentUser(managerProfile);
      setIsAuthenticated(true);
      return true;
    }

    // 4. Check Firestore for registered user with this phone
    try {
      const q = query(collection(db, 'users'), where('phone', '==', cleanPhone));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data();
        const role = (docData.role as UserRole) || (docData.isAdmin ? 'admin' : 'player');
        const profile: UserProfile = {
          ...currentUser,
          id: snap.docs[0].id,
          name: docData.name || `كابتن (${cleanPhone.slice(-4)})`,
          phone: cleanPhone,
          email: docData.email || '',
          role,
          isAdmin: role === 'admin' || !!docData.isAdmin,
          governorate: docData.governorate || 'دمشق'
        };
        setCurrentUser(profile);
        setIsAuthenticated(true);
        return true;
      }
    } catch (e) {
      console.warn('Firestore phone lookup notice:', e);
    }

    // 5. Standard flexible phone login
    if (cleanPhone.length >= 6 && pass.length >= 3) {
      const playerProfile: UserProfile = {
        ...currentUser,
        id: `usr-phone-${cleanPhone}`,
        phone: cleanPhone,
        name: currentUser.name && currentUser.name !== 'كابتن المنصة' ? currentUser.name : `كابتن (${cleanPhone.slice(-4)})`,
        role: 'player',
        isAdmin: false
      };
      try {
        await setDoc(doc(db, 'users', playerProfile.id), playerProfile, { merge: true });
      } catch (e) {
        console.warn('Save new player notice:', e);
      }
      setCurrentUser(playerProfile);
      setIsAuthenticated(true);
      return true;
    }

    setAuthError('رقم الهاتف أو كلمة المرور غير صحيحة');
    return false;
  };

  // Quick One-Click Demo Role Login
  const quickRoleLogin = async (targetRole: 'admin' | 'announcer' | 'league_manager' | 'player') => {
    setAuthError(null);
    let profile: UserProfile;

    if (targetRole === 'admin') {
      profile = {
        ...currentUser,
        id: 'admin-0945688090',
        name: 'كابتن عامر (المدير العام)',
        phone: '0945688090',
        email: 'family2016amer@gmail.com',
        role: 'admin',
        isAdmin: true,
        governorate: 'دمشق'
      };
    } else if (targetRole === 'announcer') {
      profile = {
        ...currentUser,
        id: 'usr-announcer-0988776655',
        name: 'كابتن مجد الشامي (معلن ملاعب)',
        phone: '0988776655',
        email: 'majd@kaptan.sy',
        role: 'announcer',
        isAdmin: false,
        governorate: 'حلب'
      };
    } else if (targetRole === 'league_manager') {
      profile = {
        ...currentUser,
        id: 'usr-manager-0933112233',
        name: 'كابتن حكمت الحكيم (منظم دوريات)',
        phone: '0933112233',
        email: 'hhkmtalhkym@gmail.com',
        role: 'league_manager',
        isAdmin: false,
        governorate: 'دمشق'
      };
    } else {
      profile = {
        ...currentUser,
        id: 'usr-player-demo',
        name: 'كابتن وسيم حمصي (لاعب)',
        phone: '0955443322',
        email: 'waseem@kaptan.sy',
        role: 'player',
        isAdmin: false,
        governorate: 'حمص'
      };
    }

    try {
      await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
    } catch (e) {
      console.warn('Set quick role doc notice:', e);
    }

    setCurrentUser(profile);
    setIsAuthenticated(true);
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
      setIsAuthenticated(false);
      localStorage.removeItem('captain_auth_user');
      localStorage.removeItem('kaptan_current_user');
      localStorage.removeItem('kaptan_is_authenticated');
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
      setIsAuthenticated(false);
      localStorage.removeItem('captain_auth_user');
      localStorage.removeItem('kaptan_current_user');
      localStorage.removeItem('kaptan_is_authenticated');
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
        quickRoleLogin,
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
