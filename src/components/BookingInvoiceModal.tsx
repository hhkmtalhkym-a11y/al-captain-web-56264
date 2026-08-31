import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  Building,
  User,
  CreditCard,
  QrCode,
  Sparkles
} from 'lucide-react';
import { Booking } from '../types';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';
import { generateBookingInvoicePdf } from '../utils/pdfInvoiceGenerator';

interface BookingInvoiceModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingInvoiceModal({
  booking,
  isOpen,
  onClose
}: BookingInvoiceModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !booking) return null;

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      await generateBookingInvoicePdf(booking);
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const issueDateFormatted = new Date(booking.createdAt || Date.now()).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div
      id="modal-booking-invoice"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#00FFD2]/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-[#070b09] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex items-center justify-center text-[#00FFD2]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>فاتورة حجز معتمدة</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  مؤكد
                </span>
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                الرقم المرجعي: <strong className="text-[#00FFD2]">{booking.referenceNumber}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Printable Viewport */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 bg-gradient-to-b from-[#0d1211] to-[#080c0a]">
          {/* Printable Invoice Container */}
          <div className="bg-[#070b09] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-6 shadow-inner relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#00FFD2] to-teal-400"></div>

            {/* Official Platform Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-5 text-center sm:text-right">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-[#00FFD2] animate-pulse"></span>
                  <h2 className="text-lg sm:text-xl font-black text-white">تطبيق الكابتن الرياضي</h2>
                </div>
                <p className="text-xs text-gray-400">
                  المنصة الرسمية لحجز الملاعب والأنشطة الرياضية في سوريا
                </p>
                <p className="text-[11px] text-[#00FFD2]/80 mt-0.5">
                  عمولة 0% • دفع نقدي مباشر أو عبر شام كاش
                </p>
              </div>

              <div className="bg-[#0f1714] p-3 rounded-2xl border border-[#00FFD2]/20 text-center shrink-0">
                <span className="text-[10px] text-gray-400 block font-mono">تاريخ الإصدار:</span>
                <span className="text-xs font-bold text-white block">{issueDateFormatted}</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">✓ حجز معتمد إلكترونياً</span>
              </div>
            </div>

            {/* Two-Column Grid: Customer & Pitch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div className="bg-[#0c1310] p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[#00FFD2] text-xs font-bold border-b border-white/5 pb-2">
                  <User className="w-4 h-4" />
                  <span>بيانات الكابتن الحاجز</span>
                </div>
                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">الاسم:</span>
                    <strong className="text-white">{booking.userName || 'كابتن المنصة'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">رقم الهاتف:</span>
                    <strong className="text-white font-mono">{booking.userPhone || '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">المحافظة:</span>
                    <strong className="text-gray-200">{booking.governorate}</strong>
                  </div>
                </div>
              </div>

              {/* Playground Info */}
              <div className="bg-[#0c1310] p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[#00FFD2] text-xs font-bold border-b border-white/5 pb-2">
                  <Building className="w-4 h-4" />
                  <span>بيانات الملعب المحجوز</span>
                </div>
                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">اسم الملعب:</span>
                    <strong className="text-white">{booking.playgroundName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">العنوان:</span>
                    <strong className="text-gray-200">{booking.detailedArea || booking.governorate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">هاتف الملعب:</span>
                    <strong className="text-white font-mono">{booking.managerPhone || '—'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation Time & Schedule Table */}
            <div className="bg-[#0c1310] rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-3 bg-[#111916] border-b border-white/5 text-xs font-bold text-[#00FFD2] flex items-center justify-between">
                <span>تفاصيل الموعد والوقت المحجوز</span>
                <span className="font-mono text-gray-400">{booking.playerCount}</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 block mb-0.5">تاريخ المباراة</span>
                  <strong className="text-white font-mono">{booking.selectedDates?.join(', ')}</strong>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 block mb-0.5">توقيت الحجز</span>
                  <strong className="text-[#00FFD2] font-mono">{booking.timeSlot}</strong>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 block mb-0.5">المدة</span>
                  <strong className="text-white">{booking.duration}</strong>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 block mb-0.5">طريقة الدفع</span>
                  <strong className="text-amber-400">{booking.paymentMethod}</strong>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-[#0f1714] p-4 rounded-2xl border border-[#00FFD2]/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>أجرة حجز الملعب:</span>
                <span className="font-mono font-bold text-white">{formatSYP(booking.totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>عمولة وتكاليف منصة الكابتن:</span>
                <span className="font-bold text-emerald-400">0 ل.س (مجاناً 100%)</span>
              </div>
              <div className="border-t border-white/10 pt-2.5 flex items-center justify-between">
                <span className="text-sm font-black text-white">المبلغ الإجمالي المستحق:</span>
                <span className="text-lg font-black text-[#00FFD2] font-mono">
                  {formatSYP(booking.totalPrice)}
                </span>
              </div>
            </div>

            {/* Official Instructions */}
            <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 text-[11px] text-gray-400 space-y-1">
              <strong className="text-amber-400 block font-bold">تعليمات هامة عند الحضور:</strong>
              <p>• يرجى إبراز هذا الإيصال أو الرقم المرجعي لمسؤول الملعب عند الوصول.</p>
              <p>• التواجد قبل 15 دقيقة من الموعد لتجهيز الفرق والتأكد من المعدات.</p>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-[#070b09] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const msg = `🏆 *فاتورة حجز معتمدة عبر تطبيق الكابتن* ⚽\n📌 الملعب: ${booking.playgroundName}\n📅 التاريخ: ${booking.selectedDates?.join(', ')}\n⏰ التوقيت: ${booking.timeSlot}\n🔢 الرقم المرجعي: ${booking.referenceNumber}\n💰 الإجمالي: ${formatSYP(booking.totalPrice)}`;
                openWhatsAppShare(msg, booking.managerPhone);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة واتساب</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white/5 text-gray-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              إغلاق
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black text-xs font-black glow-primary shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'جاري إنشاء الفاتورة...' : 'تحميل الفاتورة PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
