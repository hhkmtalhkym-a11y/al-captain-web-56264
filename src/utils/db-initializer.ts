import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  limit
} from 'firebase/firestore';
import {
  INITIAL_PLAYGROUNDS,
  INITIAL_LEAGUES,
  INITIAL_ACADEMIES,
  INITIAL_FRIENDLY_MATCHES as INITIAL_MATCHES,
  INITIAL_PLAYER_CVS
} from '../constants/syrianData';

export const REQUIRED_COLLECTIONS = [
  'users',
  'playgrounds',
  'bookings',
  'leagues',
  'leagueMatches',
  'academies',
  'academyRegistrations',
  'playerCards',
  'friendlyMatches',
  'notifications',
  'adminRequests',
  'activityLogs'
] as const;

export const DEFAULT_ADMIN_USER = {
  id: 'admin-0945688090',
  uid: 'admin-0945688090',
  name: 'كابتن عامر (المدير العام)',
  fullName: 'كابتن عامر (المدير العام)',
  phone: '0945688090',
  email: 'family2016amer@gmail.com',
  password: 'A123@123A',
  role: 'admin',
  isAdmin: true,
  governorate: 'دمشق',
  status: 'active',
  isBanned: false,
  joinDate: '2026-01-01',
  createdAt: new Date().toISOString()
};

/**
 * Initializes the Firestore database on initial application boot.
 * Checks for all required collections and seeds default admin and baseline records if missing.
 */
export async function initializeDatabase(): Promise<{ success: boolean; message: string; seededCount: number }> {
  try {
    console.log('🚀 [DB-Initializer] Starting database structure verification and seeding...');
    let seededCount = 0;

    // 1. Seed / Verify Default Admin User
    try {
      const adminDocRef = doc(db, 'users', 'admin-0945688090');
      const adminSnap = await getDoc(adminDocRef);

      if (!adminSnap.exists()) {
        await setDoc(adminDocRef, DEFAULT_ADMIN_USER, { merge: true });
        console.log('✅ [DB-Initializer] Default Admin user created (phone: 0945688090)');
        seededCount++;
      }
    } catch (adminErr: any) {
      console.warn('⚠️ [DB-Initializer] Admin user seeding notice:', adminErr?.message);
    }

    // 2. Check and initialize required collections
    for (const colName of REQUIRED_COLLECTIONS) {
      try {
        const colRef = collection(db, colName);
        const q = query(colRef, limit(1));
        const snap = await getDocs(q);

        if (snap.empty) {
          console.log(`ℹ️ [DB-Initializer] Collection "${colName}" is empty. Bootstrapping baseline schema...`);

          if (colName === 'playgrounds' && INITIAL_PLAYGROUNDS?.length > 0) {
            for (const pg of INITIAL_PLAYGROUNDS.slice(0, 3)) {
              await setDoc(doc(db, colName, pg.id), pg, { merge: true });
              seededCount++;
            }
          } else if (colName === 'leagues' && INITIAL_LEAGUES?.length > 0) {
            for (const lg of INITIAL_LEAGUES.slice(0, 2)) {
              await setDoc(doc(db, colName, lg.id), lg, { merge: true });
              seededCount++;
            }
          } else if (colName === 'academies' && INITIAL_ACADEMIES?.length > 0) {
            for (const aca of INITIAL_ACADEMIES.slice(0, 2)) {
              await setDoc(doc(db, colName, aca.id), aca, { merge: true });
              seededCount++;
            }
          } else if (colName === 'friendlyMatches' && INITIAL_MATCHES?.length > 0) {
            for (const fm of INITIAL_MATCHES.slice(0, 2)) {
              await setDoc(doc(db, colName, fm.id), fm, { merge: true });
              seededCount++;
            }
          } else if (colName === 'playerCards' && INITIAL_PLAYER_CVS?.length > 0) {
            for (const pc of INITIAL_PLAYER_CVS.slice(0, 2)) {
              await setDoc(doc(db, colName, pc.id), pc, { merge: true });
              seededCount++;
            }
          } else if (colName === 'activityLogs') {
            const initialLog = {
              id: 'init-log-1',
              action: 'system',
              targetType: 'system',
              actorName: 'نظام الكابتن السحابي',
              actorRole: 'admin',
              actorPhone: '0945688090',
              description: 'تهيئة وتدقيق قواعد بيانات تطبيق الكابتن في كافة المحافظات السورية بنجاح.',
              timestamp: new Date().toISOString()
            };
            await setDoc(doc(db, colName, 'init-log-1'), initialLog, { merge: true });
            seededCount++;
          } else if (colName === 'notifications') {
            const welcomeNotif = {
              id: 'welcome-system-notif',
              title: 'مرحباً بك في منصة الكابتن ⚽',
              message: 'تم إطلاق الإصدار الذهبي الشامل للملاعب والدوريات بدون أي عمولة.',
              type: 'system',
              date: new Date().toISOString().split('T')[0],
              timestamp: new Date().toISOString(),
              isRead: false
            };
            await setDoc(doc(db, colName, 'welcome-system-notif'), welcomeNotif, { merge: true });
            seededCount++;
          }
        }
      } catch (colErr: any) {
        console.warn(`⚠️ [DB-Initializer] Collection "${colName}" verification notice:`, colErr?.message);
      }
    }

    console.log(`🎉 [DB-Initializer] Finished database boot check. Seeded ${seededCount} items.`);
    return {
      success: true,
      message: 'تم التحقق من هيكلية وتواجد كافة مجموعات قاعدة البيانات وتهيئة حساب الإدارة الافتراضي بنجاح.',
      seededCount
    };
  } catch (error: any) {
    console.error('❌ [DB-Initializer] Database initialization error:', error);
    return {
      success: false,
      message: error?.message || 'فشل في تهيئة قاعدة البيانات',
      seededCount: 0
    };
  }
}
