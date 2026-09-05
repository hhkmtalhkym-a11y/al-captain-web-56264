import { Booking, AppNotification, UserProfile, Playground } from '../types';

export interface BookingReminderAlert {
  booking: Booking;
  hoursRemaining: number;
  minutesRemaining: number;
  isWithinTwoHours: number; // in minutes if <= 120
  message: string;
  isToday: boolean;
  dateStr: string;
}

/**
 * Parse time from timeSlot string (e.g. "06:00 مساءً - 07:30 مساءً" or "18:00 - 19:30" or "08:00")
 */
export function parseSlotStartTime(timeSlot: string): { hour: number; minute: number } {
  try {
    const firstPart = timeSlot.split('-')[0].trim(); // e.g. "06:00 مساءً" or "18:00"
    const isPM = firstPart.includes('مساءً') || firstPart.toLowerCase().includes('pm');
    const isAM = firstPart.includes('صباحاً') || firstPart.toLowerCase().includes('am');

    const cleanTime = firstPart.replace(/[^0-9:]/g, '').trim();
    const [hStr, mStr] = cleanTime.split(':');
    let hour = parseInt(hStr, 10) || 0;
    const minute = parseInt(mStr, 10) || 0;

    if (isPM && hour < 12) {
      hour += 12;
    } else if (isAM && hour === 12) {
      hour = 0;
    }

    return { hour, minute };
  } catch {
    return { hour: 18, minute: 0 };
  }
}

/**
 * Calculate the exact start Date object for a booking
 */
export function getBookingStartDateTime(bookingDateStr: string, timeSlot: string): Date {
  const [y, m, d] = bookingDateStr.split('-').map(Number);
  const { hour, minute } = parseSlotStartTime(timeSlot);
  return new Date(y, m - 1, d, hour, minute, 0);
}

/**
 * Check all confirmed bookings for upcoming matches within 2 hours
 */
