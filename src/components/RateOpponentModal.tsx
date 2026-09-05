import React, { useState, useId } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Award,
  Sparkles,
  HeartHandshake,
  Clock,
  Swords,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { FriendlyMatch, OpponentRating, PlayerCv, UserProfile } from '../types';
import { PRESET_POSITIVE_TAGS } from '../utils/ratingService';

interface RateOpponentModalProps {
  isOpen: boolean;
  match: FriendlyMatch | null;
  currentUser: UserProfile;
  availablePlayerCvs: PlayerCv[];
  onClose: () => void;
  onSubmitRating: (rating: OpponentRating, targetCvId?: string) => Promise<void> | void;
}

export default function RateOpponentModal({
  isOpen,
  match,
  currentUser,
  availablePlayerCvs,
  onClose,
  onSubmitRating
}: RateOpponentModalProps) {
  const modalId = useId();

  // Rating States
  const [overallRating, setOverallRating] = useState<number>(5);
  const [sportsmanshipRating, setSportsmanshipRating] = useState<number>(5);
  const [punctualityRating, setPunctualityRating] = useState<number>(5);
  const [skillLevelRating, setSkillLevelRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'روح رياضية عالية 🤝',
    'ملتزم بالوقت بدقة ⏰'
  ]);
  const [comment, setComment] = useState('');
  const [selectedTargetCvId, setSelectedTargetCvId] = useState<string>('');
  const [targetOpponentName, setTargetOpponentName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Initialize target candidate when match opens
  React.useEffect(() => {
    if (match) {
      // Determine if current user is host or opponent
      const isHost =
        currentUser.phone === match.organizerPhone ||
        currentUser.name === match.organizerName ||
        currentUser.name === match.hostTeamName;

      const defaultOpponentTeam = isHost
        ? match.opponentTeamName || 'الفريق المنافس'
        : match.hostTeamName;

      // Try finding matching player CV in that team / area
      const matchedCv = availablePlayerCvs.find(
        (cv) =>
          cv.fullName.includes(defaultOpponentTeam) ||
          (match.opponentTeamName && cv.fullName.includes(match.opponentTeamName)) ||
          cv.governorate === match.governorate
      );

      if (matchedCv) {
        setSelectedTargetCvId(matchedCv.id);
        setTargetOpponentName(matchedCv.fullName);
      } else {
        setTargetOpponentName(defaultOpponentTeam);
      }
    }
  }, [match, currentUser, availablePlayerCvs]);

  if (!isOpen || !match) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getStarLabel = (score: number) => {
    switch (score) {
      case 5:
        return 'استثنائي ومثالي (5/5) 🌟';
      case 4:
        return 'ممتاز جداً (4/5) ✨';
      case 3:
        return 'جيد وملتزم (3/5) 👍';
      case 2:
        return 'مقبول ويحتاج تحسين (2/5) ⚠️';
      default:
        return 'ضعيف (1/5) ❌';
    }
  };

  const handleCvSelection = (cvId: string) => {
    setSelectedTargetCvId(cvId);
    const target = availablePlayerCvs.find((c) => c.id === cvId);
    if (target) {
      setTargetOpponentName(target.fullName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOpponentName.trim()) return;

    setIsSubmitting(true);

    const newRating: OpponentRating = {
      id: `rate-${Date.now()}`,
      matchId: match.id,
      matchDate: match.date,
      matchVenue: match.venueName,
      matchTeams: `${match.hostTeamName} ضد ${match.opponentTeamName || 'المتحدي'}`,
      reviewerId: currentUser.id || currentUser.phone || 'guest',
      reviewerName: currentUser.name || currentUser.phone || 'كابتن منافس',
      reviewerTeam:
        currentUser.phone === match.organizerPhone
          ? match.hostTeamName
          : match.opponentTeamName || 'الفريق المنافس',
      reviewerPhone: currentUser.phone,
      targetPlayerCvId: selectedTargetCvId || undefined,
      targetPlayerName: targetOpponentName,
      targetTeamName:
        currentUser.phone === match.organizerPhone
          ? match.opponentTeamName || 'الفريق المنافس'
          : match.hostTeamName,
      overallRating,
      sportsmanshipRating,
      punctualityRating,
      skillLevelRating,
      positiveTags: selectedTags,
      comment:
        comment.trim() ||
        'مباراة ودية رائعة ومنافس يتمتع بروح رياضية وأخلاق عالية والتزام تام بالموعد والاتفاق.',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    try {
      await onSubmitRating(newRating, selectedTargetCvId || undefined);
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Star Rating Component
  const StarSelector = ({
    value,
    onChange,
    label,
    icon: Icon
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
    icon: React.ElementType;
  }) => (
    <div className="bg-[#050707] p-3 rounded-2xl border border-white/5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-[#00FFD2]" />
          {label}
        </span>
        <span className="text-[11px] font-semibold text-amber-400 font-mono">
          {value} / 5
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 pt-1">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 rounded-lg hover:scale-125 transition-transform cursor-pointer focus:outline-none"
              title={`${star} من 5`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= value
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'text-gray-700 fill-gray-900/40'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-[10px] text-gray-400 max-w-[130px] truncate text-left">
          {getStarLabel(value)}
        </span>
      </div>
    </div>
  );

  return (
    <div
      id="modal-rate-opponent"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border border-amber-400/40 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto relative text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500/20 via-[#00FFD2]/15 to-amber-500/20 p-5 border-b border-white/10 relative">
          <button
            type="button"
            id="btn-close-rate-modal"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-gray-400 hover:text-white hover:bg-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>توثيق الأخلاق الرياضية والمصداقية الكروية</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>تقييم أداء الخصم بعد انتهاء المباراة</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
          </h2>

          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            تقييمك الموثوق يعزز مصداقية اللاعب، يرفع من شارة ثقته في كشاف المواهب، ويساعد الفرق الأخرى على معرفة أخلاق الخصم والتزامه.
          </p>

          {/* Match Pill */}
          <div className="mt-3 inline-flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-200">
            <Swords className="w-3.5 h-3.5 text-[#ff2a5f]" />
            <span className="font-bold text-white">{match.hostTeamName}</span>
            <span className="text-gray-500">ضد</span>
            <span className="font-bold text-white">{match.opponentTeamName || 'المتحدي'}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300 font-mono">{match.venueName} ({match.date})</span>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage ? (
          <div className="p-8 text-center space-y-3 bg-[#0d1211]">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">تم حفظ التقييم بنجاح! 🌟</h3>
            <p className="text-sm text-gray-300">
              تم تحديث متوسط تقييم الخصم وربطه ببطاقة اللاعب (CV) لتعزيز المصداقية والروح الرياضية في المنصة.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Target Opponent Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#00FFD2]" />
                اللاعب أو كابتن الخصم المراد تقييمه:
              </label>

              {availablePlayerCvs.length > 0 ? (
                <div className="space-y-2">
                  <select
                    id="select-target-cv"
                    value={selectedTargetCvId}
                    onChange={(e) => handleCvSelection(e.target.value)}
                    className="w-full bg-[#050707] border border-white/15 rounded-2xl px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none transition-colors"
                  >
                    <option value="">-- اختر بطاقة اللاعب (CV) لربط التقييم بها مباشرة --</option>
                    {availablePlayerCvs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.fullName} - ({cv.position} • {cv.governorate}) - {cv.averageRating ? `⭐ ${cv.averageRating}` : 'جديد'}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">أو اسم الكابتن/الفريق:</span>
                    <input
                      type="text"
                      value={targetOpponentName}
                      onChange={(e) => setTargetOpponentName(e.target.value)}
                      placeholder="اسم كابتن الخصم أو الفريق"
                      className="flex-1 bg-[#050707] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  required
                  value={targetOpponentName}
                  onChange={(e) => setTargetOpponentName(e.target.value)}
                  placeholder="اسم اللاعب أو كابتن الفريق المنافس"
                  className="w-full bg-[#050707] border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              )}
            </div>

            {/* Rating Matrix */}
            <div className="space-y-2.5">
              <StarSelector
                value={overallRating}
                onChange={setOverallRating}
                label="التقييم العام للأداء والمباراة"
                icon={Star}
              />

              <StarSelector
                value={sportsmanshipRating}
                onChange={setSportsmanshipRating}
                label="الروح الرياضية واللعب النظيف (Fair Play)"
                icon={ShieldCheck}
              />

              <StarSelector
                value={punctualityRating}
                onChange={setPunctualityRating}
                label="الالتزام بالموعد والحضور والاتفاق"
                icon={Clock}
              />

              <StarSelector
                value={skillLevelRating}
                onChange={setSkillLevelRating}
                label="المستوى الفني والمهاري والمنافسة الشريفة"
                icon={Sparkles}
              />
            </div>

            {/* Endorsement Tags */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                أبرز ما تميز به الخصم (اختر الوسوم المناسبة):
              </label>

              <div className="flex flex-wrap gap-2">
                {PRESET_POSITIVE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-md shadow-amber-400/20 scale-102'
                          : 'bg-[#050707] text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <span>{tag}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Comment / Review */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                كلمة وانطباع عن المباراة (تظهر على بطاقة اللاعب CV):
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب رأيك الصريح والمحترم حول أداء الخصم والتزامه لتعزيز مصداقيته أمام الأندية والفرق الأخرى..."
                className="w-full bg-[#050707] border border-white/15 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Live Credibility Preview Callout */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-amber-400/10 to-blue-500/10 p-3 rounded-2xl border border-white/10 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">توثيق رسمي ومعتمد للمصداقية</p>
                <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                  سيتم تسجيل هذا التقييم باسم كابتن <strong className="text-amber-400">{currentUser.name || 'الفريق'}</strong> وسيتم احتسابه فوراً في متوسط تقييم بطاقة اللاعب (CV) لزيادة ثقة كشافي الأندية.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="submit"
                id="btn-submit-opponent-rating"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Star className="w-4 h-4 fill-black text-black" />
                <span>{isSubmitting ? 'جاري توثيق التقييم...' : 'تثبيت التقييم والمصداقية 🌟'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
