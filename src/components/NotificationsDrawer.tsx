import { X, CheckCheck, Bell, Shield, Calendar, Users, Trophy } from 'lucide-react';
import { NotificationItem } from '../types';

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
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* WhatsApp simulation banner */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>الإشعارات الفورية عبر واتساب نشطة 📲</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">WhatsApp API</span>
        </div>
      </div>
    </div>
  );
}