export function checkUpcomingBookingReminders(bookings: Booking[]): BookingReminderAlert[] {
  const now = new Date();
  const alerts: BookingReminderAlert[] = [];

  const confirmedBookings = bookings.filter((b) => b.status === 'مؤكد');

  confirmedBookings.forEach((b) => {
    (b.selectedDates || []).forEach((dateStr) => {
      const startDateTime = getBookingStartDateTime(dateStr, b.timeSlot);
      const diffMs = startDateTime.getTime() - now.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));

      const isToday =
        startDateTime.getFullYear() === now.getFullYear() &&
        startDateTime.getMonth() === now.getMonth() &&
        startDateTime.getDate() === now.getDate();

      // Check if match is upcoming within 2 hours (0 to 120 minutes)
      if (diffMinutes > 0 && diffMinutes <= 120) {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        const timeText = hours > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${mins} دقيقة`;

        alerts.push({
          booking: b,
          hoursRemaining: hours,
          minutesRemaining: mins,
          isWithinTwoHours: diffMinutes,
          message: `⏰ تذكير بمباراتك: موعد حجزك في "${b.playgroundName}" يبدأ بعد ${timeText} (الساعة ${b.timeSlot.split('-')[0].trim()}). استعد للمباراة! ⚽`,
          isToday,
          dateStr
        });
      }
    });
  });

  return alerts;
}

/**
 * Generate in-app notifications for upcoming 2-hour booking reminders
 */
export function generateBookingNotifications(bookings: Booking[]): AppNotification[] {
  const alerts = checkUpcomingBookingReminders(bookings);
  const notifications: AppNotification[] = [];

  alerts.forEach((alert) => {
    notifications.push({
      id: `notif-booking-reminder-${alert.booking.id}-${alert.dateStr}`,
      title: `⏰ تذكير بموعد حجزك المؤكد (خلال ساعتين)`,
      message: alert.message,
      type: 'booking',
      targetId: alert.booking.id,
      timestamp: new Date().toISOString(),
      isRead: false
    });
  });

  return notifications;
}

/**
 * Play a gentle notification sound chime using Web Audio API
 */
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Trigger local browser notification if supported and permission granted
 */
export function triggerBrowserNotification(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    }
  } catch (err) {
    console.warn('Browser notification error:', err);
  }
}

/**
 * Request notification permissions from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

/**
 * Automatically check bookings and dispatch reminders 2 hours before confirmed matches
 */
export function runAutomaticBookingReminderCheck(
  bookings: Booking[],
  currentUser: Partial<UserProfile> | null | undefined,
  onNewNotification: (notif: AppNotification) => void
): BookingReminderAlert[] {
  const alerts = checkUpcomingBookingReminders(bookings);

  // Load already sent reminder keys
  let sentKeys: string[] = [];
  try {
    const stored = localStorage.getItem('kaptan_sent_booking_reminders');
    if (stored) {
      sentKeys = JSON.parse(stored);
    }
  } catch {
    sentKeys = [];
  }

  let newlySent = false;

  alerts.forEach((alert) => {
    // If currentUser is logged in, verify if the booking belongs to this user or if user is admin
    const b = alert.booking;
    const isUserBooking =
      !currentUser ||
      currentUser.isAdmin ||
      b.userId === currentUser.id ||
      b.userName === currentUser.name ||
      b.userPhone === currentUser.phone;

    if (!isUserBooking) return;

    const reminderKey = `reminder_2h_${b.id}_${alert.dateStr}`;

    if (!sentKeys.includes(reminderKey)) {
      const newNotif: AppNotification = {
        id: `notif-reminder-${b.id}-${Date.now()}`,
        title: `⏰ تذكير بموعد حجزك المؤكد (خلال ساعتين)`,
        message: alert.message,
        type: 'booking',
        targetId: b.id,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      // Dispatch in-app notification
      onNewNotification(newNotif);

      // Trigger browser notification
      triggerBrowserNotification(newNotif.title, newNotif.message);

      // Play audio chime
      playNotificationSound();

      sentKeys.push(reminderKey);
      newlySent = true;
    }
  });

  if (newlySent) {
    try {
      localStorage.setItem('kaptan_sent_booking_reminders', JSON.stringify(sentKeys));
    } catch {
      // Ignore
    }
  }

  return alerts;
}

export interface Upcoming24HourBookingAlert {
  booking: Booking;
  playground?: Playground;
  hoursRemaining: number;
  minutesRemaining: number;
  totalMinutesRemaining: number;
  timeSlot: string;
  dateStr: string;
  isToday: boolean;
  googleMapsUrl: string;
  message: string;
}

/**
 * Generate Google Maps search / navigation URL for playground
 */
export function getPlaygroundGoogleMapsUrl(playground?: Playground, booking?: Booking): string {
  if (playground?.latitude && playground?.longitude && playground.latitude !== 0 && playground.longitude !== 0) {
    return `https://www.google.com/maps/search/?api=1&query=${playground.latitude},${playground.longitude}`;
  }
  const name = playground?.name || booking?.playgroundName || '';
  const gov = playground?.governorate || booking?.governorate || 'سوريا';
  const area = playground?.detailedArea || booking?.detailedArea || '';
  const query = `${name} ${gov} ${area} ملاعب سوريا`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Check all confirmed bookings for upcoming matches within 24 hours
 */
export function checkUpcoming24HourBookings(
  bookings: Booking[],
  currentUser?: UserProfile | null,
  playgrounds?: Playground[]
): Upcoming24HourBookingAlert[] {
  const now = new Date();
  const alerts: Upcoming24HourBookingAlert[] = [];

  const confirmedBookings = (bookings || []).filter((b) => {
    if (b.status !== 'مؤكد') return false;
    if (!currentUser) return true;
    if (currentUser.isAdmin || currentUser.role === 'admin') return true;
    return (
      b.userId === currentUser.id ||
      b.userPhone === currentUser.phone ||
      b.userName === currentUser.name
    );
  });

  confirmedBookings.forEach((b) => {
    (b.selectedDates || []).forEach((dateStr) => {
      const startDateTime = getBookingStartDateTime(dateStr, b.timeSlot);
      const diffMs = startDateTime.getTime() - now.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));

      // Check if match is upcoming within 24 hours (0 to 1440 minutes)
      if (diffMinutes > 0 && diffMinutes <= 1440) {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        const pg = playgrounds?.find((p) => p.id === b.playgroundId || p.name === b.playgroundName);
        const mapsUrl = getPlaygroundGoogleMapsUrl(pg, b);

        const isToday =
          startDateTime.getFullYear() === now.getFullYear() &&
          startDateTime.getMonth() === now.getMonth() &&
          startDateTime.getDate() === now.getDate();

        const timeText = hours > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${mins} دقيقة`;

        alerts.push({
          booking: b,
          playground: pg,
          hoursRemaining: hours,
          minutesRemaining: mins,
          totalMinutesRemaining: diffMinutes,
          timeSlot: b.timeSlot,
          dateStr,
          isToday,
          googleMapsUrl: mapsUrl,
          message: `موعد حجزك في "${b.playgroundName}" يقترب: يبدأ بعد ${timeText} (الساعة ${b.timeSlot.split('-')[0].trim()})`
        });
      }
    });
  });

  // Sort by earliest match first
  return alerts.sort((a, b) => a.totalMinutesRemaining - b.totalMinutesRemaining);
}

export type PlaygroundAvailabilityStatus = 'متاح' | 'محجوز حالياً' | 'مغلق';

export interface PlaygroundStatusInfo {
  status: PlaygroundAvailabilityStatus;
  label: string;
  subText: string;
  badgeClass: string;
  dotClass: string;
}

/**
 * Determine the real-time booking status of a playground ('متاح', 'محجوز حالياً', 'مغلق')
 */
export function getPlaygroundBookingStatus(
  playground: Playground,
  bookings?: Booking[]
): PlaygroundStatusInfo {
  // 1. If playground is suspended or rejected
  if (playground.status === 'معلق' || playground.status === 'مرفوض') {
    return {
      status: 'مغلق',
      label: 'مغلق',
      subText: 'خارج الخدمة حالياً',
      badgeClass: 'bg-zinc-800/90 text-zinc-300 border-zinc-700/80',
      dotClass: 'bg-zinc-500'
    };
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const todayStr = now.toISOString().split('T')[0];

  // 2. Check today's active confirmed bookings
  if (bookings && bookings.length > 0) {
    const todayConfirmed = bookings.filter(
      (b) =>
        b.playgroundId === playground.id &&
        (b.status === 'مؤكد' || b.status === 'قيد الانتظار') &&
        (b.selectedDates || []).includes(todayStr)
    );

    for (const b of todayConfirmed) {
      const { hour: startHour, minute: startMinute } = parseSlotStartTime(b.timeSlot);
      const startMinutes = startHour * 60 + startMinute;
      let durationMinutes = 60;
      if (b.duration === 'ساعة ونصف') durationMinutes = 90;
      else if (b.duration === 'ساعتين') durationMinutes = 120;
      const endMinutes = startMinutes + durationMinutes;

      // Currently during match
      if (currentTotalMinutes >= startMinutes && currentTotalMinutes < endMinutes) {
        const remainingMinutes = endMinutes - currentTotalMinutes;
        return {
          status: 'محجوز حالياً',
          label: 'محجوز حالياً',
          subText: `متبقي ${remainingMinutes} دقيقة`,
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20',
          dotClass: 'bg-rose-400'
        };
      }
    }
  }

  // 3. Check playground schedules for today
  if (playground.schedules && playground.schedules.length > 0) {
    const todaySchedule = playground.schedules.find((s) => s.date === todayStr);
    if (todaySchedule) {
      if ((todaySchedule as any).isAvailable === false) {
        return {
          status: 'مغلق',
          label: 'مغلق اليوم',
          subText: 'صيانة أو عطلة',
          badgeClass: 'bg-zinc-800/90 text-zinc-400 border-zinc-700',
          dotClass: 'bg-zinc-500'
        };
      }

      // Check slots
      const currentSlot = todaySchedule.slots?.find((s: any) => {
        const timeStr = s.startTime || s.time || '';
        const { hour, minute } = parseSlotStartTime(timeStr);
        const slotStart = hour * 60 + minute;
        return currentTotalMinutes >= slotStart && currentTotalMinutes < slotStart + 90;
      });

      if (currentSlot && (currentSlot.status === 'booked' || (currentSlot as any).isBooked)) {
        return {
          status: 'محجوز حالياً',
          label: 'محجوز حالياً',
          subText: 'مشغول الآن',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20',
          dotClass: 'bg-rose-400'
        };
      }
    }
  }

  // Default: available
  return {
    status: 'متاح',
    label: 'متاح',
    subText: 'جاهز للحجز الفوري',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20',
    dotClass: 'bg-emerald-400 animate-pulse'
  };
}

