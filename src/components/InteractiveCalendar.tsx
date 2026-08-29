import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  AlertCircle,
  Users,
  Shield,
  Filter,
  DollarSign,
  Phone,
  Search,
  ExternalLink
} from 'lucide-react';
import { Booking, Playground, SyrianGovernorate, BookingStatus } from '../types';
import { formatSYP } from '../utils/helpers';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';

interface InteractiveCalendarProps {
  bookings: Booking[];
  playgrounds: Playground[];
  currentUser?: any;
  onAddBooking?: (newBooking: Booking) => void;
  onUpdateBookingStatus?: (bookingId: string, status: BookingStatus) => void;
}

export default function InteractiveCalendar({
  bookings,
  playgrounds,
  currentUser,
  onAddBooking,
  onUpdateBookingStatus
}: InteractiveCalendarProps) {
  // Current viewed month and year
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('الكل');
  const [selectedPlaygroundId, setSelectedPlaygroundId] = useState<string>('الكل');
  const [statusFilter, setStatusFilter] = useState<string>('الكل');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Booking Form State
  const [newPgId, setNewPgId] = useState(playgrounds[0]?.id || '');
  const [newUserName, setNewUserName] = useState(currentUser?.name || '');
  const [newUserPhone, setNewUserPhone] = useState(currentUser?.phone || '');
  const [newTimeSlot, setNewTimeSlot] = useState('20:00 - 21:30');
  const [newDuration, setNewDuration] = useState<'ساعة' | 'ساعة ونصف' | 'ساعتين'>('ساعة ونصف');
  const [newPlayerCount, setNewPlayerCount] = useState<'6v6' | '7v7' | '8v8' | '9v9' | '10v10' | '11v11'>('7v7');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'نقداً عند الحضور (كاش)' | 'شام كاش'>('نقداً عند الحضور (كاش)');

  const isAuthorized = Boolean(
    currentUser?.isAdmin ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'organizer' ||
    currentUser?.role === 'league_manager'
  );

  const monthNames = [
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

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Calendar Grid Calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday, 6 = Saturday

  // Arabic day names starting from Saturday
  const weekDaysArabic = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  // Adjust offset for Saturday as first day of week: Saturday (6 -> 0), Sunday (0 -> 1), etc.
  const satOffset = (firstDayOfWeek + 1) % 7;

  // Map bookings to dates for rapid lookup
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach((b) => {
      // Filter by playground & governorate & status
      if (selectedGovernorate !== 'الكل' && b.governorate !== selectedGovernorate) return;
      if (selectedPlaygroundId !== 'الكل' && b.playgroundId !== selectedPlaygroundId) return;
      if (statusFilter !== 'الكل' && b.status !== statusFilter) return;

      b.selectedDates.forEach((d) => {
        if (!map[d]) map[d] = [];
        map[d].push(b);
      });
    });
    return map;
  }, [bookings, selectedGovernorate, selectedPlaygroundId, statusFilter]);

  // Filtered bookings for the selected date
  const selectedDateBookings = useMemo(() => {
    return bookingsByDate[selectedDate] || [];
  }, [bookingsByDate, selectedDate]);

  const handleQuickCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddBooking) return;

    const targetPg = playgrounds.find((p) => p.id === newPgId) || playgrounds[0];
    if (!targetPg) return;

    const rateMap: Record<string, number> = {
      ساعة: 1,
      'ساعة ونصف': 1.5,
      ساعتين: 2
    };
    const multiplier = rateMap[newDuration] || 1.5;
    const totalPrice = Math.round(targetPg.pricePerHour * multiplier);

    const refNum = `KAP-${currentYear}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      referenceNumber: refNum,
      playgroundId: targetPg.id,
      playgroundName: targetPg.name,
      governorate: targetPg.governorate,
      detailedArea: targetPg.detailedArea,
      userId: currentUser?.id || 'admin-direct',
      userName: newUserName.trim() || 'كابتن معتمد',
      userPhone: newUserPhone.trim() || '0988000111',
      selectedDates: [selectedDate],
      timeSlot: newTimeSlot,
      duration: newDuration,
      playerCount: newPlayerCount,
      totalPrice,
      paymentMethod: newPaymentMethod,
      status: 'مؤكد',
      createdAt: new Date().toISOString(),
      managerPhone: targetPg.managerPhone
    };

    onAddBooking(newBooking);
    setIsCreateModalOpen(false);
  };

  return (
    <div id="interactive-calendar-view" className="space-y-6 animate-fadeIn font-['Cairo']">
      {/* Header Banner */}
      <div className="bg-[#0d1211] border border-[#00FFD2]/30 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/30">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              التقويم التفاعلي لحجوزات الملاعب السورية
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              مزامنة فورية ⚡
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            جدولة ومتابعة فورية للحجوزات الحالية والمستقبلية لجميع الملاعب والمنشآت الرياضية
          </p>
        </div>

        {/* Quick Actions & Role Guard */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
          {isAuthorized ? (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#00FFD2] to-[#00b293] text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#00FFD2]/20 hover:scale-105 transition-transform cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حجز عبر التقويم</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#00FFD2]" />
              <span>عرض للقراءة فقط (صلاحيات الإدارة مطلوبة للإضافة)</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          {/* Governorate Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#00FFD2]" />
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="bg-[#050707] border border-white/20 rounded-xl px-2.5 py-1.5 text-white focus:border-[#00FFD2] focus:outline-none"
            >
              <option value="الكل">كافة المحافظات ({SYRIAN_GOVERNORATES.length})</option>
              {SYRIAN_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>

          {/* Playground Selector */}
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedPlaygroundId}
              onChange={(e) => setSelectedPlaygroundId(e.target.value)}
              className="bg-[#050707] border border-white/20 rounded-xl px-2.5 py-1.5 text-white focus:border-[#00FFD2] focus:outline-none max-w-[180px] truncate"
            >
              <option value="الكل">كافة الملاعب ({playgrounds.length})</option>
              {playgrounds
                .filter((p) => selectedGovernorate === 'الكل' || p.governorate === selectedGovernorate)
                .map((pg) => (
                  <option key={pg.id} value={pg.id}>
                    {pg.name} ({pg.governorate})
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#050707] border border-white/20 rounded-xl px-2.5 py-1.5 text-white focus:border-[#00FFD2] focus:outline-none"
            >
              <option value="الكل">كافة الحالات</option>
              <option value="مؤكد">مؤكد</option>
              <option value="قيد الانتظار">قيد الانتظار</option>
              <option value="ملغي">ملغي</option>
              <option value="مكتمل">مكتمل</option>
            </select>
          </div>
        </div>

        {/* Selected Date Indicator */}
        <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>اليوم المحدد: {selectedDate}</span>
        </div>
      </div>

      {/* Main Calendar View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: Calendar Matrix (8 cols) */}
        <div className="lg:col-span-8 bg-[#0d1211] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => {
                  setCurrentYear(today.getFullYear());
                  setCurrentMonth(today.getMonth());
                  setSelectedDate(today.toISOString().split('T')[0]);
                }}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-[#00FFD2] border border-white/10"
              >
                اليوم
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                title="الشهر السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                title="الشهر التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 text-xs py-2 bg-[#050707] rounded-xl border border-white/5">
            {weekDaysArabic.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots for month offset */}
            {Array.from({ length: satOffset }).map((_, idx) => (
              <div
                key={`offset-${idx}`}
                className="min-h-[70px] sm:min-h-[85px] rounded-xl bg-white/[0.01] border border-transparent opacity-30"
              />
            ))}

            {/* Days of Current Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayBookings = bookingsByDate[dateString] || [];
              const isSelected = selectedDate === dateString;
              const isToday = today.toISOString().split('T')[0] === dateString;

              return (
                <button
                  key={dateString}
                  onClick={() => setSelectedDate(dateString)}
                  className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-[#00FFD2]/15 border-[#00FFD2] shadow-lg shadow-[#00FFD2]/10 scale-[1.02]'
                      : isToday
                      ? 'bg-blue-500/10 border-blue-500/40 hover:border-blue-500/70'
                      : 'bg-[#050707] border-white/5 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-black ${
                        isSelected
                          ? 'text-[#00FFD2]'
                          : isToday
                          ? 'text-blue-400 font-black underline'
                          : 'text-gray-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[9px] px-1 rounded bg-blue-500 text-white font-bold">
                        اليوم
                      </span>
                    )}
                  </div>

                  {/* Booking count pill indicator */}
                  <div className="w-full mt-1">
                    {dayBookings.length > 0 ? (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#00FFD2]/20 border border-[#00FFD2]/40 text-[#00FFD2] text-[10px] font-bold">
                          {dayBookings.length} حجز
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-600 block text-center">شاغر</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Date Booking Details & Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#00FFD2]" />
                  حجوزات {selectedDate}
                </h4>
                <span className="text-[11px] text-gray-400">
                  {selectedDateBookings.length} حجز مسجل في هذا اليوم
                </span>
              </div>

              {isAuthorized && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-2 rounded-xl bg-[#00FFD2]/20 text-[#00FFD2] hover:bg-[#00FFD2] hover:text-black transition-colors"
                  title="إضافة حجز في هذا اليوم"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* List of Bookings for selected date */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {selectedDateBookings.length === 0 ? (
                <div className="text-center py-10 space-y-3 bg-[#050707] rounded-2xl border border-white/5">
                  <CalendarIcon className="w-10 h-10 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400">لا توجد حجوزات مسجلة لتاريخ {selectedDate}</p>
                  {isAuthorized && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#00FFD2]/20 text-[#00FFD2] text-xs font-bold hover:bg-[#00FFD2] hover:text-black transition-colors"
                    >
                      + حجز وقت شاغر الآن
                    </button>
                  )}
                </div>
              ) : (
                selectedDateBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-[#050707] border border-white/10 hover:border-white/20 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-white font-bold block text-sm">
                        {b.playgroundName}
                      </strong>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'مؤكد'
                            ? 'bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/30'
                            : b.status === 'ملغي'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>{b.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{b.governorate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>{b.userName}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{b.userPhone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[11px]">
                      <span className="text-[#00FFD2] font-mono font-bold">
                        {formatSYP(b.totalPrice)}
                      </span>
                      <span className="text-gray-500 font-mono">{b.referenceNumber}</span>
                    </div>

                    {/* Admin Status Controls */}
                    {isAuthorized && onUpdateBookingStatus && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {b.status !== 'مؤكد' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'مؤكد')}
                            className="flex-1 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-bold text-[10px] transition-colors"
                          >
                            تأكيد الحجز
                          </button>
                        )}
                        {b.status !== 'ملغي' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'ملغي')}
                            className="flex-1 py-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-bold text-[10px] transition-colors"
                          >
                            إلغاء
                          </button>
                        )}
                        {b.status !== 'مكتمل' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'مكتمل')}
                            className="flex-1 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white font-bold text-[10px] transition-colors"
                          >
                            اكتمال
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Quick Create Booking Directly from Calendar */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0d1211] border border-[#00FFD2]/40 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#00FFD2]" />
                إضافة حجز جديد للتقويم ({selectedDate})
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickCreateBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 mb-1 font-bold">اختر الملعب والمنشأة الرياضية:</label>
                <select
                  value={newPgId}
                  onChange={(e) => setNewPgId(e.target.value)}
                  className="w-full bg-[#050707] border border-white/20 rounded-xl p-2.5 text-white focus:border-[#00FFD2]"
                  required
                >
                  {playgrounds.map((pg) => (
                    <option key={pg.id} value={pg.id}>
                      {pg.name} - {pg.governorate} ({formatSYP(pg.pricePerHour)}/ساعة)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-bold">اسم الحاجز / الكابتن:</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="مثال: كابتن أحمد"
                    className="w-full bg-[#050707] border border-white/20 rounded-xl p-2.5 text-white focus:border-[#00FFD2]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-bold">رقم هاتف الحاجز:</label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="09xxxxxxxx"
                    className="w-full bg-[#050707] border border-white/20 rounded-xl p-2.5 text-white focus:border-[#00FFD2] font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-bold">الفترة الزمنية (Time Slot):</label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full bg-[#050707] border border-white/20 rounded-xl p-2.5 text-white focus:border-[#00FFD2]"
                  >
                    <option value="17:00 - 18:30">17:00 - 18:30 (عصر)</option>
                    <option value="18:30 - 20:00">18:30 - 20:00 (مساء)</option>
                    <option value="20:00 - 21:30">20:00 - 21:30 (سهرة)</option>
                    <option value="21:30 - 23:00">21:30 - 23:00 (سهرة متأخرة)</option>
                    <option value="23:00 - 00:30">23:00 - 00:30 (ليلي)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-bold">طريقة الدفع:</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#050707] border border-white/20 rounded-xl p-2.5 text-white focus:border-[#00FFD2]"
                  >
                    <option value="نقداً عند الحضور (كاش)">نقداً عند الحضور (كاش 0% عمولة)</option>
                    <option value="شام كاش">شام كاش (Sham Cash)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black flex items-center gap-1.5 shadow-lg shadow-[#00FFD2]/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد وتسجيل الحجز في التقويم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
