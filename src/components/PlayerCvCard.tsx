import React, { useState } from 'react';
import {
  MapPin,
  Share2,
  Radio,
  Sparkles,
  Award,
  Zap,
  Activity,
  CheckCircle2,
  Phone,
  Trash2,
  Edit3
} from 'lucide-react';
import { PlayerCv } from '../types';
import { openWhatsAppShare } from '../utils/helpers';

interface PlayerCvCardProps {
  key?: React.Key;
  player: PlayerCv;
  currentUser?: any;
  isAdmin?: boolean;
  onToggleBeacon?: (playerId: string) => void;
  onEditPlayerCv?: (player: PlayerCv) => void;
  onDeletePlayerCv?: (id: string) => void;
}

export default function PlayerCvCard({
  player,
  currentUser,
  isAdmin = false,
  onToggleBeacon,
  onEditPlayerCv,
  onDeletePlayerCv
}: PlayerCvCardProps) {
  const [beaconActive, setBeaconActive] = useState(player.isBeaconSent || false);
  const [showBeaconAlert, setShowBeaconAlert] = useState(false);

  // Strictly check if the current user is an authorized Administrator
  const isSystemAdmin = Boolean(
    isAdmin ||
    currentUser?.isAdmin === true ||
    currentUser?.role === 'admin'
  );

  const handleBeaconClick = () => {
    const next = !beaconActive;
    setBeaconActive(next);
    if (onToggleBeacon) onToggleBeacon(player.id);
    if (next) {
      setShowBeaconAlert(true);
      setTimeout(() => setShowBeaconAlert(false), 3500);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditPlayerCv) onEditPlayerCv(player);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من حذف بطاقة اللاعب "${player.fullName}" بشكل نهائي؟`)) {
      if (onDeletePlayerCv) onDeletePlayerCv(player.id);
    }
  };

  const handleShare = (platform: 'whatsapp' | 'social') => {
    const text = `⭐ *بطاقة لاعب كروي (كشاف المواهب - تطبيق الكابتن)* ⚽\n\n👤 *اللاعب:* ${player.fullName}\n📍 *المحافظة:* ${player.governorate} (${player.area})\n🎯 *المركز:* ${player.position}\n🦶 *القدم المفضلة:* ${player.preferredFoot}\n📏 *الطول/الوزن:* ${player.heightCm} سم / ${player.weightKg} كغ\n🔥 *الحالة:* ${player.seekingStatus}\n📊 *المهارات:* سرعة ${player.skills.speed}% | مراوغة ${player.skills.dribbling}% | تسديد ${player.skills.shooting}%\n📞 *للتواصل مع اللاعب:* ${player.phoneNumber}`;

    if (platform === 'whatsapp') {
      openWhatsAppShare(text, player.phoneNumber);
    } else {
      if (navigator.share) {
        navigator.share({ title: `بطاقة اللاعب ${player.fullName}`, text });
      } else {
        openWhatsAppShare(text);
      }
    }
  };

  const calculateOverallRating = () => {
    const s = player.skills;
    const avg =
      (s.passing +
        s.shooting +
        s.stamina +
        s.defending +
        s.speed +
        s.dribbling +
        s.tacticalIQ +
        s.leadership) /
      8;
    return Math.round(avg);
  };

  const overall = calculateOverallRating();

  return (
    <div
      id={`player-card-${player.id}`}
      className="bg-[#0d1211] border border-blue-500/25 rounded-3xl p-5 hover:border-blue-500/60 transition-all duration-300 flex flex-col justify-between group hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden font-['Cairo']"
    >
      {/* Admin Action Badge (Exclusively rendered for Admins) */}
      {isSystemAdmin && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/90 px-2.5 py-0.5 rounded-full border border-blue-500/40 shadow-xl backdrop-blur-md">
          <span className="text-[10px] font-bold text-blue-400">
            لوحة الإدارة
          </span>
          {onEditPlayerCv && (
            <button
              onClick={handleEdit}
              className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white transition-colors cursor-pointer"
              title="تعديل بيانات اللاعب"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeletePlayerCv && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white transition-colors cursor-pointer"
              title="حذف بطاقة اللاعب"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Top Background Glow Effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none"></div>

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            {player.position}
          </span>

          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm ${
              player.seekingStatus === 'باحث عن نادي'
                ? 'bg-amber-400 text-black'
                : player.seekingStatus === 'باحث عن أكاديمية'
                ? 'bg-purple-400 text-black'
                : 'bg-emerald-400 text-black'
            }`}
          >
            {player.seekingStatus}
          </span>
        </div>

        {/* Player Profile Headshot & Overall Rating */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img
              src={player.image}
              alt={player.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-400/40 shadow-xl"
            />
            {/* OVR Rating Badge */}
            <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs px-2 py-0.5 rounded-lg shadow-md font-mono border border-black">
              {overall} OVR
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-blue-300 transition-colors line-clamp-1">
              {player.fullName}
            </h3>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {player.governorate} - {player.area}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-300">
              <span>📏 {player.heightCm} سم</span>
              <span>⚖️ {player.weightKg} كغ</span>
              <span>🦶 {player.preferredFoot}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 bg-[#050707] p-2.5 rounded-2xl border border-white/5 text-center mb-4 font-mono text-xs">
          <div>
            <span className="text-[10px] text-gray-400 block">مباريات</span>
            <strong className="text-white">{player.stats.matchesPlayed}</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">أهداف</span>
            <strong className="text-emerald-400">{player.stats.goals}</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">صناعة</span>
            <strong className="text-blue-400">{player.stats.assists}</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">دقة التمرير</span>
            <strong className="text-amber-400">{player.stats.passAccuracyPercentage}%</strong>
          </div>
        </div>

        {/* Skills Progress Bars */}
        <div className="space-y-2 mb-4 bg-[#050707] p-3 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" /> المهارات الفردية والبدنية:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>السرعة</span>
                <span className="font-mono text-white">{player.skills.speed}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: `${player.skills.speed}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>التسديد</span>
                <span className="font-mono text-white">{player.skills.shooting}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${player.skills.shooting}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>المراوغة</span>
                <span className="font-mono text-white">{player.skills.dribbling}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: `${player.skills.dribbling}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>التمرير</span>
                <span className="font-mono text-white">{player.skills.passing}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${player.skills.passing}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Clubs & Achievements */}
        <div className="space-y-1 text-xs text-gray-300 mb-4">
          <p className="line-clamp-1">
            <span className="text-gray-400 text-[11px]">الأندية السابقة:</span> {player.previousClubs}
          </p>
          <p className="line-clamp-2 text-gray-400 text-[11px] leading-relaxed italic">
            🏆 {player.achievements}
          </p>
        </div>
      </div>

      {/* Actions / Beacon alert & WhatsApp Share */}
      <div className="pt-3 border-t border-white/5 space-y-2">
        {/* Beacon Notification Alert Banner */}
        {showBeaconAlert && (
          <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-400/40 text-[11px] text-blue-300 flex items-center gap-1.5 animate-fadeIn">
            <Radio className="w-4 h-4 text-blue-400 animate-ping" />
            <span>تم إطلاق إشارة الكشاف! بطاقتك مميزة وتظهر في صدارة كشافي الأندية.</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {/* Beacon Button */}
          <button
            onClick={handleBeaconClick}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              beaconActive
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-[#050707] hover:bg-white/10 text-gray-300 border border-white/10'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${beaconActive ? 'animate-pulse' : ''}`} />
            {beaconActive ? 'الإشارة مفعلة 📡' : 'إطلاق إشارة كشاف'}
          </button>

          {/* WhatsApp Direct Contact / Share */}
          <button
            onClick={() => handleShare('whatsapp')}
            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <Share2 className="w-3.5 h-3.5" />
            تواصل / مشاركة
          </button>
        </div>
      </div>
    </div>
  );
}
