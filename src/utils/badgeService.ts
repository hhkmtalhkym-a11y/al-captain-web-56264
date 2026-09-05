import { UserProfile, UserBadge, Booking } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from './helpers';

export const SYSTEM_BADGES: UserBadge[] = [
  {
    id: 'player_of_month',
    title: 'لاعب الشهر',
    subtitle: 'أعلى معدل التزام ومشاركة',
    description: 'وسام شرفي يُمنح للاعب الأكثر نشاطاً والتزاماً في المباريات الكروية والتحديات خلال الشهر الجاري.',
    icon: '🌟',
    category: 'activity',
    badgeColor: 'from-amber-400 to-yellow-500',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-400/40',
    bgGlow: 'shadow-amber-400/20',
    isEarned: true,
    earnedDate: 'سبتمبر 2026',
    currentProgress: 10,
    targetProgress: 10,
    unit: 'مباريات',
    rewardXp: 120
  },
  {
    id: 'active_organizer',
    title: 'منظم فعال',
    subtitle: 'مهندس اللقاءات والفرق',
    description: 'يُمنح للكابتن الذي ينظم مباريات ودية وتحديات كروية دورية وينسق حجز الملاعب بفاعلية عالية.',
    icon: '🎯',
    category: 'organizer',
    badgeColor: 'from-[#00FFD2] to-emerald-500',
    textColor: 'text-[#00FFD2]',
    borderColor: 'border-[#00FFD2]/40',
    bgGlow: 'shadow-[#00FFD2]/20',
    isEarned: true,
    earnedDate: 'أغسطس 2026',
    currentProgress: 6,
    targetProgress: 5,
    unit: 'مباريات منسقة',
    rewardXp: 100
  },
  {
    id: 'fair_play_captain',
    title: 'كابتن مثالي',
    subtitle: 'سفير الأخلاق الرياضية',
    description: 'الالتزام الكامل ببنود ميثاق اللعب النظيف، احترام الحكام والخصم، والحصول على تقييم 5 نجوم من الفرق المنافسة.',
    icon: '🏆',
    category: 'fairplay',
    badgeColor: 'from-emerald-400 to-teal-500',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-400/40',
    bgGlow: 'shadow-emerald-400/20',
    isEarned: true,
    earnedDate: 'سبتمبر 2026',
    currentProgress: 15,
    targetProgress: 10,
    unit: 'مباراة نظيفة',
    rewardXp: 110
  },
  {
    id: 'top_striker',
    title: 'هداف المنصة',
    subtitle: 'حاسم اللحظات الكبرى',
    description: 'إحراز وصناعة الأهداف الحاسمة في التحديات والبطولات الرسمية المعتمدة عبر المنصة.',
    icon: '⚽',
    category: 'skill',
    badgeColor: 'from-[#ff2a5f] to-rose-600',
    textColor: 'text-[#ff2a5f]',
    borderColor: 'border-[#ff2a5f]/40',
    bgGlow: 'shadow-[#ff2a5f]/20',
    isEarned: false,
    currentProgress: 9,
    targetProgress: 12,
    unit: 'أهداف ومساهمات',
    rewardXp: 80
  },
  {
    id: 'defense_rock',
    title: 'صخرة الدفاع',
    subtitle: 'الحصن المنيع للشباك',
    description: 'الانضباط التكتيكي الصلب والحفاظ على نظافة شباك الفريق في مباريات التحدي والدوريات.',
    icon: '🛡️',
    category: 'skill',
    badgeColor: 'from-blue-400 to-indigo-500',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-400/40',
    bgGlow: 'shadow-blue-400/20',
    isEarned: false,
    currentProgress: 6,
    targetProgress: 8,
    unit: 'مباريات دفاعية',
    rewardXp: 75
  },
  {
    id: 'master_booker',
    title: 'رائد الحجوزات',
    subtitle: 'تثبيت مواعيد بـ 0% عمولة',
    description: 'إجراء وتأكيد 5 حجوزات ملاعب عبر منصة الكابتن دون أي إلغاءات متأخرة مع الالتزام بالمواعيد.',
    icon: '📅',
    category: 'organizer',
    badgeColor: 'from-cyan-400 to-blue-500',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-400/40',
    bgGlow: 'shadow-cyan-400/20',
    isEarned: true,
    earnedDate: 'يوليو 2026',
    currentProgress: 5,
    targetProgress: 5,
    unit: 'حجوزات مثبتة',
    rewardXp: 90
  },
  {
    id: 'scout_talent',
    title: 'نجم كشاف المواهب',
    subtitle: 'سيرة كروية معتمدة',
    description: 'إنشاء بطاقة لاعب كروية احترافية (CV) وتفعيل إشارة الكشاف للظهور في رادار كشافي الأندية والأكاديميات.',
    icon: '⚡',
    category: 'special',
    badgeColor: 'from-purple-400 to-fuchsia-500',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-400/40',
    bgGlow: 'shadow-purple-400/20',
    isEarned: true,
    earnedDate: 'أغسطس 2026',
    currentProgress: 1,
    targetProgress: 1,
    unit: 'بطاقة منشأة',
    rewardXp: 60
  },
  {
    id: 'app_ambassador',
    title: 'سفير الكابتن',
    subtitle: 'مشارك الشغف الرياضي',
    description: 'مشاركة رابط التطبيق وباركود الدخول مع لاعبي الفرق والأصدقاء لنشر الروح الرياضية وتسهيل حجز الملاعب.',
    icon: '📲',
    category: 'special',
    badgeColor: 'from-emerald-400 to-cyan-400',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-400/40',
    bgGlow: 'shadow-emerald-400/20',
    isEarned: true,
    earnedDate: 'سبتمبر 2026',
    currentProgress: 3,
    targetProgress: 3,
    unit: 'مشاركات ناجحة',
    rewardXp: 70
  }
];

