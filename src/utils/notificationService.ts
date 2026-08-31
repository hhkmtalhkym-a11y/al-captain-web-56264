import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppNotification } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from './helpers';

/**
 * Audio chime for in-app and push notification arrival
 */
export function playNotificationSound() {
  try {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Non-blocking sound fallback
  }
}

/**
 * Triggers native browser push notification if permissions are granted
 */
export function sendBrowserPushNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    url?: string;
    priority?: 'normal' | 'high' | 'urgent';
  }
) {
  try {
    playNotificationSound();

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const notif = new Notification(title, {
          body: options?.body || 'لديك إشعار جديد من تطبيق الكابتن الرياضي',
          icon: options?.icon || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=192&q=80',
          tag: options?.tag || `kaptan-notif-${Date.now()}`,
          badge: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=96&q=80',
          lang: 'ar',
          dir: 'rtl'
        });

        notif.onclick = () => {
          window.focus();
          if (options?.url) {
            window.location.hash = options.url.replace('#', '');
          }
          notif.close();
        };
      }
    }
  } catch (err) {
    console.warn('[Notification] Browser push notification notice:', err);
  }
}

/**
 * Creates and dispatches an application notification to Firestore and local storage,
 * and delivers real-time browser push alerts.
 */
export async function dispatchAppNotification({
  title,
  message,
  type = 'system',
  recipientId = 'all',
  recipientName,
  priority = 'normal',
  actionUrl,
  targetId
}: {
  title: string;
  message: string;
  type?: AppNotification['type'];
  recipientId?: string; // 'all' or specific user ID
  recipientName?: string;
  priority?: 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  targetId?: string;
}): Promise<AppNotification> {
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    type,
    date: 'الآن',
    timestamp: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
    isRead: false,
    targetId
  };

  // 1. Sync to Local Storage
  const savedNotifs = loadFromLocalStorage<AppNotification[]>('kaptan_notifications', []);
  const updatedNotifs = [newNotif, ...savedNotifs.slice(0, 49)];
  saveToLocalStorage('kaptan_notifications', updatedNotifs);

  // 2. Persist to Firestore
  try {
    await setDoc(doc(db, 'notifications', newNotif.id), {
      ...newNotif,
      recipientId,
      recipientName: recipientName || (recipientId === 'all' ? 'جميع المستخدمين' : 'مستخدم محدد'),
      priority,
      actionUrl: actionUrl || '',
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('[Notification] Firestore save notice:', e);
  }

  // 3. Browser Push Notification
  sendBrowserPushNotification(title, {
    body: message,
    url: actionUrl,
    priority
  });

  return newNotif;
}

/**
 * Notification generators for each application section and workflow
 */

// 1. Court / Playground Booking Approved / Rejected
export async function notifyBookingDecision({
  userId,
  userName,
  playgroundName,
  referenceNumber,
  timeSlot,
  dates,
  isApproved,
  rejectionReason
}: {
  userId: string;
  userName: string;
  playgroundName: string;
  referenceNumber: string;
  timeSlot: string;
  dates: string[];
  isApproved: boolean;
  rejectionReason?: string;
}) {
  const title = isApproved
    ? `✅ تم قبول وتأكيد حجزك: ${playgroundName}`
    : `❌ تم الاعتذار عن حجز: ${playgroundName}`;

  const message = isApproved
    ? `عزيزي الكابتن ${userName}، تمت الموافقة رسمياً على حجزك (${referenceNumber}) ليوم ${dates.join(', ')} بتوقيت ${timeSlot}. بإمكانك الآن تحميل فاتورة الحجز وتجهيز فريقك!`
    : `عزيزي الكابتن ${userName}، نعتذر عن عدم إمكانية تأكيد حجزك (${referenceNumber}) لملعب ${playgroundName}.${rejectionReason ? ` سبب الاعتذار: ${rejectionReason}` : ''}`;

  return dispatchAppNotification({
    title,
    message,
    type: 'booking',
    recipientId: userId,
    recipientName: userName,
    priority: isApproved ? 'high' : 'urgent',
    actionUrl: 'bookings',
    targetId: referenceNumber
  });
}

// 2. Friendly Match / Challenge Accepted / Rejected
export async function notifyMatchJoinDecision({
  applicantUserId,
  applicantName,
  hostTeamName,
  opponentTeamName,
  venueName,
  date,
  time,
  isApproved,
  rejectionReason
}: {
  applicantUserId: string;
  applicantName: string;
  hostTeamName: string;
  opponentTeamName: string;
  venueName: string;
  date: string;
  time: string;
  isApproved: boolean;
  rejectionReason?: string;
}) {
  const title = isApproved
    ? `⚽ تم قبول طلب التحدي/الانضمام للمباراة!`
    : `⚠️ قرار بخصوص طلب الانضمام للمباراة`;

  const message = isApproved
    ? `تمت الموافقة على انضمام فريق (${opponentTeamName || applicantName}) لملاقاة (${hostTeamName}) في ${venueName} بتاريخ ${date} الساعة ${time}. بالتوفيق!`
    : `نعتذر، لم يتم قبول طلب التحدي لمباراة (${hostTeamName}).${rejectionReason ? ` السبب: ${rejectionReason}` : ' نتمنى لكم التوفيق في تحديات قادمة.'}`;

  return dispatchAppNotification({
    title,
    message,
    type: 'match',
    recipientId: applicantUserId,
    recipientName: applicantName,
    priority: 'high',
    actionUrl: 'matches'
  });
}

// 3. Academy Registration Accepted / Rejected
export async function notifyAcademyRegistrationDecision({
  userId,
  studentName,
  parentName,
  academyName,
  isApproved,
  rejectionReason
}: {
  userId?: string;
  studentName: string;
  parentName: string;
  academyName: string;
  isApproved: boolean;
  rejectionReason?: string;
}) {
  const title = isApproved
    ? `🎓 تم قبول تسجيل الطالب: ${studentName}`
    : `📋 قرار بخصوص طلب التسجيل بأكاديمية ${academyName}`;

  const message = isApproved
    ? `تهانينا للسيد/ة ${parentName}، تم اعتماد وقبول تسجيل الطالب (${studentName}) في (${academyName}) رسمياً. يرجى التواصل مع الإدارة لاستلام الزي ومواعيد التمارين.`
    : `عزيزي ${parentName}، نعتذر لعدم قبول طلب التسجيل للطالب (${studentName}) في (${academyName}).${rejectionReason ? ` السبب: ${rejectionReason}` : ''}`;

  return dispatchAppNotification({
    title,
    message,
    type: 'academy',
    recipientId: userId || 'all',
    recipientName: parentName || studentName,
    priority: isApproved ? 'high' : 'normal',
    actionUrl: 'academies'
  });
}

// 4. League Team Registration / Objection Decision
export async function notifyLeagueTeamDecision({
  userId,
  teamName,
  leagueName,
  isApproved,
  details
}: {
  userId?: string;
  teamName: string;
  leagueName: string;
  isApproved: boolean;
  details?: string;
}) {
  const title = isApproved
    ? `🏆 تم قبول تسجيل فريق ${teamName} في بطولة: ${leagueName}`
    : `📢 تنبيه بخصوص بطولة: ${leagueName}`;

  const message = isApproved
    ? `تم اعتماد وتثبيت مشاركة فريق (${teamName}) في (${leagueName}) رسمياً. يمكنكم متابعة جدول المباريات وترتيب البطولة عبر التطبيق.`
    : `بخصوص فريق (${teamName}) في (${leagueName}): ${details || 'تم تحديث حالة الفريق من قبل إدارة البطولة.'}`;

  return dispatchAppNotification({
    title,
    message,
    type: 'league',
    recipientId: userId || 'all',
    recipientName: teamName,
    priority: 'high',
    actionUrl: 'leagues'
  });
}

// 5. Admin Broadcast / Direct Targeted Notification
export async function notifyAdminBroadcast({
  title,
  message,
  type = 'admin',
  recipientId = 'all',
  recipientName = 'جميع المستخدمين',
  priority = 'normal',
  actionUrl = 'home'
}: {
  title: string;
  message: string;
  type?: AppNotification['type'];
  recipientId?: string;
  recipientName?: string;
  priority?: 'normal' | 'high' | 'urgent';
  actionUrl?: string;
}) {
  return dispatchAppNotification({
    title,
    message,
    type,
    recipientId,
    recipientName,
    priority,
    actionUrl
  });
}
