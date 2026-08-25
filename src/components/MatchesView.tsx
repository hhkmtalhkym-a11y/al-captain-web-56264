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
  Share2
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
  onDeleteMatch?: (id: string) => void;
}

export default function MatchesView({
  matches,
  currentUser,
  selectedGovernorate,
  onSelectGovernorate,
  onJoinChallenge,
  onOpenCreateMatch,
  onDeleteMatch
}: MatchesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('الكل');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('الكل');
  const [selectedCostSplit, setSelectedCostSplit] = useState<string>('الكل');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');

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
          className="px-5 py-2.5 rounded-2xl bg-[#ff2a5f] hover:bg-[#e02050] text-white font-bold text-xs transition-all shadow-lg glow-pink flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>نشر تحدي مباراة جديدة</span>
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-5 space-y-4">
        {/* Search & Governorate Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute right-3 top-3 text-gray-500" />
            <input
              id="input-search-matches"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الفريق المضيف أو المنافس أو الملعب..."
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2a5f] transition-colors"
            />
          </div>

          {/* Governorate Select */}
          <div className="relative">
            <MapPin className="w-4 h-4 absolute right-3 top-3 text-gray-500 pointer-events-none" />
            <select
              id="select-match-gov"
              value={selectedGovernorate}
              onChange={(e) => onSelectGovernorate(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-xs text-white focus:outline-none focus:border-[#ff2a5f] appearance-none"
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

        {/* Detailed Filters: Status, Date, Age Group, Cost Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/5 text-xs">
          {/* Match Status */}
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">حالة التحدي:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white"
            >
              <option value="الكل">جميع الحالات</option>
              <option value="مفتوح">مفتوح للقبول</option>
              <option value="مؤكد">مؤكد ومثبت</option>
              <option value="منتهي">منتهي</option>
              <option value="ملغي">ملغي</option>
            </select>
          </div>

          {/* Date Picker Filter */}
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">تاريخ المباراة:</label>
            <input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white"
            />
          </div>

          {/* Age Group */}
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">الفئة العمرية:</label>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white"
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
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">طريقة تقاسم التكلفة:</label>
            <select
              value={selectedCostSplit}
              onChange={(e) => setSelectedCostSplit(e.target.value)}
              className="w-full bg-[#050707] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white"
            >
              <option value="الكل">الكل</option>
              <option value="مناصفة بين الفريقين (50-50)">مناصفة (50-50)</option>
              <option value="الخاسر يدفع كامل التكلفة">الخاسر يدفع كامل التكلفة</option>
              <option value="المستضيف متكفل بالتكلفة">المستضيف متكفل بالكامل</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Helper */}
        {(selectedStatus !== 'الكل' ||
          selectedAgeGroup !== 'الكل' ||
          selectedCostSplit !== 'الكل' ||
          selectedDateFilter !== '' ||
          searchTerm !== '' ||
          selectedGovernorate !== 'الكل') && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[11px] text-gray-400">
              تم تطبيق عوامل تصفية مخصصة
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('الكل');
                setSelectedAgeGroup('الكل');
                setSelectedCostSplit('الكل');
                setSelectedDateFilter('');
                onSelectGovernorate('الكل');
              }}
              className="text-[11px] text-[#ff2a5f] hover:underline font-bold"
            >
              إعادة تعيين الفلاتر
            </button>
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
                onDeleteMatch={onDeleteMatch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
