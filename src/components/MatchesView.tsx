import React, { useState } from 'react';
import {
  Swords,
  Filter,
  Search,
  Plus,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCircle2,
  Share2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  X
} from 'lucide-react';
import {
  FriendlyMatch,
  SyrianGovernorate,
  AgeGroup,
  CostSplitMethod,
  UserProfile
} from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';
import MatchChallengeCard from './MatchChallengeCard';

interface MatchesViewProps {
  matches: FriendlyMatch[];
  currentUser: UserProfile;
  selectedGovernorate: string;
  onSelectGovernorate: (gov: string) => void;
  onJoinChallenge: (match: FriendlyMatch) => void;
  onOpenCreateMatch: () => void;
  onEditMatch?: (match: FriendlyMatch) => void;
  onDeleteMatch?: (id: string) => void;
  onRateOpponent?: (match: FriendlyMatch) => void;
}

export default function MatchesView({
  matches,
  currentUser,
  selectedGovernorate,
  onSelectGovernorate,
  onJoinChallenge,
  onOpenCreateMatch,
  onEditMatch,
  onDeleteMatch,
  onRateOpponent
}: MatchesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('الكل');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('الكل');
  const [selectedCostSplit, setSelectedCostSplit] = useState<string>('الكل');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [isSearchRequirementsOpen, setIsSearchRequirementsOpen] = useState(false);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('الكل');
    setSelectedAgeGroup('الكل');
    setSelectedCostSplit('الكل');
    setSelectedDateFilter('');
    onSelectGovernorate('الكل');
  };

  const activeFilterCount =
    (searchTerm.trim() ? 1 : 0) +
    (selectedGovernorate !== 'الكل' ? 1 : 0) +
    (selectedStatus !== 'الكل' ? 1 : 0) +
    (selectedAgeGroup !== 'الكل' ? 1 : 0) +
    (selectedCostSplit !== 'الكل' ? 1 : 0) +
    (selectedDateFilter ? 1 : 0);

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    const matchesGov =
      selectedGovernorate === 'الكل' || m.governorate === selectedGovernorate;
    const matchesSearch =
      m.hostTeamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.opponentTeamName && m.opponentTeamName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.governorate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'الكل' || m.status === selectedStatus;
    const matchesAge =
      selectedAgeGroup === 'الكل' || m.ageGroup === selectedAgeGroup;
    const matchesCost =
      selectedCostSplit === 'الكل' || m.costSplitMethod === selectedCostSplit;
    const matchesDate =
      !selectedDateFilter || m.date === selectedDateFilter;

    return (
      matchesGov &&
      matchesSearch &&
      matchesStatus &&
      matchesAge &&
      matchesCost &&
      matchesDate
    );
  });

  return (
    <div id="view-friendly-matches" className="space-y-6 animate-fadeIn pb-16">
      {/* Header & Create Match Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-['Cairo'] flex items-center gap-2">
            <Swords className="w-6 h-6 text-[#ff2a5f]" />
            <span>تحديات المباريات الودية والمنافسات الكروية</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            أطلق تحدي مع فريقك، واجه أقوى الفرق في محافظتك، وحدد طريقة دفع الملعب وأجور التحكيم
          </p>
        </div>

        <button
          id="btn-create-match-challenge"
          onClick={onOpenCreateMatch}
          className="px-5 py-2.5 rounded-2xl bg-[#ff2a5f] hover:bg-[#e02050] text-white font-bold text-xs transition-all shadow-lg glow-pink flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>نشر تحدي مباراة جديدة</span>
        </button>
      </div>

      {/* Button-Triggered Search & Requirements Box */}
      <div className="bg-[#0d1211] border-2 border-white/10 hover:border-[#ff2a5f]/40 rounded-3xl p-4 sm:p-5 transition-all shadow-xl font-['Cairo']">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Clickable Search Trigger Button */}
          <button
            type="button"
            id="btn-open-match-search-requirements"
            onClick={() => setIsSearchRequirementsOpen(!isSearchRequirementsOpen)}
            className="flex-1 flex items-center justify-between gap-3 bg-[#050707] hover:bg-white/5 border border-white/10 rounded-2xl p-3 sm:py-3.5 sm:px-4 text-right transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff2a5f]/10 border border-[#ff2a5f]/30 flex items-center justify-center text-[#ff2a5f] group-hover:scale-105 transition-transform shadow-md shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-white group-hover:text-[#ff2a5f] transition-colors">
                    {isSearchRequirementsOpen ? 'إخفاء متطلبات البحث عن المباريات' : 'اضغط هنا للبحث وتحديد متطلبات المباراة والتحدي'}
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#ff2a5f] text-white">
                      {activeFilterCount} متطلبات محددة
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {activeFilterCount > 0
                    ? `المطابقة: ${filteredMatches.length} تحدي متاح حالياً`
                    : 'تحديد المحافظة، الفئة العمرية، طريقة الدفع، التاريخ، وحالة التحدي'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 group-hover:text-white shrink-0">
              <span className="hidden sm:inline">
                {isSearchRequirementsOpen ? 'إغلاق المتطلبات' : 'فتح المتطلبات'}
              </span>
              <SlidersHorizontal className="w-4 h-4 text-[#ff2a5f]" />
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
              <span className="px-2.5 py-1 rounded-lg bg-[#ff2a5f]/10 border border-[#ff2a5f]/30 text-rose-300 flex items-center gap-1">
                📍 {selectedGovernorate}
              </span>
            )}
            {selectedStatus !== 'الكل' && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                ⚡ {selectedStatus}
              </span>
            )}
            {selectedAgeGroup !== 'الكل' && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-1">
                👥 {selectedAgeGroup}
              </span>
            )}
            {selectedCostSplit !== 'الكل' && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                💰 {selectedCostSplit}
              </span>
            )}
            {selectedDateFilter && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                📅 {selectedDateFilter}
              </span>
            )}
          </div>
        )}

        {/* Requirements Drawer / Panel (Appears on Button Click) */}
        {isSearchRequirementsOpen && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#ff2a5f]" />
                <span>متطلبات ومعايير البحث عن المباريات:</span>
              </h3>
              <span className="text-[11px] text-[#ff2a5f] font-bold">
                {filteredMatches.length} تحدي متوافق
              </span>
            </div>

            {/* Requirement 1: Search Text & Governorate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search Text Input */}
              <div className="relative md:col-span-2">
                <label className="block text-[11px] text-gray-400 mb-1 font-bold">
                  1. الكلمات المفتاحية (اسم الفريق أو الملعب):
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3 top-3 text-gray-500" />
                  <input
                    id="input-search-matches"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث باسم الفريق المضيف أو المنافس أو الملعب..."
                    className="w-full bg-[#050707] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f] transition-colors"
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

              {/* Requirement 2: Governorate Select */}
              <div className="relative">
                <label className="block text-[11px] text-gray-400 mb-1 font-bold">
                  2. المحافظة السورية:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute right-3 top-3 text-[#ff2a5f] pointer-events-none" />
                  <select
                    id="select-match-gov"
                    value={selectedGovernorate}
                    onChange={(e) => onSelectGovernorate(e.target.value)}
                    className="w-full bg-[#050707] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white focus:outline-none focus:border-[#ff2a5f] appearance-none cursor-pointer"
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
            </div>

            {/* Requirement 3, 4, 5 & 6: Status, Date, Age Group, Cost Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
              {/* Match Status */}
              <div className="bg-[#050707] p-3 rounded-2xl border border-white/5">
                <label className="block text-gray-300 mb-1.5 font-bold flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-[#ff2a5f]" />
                  <span>3. حالة التحدي:</span>
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:border-[#ff2a5f] cursor-pointer"
                >
                  <option value="الكل">جميع الحالات</option>
                  <option value="مفتوح">مفتوح للقبول والتحدي</option>
                  <option value="مؤكد">مؤكد ومثبت</option>
                  <option value="منتهي">منتهي</option>
                  <option value="ملغي">ملغي</option>
                </select>
              </div>

              {/* Date Picker Filter */}
              <div className="bg-[#050707] p-3 rounded-2xl border border-white/5">
                <label className="block text-gray-300 mb-1.5 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>4. تاريخ المباراة:</span>
                </label>
                <input
                  type="date"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:border-[#ff2a5f] cursor-pointer"
                />
              </div>

              {/* Age Group */}
              <div className="bg-[#050707] p-3 rounded-2xl border border-white/5">
                <label className="block text-gray-300 mb-1.5 font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>5. الفئة العمرية:</span>
                </label>
                <select
                  value={selectedAgeGroup}
                  onChange={(e) => setSelectedAgeGroup(e.target.value)}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:border-[#ff2a5f] cursor-pointer"
                >
                  <option value="الكل">جميع الفئات</option>
                  <option value="رجال">رجال (كبار)</option>
                  <option value="شباب">شباب (تحت 20)</option>
                  <option value="ناشئين">ناشئين (تحت 16)</option>
                  <option value="أشبال">أشبال (تحت 14)</option>
                  <option value="براعم">براعم</option>
                </select>
              </div>

              {/* Cost Split */}
              <div className="bg-[#050707] p-3 rounded-2xl border border-white/5">
                <label className="block text-gray-300 mb-1.5 font-bold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>6. تقاسم التكلفة:</span>
                </label>
                <select
                  value={selectedCostSplit}
                  onChange={(e) => setSelectedCostSplit(e.target.value)}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:border-[#ff2a5f] cursor-pointer"
                >
                  <option value="الكل">جميع الطرق</option>
                  <option value="مناصفة بين الفريقين (50-50)">مناصفة (50-50)</option>
                  <option value="الخاسر يدفع كامل التكلفة">الخاسر يدفع كامل التكلفة</option>
                  <option value="المستضيف متكفل بالتكلفة">المستضيف متكفل بالكامل</option>
                </select>
              </div>
            </div>

            {/* Drawer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ff2a5f] shrink-0" />
                <span>
                  تم إيجاد <strong className="text-white font-bold">{filteredMatches.length}</strong> مباراة تطابق هذه المتطلبات
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
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#ff2a5f] hover:bg-[#e02050] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer glow-pink"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تطبيق وعرض النتائج</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Matches Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            تم العثور على <strong className="text-white font-mono">{filteredMatches.length}</strong> مباريات وتحديات
          </span>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-500">
              <Swords className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white font-['Cairo']">
              لا توجد تحديات مباريات مطابقة
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              كن السبّاق وانشر تحدي مباراة جديدة لفريقك لتستقبل دعوات الفرق المنافسة في محافظتك!
            </p>
            <button
              onClick={onOpenCreateMatch}
              className="px-6 py-2 rounded-xl bg-[#ff2a5f] hover:bg-[#e02050] text-white font-bold text-xs inline-flex items-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>نشر تحدي الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <MatchChallengeCard
                key={match.id}
                match={match}
                currentUser={currentUser}
                onJoinChallenge={onJoinChallenge}
                onEditMatch={onEditMatch}
                onDeleteMatch={onDeleteMatch}
                onRateOpponent={onRateOpponent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