export function getUserBadges(
  user: UserProfile,
  bookings: Booking[] = []
): UserBadge[] {
  const storageKey = `user_badges_${user.id || 'default'}`;
  const customBadges = loadFromLocalStorage<UserBadge[] | null>(storageKey, null);

  if (customBadges && Array.isArray(customBadges) && customBadges.length > 0) {
    return customBadges;
  }

  // Dynamic calculation based on user bookings count if available
  const confirmedBookingsCount = bookings.filter((b) => b.status === 'مؤكد').length;

  return SYSTEM_BADGES.map((badge) => {
    if (badge.id === 'master_booker') {
      const isEarned = confirmedBookingsCount >= 5 || badge.isEarned;
      return {
        ...badge,
        currentProgress: Math.max(confirmedBookingsCount, badge.currentProgress),
        isEarned
      };
    }
    return badge;
  });
}

export function saveUserBadges(userId: string, badges: UserBadge[]) {
  const storageKey = `user_badges_${userId || 'default'}`;
  saveToLocalStorage(storageKey, badges);
}

export function calculateBadgesStats(badges: UserBadge[]) {
  const earnedBadges = badges.filter((b) => b.isEarned);
  const totalBadges = badges.length;
  const totalXp = earnedBadges.reduce((sum, b) => sum + (b.rewardXp || 50), 0);

  // Levels: Level 1 (0-150 XP), Level 2 (151-300), Level 3 (301-500), Level 4 (501+)
  let level = 1;
  let levelTitle = 'لاعب هاوٍ واعد 🌟';
  let nextLevelXp = 200;

  if (totalXp >= 500) {
    level = 4;
    levelTitle = 'كابتن أسطوري معتمد 👑';
    nextLevelXp = 800;
  } else if (totalXp >= 300) {
    level = 3;
    levelTitle = 'كابتن متمرس ومنظم 🏆';
    nextLevelXp = 500;
  } else if (totalXp >= 150) {
    level = 2;
    levelTitle = 'لاعب نشط مميز ⚡';
    nextLevelXp = 300;
  }

  return {
    earnedCount: earnedBadges.length,
    totalCount: totalBadges,
    totalXp,
    level,
    levelTitle,
    nextLevelXp,
    progressPercentage: Math.min(100, Math.round((totalXp / nextLevelXp) * 100))
  };
}
