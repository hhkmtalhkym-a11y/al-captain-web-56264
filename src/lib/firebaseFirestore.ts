import { db, auth, storage, googleProvider } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  User
} from 'firebase/auth';

// ============================================
// 🔥 Core Firestore CRUD Helpers
// ============================================

export async function addDocument<T = DocumentData>(collectionName: string, data: any, customId: string | null = null): Promise<{ id: string } & T> {
  try {
    let docId: string;
    if (customId) {
      const docRef = doc(db, collectionName, customId);
      await setDoc(docRef, data, { merge: true });
      docId = customId;
    } else {
      const docRef = await addDoc(collection(db, collectionName), data);
      docId = docRef.id;
    }
    console.log(`✅ Document saved in ${collectionName}:`, docId);
    return { id: docId, ...data };
  } catch (error: any) {
    console.warn(`Firestore addDocument notice in ${collectionName}:`, error?.message);
    return { id: customId || `local-${Date.now()}`, ...data };
  }
}

export async function getDocument<T = DocumentData>(collectionName: string, id: string): Promise<({ id: string } & T) | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as { id: string } & T;
    }
    return null;
  } catch (error: any) {
    console.warn(`Firestore getDocument notice in ${collectionName}:`, error?.message);
    return null;
  }
}

export async function getAllDocuments<T = DocumentData>(collectionName: string): Promise<({ id: string } & T)[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents: ({ id: string } & T)[] = [];
    querySnapshot.forEach((d) => {
      documents.push({ id: d.id, ...d.data() } as { id: string } & T);
    });
    return documents;
  } catch (error: any) {
    console.warn(`Firestore getAllDocuments notice in ${collectionName}:`, error?.message);
    return [];
  }
}

export async function updateDocument(collectionName: string, id: string, data: any): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
    console.log(`✅ Document updated in ${collectionName}:`, id);
    return true;
  } catch (error: any) {
    console.warn(`Firestore updateDocument notice in ${collectionName}:`, error?.message);
    return false;
  }
}

export async function deleteDocument(collectionName: string, id: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    console.log(`✅ Document deleted from ${collectionName}:`, id);
    return true;
  } catch (error: any) {
    console.warn(`Firestore deleteDocument notice in ${collectionName}:`, error?.message);
    return false;
  }
}

export async function queryDocuments<T = DocumentData>(collectionName: string, field: string, operator: any, value: any): Promise<({ id: string } & T)[]> {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    const documents: ({ id: string } & T)[] = [];
    querySnapshot.forEach((d) => {
      documents.push({ id: d.id, ...d.data() } as { id: string } & T);
    });
    return documents;
  } catch (error: any) {
    console.warn(`Firestore queryDocuments notice in ${collectionName}:`, error?.message);
    return [];
  }
}

// ============================================
// 👤 Captain Platform Specialized Methods
// ============================================

export async function createUser(userData: any) {
  if (userData.phone) {
    const existing = await queryDocuments('users', 'phone', '==', userData.phone);
    if (existing.length > 0) {
      return existing[0];
    }
  }
  return await addDocument('users', {
    ...userData,
    createdAt: new Date().toISOString(),
    role: userData.role || 'player',
    status: 'active',
    coins: 0
  }, userData.uid || null);
}

export async function createPlayground(playgroundData: any) {
  return await addDocument('playgrounds', {
    ...playgroundData,
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
    bookings: 0,
    rating: playgroundData.rating || 5,
    reviews: []
  }, playgroundData.id || null);
}

export async function createBooking(bookingData: any) {
  return await addDocument('bookings', {
    ...bookingData,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    paymentPolicy: 'يلزم تأكيد الدفع نقداً قبل 24 ساعة من الموعد',
    bookingReference: 'BK-' + Date.now().toString(36).toUpperCase()
  }, bookingData.id || null);
}

export async function createLeague(leagueData: any) {
  return await addDocument('leagues', {
    ...leagueData,
    createdAt: new Date().toISOString(),
    status: leagueData.status || 'مقبل',
    matches: leagueData.fixtures?.length || 0,
    teamsCount: leagueData.standings?.length || 0
  }, leagueData.id || null);
}

export async function createAcademy(academyData: any) {
  return await addDocument('academies', {
    ...academyData,
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
    students: 0,
    rating: 5
  }, academyData.id || null);
}

export async function createPlayerCard(playerData: any) {
  return await addDocument('playerCards', {
    ...playerData,
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
    stats: {
      matches: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      interceptions: 0,
      passAccuracy: 0
    }
  }, playerData.id || null);
}

export async function createFriendlyMatch(matchData: any) {
  return await addDocument('friendlyMatches', {
    ...matchData,
    createdAt: new Date().toISOString(),
    status: 'مفتوح',
    participants: []
  }, matchData.id || null);
}

export async function createAd(adData: any) {
  return await addDocument('ads', {
    ...adData,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    views: 0,
    clicks: 0
  });
}

export async function createActivityLog(logData: any) {
  return await addDocument('activityLogs', {
    ...logData,
    timestamp: new Date().toISOString()
  });
}

// ============================================
// 🔐 Auth Operations
// ============================================

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function registerWithEmail(email: string, password: string, fullName: string, phone: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: fullName });
  try {
    await sendEmailVerification(userCredential.user);
  } catch (e) {
    console.warn('Email verification send notice:', e);
  }
  await createUser({
    uid: userCredential.user.uid,
    fullName,
    email,
    phone,
    role: 'player'
  });
  return userCredential.user;
}

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function resetPassword(email: string): Promise<boolean> {
  await sendPasswordResetEmail(auth, email);
  return true;
}

export async function logoutUser(): Promise<boolean> {
  await signOut(auth);
  return true;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
