import React, { useState, useMemo } from 'react';
import {
  Compass,
  Trophy,
  Swords,
  Users,
  Sparkles,
  MapPin,
  Calendar,
  Shield,
  Plus,
  ArrowLeft,
  Search,
  CheckCircle2,
  Phone,
  Flame,
  Star,
  Clock,
  Navigation,
  Activity,
  Layers,
  AlertTriangle,
  BellRing,
  ExternalLink,
  X
} from 'lucide-react';
import {
  Playground,
  League,
  FriendlyMatch,
  Academy,
  PlayerCv,
  UserProfile,
  Booking
} from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';
import { isUserAdmin, isUserAdvertiser } from '../utils/permissions';
import { checkUpcoming24HourBookings, Upcoming24HourBookingAlert } from '../utils/bookingReminderService';
import PlaygroundCard from './PlaygroundCard';
import LeagueCard from './LeagueCard';
import MatchChallengeCard from './MatchChallengeCard';
import HeroBannerSlider from './HeroBannerSlider';

interface HomeViewProps {
  playgrounds: Playground[];
  leagues: League[];
  friendlyMatches: FriendlyMatch[];
  academies: Academy[];
  playerCvs: PlayerCv[];
  bookings?: Booking[];
  currentUser: UserProfile;
  selectedGovernorate: string;
  onSelectGovernorate: (gov: string) => void;
  onNavigateTab: (tabId: any) => void;
  onViewPlayground: (pg: Playground) => void;
  onBookPlayground: (pg: Playground) => void;
  onViewLeague: (l: League) => void;
  onJoinChallenge: (m: FriendlyMatch) => void;
  onOpenCreatePlayground: () => void;
  onOpenCreateMatch: () => void;
  onOpenCreateLeague: () => void;
  onOpenCreatePlayerCv: () => void;
  onEditPlayground?: (pg: Playground) => void;
  onDeletePlayground?: (id: string) => void;
  onEditLeague?: (l: League) => void;
  onDeleteLeague?: (id: string) => void;
  onEditMatch?: (m: FriendlyMatch) => void;
  onDeleteMatch?: (id: string) => void;
}

