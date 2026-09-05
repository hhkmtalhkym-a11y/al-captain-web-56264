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
  AlertCircle,
  Lock,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  X
} from 'lucide-react';
import {
  Playground,
  SyrianGovernorate,
  PitchSurface,
  PitchCapacity,
  LightingStatus,
  Booking
} from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { formatSYP } from '../utils/helpers';
import { canUserCreatePlayground, isUserAdmin } from '../utils/permissions';
import PlaygroundCard from './PlaygroundCard';
import PermissionDeniedModal from './PermissionDeniedModal';

interface PlaygroundsViewProps {
  playgrounds: Playground[];
  bookings?: Booking[];
  currentUser?: any;
  selectedGovernorate: string;
  isAdmin?: boolean;
  onSelectGovernorate: (gov: string) => void;
  onViewPlayground: (pg: Playground) => void;
  onBookPlayground: (pg: Playground) => void;
  onOpenCreateModal: () => void;
  onEditPlayground?: (pg: Playground) => void;
  onDeletePlayground?: (id: string) => void;
  onOpenProfile?: () => void;
}

export default function PlaygroundsView({
  playgrounds,
  bookings,
  currentUser,
  selectedGovernorate,
  isAdmin = false,
  onSelectGovernorate,
  onViewPlayground,
  onBookPlayground,
  onOpenCreateModal,
  onEditPlayground,
  onDeletePlayground,
  onOpenProfile
}: PlaygroundsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurface, setSelectedSurface] = useState<string>('الكل');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('الكل');
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isSearchRequirementsOpen, setIsSearchRequirementsOpen] = useState(false);

  const canCreate = canUserCreatePlayground(currentUser);

  const handleAddClick = () => {
    if (canCreate) {
      onOpenCreateModal();
    } else {
      setIsPermissionModalOpen(true);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    onSelectGovernorate('الكل');
    setSelectedSurface('الكل');
    setSelectedCapacity('الكل');
    setMaxPrice(300000);
  };

  const activeFilterCount =
    (searchTerm.trim() ? 1 : 0) +
    (selectedGovernorate !== 'الكل' ? 1 : 0) +
    (selectedSurface !== 'الكل' ? 1 : 0) +
    (selectedCapacity !== 'الكل' ? 1 : 0) +
    (maxPrice < 300000 ? 1 : 0);

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
            استعرض الملاعب المعتمدة، حدد موقعك، واحجز بـ 0% عمولة وبأفضل الأسعار
          </p>
        </div>

        <button
          id="btn-add-playground"
          onClick={handleAddClick}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-lg flex items-center gap-2 shrink-0 cursor-pointer ${
            canCreate
              ? 'bg-[#00FFD2] hover:bg-[#00e6bd] text-black glow-primary'
              : 'bg-[#0d1211] text-amber-300 border border-amber-400/40 hover:border-amber-400'
          }`}
          title={canCreate ? 'إضافة ملعب جديد' : 'ميزة مخصصة للمعلنين وإدارة المنصة'}
        >
          {canCreate ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
          <span>إضافة ملعب جديد</span>
        </button>
      </div>

      {/* Button-Triggered Search & Requirements Box */}
      <div className="bg-[#0d1211] border-2 border-white/10 hover:border-[#00FFD2]/40 rounded-3xl p-4 sm:p-5 transition-all shadow-xl font-['Cairo']">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Clickable Search Trigger Button */}
          <button
            type="button"
            id="btn-open-search-requirements"
            onClick={() => setIsSearchRequirementsOpen(!isSearchRequirementsOpen)}
            className="flex-1 flex items-center justify-between gap-3 bg-[#050707] hover:bg-white/5 border border-white/10 rounded-2xl p-3 sm:py-3.5 sm:px-4 text-right transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex items-center justify-center text-[#00FFD2] group-hover:scale-105 transition-transform shadow-md shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-white group-hover:text-[#00FFD2] transition-colors">
                    {isSearchRequirementsOpen ? 'إخفاء متطلبات ومعايير البحث' : 'اضغط هنا للبحث وتحديد متطلبات الملعب'}
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#00FFD2] text-black">
                      {activeFilterCount} متطلبات محددة
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {activeFilterCount > 0
                    ? `المطابقة: ${filteredPlaygrounds.length} ملعب متاح حالياً`
                    : 'تحديد المحافظة، نوعية العشب، السعة، والحد الأقصى للسعر بالساعة'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 group-hover:text-white shrink-0">
              <span className="hidden sm:inline">
                {isSearchRequirementsOpen ? 'إغلاق المتطلبات' : 'فتح المتطلبات'}
              </span>
              <SlidersHorizontal className="w-4 h-4 text-[#00FFD2]" />
              {isSearchRequirementsOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </button>

          {/* Quick reset button if any filter is applied */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
              title="إعادة ضبط كافة المتطلبات"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>مسح الفلاتر</span>
            </button>
          )}
        </div>

        {/* Active Requirements Chips (Visible when drawer is collapsed) */}
        {activeFilterCount > 0 && !isSearchRequirementsOpen && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5 text-[11px]">
            <span className="text-gray-400 font-bold">المتطلبات المطبقة:</span>
            {searchTerm && (
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white flex items-center gap-1">
                🔍 "{searchTerm}"
              </span>
            )}
            {selectedGovernorate !== 'الكل' && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                📍 {selectedGovernorate}
              </span>
            )}
            {selectedSurface !== 'الكل' && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-1">
                🌱 {selectedSurface}
              </span>
            )}
            {selectedCapacity !== 'الكل' && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                👥 {selectedCapacity}
              </span>
            )}
            {maxPrice < 300000 && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                💰 حتى {formatSYP(maxPrice)}
              </span>
            )}
          </div>
        )}

        {/* Requirements Drawer / Panel (Appears on Button Click) */}
        {isSearchRequirementsOpen && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#00FFD2]" />
                <span>متطلبات ومعايير البحث المطلوبة:</span>
              </h3>
              <span className="text-[11px] text-[#00FFD2] font-bold">
                {filteredPlaygrounds.length} ملعب متوافق
              </span>
            </div>

            {/* Requirement 1: Search text & Governorate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search Text Input */}
              <div className="relative md:col-span-2">
                <label className="block text-[11px] text-gray-400 mb-1 font-bold">
                  1. الكلمات المفتاحية (اسم الملعب أو الحي):
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3 top-3 text-gray-500" />
                  <input
                    id="input-search-playgrounds"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="اكتب اسم الملعب، الحي أو المنطقة (مثال: الفيحاء، الميدان، كفر سوسة)..."
                    className="w-full bg-[#050707] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2] transition-colors"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute left-3 top-3 text-gray-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Requirement 2: Syrian Governorate */}
              <div className="relative">
                <label className="block text-[11px] text-gray-400 mb-1 font-bold">
                  2. المحافظة السورية:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute right-3 top-3 text-[#00FFD2] pointer-events-none" />
                  <select
                    id="select-playground-gov"
                    value={selectedGovernorate}
                    onChange={(e) => onSelectGovernorate(e.target.value)}
                    className="w-full bg-[#050707] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white focus:outline-none focus:border-[#00FFD2] appearance-none cursor-pointer"
                  >
                    <option value="الكل">جميع المحافظات (14 محافظة)</option>
                    {SYRIAN_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Requirement 3, 4 & 5: Surface, Capacity, Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              {/* Surface Type */}
              <div className="bg-[#050707] p-3 rounded-2xl border border-white/5">
                <label className="block text-gray-300 mb-1.5 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. نوعية الأرضية:</span>
                </label>
                <select
                  value={selectedSurface}
                  onChange={(e) => setSelectedSurface(e.target.value)}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:border-[#00FFD2] cursor-pointer"
                >
                  <option value="الكل">جميع أنواع الأرضيات</option>
                  <option value="عشب صناعي">عشب صناعي (جيل رابع)</option>
                  <option value="عشب طبيعي">عشب طبيعي</option>
                  <option value="صالة مغلقة">صالة مغلقة (باركيه/تارتان)</option>
                  <option value="ترابي">ترابي</option>
                </select>
              </div>

              {/* Pitch Capacity */}
              <div className="bg-[#050707] p-3 rounded-2xl border border-white/5">
                <label className="block text-gray-300 mb-1.5 font-bold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#00FFD2]" />
                  <span>4. سعة وتشكيل الملعب:</span>
                </label>
                <select
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:border-[#00FFD2] cursor-pointer"
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
              <div className="bg-[#050707] p-3 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-gray-300 font-bold flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span>5. أقصى سعر للساعة:</span>
                  </label>
                  <span className="text-[#00FFD2] font-mono font-bold text-xs">
                    {formatSYP(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="300000"
                  step="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#00FFD2] cursor-pointer mt-1"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                  <span>50 ألف</span>
                  <span>300 ألف ل.س/ساعة</span>
                </div>
              </div>
            </div>

            {/* Drawer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  تم إيجاد <strong className="text-white font-bold">{filteredPlaygrounds.length}</strong> ملعب يطابق هذه المتطلبات
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>إعادة تعيين</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSearchRequirementsOpen(false)}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer glow-primary"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تطبيق وعرض النتائج</span>
                </button>
              </div>
            </div>
          </div>
        )}
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
                bookings={bookings}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onViewDetails={onViewPlayground}
                onBookNow={onBookPlayground}
                onEditPlayground={onEditPlayground}
                onDeletePlayground={onDeletePlayground}
              />
            ))}
          </div>
        )}
      </div>

      {/* Permission Restriction Modal */}
      <PermissionDeniedModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        actionType="playground"
        currentUser={currentUser}
        onOpenLogin={() => {
          if (onOpenProfile) onOpenProfile();
        }}
      />
    </div>
  );
}
