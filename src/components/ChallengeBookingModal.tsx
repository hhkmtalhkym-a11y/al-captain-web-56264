import React, { useState } from 'react';
import {
  X,
  Swords,
  ShieldCheck,
  DollarSign,
  User,
  Phone,
  Shirt,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  Share2
} from 'lucide-react';
import {
  FriendlyMatch,
  UserProfile,
  PaymentMethodType,
  CostSplitMethod
} from '../types';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';

interface ChallengeBookingModalProps {
  isOpen: boolean;
  match: FriendlyMatch | null;
  currentUser: UserProfile;
  onClose: () => void;
  onConfirmChallenge: (challengeData: {
    matchId: string;
    challengerName: string;
    challengerPhone: string;
    challengerJerseyColor: string;
    additionalNotes?: string;
    costSplitMethod: CostSplitMethod;
    paymentMethod: PaymentMethodType;
    selectedExtras: string[];
    shamCashTxId?: string;
  }) => Promise<void> | void;
}

export default function ChallengeBookingModal({
  isOpen,
  match,
  currentUser,
  onClose,
  onConfirmChallenge
}: ChallengeBookingModalProps) {
  // Form State
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '');
  const [jerseyColor, setJerseyColor] = useState('أزرق ملكي');
  const [customJerseyColor, setCustomJerseyColor] = useState('');
  const [notes, setNotes] = useState('');

  // Cost split choice
  const [costSplit, setCostSplit] = useState<CostSplitMethod>(
    match?.costSplitMethod || 'مناصفة بين الفريقين (50-50)'
  );

  // Extra services (Referee, Balls, Bibs, Water/Energy)
  const [extraReferee, setExtraReferee] = useState(!!match?.refereeName);
  const [extraBalls, setExtraBalls] = useState(true);
  const [extraBibs, setExtraBibs] = useState(true);
  const [extraWater, setExtraWater] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    match?.paymentMethod || 'نقداً عند الحضور (كاش)'
  );
  const [shamCashTxId, setShamCashTxId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedPayload, setConfirmedPayload] = useState<any>(null);

  if (!isOpen || !match) return null;

  // Extra Services Prices
  const refereeCost = 35000;
  const ballsCost = 15000;
  const bibsCost = 10000;
  const waterCost = 20000;

  // Pitch base price
  const pitchBasePrice = match.pitchPrice || 120000;

  // Total additional services
  let extraTotal = 0;
  if (extraReferee) extraTotal += refereeCost;
  if (extraBalls) extraTotal += ballsCost;
  if (extraBibs) extraTotal += bibsCost;
  if (extraWater) extraTotal += waterCost;

  const totalMatchCost = pitchBasePrice + extraTotal;

  // Challenger Share Calculation
  let challengerShare = totalMatchCost;
  if (costSplit === 'مناصفة بين الفريقين (50-50)') {
    challengerShare = Math.round(totalMatchCost / 2);
  } else if (costSplit === 'الخاسر يدفع بالكامل') {
    challengerShare = totalMatchCost; // provisional on defeat
  } else if (costSplit === 'المستضيف يدفع بالكامل') {
    challengerShare = 0;
  }

  const selectedJersey = jerseyColor === 'أخرى' ? customJerseyColor : jerseyColor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      return;
    }

    const extrasList: string[] = [];
    if (extraReferee) extrasList.push(`طاقم تحكيم معتمد (+${formatSYP(refereeCost)})`);
    if (extraBalls) extrasList.push(`كرات قدم إضافية (+${formatSYP(ballsCost)})`);
    if (extraBibs) extrasList.push(`شياكات تمييز الفريقين (+${formatSYP(bibsCost)})`);
    if (extraWater) extrasList.push(`صندوق مياه ومشروبات طاقة (+${formatSYP(waterCost)})`);

    const payload = {
      matchId: match.id,
      challengerName: fullName.trim(),
      challengerPhone: phoneNumber.trim(),
      challengerJerseyColor: selectedJersey || 'أزرق',
      additionalNotes: notes.trim() || undefined,
      costSplitMethod: costSplit,
      paymentMethod,
      selectedExtras: extrasList,
      shamCashTxId: paymentMethod === 'شام كاش' ? shamCashTxId : undefined,
      totalCost: totalMatchCost,
      challengerShare
    };

    setIsSubmitting(true);
    try {
      await onConfirmChallenge(payload);
      setConfirmedPayload(payload);
      setIsSuccess(true);
    } catch (err) {
      console.error('Challenge booking failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!confirmedPayload) return;
    const msg = `⚔️ *تأكيد قبول تحدي مباراة ودية - تطبيق الكابتن* ⚽\n\n📌 *المباراة ضد:* فريق ${match.hostTeamName}\n📍 *الملعب:* ${match.venueName} (${match.governorate})\n📅 *الموعد:* ${match.date} (${match.time})\n👤 *كابتن الفريق المتحدي:* ${confirmedPayload.challengerName} (${confirmedPayload.challengerPhone})\n👕 *لون طقم الفريق:* ${confirmedPayload.challengerJerseyColor}\n💰 *طريقة التقاسم:* ${confirmedPayload.costSplitMethod}\n💳 *طريقة الدفع:* ${confirmedPayload.paymentMethod}\n💵 *المبلغ المطلوب:* ${formatSYP(confirmedPayload.challengerShare)} (بدون عمولة 0%)\n${confirmedPayload.additionalNotes ? `📝 *ملاحظات:* ${confirmedPayload.additionalNotes}` : ''}`;
    openWhatsAppShare(msg, match.organizerPhone);
  };

  return (
    <div
      id="modal-challenge-booking"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#ff2a5f]/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl glow-pink my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#050707] border-b border-[#ff2a5f]/20 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff2a5f]/15 border border-[#ff2a5f]/40 flex items-center justify-center text-[#ff2a5f]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-[#ff2a5f] text-white text-[10px] font-black">
                  تحدي رسمي
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white font-['Cairo']">
                  حجز وتأكيد قبول التحدي ضد {match.hostTeamName}
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {match.venueName} • {match.governorate} • {match.date} ({match.time})
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isSuccess && confirmedPayload ? (
            /* Success confirmation card */
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-[#ff2a5f]/20 border-2 border-[#ff2a5f] flex items-center justify-center text-[#ff2a5f] mx-auto glow-pink">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-bold text-white font-['Cairo']">
                تم قبول وتثبيت التحدي بنجاح! ⚔️
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                تم حجز المباراة وتأكيد بيانات فريقك المتحدي رسمياً. يمكنك مشاركة إشعار التحدي مباشرة عبر واتساب مع كابتن الفريق المضيف.
              </p>

              {/* Match Card Summary */}
              <div className="bg-[#050707] border-2 border-dashed border-[#ff2a5f]/40 rounded-2xl p-5 max-w-md mx-auto text-right space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs text-gray-400">طرفا اللقاء:</span>
                  <span className="text-xs font-black text-white">
                    {match.hostTeamName} ⚔️ {confirmedPayload.challengerName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">الملعب:</span>
                    <strong className="text-white">{match.venueName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">الموعد:</span>
                    <strong className="text-white font-mono">{match.date} ({match.time})</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">لون اللباس:</span>
                    <strong className="text-[#00FFD2]">{confirmedPayload.challengerJerseyColor}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">طريقة الدفع:</span>
                    <strong className="text-[#ff2a5f]">{confirmedPayload.paymentMethod}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-300">حصتكم من تكلفة المباراة ({confirmedPayload.costSplitMethod}):</span>
                  <span className="text-[#00FFD2] font-mono text-sm">
                    {formatSYP(confirmedPayload.challengerShare)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة التأكيد عبر واتساب مع كابتن الخصم
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
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Host Match Mini Info Banner */}
              <div className="bg-[#050707] p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={match.hostTeamImage}
                    alt={match.hostTeamName}
                    className="w-11 h-11 rounded-xl object-cover border border-[#ff2a5f]/40"
                  />
                  <div>
                    <span className="text-[10px] text-gray-400 block">الفريق المضيف المتحدي:</span>
                    <strong className="text-xs sm:text-sm text-white font-bold">{match.hostTeamName}</strong>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                      <span>الفئة: {match.ageGroup}</span>
                      <span>•</span>
                      <span>الملعب: {match.venueName}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-gray-400 block">أجرة الملعب الأساسية:</span>
                  <span className="text-xs sm:text-sm font-bold text-[#00FFD2] font-mono">
                    {formatSYP(match.pitchPrice)}
                  </span>
                </div>
              </div>

              {/* 1. Required Personal Info: Full Name & Phone Number */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#ff2a5f]" />
                  1. بيانات الكابتن المسؤول عن الفريق المتحدي
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 font-semibold mb-1">
                      اسم الشخص الثلاثي <span className="text-[#ff2a5f]">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: كابتن معتز عماد الدين الصالح"
                      className="w-full bg-[#050707] border border-white/10 focus:border-[#ff2a5f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 font-semibold mb-1">
                      رقم الجوال للتواصل والواتساب <span className="text-[#ff2a5f]">*</span>:
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="مثال: 0988112233 أو 0933123456"
                      className="w-full bg-[#050707] border border-white/10 focus:border-[#ff2a5f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Team Jersey Uniform Color */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-[#00FFD2]" />
                  2. لون اللباس الموحد للفريق (لتجنب تشابه الألوان)
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { label: 'أزرق ملكي', color: 'bg-blue-600' },
                    { label: 'أحمر قرمزي', color: 'bg-red-600' },
                    { label: 'أبيض كلاسيكي', color: 'bg-white text-black' },
                    { label: 'أسود فحمي', color: 'bg-neutral-800' },
                    { label: 'أخضر فسفوري', color: 'bg-emerald-500' },
                    { label: 'أخرى', color: 'bg-amber-500' }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setJerseyColor(item.label)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        jerseyColor === item.label
                          ? 'border-[#00FFD2] bg-[#00FFD2]/10 text-white glow-primary'
                          : 'border-white/5 bg-[#050707] text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${item.color} border border-white/30`} />
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>

                {jerseyColor === 'أخرى' && (
                  <input
                    type="text"
                    value={customJerseyColor}
                    onChange={(e) => setCustomJerseyColor(e.target.value)}
                    placeholder="حدد لون لباس الفريق المخصص (مثال: أصفر مع خطوط سوداء)..."
                    className="w-full bg-[#050707] border border-white/10 focus:border-[#00FFD2] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                )}
              </div>

              {/* 3. Cost Split Method */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  3. تحديد طريقة دفع وتقاسم أجور المباراة
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {[
                    {
                      id: 'مناصفة بين الفريقين (50-50)' as CostSplitMethod,
                      title: 'مناصفة (50-50)',
                      desc: 'كل فريق يدفع 50% من التكلفة'
                    },
                    {
                      id: 'الخاسر يدفع بالكامل' as CostSplitMethod,
                      title: 'الخاسر يدفع بالكامل',
                      desc: 'الفريق الخاسر يتكفل بالحجز والأجور'
                    },
                    {
                      id: 'المستضيف يدفع بالكامل' as CostSplitMethod,
                      title: 'المستضيف متكفل بالكامل',
                      desc: 'الفريق المضيف يتحمل كامل الأجرة'
                    }
                  ].map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setCostSplit(option.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        costSplit === option.id
                          ? 'bg-[#ff2a5f]/10 border-[#ff2a5f] text-white glow-pink'
                          : 'bg-[#050707] border-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <strong className="block text-xs text-white mb-0.5">{option.title}</strong>
                      <span className="text-[10px] text-gray-400 block">{option.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Extra Services: Referee, Balls, Bibs, Water */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00FFD2]" />
                  4. الخدمات الإضافية الاختيارية (حكم، كرات، شياكات، مياه)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Referee */}
                  <div
                    onClick={() => setExtraReferee(!extraReferee)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      extraReferee
                        ? 'bg-[#00FFD2]/10 border-[#00FFD2]'
                        : 'bg-[#050707] border-white/5 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${extraReferee ? 'bg-[#00FFD2] border-[#00FFD2] text-black' : 'border-white/20'}`}>
                        {extraReferee && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">طاقم تحكيم معتمد</span>
                        <span className="text-[10px] text-gray-400">حكم ساحة رسمي لإدارة التحدي</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00FFD2]">+{formatSYP(refereeCost)}</span>
                  </div>

                  {/* Balls */}
                  <div
                    onClick={() => setExtraBalls(!extraBalls)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      extraBalls
                        ? 'bg-[#00FFD2]/10 border-[#00FFD2]'
                        : 'bg-[#050707] border-white/5 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${extraBalls ? 'bg-[#00FFD2] border-[#00FFD2] text-black' : 'border-white/20'}`}>
                        {extraBalls && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">كرات قدم أصلية</span>
                        <span className="text-[10px] text-gray-400">كرات معتمدة للمباراة والاحتياط</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00FFD2]">+{formatSYP(ballsCost)}</span>
                  </div>

                  {/* Bibs */}
                  <div
                    onClick={() => setExtraBibs(!extraBibs)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      extraBibs
                        ? 'bg-[#00FFD2]/10 border-[#00FFD2]'
                        : 'bg-[#050707] border-white/5 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${extraBibs ? 'bg-[#00FFD2] border-[#00FFD2] text-black' : 'border-white/20'}`}>
                        {extraBibs && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">شياكات تدريب وتمييز</span>
                        <span className="text-[10px] text-gray-400">أطقم شياكات ملونة</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00FFD2]">+{formatSYP(bibsCost)}</span>
                  </div>

                  {/* Water */}
                  <div
                    onClick={() => setExtraWater(!extraWater)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      extraWater
                        ? 'bg-[#00FFD2]/10 border-[#00FFD2]'
                        : 'bg-[#050707] border-white/5 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${extraWater ? 'bg-[#00FFD2] border-[#00FFD2] text-black' : 'border-white/20'}`}>
                        {extraWater && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">صندوق مياه ومشروبات</span>
                        <span className="text-[10px] text-gray-400">مياه معدنية باردة للفريقين</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00FFD2]">+{formatSYP(waterCost)}</span>
                  </div>
                </div>
              </div>

              {/* 5. Additional Notes */}
              <div>
                <label className="block text-[11px] text-gray-300 font-semibold mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  ملاحظات أو شروط إضافية للتحدي:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: نرجو الحضور قبل 15 دقيقة للإحماء، المباراة 7 ضد 7..."
                  className="w-full bg-[#050707] border border-white/10 focus:border-[#ff2a5f] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* 6. Payment Selection: Cash vs Sham Cash */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#ff2a5f]" />
                  5. كيفية طريقة الدفع (نقداً أم شام كاش)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cash Option */}
                  <div
                    onClick={() => setPaymentMethod('نقداً عند الحضور (كاش)')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'نقداً عند الحضور (كاش)'
                        ? 'bg-[#00FFD2]/10 border-[#00FFD2] text-white glow-primary'
                        : 'bg-[#050707] border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-white">نقداً عند الحضور (كاش) 💵</strong>
                      <span className="text-[10px] text-emerald-400 font-bold">مباشر</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      تسليم المبلغ نقداً في إدارة الملعب قبل بداية المباراة مباشرة
                    </p>
                  </div>

                  {/* Sham Cash Option */}
                  <div
                    onClick={() => setPaymentMethod('شام كاش')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'شام كاش'
                        ? 'bg-[#00FFD2]/10 border-[#00FFD2] text-white glow-primary'
                        : 'bg-[#050707] border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-white">الدفع عبر شام كاش 📲</strong>
                      <span className="text-[10px] text-[#00FFD2] font-bold">إلكتروني</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      تحويل إلكتروني فوري لحساب الملعب والشريك الرياضي
                    </p>
                  </div>
                </div>

                {paymentMethod === 'شام كاش' && (
                  <div className="bg-[#050707] p-3.5 rounded-2xl border border-[#00FFD2]/30 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">حساب شام كاش المعتمد للمباراة:</span>
                      <strong className="text-[#00FFD2] font-mono text-sm">
                        {match.shamCashAccountNumber || 'SHAM-7729-MATCH-2026'}
                      </strong>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">
                        رقم إشعار أو مرجع عملية التحويل عبر شام كاش:
                      </label>
                      <input
                        type="text"
                        value={shamCashTxId}
                        onChange={(e) => setShamCashTxId(e.target.value)}
                        placeholder="مثال: SHAM-TXN-902348"
                        className="w-full bg-[#0d1211] border border-white/10 focus:border-[#00FFD2] rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown Calculation Box */}
              <div className="bg-[#050707] p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>أجرة حجز الملعب:</span>
                  <span className="font-mono">{formatSYP(pitchBasePrice)}</span>
                </div>
                {extraTotal > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>الخدمات الإضافية (تحكيم/كرات/مستلزمات):</span>
                    <span className="font-mono text-emerald-400">+{formatSYP(extraTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>عمولة تطبيق الكابتن:</span>
                  <span className="text-emerald-400 font-bold">0 ل.س (مجاناً 0%)</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm font-bold text-white">
                  <span>إجمالي تكلفة اللقاء:</span>
                  <span className="text-gray-300 font-mono">{formatSYP(totalMatchCost)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#ff2a5f]/10 border border-[#ff2a5f]/30 flex items-center justify-between text-sm font-bold">
                  <span className="text-white">المبلغ المطلوب من فريقكم ({costSplit}):</span>
                  <span className="text-[#00FFD2] font-mono text-base">
                    {formatSYP(challengerShare)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#ff2a5f] hover:bg-[#e02050] text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 glow-pink cursor-pointer disabled:opacity-50"
                >
                  <Swords className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'جاري تثبيت الحجز والتحدي...' : 'تأكيد حجز وقبول التحدي (0% عمولة)'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
