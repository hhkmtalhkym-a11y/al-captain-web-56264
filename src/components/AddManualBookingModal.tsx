import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  Check,
  Plus
} from 'lucide-react';
import {
  Booking,
  BookingDuration,
  BookingStatus,
  Playground,
  PaymentMethodType,
  SyrianGovernorate
} from '../types';
import { formatSYP } from '../utils/helpers';

interface AddManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBooking: (newBooking: Booking) => void;
  playgrounds: Playground[];
  initialPlaygroundId?: string;
  editingBooking?: Booking | null;
}

const TIME_SLOTS = [
  '08:00 - 09:30',
  '09:30 - 11:00',
  '11:00 - 12:30',
  '12:30 - 14:00',
  '14:00 - 15:30',
  '15:30 - 17:00',
  '17:00 - 18:30',
  '18:30 - 20:00',
  '20:00 - 21:30',
  '21:30 - 23:00',
  '23:00 - 00:30',
  '00:30 - 02:00'
];

const DURATIONS: BookingDuration[] = ['ساعة', 'ساعة ونصف', 'ساعتين'];

export default function AddManualBookingModal({
  isOpen,
  onClose,
  onSaveBooking,
  playgrounds,
  initialPlaygroundId,
  editingBooking
}: AddManualBookingModalProps) {
  const selectedPg = playgrounds.find((p) => p.id === initialPlaygroundId) || playgrounds[0];

  const [playgroundId, setPlaygroundId] = useState<string>(
    editingBooking?.playgroundId || selectedPg?.id || ''
  );
  const [clientName, setClientName] = useState<string>(editingBooking?.userName || '');
  const [clientPhone, setClientPhone] = useState<string>(editingBooking?.userPhone || '');
  const [bookingDate, setBookingDate] = useState<string>(
    editingBooking?.selectedDates?.[0] || new Date().toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>(
    editingBooking?.timeSlot || '18:30 - 20:00'
  );
  const [duration, setDuration] = useState<BookingDuration>(
    editingBooking?.duration || 'ساعة ونصف'
  );
  const [playerCount, setPlayerCount] = useState<string>(
    editingBooking?.playerCount || '6v6'
  );
  const [totalPrice, setTotalPrice] = useState<number>(
    editingBooking?.totalPrice || selectedPg?.pricePerHour || 100000
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    editingBooking?.paymentMethod || 'نقداً عند الحضور (كاش)'
  );
  const [paymentStatus, setPaymentStatus] = useState<'مدفوع' | 'غير مدفوع' | 'قيد الانتظار'>(
    (editingBooking?.paymentStatus as any) || 'غير مدفوع'
  );
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(
    editingBooking?.status || 'مؤكد'
  );
  const [source, setSource] = useState<'online' | 'offline'>('offline');
  const [bookingChannel, setBookingChannel] = useState<'هاتف' | 'واتساب' | 'حضور شخصي' | 'أخرى'>('هاتف');
  const [notes, setNotes] = useState<string>(editingBooking?.notes || '');
  const [error, setError] = useState<string>('');

  // Sync state when editingBooking changes
  useEffect(() => {
    if (editingBooking) {
      setPlaygroundId(editingBooking.playgroundId);
      setClientName(editingBooking.userName);
      setClientPhone(editingBooking.userPhone);
      setBookingDate(editingBooking.selectedDates?.[0] || new Date().toISOString().split('T')[0]);
      setTimeSlot(editingBooking.timeSlot);
      setDuration(editingBooking.duration);
      setPlayerCount(editingBooking.playerCount || '6v6');
      setTotalPrice(editingBooking.totalPrice);
      setPaymentMethod(editingBooking.paymentMethod);
      setPaymentStatus(editingBooking.paymentStatus || 'غير مدفوع');
      setBookingStatus(editingBooking.status);
      setNotes(editingBooking.notes || '');
    } else {
      const activePg = playgrounds.find((p) => p.id === initialPlaygroundId) || playgrounds[0];
      if (activePg) {
        setPlaygroundId(activePg.id);
        setTotalPrice(activePg.pricePerHour || 100000);
      }
    }
  }, [editingBooking, initialPlaygroundId, playgrounds]);

  if (!isOpen) return null;

  const currentPlayground = playgrounds.find((p) => p.id === playgroundId) || selectedPg;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('يرجى إدخال اسم العميل / صاحب الحجز');
      return;
    }
    if (!clientPhone.trim()) {
      setError('يرجى إدخال رقم هاتف العميل');
      return;
    }
    if (!bookingDate) {
      setError('يرجى تحديد تاريخ الحجز');
      return;
    }

    const fullNotes = `[حجز يدوي عبر ${bookingChannel}] ${notes}`.trim();

    const bookingPayload: Booking = {
      id: editingBooking?.id || `book-manual-${Date.now()}`,
      referenceNumber:
        editingBooking?.referenceNumber ||
        `MAN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      playgroundId: currentPlayground?.id || 'pg-manual',
      playgroundName: currentPlayground?.name || 'الملعب الرئيسي',
      governorate: (currentPlayground?.governorate || 'دمشق') as SyrianGovernorate,
      detailedArea: currentPlayground?.detailedArea || 'وسط المدينة',
      userId: editingBooking?.userId || `manual-user-${Date.now()}`,
      userName: clientName.trim(),
      userPhone: clientPhone.trim(),
      selectedDates: [bookingDate],
      timeSlot,
      duration,
      playerCount,
      totalPrice: Number(totalPrice),
      paymentMethod,
      status: bookingStatus,
      paymentStatus,
      source: 'offline',
      notes: fullNotes,
      createdAt: editingBooking?.createdAt || new Date().toISOString(),
      managerPhone: currentPlayground?.managerPhone || clientPhone
    };

    onSaveBooking(bookingPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-['Cairo']">
      <div
        className="bg-[#0d1211] border-2 border-amber-400/50 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-5 p-5 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {editingBooking ? 'تعديل بيانات الحجز اليدوي' : 'إضافة حجز خارجي جديد (يدوي)'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                تسجيل حجوزات الاتصال الهاتفي، الواتساب، أو الحضور المباشر بالملعب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#ff2a5f]/15 border border-[#ff2a5f]/40 rounded-xl text-xs text-[#ff2a5f] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Playground Selector */}
          {playgrounds.length > 1 && (
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-amber-400" />
                <span>الملعب المستهدف:</span>
              </label>
              <select
                value={playgroundId}
                onChange={(e) => {
                  setPlaygroundId(e.target.value);
                  const found = playgrounds.find((p) => p.id === e.target.value);
                  if (found) setTotalPrice(found.pricePerHour);
                }}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                {playgrounds.map((pg) => (
                  <option key={pg.id} value={pg.id}>
                    {pg.name} ({pg.governorate} - {pg.detailedArea})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Booking Channel / Source */}
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1.5">
              مصدر الحجز الخارجي:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['هاتف', 'واتساب', 'حضور شخصي', 'أخرى'] as const).map((ch) => (
                <button
                  type="button"
                  key={ch}
                  onClick={() => setBookingChannel(ch)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    bookingChannel === ch
                      ? 'bg-amber-400 text-black border-amber-400 shadow-md font-black'
                      : 'bg-[#050707] text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Client Details (Name & Phone) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>اسم العميل / الكابتن: *</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="مثال: كابتن أحمد الحلبي"
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>رقم الهاتف / الواتساب: *</span>
              </label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="09XXXXXXXX"
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Date and Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>تاريخ الحجز: *</span>
              </label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>فترة التوقيت:</span>
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">
                المدة المحجوزة:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {DURATIONS.map((dur) => (
                  <button
                    type="button"
                    key={dur}
                    onClick={() => setDuration(dur)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      duration === dur
                        ? 'bg-amber-400 text-black border-amber-400 font-black'
                        : 'bg-[#050707] text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">
                عدد اللاعبين / التقسيمة:
              </label>
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="5v5">5 ضد 5 (10 لاعبين)</option>
                <option value="6v6">6 ضد 6 (12 لاعب)</option>
                <option value="7v7">7 ضد 7 (14 لاعب)</option>
                <option value="8v8">8 ضد 8 (16 لاعب)</option>
                <option value="11v11">11 ضد 11 (ملعب كامل)</option>
              </select>
            </div>
          </div>

          {/* Price & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>المبلغ الإجمالي (ل.س): *</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={5000}
                value={totalPrice}
                onChange={(e) => setTotalPrice(Number(e.target.value))}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                المبلغ بالليرة: {formatSYP(totalPrice)}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>طريقة الدفع:</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="نقداً عند الحضور (كاش)">نقداً عند الحضور (كاش)</option>
                <option value="شام كاش">شام كاش</option>
                <option value="سيريتل كاش">سيريتل كاش</option>
                <option value="إم تي إن كاش">إم تي إن كاش</option>
                <option value="تحويل بنكي">تحويل بنكي / محفظة إلكترونية</option>
              </select>
            </div>
          </div>

          {/* Payment Status & Booking Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">
                حالة الدفع:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'غير مدفوع', label: 'غير مدفوع', color: 'border-red-500/40 text-red-400' },
                  { id: 'قيد الانتظار', label: 'عربون', color: 'border-amber-400/40 text-amber-300' },
                  { id: 'مدفوع', label: 'مدفوع بالكامل', color: 'border-emerald-500/40 text-emerald-400' }
                ].map((ps) => (
                  <button
                    type="button"
                    key={ps.id}
                    onClick={() => setPaymentStatus(ps.id as any)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      paymentStatus === ps.id
                        ? 'bg-amber-400 text-black border-amber-400 font-black'
                        : `bg-[#050707] ${ps.color}`
                    }`}
                  >
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">
                حالة الحجز:
              </label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="مؤكد">مؤكد</option>
                <option value="قيد الانتظار">قيد الانتظار</option>
                <option value="بانتظار الدفع">بانتظار الدفع</option>
                <option value="ملغي">ملغي</option>
                <option value="مكتمل">مكتمل</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>ملاحظات إضافية أو طلبات خاصة:</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: دفع عربون 25,000 ل.س والباقي بالملعب، طلب كرات تدريب إضافية..."
              className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-all shadow-lg glow-amber flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingBooking ? 'حفظ التعديلات' : 'تسجيل وتأكيد الحجز'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
