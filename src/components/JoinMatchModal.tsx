import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Phone,
  User,
  MapPin,
  Calendar,
  Clock,
  Swords,
  CheckCircle2,
  AlertCircle,
  Send,
  DollarSign,
  Shirt
} from 'lucide-react';
import { FriendlyMatch, PlayerPosition, UserProfile, PaymentMethodType } from '../types';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';
import SportLogoPicker from './SportLogoPicker';

interface JoinMatchModalProps {
  match: FriendlyMatch | null;
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onConfirmJoin: (joinData: {
    matchId: string;
    joinerName: string;
    joinerPhone: string;
    joinerTeamLogo?: string;
    guestJerseyColor?: string;
    preferredPosition: PlayerPosition;
    paymentMethod: PaymentMethodType;
    shamCashAccountNumber?: string;
    additionalNotes?: string;
  }) => Promise<void> | void;
}

export default function JoinMatchModal({
  match,
  isOpen,
  currentUser,
  onClose,
  onConfirmJoin
}: JoinMatchModalProps) {
  const [joinerName, setJoinerName] = useState(currentUser.name || '');
  const [joinerPhone, setJoinerPhone] = useState(currentUser.phone || '09');
  const [joinerTeamLogo, setJoinerTeamLogo] = useState<string>(
    currentUser.image || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80'
  );
  const [guestJerseyColor, setGuestJerseyColor] = useState('أحمر وأبيض');
  const [preferredPosition, setPreferredPosition] = useState<PlayerPosition>('وسط مهاجم');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('نقداً عند الحضور (كاش)');
  const [shamCashAccount, setShamCashAccount] = useState('SHAM-CHALLENGE-2025');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  if (!isOpen || !match) return null;

  const positions: PlayerPosition[] = [
    'حارس مرمى',
    'مدافع قلب',
    'ظهير أيمن',
    'ظهير أيسر',
    'وسط ارتكاز',
    'وسط مهاجم',
    'جناح',
    'مهاجم صريح'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!joinerName.trim()) {
      setErrorMessage('يرجى كتابة اسم المنضم أو اسم فريقك (إجباري)');
      return;
    }
    if (!joinerPhone.trim() || joinerPhone.length < 8) {
      setErrorMessage('يرجى إدخال رقم هاتف صالح للتواصل (إجباري)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmJoin({
        matchId: match.id,
        joinerName: joinerName.trim(),
        joinerPhone: joinerPhone.trim(),
        joinerTeamLogo,
        guestJerseyColor,
        preferredPosition,
        paymentMethod,
        shamCashAccountNumber: paymentMethod === 'شام كاش (Sham Cash)' ? shamCashAccount : undefined,
        additionalNotes: additionalNotes.trim() || undefined
      });
      setJoinedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء الانضمام للمباراة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const msg = `⚽ *تأكيد انضمام لمباراة ودية*\n🏟️ *الملعب:* ${match.venueName} (${match.governorate})\n📅 *الموعد:* ${match.date} - ${match.time}\n👤 *الطرف المنضم:* ${joinerName} (${joinerPhone})\n🎽 *لون اللباس:* ${guestJerseyColor}\n🎯 *المركز:* ${preferredPosition}\n💳 *طريقة الدفع:* ${paymentMethod}\n📝 *ملاحظات:* ${additionalNotes || 'جاهزون للمباراة والتحدي'}`;
    openWhatsAppShare(msg, match.organizerPhone || '0988000111');
  };

  return (
    <div
      id="modal-join-match"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#ff2a5f]/40 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto font-['Cairo']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#050707] border-b border-[#ff2a5f]/20 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff2a5f]/10 border border-[#ff2a5f]/30 flex items-center justify-center text-[#ff2a5f]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                الانضمام للمباراة الودية
              </h2>
              <p className="text-xs text-gray-400">
                ضد: {match.hostTeamName} • {match.venueName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Info Summary */}
        <div className="bg-[#050707] p-3 mx-4 sm:mx-6 mt-4 rounded-2xl border border-white/5 text-xs grid grid-cols-2 gap-2 text-gray-300">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#ff2a5f]" />
            <span>{match.date}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#00FFD2]" />
            <span>{match.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{match.governorate} - {match.venueName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-purple-400" />
            <span>نظام الأجرة: {match.costSplitMethod}</span>
          </div>
        </div>

        {joinedSuccess ? (
          <div className="p-6 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                تم تأكيد انضمامك وحفظ البيانات في النظام بنجاح! ⚽
              </h3>
              <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto leading-relaxed">
                تم تحديث حالة المباراة وإشعار كابتن الفريق المستضيف <strong className="text-[#ff2a5f]">{match.hostTeamName}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <button
                onClick={handleShareWhatsApp}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>إرسال إشعار للمنظم عبر واتساب</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#050707] hover:bg-white/10 text-gray-300 font-bold text-xs border border-white/10"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Sport Logo Selection with Gallery & Preset library */}
            <SportLogoPicker
              value={joinerTeamLogo}
              onChange={setJoinerTeamLogo}
              label="شعار الفريق المتحدي أو صورة الكابتن"
              accentColor="pink"
            />

            <div>
              <label className="block text-xs font-bold text-white mb-1">
                اسم الفريق المتحدي أو الكابتن (إجباري) *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: فريق الفيحاء أو كابتن عمر"
                value={joinerName}
                onChange={(e) => setJoinerName(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  رقم هاتف التواصل (واتساب) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="09XXXXXXXX"
                  value={joinerPhone}
                  onChange={(e) => setJoinerPhone(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  لون لباس الفريق المتحدي
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: أحمر وأبيض"
                    value={guestJerseyColor}
                    onChange={(e) => setGuestJerseyColor(e.target.value)}
                    className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 pr-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f]"
                  />
                  <Shirt className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">المركز المفضل للعب</label>
              <select
                value={preferredPosition}
                onChange={(e) => setPreferredPosition(e.target.value as PlayerPosition)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#ff2a5f]"
              >
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method in Syria */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                طريقة دفع حصة أجرة الملعب
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('نقداً عند الحضور (كاش)')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    paymentMethod === 'نقداً عند الحضور (كاش)'
                      ? 'border-[#ff2a5f] bg-[#ff2a5f]/15 text-white'
                      : 'border-white/10 bg-[#050707] text-gray-400'
                  }`}
                >
                  💵 نقداً عند الحضور (كاش)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('شام كاش (Sham Cash)')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    paymentMethod === 'شام كاش (Sham Cash)'
                      ? 'border-[#00FFD2] bg-[#00FFD2]/15 text-white'
                      : 'border-white/10 bg-[#050707] text-gray-400'
                  }`}
                >
                  📱 شام كاش (Sham Cash)
                </button>
              </div>

              {paymentMethod === 'شام كاش (Sham Cash)' && (
                <div className="mt-2 p-2.5 bg-[#050707] rounded-xl border border-[#00FFD2]/30 text-[11px] text-gray-300">
                  <span className="text-[#00FFD2] font-bold block mb-1">رقم حساب شام كاش للتحويل:</span>
                  <input
                    type="text"
                    value={shamCashAccount}
                    onChange={(e) => setShamCashAccount(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg p-1.5 text-xs text-[#00FFD2] font-mono"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">ملاحظات إضافية (اختياري)</label>
              <textarea
                rows={2}
                placeholder="عدد اللاعبين، شروط خاصة..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f] resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-[#ff2a5f] hover:bg-[#e02050] text-white font-black text-xs transition-all shadow-xl shadow-[#ff2a5f]/30 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>جاري تأكيد الانضمام وحفظ البيانات...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد قبول التحدي والانضمام للمباراة</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
