import React, { useState } from 'react';
import {
  Shield,
  BarChart3,
  Calendar,
  Trophy,
  Users,
  Swords,
  DollarSign,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  FileSpreadsheet,
  FileText,
  Award,
  Archive,
  AlertTriangle,
  Settings,
  Lock,
  Unlock,
  Eye,
  PieChart,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  Playground,
  Booking,
  League,
  Academy,
  AcademyRegistration,
  RegistrationStatus,
  PaymentStatus,
  FriendlyMatch,
  MatchStatus,
  PlayerCv,
  BookingStatus,
  SyrianGovernorate,
  ObjectionCase
} from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { formatSYP, exportBookingsCsv, exportLeaguePdf, exportToExcel, openWhatsAppShare } from '../utils/helpers';

interface AdminDashboardProps {
  playgrounds: Playground[];
  bookings: Booking[];
  leagues: League[];
  academies: Academy[];
  academyRegistrations?: AcademyRegistration[];
  friendlyMatches: FriendlyMatch[];
  playerCvs: PlayerCv[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  onUpdateAcademyRegistrationStatus?: (regId: string, status: RegistrationStatus, rejectionReason?: string) => void;
  onUpdateAcademyRegistrationPaymentStatus?: (regId: string, paymentStatus: PaymentStatus) => void;
  onUpdateFriendlyMatchStatus?: (matchId: string, status: MatchStatus, rejectionReason?: string) => void;
  onDeletePlayground: (id: string) => void;
  onDeleteLeague: (id: string) => void;
  onDeleteMatch: (id: string) => void;
  onOpenCreatePlayground: () => void;
  onOpenCreateLeague: () => void;
  onOpenCreateAcademy: () => void;
  onOpenCreateMatch: () => void;
}

type AdminTab =
  | 'overview'
  | 'charts'
  | 'bookings'
  | 'playgrounds'
  | 'leagues'
  | 'matches'
  | 'academies'
  | 'scouting'
  | 'users'
  | 'objections'
  | 'settings';

export default function AdminDashboard({
  playgrounds,
  bookings,
  leagues,
  academies,
  academyRegistrations = [],
  friendlyMatches,
  playerCvs,
  onUpdateBookingStatus,
  onUpdateAcademyRegistrationStatus,
  onUpdateAcademyRegistrationPaymentStatus,
  onUpdateFriendlyMatchStatus,
  onDeletePlayground,
  onDeleteLeague,
  onDeleteMatch,
  onOpenCreatePlayground,
  onOpenCreateLeague,
  onOpenCreateAcademy,
  onOpenCreateMatch
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedGov, setSelectedGov] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [shamCashAdminAccount, setShamCashAdminAccount] = useState('SHAM-9456-8809');
  const [isSavedSettings, setIsSavedSettings] = useState(false);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  const [rejectionModalData, setRejectionModalData] = useState<{
    id: string;
    type: 'academy_registration' | 'friendly_match';
    name: string;
    phone: string;
  } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Academy sub-tab: 'academies_list' | 'registrations_list'
  const [academySubTab, setAcademySubTab] = useState<'registrations' | 'academies'>('registrations');
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState<string>('الكل');
  const [matchStatusFilter, setMatchStatusFilter] = useState<string>('الكل');

  // Mock Users management list
  const [usersList, setUsersList] = useState([
    {
      id: 'u-1',
      name: 'كابتن عامر (المدير العام)',
      phone: '0945688090',
      email: 'family2016amer@gmail.com',
      governorate: 'دمشق',
      role: 'admin',
      isBanned: false,
      bookingsCount: 28
    },
    {
      id: 'u-2',
      name: 'كابتن حكمت الحكيم',
      phone: '0933112233',
      email: 'hhkmtalhkym@gmail.com',
      governorate: 'دمشق',
      role: 'captain',
      isBanned: false,
      bookingsCount: 14
    },
    {
      id: 'u-3',
      name: 'كابتن مجد الشامي',
      phone: '0988776655',
      email: 'majd@kaptan.sy',
      governorate: 'حلب',
      role: 'captain',
      isBanned: false,
      bookingsCount: 9
    },
    {
      id: 'u-4',
      name: 'كابتن وسيم حمصي',
      phone: '0955443322',
      email: 'waseem@kaptan.sy',
      governorate: 'حمص',
      role: 'captain',
      isBanned: false,
      bookingsCount: 6
    },
    {
      id: 'u-5',
      name: 'كابتن تيم اللاذقية',
      phone: '0944118833',
      email: 'taym@kaptan.sy',
      governorate: 'اللاذقية',
      role: 'captain',
      isBanned: false,
      bookingsCount: 11
    }
  ]);

  // Mock Objections list
  const [objectionsList, setObjectionsList] = useState<ObjectionCase[]>([
    {
      id: 'obj-1',
      leagueId: 'lg-1',
      leagueName: 'بطولة دمشق الكبرى للصالات 2026',
      matchId: 'm-1',
      submittingTeam: 'فريق الفرسان',
      targetTeam: 'فريق النسور',
      reason: 'مشاركة لاعب غير مقيد في كشوفات الفريق الرسمية خلال الشوط الثاني.',
      evidenceDetails: 'صورة هوية اللاعب ومطابقتها مع كشف الاتحاد المحلي.',
      depositFeePaid: 50000,
      status: 'قيد المراجعة',
      createdAt: '2026-06-18'
    },
    {
      id: 'obj-2',
      leagueId: 'lg-2',
      leagueName: 'دوري أبطال حلب الصيفي',
      matchId: 'm-2',
      submittingTeam: 'فريق الشهباء',
      targetTeam: 'فريق القلعة',
      reason: 'خطأ تحكيمي فادح في احتساب ركلة جزاء في الدقيقة 94 بعد انتهاء الوقت بدل الضائع.',
      evidenceDetails: 'تسجيل الفيديو المعتمد للمباراة.',
      depositFeePaid: 50000,
      status: 'قيد المراجعة',
      createdAt: '2026-06-20'
    }
  ]);

  // Statistics
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.status !== 'ملغي' ? b.totalPrice : 0),
    0
  );
  const confirmedBookingsCount = bookings.filter((b) => b.status === 'مؤكد').length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'قيد الانتظار').length;

  const handleResolveObjection = (
    id: string,
    decision: 'قبول وتعديل النتيجة' | 'رفض الاعتراض' | 'إعادة جدولة المباراة',
    notes: string
  ) => {
    setObjectionsList((prev) =>
      prev.map((obj) =>
        obj.id === id
          ? {
              ...obj,
              status: decision === 'رفض الاعتراض' ? 'مرفوض' : 'مقبول',
              adminDecisionNotes: notes
            }
          : obj
      )
    );
  };

  const handleToggleBanUser = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: !u.isBanned } : u))
    );
  };

  const handleExportAllData = () => {
    const summaryData = [
      { 'القسم': 'إجمالي الملاعب', 'العدد / القيمة': playgrounds.length },
      { 'القسم': 'إجمالي الحجوزات', 'العدد / القيمة': bookings.length },
      { 'القسم': 'الحجوزات المؤكدة', 'العدد / القيمة': confirmedBookingsCount },
      { 'القسم': 'إجمالي البطولات', 'العدد / القيمة': leagues.length },
      { 'القسم': 'إجمالي المباريات الودية', 'العدد / القيمة': friendlyMatches.length },
      { 'القسم': 'إجمالي الأكاديميات', 'العدد / القيمة': academies.length },
      { 'القسم': 'إجمالي بطاقات اللاعبين', 'العدد / القيمة': playerCvs.length },
      { 'القسم': 'إجمالي المداخيل المسجلة (ل.س)', 'العدد / القيمة': totalRevenue }
    ];
    exportToExcel(summaryData, 'Al-Kaptan-Platform-Master-Report');
  };

  return (
    <div id="admin-dashboard-view" className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="bg-[#0d1211] border-2 border-[#ff2a5f]/40 rounded-3xl p-6 sm:p-8 glow-pink relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff2a5f]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-[#ff2a5f] text-white font-black text-xs">
                لوحة الإدارة المركزية
              </span>
              <span className="text-xs text-gray-400 font-mono">
                حساب الأدمن المعتمد: family2016amer@gmail.com (0945688090)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Cairo']">
              لوحة التحكم والسيطرة الشاملة - تطبيق الكابتن
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              إدارة الملاعب والحجوزات والدوريات والاعتراضات والمستخدمين في المحافظات الـ 14 بدون أي عمولة (0%)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAllData}
              className="px-4 py-2.5 rounded-xl bg-[#050707] hover:bg-white/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              تصدير التقرير الشامل Excel
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">إجمالي الملاعب</span>
          <strong className="text-xl font-bold text-[#00FFD2] font-mono">{playgrounds.length}</strong>
        </div>

        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">الحجوزات المؤكدة</span>
          <strong className="text-xl font-bold text-emerald-400 font-mono">{confirmedBookingsCount}</strong>
        </div>

        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">طلبات بالانتظار</span>
          <strong className="text-xl font-bold text-amber-400 font-mono">{pendingBookingsCount}</strong>
        </div>

        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">البطولات والدوريات</span>
          <strong className="text-xl font-bold text-amber-300 font-mono">{leagues.length}</strong>
        </div>

        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">المباريات الودية</span>
          <strong className="text-xl font-bold text-[#ff2a5f] font-mono">{friendlyMatches.length}</strong>
        </div>

        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">كشاف المواهب</span>
          <strong className="text-xl font-bold text-blue-400 font-mono">{playerCvs.length}</strong>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#0d1211] p-2 rounded-2xl border border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {[
          { id: 'overview', label: 'نظرة عامة والتقارير', icon: BarChart3 },
          { id: 'charts', label: 'الرسوم البيانية والإحصائيات', icon: PieChart },
          { id: 'bookings', label: `إدارة الحجوزات (${bookings.length})`, icon: Calendar },
          { id: 'playgrounds', label: `الملاعب (${playgrounds.length})`, icon: Shield },
          { id: 'leagues', label: `الدوريات (${leagues.length})`, icon: Trophy },
          { id: 'matches', label: `المباريات (${friendlyMatches.length})`, icon: Swords },
          { id: 'academies', label: `الأكاديميات (${academies.length})`, icon: Users },
          { id: 'scouting', label: `كشاف المواهب (${playerCvs.length})`, icon: Award },
          { id: 'users', label: `المستخدمين (${usersList.length})`, icon: Users },
          { id: 'objections', label: `الاعتراضات (${objectionsList.length})`, icon: AlertTriangle },
          { id: 'settings', label: 'إعدادات النظام وشام كاش', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#ff2a5f] text-white shadow-lg glow-pink'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Revenue Breakdown */}
          <div className="bg-[#0d1211] p-6 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-gray-400">إجمالي قيمة التداولات والحجوزات المسجلة:</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">{formatSYP(totalRevenue)}</h3>
              <p className="text-xs text-emerald-400 font-semibold">0% عمولة للمنصة - دفع كاش أو شام كاش مباشر</p>
            </div>

            <div className="space-y-1 md:border-r md:border-white/10 md:pr-6">
              <span className="text-xs text-gray-400">تغطية المحافظات السورية:</span>
              <h3 className="text-xl font-bold text-white">14 محافظة كاملة</h3>
              <p className="text-xs text-gray-400">دمشق، ريف دمشق، حلب، حمص، حماة، اللاذقية، طرطوس، إدلب، الحسكة، دير الزور، الرقة، درعا، السويداء، القنيطرة.</p>
            </div>

            <div className="space-y-1 md:border-r md:border-white/10 md:pr-6 flex flex-col justify-center">
              <span className="text-xs text-gray-400">حساب شام كاش المعتمد للمنصة:</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  {shamCashAdminAccount}
                </span>
                <span className="text-[10px] text-gray-400">0945688090</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#050707] p-5 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-white font-['Cairo']">إضافة سريعة عبر لوحة الإدارة:</h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenCreatePlayground}
                className="px-4 py-2 rounded-xl bg-[#00FFD2] text-black text-xs font-bold flex items-center gap-1 glow-primary"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة ملعب
              </button>
              <button
                onClick={onOpenCreateLeague}
                className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة دوري
              </button>
              <button
                onClick={onOpenCreateAcademy}
                className="px-4 py-2 rounded-xl bg-purple-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة أكاديمية
              </button>
              <button
                onClick={onOpenCreateMatch}
                className="px-4 py-2 rounded-xl bg-[#ff2a5f] text-white text-xs font-bold flex items-center gap-1 glow-pink"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة مباراة ودية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Visual Charts & Analytics */}
      {activeTab === 'charts' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Distribution Chart */}
            <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-['Cairo'] flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#00FFD2]" />
                  توزيع مصادر النشاط الرياضي
                </h3>
                <span className="text-xs text-gray-400">نسبة الإشغال الإجمالية: 86%</span>
              </div>

              {/* Responsive SVG Donut Chart */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      className="text-gray-800"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Segments */}
                    <path
                      className="text-[#00FFD2]"
                      strokeDasharray="45, 100"
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-amber-400"
                      strokeDasharray="25, 100"
                      strokeDashoffset="-45"
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#ff2a5f]"
                      strokeDasharray="20, 100"
                      strokeDashoffset="-70"
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-400"
                      strokeDasharray="10, 100"
                      strokeDashoffset="-90"
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-white font-mono">100%</span>
                    <span className="text-[9px] text-gray-400">مباشر</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#00FFD2]"></span>
                    <span className="text-gray-300">حجوزات الملاعب (45%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="text-gray-300">اشتراكات الدوريات (25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff2a5f]"></span>
                    <span className="text-gray-300">المباريات الودية (20%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                    <span className="text-gray-300">اشتراكات الأكاديميات (10%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Activity Bar Chart */}
            <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-['Cairo'] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  النشاط الشهري للحجوزات والمباريات
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-bold">+34% نمو</span>
              </div>

              {/* Bar Chart Bars */}
              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-white/10">
                {[
                  { month: 'يناير', count: 45, height: '40%' },
                  { month: 'فبراير', count: 62, height: '55%' },
                  { month: 'مارس', count: 78, height: '70%' },
                  { month: 'أبريل', count: 95, height: '82%' },
                  { month: 'مايو', count: 110, height: '92%' },
                  { month: 'يونيو', count: 130, height: '100%' }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </span>
                    <div
                      style={{ height: item.height }}
                      className="w-full bg-gradient-to-t from-[#00FFD2]/40 to-[#00FFD2] rounded-t-lg group-hover:brightness-125 transition-all"
                    ></div>
                    <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <h3 className="font-bold text-white text-sm font-['Cairo']">
              سجل كافة الحجوزات وإدارتها ({bookings.length}):
            </h3>
            <button
              onClick={() => exportBookingsCsv(bookings)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> تحميل تقرير الحجوزات Excel
            </button>
          </div>

          <div className="bg-[#0d1211] border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#050707] text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">الرقم المرجعي</th>
                    <th className="p-3">الملعب</th>
                    <th className="p-3">الكابتن</th>
                    <th className="p-3">التاريخ والوقت</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">طريقة الدفع</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-[#00FFD2] font-bold">{b.referenceNumber}</td>
                      <td className="p-3 font-bold text-white">
                        {b.playgroundName}
                        <span className="block text-[10px] text-gray-400 font-normal">{b.governorate}</span>
                      </td>
                      <td className="p-3">
                        {b.userName}
                        <span className="block text-[10px] text-gray-400 font-mono">{b.userPhone}</span>
                      </td>
                      <td className="p-3 font-mono">
                        {b.selectedDates.join(', ')}
                        <span className="block text-[10px] text-gray-400">{b.timeSlot}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">{formatSYP(b.totalPrice)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px]">
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'مؤكد'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                              : b.status === 'ملغي'
                              ? 'bg-red-950/80 text-red-400 border border-red-500/30'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {b.status !== 'مؤكد' && (
                            <button
                              onClick={() => onUpdateBookingStatus(b.id, 'مؤكد')}
                              title="تأكيد الحجز"
                              className="p-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {b.status !== 'ملغي' && (
                            <button
                              onClick={() => onUpdateBookingStatus(b.id, 'ملغي')}
                              title="إلغاء الحجز"
                              className="p-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Playgrounds Management */}
      {activeTab === 'playgrounds' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-['Cairo']">
              الملاعب المسجلة ({playgrounds.length})
            </h3>
            <button
              onClick={onOpenCreatePlayground}
              className="px-4 py-2 rounded-xl bg-[#00FFD2] text-black font-bold text-xs glow-primary flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> إضافة ملعب جديد
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playgrounds.map((pg) => (
              <div key={pg.id} className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-white text-xs">{pg.name}</strong>
                    <span className="text-[10px] text-[#00FFD2] font-bold">{pg.governorate}</span>
                  </div>
                  <p className="text-xs text-gray-400">{pg.detailedArea}</p>
                  <p className="text-xs text-gray-300 font-mono mt-1">{formatSYP(pg.pricePerHour)} / 90 دقيقة</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-3">
                  <span className="text-gray-400 font-mono">{pg.managerPhone}</span>
                  <button
                    onClick={() => onDeletePlayground(pg.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-[#ff2a5f] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Leagues Management */}
      {activeTab === 'leagues' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-['Cairo']">
              البطولات والدوريات ({leagues.length})
            </h3>
            <button
              onClick={onOpenCreateLeague}
              className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> إنشاء بطولة دوري جديدة
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {leagues.map((l) => (
              <div key={l.id} className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-white text-xs">{l.name}</strong>
                    <span className="text-[10px] text-amber-400 font-bold">{l.status}</span>
                  </div>
                  <p className="text-xs text-gray-400">{l.hostingVenue} ({l.governorate})</p>
                  <p className="text-xs text-gray-300 font-mono mt-1">الفرق: {l.teamsCount} • الجائزة: {formatSYP(l.prizes.cashPrize || 0)}</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-3">
                  <button
                    onClick={() => exportLeaguePdf(l)}
                    className="text-xs text-[#00FFD2] hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> تقرير PDF
                  </button>
                  <button
                    onClick={() => onDeleteLeague(l.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-[#ff2a5f] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Matches Management */}
      {activeTab === 'matches' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d1211] p-4 rounded-2xl border border-white/10">
            <div>
              <h3 className="font-bold text-white text-sm font-['Cairo'] flex items-center gap-2">
                <Swords className="w-5 h-5 text-[#ff2a5f]" />
                إدارة المباريات الودية والتحديات ({friendlyMatches.length})
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">مراجعة وتأكيد طلبات التحديات وإدارتها وإرسال التنبيهات للفرق</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={matchStatusFilter}
                onChange={(e) => setMatchStatusFilter(e.target.value)}
                className="bg-[#050707] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white"
              >
                <option value="الكل">كل الحالات ({friendlyMatches.length})</option>
                <option value="مفتوح">مفتوح</option>
                <option value="مؤكد">مؤكد</option>
                <option value="منتهي">منتهي</option>
                <option value="ملغي">ملغي</option>
              </select>

              <button
                onClick={onOpenCreateMatch}
                className="px-4 py-2 rounded-xl bg-[#ff2a5f] hover:bg-[#e02050] text-white font-bold text-xs glow-pink flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> نشر تحدي جديد
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friendlyMatches
              .filter((m) => matchStatusFilter === 'الكل' || m.status === matchStatusFilter)
              .map((m) => (
                <div key={m.id} className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-white text-sm font-bold">{m.hostTeamName}</strong>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          m.status === 'مؤكد'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : m.status === 'مفتوح'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                            : m.status === 'ملغي'
                            ? 'bg-red-950 text-red-400 border border-red-500/40'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-300">
                      <p className="text-gray-400">🏟️ {m.venueName} • <span className="text-white">{m.governorate}</span></p>
                      <p className="font-mono text-gray-300">📅 {m.date} | ⏰ {m.time} | 👥 {m.ageGroup}</p>
                      <p className="text-[#00FFD2]">المنافس: {m.opponentTeamName || 'بانتظار منافس للانضمام'}</p>
                      <p className="text-gray-400">طريقة الدفع: {m.costSplitMethod}</p>
                      <p className="font-mono text-white">التكلفة: {formatSYP(m.pitchPrice)} + حكم {formatSYP(m.refereePrice || 0)}</p>
                      <p className="text-gray-400">المنظم: {m.organizerName} ({m.organizerPhone})</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-1">
                      {m.status !== 'مؤكد' && (
                        <button
                          onClick={() => {
                            if (onUpdateFriendlyMatchStatus) {
                              onUpdateFriendlyMatchStatus(m.id, 'مؤكد');
                            }
                            openWhatsAppShare(
                              `⚽ *تم تأكيد مباراتكم عبر تطبيق الكابتن!*\n📌 المباراة: ${m.hostTeamName} ضد ${m.opponentTeamName || 'المتحدي'}\n📍 الملعب: ${m.venueName}\n📅 الموعد: ${m.date} (${m.time})\nنتمنى لكم مباراة ممتعة!`,
                              m.organizerPhone
                            );
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 text-[11px] font-bold flex items-center gap-1 border border-emerald-500/30"
                          title="تأكيد التحدي"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> تأكيد
                        </button>
                      )}

                      {m.status !== 'ملغي' && (
                        <button
                          onClick={() => {
                            setRejectionModalData({
                              id: m.id,
                              type: 'friendly_match',
                              name: `${m.hostTeamName} - ${m.venueName}`,
                              phone: m.organizerPhone
                            });
                          }}
                          className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 text-[11px] font-bold flex items-center gap-1 border border-red-500/30"
                          title="إلغاء التحدي"
                        >
                          <XCircle className="w-3.5 h-3.5" /> إلغاء
                        </button>
                      )}

                      <button
                        onClick={() =>
                          openWhatsAppShare(
                            `مرحباً كابتن ${m.organizerName} بخصوص مباراة ${m.hostTeamName} في ${m.venueName}`,
                            m.organizerPhone
                          )
                        }
                        className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[11px] font-bold flex items-center gap-1"
                        title="محادثة واتساب"
                      >
                        واتساب
                      </button>
                    </div>

                    <button
                      onClick={() => onDeleteMatch(m.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-[#ff2a5f] transition-colors"
                      title="حذف نهائي"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 7: Academies & Registration Requests Management */}
      {activeTab === 'academies' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-tabs toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d1211] p-4 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAcademySubTab('registrations')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                  academySubTab === 'registrations'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-[#050707] text-gray-300 hover:text-white border border-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>طلبات تسجيل الطلاب ({academyRegistrations.length})</span>
              </button>

              <button
                onClick={() => setAcademySubTab('academies')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                  academySubTab === 'academies'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-[#050707] text-gray-300 hover:text-white border border-white/10'
                }`}
              >
                <span>الأكاديميات المعتمدة ({academies.length})</span>
              </button>
            </div>

            {academySubTab === 'academies' && (
              <button
                onClick={onOpenCreateAcademy}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1 shadow-lg cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة أكاديمية جديدة
              </button>
            )}

            {academySubTab === 'registrations' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">تصفية الحالة:</label>
                <select
                  value={registrationStatusFilter}
                  onChange={(e) => setRegistrationStatusFilter(e.target.value)}
                  className="bg-[#050707] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white"
                >
                  <option value="الكل">كل الحالات ({academyRegistrations.length})</option>
                  <option value="قيد الانتظار">قيد الانتظار</option>
                  <option value="مؤكد">مؤكد ومقبول</option>
                  <option value="مرفوض">مرفوض</option>
                </select>
              </div>
            )}
          </div>

          {/* Sub-tab 1: Student Registrations Table & Cards */}
          {academySubTab === 'registrations' && (
            <div className="space-y-4">
              {academyRegistrations.length === 0 ? (
                <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-12 text-center space-y-3">
                  <Users className="w-12 h-12 text-gray-600 mx-auto" />
                  <h3 className="text-base font-bold text-gray-300">لا توجد طلبات تسجيل طلاب بعد</h3>
                  <p className="text-xs text-gray-400">
                    عندما يقوم أولياء الأمور بتسجيل أبنائهم في الأكاديميات الكروية ستظهر كافة الطلبات وإيصالات الدفع هنا للمراجعة والاعتماد.
                  </p>
                </div>
              ) : (
                <div className="bg-[#0d1211] border border-white/10 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#050707] text-gray-400 border-b border-white/10">
                        <tr>
                          <th className="p-3">الطالب والصورة</th>
                          <th className="p-3">الأكاديمية والمحافظة</th>
                          <th className="p-3">العمر والفئة والمركز</th>
                          <th className="p-3">ولي الأمر والتواصل</th>
                          <th className="p-3">المواصلات</th>
                          <th className="p-3">إيصال الدفع</th>
                          <th className="p-3">حالة الدفع</th>
                          <th className="p-3">حالة التسجيل</th>
                          <th className="p-3 text-center">إجراءات المدير</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300">
                        {academyRegistrations
                          .filter((r) => registrationStatusFilter === 'الكل' || r.status === registrationStatusFilter)
                          .map((r) => (
                            <tr key={r.id} className="hover:bg-white/5 transition-colors">
                              {/* Student info */}
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={r.studentPhoto}
                                    alt={r.studentName}
                                    className="w-10 h-10 rounded-xl object-cover border border-purple-400/40 shrink-0"
                                  />
                                  <div>
                                    <strong className="text-white block">{r.studentName}</strong>
                                    <span className="text-[10px] text-purple-300 font-mono">مواليد {r.birthDate}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Academy */}
                              <td className="p-3">
                                <span className="font-bold text-white block">{r.academyName}</span>
                                <span className="text-[10px] text-gray-400">{r.governorate} - {r.city}</span>
                              </td>

                              {/* Age & Position */}
                              <td className="p-3">
                                <span className="text-white font-bold block">{r.age} سنة • {r.preferredPosition}</span>
                                <span className="text-[10px] text-purple-300">{r.ageGroup}</span>
                              </td>

                              {/* Parent Contact */}
                              <td className="p-3">
                                <span className="text-white block">{r.parentName}</span>
                                <span className="text-[10px] text-gray-400 font-mono">{r.parentPhone}</span>
                              </td>

                              {/* Transport */}
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    r.transportOption === 'مؤمنة'
                                      ? 'bg-emerald-950 text-emerald-400'
                                      : r.transportOption === 'بحاجة مواصلات'
                                      ? 'bg-amber-950 text-amber-400'
                                      : 'bg-gray-800 text-gray-400'
                                  }`}
                                >
                                  {r.transportOption}
                                </span>
                              </td>

                              {/* Payment Receipt Image */}
                              <td className="p-3">
                                {r.paymentReceiptPhoto ? (
                                  <button
                                    onClick={() => setSelectedReceiptImage(r.paymentReceiptPhoto)}
                                    className="p-1 rounded-lg border border-purple-500/30 hover:border-purple-400 transition-colors flex items-center gap-1 text-[10px] text-purple-300 bg-[#050707]"
                                    title="معاينة إشعار الدفع"
                                  >
                                    <img
                                      src={r.paymentReceiptPhoto}
                                      alt="الإشعار"
                                      className="w-7 h-7 rounded object-cover"
                                    />
                                    <span>معاينة</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-500">لا يوجد إشعار</span>
                                )}
                              </td>

                              {/* Payment Status with Quick Change */}
                              <td className="p-3">
                                <div className="space-y-1">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold block text-center ${
                                      r.paymentStatus === 'مدفوع'
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                        : r.paymentStatus === 'غير مدفوع'
                                        ? 'bg-red-950 text-red-400 border border-red-500/30'
                                        : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                    }`}
                                  >
                                    {r.paymentStatus}
                                  </span>

                                  {/* Quick Toggle Button */}
                                  {onUpdateAcademyRegistrationPaymentStatus && (
                                    <button
                                      onClick={() => {
                                        const nextStatus: PaymentStatus =
                                          r.paymentStatus === 'مدفوع' ? 'غير مدفوع' : 'مدفوع';
                                        onUpdateAcademyRegistrationPaymentStatus(r.id, nextStatus);
                                      }}
                                      className="text-[9px] text-[#00FFD2] hover:underline block text-center"
                                    >
                                      تبديل حالة الدفع
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Registration Status */}
                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold block text-center ${
                                    r.status === 'مؤكد'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                      : r.status === 'مرفوض'
                                      ? 'bg-red-950 text-red-400 border border-red-500/40'
                                      : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                                  }`}
                                >
                                  {r.status}
                                </span>
                                {r.rejectionReason && (
                                  <span className="text-[9px] text-red-300 block text-center mt-0.5">
                                    سبب: {r.rejectionReason}
                                  </span>
                                )}
                              </td>

                              {/* Admin Actions */}
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Approve Button */}
                                  {r.status !== 'مؤكد' && (
                                    <button
                                      onClick={() => {
                                        if (onUpdateAcademyRegistrationStatus) {
                                          onUpdateAcademyRegistrationStatus(r.id, 'مؤكد');
                                        }
                                        openWhatsAppShare(
                                          `🎉 *تهانينا! تم قبول وتأكيد تسجيل الطالب ${r.studentName} في ${r.academyName}!*\n👤 الفئة: ${r.ageGroup}\n📞 للاستفسار وتحديد مواعيد التدريب يرجى التواصل مع إدارة الأكاديمية.\nنتمنى له مسيرة كروية حافلة بالنجاح! ⚽`,
                                          r.parentPhone
                                        );
                                      }}
                                      className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-500/30"
                                      title="قبول وتأكيد التسجيل وإرسال إشعار واتساب"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>قبول</span>
                                    </button>
                                  )}

                                  {/* Reject Button with Reason Modal */}
                                  {r.status !== 'مرفوض' && (
                                    <button
                                      onClick={() => {
                                        setRejectionModalData({
                                          id: r.id,
                                          type: 'academy_registration',
                                          name: `${r.studentName} (${r.academyName})`,
                                          phone: r.parentPhone
                                        });
                                      }}
                                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 text-xs font-bold flex items-center gap-1 border border-red-500/30"
                                      title="رفض الطلب مع ذكر السبب"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      <span>رفض</span>
                                    </button>
                                  )}

                                  {/* WhatsApp Direct Contact */}
                                  <button
                                    onClick={() =>
                                      openWhatsAppShare(
                                        `مرحباً السيد/ة ${r.parentName} بخصوص طلب تسجيل الطالب ${r.studentName} في ${r.academyName}`,
                                        r.parentPhone
                                      )
                                    }
                                    className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold"
                                    title="تواصل واتساب مع ولي الأمر"
                                  >
                                    واتساب
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2: Academies List */}
          {academySubTab === 'academies' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {academies.map((a) => (
                <div key={a.id} className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-white text-sm">{a.name}</h4>
                      <span className="text-xs text-purple-400 font-bold">{a.governorate}</span>
                    </div>
                    <p className="text-xs text-gray-400">{a.locationDetails}</p>
                    <p className="text-xs text-purple-300 font-mono mt-2">الاشتراك الشهري: {formatSYP(a.monthlyFee)}</p>
                    <p className="text-xs text-gray-400 mt-1">المدرب: {a.mainCoach} ({a.contactPhone})</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-3">
                    <span className="text-gray-400 font-mono">مواصلات: {a.transportStatus}</span>
                    <button
                      onClick={() =>
                        openWhatsAppShare(
                          `مرحباً كابتن ${a.mainCoach} بإدارة ${a.name}`,
                          a.contactPhone
                        )
                      }
                      className="text-xs text-purple-300 hover:underline flex items-center gap-1"
                    >
                      تواصل مع الأكاديمية
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Scouting Management */}
      {activeTab === 'scouting' && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="font-bold text-white text-sm font-['Cairo']">
            بطاقات اللاعبين وكشاف المواهب ({playerCvs.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playerCvs.map((pl) => (
              <div key={pl.id} className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <img src={pl.image} alt={pl.fullName} className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-white text-sm">{pl.fullName}</h4>
                  <p className="text-xs text-blue-400">{pl.position} • {pl.governorate}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{pl.phoneNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 9: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-['Cairo']">
              إدارة حسابات الكباتن والمستخدمين ({usersList.length}):
            </h3>
          </div>

          <div className="bg-[#0d1211] border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#050707] text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">الاسم</th>
                    <th className="p-3">رقم الجوال / البريد</th>
                    <th className="p-3">المحافظة</th>
                    <th className="p-3">الرتبة</th>
                    <th className="p-3">عدد الحجوزات</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white">{u.name}</td>
                      <td className="p-3 font-mono">
                        {u.phone}
                        <span className="block text-[10px] text-gray-400">{u.email}</span>
                      </td>
                      <td className="p-3">{u.governorate}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-[#ff2a5f]/20 text-[#ff2a5f] border border-[#ff2a5f]/30'
                              : 'bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/30'
                          }`}
                        >
                          {u.role === 'admin' ? 'مدير نظام' : 'كابتن'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">{u.bookingsCount}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isBanned
                              ? 'bg-red-950 text-red-400 border border-red-500/30'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {u.isBanned ? 'محظور' : 'نشط'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleBanUser(u.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            u.isBanned
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-red-600 hover:bg-red-500 text-white'
                          }`}
                        >
                          {u.isBanned ? 'إلغاء الحظر' : 'حظر الحساب'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 10: Objections System */}
      {activeTab === 'objections' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-['Cairo'] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              نظام الاعتراضات والتحكيم الرياضي ({objectionsList.length}):
            </h3>
          </div>

          <div className="space-y-4">
            {objectionsList.map((obj) => (
              <div key={obj.id} className="bg-[#0d1211] border border-amber-400/30 rounded-3xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm font-['Cairo']">{obj.leagueName}</h4>
                    <p className="text-xs text-amber-400 mt-0.5">
                      المعترض: {obj.submittingTeam} ضد {obj.targetTeam}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      obj.status === 'قيد المراجعة'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        : obj.status === 'مقبول'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-950 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {obj.status}
                  </span>
                </div>

                <div className="bg-[#050707] p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                  <div className="text-gray-300">
                    <strong>سبب الاعتراض:</strong> {obj.reason}
                  </div>
                  <div className="text-gray-400">
                    <strong>الأدلة المرفقة:</strong> {obj.evidenceDetails}
                  </div>
                  <div className="text-emerald-400 font-mono">
                    <strong>رسم الاعتراض المدفوع:</strong> {formatSYP(obj.depositFeePaid)} (يُسترد في حال قبول الاعتراض)
                  </div>
                </div>

                {obj.status === 'قيد المراجعة' && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() =>
                        handleResolveObjection(
                          obj.id,
                          'قبول وتعديل النتيجة',
                          'تم قبول الاعتراض واعتماد فوز الفريق المعترض 3-0 قانونياً واسترداد رسم التأمين.'
                        )
                      }
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      قبول الاعتراض وتعديل النتيجة
                    </button>
                    <button
                      onClick={() =>
                        handleResolveObjection(
                          obj.id,
                          'إعادة جدولة المباراة',
                          'تمت الموافقة على إعادة المباراة في موعد لاحق تحت إشراف طاقم تحكيم دولي.'
                        )
                      }
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs"
                    >
                      إعادة جدولة المباراة
                    </button>
                    <button
                      onClick={() =>
                        handleResolveObjection(
                          obj.id,
                          'رفض الاعتراض',
                          'تم رفض الاعتراض بعد مراجعة تقرير الحكم المعتمد ومصادرة رسم التأمين.'
                        )
                      }
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                    >
                      رفض الاعتراض
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 11: Settings & Sham Cash */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fadeIn max-w-2xl">
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Cairo']">
              <Settings className="w-5 h-5 text-[#00FFD2]" />
              إعدادات منصة الكابتن وإدارة محفظة شام كاش
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  رقم حساب شام كاش المعتمد للمنصة:
                </label>
                <input
                  type="text"
                  value={shamCashAdminAccount}
                  onChange={(e) => setShamCashAdminAccount(e.target.value)}
                  placeholder="SHAM-9456-8809"
                  className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00FFD2]"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  هذا الرقم يظهر للمستخدمين عند اختيار الدفع عبر شام كاش لدفع الحجوزات أو رسوم الدوريات
                </span>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  رقم الواتساب الموحد للدعم الفني والشكاوى:
                </label>
                <input
                  type="text"
                  value="+963 945688090"
                  disabled
                  className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-gray-400 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    setIsSavedSettings(true);
                    setTimeout(() => setIsSavedSettings(false), 2500);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs glow-primary transition-all"
                >
                  {isSavedSettings ? 'تم حفظ الإعدادات بنجاح ✓' : 'حفظ الإعدادات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Preview Modal */}
      {selectedReceiptImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedReceiptImage(null)}
        >
          <div
            className="bg-[#0d1211] border border-white/20 rounded-3xl p-4 max-w-lg w-full shadow-2xl relative space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-['Cairo']">صورة إشعار / إيصال الدفع</h4>
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/60 border border-white/10 max-h-[65vh] flex items-center justify-center">
              <img
                src={selectedReceiptImage}
                alt="إيصال الدفع"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setRejectionModalData(null);
            setRejectionReasonInput('');
          }}
        >
          <div
            className="bg-[#0d1211] border border-red-500/40 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-red-400 font-['Cairo'] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>رفض الطلب: {rejectionModalData.name}</span>
              </h4>
              <button
                onClick={() => {
                  setRejectionModalData(null);
                  setRejectionReasonInput('');
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              يرجى كتابة سبب الرفض لتوضيحه للمستخدم وإرساله في إشعار الواتساب التلقائي:
            </p>

            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="مثال: اكتمال العدد المطلوب في الفئة العمرية / بيانات الدفع غير مطابقة..."
              rows={3}
              className="w-full bg-[#050707] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectionModalData(null);
                  setRejectionReasonInput('');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-bold transition-colors"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={() => {
                  const reason = rejectionReasonInput.trim() || 'عدم استيفاء الشروط المطلوبة';
                  if (rejectionModalData.type === 'academy_registration') {
                    if (onUpdateAcademyRegistrationStatus) {
                      onUpdateAcademyRegistrationStatus(rejectionModalData.id, 'مرفوض', reason);
                    }
                    openWhatsAppShare(
                      `❌ *نعتذر، تم رفض طلب تسجيل الطالب ${rejectionModalData.name}*\nالسبب: ${reason}\nللاستفسار يرجى مراجعة إدارة المنصة.`,
                      rejectionModalData.phone
                    );
                  } else if (rejectionModalData.type === 'friendly_match') {
                    if (onUpdateFriendlyMatchStatus) {
                      onUpdateFriendlyMatchStatus(rejectionModalData.id, 'ملغي', reason);
                    }
                    openWhatsAppShare(
                      `❌ *تم إلغاء التحدي الكروي ${rejectionModalData.name}*\nالسبب: ${reason}\nيمكنك إنشاء تحدٍ جديد في أي وقت.`,
                      rejectionModalData.phone
                    );
                  }
                  setRejectionModalData(null);
                  setRejectionReasonInput('');
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-lg shadow-red-600/30"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>تأكيد الرفض وإشعار واتساب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
