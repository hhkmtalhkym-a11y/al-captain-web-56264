import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Share2,
  Download,
  AlertCircle,
  Lock
} from 'lucide-react';
import {
  Playground,
  Booking,
  BookingDuration,
  PaymentMethodType,
  UserProfile
} from '../types';
import { formatSYP, openWhatsAppShare, downloadCalendarEvent } from '../utils/helpers';
import { TIME_SLOTS_90_MIN } from '../constants/syrianData';

interface BookingWizardModalProps {
  isOpen: boolean;
  playground: Playground | null;
  initialDate?: string;
  initialSlot?: string;
  existingBookings?: Booking[];
  currentUser: UserProfile;
  onClose: () => void;
  onConfirmBooking: (booking: Booking) => void;
}

export default function BookingWizardModal({
  isOpen,
  playground,
  initialDate,
  initialSlot,
  existingBookings = [],
  currentUser,
  onClose,
  onConfirmBooking
}: BookingWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Dates & Duration
  const [selectedDate, setSelectedDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(initialSlot || '18:30 - 20:00');
  const [duration, setDuration] = useState<BookingDuration>('ساعة ونصف');

  // Step 2: Players & Details
  const [playerCount, setPlayerCount] = useState('7v7');
  const [userName, setUserName] = useState(currentUser.name || 'الكابتن');
  const [userPhone, setUserPhone] = useState(currentUser.phone || '0945688090');
  const [specialRequests, setSpecialRequests] = useState('');

  // Step 3: Extra services
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    'نقداً عند الحضور (كاش)'
  );
  const [shamCashTxId, setShamCashTxId] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!isOpen || !playground) return null;

  // Real-time conflict checking: check if slot is booked on selected date in existing bookings
  const isSlotConflict = (date: string, slot: string) => {
    // 1. Check in bookings array (confirmed or pending)
    const bookingConflict = existingBookings.some((b) => {
      if (b.playgroundId !== playground.id) return false;
      if (b.status === 'ملغي') return false;
      const dateMatch = b.selectedDates && b.selectedDates.includes(date);
      const slotMatch = b.timeSlot === slot;
      return dateMatch && slotMatch;
    });
    if (bookingConflict) return true;

    // 2. Check in playground schedule state
    const scheduleDay = playground.schedules?.find((s) => s.date === date);
    if (scheduleDay) {
      const scheduleSlot = scheduleDay.slots?.find((sl) => sl.time === slot);
      if (scheduleSlot && (scheduleSlot.status === 'booked' || scheduleSlot.status === 'closed')) {
        return true;
      }
    }

    return false;
  };

  // Calculate prices
  let durationMultiplier = 1.5;
  if (duration === 'ساعة') durationMultiplier = 1;
  if (duration === 'ساعتين') durationMultiplier = 2;

  const basePrice = Math.round(playground.pricePerHour * durationMultiplier);

  const extrasPrice = selectedExtras.reduce((sum, extraId) => {
    const item = playground.extraServices?.find((s) => s.id === extraId);
    return sum + (item ? item.price : 0);
  }, 0);

  const totalPrice = basePrice + extrasPrice;

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const currentSlotUnavailable = isSlotConflict(selectedDate, selectedSlot);

  const handleFinalSubmit = () => {
    if (currentSlotUnavailable) {
      alert('عذراً، هذه الفترة الزمنية تم حجزها مسبقاً وغير متاحة. يرجى اختيار موعد آخر.');
      setStep(1);
      return;
    }

    const referenceNumber = `KAP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      referenceNumber,
      playgroundId: playground.id,
      playgroundName: playground.name,
      governorate: playground.governorate,
      detailedArea: playground.detailedArea,
      userId: currentUser.id,
      userName,
      userPhone,
      selectedDates: [selectedDate],
      timeSlot: selectedSlot,
      duration,
      playerCount,
      specialRequests: specialRequests.trim() || undefined,
      extraServices: selectedExtras.map(
        (id) => playground.extraServices.find((e) => e.id === id)?.name || id
      ),
      totalPrice,
      paymentMethod,
      shamCashAccountNumber:
        paymentMethod === 'شام كاش' ? playground.paymentOptions.shamCashAccount : undefined,
      status: 'قيد الانتظار',
      createdAt: new Date().toISOString(),
      managerPhone: playground.managerPhone
    };

    setConfirmedBooking(newBooking);
    onConfirmBooking(newBooking);
  };

  const handleShareToWhatsApp = () => {
    if (!confirmedBooking) return;
    const msg = `🏆 *تأكيد حجز عبر تطبيق الكابتن الرياضي* ⚽\n\n📌 *الملعب:* ${confirmedBooking.playgroundName}\n📍 *المحافظة:* ${confirmedBooking.governorate} - ${confirmedBooking.detailedArea}\n🔢 *الرقم المرجعي:* ${confirmedBooking.referenceNumber}\n📅 *التاريخ:* ${confirmedBooking.selectedDates[0]}\n⏰ *الوقت:* ${confirmedBooking.timeSlot} (${confirmedBooking.duration})\n💰 *المبلغ الإجمالي:* ${formatSYP(confirmedBooking.totalPrice)} (بدون أي عمولة 0%)\n💳 *طريقة الدفع:* ${confirmedBooking.paymentMethod}\n👤 *الكابتن الحاجز:* ${confirmedBooking.userName} (${confirmedBooking.userPhone})`;
    openWhatsAppShare(msg, playground.managerPhone);
  };

  return (
    <div
      id="modal-booking-wizard"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#00FFD2]/30 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl glow-primary my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#050707] border-b border-[#00FFD2]/20 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#00FFD2] text-black text-[10px] font-black">
                حجز فوري
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Cairo']">
                حجز ملعب: {playground.name}
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {playground.governorate} - {playground.detailedArea}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {!confirmedBooking && (
          <div className="bg-[#050707]/60 px-6 py-3 border-b border-white/5 flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-[#00FFD2] text-black ring-4 ring-[#00FFD2]/20 glow-primary'
                      : step > s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span
                  className={`text-xs hidden sm:inline font-semibold ${
                    step === s ? 'text-[#00FFD2]' : 'text-gray-400'
                  }`}
                >
                  {s === 1 && 'الموعد والمدة'}
                  {s === 2 && 'بيانات المباراة'}
                  {s === 3 && 'الخدمات الإضافية'}
                  {s === 4 && 'تأكيد الدفع'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {confirmedBooking ? (
            /* Booking Confirmation Success View */
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-[#00FFD2]/20 border-2 border-[#00FFD2] flex items-center justify-center text-[#00FFD2] mx-auto glow-primary">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-bold text-white font-['Cairo']">
                تم تسجيل وتأكيد الحجز بنجاح! ⚽
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                تم حجب هذه الفترة الزمنية تلقائياً ومنع تداخل الحجوزات. تم إرسال تفاصيل الحجز للملعب ويمكنك مشاركته فوراً عبر واتساب.
              </p>

              {/* Reference Ticket Card */}
              <div className="bg-[#050707] border-2 border-dashed border-[#00FFD2]/40 rounded-2xl p-5 max-w-md mx-auto text-right space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs text-gray-400">الرقم المرجعي للحجز:</span>
                  <span className="text-sm font-black text-[#00FFD2] font-mono">
                    {confirmedBooking.referenceNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">الملعب:</span>
                    <strong className="text-white">{confirmedBooking.playgroundName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">التاريخ والوقت:</span>
                    <strong className="text-white">
                      {confirmedBooking.selectedDates[0]} ({confirmedBooking.timeSlot})
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">طريقة الدفع:</span>
                    <strong className="text-[#00FFD2]">{confirmedBooking.paymentMethod}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">المبلغ الإجمالي:</span>
                    <strong className="text-white font-mono font-bold">
                      {formatSYP(confirmedBooking.totalPrice)}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                  <span>حالة الحجز وفترة الملعب:</span>
                  <span className="text-emerald-400 font-bold">محجوز ومحمي من التكرار 🔒</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleShareToWhatsApp}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة عبر واتساب مع صاحب الملعب
                </button>

                <button
                  onClick={() => downloadCalendarEvent(confirmedBooking)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#050707] hover:bg-white/10 text-white font-bold text-xs border border-white/15 flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-[#00FFD2]" />
                  إضافة للتقويم (Calendar .ics)
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00FFD2] text-black font-bold text-xs transition-colors glow-primary"
                >
                  تم والعودة
                </button>
              </div>
            </div>
          ) : (
            /* 4 Step Wizard Forms */
            <div>
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#00FFD2]" />
                    الخطوة 1: اختيار التاريخ وفترة الحجز (مع منع التداخل الفوري)
                  </h3>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">تاريخ المباراة:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs text-gray-400">الفترة الزمنية (فترات 90 دقيقة):</label>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> متاح
                        <span className="w-2 h-2 rounded-full bg-[#ff2a5f] inline-block mr-2"></span> غير متاح (محجوز)
                      </span>
                    </div>

                    {/* Slot Grid Selection with anti-conflict status */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TIME_SLOTS_90_MIN.map((slotTime) => {
                        const isBooked = isSlotConflict(selectedDate, slotTime);
                        const isSelected = selectedSlot === slotTime;

                        return (
                          <button
                            key={slotTime}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedSlot(slotTime)}
                            className={`p-2.5 rounded-xl border text-xs flex flex-col items-center justify-center transition-all ${
                              isBooked
                                ? 'bg-[#ff2a5f]/10 text-[#ff2a5f] border-[#ff2a5f]/30 cursor-not-allowed opacity-70'
                                : isSelected
                                ? 'bg-[#00FFD2] text-black font-bold border-[#00FFD2] glow-primary shadow-lg'
                                : 'bg-[#050707] text-white border-white/10 hover:border-emerald-400'
                            }`}
                          >
                            <span className="font-mono font-semibold">{slotTime}</span>
                            <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
                              {isBooked ? (
                                <>
                                  <Lock className="w-3 h-3 text-[#ff2a5f]" /> غير متاح
                                </>
                              ) : (
                                <span className="text-emerald-400">متاح للحجز</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {currentSlotUnavailable && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-[#ff2a5f]/15 border border-[#ff2a5f]/40 flex items-center gap-2 text-xs text-[#ff2a5f]">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>تنبيه: الفترة الزمنية المختارة محجوزة مسبقاً ولا يمكن حجزها منعاً لتداخل المواعيد.</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">مدة الحجز:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['ساعة', 'ساعة ونصف', 'ساعتين'] as BookingDuration[]).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(d)}
                          className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                            duration === d
                              ? 'bg-[#00FFD2] text-black border-[#00FFD2] glow-primary'
                              : 'bg-[#050707] text-gray-300 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00FFD2]" />
                    الخطوة 2: تفاصيل المباراة والكابتن المسؤول
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">اسم الكابتن الحاجز:</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl p-2.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">رقم الجوال:</label>
                      <input
                        type="text"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl p-2.5 text-xs text-white font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">عدد اللاعبين والتحدي:</label>
                    <select
                      value={playerCount}
                      onChange={(e) => setPlayerCount(e.target.value)}
                      className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="5v5">5 ضد 5</option>
                      <option value="6v6">6 ضد 6</option>
                      <option value="7v7">7 ضد 7</option>
                      <option value="8v8">8 ضد 8</option>
                      <option value="11v11">11 ضد 11 (ملعب كامل)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ملاحظات أو طلبات خاصة:</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="مثال: نرجو تجهيز كرات إضافية وشياكات بلون أصفر..."
                      rows={2}
                      className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#00FFD2]" />
                    الخطوة 3: الخدمات الإضافية الاختيارية
                  </h3>

                  <div className="space-y-2">
                    {playground.extraServices?.map((extra) => {
                      const isChecked = selectedExtras.includes(extra.id);
                      return (
                        <div
                          key={extra.id}
                          onClick={() => toggleExtra(extra.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? 'bg-[#00FFD2]/10 border-[#00FFD2] glow-primary'
                              : 'bg-[#050707] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                isChecked
                                  ? 'bg-[#00FFD2] border-[#00FFD2] text-black'
                                  : 'border-white/20'
                              }`}
                            >
                              {isChecked && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <span className="text-xs font-semibold text-white">{extra.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#00FFD2]">
                            +{formatSYP(extra.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#00FFD2]" />
                    الخطوة 4: طريقة الدفع وتأكيد الحجز
                  </h3>

                  {/* Pricing Breakdown */}
                  <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>أجرة الملعب الأساسية ({duration}):</span>
                      <span className="font-mono">{formatSYP(basePrice)}</span>
                    </div>
                    {extrasPrice > 0 && (
                      <div className="flex justify-between text-gray-300">
                        <span>الخدمات الإضافية المختارة:</span>
                        <span className="font-mono">+{formatSYP(extrasPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-emerald-400">
                      <span>عمولة تطبيق الكابتن:</span>
                      <span className="font-bold">0 ل.س (بدون عمولة 0%)</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between text-white font-bold text-sm">
                      <span>المجموع النهائي:</span>
                      <span className="text-[#00FFD2] font-mono text-base">
                        {formatSYP(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-400">اختر طريقة الدفع:</label>

                    <div
                      onClick={() => setPaymentMethod('نقداً عند الحضور (كاش)')}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        paymentMethod === 'نقداً عند الحضور (كاش)'
                          ? 'bg-[#00FFD2]/10 border-[#00FFD2] glow-primary'
                          : 'bg-[#050707] border-white/5'
                      }`}
                    >
                      <div>
                        <strong className="text-xs text-white block">
                          نقداً عند الحضور للملعب (كاش)
                        </strong>
                        <span className="text-[11px] text-gray-400">
                          الدفع مباشرة لمسؤول الملعب قبل بدء المباراة
                        </span>
                      </div>
                      <span className="text-xs text-[#00FFD2]">كاش 💵</span>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('شام كاش')}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        paymentMethod === 'شام كاش'
                          ? 'bg-[#00FFD2]/10 border-[#00FFD2] glow-primary'
                          : 'bg-[#050707] border-white/5'
                      }`}
                    >
                      <div>
                        <strong className="text-xs text-white block">الدفع عبر شام كاش</strong>
                        <span className="text-[11px] text-gray-400">
                          تحويل المبلغ لحساب الملعب: {playground.paymentOptions?.shamCashAccount || 'SHAM-7729-1940'}
                        </span>
                      </div>
                      <span className="text-xs text-[#00FFD2]">Sham Cash 📲</span>
                    </div>
                  </div>

                  {paymentMethod === 'شام كاش' && (
                    <div className="bg-[#050707] p-3 rounded-xl border border-[#00FFD2]/20">
                      <label className="block text-[11px] text-gray-400 mb-1">
                        رقم إشعار أو مرجع حوالة شام كاش (اختياري لتسريع التأكيد):
                      </label>
                      <input
                        type="text"
                        value={shamCashTxId}
                        onChange={(e) => setShamCashTxId(e.target.value)}
                        placeholder="مثال: TXN-8947291"
                        className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer Nav */}
        {!confirmedBooking && (
          <div className="bg-[#050707] p-4 border-t border-[#00FFD2]/20 flex items-center justify-between shrink-0">
            <div>
              <span className="text-[11px] text-gray-400 block">الإجمالي:</span>
              <span className="text-sm sm:text-base font-bold text-[#00FFD2] font-mono">
                {formatSYP(totalPrice)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" /> السابق
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  disabled={step === 1 && currentSlotUnavailable}
                  onClick={() => setStep((s) => (s + 1) as any)}
                  className="px-5 py-2.5 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black text-xs font-bold transition-all glow-primary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={currentSlotUnavailable}
                  onClick={handleFinalSubmit}
                  className="px-6 py-2.5 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black text-xs font-bold transition-all glow-primary shadow-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  تأكيد الحجز النهائي (0% عمولة)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