export default function HomeView({
  playgrounds,
  leagues,
  friendlyMatches,
  academies,
  playerCvs,
  bookings = [],
  currentUser,
  selectedGovernorate,
  onSelectGovernorate,
  onNavigateTab,
  onViewPlayground,
  onBookPlayground,
  onViewLeague,
  onJoinChallenge,
  onOpenCreatePlayground,
  onOpenCreateMatch,
  onOpenCreateLeague,
  onOpenCreatePlayerCv,
  onEditPlayground,
  onDeletePlayground,
  onEditLeague,
  onDeleteLeague,
  onEditMatch,
  onDeleteMatch
}: HomeViewProps) {
  const [dismissedAlertKeys, setDismissedAlertKeys] = useState<string[]>([]);

  // 24-Hour Upcoming Confirmed Bookings Detection
  const upcoming24hAlerts = useMemo(() => {
    const alerts = checkUpcoming24HourBookings(bookings, currentUser, playgrounds);
    return alerts.filter((a) => !dismissedAlertKeys.includes(`${a.booking.id}-${a.dateStr}`));
  }, [bookings, currentUser, playgrounds, dismissedAlertKeys]);
  // Filter items by governorate if needed
  const filteredPlaygrounds =
    selectedGovernorate === 'الكل'
      ? playgrounds
      : playgrounds.filter((p) => p.governorate === selectedGovernorate);

  const filteredMatches =
    selectedGovernorate === 'الكل'
      ? friendlyMatches
      : friendlyMatches.filter((m) => m.governorate === selectedGovernorate);

  const filteredLeagues =
    selectedGovernorate === 'الكل'
      ? leagues
      : leagues.filter((l) => l.governorate === selectedGovernorate);

  const isAdmin = currentUser.isAdmin || currentUser.role === 'admin';

  return (
    <div id="view-home" className="space-y-6 animate-fadeIn pb-16 font-['Cairo']">
      {/* 24-Hour Upcoming Confirmed Match Alert (تنبيه حجز مؤكد خلال أقل من 24 ساعة مع زر خرائط Google) */}
      {upcoming24hAlerts.length > 0 && (
        <div className="space-y-3">
          {upcoming24hAlerts.map((alert) => {
            const alertKey = `${alert.booking.id}-${alert.dateStr}`;
            return (
              <div
                key={alertKey}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1f19] via-[#091512] to-[#181308] border-2 border-[#00FFD2]/60 p-4 sm:p-5 shadow-2xl shadow-[#00FFD2]/10 glow-primary transition-all animate-fadeIn"
              >
                {/* Background decorative glow */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#00FFD2]/10 rounded-full blur-2xl pointer-events-none -translate-x-10 -translate-y-10" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none translate-x-10 translate-y-10" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#00FFD2]/15 border border-[#00FFD2]/40 flex items-center justify-center shrink-0 text-[#00FFD2] shadow-lg shadow-[#00FFD2]/20">
                      <BellRing className="w-6 h-6 animate-bounce" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#ff2a5f] text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
                          🚨 موعد حجز مؤكد يقترب (خلال 24 ساعة)
                        </span>
                        <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {alert.hoursRemaining > 0
                              ? `متبقي ${alert.hoursRemaining} ساعة و ${alert.minutesRemaining} دقيقة`
                              : `متبقي ${alert.minutesRemaining} دقيقة فقط!`}
                          </span>
                        </span>
                        {alert.isToday && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            اليوم ⚽
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
                        <span>مباراتك في:</span>
                        <span className="text-[#00FFD2] underline decoration-[#00FFD2]/40 underline-offset-4">
                          {alert.booking.playgroundName}
                        </span>
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-gray-300 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#00FFD2]" />
                          <span>التاريخ: {alert.dateStr}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>التوقيت: {alert.timeSlot}</span>
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>{alert.booking.governorate} - {alert.booking.detailedArea}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons including Google Maps */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                    <a
                      href={alert.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer group"
                      title="فتح موقع الملعب المباشر عبر تطبيق أو موقع خرائط Google"
                    >
                      <Navigation className="w-4 h-4 group-hover:rotate-45 transition-transform text-black" />
                      <span>موقع الملعب عبر Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onNavigateTab('bookings')}
                      className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>عرض التذكرة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDismissedAlertKeys((prev) => [...prev, alertKey])}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="إخفاء التنبيه مؤقتاً"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Animated Hero Banner Slider with Natural Colors & Admin Controls */}
      <HeroBannerSlider
        onNavigateTab={onNavigateTab}
        featuredLeagues={leagues}
        isAdmin={isAdmin}
      />

      {/* 2. The 4x2 Grid of Main Sections (شبكة أقسام المنصة 4*2 المتناسقة) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs sm:text-base font-black text-white flex items-center gap-1.5 font-['Cairo']">
            <Layers className="w-4 h-4 text-[#00FFD2]" />
            <span>أقسام المنصة الرئيسية (شبكة 4×2)</span>
          </h2>
          {isAdmin && (
            <span className="text-[9px] sm:text-[10px] text-[#ff2a5f] bg-[#ff2a5f]/15 px-2 py-0.5 rounded-full border border-[#ff2a5f]/30 font-bold">
              صلاحية الإدارة مفعلة
            </span>
          )}
        </div>

        {/* 4x2 Grid Layout: 2 cols on mobile (4 rows), 4 cols on tablet and desktop (2 rows) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3.5">
          {/* Card 1: Playgrounds */}
          <div
            onClick={() => onNavigateTab('playgrounds')}
            className="bg-[#0d1211] border border-[#00FFD2]/30 hover:border-[#00FFD2] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[#00FFD2]/10 text-[#00FFD2] border border-[#00FFD2]/20 shrink-0">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-black/60 text-[#00FFD2] px-1.5 sm:px-2 py-0.5 rounded-full border border-[#00FFD2]/30 whitespace-nowrap">
                {filteredPlaygrounds.length} ملعب
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[11px] sm:text-sm group-hover:text-[#00FFD2] transition-colors leading-tight break-words">
                الملاعب والحجوزات
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                حجز فوري لملاعب العشب الطبيعي والصناعي في كافة المحافظات بأسعار موحدة 0% عمولة.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-[#00FFD2] font-bold">
              <span>تصفح الملاعب</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Leagues */}
          <div
            onClick={() => onNavigateTab('leagues')}
            className="bg-[#0d1211] border border-amber-400/30 hover:border-amber-400 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-black/60 text-amber-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-400/30 whitespace-nowrap">
                {filteredLeagues.length} بطولة
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[11px] sm:text-sm group-hover:text-amber-400 transition-colors leading-tight break-words">
                البطولات والدوريات
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                بطولات كروية رسمية، جوائز نقدية، جداول الترتيب وإدارة كاملة لنتائج المباريات.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-amber-400 font-bold">
              <span>استكشف الدوريات</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Friendly Matches */}
          <div
            onClick={() => onNavigateTab('matches')}
            className="bg-[#0d1211] border border-[#ff2a5f]/30 hover:border-[#ff2a5f] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[#ff2a5f]/10 text-[#ff2a5f] border border-[#ff2a5f]/20 shrink-0">
                <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-black/60 text-[#ff2a5f] px-1.5 sm:px-2 py-0.5 rounded-full border border-[#ff2a5f]/30 whitespace-nowrap">
                {filteredMatches.length} تحدي
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[11px] sm:text-sm group-hover:text-[#ff2a5f] transition-colors leading-tight break-words">
                المباريات والتحديات
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                انشر تحدي أو اقبل مباراة مع فرق أخرى مع تقاسم تكلفة إيجار الملعب بسهولة.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-[#ff2a5f] font-bold">
              <span>عرض التحديات</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Academies */}
          <div
            onClick={() => onNavigateTab('academies')}
            className="bg-[#0d1211] border border-purple-400/30 hover:border-purple-400 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-purple-400/10 text-purple-400 border border-purple-400/20 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-black/60 text-purple-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-purple-400/30 whitespace-nowrap">
                {academies.length} أكاديمية
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[11px] sm:text-sm group-hover:text-purple-400 transition-colors leading-tight break-words">
                الأكاديميات والمدارس
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                تسجيل الفئات العمرية والناشئين في كبرى الأكاديميات الكروية بإشراف مدربين معتمدين.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-purple-400 font-bold">
              <span>تصفح الأكاديميات</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Scouting CV */}
          <div
            onClick={() => onNavigateTab('scouting')}
            className="bg-[#0d1211] border border-blue-400/30 hover:border-blue-400 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-400/10 text-blue-400 border border-blue-400/20 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-black/60 text-blue-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-400/30 whitespace-nowrap">
                {playerCvs.length} بطاقة
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[11px] sm:text-sm group-hover:text-blue-400 transition-colors leading-tight break-words">
                كشاف المواهب (CV)
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                أنشئ سيرتك الذاتية الرياضية (CV)، بطاقة المهارات، وعروضك للكشافين والأندية.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-blue-400 font-bold">
              <span>كشاف المواهب</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Google Maps & Directions */}
          <div
            onClick={() => onNavigateTab('map')}
            className="bg-[#0d1211] border border-emerald-400/30 hover:border-emerald-400 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 shrink-0">
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-bold bg-black/60 text-emerald-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-400/30 whitespace-nowrap">
                الخرائط
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[11px] sm:text-sm group-hover:text-emerald-400 transition-colors leading-tight break-words">
                الخريطة والاتجاهات
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                استكشف الملاعب القريبة منك مع رسم مسار الاتجاهات المباشر من موقعك إلى الملعب.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-emerald-400 font-bold">
              <span>فتح الخريطة التفاعلية</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 7: Profile & Team Builder */}
          <div
            onClick={() => onNavigateTab('profile')}
            className="bg-[#0d1211] border border-cyan-400/30 hover:border-cyan-400 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shrink-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-bold bg-black/60 text-cyan-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-cyan-400/30 whitespace-nowrap">
                حسابي
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[11px] sm:text-sm group-hover:text-cyan-400 transition-colors leading-tight break-words">
                الملف وإدارة الفرق
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                تعديل بيانات اللاعب، متابعة الحجوزات، تشكيل الفرق وتأكيد ألوان الأطقم.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-cyan-400 font-bold">
              <span>عرض الملف الشخصي</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 8: Admin / Advertiser / Notification Hub (8th Grid Item) */}
          {isUserAdmin(currentUser) ? (
            <div
              onClick={() => onNavigateTab('admin')}
              className="bg-[#0d1211] border border-rose-500/30 hover:border-rose-500 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold bg-black/60 text-rose-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-rose-500/30 whitespace-nowrap">
                  لوحة الإدارة
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-[11px] sm:text-sm group-hover:text-rose-400 transition-colors leading-tight break-words">
                  لوحة التحكم والإدارة
                </h3>
                <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                  صلاحيات الإدارة المركزية والتحكم الشامل في كافة الملاعب والدوريات والبيانات.
                </p>
              </div>
              <div className="hidden sm:flex mt-3 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-rose-400 font-bold">
                <span>دخول لوحة الإدارة</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          ) : isUserAdvertiser(currentUser) ? (
            <div
              onClick={() => onNavigateTab('profile')}
              className="bg-[#0d1211] border border-amber-400/30 hover:border-amber-400 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold bg-black/60 text-amber-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-400/30 whitespace-nowrap">
                  لوحة المعلن
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-[11px] sm:text-sm group-hover:text-amber-400 transition-colors leading-tight break-words">
                  إدارة ملعبي وحجوزاتي
                </h3>
                <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                  لوحة تحكم خاصة لأصحاب الملاعب والمعلنين لإدارة الحجوزات وتأكيد الدفع.
                </p>
              </div>
              <div className="hidden sm:flex mt-3 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-amber-400 font-bold">
                <span>إدارة الملاعب</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          ) : (
            <div
              onClick={() => onNavigateTab('profile')}
              className="bg-[#0d1211] border border-teal-400/30 hover:border-teal-400 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-teal-400/10 text-teal-400 border border-teal-400/20 shrink-0">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold bg-black/60 text-teal-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-teal-400/30 whitespace-nowrap">
                  الحجوزات
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-[11px] sm:text-sm group-hover:text-teal-400 transition-colors leading-tight break-words">
                  متابعة الحجوزات والأنشطة
                </h3>
                <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                  تتبع حجوزاتك، إشعارات المباريات المقبولة، وإيصالات الدفع الفورية.
                </p>
              </div>
              <div className="hidden sm:flex mt-3 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-teal-400 font-bold">
                <span>عرض الأنشطة</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Section: On Mobile, only 3x3 tabs are shown. Featured lists below are shown on tablet & desktop */}
      <div className="hidden sm:block space-y-6 pt-2">
        {/* 5. Featured Playgrounds Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 bg-[#00FFD2] rounded-full"></div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                أبرز الملاعب المتاحة للحجز ({filteredPlaygrounds.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('playgrounds')}
              className="text-xs text-[#00FFD2] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>عرض كل الملاعب</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaygrounds.slice(0, 3).map((pg) => (
              <PlaygroundCard
                key={pg.id}
                playground={pg}
                bookings={bookings}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onViewDetails={onViewPlayground}
                onBookNow={onBookPlayground}
                onEditPlayground={onEditPlayground}
                onDeletePlayground={onDeletePlayground}
              />
            ))}
          </div>
        </div>

        {/* 6. Active Leagues & Championships */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 bg-amber-400 rounded-full"></div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                البطولات والدوريات الكروية ({filteredLeagues.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('leagues')}
              className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>عرض كل البطولات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeagues.slice(0, 3).map((lg) => (
              <LeagueCard
                key={lg.id}
                league={lg}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onViewDetails={onViewLeague}
                onEditLeague={onEditLeague}
                onDeleteLeague={onDeleteLeague}
              />
            ))}
          </div>
        </div>

        {/* 7. Friendly Match Challenges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 bg-[#ff2a5f] rounded-full"></div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                أحدث تحديات المباريات الودية ({filteredMatches.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('matches')}
              className="text-xs text-[#ff2a5f] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>عرض كل المباريات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.slice(0, 3).map((m) => (
              <MatchChallengeCard
                key={m.id}
                match={m}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onJoinChallenge={onJoinChallenge}
                onEditMatch={onEditMatch}
                onDeleteMatch={onDeleteMatch}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
