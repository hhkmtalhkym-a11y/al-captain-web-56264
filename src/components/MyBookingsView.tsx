import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Download,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  DollarSign
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { formatSYP, openWhatsAppShare, downloadCalendarEvent } from '../utils/helpers';

interface MyBookingsViewProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onExplorePlaygrounds: () => void;
}

export default function MyBookingsView({
  bookings,
  onCancelBooking,
  onExplorePlaygrounds
}: MyBookingsViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  const filtered = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'الكل' || b.status === filterStatus;
    const matchesSearch =
      b.playgroundName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.governorate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    onCancelBooking(cancelModalBooking.id);
    setCancelModalBooking(null);
  };

  return (
    <div id="view-my-bookings" className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1211] p-5 sm:p-6 rounded-3xl border border-[#00FFD2]/20 glow-primary">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Cairo'] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#00FFD2]" />
            سجل حجوزاتي ومبارياتي
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            متابعة حجوزات الملاعب والمباريات وتأكيد المواعيد بدون أي عمولة إضافية
          </p>
        </div>

        <button
          onClick={onExplorePlaygrounds}
          className="px-5 py-2.5 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs transition-all shadow-lg glow-primary flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>حجز ملعب جديد</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم الحجز المرجعي أو اسم الملعب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1211] border border-white/10 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#00FFD2] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['الكل', 'مؤكد', 'قيد الانتظار', 'مكتمل', 'ملغي'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-[#00FFD2] text-black glow-primary'
                  : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#0d1211] rounded-3xl border border-white/5 space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base font-['Cairo']">لا توجد أي حجوزات تطابق البحث</h3>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery ? 'جرب البحث بكلمات أخرى' : 'ابدأ بحجز أول ملعب كروي واستمتع بالمباراة مع أصدقائك'}
            </p>
          </div>
          <button
            onClick={onExplorePlaygrounds}
            className="px-6 py-2.5 rounded-xl bg-[#00FFD2] text-black font-bold text-xs glow-primary"
          >
            استعراض الملاعب المتاحة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((booking) => {
            const isPending = booking.status === 'قيد الانتظار';
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
                      className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs transition-colors"
                      title="مشاركة عبر واتساب"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => downloadCalendarEvent(booking)}
                      className="p-2 rounded-xl bg-[#050707] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs transition-colors"
                      title="إضافة للتقويم .ics"
                    >
                      <Download className="w-4 h-4 text-[#00FFD2]" />
                    </button>
                  </div>

                  {!isCancelled && (
                    <button
                      onClick={() => setCancelModalBooking(booking)}
                      className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-[#ff2a5f] border border-[#ff2a5f]/30 text-xs font-semibold transition-colors"
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
                className="px-5 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-bold"
              >
                تراجع
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-xl bg-[#ff2a5f] text-white text-xs font-bold glow-pink"
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
