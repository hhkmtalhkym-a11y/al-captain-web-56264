import React, { useState } from 'react';
import { X, Upload, Plus, Trophy, DollarSign, Image as ImageIcon } from 'lucide-react';
import {
  League,
  SyrianGovernorate,
  LeagueSystem,
  PitchCapacity,
  PitchSurface
} from '../types';
import { SYRIAN_GOVERNORATES, GOVERNORATE_COORDINATES } from '../constants/syrianData';
import { readImageAsBase64 } from '../utils/helpers';
import SportLogoPicker from './SportLogoPicker';
import MapLocationPicker from './MapLocationPicker';
import { UserProfile } from '../types';

interface CreateLeagueModalProps {
  isOpen: boolean;
  currentUser?: UserProfile;
  onClose: () => void;
  onSave: (newLeague: League) => void;
}

export default function CreateLeagueModal({
  isOpen,
  currentUser,
  onClose,
  onSave
}: CreateLeagueModalProps) {
  const [name, setName] = useState('');
  const [season, setSeason] = useState('الموسم الصيفي 2026');
  const [governorate, setGovernorate] = useState<SyrianGovernorate>('دمشق');
  const [city, setCity] = useState('دمشق');
  const [hostingVenue, setHostingVenue] = useState('');
  const [latitude, setLatitude] = useState<number>(33.5138);
  const [longitude, setLongitude] = useState<number>(36.2765);
  const [system, setSystem] = useState<LeagueSystem>('دوري نقاط');
  const [capacity, setCapacity] = useState<PitchCapacity>('7v7');
  const [surface, setSurface] = useState<PitchSurface>('عشب صناعي');
  const [organizerName, setOrganizerName] = useState(currentUser?.name || '');
  const [organizerPhone, setOrganizerPhone] = useState(currentUser?.phone || '');
  const [entryFee, setEntryFee] = useState<number>(300000);
  const [teamsCount, setTeamsCount] = useState<number>(8);
  const [cashPrize, setCashPrize] = useState<number>(4000000);
  const [terms, setTerms] = useState(
    '1. الالتزام بالروح الرياضية واللباس الموحد.\n2. التواجد قبل 20 دقيقة من موعد المباراة.\n3. القرارات التحكيمية ملزمة للجميع.'
  );

  const [image, setImage] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setUploadError('يرجى اختيار شعار أو رفع بوستر البطولة (إجباري)');
      return;
    }

    setIsSubmitting(true);

    const initialStandings = Array.from({ length: Number(teamsCount) }).map((_, idx) => ({
      position: idx + 1,
      teamName: `فريق ${idx + 1}`,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    }));

    const newLeague: League = {
      id: `lg-${Date.now()}`,
      ownerId: currentUser?.id || currentUser?.phone || 'user-organizer',
      name,
      season,
      image,
      governorate,
      city: hostingVenue ? `${city} - ${hostingVenue}` : city,
      hostingVenue,
      capacity,
      surface,
      system,
      organizerName,
      organizerPhone,
      entryFee: Number(entryFee),
      mainPlayersCount: 7,
      substitutePlayersCount: 5,
      teamsCount: Number(teamsCount),
      termsAndConditions: terms,
      prizes: {
        cup: true,
        medals: 'كؤوس وميداليات ذهبية وفضية',
        cashPrize: Number(cashPrize)
      },
      standings: initialStandings,
      fixtures: [],
      objections: [],
      reviews: [],
      rating: 5.0,
      status: 'مقبل',
      paymentOptions: {
        allowCash: true,
        allowShamCash: true,
        shamCashAccount: 'SHAM-7729-1940'
      },
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSave(newLeague);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      id="modal-create-league"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-amber-400/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto font-['Cairo']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#050707] border-b border-amber-400/20 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white">
                إنشاء وتنظيم بطولة / دوري جديد
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400">إطلاق دوري رياضي متكامل بإدارة إلكترونية وجداول رسمية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Banner / Logo Selection */}
          <SportLogoPicker
            value={image}
            onChange={(url) => {
              setImage(url);
              setUploadError('');
            }}
            label="بوستر أو شعار البطولة الرسمي"
            helperText="اختر شعار كأس أو درع رياضي جاهز من المكتبة أو ارفع بوستر من المعرض"
            accentColor="amber"
          />
          {uploadError && <p className="text-xs text-[#ff2a5f] mt-1">{uploadError}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">اسم البطولة / الدوري *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: بطولة صيف الشام 2026"
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">الموسم</label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Interactive Map Location Picker for Tournament Venue */}
          <MapLocationPicker
            governorate={governorate}
            onGovernorateChange={(gov) => setGovernorate(gov)}
            locationDetails={city}
            onLocationDetailsChange={(det) => setCity(det)}
            latitude={latitude}
            longitude={longitude}
            onCoordinatesChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
            title="موقع الملعب المستضيف للبطولة على خريطة Google (GPS)"
            accentColor="amber"
          />

          <div>
            <label className="block text-xs text-gray-300 mb-1">اسم الملعب أو المنشأة المستضيفة *</label>
            <input
              type="text"
              value={hostingVenue}
              onChange={(e) => setHostingVenue(e.target.value)}
              placeholder="مثال: مدينة تشرين الرياضية / ملعب الفيحاء"
              className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#050707] p-3 rounded-2xl border border-white/5">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">نظام البطولة</label>
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value as LeagueSystem)}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
              >
                <option value="دوري نقاط">دوري نقاط</option>
                <option value="خروج المغلوب">خروج المغلوب</option>
                <option value="مجموعات">مجموعات</option>
                <option value="أدوار إقصائية">أدوار إقصائية</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">عدد الفرق</label>
              <input
                type="number"
                value={teamsCount}
                onChange={(e) => setTeamsCount(Number(e.target.value))}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">رسوم الفريق (ل.س)</label>
              <input
                type="number"
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">الجائزة المالية (ل.س)</label>
              <input
                type="number"
                value={cashPrize}
                onChange={(e) => setCashPrize(Number(e.target.value))}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">اسم منظم البطولة *</label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">رقم جوال المنظم *</label>
              <input
                type="text"
                value={organizerPhone}
                onChange={(e) => setOrganizerPhone(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">الشروط واللوائح التنظيمية</label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'جاري الإنشاء...' : 'نشر وإطلاق البطولة رسمياً'}
          </button>
        </form>
      </div>
    </div>
  );
}
