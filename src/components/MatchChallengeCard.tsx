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
  Shield,
  Edit3,
  MessageCircle,
  Copy,
  Check,
  Star,
  HeartHandshake
} from 'lucide-react';
import { FriendlyMatch, UserProfile } from '../types';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';

interface MatchChallengeCardProps {
  key?: React.Key;
  match: FriendlyMatch;
  currentUser?: any;
  isAdmin?: boolean;
  onJoinChallenge: (match: FriendlyMatch) => void;
  onEditMatch?: (match: FriendlyMatch) => void;
  onDeleteMatch?: (id: string) => void;
  onRateOpponent?: (match: FriendlyMatch) => void;
}

export default function MatchChallengeCard({
  match,
  currentUser,
  isAdmin = false,
  onJoinChallenge,
  onEditMatch,
  onDeleteMatch,
  onRateOpponent
}: MatchChallengeCardProps) {
  const [copied, setCopied] = useState(false);

  // Strictly check if the current user is an authorized Administrator
  const isSystemAdmin = Boolean(
    isAdmin ||
    currentUser?.isAdmin === true ||
    currentUser?.role === 'admin'
  );

  const totalCost = match.pitchPrice + (match.refereePrice || 0);
  const isConfirmed = match.status === 'مؤكد' || match.status === 'مقبولة' || match.status === 'مكتمل';

  // Format standard match details for WhatsApp sharing
  const buildMatchDetailsText = () => {
    return `⚽ *دعوة لمباراة ودية وتحدي كروي - تطبيق الكابتن* 🚩
━━━━━━━━━━━━━━━━━━━━━
📌 *الفريق المستضيف:* فريق ${match.hostTeamName}
⚔️ *المنافس:* ${match.opponentTeamName ? `فريق ${match.opponentTeamName}` : 'بانتظار فريق متحدي للانضمام'}
📍 *الملعب:* ${match.venueName} (${match.governorate}${match.venueLocation ? ` - ${match.venueLocation}` : ''})
📅 *الموعد:* ${match.date} (${match.time})
👥 *الفئة العمرية:* ${match.ageGroup}
💰 *أجرة وتكاليف اللقاء:* ${formatSYP(totalCost)}
🤝 *طريقة تقاسم الأجرة:* ${match.costSplitMethod}
${match.refereeName ? `⚖️ *حكم اللقاء:* ${match.refereeName} (+${formatSYP(match.refereePrice)})\n` : ''}${match.notesAndChallengeRules ? `📝 *شروط وملاحظات التحدي:* ${match.notesAndChallengeRules}\n` : ''}📞 *للتواصل والتحدي:* ${match.organizerPhone}
━━━━━━━━━━━━━━━━━━━━━
📲 احجز واقبل التحدي الآن عبر تطبيق الكابتن: ${window.location.origin}`;
  };

  // Format confirmed match & booking confirmation for sharing with friends
  const buildConfirmedBookingText = () => {
    return `🏆 *تأكيد حجز وموعد مباراة ودية رسمية - تطبيق الكابتن* ⚽
━━━━━━━━━━━━━━━━━━━━━
✅ *تم تأكيد الحجز وقبول التحدي رسمياً!*

⚔️ *طرفا اللقاء:* فريق ${match.hostTeamName} 🆚 فريق ${match.opponentTeamName || 'المتحدي'}
📍 *الملعب:* ${match.venueName} (${match.governorate}${match.venueLocation ? ` - ${match.venueLocation}` : ''})
📅 *تاريخ اللقاء:* ${match.date}
⏰ *التوقيت:* ${match.time}
👥 *الفئة العمرية:* ${match.ageGroup}
💰 *أجرة وتكاليف اللقاء:* ${formatSYP(totalCost)}
🤝 *طريقة تقاسم الأجرة:* ${match.costSplitMethod}
💳 *طريقة الدفع:* ${match.paymentMethod}
${match.hostJerseyColor ? `👕 *طقم ${match.hostTeamName}:* ${match.hostJerseyColor}\n` : ''}${match.guestJerseyColor ? `👕 *طقم ${match.opponentTeamName || 'المتحدي'}:* ${match.guestJerseyColor}\n` : ''}${match.refereeName ? `⚖️ *طاقم التحكيم المعتمد:* ${match.refereeName}\n` : ''}${match.notesAndChallengeRules ? `📝 *تعليمات اللقاء:* ${match.notesAndChallengeRules}\n` : ''}📞 *منسق اللقاء:* ${match.organizerName || 'الكابتن'} (${match.organizerPhone})
━━━━━━━━━━━━━━━━━━━━━
📢 يرجى من جميع اللاعبين الحضور والتواجد قبل صافرة البداية بنصف ساعة للإحماء والجاهزية.
📱 تفاصيل اللقاء وتأكيد الحجز عبر تطبيق الكابتن: ${window.location.origin}`;
  };

  // Share match details with friends & groups via WhatsApp
  const handleShareToFriends = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = isConfirmed ? buildConfirmedBookingText() : buildMatchDetailsText();
    openWhatsAppShare(text);
  };

  // Chat directly with the match organizer
  const handleChatWithOrganizer = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = isConfirmed
      ? `مرحباً كابتن ${match.organizerName}، أتواصل معك بخصوص مباراتنا المؤكدة (${match.hostTeamName} ضد ${match.opponentTeamName || 'المتحدي'}) في ملعب ${match.venueName} بتاريخ ${match.date} الساعة ${match.time}.`
      : `مرحباً كابتن ${match.organizerName}، أتواصل معك بخصوص تحدي مباراة ${match.hostTeamName} في ملعب ${match.venueName} بتاريخ ${match.date}.`;
    openWhatsAppShare(text, match.organizerPhone);
  };

  // Copy text to clipboard
  const handleCopyDetails = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = isConfirmed ? buildConfirmedBookingText() : buildMatchDetailsText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditMatch) onEditMatch(match);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من حذف تحدي المباراة "${match.hostTeamName}" بشكل نهائي؟`)) {
      if (onDeleteMatch) onDeleteMatch(match.id);
    }
  };

  return (
    <div
      id={`match-card-${match.id}`}
      className="bg-[#0d1211] border border-[#ff2a5f]/25 rounded-2xl p-4 sm:p-5 hover:border-[#ff2a5f]/60 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-[#ff2a5f]/5 font-['Cairo'] relative"
    >
      {/* Admin Action Badge (Exclusively rendered for Admins) */}
      {isSystemAdmin && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/90 px-2.5 py-0.5 rounded-full border border-[#ff2a5f]/40 shadow-xl backdrop-blur-md">
          <span className="text-[10px] font-bold text-[#ff2a5f]">
            لوحة الإدارة
          </span>
          {onEditMatch && (
            <button
              onClick={handleEdit}
              className="p-1 rounded-full bg-[#ff2a5f]/20 hover:bg-[#ff2a5f] text-[#ff2a5f] hover:text-white transition-colors cursor-pointer"
              title="تعديل تفاصيل التحدي"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteMatch && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white transition-colors cursor-pointer"
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
          <div className="flex items-center gap-1.5">
            <span className="bg-[#ff2a5f]/15 text-[#ff2a5f] border border-[#ff2a5f]/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Swords className="w-3.5 h-3.5" />
              مباراة {match.ageGroup}
            </span>
            {isConfirmed && (
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                مؤكد
              </span>
            )}
            {match.ratings && match.ratings.length > 0 && (
              <span className="bg-amber-400/15 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                تقييم موثق ({match.ratings.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* WhatsApp Share Button in Header */}
            <button
              type="button"
              onClick={handleShareToFriends}
              className="px-2 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
              title={isConfirmed ? "مشاركة تأكيد الحجز مع الأصدقاء عبر واتساب" : "مشاركة تفاصيل المباراة عبر واتساب"}
            >
              <Share2 className="w-3 h-3" />
              <span>مشاركة</span>
            </button>

            <span className="bg-black/60 text-gray-300 text-[11px] px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#00FFD2]" />
              {match.governorate}
            </span>
          </div>
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
      <div className="pt-3 border-t border-white/5 space-y-3">
        {/* Price & Sharing Toolbar */}
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-400 block text-[10px]">التكلفة الإجمالية:</span>
            <span className="text-sm font-bold text-white font-mono">{formatSYP(totalCost)}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Share to WhatsApp Button */}
            <button
              type="button"
              onClick={handleShareToFriends}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isConfirmed ? "مشاركة تأكيد الحجز مع الأصدقاء والفرق عبر واتساب" : "مشاركة تفاصيل التحدي عبر واتساب"}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isConfirmed ? 'مشاركة التأكيد' : 'مشاركة واتس'}</span>
            </button>

            {/* Chat with Organizer */}
            <button
              type="button"
              onClick={handleChatWithOrganizer}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-emerald-400 border border-white/10 transition-colors cursor-pointer"
              title="مراسلة منسق المباراة عبر واتساب"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>

            {/* Copy Details */}
            <button
              type="button"
              onClick={handleCopyDetails}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-[#00FFD2] border border-white/10 transition-colors cursor-pointer"
              title="نسخ تفاصيل المباراة"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Action button based on match status */}
        {match.status === 'مفتوح' ? (
          <button
            type="button"
            onClick={() => onJoinChallenge(match)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#ff2a5f] hover:bg-[#e02050] text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 glow-pink cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>قبول التحدي والانضمام للمباراة</span>
          </button>
        ) : isConfirmed ? (
          <div className="space-y-2">
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>المباراة مؤكدة الحجز وجاهزة للانطلاق</span>
            </div>

            {/* Prominent Share Confirmed Booking Button */}
            <button
              type="button"
              onClick={handleShareToFriends}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 shadow-emerald-900/30 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>مشاركة تأكيد الحجز مع الأصدقاء عبر واتس 📲</span>
            </button>

            {/* Rate Opponent Button after match conclusion */}
            {onRateOpponent && (
              <button
                type="button"
                id={`btn-rate-opponent-${match.id}`}
                onClick={() => onRateOpponent(match)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group/rate"
                title="تقييم أداء الخصم والروح الرياضية لتعزيز المصداقية"
              >
                <Star className="w-4 h-4 fill-black text-black group-hover/rate:rotate-45 transition-transform" />
                <span>
                  {match.ratings && match.ratings.length > 0
                    ? `تقييم الخصم (${match.ratings.length} مسجل) ⭐`
                    : 'تقييم أداء الخصم بعد انتهاء المباراة ⭐'}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-gray-900/50 border border-gray-700/40 text-center text-xs text-gray-400 font-semibold">
            حالة المباراة: {match.status}
          </div>
        )}
      </div>
    </div>
  );
}

