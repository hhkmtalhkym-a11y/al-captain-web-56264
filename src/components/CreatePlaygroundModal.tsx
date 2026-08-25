import React, { useState } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  MapPin,
  ShieldCheck,
  Plus,
  Trash2,
  DollarSign,
  Info,
  Trophy,
  CheckCircle2
} from 'lucide-react';
import {
  Playground,
  SyrianGovernorate,
  PitchSurface,
  PitchCapacity,
  LightingStatus
} from '../types';
import { SYRIAN_GOVERNORATES, GOVERNORATE_COORDINATES, generate7DaySchedule } from '../constants/syrianData';
import { PRESET_SPORT_LOGOS } from '../constants/sportsLogos';
import { readImageAsBase64 } from '../utils/helpers';
import SportLogoPicker from './SportLogoPicker';

interface CreatePlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPlayground: Playground) => void;
}

export default function CreatePlaygroundModal({
  isOpen,
  onClose,
  onSave
}: CreatePlaygroundModalProps) {
  const [name, setName] = useState('');
  const [governorate, setGovernorate] = useState<SyrianGovernorate>('دمشق');
  const [detailedArea, setDetailedArea] = useState('');
  const [surface, setSurface] = useState<PitchSurface>('عشب صناعي');
  const [capacity, setCapacity] = useState<PitchCapacity>('7v7');
  const [lighting, setLighting] = useState<LightingStatus>('موجودة');
  const [pricePerHour, setPricePerHour] = useState<number>(100000);
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');

  // Specs
  const [lengthMeters, setLengthMeters] = useState(65);
  const [widthMeters, setWidthMeters] = useState(45);
  const [standsCapacity, setStandsCapacity] = useState(250);
  const [changingRoomsCount, setChangingRoomsCount] = useState(4);
  const [parkingSpotsCount, setParkingSpotsCount] = useState(30);

  // Amenities
  const [amenities, setAmenities] = useState({
    changingRooms: true,
    cafeteria: true,
    parking: true,
    medicalCenter: false,
    swimmingPool: false,
    clubShop: false,
    water: true,
    ballsEquipment: true,
    buffet: true,
    spectatorSeats: true,
    publicTransportNearby: true,
    nightLighting: true
  });

  // Payment Options
  const [allowCash, setAllowCash] = useState(true);
  const [allowShamCash, setAllowShamCash] = useState(true);
  const [shamCashAccount, setShamCashAccount] = useState('SHAM-');

  // Images uploaded from gallery (Base64)
  const [images, setImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newImgs: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const base64 = await readImageAsBase64(files[i]);
        newImgs.push(base64);
      }
      setImages((prev) => [...prev, ...newImgs]);
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء تحميل الصورة');
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setUploadError('يرجى رفع صورة واحدة على الأقل للملعب من جهازك (إجباري)');
      return;
    }

    setIsSubmitting(true);

    const coords = GOVERNORATE_COORDINATES[governorate] || { lat: 33.5138, lng: 36.2765 };

    const newPg: Playground = {
      id: `pg-${Date.now()}`,
      name,
      governorate,
      detailedArea,
      latitude: coords.lat + (Math.random() * 0.02 - 0.01),
      longitude: coords.lng + (Math.random() * 0.02 - 0.01),
      surface,
      capacity,
      lighting,
      pricePerHour: Number(pricePerHour),
      managerName,
      managerPhone,
      images,
      specs: {
        lengthMeters: Number(lengthMeters),
        widthMeters: Number(widthMeters),
        standsCapacity: Number(standsCapacity),
        coveredStands: Math.floor(Number(standsCapacity) * 0.6),
        openStands: Math.ceil(Number(standsCapacity) * 0.4),
        changingRoomsCount: Number(changingRoomsCount),
        parkingSpotsCount: Number(parkingSpotsCount),
        hasRunningTrack: false,
        hasRetractableRoof: surface === 'صالة مغلقة',
        hasHVAC: true,
        builtYear: 2024,
        lastRenovated: 2026
      },
      amenities,
      schedules: generate7DaySchedule(Number(pricePerHour)),
      reviews: [],
      rating: 5.0,
      reviewsCount: 1,
      paymentOptions: {
        allowCash,
        allowShamCash,
        shamCashAccount: allowShamCash ? shamCashAccount : undefined
      },
      extraServices: [
        { id: 'srv-1', name: 'حكم مباراة اتحادي معتمد', price: 35000 },
        { id: 'srv-2', name: 'كرات إضافية أصلية', price: 15000 },
        { id: 'srv-3', name: 'مياه معدنية مثلجة', price: 20000 },
        { id: 'srv-4', name: 'شيالات ملونة مميزة', price: 10000 }
      ],
      status: 'نشط',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTimeout(() => {
      onSave(newPg);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      id="modal-create-playground"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#00FFD2]/30 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl glow-primary my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#050707] border-b border-[#00FFD2]/20 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex items-center justify-center text-[#00FFD2]">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-['Cairo']">
                إضافة وإدراج ملعب رياضي جديد
              </h2>
              <p className="text-xs text-gray-400">
                تسجيل ملعبك في منصة الكابتن مجاناً وبدون أي عمولة (0% عمولة)
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Photos Selection (Preset Sports Badges or Gallery Upload) */}
          <div className="space-y-3">
            <SportLogoPicker
              value={images[0] || ''}
              onChange={(newUrl) => {
                if (!images.includes(newUrl)) {
                  setImages([newUrl, ...images.filter((img) => img !== newUrl)]);
                }
              }}
              label="شعار أو صورة الملعب الرئيسية"
              helperText="اختر شعاراً أو صورة ملعب من المكتبة الجاهزة، أو ارفع صوراً من المعرض أدناه"
              accentColor="teal"
            />

            <div className="bg-[#050707] p-4 rounded-2xl border border-[#00FFD2]/20">
              <label className="block text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>صور إضافية من استوديو جهازك (اختياري / إضافي)</span>
                <span className="text-[#00FFD2] font-normal text-[11px]">تم اختيار {images.length} صور</span>
              </label>

              {/* Drop/Click Zone */}
              <label className="border-2 border-dashed border-[#00FFD2]/40 hover:border-[#00FFD2] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#0d1211]/50 hover:bg-[#0d1211] transition-all">
                <Upload className="w-6 h-6 text-[#00FFD2] mb-1.5" />
                <span className="text-xs font-semibold text-white">انقر لرفع صور من معرض جهازك</span>
                <span className="text-[10px] text-gray-400 mt-0.5">يدعم صيغ JPG, PNG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>

              {uploadError && (
                <p className="text-xs text-[#ff2a5f] mt-2 font-medium">{uploadError}</p>
              )}

              {/* Images Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#00FFD2]/30 h-20">
                      <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 left-1 p-1 rounded-md bg-black/80 text-[#ff2a5f] hover:bg-[#ff2a5f] hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                اسم الملعب *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: ملعب النجوم المعشب"
                className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00FFD2]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                المحافظة السورية (قائمة الـ 14 محافظة) *
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value as SyrianGovernorate)}
                className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00FFD2]"
              >
                {SYRIAN_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                المنطقة والحي التفصيلي *
              </label>
              <input
                type="text"
                value={detailedArea}
                onChange={(e) => setDetailedArea(e.target.value)}
                placeholder="مثال: المزة - أوتستراد الفيلات الشرقية قرب جامع الأكرم"
                className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00FFD2]"
                required
              />
            </div>
          </div>

          {/* Technical Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#050707] p-4 rounded-2xl border border-white/5">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">نوع الأرضية</label>
              <select
                value={surface}
                onChange={(e) => setSurface(e.target.value as PitchSurface)}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="عشب صناعي">عشب صناعي</option>
                <option value="عشب طبيعي">عشب طبيعي</option>
                <option value="صالة مغلقة">صالة مغلقة</option>
                <option value="ترابي">ترابي</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">سعة الملعب</label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value as PitchCapacity)}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="6v6">6 ضد 6</option>
                <option value="7v7">7 ضد 7</option>
                <option value="8v8">8 ضد 8</option>
                <option value="9v9">9 ضد 9</option>
                <option value="10v10">10 ضد 10</option>
                <option value="11v11">11 ضد 11 (قانوني)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">الإنارة الليلية</label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value as LightingStatus)}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="موجودة">موجودة (كشافات LED)</option>
                <option value="غير موجودة">غير موجودة</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">سعر الساعة (ل.س)</label>
              <input
                type="number"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(Number(e.target.value))}
                step={5000}
                className="w-full bg-[#0d1211] border border-[#00FFD2]/30 rounded-lg p-2 text-xs text-[#00FFD2] font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Dimensions & Facilities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">الطول (متر)</label>
              <input
                type="number"
                value={lengthMeters}
                onChange={(e) => setLengthMeters(Number(e.target.value))}
                className="w-full bg-[#050707] border border-white/10 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">العرض (متر)</label>
              <input
                type="number"
                value={widthMeters}
                onChange={(e) => setWidthMeters(Number(e.target.value))}
                className="w-full bg-[#050707] border border-white/10 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">سعة المدرجات</label>
              <input
                type="number"
                value={standsCapacity}
                onChange={(e) => setStandsCapacity(Number(e.target.value))}
                className="w-full bg-[#050707] border border-white/10 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">غرف التبديل</label>
              <input
                type="number"
                value={changingRoomsCount}
                onChange={(e) => setChangingRoomsCount(Number(e.target.value))}
                className="w-full bg-[#050707] border border-white/10 rounded-lg p-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Manager Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                اسم المسؤول / صاحب الملعب *
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="الكابتن..."
                className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                رقم جوال المسؤول للحجوزات *
              </label>
              <input
                type="text"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                placeholder="09XXXXXXXX"
                className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                required
              />
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-[#050707] p-4 rounded-2xl border border-[#00FFD2]/20 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#00FFD2]" />
              طرق استلام المدفوعات من اللاعبين
            </h4>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCash}
                  onChange={(e) => setAllowCash(e.target.checked)}
                  className="rounded text-[#00FFD2] focus:ring-0"
                />
                <span>الدفع نقداً عند الحضور (كاش)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowShamCash}
                  onChange={(e) => setAllowShamCash(e.target.checked)}
                  className="rounded text-[#00FFD2] focus:ring-0"
                />
                <span>الدفع الإلكتروني (شام كاش)</span>
              </label>
            </div>

            {allowShamCash && (
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">
                  رقم حساب شام كاش لاستقبال الحوالات:
                </label>
                <input
                  type="text"
                  value={shamCashAccount}
                  onChange={(e) => setShamCashAccount(e.target.value)}
                  placeholder="SHAM-XXXX-XXXX"
                  className="w-full max-w-sm bg-[#0d1211] border border-[#00FFD2]/30 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-sm transition-all glow-primary shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'جاري الإدراج...' : 'تأكيد وإدراج الملعب في المنصة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
