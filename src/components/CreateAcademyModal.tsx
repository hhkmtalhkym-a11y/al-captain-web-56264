import React, { useState } from 'react';
import { X, Upload, Plus, Bus, Image as ImageIcon, Calendar, Check, DollarSign, Users, Award } from 'lucide-react';
import { Academy, SyrianGovernorate, TransportStatus } from '../types';
import { SYRIAN_GOVERNORATES, GOVERNORATE_COORDINATES } from '../constants/syrianData';
import { readImageAsBase64 } from '../utils/helpers';
import SportLogoPicker from './SportLogoPicker';
import MapLocationPicker from './MapLocationPicker';

interface CreateAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newAcademy: Academy) => void;
}

const WEEKDAYS = [
  { id: 'السبت', label: 'السبت' },
  { id: 'الأحد', label: 'الأحد' },
  { id: 'الإثنين', label: 'الإثنين' },
  { id: 'الثلاثاء', label: 'الثلاثاء' },
  { id: 'الأربعاء', label: 'الأربعاء' },
  { id: 'الخميس', label: 'الخميس' },
  { id: 'الجمعة', label: 'الجمعة' }
];

const PRESET_AGE_GROUPS = [
  { label: 'براعم صغار (من 5 إلى 8 سنوات)', min: 5, max: 8 },
  { label: 'أشبال (من 8 إلى 12 سنة)', min: 8, max: 12 },
  { label: 'ناشئين (من 12 إلى 15 سنة)', min: 12, max: 15 },
  { label: 'شباب (من 15 إلى 18 سنة)', min: 15, max: 18 },
  { label: 'شامل الفئات الأساسية (من 6 إلى 16 سنة)', min: 6, max: 16 },
  { label: 'متقدم وكبار (من 16 إلى 22 سنة)', min: 16, max: 22 }
];

