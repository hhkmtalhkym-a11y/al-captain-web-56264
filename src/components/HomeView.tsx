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
  Clock
} from 'lucide-react';
import {
  Playground,
  League,
  FriendlyMatch,
  Academy,
  PlayerCv,
  SyrianGovernorate,
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
  onOpenCreatePlayerCv
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

  return (
    <div id="view-home" className="space-y-8 animate-fadeIn pb-16">
      {/* Animated Hero Banner Slider */}
      <HeroBannerSlider onNavigateTab={onNavigateTab} featuredLeagues={leagues} />

      {/* Hero Welcome & Quick Stats */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#071310] via-[#0d1e19] to-[#071310] border-2 border-[#00FFD2]/30 p-6 sm:p-8 overflow-hidden glow-primary shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FFD2]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ff2a5f]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFD2]/15 text-[#00FFD2] text-xs font-bold border border-[#00FFD2]/40">
              <Sparkles className="w-3.5 h-3.5" />
              المنصة الرياضية الأولى لحجز الملاعب والبطولات في سوريا (0% عمولة)
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white font-['Cairo'] tracking-tight leading-tight">
              أهلاً بك يا كابتن في تطبيق <span className="text-[#00FFD2]">الكابتن</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              احجز ملاعب كرة القدم المفضلة لديك في كافة المحافظات السورية الـ 14، نظّم وشارك في البطولات الكروية، أطلق تحديات المباريات الودية، وانضم لأقوى الأكاديميات الرياضية بدفع كاش أو شام كاش.
            </p>

            {/* Live Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
                <div className="text-lg font-black text-[#00FFD2] font-mono">{playgrounds.length}</div>
                <div className="text-[10px] text-gray-400 font-bold">ملاعب معتمدة</div>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
                <div className="text-lg font-black text-amber-400 font-mono">{leagues.length}</div>
                <div className="text-[10px] text-gray-400 font-bold">بطولات كروية</div>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
                <div className="text-lg font-black text-[#ff2a5f] font-mono">{friendlyMatches.length}</div>
                <div className="text-[10px] text-gray-400 font-bold">تحديات مباريات</div>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
                <div className="text-lg font-black text-purple-400 font-mono">{academies.length}</div>
                <div className="text-[10px] text-gray-400 font-bold">أكاديميات تدريب</div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              id="btn-home-book-playground"
              onClick={() => onNavigateTab('playgrounds')}
              className="px-6 py-3.5 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs transition-all shadow-xl glow-primary flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>احجز ملعبك الآن</span>
            </button>

            <button
              id="btn-home-create-match"
              onClick={onOpenCreateMatch}
              className="px-6 py-3.5 rounded-2xl bg-[#ff2a5f] hover:bg-[#e02050] text-white font-bold text-xs transition-all shadow-xl glow-pink flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>انشر تحدي مباراة جديدة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Syrian 14 Governorates Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-['Cairo']">
            <MapPin className="w-4 h-4 text-[#00FFD2]" />
            اختر المحافظة السورية (تغطية كاملة لـ 14 محافظة):
          </h2>
          <span className="text-xs text-gray-400">
            المحافظة الحالية: <strong className="text-[#00FFD2]">{selectedGovernorate}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => onSelectGovernorate('الكل')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedGovernorate === 'الكل'
                ? 'bg-[#00FFD2] text-black font-black shadow-lg glow-primary'
                : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            كل المحافظات
          </button>
          {SYRIAN_GOVERNORATES.map((gov) => (
            <button
              key={gov}
              onClick={() => onSelectGovernorate(gov)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedGovernorate === gov
                  ? 'bg-[#00FFD2] text-black font-black shadow-lg glow-primary'
                  : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {gov}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Core Feature Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            id: 'playgrounds',
            title: 'الملاعب والحجوزات',
            desc: 'حجز فوري و 7 أيام',
            icon: Compass,
            color: 'text-[#00FFD2]',
            border: 'border-[#00FFD2]/30',
            bg: 'hover:bg-[#00FFD2]/10'
          },
          {
            id: 'leagues',
            title: 'البطولات والدوريات',
            desc: 'كؤوس وجوائز مالية',
            icon: Trophy,
            color: 'text-amber-400',
            border: 'border-amber-400/30',
            bg: 'hover:bg-amber-400/10'
          },
          {
            id: 'matches',
            title: 'المباريات الودية',
            desc: 'تحديات وتقاسم التكلفة',
            icon: Swords,
            color: 'text-[#ff2a5f]',
            border: 'border-[#ff2a5f]/30',
            bg: 'hover:bg-[#ff2a5f]/10'
          },
          {
            id: 'academies',
            title: 'الأكاديميات الرياضية',
            desc: 'مدارس كروية وباصات',
            icon: Users,
            color: 'text-purple-400',
            border: 'border-purple-400/30',
            bg: 'hover:bg-purple-400/10'
          },
          {
            id: 'scouting',
            title: 'كشاف المواهب (CV)',
            desc: 'بطاقة مهارات وإشارة كشفية',
            icon: Sparkles,
            color: 'text-blue-400',
            border: 'border-blue-400/30',
            bg: 'hover:bg-blue-400/10'
          },
          {
            id: 'map',
            title: 'الخريطة التفاعلية',
            desc: 'استكشاف الأقرب إليك',
            icon: MapPin,
            color: 'text-emerald-400',
            border: 'border-emerald-400/30',
            bg: 'hover:bg-emerald-400/10'
          }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateTab(item.id)}
              className={`bg-[#0d1211] border ${item.border} rounded-2xl p-4 text-right flex flex-col justify-between transition-all ${item.bg} group hover:scale-[1.02] shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl bg-black/40 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs font-['Cairo']">{item.title}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Featured Playgrounds Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-[#00FFD2] rounded-full"></div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Cairo']">
              أبرز الملاعب المتاحة للحجز ({filteredPlaygrounds.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('playgrounds')}
            className="text-xs text-[#00FFD2] hover:underline font-bold flex items-center gap-1"
          >
            <span>عرض كل الملاعب</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlaygrounds.slice(0, 3).map((pg) => (
            <PlaygroundCard
              key={pg.id}
              playground={pg}
              onViewDetails={onViewPlayground}
              onBookNow={onBookPlayground}
            />
          ))}
        </div>
      </div>

      {/* Live Tournaments Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-amber-400 rounded-full"></div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Cairo']">
              البطولات والدوريات النشطة ({filteredLeagues.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('leagues')}
            className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>عرض كل البطولات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeagues.slice(0, 3).map((lg) => (
            <LeagueCard key={lg.id} league={lg} onViewDetails={onViewLeague} />
          ))}
        </div>
      </div>

      {/* Recent Friendly Challenges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-[#ff2a5f] rounded-full"></div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Cairo']">
              تحديات المباريات الودية المفتوحة ({filteredMatches.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('matches')}
            className="text-xs text-[#ff2a5f] hover:underline font-bold flex items-center gap-1"
          >
            <span>عرض كل المباريات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMatches.slice(0, 3).map((match) => (
            <MatchChallengeCard
              key={match.id}
              match={match}
              currentUser={currentUser}
              onJoinChallenge={onJoinChallenge}
            />
          ))}
        </div>
      </div>

      {/* Support & Admin Hotline Banner */}
      <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-right">
          <div className="w-12 h-12 rounded-2xl bg-[#00FFD2]/10 border border-[#00FFD2]/40 flex items-center justify-center text-[#00FFD2] shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm font-['Cairo']">
              مركز الدعم الفني وإدارة الملاعب السورية
            </h4>
            <p className="text-xs text-gray-400">
              للاستفسارات وتنظيم البطولات الكبرى وإضافة الملاعب الجديدة: +963 945688090 | family2016amer@gmail.com
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              openWhatsAppShare(
                'مرحباً فريق دعم تطبيق الكابتن، أود الاستفسار بخصوص خدمات المنصة.',
                '0945688090'
              )
            }
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg"
          >
            <span>محادثة واتساب</span>
          </button>
        </div>
      </div>
    </div>
  );
}
