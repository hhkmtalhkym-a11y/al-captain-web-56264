import React from 'react';
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
  AlertTriangle
} from 'lucide-react';
import {
  Playground,
  League,
  FriendlyMatch,
  Academy,
  PlayerCv,
  UserProfile
} from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';
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
  onDeletePlayground?: (id: string) => void;
  onDeleteLeague?: (id: string) => void;
  onDeleteMatch?: (id: string) => void;
}

export default function HomeView({
  playgrounds,
  leagues,
  friendlyMatches,
  academies,
  playerCvs,
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
  onDeletePlayground,
  onDeleteLeague,
  onDeleteMatch
}: HomeViewProps) {
  // Filter items by governorate
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
      {/* 1. Animated Hero Banner Slider with Natural Colors & Admin Controls */}
      <HeroBannerSlider
        onNavigateTab={onNavigateTab}
        featuredLeagues={leagues}
        isAdmin={isAdmin}
      />

      {/* 2. Syrian 14 Governorates Horizontal Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#00FFD2]" />
            <span>اختر المحافظة السورية:</span>
          </h2>
          <span className="text-[10px] sm:text-xs text-gray-400">
            المحددة: <strong className="text-[#00FFD2] font-bold">{selectedGovernorate}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => onSelectGovernorate('الكل')}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedGovernorate === 'الكل'
                ? 'bg-[#00FFD2] text-black font-black shadow-md'
                : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            كل المحافظات (14)
          </button>
          {SYRIAN_GOVERNORATES.map((gov) => (
            <button
              key={gov}
              onClick={() => onSelectGovernorate(gov)}
              className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedGovernorate === gov
                  ? 'bg-[#00FFD2] text-black font-black shadow-md'
                  : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {gov}
            </button>
          ))}
        </div>
      </div>

      {/* 3. The 3x3 Grid of Main Sections (شبكة الأقسام 3*3 المتناسقة على الجوال والديسكتوب) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs sm:text-base font-black text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#00FFD2]" />
            <span>أقسام المنصة الرئيسية (شبكة 3×3)</span>
          </h2>
          {isAdmin && (
            <span className="text-[9px] sm:text-[10px] text-[#ff2a5f] bg-[#ff2a5f]/15 px-2 py-0.5 rounded-full border border-[#ff2a5f]/30 font-bold">
              صلاحية الإدارة مفعلة
            </span>
          )}
        </div>

        {/* 3x3 Grid: 3 columns on mobile, 3 columns on tablet/desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3.5">
          {/* Card 1: Playgrounds */}
          <div
            onClick={() => onNavigateTab('playgrounds')}
            className="bg-[#0d1211] border border-[#00FFD2]/30 hover:border-[#00FFD2] rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#00FFD2]/10 text-[#00FFD2] border border-[#00FFD2]/20 shrink-0">
                <Compass className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-black/60 text-[#00FFD2] px-1.5 sm:px-2 py-0.5 rounded-full border border-[#00FFD2]/30 whitespace-nowrap">
                {filteredPlaygrounds.length} ملعب
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[10px] sm:text-sm group-hover:text-[#00FFD2] transition-colors leading-tight break-words">
                الملاعب والحجوزات
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                حجز فوري لملاعب العشب الطبيعي والصناعي في كافة المحافظات بأسعار موحدة 0% عمولة.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2.5 border-t border-white/5 items-center justify-between text-[11px] text-[#00FFD2] font-bold">
              <span>تصفح الملاعب</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Leagues */}
          <div
            onClick={() => onNavigateTab('leagues')}
            className="bg-[#0d1211] border border-amber-400/30 hover:border-amber-400 rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-black/60 text-amber-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-400/30 whitespace-nowrap">
                {filteredLeagues.length} بطولة
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[10px] sm:text-sm group-hover:text-amber-400 transition-colors leading-tight break-words">
                البطولات والدوريات
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                بطولات كروية رسمية، جوائز نقدية، جداول الترتيب وإدارة كاملة لنتائج المباريات.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2.5 border-t border-white/5 items-center justify-between text-[11px] text-amber-400 font-bold">
              <span>استكشف الدوريات</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Friendly Matches */}
          <div
            onClick={() => onNavigateTab('matches')}
            className="bg-[#0d1211] border border-[#ff2a5f]/30 hover:border-[#ff2a5f] rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#ff2a5f]/10 text-[#ff2a5f] border border-[#ff2a5f]/20 shrink-0">
                <Swords className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-black/60 text-[#ff2a5f] px-1.5 sm:px-2 py-0.5 rounded-full border border-[#ff2a5f]/30 whitespace-nowrap">
                {filteredMatches.length} تحدي
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[10px] sm:text-sm group-hover:text-[#ff2a5f] transition-colors leading-tight break-words">
                المباريات والتحديات
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                انشر تحدي أو اقبل مباراة مع فرق أخرى مع تقاسم تكلفة إيجار الملعب بسهولة.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2.5 border-t border-white/5 items-center justify-between text-[11px] text-[#ff2a5f] font-bold">
              <span>عرض التحديات</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Academies */}
          <div
            onClick={() => onNavigateTab('academies')}
            className="bg-[#0d1211] border border-purple-400/30 hover:border-purple-400 rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-purple-400/10 text-purple-400 border border-purple-400/20 shrink-0">
                <Users className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-black/60 text-purple-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-purple-400/30 whitespace-nowrap">
                {academies.length} أكاديمية
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[10px] sm:text-sm group-hover:text-purple-400 transition-colors leading-tight break-words">
                الأكاديميات والمدارس
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                تسجيل الفئات العمرية والناشئين في كبرى الأكاديميات الكروية بإشراف مدربين معتمدين.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2.5 border-t border-white/5 items-center justify-between text-[11px] text-purple-400 font-bold">
              <span>تصفح الأكاديميات</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Scouting CV */}
          <div
            onClick={() => onNavigateTab('scouting')}
            className="bg-[#0d1211] border border-blue-400/30 hover:border-blue-400 rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-400/10 text-blue-400 border border-blue-400/20 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-black/60 text-blue-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-400/30 whitespace-nowrap">
                {playerCvs.length} بطاقة
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[10px] sm:text-sm group-hover:text-blue-400 transition-colors leading-tight break-words">
                كشاف المواهب (CV)
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                أنشئ سيرتك الذاتية الرياضية (CV)، بطاقة المهارات، وعروضك للكشافين والأندية.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2.5 border-t border-white/5 items-center justify-between text-[11px] text-blue-400 font-bold">
              <span>كشاف المواهب</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Google Maps & Directions */}
          <div
            onClick={() => onNavigateTab('map')}
            className="bg-[#0d1211] border border-emerald-400/30 hover:border-emerald-400 rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 shrink-0">
                <Navigation className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-bold bg-black/60 text-emerald-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-400/30 whitespace-nowrap">
                الخرائط
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[10px] sm:text-sm group-hover:text-emerald-400 transition-colors leading-tight break-words">
                الخريطة والاتجاهات
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                استكشف الملاعب القريبة منك مع رسم مسار الاتجاهات المباشر من موقعك إلى الملعب.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2.5 border-t border-white/5 items-center justify-between text-[11px] text-emerald-400 font-bold">
              <span>فتح الخريطة التفاعلية</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 7: Team Builder & Squads */}
          <div
            onClick={() => onNavigateTab('profile')}
            className="bg-[#0d1211] border border-cyan-400/30 hover:border-cyan-400 rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shrink-0">
                <Activity className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-bold bg-black/60 text-cyan-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-cyan-400/30 whitespace-nowrap">
                حسابي
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[10px] sm:text-sm group-hover:text-cyan-400 transition-colors leading-tight break-words">
                الملف وإدارة الفرق
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                تعديل بيانات اللاعب، متابعة الحجوزات، تشكيل الفرق وتأكيد ألوان الأطقم.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2.5 border-t border-white/5 items-center justify-between text-[11px] text-cyan-400 font-bold">
              <span>عرض الملف الشخصي</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 8: Padel & Multi-sports */}
          <div
            onClick={() => onNavigateTab('playgrounds')}
            className="bg-[#0d1211] border border-yellow-400/30 hover:border-yellow-400 rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 shrink-0">
                <Flame className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-bold bg-black/60 text-yellow-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-yellow-400/30 whitespace-nowrap">
                صالات وبادل
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[10px] sm:text-sm group-hover:text-yellow-400 transition-colors leading-tight break-words">
                صالات وبادل وتنس
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                حجز ملاعب البادل الحديثة، الصالات المغلقة، وملاعب التنس في مختلف المدن.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2.5 border-t border-white/5 items-center justify-between text-[11px] text-yellow-400 font-bold">
              <span>استكشاف الملاعب المتنوعة</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 9: Admin & Organizers Portal */}
          <div
            onClick={() => onNavigateTab('profile')}
            className="bg-[#0d1211] border border-rose-500/30 hover:border-rose-500 rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer flex flex-col justify-between relative overflow-hidden text-center sm:text-right"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-bold bg-black/60 text-rose-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-rose-500/30 whitespace-nowrap">
                لوحة التحكم
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[10px] sm:text-sm group-hover:text-rose-400 transition-colors leading-tight break-words">
                لوحة المنظمين والتحكم
              </h3>
              <p className="hidden sm:block text-[11px] text-gray-400 mt-1 line-clamp-2">
                صلاحيات خاصة لمنظم الدوري (ownerId) لإدارة المباريات، مع تحكم الأدمن الشامل.
              </p>
            </div>
            <div className="hidden sm:flex mt-3 pt-2.5 border-t border-white/5 items-center justify-between text-[11px] text-rose-400 font-bold">
              <span>دخول لوحة التحكم</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
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
                currentUser={currentUser}
                isAdmin={isAdmin}
                onViewDetails={onViewPlayground}
                onBookNow={onBookPlayground}
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
                onDeleteMatch={onDeleteMatch}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
