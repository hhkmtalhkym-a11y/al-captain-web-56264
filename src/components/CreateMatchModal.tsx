import React, { useState } from 'react';
import { X, Swords, DollarSign, Calendar, MapPin, CheckCircle2, Shield, Users, Clock } from 'lucide-react';
import {
  FriendlyMatch,
  SyrianGovernorate,
  AgeGroup,
  MatchLevel,
  CostSplitMethod,
  PaymentMethodType
} from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { formatSYP } from '../utils/helpers';
import SportLogoPicker from './SportLogoPicker';
import MapLocationPicker from './MapLocationPicker';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newMatch: FriendlyMatch) => Promise<void> | void;
}

export default function CreateMatchModal({
  isOpen,
  onClose,
  onSave
}: CreateMatchModalProps) {
  const [hostTeamName, setHostTeamName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueLocation, setVenueLocation] = useState('');
  const [governorate, setGovernorate] = useState<SyrianGovernorate>('دمشق');
  const [latitude, setLatitude] = useState<number>(33.5138);
  const [longitude, setLongitude] = useState<number>(36.2765);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('20:00 - 21:30');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('شباب');
  const [level, setLevel] = useState<MatchLevel>('متوسط');
  const [playersCountRequired, setPlayersCountRequired] = useState<string>('7v7');
  const [costSplitMethod, setCostSplitMethod] = useState<CostSplitMethod>(
    'مناصفة بين الفريقين (50-50)'
  );
  const [pitchPrice, setPitchPrice] = useState<number>(120000);
  const [refereePrice, setRefereePrice] = useState<number>(35000);
  const [refereeName, setRefereeName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerPhone, setOrganizerPhone] = useState('09');
  const [hostJerseyColor, setHostJerseyColor] = useState('أبيض وأسود');
  const [guestJerseyColor, setGuestJerseyColor] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    'نقداً عند الحضور (كاش)'
  );
  const [shamCashAccount, setShamCashAccount] = useState('SHAM-MATCH-9456');
  const [hostTeamImage, setHostTeamImage] = useState<string>(
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80'
  );
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const ageGroups: AgeGroup[] = ['رجال', 'شباب', 'ناشئين', 'أشبال'];
  const matchLevels: MatchLevel[] = ['مبتدئ', 'متوسط', 'متقدم', 'محترف'];
  const costSplitOptions: CostSplitMethod[] = [
    'مناصفة بين الفريقين (50-50)',
    'الخاسر يدفع بالكامل',
    'المستضيف يدفع بالكامل'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostTeamName.trim()) {
      setUploadError('يرجى إدخال اسم الفريق المستضيف');
      return;
    }
    if (!venueName.trim()) {
      setUploadError('يرجى إدخال اسم الملعب');
      return;
    }
    if (!organizerName.trim()) {
      setUploadError('يرجى إدخال اسم المنظم');
      return;
    }
    if (!organizerPhone.trim()) {
      setUploadError('يرجى إدخال رقم هاتف للتواصل');
      return;
    }
    if (!hostTeamImage) {
      setUploadError('يرجى اختيار شعار أو صورة الفريق من المعرض (إجباري)');
      return;
    }

    setIsSubmitting(true);

    const newMatch: FriendlyMatch = {
      id: `fm-${Date.now()}`,
      hostTeamName: hostTeamName.trim(),
      hostTeamImage,
      venueName: venueName.trim(),
      venueLocation: venueLocation.trim() || `${governorate} - ${venueName.trim()}`,
      governorate,
      date,
      time,
      ageGroup,
      level,
      playersCountRequired,
      costSplitMethod,
      pitchPrice: Number(pitchPrice),
      refereePrice: Number(refereePrice),
      refereeName: refereeName.trim() || undefined,
      organizerName: organizerName.trim(),
      organizerPhone: organizerPhone.trim(),
      hostJerseyColor: hostJerseyColor.trim() || undefined,
      guestJerseyColor: guestJerseyColor.trim() || undefined,
      notesAndChallengeRules: notes.trim() || undefined,
      paymentMethod,
      shamCashAccountNumber: paymentMethod === 'شام كاش' ? shamCashAccount : undefined,
      paymentStatus: 'قيد الانتظار',
      status: 'مفتوح',
      statusApprovedByAdmin: true,
      createdAt: new Date().toISOString()
    };

    try {
      await onSave(newMatch);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء حفظ المباراة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-create-match"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#ff2a5f]/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#050707] border-b border-[#ff2a5f]/20 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff2a5f]/10 border border-[#ff2a5f]/30 flex items-center justify-center text-[#ff2a5f]">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Cairo']">
                إنشاء تحدي مباراة ودية جديدة
              </h2>
              <p className="text-xs text-gray-400">نشر طلب مباراة وتحدي لأي فريق في محافظتك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {uploadError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs">
              {uploadError}
            </div>
          )}

          {/* 1. Team Logo with Preset Badges */}
          <SportLogoPicker
            value={hostTeamImage}
            onChange={setHostTeamImage}
            label="شعار أو صورة الفريق المستضيف (إجباري)"
            required={true}
            accentColor="pink"
            helperText="ارفع شعار ناديك أو اختر من الشعارات والرموز الرياضية الجاهزة"
          />

          {/* 2. Basic Match Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  اسم الفريق المستضيف (إجباري) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فريق فرسان قاسيون"
                  value={hostTeamName}
                  onChange={(e) => setHostTeamName(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  اسم الملعب (إجباري) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ملعب الفيحاء العشبي الدولي"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f]"
                />
              </div>
            </div>

            {/* Interactive Map Location Picker for Match Venue */}
            <MapLocationPicker
              governorate={governorate}
              onGovernorateChange={(gov) => setGovernorate(gov)}
              locationDetails={venueLocation}
              onLocationDetailsChange={(det) => setVenueLocation(det)}
              latitude={latitude}
              longitude={longitude}
              onCoordinatesChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              title="موقع ملعب المباراة على خريطة Google (GPS)"
              accentColor="pink"
            />
          </div>

          {/* 3. Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white mb-1">تاريخ المباراة (إجباري) *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#ff2a5f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">التوقيت والفترة الزمنية (إجباري) *</label>
              <input
                type="text"
                required
                placeholder="20:00 - 21:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f]"
              />
            </div>
          </div>

          {/* 4. Age Category Buttons */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">الفئة العمرية (أزرار الاختيار):</label>
            <div className="grid grid-cols-4 gap-2">
              {ageGroups.map((ag) => (
                <button
                  key={ag}
                  type="button"
                  onClick={() => setAgeGroup(ag)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    ageGroup === ag
                      ? 'bg-[#ff2a5f] text-white shadow-md shadow-[#ff2a5f]/30 border border-[#ff2a5f]'
                      : 'bg-[#050707] text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {ag}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Match Level Buttons & Players Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white mb-1.5">مستوى المباراة:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {matchLevels.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                      level === lvl
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-[#050707] text-gray-400 border border-white/5 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1.5">عدد اللاعبين المطلوبين:</label>
              <select
                value={playersCountRequired}
                onChange={(e) => setPlayersCountRequired(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#ff2a5f]"
              >
                <option value="5v5">5 ضد 5 (صغير)</option>
                <option value="6v6">6 ضد 6</option>
                <option value="7v7">7 ضد 7 (معتمد)</option>
                <option value="8v8">8 ضد 8</option>
                <option value="9v9">9 ضد 9</option>
                <option value="11v11">11 ضد 11 (ملعب نظامي كامل)</option>
              </select>
            </div>
          </div>

          {/* 6. Pitch Cost Split Buttons */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">
              طريقة تقسيم أجرة الملعب (أزرار):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {costSplitOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCostSplitMethod(opt)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                    costSplitMethod === opt
                      ? 'bg-[#00FFD2] text-black shadow-md shadow-[#00FFD2]/20 font-black'
                      : 'bg-[#050707] text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Pitch & Referee Fees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white mb-1">أجرة حجز الملعب (ل.س)</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={pitchPrice}
                onChange={(e) => setPitchPrice(Number(e.target.value))}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#ff2a5f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">أجور الحكام (كتابة أو تقدير بالليرة)</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={refereePrice}
                onChange={(e) => setRefereePrice(Number(e.target.value))}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#ff2a5f]"
              />
            </div>
          </div>

          {/* 8. Organizer Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                اسم المنظم / كابتن الفريق (إجباري) *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: كابتن عامر"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">
                رقم هاتف للتواصل والواتساب (إجباري) *
              </label>
              <input
                type="tel"
                required
                placeholder="0945688090"
                value={organizerPhone}
                onChange={(e) => setOrganizerPhone(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f]"
              />
            </div>
          </div>

          {/* 9. Uniform Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white mb-1">لون لباس فريقك المستضيف</label>
              <input
                type="text"
                placeholder="مثال: قميص أبيض وشورت أسود"
                value={hostJerseyColor}
                onChange={(e) => setHostJerseyColor(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">لون لباس الفريق المنضم المطلوب تجنبه</label>
              <input
                type="text"
                placeholder="مثال: يرجى عدم ارتداء اللون الأبيض"
                value={guestJerseyColor}
                onChange={(e) => setGuestJerseyColor(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f]"
              />
            </div>
          </div>

          {/* 10. Payment Options */}
          <div className="bg-[#050707] p-3 rounded-2xl border border-white/10 space-y-2">
            <label className="block text-xs font-bold text-white">خيارات الدفع للمباراة:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('نقداً عند الحضور (كاش)')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                  paymentMethod === 'نقداً عند الحضور (كاش)'
                    ? 'border-[#ff2a5f] bg-[#ff2a5f]/20 text-white'
                    : 'border-white/10 bg-[#0d1211] text-gray-400'
                }`}
              >
                <span>💰 نقداً (كاش)</span>
                {paymentMethod === 'نقداً عند الحضور (كاش)' && <CheckCircle2 className="w-4 h-4 text-[#ff2a5f]" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('شام كاش')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                  paymentMethod === 'شام كاش'
                    ? 'border-[#ff2a5f] bg-[#ff2a5f]/20 text-white'
                    : 'border-white/10 bg-[#0d1211] text-gray-400'
                }`}
              >
                <span>📱 شام كاش</span>
                {paymentMethod === 'شام كاش' && <CheckCircle2 className="w-4 h-4 text-[#ff2a5f]" />}
              </button>
            </div>
          </div>

          {/* 11. Additional Ideas & Rules */}
          <div>
            <label className="block text-xs font-bold text-white mb-1">
              أفكار إضافية وملاحظات التحدي (اختياري)
            </label>
            <textarea
              rows={2}
              placeholder="مثال: المباراة بروح رياضية عالية، يرجى التواجد قبل 15 دقيقة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f] resize-none"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#ff2a5f] hover:bg-[#e02050] text-white font-black text-xs transition-all shadow-xl shadow-[#ff2a5f]/30 flex items-center justify-center gap-2 glow-pink"
            >
              {isSubmitting ? (
                <span>جاري نشر التحدي في قاعدة البيانات...</span>
              ) : (
                <>
                  <Swords className="w-4 h-4" />
                  <span>نشر وإطلاق تحدي المباراة الودية</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
