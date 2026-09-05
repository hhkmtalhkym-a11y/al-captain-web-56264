import { OpponentRating, PlayerCv } from '../types';

/**
 * Calculates average rating and sub-criteria averages for a player
 */
export function recalculatePlayerRatings(ratings: OpponentRating[]) {
  if (!ratings || ratings.length === 0) {
    return {
      averageRating: 0,
      ratingsCount: 0,
      sportsmanshipAvg: 0,
      punctualityAvg: 0,
      skillLevelAvg: 0,
      endorsementTags: [] as { tag: string; count: number }[]
    };
  }

  const count = ratings.length;
  const totalOverall = ratings.reduce((sum, r) => sum + (r.overallRating || 0), 0);
  const totalSportsmanship = ratings.reduce((sum, r) => sum + (r.sportsmanshipRating || r.overallRating || 0), 0);
  const totalPunctuality = ratings.reduce((sum, r) => sum + (r.punctualityRating || r.overallRating || 0), 0);
  const totalSkill = ratings.reduce((sum, r) => sum + (r.skillLevelRating || r.overallRating || 0), 0);

  // Count endorsement tags
  const tagCounts: Record<string, number> = {};
  ratings.forEach((r) => {
    (r.positiveTags || []).forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  const endorsementTags = Object.entries(tagCounts)
    .map(([tag, c]) => ({ tag, count: c }))
    .sort((a, b) => b.count - a.count);

  return {
    averageRating: parseFloat((totalOverall / count).toFixed(1)),
    ratingsCount: count,
    sportsmanshipAvg: parseFloat((totalSportsmanship / count).toFixed(1)),
    punctualityAvg: parseFloat((totalPunctuality / count).toFixed(1)),
    skillLevelAvg: parseFloat((totalSkill / count).toFixed(1)),
    endorsementTags
  };
}

/**
 * Appends a new opponent rating to a Player CV and returns updated fields
 */
export function addRatingToPlayerCv(player: PlayerCv, newRating: OpponentRating): PlayerCv {
  const currentRatings = player.opponentRatings || [];
  // Avoid duplicate by ID
  const existingIdx = currentRatings.findIndex((r) => r.id === newRating.id || (r.matchId === newRating.matchId && r.reviewerId === newRating.reviewerId));
  let updatedRatings: OpponentRating[];
  
  if (existingIdx >= 0) {
    updatedRatings = [...currentRatings];
    updatedRatings[existingIdx] = newRating;
  } else {
    updatedRatings = [newRating, ...currentRatings];
  }

  const calculated = recalculatePlayerRatings(updatedRatings);

  return {
    ...player,
    opponentRatings: updatedRatings,
    ...calculated
  };
}

/**
 * Get credibility tier / badge for a player based on rating & review count
 */
export function getPlayerCredibilityBadge(rating?: number, count?: number): {
  label: string;
  colorClass: string;
  badgeBorder: string;
  bgClass: string;
  iconText: string;
} {
  const r = rating || 0;
  const c = count || 0;

  if (c === 0) {
    return {
      label: 'لاعب جديد (بانتظار أول تقييم)',
      colorClass: 'text-gray-400',
      badgeBorder: 'border-gray-700',
      bgClass: 'bg-gray-800/40',
      iconText: '🆕'
    };
  }

  if (r >= 4.8 && c >= 3) {
    return {
      label: 'مصداقية استثنائية وروح رياضية ذهبية',
      colorClass: 'text-amber-300',
      badgeBorder: 'border-amber-400/50',
      bgClass: 'bg-amber-400/10',
      iconText: '🌟'
    };
  }

  if (r >= 4.5) {
    return {
      label: 'موثوق رياضياً ومثالي في الالتزام',
      colorClass: 'text-emerald-300',
      badgeBorder: 'border-emerald-400/50',
      bgClass: 'bg-emerald-400/10',
      iconText: '🛡️'
    };
  }

  if (r >= 4.0) {
    return {
      label: 'منافس موثوق ومحترم',
      colorClass: 'text-[#00FFD2]',
      badgeBorder: 'border-[#00FFD2]/40',
      bgClass: 'bg-[#00FFD2]/10',
      iconText: '🤝'
    };
  }

  return {
    label: 'تقييم كروي نشط',
    colorClass: 'text-blue-300',
    badgeBorder: 'border-blue-400/40',
    bgClass: 'bg-blue-400/10',
    iconText: '⚽'
  };
}

export const PRESET_POSITIVE_TAGS = [
  'روح رياضية عالية 🤝',
  'ملتزم بالوقت بدقة ⏰',
  'لعب نظيف وبدون خشونة 🕊️',
  'مهارات كروية استثنائية ⚡',
  'منافس محترم وراقي 🛡️',
  'تمريرات وصناعة دقيقة 🎯',
  'لياقة بدنية وتحمل عالي 🏃',
  'احترام طاقم التحكيم والقرارات ⚖️'
];
