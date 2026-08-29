import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Share2,
  Download,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  List,
  Sparkles,
  Filter,
  Check,
  CheckCheck,
  Plus,
  RotateCcw,
  BellRing
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { formatSYP, openWhatsAppShare, downloadCalendarEvent } from '../utils/helpers';
import { checkUpcomingBookingReminders } from '../utils/bookingReminderService';

interface MyBookingsViewProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onExplorePlaygrounds: () => void;
  onRebook?: (booking: Booking) => void;
}

type ViewMode = 'list' | 'calendar';
type FilterStatusType = 'الكل' | 'مؤكد' | 'بانتظار الدفع' | 'ملغي' | 'مكتمل';

const ARABIC_MONTHS = [
  'كانون الثاني (يناير)',
  'شباط (فبراير)',
  'آذار (مارس)',
  'نيسان (أبريل)',
  'أيار (مايو)',
  'حزيران (يونيو)',
  'تموز (يوليو)',
  'آب (أغسطس)',
  'أيلول (سبتمبر)',
  'تشرين الأول (أكتوبر)',
  'تشرين الثاني (نوفمبر)',
  'كانون الأول (ديسمبر)'
];

const ARABIC_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function MyBookingsView({
  bookings,
  onCancelBooking,
  onExplorePlaygrounds,
  onRebook
}: MyBookingsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  // 2-Hour Upcoming Bookings Reminders
  const upcomingReminders = useMemo(() => {
    return checkUpcomingBookingReminders(bookings);
  }, [bookings]);

  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // If there are bookings, pick the month of the latest/first booking, else today
    if (bookings.length > 0 && bookings[0].selectedDates?.[0]) {
      const parsed = new Date(bookings[0].selectedDates[0]);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  });

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Calculate status counts for the top filter bar
  const statusCounts = useMemo(() => {
    const counts = {
      all: bookings.length,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      completed: 0
    };

    bookings.forEach((b) => {
      const status = b.status as string;
      if (status === 'مؤكد') counts.confirmed++;
      else if (status === 'بانتظار الدفع' || status === 'قيد الانتظار') counts.pending++;
      else if (status === 'ملغي') counts.cancelled++;
      else if (status === 'مكتمل' || status === 'منتهي') counts.completed++;
    });

    return counts;
  }, [bookings]);

  // Filter bookings based on status and search query
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status Filter Logic
      let matchesStatus = true;
      const status = b.status as string;
      if (filterStatus === 'مؤكد') {
        matchesStatus = status === 'مؤكد';
      } else if (filterStatus === 'بانتظار الدفع') {
        matchesStatus = status === 'بانتظار الدفع' || status === 'قيد الانتظار';
      } else if (filterStatus === 'ملغي') {
        matchesStatus = status === 'ملغي';
      } else if (filterStatus === 'مكتمل') {
        matchesStatus = status === 'مكتمل' || status === 'منتهي';
      }

      // Search Query Logic
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.playgroundName.toLowerCase().includes(q) ||
        b.referenceNumber.toLowerCase().includes(q) ||
        b.governorate.toLowerCase().includes(q) ||
        (b.detailedArea && b.detailedArea.toLowerCase().includes(q)) ||
        b.selectedDates.some((d) => d.includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [bookings, filterStatus, searchQuery]);

  // Calendar Calculations
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    // 0 = Sunday, 1 = Monday, ...
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  // Map of bookings by date string (YYYY-MM-DD)
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    filteredBookings.forEach((b) => {
      b.selectedDates.forEach((dateStr) => {
        if (!map[dateStr]) {
          map[dateStr] = [];
        }
        map[dateStr].push(b);
      });
    });
    return map;
  }, [filteredBookings]);

  // Bookings for the selected calendar date
  const selectedDayBookings = useMemo(() => {
    return bookingsByDate[selectedCalendarDate] || [];
  }, [bookingsByDate, selectedCalendarDate]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedCalendarDate(today.toISOString().split('T')[0]);
  };

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    onCancelBooking(cancelModalBooking.id);
    setCancelModalBooking(null);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Format date to human-readable Arabic string
  const formatArabicDate = (dateString: string) => {
    try {
      const [y, m, d] = dateString.split('-').map(Number);
      if (!y || !m || !d) return dateString;
      const dateObj = new Date(y, m - 1, d);
      const dayName = ARABIC_WEEKDAYS[dateObj.getDay()];
      const monthName = ARABIC_MONTHS[m - 1];
      return `${dayName} ${d} ${monthName} ${y}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div id="view-my-bookings" className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1211] p-5 sm:p-6 rounded-3xl border border-[#00FFD2]/20 glow-primary">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Cairo'] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#00FFD2]" />
              سجل حجوزاتي ومبارياتي
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#00FFD2]/10 text-[#00FFD2] border border-[#00FFD2]/30 text-xs font-bold font-mono">
              {bookings.length} حجز
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
            متابعة مواعيد المباريات وتأكيد الحجوزات مع الملاعب بدون أي عمولة إضافية
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* View Mode Toggle */}
          <div className="bg-[#050707] p-1 rounded-2xl border border-white/10 flex items-center gap-1 shadow-inner">
            <button
              id="btn-view-list"
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#00FFD2] text-black shadow-md glow-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span>عرض القائمة</span>
            </button>

            <button
              id="btn-view-calendar"
              onClick={() => setViewMode('calendar')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#00FFD2] text-black shadow-md glow-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>التقويم الشهري</span>
            </button>
          </div>

          <button
            onClick={onExplorePlaygrounds}
            className="px-4 py-2.5 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs transition-all shadow-lg glow-primary flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>حجز ملعب جديد</span>
          </button>
        </div>
      </div>

      {/* Upcoming Reminders (Within 2 hours / Today) */}
      {upcomingReminders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/20 via-[#00FFD2]/10 to-amber-500/20 border-2 border-amber-400/50 rounded-3xl p-4 sm:p-5 shadow-2xl animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-lg font-bold">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-amber-300">
                  ⏰ تنبيه اقتراب موعد المباراة (خلال ساعتين)!
                </h3>
                <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-bold">
                  تذكير فوري
                </span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">
                لديك مباراة قريبة في ملعب{' '}
                <strong className="text-white underline">{upcomingReminders[0].playgroundName}</strong> اليوم{' '}
                بتوقيت <strong className="text-[#00FFD2] font-mono">{upcomingReminders[0].timeSlot}</strong>. يرجى التواجد قبل الموعد بـ 15 دقيقة لتجهيز الفريق.
              </p>
              {onRebook && (
                <div className="pt-2">
                  <button
                    onClick={() => onRebook(upcomingReminders[0])}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تكرار / حجز موعد إضافي لهذا الملعب</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Status Filter Bar & Search */}
      <div className="space-y-3 bg-[#0d1211]/80 p-4 rounded-3xl border border-white/10">
        {/* Status Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2">
            {/* All Bookings */}
            <button
              id="filter-status-all"
              onClick={() => setFilterStatus('الكل')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                filterStatus === 'الكل'
                  ? 'bg-[#00FFD2] text-black glow-primary shadow-sm'
                  : 'bg-[#050707] text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>الكل</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  filterStatus === 'الكل'
                    ? 'bg-black text-[#00FFD2]'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {statusCounts.all}
              </span>
            </button>

            {/* Confirmed */}
            <button
              id="filter-status-confirmed"
              onClick={() => setFilterStatus('مؤكد')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                filterStatus === 'مؤكد'
                  ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/30'
                  : 'bg-[#050707] text-emerald-400 hover:text-emerald-300 border border-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>مؤكد</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  filterStatus === 'مؤكد'
                    ? 'bg-black text-emerald-400'
                    : 'bg-emerald-500/10 text-emerald-300'
                }`}
              >
                {statusCounts.confirmed}
              </span>
            </button>

            {/* Pending Payment */}
            <button
              id="filter-status-pending"
              onClick={() => setFilterStatus('بانتظار الدفع')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                filterStatus === 'بانتظار الدفع'
                  ? 'bg-amber-400 text-black font-extrabold shadow-md shadow-amber-400/30'
                  : 'bg-[#050707] text-amber-300 hover:text-amber-200 border border-amber-400/20'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>بانتظار الدفع</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  filterStatus === 'بانتظار الدفع'
                    ? 'bg-black text-amber-400'
                    : 'bg-amber-400/10 text-amber-300'
                }`}
              >
                {statusCounts.pending}
              </span>
            </button>

            {/* Cancelled */}
            <button
              id="filter-status-cancelled"
              onClick={() => setFilterStatus('ملغي')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                filterStatus === 'ملغي'
                  ? 'bg-[#ff2a5f] text-white font-extrabold shadow-md shadow-[#ff2a5f]/30'
                  : 'bg-[#050707] text-[#ff2a5f] hover:text-red-400 border border-[#ff2a5f]/20'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>ملغي</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  filterStatus === 'ملغي'
                    ? 'bg-black text-[#ff2a5f]'
                    : 'bg-[#ff2a5f]/10 text-red-300'
                }`}
              >
                {statusCounts.cancelled}
              </span>
            </button>

            {/* Completed */}
            {statusCounts.completed > 0 && (
              <button
                id="filter-status-completed"
                onClick={() => setFilterStatus('مكتمل')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  filterStatus === 'مكتمل'
                    ? 'bg-blue-500 text-white font-extrabold shadow-md shadow-blue-500/30'
                    : 'bg-[#050707] text-blue-400 hover:text-blue-300 border border-blue-500/20'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>مكتمل</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    filterStatus === 'مكتمل'
                      ? 'bg-black text-blue-400'
                      : 'bg-blue-500/10 text-blue-300'
                  }`}
                >
                  {statusCounts.completed}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث باسم الملعب، الرقم المرجعي (KAP-...)، المنطقة، أو التاريخ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050707] border border-white/10 rounded-2xl pr-10 pl-10 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#00FFD2] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs p-1"
              title="مسح البحث"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: MONTHLY CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Calendar Header Card */}
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-4 sm:p-6 space-y-4">
            {/* Month Selector Bar */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#050707] hover:bg-[#00FFD2]/20 hover:text-[#00FFD2] text-gray-300 border border-white/10 transition-all cursor-pointer"
                  title="الشهر السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-white font-['Cairo'] flex items-center gap-2">
                    <span>{ARABIC_MONTHS[currentMonth]}</span>
                    <span className="text-[#00FFD2] font-mono">{currentYear}</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    اضغط على أي يوم لعرض المباريات المحجوزة وتفاصيلها
                  </p>
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#050707] hover:bg-[#00FFD2]/20 hover:text-[#00FFD2] text-gray-300 border border-white/10 transition-all cursor-pointer"
                  title="الشهر القادم"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleJumpToToday}
                  className="px-3 py-1.5 rounded-xl bg-[#050707] hover:bg-white/10 text-xs text-[#00FFD2] font-bold border border-[#00FFD2]/30 transition-all cursor-pointer"
                >
                  اليوم
                </button>
              </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
              {ARABIC_WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-[11px] sm:text-xs font-bold text-gray-400 bg-[#050707]/60 rounded-xl border border-white/5"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="h-16 sm:h-24 rounded-2xl bg-black/20 border border-white/5 opacity-30"
                />
              ))}

              {/* Month Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const dayMonthStr = String(currentMonth + 1).padStart(2, '0');
                const dayNumStr = String(dayNumber).padStart(2, '0');
                const dateKey = `${currentYear}-${dayMonthStr}-${dayNumStr}`;

                const dayBookings = bookingsByDate[dateKey] || [];
                const hasBookings = dayBookings.length > 0;
                const isToday = dateKey === todayStr;
                const isSelected = dateKey === selectedCalendarDate;

                // Status breakdown for badges
                const hasConfirmed = dayBookings.some((b) => b.status === 'مؤكد');
                const hasPending = dayBookings.some((b) => b.status === 'بانتظار الدفع' || b.status === 'قيد الانتظار');
                const hasCancelled = dayBookings.some((b) => b.status === 'ملغي');

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedCalendarDate(dateKey)}
                    className={`h-16 sm:h-24 p-1.5 sm:p-2 rounded-2xl text-right transition-all flex flex-col justify-between relative cursor-pointer border ${
                      isSelected
                        ? 'border-[#00FFD2] bg-[#00FFD2]/15 shadow-md ring-1 ring-[#00FFD2]'
                        : isToday
                        ? 'border-amber-400/50 bg-amber-400/5'
                        : hasBookings
                        ? 'border-white/20 bg-[#050707] hover:border-[#00FFD2]/50 hover:bg-[#00FFD2]/5'
                        : 'border-white/5 bg-[#050707]/70 hover:border-white/20'
                    }`}
                  >
                    {/* Top Day Number & Today Tag */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs sm:text-sm font-bold font-mono ${
                          isSelected
                            ? 'text-[#00FFD2] font-black'
                            : isToday
                            ? 'text-amber-400 font-black'
                            : 'text-gray-300'
                        }`}
                      >
                        {dayNumber}
                      </span>

                      {isToday && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-400/20 px-1 rounded sm:block hidden">
                          اليوم
                        </span>
                      )}
                    </div>

                    {/* Bookings Badges / Indicators */}
                    {hasBookings && (
                      <div className="w-full space-y-1 mt-auto">
                        {/* Desktop View: Mini Chips */}
                        <div className="hidden sm:flex flex-col gap-0.5 overflow-hidden">
                          {dayBookings.slice(0, 2).map((b) => {
                            const isConf = b.status === 'مؤكد';
                            const isPend = b.status === 'بانتظار الدفع' || b.status === 'قيد الانتظار';
                            return (
                              <div
                                key={b.id}
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${
                                  isConf
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : isPend
                                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                <span className="truncate">{b.playgroundName}</span>
                              </div>
                            );
                          })}
                          {dayBookings.length > 2 && (
                            <span className="text-[9px] text-gray-400 font-mono">
                              +{dayBookings.length - 2} المزيد
                            </span>
                          )}
                        </div>

                        {/* Mobile View: Colored Indicator Dots */}
                        <div className="flex sm:hidden items-center gap-1 justify-end">
                          {hasConfirmed && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400" title="مؤكد" />
                          )}
                          {hasPending && (
                            <span className="w-2 h-2 rounded-full bg-amber-400" title="بانتظار الدفع" />
                          )}
                          {hasCancelled && (
                            <span className="w-2 h-2 rounded-full bg-[#ff2a5f]" title="ملغي" />
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-gray-400">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>حجز مؤكد</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>بانتظار الدفع / قيد الانتظار</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a5f]" />
                  <span>ملغي</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
                  <span>تاريخ اليوم</span>
                </span>
              </div>

              <div className="text-[11px] text-gray-500 font-mono">
                إجمالي مباريات الشهر: {(Object.values(bookingsByDate) as Booking[][]).reduce((acc: number, arr: Booking[]) => acc + arr.length, 0)} مباراة
              </div>
            </div>
          </div>

          {/* Selected Day Bookings Detail Panel */}
          <div className="bg-[#0d1211] border border-[#00FFD2]/30 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h4 className="text-base sm:text-lg font-black text-white font-['Cairo'] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#00FFD2]" />
                  <span>مباريات وحجوزات: {formatArabicDate(selectedCalendarDate)}</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedDayBookings.length > 0
                    ? `يوجد ${selectedDayBookings.length} حجز مجدول في هذا اليوم`
                    : 'لا توجد حجوزات مجدولة في هذا التاريخ المحدد'}
                </p>
              </div>

              {selectedDayBookings.length === 0 && (
                <button
                  onClick={onExplorePlaygrounds}
                  className="px-4 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs glow-primary cursor-pointer self-start sm:self-auto"
                >
                  حجز ملعب لهذا اليوم
                </button>
              )}
            </div>

            {selectedDayBookings.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mx-auto">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <p className="text-xs text-gray-400">
                  لم تقم بحجز أي ملعب بتاريخ {selectedCalendarDate}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {selectedDayBookings.map((booking) => {
                  const isPending = booking.status === 'قيد الانتظار' || booking.status === 'بانتظار الدفع';
                  const isConfirmed = booking.status === 'مؤكد';
                  const isCancelled = booking.status === 'ملغي';

                  return (
                    <div
                      key={booking.id}
                      id={`calendar-booking-card-${booking.id}`}
                      className="bg-[#050707] border border-white/10 rounded-2xl p-5 hover:border-[#00FFD2]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Bar */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-mono">المرجع:</span>
                            <strong className="text-xs font-mono font-bold text-[#00FFD2]">
                              {booking.referenceNumber}
                            </strong>
                          </div>

                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                              isConfirmed
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : isPending
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : isCancelled
                                ? 'bg-[#ff2a5f]/20 text-[#ff2a5f] border border-[#ff2a5f]/40'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {isPending && <Clock className="w-3.5 h-3.5" />}
                            {isCancelled && <XCircle className="w-3.5 h-3.5" />}
                            {booking.status}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          <h3 className="text-base font-bold text-white font-['Cairo']">
                            {booking.playgroundName}
                          </h3>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#00FFD2]" />
                            {booking.governorate} - {booking.detailedArea}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-xs bg-[#0d1211] p-3 rounded-xl border border-white/5">
                            <div>
                              <span className="text-[10px] text-gray-400 block">التوقيت:</span>
                              <strong className="text-white font-bold">{booking.timeSlot}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 block">المدة واللاعبين:</span>
                              <strong className="text-white">
                                {booking.duration} • {booking.playerCount}
                              </strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 block">طريقة الدفع:</span>
                              <strong className="text-[#00FFD2]">{booking.paymentMethod}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 block">المبلغ الإجمالي:</span>
                              <strong className="text-white font-mono">{formatSYP(booking.totalPrice)}</strong>
                            </div>
                          </div>

                          {booking.extraServices && booking.extraServices.length > 0 && (
                            <p className="text-[11px] text-gray-400">
                              ⚡ خدمات إضافية: {booking.extraServices.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const msg = `🏆 *تفاصيل حجز ملعب الكابتن* ⚽\n📌 الملعب: ${booking.playgroundName} (${booking.governorate})\n📅 الموعد: ${booking.selectedDates[0]} (${booking.timeSlot})\n🔢 الرقم المرجعي: ${booking.referenceNumber}\n💰 الإجمالي: ${formatSYP(booking.totalPrice)}`;
                              openWhatsAppShare(msg, booking.managerPhone);
                            }}
                            className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs transition-colors cursor-pointer"
                            title="مشاركة عبر واتساب"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => downloadCalendarEvent(booking)}
                            className="p-2 rounded-xl bg-[#0d1211] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
                            title="إضافة للتقويم .ics"
                          >
                            <Download className="w-4 h-4 text-[#00FFD2]" />
                          </button>

                          {onRebook && (
                            <button
                              onClick={() => onRebook(booking)}
                              className="px-3 py-1.5 rounded-xl bg-[#00FFD2]/10 hover:bg-[#00FFD2] text-[#00FFD2] hover:text-black border border-[#00FFD2]/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                              title="إعادة حجز نفس الملعب والتوقيت"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>إعادة حجز</span>
                            </button>
                          )}
                        </div>

                        {!isCancelled && (
                          <button
                            onClick={() => setCancelModalBooking(booking)}
                            className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-[#ff2a5f] border border-[#ff2a5f]/30 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            إلغاء الحجز
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: VERTICAL LIST VIEW */}
      {viewMode === 'list' && (
        <>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-[#0d1211] rounded-3xl border border-white/5 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base font-['Cairo']">
                  لا توجد أي حجوزات تطابق الفلترة المحددة
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery || filterStatus !== 'الكل'
                    ? 'جرب تغيير خيارات الفلترة أو إفراغ خانة البحث'
                    : 'ابدأ بحجز أول ملعب كروي واستمتع بالمباراة مع أصدقائك'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                {(filterStatus !== 'الكل' || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterStatus('الكل');
                      setSearchQuery('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                )}
                <button
                  onClick={onExplorePlaygrounds}
                  className="px-6 py-2.5 rounded-xl bg-[#00FFD2] text-black font-bold text-xs glow-primary"
                >
                  استعراض الملاعب المتاحة
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookings.map((booking) => {
                const isPending = booking.status === 'قيد الانتظار' || booking.status === 'بانتظار الدفع';
                const isConfirmed = booking.status === 'مؤكد';
                const isCancelled = booking.status === 'ملغي';

                return (
                  <div
                    key={booking.id}
                    id={`booking-card-${booking.id}`}
                    className="bg-[#0d1211] border border-white/10 rounded-2xl p-5 hover:border-[#00FFD2]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-mono">المرجع:</span>
                          <strong className="text-xs font-mono font-bold text-[#00FFD2]">
                            {booking.referenceNumber}
                          </strong>
                        </div>

                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                            isConfirmed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : isPending
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : isCancelled
                              ? 'bg-[#ff2a5f]/20 text-[#ff2a5f] border border-[#ff2a5f]/40'
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {isPending && <Clock className="w-3.5 h-3.5" />}
                          {isCancelled && <XCircle className="w-3.5 h-3.5" />}
                          {booking.status}
                        </span>
                      </div>

                      {/* Pitch and match details */}
                      <div className="space-y-2 mb-4">
                        <h3 className="text-base font-bold text-white font-['Cairo']">
                          {booking.playgroundName}
                        </h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#00FFD2]" />
                          {booking.governorate} - {booking.detailedArea}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-[#050707] p-3 rounded-xl border border-white/5">
                          <div>
                            <span className="text-[10px] text-gray-400 block">الموعد:</span>
                            <strong className="text-white">
                              {booking.selectedDates[0]} ({booking.timeSlot})
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">المدة واللاعبين:</span>
                            <strong className="text-white">
                              {booking.duration} • {booking.playerCount}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">طريقة الدفع:</span>
                            <strong className="text-[#00FFD2]">{booking.paymentMethod}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">المبلغ الإجمالي:</span>
                            <strong className="text-white font-mono">{formatSYP(booking.totalPrice)}</strong>
                          </div>
                        </div>

                        {booking.extraServices && booking.extraServices.length > 0 && (
                          <p className="text-[11px] text-gray-400">
                            ⚡ خدمات إضافية: {booking.extraServices.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const msg = `🏆 *تفاصيل حجز ملعب الكابتن* ⚽\n📌 الملعب: ${booking.playgroundName} (${booking.governorate})\n📅 الموعد: ${booking.selectedDates[0]} (${booking.timeSlot})\n🔢 الرقم المرجعي: ${booking.referenceNumber}\n💰 الإجمالي: ${formatSYP(booking.totalPrice)}`;
                            openWhatsAppShare(msg, booking.managerPhone);
                          }}
                          className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs transition-colors cursor-pointer"
                          title="مشاركة عبر واتساب"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => downloadCalendarEvent(booking)}
                          className="p-2 rounded-xl bg-[#050707] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
                          title="إضافة للتقويم .ics"
                        >
                          <Download className="w-4 h-4 text-[#00FFD2]" />
                        </button>

                        {onRebook && (
                          <button
                            onClick={() => onRebook(booking)}
                            className="px-3 py-1.5 rounded-xl bg-[#00FFD2]/10 hover:bg-[#00FFD2] text-[#00FFD2] hover:text-black border border-[#00FFD2]/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            title="إعادة حجز نفس الملعب والتوقيت"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>إعادة حجز</span>
                          </button>
                        )}
                      </div>

                      {!isCancelled && (
                        <button
                          onClick={() => setCancelModalBooking(booking)}
                          className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-[#ff2a5f] border border-[#ff2a5f]/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          إلغاء الحجز
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setCancelModalBooking(null)}
        >
          <div
            className="bg-[#0d1211] border-2 border-[#ff2a5f]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#ff2a5f]/20 text-[#ff2a5f] flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-white font-['Cairo']">
              هل أنت متأكد من إلغاء الحجز؟
            </h3>
            <p className="text-xs text-gray-300">
              سيتم إلغاء حجزك لـ <strong>{cancelModalBooking.playgroundName}</strong> برقم مرجعي{' '}
              <span className="font-mono text-[#00FFD2]">{cancelModalBooking.referenceNumber}</span> وإتاحته للمستخدمين الآخرين.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-bold hover:bg-white/20 transition-all cursor-pointer"
              >
                تراجع
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-xl bg-[#ff2a5f] hover:bg-red-600 text-white text-xs font-bold glow-pink transition-all cursor-pointer"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
