import { X, CheckCheck, Bell, Shield, Calendar, Users, Trophy, Share2 } from 'lucide-react';
import { NotificationItem } from '../types';
import { openWhatsAppShare } from '../utils/helpers';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectNotification?: (notif: NotificationItem) => void;
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification
}: NotificationsDrawerProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-[#00FFD2]" />;
      case 'match':
        return <Users className="w-4 h-4 text-[#ff2a5f]" />;
      case 'league':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div
      id="drawer-notifications"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0d1211] border-r border-[#00FFD2]/20 h-full flex flex-col p-5 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00FFD2]/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff2a5f]/10 border border-[#ff2a5f]/30 flex items-center justify-center text-[#ff2a5f] relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff2a5f] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Cairo']">مركز التنبيهات والإشعارات</h2>
              <p className="text-xs text-gray-400">تحديثات الحجوزات والمباريات والقرارات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-xs text-gray-400">
            لديك <strong className="text-[#00FFD2]">{unreadCount}</strong> إشعارات جديدة
          </span>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-[#00FFD2] hover:underline flex items-center gap-1 font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" /> تحديد الكل كمقروء
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              <Bell className="w-12 h-12 mx-auto text-gray-600 mb-3 opacity-40" />
              لا توجد أي إشعارات حالياً
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onSelectNotification && onSelectNotification(notif)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? 'bg-[#050707]/60 border-white/5 opacity-80 hover:opacity-100 hover:border-white/20'
                    : 'bg-[#050707] border-[#00FFD2]/40 glow-primary shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white truncate">{notif.title}</h4>
                      <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{notif.message}</p>
                    {(notif.type === 'match' || notif.type === 'booking') && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const shareText = `📢 *إشعار من تطبيق الكابتن:* ⚽\n📌 *${notif.title}*\n${notif.message}\n\n📲 رابط منصة الكابتن الرياضي: ${window.location.origin}`;
                            openWhatsAppShare(shareText);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>مشاركة عبر واتس</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* WhatsApp & FCM Push Notification Banner */}
        <div className="mt-4 p-3 rounded-xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between text-[#00FFD2]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00FFD2] animate-ping"></span>
              <span className="font-bold">إشعارات المتصفح والهاتف (FCM)</span>
            </div>
            <button
              onClick={async () => {
                const { requestNotificationPermission } = await import('../lib/firebase');
                const token = await requestNotificationPermission();
                if (token) {
                  alert('تم تفعيل استقبال الإشعارات الفورية على هذا الجهاز بنجاح! 🔔');
                } else {
                  alert('يرجى السماح بصلاحية الإشعارات من إعدادات المتصفح.');
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-[#00FFD2] text-black text-[11px] font-bold hover:bg-[#00e6bd] transition-colors cursor-pointer"
            >
              تفعيل التنبيهات
            </button>
          </div>
          <p className="text-[11px] text-gray-300">
            احصل على تنبيه فوري عند تأكيد حجوزاتك أو بدء المباريات والبطولات.
          </p>
        </div>
      </div>
    </div>
  );
}

