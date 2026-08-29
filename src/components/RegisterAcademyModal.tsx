import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Calendar,
  User,
  Phone,
  MapPin,
  Bus,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Send,
  Sparkles,
  DollarSign
} from 'lucide-react';
import {
  Academy,
  AcademyRegistration,
  SyrianGovernorate,
  PlayerPosition,
  TransportStatus,
  PaymentMethodType,
  UserProfile
} from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';
import SportLogoPicker from './SportLogoPicker';

interface RegisterAcademyModalProps {
  academy: Academy | null;
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onConfirmRegistration: (registration: AcademyRegistration) => Promise<void> | void;
}

export default function RegisterAcademyModal({
  academy,
  isOpen,
  currentUser,
  onClose,
  onConfirmRegistration
}: RegisterAcademyModalProps) {
  const [studentName, setStudentName] = useState('');
  const [birthDate, setBirthDate] = useState('2014-05-15');
  const [age, setAge] = useState<number>(12);
  const [ageGroup, setAgeGroup] = useState<string>('أشبال (9 - 12 سنة)');
  const [preferredPosition, setPreferredPosition] = useState<PlayerPosition>('مهاجم صريح');
  const [governorate, setGovernorate] = useState<SyrianGovernorate>(academy?.governorate || 'دمشق');
  const [city, setCity] = useState(academy?.locationDetails || 'دمشق - المزة');
  const [parentName, setParentName] = useState(currentUser.name || '');
  const [parentPhone, setParentPhone] = useState(currentUser.phone || '09');
  const [transportOption, setTransportOption] = useState<TransportStatus>('بحاجة مواصلات');
  const [studentPhoto, setStudentPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=400&q=80'
  );
  const [paymentReceiptPhoto, setPaymentReceiptPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?auto=format&fit=crop&w=400&q=80'
  );
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('نقداً عند الحضور (كاش)');
  const [shamCashTxId, setShamCashTxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successRegistration, setSuccessRegistration] = useState<AcademyRegistration | null>(null);

  // Auto calculate age and category when birthDate changes
  useEffect(() => {
    if (!birthDate) return;
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = Math.max(4, currentYear - birthYear);
    setAge(calculatedAge);

    if (calculatedAge < 9) {
      setAgeGroup('براعم (أقل من 9 سنوات)');
    } else if (calculatedAge <= 12) {
      setAgeGroup('أشبال (9 - 12 سنة)');
    } else if (calculatedAge <= 15) {
      setAgeGroup('ناشئين (13 - 15 سنة)');
    } else if (calculatedAge <= 18) {
      setAgeGroup('شباب (16 - 18 سنة)');
    } else {
      setAgeGroup('رجال وفريق أول (+18 سنة)');
    }
  }, [birthDate]);

  useEffect(() => {
    if (academy) {
      setGovernorate(academy.governorate);
      setCity(academy.locationDetails);
    }
  }, [academy]);

  if (!isOpen || !academy) return null;

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

    if (!studentName.trim()) {
      setErrorMessage('يرجى كتابة اسم الطالب الثلاثي (إجباري)');
      return;
    }
    if (!parentName.trim()) {
      setErrorMessage('يرجى كتابة اسم ولي الأمر (إجباري)');
      return;
    }
    if (!parentPhone.trim() || parentPhone.length < 8) {
      setErrorMessage('يرجى إدخال رقم هاتف ولي أمر صحيح للتواصل');
      return;
    }
    if (!studentPhoto) {
      setErrorMessage('يرجى اختيار صورة أو شعار للطالب (إجباري)');
      return;
    }
    if (!paymentReceiptPhoto) {
      setErrorMessage('يرجى إرفاق صورة إيصال دفع القسط الشهري أو إشعار التحويل (إجباري)');
      return;
    }

    setIsSubmitting(true);

    const newReg: AcademyRegistration = {
      id: `reg-${Date.now()}`,
      academyId: academy.id,
      academyName: academy.name,
      studentName: studentName.trim(),
      birthDate,
      age,
      ageGroup,
      preferredPosition,
      governorate,
      city: city.trim(),
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      transportOption,
      studentPhoto,
      paymentReceiptPhoto,
      notes: notes.trim() || undefined,
      paymentMethod,
      shamCashAccountNumber: paymentMethod === 'شام كاش' ? shamCashTxId || academy.paymentOptions.shamCashAccount || 'SHAM-ACA-9456' : undefined,
      paymentStatus: paymentMethod === 'شام كاش' && shamCashTxId ? 'مدفوع' : 'قيد الانتظار',
      registrationStatus: 'قيد الانتظار',
      status: 'قيد الانتظار',
      createdAt: new Date().toISOString(),
      userId: currentUser.id
    };

    try {
      await onConfirmRegistration(newReg);
      setSuccessRegistration(newReg);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ التسجيل في قاعدة البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!successRegistration) return;
    const msg = `🌟 *طلب تسجيل جديد في الأكاديمية*\n⚽ *الأكاديمية:* ${academy.name}\n👤 *اسم الطالب:* ${successRegistration.studentName} (العمر: ${successRegistration.age} سنة - ${successRegistration.ageGroup})\n🎯 *المركز المفضل:* ${successRegistration.preferredPosition}\n📍 *الموقع:* ${successRegistration.governorate} - ${successRegistration.city}\n👨‍👦 *ولي الأمر:* ${successRegistration.parentName} (${successRegistration.parentPhone})\n🚌 *المواصلات:* ${successRegistration.transportOption}\n💳 *طريقة الدفع:* ${successRegistration.paymentMethod}\n⏳ *حالة الطلب:* قيد الانتظار والمراجعة من إدارة الأكاديمية`;
    openWhatsAppShare(msg, academy.contactPhone || '0988000111');
  };

  return (
    <div
      id="modal-register-academy"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="bg-[#0d1211] border-2 border-purple-500/50 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#050707] border-b border-purple-500/20 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Cairo']">
                التسجيل في {academy.name}
              </h2>
              <p className="text-xs text-purple-300">
                القسط الشهري: {formatSYP(academy.monthlyFee)} • المدرب: {academy.mainCoach}
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

        {/* Success Confirmation View */}
        {successRegistration ? (
          <div className="p-6 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-['Cairo']">
                تم تقديم طلب التسجيل بنجاح! ⚽
              </h3>
              <p className="text-xs text-gray-300 mt-2 max-w-md mx-auto leading-relaxed">
                طلب تسجيل الطالب <strong className="text-purple-400">{successRegistration.studentName}</strong> أصبح الآن <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md font-bold">قيد الانتظار</span> بانتظار مراجعة وقبول إدارة الأكاديمية.
              </p>
            </div>

            <div className="bg-[#050707] p-4 rounded-2xl border border-white/10 text-right text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-gray-400">الفئة العمرية:</span>
                <span className="text-white font-bold">{successRegistration.ageGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">المركز المفضل:</span>
                <span className="text-purple-400 font-bold">{successRegistration.preferredPosition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">خدمة المواصلات:</span>
                <span className="text-emerald-400 font-bold">{successRegistration.transportOption}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">طريقة الدفع:</span>
                <span className="text-white">{successRegistration.paymentMethod}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleShareWhatsApp}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                <Send className="w-4 h-4" />
                <span>إرسال وتأكيد عبر واتساب مع الأكاديمية</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-[#050707] hover:bg-white/10 text-gray-300 font-bold text-xs border border-white/10"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Student Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  اسم الطالب الثلاثي (إجباري) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف محمد الحكيم"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  تاريخ الميلاد (لحساب العمر والفئة تلقائياً) *
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Auto calculated Age and Category Badge */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">العمر المحسوب:</span>
                <strong className="text-white font-mono">{age} سنة</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-300">الفئة العمرية:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500 text-white font-bold text-[11px]">
                  {ageGroup}
                </span>
              </div>
            </div>

            {/* 2. Position & Transport */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  المركز المفضل للطالب *
                </label>
                <select
                  value={preferredPosition}
                  onChange={(e) => setPreferredPosition(e.target.value as PlayerPosition)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  خدمة المواصلات *
                </label>
                <select
                  value={transportOption}
                  onChange={(e) => setTransportOption(e.target.value as TransportStatus)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="بحاجة مواصلات">بحاجة مواصلات مع باص الأكاديمية</option>
                  <option value="مؤمنة">مؤمنة بمعرفة ولي الأمر</option>
                  <option value="غير مؤمنة">غير مؤمنة</option>
                </select>
              </div>
            </div>

            {/* 3. Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white mb-1">المحافظة *</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value as SyrianGovernorate)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  {SYRIAN_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">المدينة والحي بالتفصيل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دمشق - المزة أوتوستراد"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* 4. Parent Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  اسم ولي الأمر الثلاثي *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محمد الحكيم"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  رقم هاتف ولي الأمر (واتساب) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="09XXXXXXXX"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* 5. Student Photo (Mandatory with Logo Library / Upload) */}
            <SportLogoPicker
              value={studentPhoto}
              onChange={setStudentPhoto}
              label="صورة الطالب الشخصية أو الرمز الرياضي (إجباري)"
              required={true}
              accentColor="purple"
              helperText="ارفع صورة الطالب من المعرض أو اختر شعاراً ورمزاً رياضياً مناسباً"
            />

            {/* 6. Payment Method & Receipt */}
            <div className="bg-[#050707] p-4 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-bold text-white">طريقة دفع القسط الشهري ({formatSYP(academy.monthlyFee)}):</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('نقداً عند الحضور (كاش)')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    paymentMethod === 'نقداً عند الحضور (كاش)'
                      ? 'border-purple-400 bg-purple-500/20 text-white'
                      : 'border-white/10 bg-[#0d1211] text-gray-400'
                  }`}
                >
                  <div>
                    <span className="block font-bold">💰 نقداً (كاش)</span>
                    <span className="text-[10px] text-gray-400">للمدرب عند الحضور</span>
                  </div>
                  {paymentMethod === 'نقداً عند الحضور (كاش)' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('شام كاش')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    paymentMethod === 'شام كاش'
                      ? 'border-purple-400 bg-purple-500/20 text-white'
                      : 'border-white/10 bg-[#0d1211] text-gray-400'
                  }`}
                >
                  <div>
                    <span className="block font-bold">📱 شام كاش</span>
                    <span className="text-[10px] text-gray-400">تحويل إلكتروني فوري</span>
                  </div>
                  {paymentMethod === 'شام كاش' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </button>
              </div>

              {paymentMethod === 'شام كاش' && (
                <div className="p-3 rounded-xl bg-[#0d1211] border border-purple-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-purple-300 font-mono">
                    <span>حساب شام كاش للأكاديمية:</span>
                    <strong className="text-white">{academy.paymentOptions.shamCashAccount || 'SHAM-ACA-9456'}</strong>
                  </div>
                  <input
                    type="text"
                    placeholder="أدخل رقم إشعار تحويل شام كاش أو المرجع..."
                    value={shamCashTxId}
                    onChange={(e) => setShamCashTxId(e.target.value)}
                    className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              )}
            </div>

            {/* 7. Mandatory Receipt Photo */}
            <SportLogoPicker
              value={paymentReceiptPhoto}
              onChange={setPaymentReceiptPhoto}
              label="صورة إيصال دفع القسط أو إشعار التحويل (إجباري)"
              required={true}
              accentColor="purple"
              helperText="أرفق صورة وصل الإيداع أو إشعار شام كاش أو اختر رمز التأكيد الرياضي"
            />

            {/* 8. Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">ملاحظات إضافية أو توصيات صحية (اختياري)</label>
              <textarea
                rows={2}
                placeholder="أية ملاحظات طبية أو مواعيد مفضلة..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>جاري تسجيل الطالب وحفظ البيانات...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد تقديم طلب التسجيل في الأكاديمية</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
