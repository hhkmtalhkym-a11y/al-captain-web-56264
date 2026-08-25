import React, { useState } from 'react';
import { X, Upload, Sparkles, User, Activity, Plus } from 'lucide-react';
import {
  PlayerCv,
  SyrianGovernorate,
  PlayerPosition,
  SeekingStatus,
  PreferredFoot
} from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { readImageAsBase64 } from '../utils/helpers';
import SportLogoPicker from './SportLogoPicker';

interface CreatePlayerCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCv: PlayerCv) => void;
}

export default function CreatePlayerCvModal({
  isOpen,
  onClose,
  onSave
}: CreatePlayerCvModalProps) {
  const [fullName, setFullName] = useState('');
  const [governorate, setGovernorate] = useState<SyrianGovernorate>('دمشق');
  const [area, setArea] = useState('المزة');
  const [birthDate, setBirthDate] = useState('2004-06-15');
  const [position, setPosition] = useState<PlayerPosition>('مهاجم صريح');
  const [heightCm, setHeightCm] = useState<number>(178);
  const [weightKg, setWeightKg] = useState<number>(72);
  const [preferredFoot, setPreferredFoot] = useState<PreferredFoot>('اليمنى');
  const [seekingStatus, setSeekingStatus] = useState<SeekingStatus>('باحث عن نادي');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [previousClubs, setPreviousClubs] = useState('فئات نادي الجيش السوري');
  const [achievements, setAchievements] = useState('هداف دوري أشبال دمشق 2024');

  // Skills
  const [speed, setSpeed] = useState<number>(85);
  const [dribbling, setDribbling] = useState<number>(82);
  const [shooting, setShooting] = useState<number>(88);
  const [passing, setPassing] = useState<number>(78);
  const [stamina, setStamina] = useState<number>(84);
  const [defending, setDefending] = useState<number>(45);

  const [image, setImage] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await readImageAsBase64(file);
      setImage(base64);
      setUploadError('');
    } catch (err: any) {
      setUploadError(err.message || 'خطأ أثناء قراءة الصورة');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setUploadError('يرجى رفع صورة شخصية أو رياضية للاعب من المعرض (إجباري)');
      return;
    }

    setIsSubmitting(true);

    const newCv: PlayerCv = {
      id: `cv-${Date.now()}`,
      fullName,
      image,
      governorate,
      area,
      birthDate,
      position,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      preferredFoot,
      seekingStatus,
      phoneNumber,
      isBeaconSent: false,
      isPublic: true,
      skills: {
        passing: Number(passing),
        shooting: Number(shooting),
        stamina: Number(stamina),
        defending: Number(defending),
        speed: Number(speed),
        dribbling: Number(dribbling),
        tacticalIQ: 80,
        leadership: 75
      },
      stats: {
        matchesPlayed: 24,
        goals: 18,
        assists: 9,
        yellowCards: 1,
        redCards: 0,
        interceptions: 12,
        passAccuracyPercentage: 84
      },
      previousClubs,
      achievements,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSave(newCv);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      id="modal-create-player-cv"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-blue-500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#050707] border-b border-blue-500/20 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Cairo']">
                إنشاء بطاقة لاعب (كشاف المواهب السورية)
              </h2>
              <p className="text-xs text-gray-400">عرض مهاراتك وإحصائياتك لكشافي الأندية والأكاديميات</p>
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
          {/* Photo upload */}
          {/* Photo / Avatar Selection */}
          <SportLogoPicker
            value={image}
            onChange={(url) => {
              setImage(url);
              setUploadError('');
            }}
            label="صورة أو رمز اللاعب الرياضي"
            helperText="اختر رمز لاعب أو شارة قيادة من المكتبة أو ارفع صورتك الشخصية من الاستوديو"
            accentColor="teal"
          />
          {uploadError && <p className="text-xs text-[#ff2a5f] mt-1">{uploadError}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">اسم اللاعب الثلاثي *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: يوسف ماهر الحموي"
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">المحافظة السورية (الـ 14) *</label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value as SyrianGovernorate)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                {SYRIAN_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">المنطقة / الحي</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">مركز اللعب الأساسي *</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as PlayerPosition)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="حارس مرمى (GK)">حارس مرمى (GK)</option>
                <option value="قلب دفاع (CB)">قلب دفاع (CB)</option>
                <option value="ظهير أيمن (RB)">ظهير أيمن (RB)</option>
                <option value="ظهير أيسر (LB)">ظهير أيسر (LB)</option>
                <option value="وسط مدافع (CDM)">وسط مدافع (CDM)</option>
                <option value="صانع ألعاب (CAM)">صانع ألعاب (CAM)</option>
                <option value="جناح أيمن (RW)">جناح أيمن (RW)</option>
                <option value="جناح أيسر (LW)">جناح أيسر (LW)</option>
                <option value="مهاجم صريح (ST)">مهاجم صريح (ST)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">حالة اللاعب الحالية *</label>
              <select
                value={seekingStatus}
                onChange={(e) => setSeekingStatus(e.target.value as SeekingStatus)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="باحث عن نادي">باحث عن نادي</option>
                <option value="باحث عن أكاديمية">باحث عن أكاديمية</option>
                <option value="جاهز للاختبارات والمباريات">جاهز للاختبارات والمباريات</option>
                <option value="مرتبط بنادي حالياً">مرتبط بنادي حالياً</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-[#050707] p-3 rounded-2xl border border-white/5">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">الطول (سم)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">الوزن (كغ)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">القدم المفضلة</label>
              <select
                value={preferredFoot}
                onChange={(e) => setPreferredFoot(e.target.value as PreferredFoot)}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="القدم اليمنى">القدم اليمنى</option>
                <option value="القدم اليسرى">القدم اليسرى</option>
                <option value="كلتا القدمين">كلتا القدمين</option>
              </select>
            </div>
          </div>

          {/* Skills Sliders */}
          <div className="bg-[#050707] p-4 rounded-2xl border border-blue-500/20 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              تقييم المهارات الفردية (من 100):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>السرعة:</span>
                  <span className="font-mono text-blue-400 font-bold">{speed}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="99"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>المراوغة:</span>
                  <span className="font-mono text-emerald-400 font-bold">{dribbling}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="99"
                  value={dribbling}
                  onChange={(e) => setDribbling(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>قوة ودقة التسديد:</span>
                  <span className="font-mono text-[#ff2a5f] font-bold">{shooting}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="99"
                  value={shooting}
                  onChange={(e) => setShooting(Number(e.target.value))}
                  className="w-full accent-[#ff2a5f]"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>دقة التمرير وصناعة اللعب:</span>
                  <span className="font-mono text-amber-400 font-bold">{passing}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="99"
                  value={passing}
                  onChange={(e) => setPassing(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">رقم الجوال للتواصل *</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09XXXXXXXX"
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">الأندية والفرق السابقة</label>
              <input
                type="text"
                value={previousClubs}
                onChange={(e) => setPreviousClubs(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">أبرز الإنجازات والجوائز الفردية</label>
            <textarea
              rows={2}
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="مثال: أفضل لاعب في دوري دمشق للشباب، هداف البطولة الرمضانية..."
              className="w-full bg-[#050707] border border-white/10 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'جاري الحفظ...' : 'نشر وتثبيت بطاقة اللاعب'}
          </button>
        </form>
      </div>
    </div>
  );
}
