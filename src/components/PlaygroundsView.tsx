import React, { useState } from 'react';
import {
  Compass,
  Filter,
  Search,
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Playground,
  SyrianGovernorate,
  PitchSurface,
  PitchCapacity,
  LightingStatus
} from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { formatSYP } from '../utils/helpers';
import PlaygroundCard from './PlaygroundCard';

interface PlaygroundsViewProps {
  playgrounds: Playground[];
  currentUser?: any;
  selectedGovernorate: string;
  isAdmin?: boolean;
  onSelectGovernorate: (gov: string) => void;
  onViewPlayground: (pg: Playground) => void;
  onBookPlayground: (pg: Playground) => void;
  onOpenCreateModal: () => void;
  onDeletePlayground?: (id: string) => void;
}

export default function PlaygroundsView({
  playgrounds,
  currentUser,
  selectedGovernorate,
  isAdmin = false,
  onSelectGovernorate,
  onViewPlayground,
  onBookPlayground,
  onOpenCreateModal,
  onDeletePlayground
}: PlaygroundsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurface, setSelectedSurface] = useState<string>('الكل');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('الكل');
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [showInteractiveCalendar, setShowInteractiveCalendar] = useState<boolean>(true);

  // Generate 7 upcoming days
  const upcoming7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = d.toLocaleDateString('ar-SY', { weekday: 'long' });
    const formattedDate = d.toISOString().split('T')[0];
    return { offset: i, dayName, formattedDate };
  });

  const activeDay = upcoming7Days[selectedDayOffset];

  // Filter playgrounds
  const filteredPlaygrounds = playgrounds.filter((pg) => {
    const matchesGov =
      selectedGovernorate === 'الكل' || pg.governorate === selectedGovernorate;
    const matchesSearch =
      pg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pg.detailedArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pg.governorate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSurface =
      selectedSurface === 'الكل' || pg.surface === selectedSurface;
    const matchesCapacity =
      selectedCapacity === 'الكل' || pg.capacity === selectedCapacity;
    const matchesPrice = pg.pricePerHour <= maxPrice;

    return (
      matchesGov &&
      matchesSearch &&
      matchesSurface &&
      matchesCapacity &&
      matchesPrice
    );
  });

  return (
    <div id="view-playgrounds" className="space-y-6 animate-fadeIn pb-16">
      {/* Header & Add Pitch Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Cairo'] flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#00FFD2]" />
            <span>دليل الملاعب والحجوزات الفورية في سوريا</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            استعرض الملاعب المعتمدة، تحقق من جدول المواعيد المتاحة على مدار 7 أيام، واحجز بـ 0% عمولة
          </p>
        </div>

        <button
          id="btn-add-playground"
          onClick={onOpenCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs transition-all shadow-lg glow-primary flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ملعب جديد</span>
        </button>
      </div>

      {/* 7-Day Visual Interactive Schedule Calendar */}
      <div className="bg-[#0d1211] border border-[#00FFD2]/30 rounded-3xl p-5 glow-primary space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#00FFD2]" />
            <h2 className="font-bold text-white text-sm font-['Cairo']">
              التقويم التفاعلي لمواعيد الحجز (7 أيام قادمة)
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> متاح
            </span>
            <span className="flex items-center gap-1 text-[#ff2a5f]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a5f] inline-block"></span> محجوز
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-600 inline-block"></span> مغلق
            </span>
          </div>
        </div>

        {/* 7 Days Selector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {upcoming7Days.map((day) => {
            const isSelected = selectedDayOffset === day.offset;
            return (
              <button
                key={day.offset}
                onClick={() => setSelectedDayOffset(day.offset)}
                className={`p-2.5 rounded-2xl text-center transition-all border ${
                  isSelected
                    ? 'bg-[#00FFD2] text-black border-[#00FFD2] shadow-lg glow-primary font-black'
                    : 'bg-[#050707] text-gray-300 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-[11px] font-bold">{day.dayName}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{day.formattedDate}</div>
              </button>
            );
          })}
        </div>

        {/* Interactive Slots for selected day */}
        <div className="bg-[#050707] border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              المواعيد التفاعلية ليوم: <strong className="text-white">{activeDay.dayName} ({activeDay.formattedDate})</strong>
            </span>
            <span className="text-emerald-400 font-bold">فترات الحجز الرسمية (كل 90 دقيقة)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { time: '08:00 - 09:30', status: 'متاح' },
              { time: '09:30 - 11:00', status: 'متاح' },
              { time: '11:00 - 12:30', status: 'متاح' },
              { time: '12:30 - 14:00', status: 'محجوز' },
              { time: '14:00 - 15:30', status: 'متاح' },
              { time: '15:30 - 17:00', status: 'متاح' },
              { time: '17:00 - 18:30', status: 'محجوز' },
              { time: '18:30 - 20:00', status: 'محجوز' },
              { time: '20:00 - 21:30', status: 'متاح' },
              { time: '21:30 - 23:00', status: 'متاح' },
              { time: '23:00 - 00:30', status: 'متاح' },
              { time: '00:30 - 02:00', status: 'مغلق' }
            ].map((slot, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl text-center border text-xs font-mono transition-all ${
                  slot.status === 'متاح'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer'
                    : slot.status === 'محجوز'
                    ? 'bg-[#ff2a5f]/10 border-[#ff2a5f]/30 text-[#ff2a5f] cursor-not-allowed'
                    : 'bg-gray-800/30 border-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="font-bold">{slot.time}</div>
                <div className="text-[10px] mt-0.5 font-['Cairo']">{slot.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters and Search Bar */}
      <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-5 space-y-4">
        {/* Search & Governorate Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute right-3 top-3 text-gray-500" />
            <input
              id="input-search-playgrounds"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الملعب، المنطقة، أو المدينة..."
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2] transition-colors"
            />
          </div>

          {/* Governorate Select */}
          <div className="relative">
            <MapPin className="w-4 h-4 absolute right-3 top-3 text-gray-500 pointer-events-none" />
            <select
              id="select-playground-gov"
              value={selectedGovernorate}
              onChange={(e) => onSelectGovernorate(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-xs text-white focus:outline-none focus:border-[#00FFD2] appearance-none"
            >
              <option value="الكل">كل المحافظات (14 محافظة)</option>
              {SYRIAN_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5 text-xs">
          {/* Surface Type */}
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">نوع الأرضية:</label>
            <select
              value={selectedSurface}
              onChange={(e) => setSelectedSurface(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white"
            >
              <option value="الكل">جميع الأرضيات</option>
              <option value="عشب صناعي">عشب صناعي (جيل رابع)</option>
              <option value="عشب طبيعي">عشب طبيعي</option>
              <option value="صالة مغلقة">صالة مغلقة (باركيه/تارتان)</option>
              <option value="ترابي">ترابي</option>
            </select>
          </div>

          {/* Pitch Capacity */}
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">سعة الملعب:</label>
            <select
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white"
            >
              <option value="الكل">جميع السعات</option>
              <option value="5v5">خماسي (5v5)</option>
              <option value="6v6">سداسي (6v6)</option>
              <option value="7v7">سباعي (7v7)</option>
              <option value="8v8">ثماني (8v8)</option>
              <option value="11v11">قانوني (11v11)</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex items-center justify-between text-gray-400 mb-1 font-semibold">
              <span>الحد الأقصى للسعر:</span>
              <span className="text-[#00FFD2] font-mono">{formatSYP(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={50000}
              max={300000}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#00FFD2]"
            />
          </div>
        </div>
      </div>

      {/* Playgrounds Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            تم العثور على <strong className="text-white font-mono">{filteredPlaygrounds.length}</strong> ملاعب مطابقة
          </span>
        </div>

        {filteredPlaygrounds.length === 0 ? (
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-500">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white font-['Cairo']">
              لم يتم العثور على ملاعب مطابقة
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              جرب تغيير معايير البحث أو اختيار محافظة أخرى، أو أضف ملعبك ليكون أول ملعب مسجل هنا!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaygrounds.map((pg) => (
              <PlaygroundCard
                key={pg.id}
                playground={pg}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onViewDetails={onViewPlayground}
                onBookNow={onBookPlayground}
                onDelete={onDeletePlayground}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
