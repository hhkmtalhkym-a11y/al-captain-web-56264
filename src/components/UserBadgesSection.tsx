import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Share2,
  Zap,
  Star,
  Target,
  Trophy,
  Shield,
  Calendar,
  X
} from 'lucide-react';
import { UserBadge, UserProfile, Booking } from '../types';
import { getUserBadges, calculateBadgesStats } from '../utils/badgeService';
import { openWhatsAppShare } from '../utils/helpers';
import { APP_OFFICIAL_URL } from './ShareAppModal';

interface UserBadgesSectionProps {
  currentUser: UserProfile;
  bookings?: Booking[];
}

export default function UserBadgesSection({
  currentUser,
  bookings = []
}: UserBadgesSectionProps) {
  const [badges, setBadges] = useState<UserBadge[]>(() =>
    getUserBadges(currentUser, bookings)
  );
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'earned' | 'in_progress'>('all');
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const stats = calculateBadgesStats(badges);

  const filteredBadges = badges.filter((b) => {
    if (filterCategory === 'earned') return b.isEarned;
    if (filterCategory === 'in_progress') return !b.isEarned;
    return true;
  });

  const handleShareBadge = (badge: UserBadge) => {
    const text = `🏆 *وسام إنجاز رياضي - تطبيق الكابتن* ⚽
━━━━━━━━━━━━━━━━━━━━━
🌟 حصل الكابتن *${currentUser.name}* على وسام:
⭐ *[ ${badge.title} - ${badge.subtitle} ]*

📜 *تفاصيل الإنجاز:*
${badge.description}

✨ *المستوى الحالي:* ${stats.levelTitle} (${stats.totalXp} نقطة XP)
📍 *المحافظة:* ${currentUser.governorate}

📲 انضم وتحدّانا عبر منصة الكابتن الرياضية:
${APP_OFFICIAL_URL}
━━━━━━━━━━━━━━━━━━━━━`;

    openWhatsAppShare(text);
    setShareNotice(`تم فتح واتساب لمشاركة وسام "${badge.title}" 🏆`);
    setTimeout(() => setShareNotice(null), 3500);
  };

  return (
    <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-6 font-['Cairo'] relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Stats Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>أوسمة التميز والتفاعل الرياضي</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 font-bold">
                  {stats.earnedCount} من {stats.totalCount} مكتسبة
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                شارات تكريمية تُمنح تلقائياً تقديراً لنشاطك، تنظيمك للمباريات، واللعب النظيف
              </p>
            </div>
          </div>
        </div>

        {/* Level and XP Meter */}
        <div className="bg-[#050707] border border-white/10 rounded-2xl p-3 sm:px-4 sm:py-3 flex items-center gap-4 shrink-0 shadow-md">
          <div className="text-center sm:text-right">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black text-white">{stats.levelTitle}</span>
            </div>
            <span className="text-[10px] text-gray-400">
              المجموع: <strong className="text-amber-400 font-mono font-bold">{stats.totalXp} XP</strong> (المستوى التالي: {stats.nextLevelXp} XP)
            </span>
            <div className="w-36 sm:w-44 bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-gradient-to-r from-amber-400 to-[#00FFD2] h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black font-black text-xs flex flex-col items-center justify-center shadow-lg border border-amber-300 shrink-0">
            <span className="text-[9px] leading-none">LVL</span>
            <span className="text-base font-black leading-none mt-0.5">{stats.level}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 text-xs">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            filterCategory === 'all'
              ? 'bg-[#00FFD2] text-black shadow-md'
              : 'bg-[#050707] text-gray-400 hover:text-white border border-white/5'
          }`}
        >
          كافة الأوسمة ({badges.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('earned')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterCategory === 'earned'
              ? 'bg-amber-400 text-black shadow-md'
              : 'bg-[#050707] text-gray-400 hover:text-white border border-white/5'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>الأوسمة المكتسبة ({stats.earnedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('in_progress')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterCategory === 'in_progress'
              ? 'bg-[#ff2a5f] text-white shadow-md'
              : 'bg-[#050707] text-gray-400 hover:text-white border border-white/5'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>قيد الإنجاز ({stats.totalCount - stats.earnedCount})</span>
        </button>
      </div>

      {/* Share Notification Banner */}
      {shareNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shareNotice}</span>
        </div>
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredBadges.map((badge) => {
          const isFull = badge.currentProgress >= badge.targetProgress;
          const progressPercent = Math.min(100, Math.round((badge.currentProgress / badge.targetProgress) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-3xl border transition-all duration-300 text-right cursor-pointer relative group flex flex-col justify-between ${
                badge.isEarned
                  ? `bg-[#050707] hover:bg-[#090e0c] ${badge.borderColor} shadow-lg ${badge.bgGlow}`
                  : 'bg-[#050707]/60 border-white/5 hover:border-white/15 opacity-75 hover:opacity-100'
              }`}
            >
              <div>
                {/* Top Row: Icon & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md border ${
                      badge.isEarned
                        ? `bg-gradient-to-br ${badge.badgeColor} border-white/30 text-white`
                        : 'bg-white/5 border-white/10 grayscale'
                    }`}
                  >
                    <span>{badge.icon}</span>
                  </div>

                  {badge.isEarned ? (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      مكتمل ومفعّل
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      قيد الإنجاز
                    </span>
                  )}
                </div>

                {/* Badge Titles */}
                <h4 className="text-sm font-black text-white group-hover:text-[#00FFD2] transition-colors flex items-center gap-1.5">
                  <span>{badge.title}</span>
                </h4>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5 line-clamp-1">
                  {badge.subtitle}
                </p>

                <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Progress Bar & Rewards */}
              <div className="pt-3 mt-3 border-t border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400 font-medium">
                    الإنجاز: {badge.currentProgress}/{badge.targetProgress} {badge.unit}
                  </span>
                  <span className={`font-mono font-bold ${badge.isEarned ? 'text-amber-400' : 'text-gray-400'}`}>
                    +{badge.rewardXp} XP
                  </span>
                </div>

                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.isEarned
                        ? 'bg-gradient-to-r from-amber-400 to-[#00FFD2]'
                        : 'bg-gray-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {badge.earnedDate && (
                  <div className="text-[9px] text-gray-400 pt-0.5 flex items-center justify-between">
                    <span>تاريخ المنح:</span>
                    <span className="font-mono text-gray-300">{badge.earnedDate}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0d1211] border border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative space-y-5">
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-2 pt-2">
              <div
                className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-2xl border-2 ${
                  selectedBadge.isEarned
                    ? `bg-gradient-to-br ${selectedBadge.badgeColor} border-white/40`
                    : 'bg-white/5 border-white/10 grayscale'
                }`}
              >
                <span>{selectedBadge.icon}</span>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-1.5 bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>وسام رياضي معتمد</span>
                </div>
                <h3 className="text-xl font-black text-white">{selectedBadge.title}</h3>
                <p className="text-xs text-gray-400 font-bold">{selectedBadge.subtitle}</p>
              </div>
            </div>

            {/* Description & Criteria */}
            <div className="bg-[#050707] border border-white/10 rounded-2xl p-4 space-y-3 text-xs">
              <div>
                <strong className="text-gray-300 block mb-1">معايير استحقاق الوسام:</strong>
                <p className="text-gray-400 leading-relaxed">{selectedBadge.description}</p>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <div className="flex justify-between text-gray-300">
                  <span>معدل الإنجاز المطلوب:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedBadge.currentProgress} من {selectedBadge.targetProgress} {selectedBadge.unit}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>نقاط الخبرة (XP):</span>
                  <span className="font-mono font-bold text-amber-400">+{selectedBadge.rewardXp} XP</span>
                </div>
                {selectedBadge.earnedDate && (
                  <div className="flex justify-between text-gray-300">
                    <span>تاريخ الاستحقاق:</span>
                    <span className="font-mono text-emerald-400">{selectedBadge.earnedDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-1">
              {selectedBadge.isEarned ? (
                <button
                  type="button"
                  onClick={() => handleShareBadge(selectedBadge)}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg glow-primary cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة هذا الإنجاز عبر واتساب 📲</span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-gray-400">
                  واصل المشاركة في المباريات وتنسيق الحجوزات لتفعيل هذا الوسام قريباً! ⚽
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
