import { Booking, AppNotification } from '../types';

export interface BookingReminderAlert {
  booking: Booking;
  hoursRemaining: number;
  minutesRemaining: number;
  isWithinTwoHours: number; // in minutes if <= 120
  message: string;
  isToday: boolean;
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
    b.selectedDates.forEach((dateStr) => {
      const startDateTime = getBookingStartDateTime(dateStr, b.timeSlot);
      const diffMs = startDateTime.getTime() - now.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));

      const isToday =
        startDateTime.getFullYear() === now.getFullYear() &&
        startDateTime.getMonth() === now.getMonth() &&
        startDateTime.getDate() === now.getDate();

      // Check if match is upcoming within 2 hours (0 to 120 minutes)
      // or if match is today within 4 hours
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
          isToday
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

  alerts.forEach((alert, idx) => {
    notifications.push({
      id: `notif-booking-reminder-${alert.booking.id}-${idx}`,
      title: `⏰ تذكير بموعد المباراة (خلال ساعتين)`,
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
