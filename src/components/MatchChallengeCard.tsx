import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Swords,
  CheckCircle2,
  Share2,
  Users,
  AlertCircle,
  Trash2,
  Shield
} from 'lucide-react';
import { FriendlyMatch, UserProfile } from '../types';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';

interface MatchChallengeCardProps {
  key?: React.Key;
  match: FriendlyMatch;
  currentUser: UserProfile;
  isAdmin?: boolean;
  onJoinChallenge: (match: FriendlyMatch) => void;
  onDeleteMatch?: (id: string) => void;
}

export default function MatchChallengeCard({
  match,
  currentUser,
  isAdmin = false,
  onJoinChallenge,
  onDeleteMatch
}: MatchChallengeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `⚽ *تحدي مباراة ودية عبر تطبيق الكابتن* 🚩\n\n📌 *المستضيف:* فريق ${match.hostTeamName}\n📍 *الملعب:* ${match.venueName} (${match.governorate})\n📅 *الموعد:* ${match.date} (${match.time})\n👥 *الفئة:* ${match.ageGroup}\n💰 *طريقة تقسيم التكلفة:* ${match.costSplitMethod}\n📞 *للتواصل والتحدي:* ${match.organizerPhone}`;
    openWhatsAppShare(text, match.organizerPhone);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من حذف تحدي المباراة "${match.hostTeamName}" بشكل نهائي؟`)) {
      if (onDeleteMatch) onDeleteMatch(match.id);
    }
  };

  const totalCost = match.pitchPrice + (match.refereePrice || 0);

  const isOwner = Boolean(
    currentUser && (
      (match as any).ownerId === currentUser.id ||
      match.organizerPhone === currentUser.phone
    )
  );
  const hasManagementPermission = isAdmin || (currentUser && currentUser.isAdmin) || isOwner;

  return (
    <div
      id={`match-card-${match.id}`}
      className="bg-[#0d1211] border border-[#ff2a5f]/25 rounded-2xl p-4 sm:p-5 hover:border-[#ff2a5f]/60 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-[#ff2a5f]/5 font-['Cairo'] relative"
    >
      {/* Admin / Owner Action Badge */}
      {hasManagementPermission && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/90 px-2.5 py-0.5 rounded-full border border-red-500/40 shadow-xl">
          <span className="text-[10px] font-bold text-red-400">
            {isAdmin || (currentUser && currentUser.isAdmin) ? 'إدارة التحدي' : 'صاحب التحدي'}
          </span>
          {onDeleteMatch && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white transition-colors"
              title="حذف التحدي"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="bg-[#ff2a5f]/15 text-[#ff2a5f] border border-[#ff2a5f]/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Swords className="w-3.5 h-3.5" />
            مباراة {match.ageGroup}
          </span>

          <span className="bg-black/60 text-gray-300 text-[11px] px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#00FFD2]" />
            {match.governorate}
          </span>
        </div>

        {/* Teams Matchup Visual */}
        <div className="bg-[#050707] rounded-2xl p-4 border border-white/5 flex items-center justify-between mb-4">
          {/* Host Team */}
          <div className="flex flex-col items-center text-center w-5/12">
            <img
              src={match.hostTeamImage}
              alt={match.hostTeamName}
              className="w-14 h-14 rounded-2xl object-cover border border-[#00FFD2]/40 shadow-md mb-2"
            />
            <strong className="text-white text-xs sm:text-sm font-bold line-clamp-1">
              {match.hostTeamName}
            </strong>
            <span className="text-[10px] text-emerald-400">الفريق المستضيف</span>
          </div>

          {/* VS badge */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#ff2a5f] text-white font-black text-xs flex items-center justify-center shadow-lg">
              VS
            </div>
            <span className="text-[9px] text-gray-400 mt-1 font-mono">{match.time}</span>
          </div>

          {/* Opponent Team */}
          <div className="flex flex-col items-center text-center w-5/12">
            {match.opponentTeamName ? (
              <>
                <img
                  src={match.opponentTeamImage || match.hostTeamImage}
                  alt={match.opponentTeamName}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#ff2a5f]/40 shadow-md mb-2"
                />
                <strong className="text-white text-xs sm:text-sm font-bold line-clamp-1">
                  {match.opponentTeamName}
                </strong>
                <span className="text-[10px] text-[#ff2a5f]">الفريق المتحدي</span>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 mb-2">
                  <Users className="w-6 h-6" />
                </div>
                <strong className="text-gray-400 text-xs">بانتظار منافس</strong>
                <span className="text-[10px] text-amber-400">التحدي مفتوح</span>
              </div>
            )}
          </div>
        </div>

        {/* Match info list */}
        <div className="space-y-2 text-xs text-gray-300 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#00FFD2]" /> التاريخ:
            </span>
            <strong className="text-white font-mono">{match.date}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#00FFD2]" /> الملعب:
            </span>
            <strong className="text-white truncate max-w-[60%]">{match.venueName}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">نظام دفع الأجرة:</span>
            <span className="text-amber-400 font-semibold">{match.costSplitMethod}</span>
          </div>

          {match.refereeName && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">حكم اللقاء:</span>
              <span className="text-gray-200">{match.refereeName} (+{formatSYP(match.refereePrice)})</span>
            </div>
          )}

          {match.notesAndChallengeRules && (
            <p className="p-2.5 rounded-xl bg-[#050707] border border-white/5 text-[11px] text-gray-300 leading-relaxed italic">
              "{match.notesAndChallengeRules}"
            </p>
          )}
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-3 border-t border-white/5">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px]">التكلفة الإجمالية:</span>
            <span className="text-sm font-bold text-white font-mono">{formatSYP(totalCost)}</span>
          </div>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-1 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> مشاركة واتساب
          </button>
        </div>

        {match.status === 'مفتوح' ? (
          <button
            onClick={() => onJoinChallenge(match)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#ff2a5f] hover:bg-[#e02050] text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 glow-pink"
          >
            <Swords className="w-4 h-4" />
            قبول التحدي والانضمام للمباراة
          </button>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            المباراة مكتملة الطرفين وجاهزة للانطلاق
          </div>
        )}
      </div>
    </div>
  );
}
