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
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Tag,
  Check
} from 'lucide-react';
import {
  Playground,
  SyrianGovernorate,
  PitchSurface,
  PitchCapacity,
  LightingStatus,
  DaySchedule,
  SlotSchedule,
  ExtraServiceItem
} from '../types';
import { SYRIAN_GOVERNORATES, GOVERNORATE_COORDINATES } from '../constants/syrianData';
import { PRESET_SPORT_LOGOS } from '../constants/sportsLogos';
import { readImageAsBase64, formatSYP } from '../utils/helpers';
import SportLogoPicker from './SportLogoPicker';
import MapLocationPicker from './MapLocationPicker';

interface CreatePlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPlayground: Playground) => void;
}

const DEFAULT_SLOT_TIMES = [
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

export default function CreatePlaygroundModal({
  isOpen,
  onClose,
  onSave
}: CreatePlaygroundModalProps) {
  const [name, setName] = useState('');
  const [governorate, setGovernorate] = useState<SyrianGovernorate>('دمشق');
  const [detailedArea, setDetailedArea] = useState('');
  const [latitude, setLatitude] = useState<number>(33.5138);
  const [longitude, setLongitude] = useState<number>(36.2765);
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

  // Extra Services with customizable prices
  const [extraServicesList, setExtraServicesList] = useState<Array<{ id: string; name: string; price: number; enabled: boolean }>>([
    { id: 'srv-1', name: 'حكم مباراة اتحادي معتمد', price: 35000, enabled: true },
    { id: 'srv-2', name: 'كرات إضافية أصلية معتمدة', price: 15000, enabled: true },
    { id: 'srv-3', name: 'مياه معدنية مثلجة ومشروبات', price: 20000, enabled: true },
    { id: 'srv-4', name: 'شيالات وأطقم ملونة مميزة', price: 10000, enabled: true },
    { id: 'srv-5', name: 'تصوير فيديو وتوثيق للمباراة', price: 25000, enabled: true },
    { id: 'srv-6', name: 'إضاءة كشافات ليلية خاصة', price: 15000, enabled: false }
  ]);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(10000);

  // 7-day schedule configuration
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [schedules, setSchedules] = useState<DaySchedule[]>(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = d.toLocaleDateString('ar-SY', { weekday: 'long' });
      const dateStr = d.toISOString().split('T')[0];

      return {
        date: dateStr,
        dayName,
        slots: DEFAULT_SLOT_TIMES.map((time, idx) => ({
          id: `slot-${i}-${idx}`,
          time,
          status: idx === 3 || idx === 6 ? 'booked' : idx === 11 ? 'closed' : 'available',
          price: 100000
        }))
      };
    });
  });

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

  // Toggle slot status for a given day and slot
  const toggleSlotStatus = (dayIdx: number, slotIdx: number) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const day = { ...updated[dayIdx] };
      const slots = [...day.slots];
      const current = slots[slotIdx].status;
      const nextStatus: 'available' | 'booked' | 'closed' =
        current === 'available' ? 'booked' : current === 'booked' ? 'closed' : 'available';

      slots[slotIdx] = {
        ...slots[slotIdx],
        status: nextStatus
      };
      day.slots = slots;
      updated[dayIdx] = day;
      return updated;
    });
  };

  const setAllSlotsForDay = (dayIdx: number, status: 'available' | 'closed') => {
    setSchedules((prev) => {
      const updated = [...prev];
      const day = { ...updated[dayIdx] };
      day.slots = day.slots.map((s) => ({ ...s, status }));
      updated[dayIdx] = day;
      return updated;
    });
  };

  // Extra service actions
  const handleToggleService = (id: string) => {
    setExtraServicesList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleUpdateServicePrice = (id: string, price: number) => {
    setExtraServicesList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price } : s))
    );
  };

  const handleAddCustomService = () => {
    if (!newServiceName.trim()) return;
    const newService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      price: Number(newServicePrice) || 10000,
      enabled: true
    };
    setExtraServicesList((prev) => [...prev, newService]);
    setNewServiceName('');
    setNewServicePrice(10000);
  };

  const handleDeleteService = (id: string) => {
    setExtraServicesList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setUploadError('يرجى اختيار شعار أو رفع صورة واحدة على الأقل للملعب (إجباري)');
      return;
    }

    setIsSubmitting(true);

    const coords = GOVERNORATE_COORDINATES[governorate] || { lat: 33.5138, lng: 36.2765 };

    const activeExtraServices: ExtraServiceItem[] = extraServicesList
      .filter((s) => s.enabled)
      .map((s) => ({
        id: s.id,
        name: s.name,
        price: Number(s.price)
      }));

    // Update schedules with the current pricePerHour if they weren't individually customized
    const finalSchedules = schedules.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => ({
        ...slot,
        price: slot.price === 100000 ? Number(pricePerHour) : slot.price
      }))
    }));

    const newPg: Playground = {
      id: `pg-${Date.now()}`,
      name,
      governorate,
      detailedArea,
      latitude: Number(latitude) || coords.lat,
      longitude: Number(longitude) || coords.lng,
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
      schedules: finalSchedules,
      reviews: [],
      rating: 5.0,
      reviewsCount: 1,
      paymentOptions: {
        allowCash,
        allowShamCash,
        shamCashAccount: allowShamCash ? shamCashAccount : undefined
      },
      extraServices: activeExtraServices,
      status: 'نشط',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTimeout(() => {
      onSave(newPg);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const currentActiveDay = schedules[selectedDayIndex] || schedules[0];

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
        <div className="bg-[#050707] border-b border-[#00FFD2]/20 p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex items-center justify-center text-[#00FFD2]">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white font-['Cairo']">
                إضافة وإدراج ملعب رياضي جديد
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400">
                حدد التوفر وجدول المواعيد والخدمات الإضافية وأسعارها بدقة (0% عمولة)
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-6">
          {/* 1. Photos Selection */}
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

            <div className="bg-[#050707] p-3.5 sm:p-4 rounded-2xl border border-[#00FFD2]/20">
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
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#00FFD2]/30 h-16 sm:h-20">
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

          {/* 2. Basic Info */}
          <div className="space-y-3.5">
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

            {/* Google Map Interactive Location Picker */}
            <MapLocationPicker
              governorate={governorate}
              onGovernorateChange={(gov) => setGovernorate(gov)}
              locationDetails={detailedArea}
              onLocationDetailsChange={(det) => setDetailedArea(det)}
              latitude={latitude}
              longitude={longitude}
              onCoordinatesChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              title="موقع الملعب على خريطة Google (GPS)"
              accentColor="teal"
            />
          </div>

          {/* 3. Technical Specs & Pricing */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#050707] p-3.5 sm:p-4 rounded-2xl border border-white/5">
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
              <label className="block text-[11px] text-gray-400 mb-1">سعر الساعة الأساسي (ل.س)</label>
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

          {/* 4. Interactive Schedule & Calendar (منقول إلى إنشاء الملعب لتحديد التاريخ والوقت) */}
          <div className="bg-[#050707] border border-[#00FFD2]/30 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#00FFD2]" />
                <h3 className="font-bold text-xs sm:text-sm text-white font-['Cairo']">
                  التقويم التفاعلي وتحديد المواعيد المتاحة (7 أيام)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> متاح
                </span>
                <span className="flex items-center gap-1 text-[#ff2a5f]">
                  <span className="w-2 h-2 rounded-full bg-[#ff2a5f]"></span> محجوز
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-gray-600"></span> مغلق
                </span>
              </div>
            </div>

            {/* Days Selector Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
              {schedules.map((day, idx) => {
                const isSelected = selectedDayIndex === idx;
                const availableCount = day.slots.filter((s) => s.status === 'available').length;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`p-2 rounded-xl text-center transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#00FFD2] text-black border-[#00FFD2] font-bold shadow-md'
                        : 'bg-[#0d1211] text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{day.dayName}</div>
                    <div className="text-[9px] opacity-80 mt-0.5">{day.date}</div>
                    <div className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-black' : 'text-emerald-400'}`}>
                      {availableCount} متاح
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Slots for current active day */}
            <div className="bg-[#0d1211] p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-300">
                  جدول يوم: <strong className="text-[#00FFD2] font-bold">{currentActiveDay.dayName} ({currentActiveDay.date})</strong> (انقر على الفترة لتغيير حالتها)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAllSlotsForDay(selectedDayIndex, 'available')}
                    className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold cursor-pointer"
                  >
                    فتح الكل
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllSlotsForDay(selectedDayIndex, 'closed')}
                    className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 text-[10px] font-bold cursor-pointer"
                  >
                    إغلاق اليوم
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 pt-1">
                {currentActiveDay.slots.map((slot, sIdx) => {
                  const statusLabel =
                    slot.status === 'available' ? 'متاح' : slot.status === 'booked' ? 'محجوز' : 'مغلق';

                  const badgeClass =
                    slot.status === 'available'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                      : slot.status === 'booked'
                      ? 'bg-[#ff2a5f]/15 border-[#ff2a5f]/40 text-[#ff2a5f] hover:bg-[#ff2a5f]/25'
                      : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-800/60';

                  return (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => toggleSlotStatus(selectedDayIndex, sIdx)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${badgeClass}`}
                      title="انقر لتبديل الحالة بين: متاح / محجوز / مغلق"
                    >
                      <div className="text-[11px] font-mono font-bold">{slot.time}</div>
                      <div className="text-[10px] mt-0.5 font-bold flex items-center justify-center gap-1">
                        <span>{statusLabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Extra Services & Customizable Pricing (الخدمات الإضافية وتحديد أسعارها) */}
          <div className="bg-[#050707] border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs sm:text-sm text-white font-['Cairo']">
                  الخدمات الإضافية وتحديد أسعارها (من قبل صاحب الملعب / الإدارة)
                </h3>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 font-bold">
                قابلة للتخصيص
              </span>
            </div>

            <p className="text-[11px] text-gray-400">
              حدد الخدمات المتاحة في منشأتك وضع السعر بالليرة السورية لكل خدمة ليتمكن المستأجر من إضافتها لحجزه:
            </p>

            {/* List of Extra Services */}
            <div className="space-y-2">
              {extraServicesList.map((service) => (
                <div
                  key={service.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    service.enabled
                      ? 'bg-[#0d1211] border-amber-500/30'
                      : 'bg-[#080c0b] border-white/5 opacity-60'
                  }`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={service.enabled}
                      onChange={() => handleToggleService(service.id)}
                      className="rounded text-amber-400 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-white font-bold truncate">
                      {service.name}
                    </span>
                  </label>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-[#050707] px-2 py-1 rounded-lg border border-white/10">
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => handleUpdateServicePrice(service.id, Number(e.target.value))}
                        step={1000}
                        min={0}
                        className="w-20 bg-transparent text-xs text-amber-300 font-mono font-bold text-center focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-400">ل.س</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteService(service.id)}
                      className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                      title="حذف الخدمة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Custom Service Row */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="اسم خدمة إضافية جديدة (مثال: بوفيه ضيافة خاص)..."
                className="flex-1 bg-[#0d1211] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#0d1211] px-2 py-1.5 rounded-xl border border-white/10 shrink-0">
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    step={1000}
                    placeholder="السعر"
                    className="w-20 bg-transparent text-xs text-amber-300 font-mono font-bold text-center focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">ل.س</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomService}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة خدمة</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6. Dimensions & Facilities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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

          {/* 7. Manager Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

          {/* 8. Payment Settings */}
          <div className="bg-[#050707] p-3.5 sm:p-4 rounded-2xl border border-[#00FFD2]/20 space-y-3">
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
              className="w-full py-3.5 px-6 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-sm transition-all glow-primary shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
