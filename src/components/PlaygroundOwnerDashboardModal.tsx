import React, { useState, useMemo } from 'react';
import {
  X,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  User,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Search,
  Printer,
  Sparkles,
  TrendingUp,
  MapPin,
  Layers,
  ChevronDown,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { Playground, Booking, UserProfile, BookingDuration, PaymentMethodType } from '../types';
import { formatSYP, exportToExcel, exportPlaygroundReportExcel } from '../utils/helpers';
import jsPDF from 'jspdf';

interface PlaygroundOwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playgrounds: Playground[];
  bookings: Booking[];
  currentUser: UserProfile;
  onAddOfflineBooking: (newBooking: Booking) => void;
  onUpdateBooking: (updatedBooking: Booking) => void;
  onDeleteBooking: (bookingId: string) => void;
  onUpdatePlaygroundInfo?: (updatedPg: Playground) => void;
}

export default function PlaygroundOwnerDashboardModal({
  isOpen,
  onClose,
  playgrounds,
  bookings,
  currentUser,
  onAddOfflineBooking,
  onUpdateBooking,
  onDeleteBooking,
  onUpdatePlaygroundInfo
}: PlaygroundOwnerDashboardModalProps) {
  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'أدمن' || currentUser.isAdmin === true;

  // Filter playgrounds that belong to this advertiser (or all if admin)
  const myPlaygrounds = useMemo(() => {
    if (isAdmin) return playgrounds;
    return playgrounds.filter(
      (p) =>
        p.managerPhone === currentUser.phone ||
        p.managerName === currentUser.name ||
        (p as any).ownerId === currentUser.id
    );
  }, [playgrounds, currentUser, isAdmin]);

  // Fallback to first playground in workspace if advertiser has none explicitly assigned yet
  const availablePlaygrounds = myPlaygrounds.length > 0 ? myPlaygrounds : playgrounds.slice(0, 3);

  const [selectedPlaygroundId, setSelectedPlaygroundId] = useState<string>(
    availablePlaygrounds[0]?.id || ''
  );

  const currentPlayground = useMemo(() => {
    return availablePlaygrounds.find((p) => p.id === selectedPlaygroundId) || availablePlaygrounds[0];
  }, [availablePlaygrounds, selectedPlaygroundId]);

  // Filter criteria
  const [filterSource, setFilterSource] = useState<'الكل' | 'online' | 'offline'>('الكل');
  const [filterStatus, setFilterStatus] = useState<'الكل' | 'مؤكد' | 'ملغي' | 'منتهي' | 'مدفوع' | 'غير مدفوع'>('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Add / Edit
  const [isAddOfflineOpen, setIsAddOfflineOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // New Offline Booking Form State
  const [offlineDate, setOfflineDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [offlineTime, setOfflineTime] = useState('18:00 - 19:30');
  const [offlineDuration, setOfflineDuration] = useState<BookingDuration>('ساعة ونصف');
  const [offlinePersonName, setOfflinePersonName] = useState('');
  const [offlinePhone, setOfflinePhone] = useState('');
  const [offlineAmount, setOfflineAmount] = useState<number>(currentPlayground?.pricePerHour || 120000);
  const [offlinePaymentMethod, setOfflinePaymentMethod] = useState<'نقداً' | 'شام كاش' | 'محفظة'>('نقداً');
  const [offlinePaymentStatus, setOfflinePaymentStatus] = useState<'مدفوع' | 'غير مدفوع' | 'قيد الانتظار'>('مدفوع');
  const [offlineNotes, setOfflineNotes] = useState('');

  // Edit Booking Form State
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDuration, setEditDuration] = useState<BookingDuration>('ساعة ونصف');
  const [editPersonName, setEditPersonName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('نقداً');
  const [editPaymentStatus, setEditPaymentStatus] = useState<'مدفوع' | 'غير مدفوع' | 'قيد الانتظار'>('مدفوع');
  const [editBookingStatus, setEditBookingStatus] = useState<'مؤكد' | 'ملغي' | 'منتهي'>('مؤكد');
  const [editNotes, setEditNotes] = useState('');

  // All bookings for this playground
  const playgroundBookings = useMemo(() => {
    if (!currentPlayground) return [];
    return bookings.filter(
      (b) => b.playgroundId === currentPlayground.id || b.playgroundName === currentPlayground.name
    );
  }, [bookings, currentPlayground]);

  // Today string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []); // YYYY-MM

  // Quick KPI Statistics
  const stats = useMemo(() => {
    let thisMonthCount = 0;
    let todayCount = 0;
    let totalRev = 0;
    let thisMonthRev = 0;

    playgroundBookings.forEach((b) => {
      const isCancelled = b.status === 'ملغي';
      const isPaid = b.paymentStatus === 'مدفوع' || (!b.paymentStatus && b.status === 'مؤكد');
      const bDate = b.selectedDates?.[0] || '';

      if (bDate === todayStr) {
        todayCount++;
      }
      if (bDate.startsWith(currentMonthStr)) {
        thisMonthCount++;
        if (!isCancelled) {
          thisMonthRev += b.totalPrice || 0;
        }
      }
      if (!isCancelled) {
        totalRev += b.totalPrice || 0;
      }
    });

    return {
      totalBookings: playgroundBookings.length,
      thisMonthBookings: thisMonthCount,
      todayBookings: todayCount,
      totalRevenue: totalRev,
      thisMonthRevenue: thisMonthRev
    };
  }, [playgroundBookings, todayStr, currentMonthStr]);

  // Filtered Table Bookings
  const filteredTableBookings = useMemo(() => {
    return playgroundBookings.filter((b) => {
      // Source filter
      if (filterSource === 'online' && b.source === 'offline') return false;
      if (filterSource === 'offline' && b.source !== 'offline') return false;

      // Status filter
      if (filterStatus === 'مؤكد' && b.status !== 'مؤكد') return false;
      if (filterStatus === 'ملغي' && b.status !== 'ملغي') return false;
      if (filterStatus === 'منتهي' && b.status !== 'منتهي' && b.status !== 'مكتمل') return false;
      if (filterStatus === 'مدفوع' && b.paymentStatus !== 'مدفوع') return false;
      if (filterStatus === 'غير مدفوع' && b.paymentStatus !== 'غير مدفوع') return false;

      // Search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesRef = b.referenceNumber?.toLowerCase().includes(q);
        const matchesName = b.userName?.toLowerCase().includes(q);
        const matchesPhone = b.userPhone?.toLowerCase().includes(q);
        const matchesDate = b.selectedDates?.some((d) => d.includes(q));
        if (!matchesRef && !matchesName && !matchesPhone && !matchesDate) return false;
      }

      return true;
    });
  }, [playgroundBookings, filterSource, filterStatus, searchQuery]);

  // Open Edit Modal with prefilled values
  const handleStartEdit = (b: Booking) => {
    setEditingBooking(b);
    setEditDate(b.selectedDates?.[0] || todayStr);
    setEditTime(b.timeSlot || '18:00 - 19:30');
    setEditDuration(b.duration || 'ساعة ونصف');
    setEditPersonName(b.userName || '');
    setEditPhone(b.userPhone || '');
    setEditAmount(b.totalPrice || currentPlayground?.pricePerHour || 120000);
    setEditPaymentMethod(b.paymentMethod || 'نقداً');
    setEditPaymentStatus(b.paymentStatus || 'مدفوع');
    setEditBookingStatus((b.status === 'ملغي' ? 'ملغي' : b.status === 'منتهي' ? 'منتهي' : 'مؤكد'));
    setEditNotes(b.notes || b.specialRequests || '');
  };

  // Submit Add Offline Booking
  const handleSaveOfflineBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlinePersonName.trim() || !offlinePhone.trim() || !currentPlayground) {
      alert('يرجى إدخال اسم الشخص ورقم الجوال');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newB: Booking = {
      id: `bk-offline-${Date.now()}`,
      referenceNumber: `KAP-OFF-${randomSuffix}`,
      playgroundId: currentPlayground.id,
      playgroundName: currentPlayground.name,
      governorate: currentPlayground.governorate,
      detailedArea: currentPlayground.detailedArea,
      userId: `offline-user-${Date.now()}`,
      userName: offlinePersonName.trim(),
      userPhone: offlinePhone.trim(),
      selectedDates: [offlineDate],
      timeSlot: offlineTime,
      duration: offlineDuration,
      playerCount: currentPlayground.capacity || '7v7',
      totalPrice: Number(offlineAmount),
      paymentMethod: offlinePaymentMethod,
      paymentStatus: offlinePaymentStatus,
      status: 'مؤكد',
      source: 'offline',
      notes: offlineNotes.trim(),
      createdAt: new Date().toISOString(),
      managerPhone: currentPlayground.managerPhone
    };

    onAddOfflineBooking(newB);
    setIsAddOfflineOpen(false);
    // Reset fields
    setOfflinePersonName('');
    setOfflinePhone('');
    setOfflineNotes('');
  };

  // Submit Edit Booking
  const handleSaveEditedBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    const updated: Booking = {
      ...editingBooking,
      selectedDates: [editDate],
      timeSlot: editTime,
      duration: editDuration,
      userName: editPersonName.trim(),
      userPhone: editPhone.trim(),
      totalPrice: Number(editAmount),
      paymentMethod: editPaymentMethod,
      paymentStatus: editPaymentStatus,
      status: editBookingStatus as any,
      notes: editNotes.trim()
    };

    onUpdateBooking(updated);
    setEditingBooking(null);
  };

  // Confirm payment shortcut
  const handleQuickConfirmPayment = (b: Booking) => {
    const updated: Booking = {
      ...b,
      paymentStatus: 'مدفوع',
      status: 'مؤكد'
    };
    onUpdateBooking(updated);
  };

  // Export PDF Report for Playground
  const handleExportPdfReport = () => {
    if (!currentPlayground) return;
    const doc = new jsPDF();
    doc.text(`Al-Kaptan - Playground Report: ${currentPlayground.name}`, 14, 20);
    doc.text(`Location: ${currentPlayground.governorate} - ${currentPlayground.detailedArea}`, 14, 28);
    doc.text(`Total Bookings: ${stats.totalBookings} | Total Revenue: ${formatSYP(stats.totalRevenue)}`, 14, 36);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 44);

    let y = 56;
    filteredTableBookings.slice(0, 20).forEach((b, i) => {
      doc.text(
        `${i + 1}. ${b.referenceNumber} | ${b.selectedDates?.[0]} (${b.timeSlot}) | ${b.userName} | ${b.totalPrice} SYP | Status: ${b.status} (${b.source || 'online'})`,
        14,
        y
      );
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`AlKaptan_Report_${currentPlayground.name.replace(/\s+/g, '_')}.pdf`);
  };

  // Export Excel Report for Playground
  const handleExportExcelReport = () => {
    if (!currentPlayground) return;
    exportPlaygroundReportExcel(currentPlayground, bookings);
  };

  return (
    <div
      id="modal-playground-owner-dashboard"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#00FFD2]/40 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#050707] border-b border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex items-center justify-center text-[#00FFD2]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  🏟️ لوحة تحكم المعلن - إدارة ملعبي
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#00FFD2]/10 text-[#00FFD2] text-[10px] font-bold border border-[#00FFD2]/30">
                  {isAdmin ? 'وضع الإدارة الشاملة (Admin)' : 'صاحب الملعب'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                إدارة الحجوزات الداخلية والخارجية، متابعة الإيرادات، وتأكيد الدفعات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Playground Selector if multiple */}
            {availablePlaygrounds.length > 1 && (
              <div className="relative">
                <select
                  value={selectedPlaygroundId}
                  onChange={(e) => setSelectedPlaygroundId(e.target.value)}
                  className="bg-[#0d1211] border border-[#00FFD2]/40 text-[#00FFD2] rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  {availablePlaygrounds.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#050707] text-white">
                      {p.name} ({p.governorate})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: Playground Info Bar */}
          {currentPlayground && (
            <div className="bg-[#050707] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={currentPlayground.image || currentPlayground.images?.[0] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018'}
                  alt={currentPlayground.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#00FFD2]/30 shrink-0"
                />
                <div>
                  <h3 className="text-base font-black text-white">{currentPlayground.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00FFD2]" />
                    <span>
                      {currentPlayground.governorate} - {currentPlayground.detailedArea}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-300 mt-1">
                    <span>🌱 الأرضية: {currentPlayground.surface}</span>
                    <span>👥 السعة: {currentPlayground.capacity}</span>
                    <span className="text-[#00FFD2] font-mono font-bold">
                      💰 {formatSYP(currentPlayground.pricePerHour)}/ساعة
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => setIsAddOfflineOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs glow-primary flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>➕ إضافة حجز خارجي (يدوي)</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 2: Quick Statistics & KPI Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#00FFD2]" />
                <span>📊 إحصائيات سريعة للملعب</span>
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Total Bookings */}
              <div className="bg-[#050707] p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-gray-400 block">إجمالي الحجوزات</span>
                <strong className="text-lg font-black text-white font-mono">{stats.totalBookings}</strong>
              </div>

              {/* This Month Bookings */}
              <div className="bg-[#050707] p-3.5 rounded-2xl border border-[#00FFD2]/20">
                <span className="text-[11px] text-gray-400 block">حجوزات هذا الشهر</span>
                <strong className="text-lg font-black text-[#00FFD2] font-mono">{stats.thisMonthBookings}</strong>
              </div>

              {/* Today Bookings */}
              <div className="bg-[#050707] p-3.5 rounded-2xl border border-amber-400/20">
                <span className="text-[11px] text-gray-400 block">حجوزات اليوم</span>
                <strong className="text-lg font-black text-amber-400 font-mono">{stats.todayBookings}</strong>
              </div>

              {/* Total Revenue */}
              <div className="bg-[#050707] p-3.5 rounded-2xl border border-emerald-500/20">
                <span className="text-[11px] text-gray-400 block">إجمالي الإيرادات</span>
                <strong className="text-sm sm:text-base font-black text-emerald-400 font-mono block truncate">
                  {formatSYP(stats.totalRevenue)}
                </strong>
              </div>

              {/* This Month Revenue */}
              <div className="bg-[#050707] p-3.5 rounded-2xl border border-purple-500/20 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-gray-400 block">إيرادات هذا الشهر</span>
                <strong className="text-sm sm:text-base font-black text-purple-400 font-mono block truncate">
                  {formatSYP(stats.thisMonthRevenue)}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 3: Bookings Filter & Action Bar */}
          <div className="bg-[#050707] p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Source Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs text-gray-400 ml-1">المصدر:</span>
                <button
                  onClick={() => setFilterSource('الكل')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterSource === 'الكل'
                      ? 'bg-[#00FFD2] text-black glow-primary'
                      : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  الكل ({playgroundBookings.length})
                </button>
                <button
                  onClick={() => setFilterSource('online')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterSource === 'online'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  🌐 من البرنامج (Online)
                </button>
                <button
                  onClick={() => setFilterSource('offline')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterSource === 'offline'
                      ? 'bg-amber-400 text-black shadow-md font-extrabold'
                      : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  📞 خارج البرنامج (Offline)
                </button>
              </div>

              {/* Status Select & Report Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-[#0d1211] border border-white/10 text-xs text-gray-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="الكل">كل الحالات</option>
                  <option value="مؤكد">مؤكد</option>
                  <option value="مدفوع">مدفوع</option>
                  <option value="غير مدفوع">غير مدفوع</option>
                  <option value="ملغي">ملغي</option>
                  <option value="منتهي">منتهي</option>
                </select>

                <button
                  onClick={handleExportExcelReport}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                  title="تصدير كشف حساب وإحصائيات وحجوزات هذا الملعب إلى ملف إكسل XLSX"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>تصدير إكسل (XLSX)</span>
                </button>

                <button
                  onClick={handleExportPdfReport}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1 border border-white/10 cursor-pointer"
                  title="طباعة تقرير PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-[#00FFD2]" />
                  <span>تقرير PDF</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث برقم الحجز، اسم الزبون، أو رقم الجوال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1211] border border-white/10 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-gray-500 focus:border-[#00FFD2] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 4: Full 11-Column Bookings Management Table */}
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#050707]">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0d1211] text-gray-400 border-b border-white/10 text-[11px]">
                  <tr>
                    <th className="p-3"># رقم الحجز</th>
                    <th className="p-3">📅 التاريخ</th>
                    <th className="p-3">⏰ الوقت</th>
                    <th className="p-3">⏳ المدة</th>
                    <th className="p-3">👤 اسم الشخص</th>
                    <th className="p-3">📱 رقم الجوال</th>
                    <th className="p-3">💰 المبلغ</th>
                    <th className="p-3">💳 طريقة الدفع</th>
                    <th className="p-3">📌 الحالة</th>
                    <th className="p-3">🌐 المصدر</th>
                    <th className="p-3 text-center">⚡ إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTableBookings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-gray-400">
                        لا توجد حجوزات تطابق معايير الفلترة المحددة
                      </td>
                    </tr>
                  ) : (
                    filteredTableBookings.map((booking) => {
                      const isOffline = booking.source === 'offline';
                      const isPaid =
                        booking.paymentStatus === 'مدفوع' ||
                        (!booking.paymentStatus && booking.status === 'مؤكد');
                      const isCancelled = booking.status === 'ملغي';

                      return (
                        <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-mono font-bold text-[#00FFD2]">
                            {booking.referenceNumber}
                          </td>
                          <td className="p-3 whitespace-nowrap text-gray-200">
                            {booking.selectedDates?.[0] || 'غير محدد'}
                          </td>
                          <td className="p-3 whitespace-nowrap text-gray-200">{booking.timeSlot}</td>
                          <td className="p-3 text-gray-400 whitespace-nowrap">{booking.duration}</td>
                          <td className="p-3 font-bold text-white whitespace-nowrap">
                            {booking.userName}
                          </td>
                          <td className="p-3 font-mono text-gray-300 whitespace-nowrap">
                            {booking.userPhone}
                          </td>
                          <td className="p-3 font-mono font-bold text-white whitespace-nowrap">
                            {formatSYP(booking.totalPrice)}
                          </td>
                          <td className="p-3 text-gray-300 whitespace-nowrap">
                            {booking.paymentMethod}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isCancelled
                                  ? 'bg-red-500/20 text-red-400'
                                  : isPaid
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-400/20 text-amber-300'
                              }`}
                            >
                              {isCancelled ? 'ملغي' : isPaid ? 'مدفوع ومؤكد' : 'قيد الانتظار'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isOffline
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {isOffline ? 'خارجي (Offline)' : 'تطبيق (Online)'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {!isPaid && !isCancelled && (
                                <button
                                  onClick={() => handleQuickConfirmPayment(booking)}
                                  className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 transition-colors cursor-pointer"
                                  title="تأكيد استلام الدفع"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => handleStartEdit(booking)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                title="تعديل الحجز"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`هل أنت متأكد من حذف الحجز ${booking.referenceNumber}؟`)) {
                                    onDeleteBooking(booking.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-[#ff2a5f] transition-colors cursor-pointer"
                                title="حذف الحجز"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal 1: Add Offline Booking Modal */}
        {isAddOfflineOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsAddOfflineOpen(false)}
          >
            <div
              className="bg-[#0d1211] border-2 border-[#00FFD2]/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#00FFD2]" />
                  <span>➕ إضافة حجز جديد (خارج البرنامج)</span>
                </h3>
                <button
                  onClick={() => setIsAddOfflineOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOfflineBooking} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">📅 التاريخ *</label>
                    <input
                      type="date"
                      value={offlineDate}
                      onChange={(e) => setOfflineDate(e.target.value)}
                      required
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">⏰ الوقت *</label>
                    <input
                      type="text"
                      value={offlineTime}
                      onChange={(e) => setOfflineTime(e.target.value)}
                      placeholder="18:00 - 19:30"
                      required
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">⏳ المدة</label>
                    <select
                      value={offlineDuration}
                      onChange={(e) => setOfflineDuration(e.target.value as BookingDuration)}
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="ساعة">ساعة</option>
                      <option value="ساعة ونصف">ساعة ونصف</option>
                      <option value="ساعتين">ساعتين</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">💰 المبلغ (ل.س) *</label>
                    <input
                      type="number"
                      value={offlineAmount}
                      onChange={(e) => setOfflineAmount(Number(e.target.value))}
                      required
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">👤 اسم الشخص *</label>
                    <input
                      type="text"
                      value={offlinePersonName}
                      onChange={(e) => setOfflinePersonName(e.target.value)}
                      placeholder="اسم الحاجز"
                      required
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">📱 رقم الجوال *</label>
                    <input
                      type="text"
                      value={offlinePhone}
                      onChange={(e) => setOfflinePhone(e.target.value)}
                      placeholder="09XXXXXXXX"
                      required
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">💳 طريقة الدفع</label>
                    <select
                      value={offlinePaymentMethod}
                      onChange={(e) => setOfflinePaymentMethod(e.target.value as any)}
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="نقداً">نقداً (كاش)</option>
                      <option value="شام كاش">شام كاش</option>
                      <option value="محفظة">محفظة إلكترونية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">📌 حالة الدفع</label>
                    <select
                      value={offlinePaymentStatus}
                      onChange={(e) => setOfflinePaymentStatus(e.target.value as any)}
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="مدفوع">مدفوع</option>
                      <option value="غير مدفوع">غير مدفوع</option>
                      <option value="قيد الانتظار">قيد الانتظار</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-300 mb-1">📝 ملاحظات</label>
                  <textarea
                    value={offlineNotes}
                    onChange={(e) => setOfflineNotes(e.target.value)}
                    placeholder="ملاحظات الحجز اليدوي أو طلب كرات إضافية..."
                    rows={2}
                    className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOfflineOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-bold hover:bg-white/10"
                  >
                    ❌ إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#00FFD2] text-black text-xs font-bold glow-primary"
                  >
                    💾 حفظ الحجز
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Edit Booking Modal (For Owner & Admin) */}
        {editingBooking && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setEditingBooking(null)}
          >
            <div
              className="bg-[#0d1211] border-2 border-[#00FFD2]/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#00FFD2]" />
                  <span>✏️ تعديل حجز: {editingBooking.referenceNumber}</span>
                </h3>
                <button
                  onClick={() => setEditingBooking(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedBooking} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">📅 التاريخ</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      required
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">⏰ الوقت</label>
                    <input
                      type="text"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      required
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">⏳ المدة</label>
                    <select
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value as BookingDuration)}
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="ساعة">ساعة</option>
                      <option value="ساعة ونصف">ساعة ونصف</option>
                      <option value="ساعتين">ساعتين</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">💰 المبلغ (ل.س)</label>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(Number(e.target.value))}
                      required
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">👤 اسم الشخص</label>
                    <input
                      type="text"
                      value={editPersonName}
                      onChange={(e) => setEditPersonName(e.target.value)}
                      required
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">📱 رقم الجوال</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">💳 طريقة الدفع</label>
                    <select
                      value={editPaymentMethod}
                      onChange={(e) => setEditPaymentMethod(e.target.value)}
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
                    >
                      <option value="نقداً">نقداً</option>
                      <option value="شام كاش">شام كاش</option>
                      <option value="محفظة">محفظة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">📌 حالة الدفع</label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
                    >
                      <option value="مدفوع">مدفوع</option>
                      <option value="غير مدفوع">غير مدفوع</option>
                      <option value="قيد الانتظار">قيد الانتظار</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">📌 حالة الحجز</label>
                    <select
                      value={editBookingStatus}
                      onChange={(e) => setEditBookingStatus(e.target.value as any)}
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
                    >
                      <option value="مؤكد">مؤكد</option>
                      <option value="ملغي">ملغي</option>
                      <option value="منتهي">منتهي</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-300 mb-1">📝 ملاحظات</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الحجز؟')) {
                        onDeleteBooking(editingBooking.id);
                        setEditingBooking(null);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-[#ff2a5f] border border-[#ff2a5f]/30 text-xs font-bold"
                  >
                    🗑️ حذف الحجز
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingBooking(null)}
                      className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-bold hover:bg-white/10"
                    >
                      ❌ إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#00FFD2] text-black text-xs font-bold glow-primary"
                    >
                      💾 حفظ التغييرات
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
