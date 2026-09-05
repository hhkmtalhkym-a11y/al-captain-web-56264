import React from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Award,
  HeartHandshake,
  Clock,
  Sparkles,
  Calendar,
  MapPin,
  MessageSquareQuote,
  CheckCircle2,
  Swords
} from 'lucide-react';
import { PlayerCv } from '../types';
import { getPlayerCredibilityBadge } from '../utils/ratingService';

interface PlayerOpponentReviewsModalProps {
  isOpen: boolean;
  player: PlayerCv | null;
  onClose: () => void;
  onRateNow?: () => void;
}

export default function PlayerOpponentReviewsModal({
  isOpen,
  player,
  onClose,
  onRateNow
}: PlayerOpponentReviewsModalProps) {
  if (!isOpen || !player) return null;

  const ratings = player.opponentRatings || [];
  const average = player.averageRating || (ratings.length > 0
    ? parseFloat((ratings.reduce((acc, r) => acc + r.overallRating, 0) / ratings.length).toFixed(1))
    : 0);
  const count = player.ratingsCount || ratings.length;
  const credibility = getPlayerCredibilityBadge(average, count);

  return (
    <div
      id="modal-player-opponent-reviews"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border border-amber-400/40 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto relative text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-[#00FFD2]/10 to-amber-500/20 p-5 border-b border-white/10 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-gray-400 hover:text-white hover:bg-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={player.image}
              alt={player.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/50 shadow-xl"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {player.position}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  {player.governorate}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white truncate">
                {player.fullName}
              </h2>
              {/* Credibility Badge */}
              <div className={`mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${credibility.bgClass} ${credibility.colorClass} ${credibility.badgeBorder}`}>
                <span>{credibility.iconText}</span>
                <span>{credibility.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main Rating Score Card */}
          <div className="bg-[#050707] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex flex-col items-center justify-center font-black shadow-lg shadow-amber-500/20">
                <span className="text-2xl font-mono leading-none">{average > 0 ? average : '-'}</span>
                <span className="text-[10px] font-bold">من 5</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= Math.round(average)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-700 fill-gray-800'
                      }`}
                    />
                  ))}
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  متوسط تقييم أداء الخصوم والمصداقية
                </h3>
                <p className="text-xs text-gray-400">
                  بناءً على <strong className="text-amber-400">{count}</strong> تقييم موثق من مباريات ودية رسمية
                </p>
              </div>
            </div>

            {onRateNow && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRateNow();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md glow-primary cursor-pointer shrink-0"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>تقييم اللاعب من مباراة</span>
              </button>
            )}
          </div>

          {/* Sub-Criteria Averages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Sportsmanship */}
            <div className="bg-[#050707] p-3 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-gray-400 block truncate">الروح الرياضية واللعب النظيف</span>
                <strong className="text-sm text-emerald-400 font-mono">
                  {player.sportsmanshipAvg || average || 5} / 5 ⭐
                </strong>
              </div>
            </div>

            {/* Punctuality */}
            <div className="bg-[#050707] p-3 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-gray-400 block truncate">الالتزام بالموعد والاتفاق</span>
                <strong className="text-sm text-blue-400 font-mono">
                  {player.punctualityAvg || average || 5} / 5 ⭐
                </strong>
              </div>
            </div>

            {/* Skill Level */}
            <div className="bg-[#050707] p-3 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-gray-400 block truncate">المستوى الفني والمهاري</span>
                <strong className="text-sm text-purple-400 font-mono">
                  {player.skillLevelAvg || average || 5} / 5 ⭐
                </strong>
              </div>
            </div>
          </div>

          {/* Endorsement Badges */}
          {player.endorsementTags && player.endorsementTags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                أوسمة التميز المكتسبة من الخصوم:
              </h4>
              <div className="flex flex-wrap gap-2">
                {player.endorsementTags.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{item.tag}</span>
                    <span className="bg-amber-400/20 px-1.5 py-0.2 rounded-md text-[10px] font-mono text-amber-200">
                      ×{item.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4 text-[#00FFD2]" />
              سجل آراء وتقييمات قادة الفرق والخصوم ({ratings.length}):
            </h4>

            {ratings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#050707] border border-white/5 text-center space-y-2">
                <ShieldCheck className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">لا توجد تقييمات مسجلة بعد</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  عند خوض هذا اللاعب أي مباراة ودية رسمية عبر المنصة، سيتمكن كابتن الفريق المنافس من تقييم أدائه وروحه الرياضية وستظهر شهاداتهم هنا.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ratings.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#050707] border border-white/10 space-y-2.5 hover:border-amber-400/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-white font-bold">{rev.reviewerName}</strong>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/5">
                            كابتن {rev.reviewerTeam}
                          </span>
                        </div>
                        {rev.matchTeams && (
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Swords className="w-3 h-3 text-[#ff2a5f]" />
                            {rev.matchTeams} {rev.matchVenue ? `(${rev.matchVenue})` : ''}
                          </p>
                        )}
                      </div>

                      <div className="text-left shrink-0">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.overallRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-700 fill-gray-800'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                          {rev.date}
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-xs text-gray-200 leading-relaxed bg-[#0d1211] p-3 rounded-xl border border-white/5 italic">
                      "{rev.comment}"
                    </p>

                    {/* Positive Tags */}
                    {rev.positiveTags && rev.positiveTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rev.positiveTags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050707] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            نظام تقييم معتمد من منصة الكابتن لمكافحة الحسابات الوهمية
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