export default function CreateAcademyModal({
  isOpen,
  onClose,
  onSave
}: CreateAcademyModalProps) {
  const [name, setName] = useState('');
  const [governorate, setGovernorate] = useState<SyrianGovernorate>('دمشق');
  const [locationDetails, setLocationDetails] = useState('');
  const [latitude, setLatitude] = useState<number>(33.5138);
  const [longitude, setLongitude] = useState<number>(36.2765);
  const [mainCoach, setMainCoach] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [monthlyFee, setMonthlyFee] = useState<number>(150000);

  // Age group dropdowns (From age - To age)
  const [ageMin, setAgeMin] = useState<number>(6);
  const [ageMax, setAgeMax] = useState<number>(16);

  // Training Days (multi-select buttons)
  const [selectedDays, setSelectedDays] = useState<string[]>(['السبت', 'الإثنين', 'الأربعاء']);

  // Payment Methods
  const [allowCash, setAllowCash] = useState(true);
  const [allowShamCash, setAllowShamCash] = useState(true);
  const [shamCashAccount, setShamCashAccount] = useState('SHAM-7729-1940');
  const [allowSyriatelCash, setAllowSyriatelCash] = useState(true);
  const [allowBankTransfer, setAllowBankTransfer] = useState(false);

  const [description, setDescription] = useState('');
  const [transportStatus, setTransportStatus] = useState<TransportStatus>('مؤمنة');

  const [image, setImage] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Toggle training day
  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleApplyPresetAge = (min: number, max: number) => {
    setAgeMin(min);
    setAgeMax(max);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setUploadError('يرجى اختيار شعار أو رفع صورة رئيسية للأكاديمية (إجباري)');
      return;
    }

    if (selectedDays.length === 0) {
      alert('يرجى اختيار يوم تدريب واحد على الأقل من أزرار أيام الأسبوع');
      return;
    }

    setIsSubmitting(true);
    const coords = GOVERNORATE_COORDINATES[governorate] || { lat: 33.5138, lng: 36.2765 };

    const targetAgeGroups = `من سن ${ageMin} إلى سن ${ageMax} سنة`;
    const daysScheduleText = `${selectedDays.length} أيام أسبوعياً (${selectedDays.join(' - ')})`;

    // Compile payment methods list
    const paymentMethodsList: string[] = [];
    if (allowCash) paymentMethodsList.push('نقداً عند الحضور (كاش)');
    if (allowShamCash) paymentMethodsList.push(`شام كاش (${shamCashAccount})`);
    if (allowSyriatelCash) paymentMethodsList.push('سيريتل / إم تي إن كاش');
    if (allowBankTransfer) paymentMethodsList.push('تحويل بنكي / محفظة');

    const newAca: Academy = {
      id: `aca-${Date.now()}`,
      name,
      image,
      images: [image],
      governorate,
      locationDetails,
      latitude: Number(latitude) || coords.lat,
      longitude: Number(longitude) || coords.lng,
      mainCoach,
      contactPhone,
      monthlyFee: Number(monthlyFee),
      targetAgeGroups,
      ageGroupMin: ageMin,
      ageGroupMax: ageMax,
      trainingDays: selectedDays,
      paymentMethodsList,
      description: description.trim() || `أكاديمية رياضية متخصصة في تدريب وتطوير الناشئين في سوريا (${targetAgeGroups}).`,
      transportStatus,
      facilities: ['ملاعب معشبة', 'معدات تدريب حديثة', 'غرف تبديل ملابس ومواقف', 'كادر تدريبي معتمد'],
      trainers: [
        {
          id: 'tr-new',
          name: mainCoach,
          specialization: 'المدرب العام ورئيس الجهاز الفني',
          experienceYears: 10,
          image: image
        }
      ],
      programs: [
        {
          id: 'pr-new',
          title: 'برنامج التطوير الكروي والمهاري الشامل',
          durationMonths: 6,
          daysSchedule: daysScheduleText,
          targetAge: targetAgeGroups,
          objectives: 'تطوير الأساسيات التكتيكية والمهارية والبدنية تحت إشراف مدربين مؤهلين.'
        }
      ],
      reviews: [],
      rating: 5.0,
      paymentOptions: {
        allowCash,
        allowShamCash,
        shamCashAccount: allowShamCash ? shamCashAccount : undefined
      },
      status: 'نشط',
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSave(newAca);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      id="modal-create-academy"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-purple-500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto font-['Cairo']"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#050707] border-b border-purple-500/20 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                إضافة وإدراج أكاديمية رياضية جديدة
              </h2>
              <p className="text-[11px] text-gray-400">
                حدد الفئة السنية، أيام التدريب الأسبوعية، وطرق الدفع المعتمدة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Logo / Image Selection */}
          <SportLogoPicker
            value={image}
            onChange={(url) => {
              setImage(url);
              setUploadError('');
            }}
            label="شعار أو صورة الأكاديمية *"
            helperText="اختر شعاراً رياضياً من المكتبة أو ارفع صورة الأكاديمية"
            accentColor="purple"
          />
          {uploadError && <p className="text-xs text-[#ff2a5f] mt-1">{uploadError}</p>}

          <div>
            <label className="block text-xs text-gray-300 mb-1">اسم الأكاديمية *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أكاديمية النجوم السورية لكرة القدم"
              className="w-full bg-[#050707] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {/* Interactive Google Map Location Picker */}
          <MapLocationPicker
            governorate={governorate}
            onGovernorateChange={(gov) => setGovernorate(gov)}
            locationDetails={locationDetails}
            onLocationDetailsChange={(det) => setLocationDetails(det)}
            latitude={latitude}
            longitude={longitude}
            onCoordinatesChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
            title="موقع الأكاديمية ومقر التدريب على خريطة Google (GPS)"
            accentColor="purple"
          />

          {/* SECTION 1: الفئة السنية (Age Group dropdowns & presets) */}
          <div className="bg-[#050707] p-4 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>الفئة السنية المستهدفة (من عمر إلى عمر) *</span>
              </label>
              <span className="text-[11px] font-mono text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                من سن {ageMin} إلى {ageMax} سنة
              </span>
            </div>

            {/* From Age - To Age Dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">من عمر (الحد الأدنى)</label>
                <select
                  value={ageMin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAgeMin(val);
                    if (val > ageMax) setAgeMax(val + 2);
                  }}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                >
                  {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((age) => (
                    <option key={`min-${age}`} value={age}>
                      {age} سنوات
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">إلى عمر (الحد الأقصى)</label>
                <select
                  value={ageMax}
                  onChange={(e) => setAgeMax(Number(e.target.value))}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                >
                  {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 25].map((age) => (
                    <option key={`max-${age}`} value={age} disabled={age < ageMin}>
                      {age} سنة
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Presets Pills */}
            <div>
              <span className="text-[10px] text-gray-400 block mb-1.5">أو اختر فئة محددة مسبقاً:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_AGE_GROUPS.map((preset) => {
                  const isSelected = ageMin === preset.min && ageMax === preset.max;
                  return (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => handleApplyPresetAge(preset.min, preset.max)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: أيام التدريب الأسبوعية (Training Days Buttons) */}
          <div className="bg-[#050707] p-4 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>أيام التدريب الأسبوعية (يمكن اختيار عدة أيام) *</span>
              </label>
              <span className="text-[11px] font-mono text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-lg">
                {selectedDays.length} أيام أسبوعياً
              </span>
            </div>

            {/* Weekday toggle buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {WEEKDAYS.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    type="button"
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500 border-purple-400 text-white shadow-lg scale-102'
                        : 'bg-[#0d1211] border-white/10 text-gray-400 hover:text-white hover:border-purple-500/40'
                    }`}
                  >
                    <span>{day.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: طرق الدفع (Payment Methods) */}
          <div className="bg-[#050707] p-4 rounded-2xl border border-purple-500/20 space-y-3">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span>طرق الدفع المعتمدة للاشتراك</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Cash */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1211] border border-white/5 cursor-pointer hover:border-purple-500/30">
                <input
                  type="checkbox"
                  checked={allowCash}
                  onChange={(e) => setAllowCash(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-purple-400"
                />
                <span className="text-xs text-gray-200">💵 نقداً عند الحضور (كاش)</span>
              </label>

              {/* Sham Cash */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1211] border border-white/5 cursor-pointer hover:border-purple-500/30">
                <input
                  type="checkbox"
                  checked={allowShamCash}
                  onChange={(e) => setAllowShamCash(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-purple-400"
                />
                <span className="text-xs text-gray-200">💳 شام كاش (Sham Cash)</span>
              </label>

              {/* Syriatel / MTN Cash */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1211] border border-white/5 cursor-pointer hover:border-purple-500/30">
                <input
                  type="checkbox"
                  checked={allowSyriatelCash}
                  onChange={(e) => setAllowSyriatelCash(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-purple-400"
                />
                <span className="text-xs text-gray-200">📱 سيريتل كاش / إم تي إن كاش</span>
              </label>

              {/* Bank Transfer */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1211] border border-white/5 cursor-pointer hover:border-purple-500/30">
                <input
                  type="checkbox"
                  checked={allowBankTransfer}
                  onChange={(e) => setAllowBankTransfer(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-purple-400"
                />
                <span className="text-xs text-gray-200">🏦 تحويل بنكي / محفظة إلكترونية</span>
              </label>
            </div>

            {allowShamCash && (
              <div className="pt-1">
                <label className="block text-[11px] text-gray-400 mb-1">رقم حساب شام كاش للأكاديمية</label>
                <input
                  type="text"
                  value={shamCashAccount}
                  onChange={(e) => setShamCashAccount(e.target.value)}
                  placeholder="مثال: SHAM-7729-1940"
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-3 py-2 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-400"
                />
              </div>
            )}
          </div>

          {/* Coach, Fees, Transport, Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#050707] p-3 rounded-2xl border border-white/5">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">المدرب الرئيسي *</label>
              <input
                type="text"
                value={mainCoach}
                onChange={(e) => setMainCoach(e.target.value)}
                placeholder="الكابتن..."
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">الاشتراك الشهري (ل.س)</label>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">حالة المواصلات</label>
              <select
                value={transportStatus}
                onChange={(e) => setTransportStatus(e.target.value as TransportStatus)}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
              >
                <option value="مؤمنة">مؤمنة (باصات متوفرة)</option>
                <option value="بحاجة مواصلات">بحاجة مواصلات</option>
                <option value="غير مؤمنة">غير مؤمنة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">رقم هاتف التسجيل والتواصل *</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="09XXXXXXXX"
              className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">نبذة عن الأكاديمية وأهداف التدريب</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف البرامج والتدريب والملاعب المعتمدة..."
              className="w-full bg-[#050707] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'جاري الإدراج...' : 'إدراج الأكاديمية في المنصة'}
          </button>
        </form>
      </div>
    </div>
  );
}
