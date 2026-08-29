import React, { useState, useMemo } from 'react';
import {
  Building,
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  Plus,
  Printer,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit2,
  Trash2,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Download,
  Share2,
  Activity,
  Check,
  ShieldCheck
} from 'lucide-react';
import {
  Booking,
  Playground,
  UserProfile,
  BookingStatus,
  SyrianGovernorate
} from '../types';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';
import AddManualBookingModal from './AddManualBookingModal';
import BookingAnalytics from './BookingAnalytics';
import jsPDF from 'jspdf';

interface OwnerDashboardProps {
  currentUser: UserProfile;
  playgrounds: Playground[];
  bookings: Booking[];
  onGoBack: () => void;
  onAddBooking: (newBooking: Booking) => void;
  onUpdateBookingStatus: (
    bookingId: string,
    status: BookingStatus,
    paymentStatus?: 'مدفوع' | 'غير مدفوع' | 'قيد الانتظار'
  ) => void;
  onDeleteBooking?: (bookingId: string) => void;
  onEditBooking?: (booking: Booking) => void;
}

export default function OwnerDashboard({
  currentUser,
  playgrounds,
  bookings,
  onGoBack,
  onAddBooking,
  onUpdateBookingStatus,
  onDeleteBooking,
  onEditBooking
}: OwnerDashboardProps) {
  // Filter playgrounds owned or managed by this user (or all if admin)
  const myPlaygrounds = useMemo(() => {
    if (currentUser.isAdmin || currentUser.role === 'admin') {
      return playgrounds;
    }
    // Match by manager phone or name or ownerId
    const userPhoneClean = (currentUser.phone || '').trim().replace(/[\s\-_]/g, '');
    const userPhoneLocal = userPhoneClean.startsWith('+963') ? '0' + userPhoneClean.slice(4) : userPhoneClean;

    const matched = playgrounds.filter((p) => {
      const pPhone = (p.managerPhone || '').trim().replace(/[\s\-_]/g, '');
      const pPhoneLocal = pPhone.startsWith('+963') ? '0' + pPhone.slice(4) : pPhone;
      return (
        pPhoneLocal === userPhoneLocal ||
        p.managerName === currentUser.name ||
        (p as any).ownerId === currentUser.id
      );
    });

    return matched.length > 0 ? matched : playgrounds;
  }, [currentUser, playgrounds]);

  const [selectedPlaygroundId, setSelectedPlaygroundId] = useState<string>('الكل');
  const [activeTab, setActiveTab] = useState<'bookings' | 'analytics' | 'report'>('bookings');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('الكل');
  const [sourceFilter, setSourceFilter] = useState<'الكل' | 'online' | 'offline'>('الكل');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState<Booking | null>(null);

  // Relevant bookings for owner
  const ownerPlaygroundIds = useMemo(() => new Set(myPlaygrounds.map((p) => p.id)), [myPlaygrounds]);

  const relevantBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedPlaygroundId !== 'الكل') {
        return b.playgroundId === selectedPlaygroundId;
      }
      return ownerPlaygroundIds.has(b.playgroundId) || currentUser.isAdmin;
    });
  }, [bookings, selectedPlaygroundId, ownerPlaygroundIds, currentUser.isAdmin]);

  // Apply filters
  const filteredBookings = useMemo(() => {
    return relevantBookings.filter((b) => {
      // 1. Status Filter
      if (statusFilter !== 'الكل' && b.status !== statusFilter) return false;

      // 2. Source Filter
      if (sourceFilter === 'online' && b.source === 'offline') return false;
      if (sourceFilter === 'offline' && b.source !== 'offline') return false;

      // 3. Date Filter
      if (dateFilter !== 'all') {
        const todayStr = new Date().toISOString().split('T')[0];
        const bDate = b.selectedDates?.[0] || '';
        if (dateFilter === 'today' && bDate !== todayStr) return false;
        if (dateFilter === 'week') {
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const bTime = new Date(bDate).getTime();
          if (isNaN(bTime) || bTime < oneWeekAgo.getTime()) return false;
        }
        if (dateFilter === 'month') {
          const now = new Date();
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const bTime = new Date(bDate).getTime();
          if (isNaN(bTime) || bTime < oneMonthAgo.getTime()) return false;
        }
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (b.userName || '').toLowerCase().includes(q);
        const matchesPhone = (b.userPhone || '').includes(q);
        const matchesRef = (b.referenceNumber || '').toLowerCase().includes(q);
        const matchesPg = (b.playgroundName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesRef && !matchesPg) return false;
      }

      return true;
    });
  }, [relevantBookings, statusFilter, sourceFilter, dateFilter, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = relevantBookings.length;
    const confirmed = relevantBookings.filter((b) => b.status === 'مؤكد' || b.status === 'مكتمل').length;
    const pending = relevantBookings.filter((b) => (b.status as string) === 'بانتظار الدفع' || b.status === 'قيد الانتظار').length;
    const totalRevenue = relevantBookings
      .filter((b) => b.status !== 'ملغي')
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    const offlineCount = relevantBookings.filter((b) => b.source === 'offline').length;
    const onlineCount = total - offlineCount;

    return {
      total,
      confirmed,
      pending,
      totalRevenue,
      offlineCount,
      onlineCount
    };
  }, [relevantBookings]);

  // Export / Print PDF Handler
  const handleGeneratePdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      // Add Title & Header
      doc.setFontSize(18);
      doc.text('KAPTAN - Playground Bookings Report', 105, 20, { align: 'center' });
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString('ar-SY')} - Total Bookings: ${filteredBookings.length}`, 105, 28, { align: 'center' });
      doc.text(`Total Revenue: ${formatSYP(stats.totalRevenue)}`, 105, 34, { align: 'center' });

      let y = 46;
      doc.setFontSize(10);
      doc.text('Ref Number | Client | Date & Slot | Total (SYP) | Status | Payment', 14, y);
      doc.line(14, y + 2, 196, y + 2);
      y += 8;

      filteredBookings.slice(0, 30).forEach((b) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const row = `${b.referenceNumber} | ${b.userName} (${b.userPhone}) | ${b.selectedDates?.[0]} ${b.timeSlot} | ${b.totalPrice} | ${b.status} | ${b.paymentStatus || 'N/A'}`;
        doc.text(row, 14, y);
        y += 7;
      });

      doc.save(`Kaptan-Bookings-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.warn('PDF generation fallback to print dialog:', e);
      window.print();
    }
  };

  return (
    <div id="owner-dashboard" className="space-y-6 animate-fadeIn pb-16 font-['Cairo']">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1211] p-5 sm:p-6 rounded-3xl border border-amber-400/30 glow-amber">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onGoBack}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="العودة للخلف"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-amber-400" />
              <span>لوحة المعلن وإدارة ملاعبي 🏟️</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-bold font-mono">
              {myPlaygrounds.length} ملاعب تابعة
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
            إدارة الحجوزات اليومية (المباشرة والخارجية)، تسجيل الدفعات، وطباعة التقارير المالية
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Add Manual Booking Button */}
          <button
            onClick={() => {
              setEditingBooking(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-all shadow-lg glow-amber flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل حجز يدوي (هاتف/واتساب)</span>
          </button>

          {/* PDF Report Button */}
          <button
            onClick={handleGeneratePdf}
            className="px-3.5 py-2.5 rounded-2xl bg-[#050707] hover:bg-white/10 text-gray-200 border border-white/10 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة تقرير PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Bookings */}
        <div className="bg-[#0d1211] p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>إجمالي الحجوزات</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">{stats.total}</p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
            <span>أونلاين: {stats.onlineCount}</span>
            <span>يدوي: {stats.offlineCount}</span>
          </div>
        </div>

        {/* Confirmed */}
        <div className="bg-[#0d1211] p-4 rounded-2xl border border-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span>المؤكدة والمكتملة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{stats.confirmed}</p>
          <span className="text-[10px] text-emerald-300/70 mt-1">
            {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}% نسبة الإشغال
          </span>
        </div>

        {/* Pending Payment */}
        <div className="bg-[#0d1211] p-4 rounded-2xl border border-amber-400/20">
          <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
            <span>بانتظار الدفع</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono">{stats.pending}</p>
          <span className="text-[10px] text-amber-300/70 mt-1">بحاجة لمتابعة الدفع</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#0d1211] p-4 rounded-2xl border border-amber-400/30">
          <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
            <span>المجموع المالي (ل.س)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-base sm:text-lg font-black text-white font-mono break-words">
            {formatSYP(stats.totalRevenue)}
          </p>
          <span className="text-[10px] text-gray-400 mt-1">للحجوزات غير الملغاة</span>
        </div>
      </div>

      {/* Main SubTabs (Bookings Table / Analytics) */}
      <div className="flex items-center bg-[#0d1211] p-1.5 rounded-2xl border border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-amber-400 text-black shadow-lg font-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>جدول الحجوزات والمطابقة ({filteredBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-amber-400 text-black shadow-lg font-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>الرسوم البيانية والتحليلات 📊</span>
        </button>
      </div>

      {/* TAB 1: BOOKINGS MANAGEMENT TABLE */}
      {activeTab === 'bookings' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filters Bar */}
          <div className="bg-[#0d1211] p-4 rounded-3xl border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم العميل، الهاتف، أو المرجع..."
                  className="w-full bg-[#050707] border border-white/10 rounded-xl pr-10 pl-3 py-2 text-xs text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Playground Switcher */}
              {myPlaygrounds.length > 1 && (
                <div>
                  <select
                    value={selectedPlaygroundId}
                    onChange={(e) => setSelectedPlaygroundId(e.target.value)}
                    className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="الكل">كافة الملاعب التابعة لي</option>
                    {myPlaygrounds.map((pg) => (
                      <option key={pg.id} value={pg.id}>
                        {pg.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="الكل">كافة الحالات</option>
                  <option value="مؤكد">مؤكد</option>
                  <option value="بانتظار الدفع">بانتظار الدفع</option>
                  <option value="قيد الانتظار">قيد الانتظار</option>
                  <option value="ملغي">ملغي</option>
                  <option value="مكتمل">مكتمل</option>
                </select>
              </div>

              {/* Source Filter (Online vs Offline) */}
              <div>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as any)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="الكل">كافة المصادر (تطبيق + خارجي)</option>
                  <option value="online">حجوزات التطبيق المباشرة</option>
                  <option value="offline">حجوزات يدوية خارجية</option>
                </select>
              </div>
            </div>

            {/* Quick Date Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-gray-400 text-[11px] shrink-0">الفترة الزمنية:</span>
              {[
                { id: 'all', label: 'كافة الأوقات' },
                { id: 'today', label: 'حجوزات اليوم' },
                { id: 'week', label: 'آخر 7 أيام' },
                { id: 'month', label: 'هذا الشهر' }
              ].map((df) => (
                <button
                  key={df.id}
                  onClick={() => setDateFilter(df.id as any)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                    dateFilter === df.id
                      ? 'bg-amber-400 text-black font-black shadow-sm'
                      : 'bg-[#050707] text-gray-300 hover:text-white border border-white/10'
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Table / List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-[#0d1211] rounded-3xl border border-white/5 space-y-3">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto" />
              <h3 className="text-base font-bold text-gray-300">لا توجد حجوزات تطابق الفلترة</h3>
              <p className="text-xs text-gray-500">
                قم بتغيير خيارات الفلترة أو تسجيل حجز يدوي جديد بواسطة الزر بالأعلى.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((b) => {
                const isConfirmed = b.status === 'مؤكد' || b.status === 'مكتمل';
                const isPending = b.status === 'بانتظار الدفع' || b.status === 'قيد الانتظار';
                const isCancelled = b.status === 'ملغي';
                const isManual = b.source === 'offline';

                return (
                  <div
                    key={b.id}
                    className="bg-[#0d1211] border border-white/10 hover:border-amber-400/40 rounded-2xl p-4 transition-all space-y-3"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-[#00FFD2]">
                          #{b.referenceNumber}
                        </span>
                        {isManual ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                            حجز يدوي خارجي
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00FFD2]/15 text-[#00FFD2] border border-[#00FFD2]/30 font-bold">
                            حجز عبر التطبيق
                          </span>
                        )}
                        <span className="text-xs font-bold text-white">
                          {b.playgroundName}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 ${
                            isConfirmed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : 'bg-[#ff2a5f]/20 text-[#ff2a5f] border border-[#ff2a5f]/30'
                          }`}
                        >
                          {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {isPending && <Clock className="w-3.5 h-3.5" />}
                          {isCancelled && <XCircle className="w-3.5 h-3.5" />}
                          <span>{b.status}</span>
                        </span>

                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-lg font-bold ${
                            b.paymentStatus === 'مدفوع'
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {b.paymentStatus || 'غير مدفوع'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#050707] p-3 rounded-xl border border-white/5">
                      <div>
                        <span className="text-gray-500 block text-[10px]">العميل والهاتف:</span>
                        <strong className="text-white block font-bold">{b.userName}</strong>
                        <a
                          href={`tel:${b.userPhone}`}
                          className="text-amber-300 font-mono hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          {b.userPhone}
                        </a>
                      </div>

                      <div>
                        <span className="text-gray-500 block text-[10px]">الموعد والتوقيت:</span>
                        <strong className="text-white block">
                          {b.selectedDates?.[0]}
                        </strong>
                        <span className="text-[#00FFD2] font-mono">{b.timeSlot}</span>
                      </div>

                      <div>
                        <span className="text-gray-500 block text-[10px]">المبلغ والدفع:</span>
                        <strong className="text-white font-mono font-bold block">
                          {formatSYP(b.totalPrice)}
                        </strong>
                        <span className="text-gray-400 text-[11px]">{b.paymentMethod}</span>
                      </div>

                      <div>
                        <span className="text-gray-500 block text-[10px]">المدة والملاحظات:</span>
                        <span className="text-gray-300 block">{b.duration} • {b.playerCount || '6v6'}</span>
                        {b.notes && (
                          <span className="text-amber-300/80 text-[10px] block line-clamp-1">
                            {b.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                      {/* Left: Contact actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const msg = `مرحباً كابتن ${b.userName} ⚽، نؤكد لكم حجز ملعب ${b.playgroundName} لموعد ${b.selectedDates?.[0]} توقيت ${b.timeSlot}.`;
                            openWhatsAppShare(msg, b.userPhone);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-500/30 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </button>

                        <a
                          href={`tel:${b.userPhone}`}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold flex items-center gap-1 border border-white/10"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>اتصال</span>
                        </a>

                        {/* Edit Button for All Bookings (Owner or Admin) */}
                        <button
                          onClick={() => {
                            setEditingBooking(b);
                            setIsAddModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-400/30 cursor-pointer"
                          title="تعديل تفاصيل الحجز"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>

                        {/* Delete Button (Owner or Admin) */}
                        {onDeleteBooking && (
                          <button
                            onClick={() => setDeleteConfirmBooking(b)}
                            className="px-2.5 py-1 rounded-lg bg-[#ff2a5f]/10 hover:bg-[#ff2a5f]/20 text-[#ff2a5f] text-xs font-bold flex items-center gap-1 border border-[#ff2a5f]/30 cursor-pointer"
                            title="حذف الحجز نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        )}
                      </div>

                      {/* Right: Change Status & Payment Quick Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Toggle Payment Status */}
                        <button
                          onClick={() => {
                            const nextPayment = b.paymentStatus === 'مدفوع' ? 'غير مدفوع' : 'مدفوع';
                            onUpdateBookingStatus(b.id, b.status, nextPayment as any);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#050707] hover:bg-white/10 text-xs text-gray-300 border border-white/10 font-bold cursor-pointer"
                        >
                          {b.paymentStatus === 'مدفوع' ? '❌ تعيين كـ غير مدفوع' : '💰 تأكيد استلام الدفع'}
                        </button>

                        {/* Toggle Booking Status */}
                        {!isConfirmed && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'مؤكد', b.paymentStatus)}
                            className="px-3 py-1 rounded-lg bg-emerald-500 text-black text-xs font-black hover:bg-emerald-400 cursor-pointer"
                          >
                            تأكيد الحجز
                          </button>
                        )}

                        {!isCancelled && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'ملغي', b.paymentStatus)}
                            className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-[#ff2a5f] border border-[#ff2a5f]/30 text-xs font-bold cursor-pointer"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === 'analytics' && (
        <BookingAnalytics
          bookings={relevantBookings}
          title="تحليلات الحجوزات والإيرادات المالية للملعب 📈"
          subtitle="متابعة التدفق المالي، الإشغال الشهري، ونسبة الحجوزات المؤكدة والملغاة"
          isOwnerView={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-['Cairo']">
          <div className="bg-[#0d1211] border-2 border-[#ff2a5f]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ff2a5f]/10 border border-[#ff2a5f]/30 flex items-center justify-center mx-auto text-[#ff2a5f]">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">هل أنت متأكد من حذف هذا الحجز؟</h3>
              <p className="text-xs text-gray-400 mt-1">
                سيتم حذف حجز الكابتن ({deleteConfirmBooking.userName || 'العميل'}) في ملعب ({deleteConfirmBooking.playgroundName}) بتوقيت {deleteConfirmBooking.timeSlot} نهائياً.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteBooking) {
                    onDeleteBooking(deleteConfirmBooking.id);
                  }
                  setDeleteConfirmBooking(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#ff2a5f] hover:bg-rose-600 text-xs font-black text-white shadow-lg cursor-pointer"
              >
                نعم، احذف الحجز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Manual Booking Modal */}
      <AddManualBookingModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBooking(null);
        }}
        onSaveBooking={(booking) => {
          if (editingBooking) {
            if (onEditBooking) {
              onEditBooking(booking);
            } else {
              onAddBooking(booking);
            }
          } else {
            onAddBooking(booking);
          }
        }}
        playgrounds={myPlaygrounds}
        initialPlaygroundId={selectedPlaygroundId !== 'الكل' ? selectedPlaygroundId : myPlaygrounds[0]?.id}
        editingBooking={editingBooking}
      />
    </div>
  );
}
