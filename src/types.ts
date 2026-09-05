export type SyrianGovernorate =
  | 'دمشق'
  | 'ريف دمشق'
  | 'حلب'
  | 'حمص'
  | 'حماة'
  | 'اللاذقية'
  | 'طرطوس'
  | 'إدلب'
  | 'الحسكة'
  | 'دير الزور'
  | 'الرقة'
  | 'درعا'
  | 'السويداء'
  | 'القنيطرة';

export type PitchSurface = 'عشب طبيعي' | 'عشب صناعي' | 'ترابي' | 'صالة مغلقة';
export type PitchCapacity = '6v6' | '7v7' | '8v8' | '9v9' | '10v10' | '11v11';
export type LightingStatus = 'موجودة' | 'غير موجودة';
export type PaymentMethodType = 'نقداً عند الحضور (كاش)' | 'شام كاش';

export type BookingDuration = 'ساعة' | 'ساعة ونصف' | 'ساعتين';
export type BookingStatus = 'قيد الانتظار' | 'مؤكد' | 'ملغي' | 'منتهي' | 'مكتمل';

export type LeagueStatus = 'نشط' | 'مقبل' | 'منتهي';
export type LeagueSystem = 'دوري نقاط' | 'خروج المغلوب' | 'مجموعات' | 'أدوار إقصائية';

export type AgeGroup = 'رجال' | 'شباب' | 'ناشئين' | 'أشبال';
export type CostSplitMethod = 'مناصفة بين الفريقين (50-50)' | 'الخاسر يدفع بالكامل' | 'المستضيف يدفع بالكامل';
export type MatchStatus = 'مفتوح' | 'قيد الانتظار' | 'مقبولة' | 'مؤكد' | 'ملغي' | 'منتهي' | 'مكتمل';

export type PlayerSeekingStatus = 'باحث عن نادي' | 'باحث عن أكاديمية' | 'باحث عن مستكشف لاعبين';
export type SeekingStatus = PlayerSeekingStatus;

export type PlayerPosition =
  | 'حارس مرمى'
  | 'مدافع قلب'
  | 'ظهير أيمن'
  | 'ظهير أيسر'
  | 'وسط ارتكاز'
  | 'وسط مهاجم'
  | 'جناح'
  | 'مهاجم صريح'
  | 'مهاجم صريح (ST)';

export type PreferredFoot = 'اليمنى' | 'اليسرى' | 'القدمين معاً';

export type TransportStatus = 'مؤمنة' | 'غير مؤمنة' | 'بحاجة مواصلات';

export type UserRole =
  | 'admin'
  | 'organizer'
  | 'advertiser'
  | 'player'
  | 'guest'
  | 'captain'
  | 'صاحب ملعب'
  | 'لاعب'
  | 'أدمن'
  | 'كشاف مواهب';

export interface AuthSession {
  token: string;
  userId: string;
  email?: string;
  phone?: string;
  role: UserRole;
  expiresAt: number; // timestamp
  deviceId: string;
  lastLogin: string;
}

export interface SlotSchedule {
  id: string;
  time: string; // e.g. "08:00 - 09:30"
  status: 'available' | 'booked' | 'closed';
  price: number; // in SYP
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  dayName: string; // "الأحد", "الإثنين", etc.
  slots: SlotSchedule[];
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface ExtraServiceItem {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
}

export interface Playground {
  id: string;
  name: string;
  governorate: SyrianGovernorate;
  detailedArea: string;
  latitude: number;
  longitude: number;
  surface: PitchSurface;
  capacity: PitchCapacity;
  lighting: LightingStatus;
  pricePerHour: number; // in SYP
  managerName: string;
  managerPhone: string;
  image?: string;
  images: string[]; // multi photo URLs or Base64
  specs: {
    lengthMeters: number;
    widthMeters: number;
    standsCapacity: number;
    coveredStands: number;
    openStands: number;
    changingRoomsCount: number;
    parkingSpotsCount: number;
    hasRunningTrack?: boolean;
    hasRetractableRoof?: boolean;
    hasHVAC?: boolean;
    builtYear?: number;
    lastRenovated?: number;
  };
  amenities: {
    changingRooms: boolean;
    cafeteria: boolean;
    parking: boolean;
    medicalCenter?: boolean;
    swimmingPool?: boolean;
    clubShop?: boolean;
    water: boolean;
    ballsEquipment: boolean;
    buffet: boolean;
    spectatorSeats: boolean;
    publicTransportNearby: boolean;
    nightLighting: boolean;
  };
  schedules: DaySchedule[];
  reviews: Review[];
  rating: number;
  reviewsCount: number;
  paymentOptions: {
    allowCash: boolean;
    allowShamCash: boolean;
    shamCashAccount?: string;
  };
  extraServices: ExtraServiceItem[];
  status: 'نشط' | 'معلق' | 'مرفوض';
  createdAt: string;
}

export interface Booking {
  id: string;
  referenceNumber: string; // e.g. KAP-2026-XXXXX
  playgroundId: string;
  playgroundName: string;
  governorate: SyrianGovernorate;
  detailedArea: string;
  userId: string;
  userName: string;
  userPhone: string;
  selectedDates: string[];
  timeSlot: string;
  duration: BookingDuration;
  playerCount: string; // "5v5", "7v7", etc.
  specialRequests?: string;
  extraServices?: string[];
  totalPrice: number;
  paymentMethod: PaymentMethodType | string;
  shamCashAccountNumber?: string;
  status: BookingStatus;
  paymentStatus?: 'مدفوع' | 'غير مدفوع' | 'قيد الانتظار';
  source?: 'online' | 'offline'; // من البرنامج أو خارج البرنامج
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  managerPhone: string;
}

export interface TeamStanding {
  position: number;
  teamName: string;
  teamLogo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: ('W' | 'D' | 'L')[];
}

export type GoalType =
  | 'تسديدة'
  | 'ركلة جزاء'
  | 'ركلة حرة'
  | 'رأسية'
  | 'هدف عكسي'
  | 'ركلة زاوية'
  | 'هجمة مرتدة'
  | 'كرة ثابتة'
  | 'أخرى';

export type CardReason =
  | 'تدخل عنيف'
  | 'اعتراض'
  | 'تأخير اللعب'
  | 'تصرف غير لائق'
  | 'الاحتفال المبالغ'
  | 'خلع القميص'
  | 'البطاقة الصفراء الثانية'
  | 'إعاقة هجمة واعدة'
  | 'أخرى';

export type SubstitutionReason = 'تغيير تكتيكي' | 'إصابة' | 'إرهاق' | 'طرد' | 'أخرى';

export interface GoalEvent {
  id: string;
  team: string;
  player: string;
  minute: string; // e.g. "24" or "45+2"
  goalType: GoalType;
  assistPlayer?: string;
  assistMinute?: string;
}

export interface CardEvent {
  id: string;
  team: string;
  player: string;
  cardType: 'صفراء' | 'حمراء';
  minute: string;
  reason: CardReason;
  isSecondYellow?: boolean;
}

export interface SendOffEvent {
  id: string;
  team: string;
  player: string;
  sendOffType: 'طرد مباشر (حمراء)' | 'إنذار ثاني (صفراء ثانية)';
  minute: string;
  reason: string;
  suspensionMatches: number;
}

export interface SubstitutionEvent {
  id: string;
  team: string;
  playerOut: string;
  playerIn: string;
  minute: string;
  reason: SubstitutionReason;
}

export interface TeamMatchStats {
  possessionPercentage: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  corners: number;
  offsides: number;
  fouls: number;
  successfulPasses: number;
  unsuccessfulPasses: number;
  goalkeeperSaves: number;
  interceptions: number;
  tackles: number;
}

export type LeagueFixtureStatus = 'قادمة' | 'مباشر' | 'انتهت' | 'مؤجلة' | 'ملغية';

export interface LeagueFixture {
  id: string;
  leagueId?: string;
  round: string;
  teamA: string;
  teamB: string;
  teamALogo?: string;
  teamBLogo?: string;
  teamAPlayers?: string[];
  teamBPlayers?: string[];
  scoreA?: number;
  scoreB?: number;
  date: string;
  time: string;
  venue: string;
  status?: LeagueFixtureStatus;
  isFinished: boolean;
  isLocked?: boolean;
  mainReferee?: string;
  assistantReferees?: string[];
  postponeReason?: string;
  notes?: string;
  goals?: GoalEvent[];
  cards?: CardEvent[];
  sendOffs?: SendOffEvent[];
  substitutions?: SubstitutionEvent[];
  statsA?: TeamMatchStats;
  statsB?: TeamMatchStats;
  summaryNotes?: string;
  manOfTheMatch?: string;
  matchRating?: number;
}

export interface QualifiedTeam {
  id: string;
  position: number;
  teamName: string;
  teamLogo?: string;
  points: number;
  goalDifference: number;
  qualifiedRound: string; // e.g. "ربع النهائي", "نصف النهائي", "المباراة النهائية"
  isManuallyEdited?: boolean;
}

export interface PlayerDisciplinaryRecord {
  playerName: string;
  teamName: string;
  yellowCardsCount: number;
  redCardsCount: number;
  isSuspended: boolean;
  suspensionMatchesRemaining: number;
  suspensionReason?: string;
  cardsHistory: {
    fixtureId: string;
    round: string;
    opponent: string;
    cardType: 'صفراء' | 'حمراء';
    minute: string;
    reason: string;
  }[];
}

export interface TeamDisciplinaryRecord {
  teamName: string;
  yellowCards: number;
  redCards: number;
  totalCards: number;
  fairPlayPoints: number; // 1 for yellow, 3 for red
  matchesPlayed: number;
  avgCardsPerMatch: number;
  rank: number;
}

export interface ObjectionCase {
  id: string;
  leagueId: string;
  leagueName: string;
  matchId: string;
  submittingTeam: string;
  targetTeam: string;
  reason: string;
  evidenceDetails: string;
  depositFeePaid: number;
  status: 'قيد المراجعة' | 'مقبول' | 'مرفوض';
  adminDecisionNotes?: string;
  createdAt: string;
}

export interface Objection {
  id: string;
  teamName: string;
  fixtureId: string;
  reason: string;
  evidencePhoto?: string;
  status: 'معلق' | 'مقبول ومعدل' | 'مرفوض' | 'إعادة مباراة';
  adminDecision?: string;
  date: string;
}

export interface LeagueAwards {
  topScorer?: { name: string; team: string; goals: number };
  bestPlayer?: { name: string; team: string };
  bestGoalkeeper?: { name: string; team: string };
  bestCoach?: { name: string; team: string };
  fairPlayTeam?: string;
  isFinalized?: boolean;
}

export interface League {
  id: string;
  name: string;
  season: string;
  image: string;
  governorate: SyrianGovernorate;
  city: string;
  hostingVenue: string;
  capacity: PitchCapacity;
  surface: PitchSurface;
  system: LeagueSystem;
  ownerId?: string;
  organizerName: string;
  organizerPhone: string;
  entryFee: number;
  mainPlayersCount: number;
  substitutePlayersCount: number;
  teamsCount: number;
  registeredTeams?: string[];
  termsAndConditions: string;
  prizes: {
    cup: boolean;
    medals: string;
    cashPrize: number;
  };
  standings: TeamStanding[];
  fixtures: LeagueFixture[];
  qualifiedTeams?: QualifiedTeam[];
  awards?: LeagueAwards;
  objections: Objection[];
  reviews: Review[];
  rating: number;
  status: LeagueStatus;
  isArchived?: boolean;
  paymentOptions: {
    allowCash: boolean;
    allowShamCash: boolean;
    shamCashAccount?: string;
  };
  createdAt: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor?: string;
  image: string;
  imageUrl?: string;
  tabTarget: string;
  linkTab?: string;
  actionText: string;
  buttonText?: string;
  highlightText?: string;
  isActive: boolean;
  order?: number;
}

export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  experienceYears: number;
  image: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  durationMonths: number;
  daysSchedule: string;
  targetAge: string;
  objectives: string;
}

export type MatchLevel = 'مبتدئ' | 'متوسط' | 'متقدم' | 'محترف';
export type PaymentStatus = 'مدفوع' | 'قيد الانتظار' | 'غير مدفوع';
export type RegistrationStatus = 'قيد الانتظار' | 'مؤكد' | 'مرفوض';

export interface SportLogoItem {
  id: string;
  name: string;
  category: 'كؤوس وجوائز' | 'كرات ومعدات' | 'ملاعب ومنشآت' | 'شعارات أندية' | 'لاعبين وحكام';
  url: string;
  iconName?: string;
}

export interface AcademyMember {
  id: string;
  fullName: string; // الاسم الثلاثي
  birthDate: string; // المواليد (مثال: 2014-05-15)
  birthYear?: number; // سنة الميلاد
  age?: number; // العمر
  ageGroupMin: number; // الفئة العمرية من
  ageGroupMax: number; // الفئة العمرية إلى
  ageGroupLabel?: string; // مسمى الفئة (مثلاً: أشبال 9 - 12 سنة)
  installmentStatus: 'مدفوع' | 'غير مدفوع' | 'مسدد جزئياً'; // تسديد القسط
  installmentAmount?: number; // قيمة القسط
  installmentDate?: string; // تاريخ التسديد
  paymentMethod?: string; // وسيلة الدفع
  residence: string; // السكن (المحافظة / المدينة / الحي)
  phone: string; // رقم الجوال
  // معلومات شخصية وخاصة باللاعب:
  position?: PlayerPosition | string; // مركز اللعب
  preferredFoot?: PreferredFoot | string; // القدم المفضلة
  height?: number; // الطول (سم)
  weight?: number; // الوزن (كغ)
  bloodType?: string; // زمرة الدم
  medicalNotes?: string; // معلومات صحية
  emergencyContact?: string; // هاتف الطوارئ
  personalNotes?: string; // ملاحظات شخصية وخاصة باللاعب
  jerseyNumber?: number; // رقم القميص
  photo?: string; // صورة اللاعب
  joinedDate: string; // تاريخ الانتساب
  registrationId?: string; // معرف طلب التسجيل التلقائي
}

export interface AcademyRegistration {
  id: string;
  academyId: string;
  academyName: string;
  studentName: string;
  birthDate: string;
  age: number;
  ageGroup: string; // براعم, أشبال, ناشئين, شباب, رجال
  preferredPosition: PlayerPosition;
  governorate: SyrianGovernorate;
  city: string;
  parentName: string;
  parentPhone: string;
  transportOption: TransportStatus;
  studentPhoto: string;
  paymentReceiptPhoto: string;
  notes?: string;
  paymentMethod: PaymentMethodType | string;
  shamCashAccountNumber?: string;
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  registrationStatus?: RegistrationStatus;
  rejectionReason?: string;
  createdAt: string;
  userId?: string;
}

export interface Academy {
  id: string;
  name: string;
  image: string;
  images: string[];
  governorate: SyrianGovernorate;
  locationDetails: string;
  latitude: number;
  longitude: number;
  ownerId?: string;
  mainCoach: string;
  contactPhone: string;
  monthlyFee: number;
  targetAgeGroups: string;
  ageGroupMin?: number;
  ageGroupMax?: number;
  trainingDays?: string[];
  paymentMethodsList?: string[];
  description: string;
  transportStatus: TransportStatus;
  facilities: string[];
  trainers: Trainer[];
  programs: TrainingProgram[];
  reviews: Review[];
  rating: number;
  paymentOptions: {
    allowCash: boolean;
    allowShamCash: boolean;
    shamCashAccount?: string;
  };
  members?: AcademyMember[]; // قائمة وجدول المنتسبين للأكاديمية
  status: 'نشط' | 'معلق';
  createdAt: string;
}

export interface FriendlyMatch {
  id: string;
  hostTeamName: string;
  hostTeamImage: string;
  opponentTeamName?: string;
  opponentTeamImage?: string;
  venueName: string;
  venueLocation: string;
  governorate: SyrianGovernorate;
  date: string;
  time: string;
  ageGroup: AgeGroup;
  level?: MatchLevel;
  playersCountRequired?: number | string;
  costSplitMethod: CostSplitMethod;
  pitchPrice: number;
  refereePrice: number;
  refereeName?: string;
  organizerName: string;
  organizerPhone: string;
  hostJerseyColor?: string;
  guestJerseyColor?: string;
  notesAndChallengeRules?: string;
  paymentMethod: PaymentMethodType;
  shamCashAccountNumber?: string;
  paymentStatus?: PaymentStatus;
  status: MatchStatus;
  statusApprovedByAdmin: boolean;
  adminRejectionReason?: string;
  createdAt: string;
}


export interface PlayerStats {
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  interceptions: number;
  passAccuracyPercentage: number;
}

export interface PlayerSkills {
  passing: number; // 0 - 100
  shooting: number;
  stamina: number;
  defending: number;
  speed: number;
  dribbling: number;
  tacticalIQ: number;
  leadership: number;
}

export interface PlayerCv {
  id: string;
  fullName: string;
  image: string;
  governorate: SyrianGovernorate;
  area: string;
  phoneNumber: string;
  birthDate: string;
  heightCm: number;
  weightKg: number;
  preferredFoot: PreferredFoot;
  position: PlayerPosition;
  seekingStatus: PlayerSeekingStatus;
  previousClubs: string;
  achievements: string;
  stats: PlayerStats;
  skills: PlayerSkills;
  isBeaconSent?: boolean;
  isPublic: boolean;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  category: 'activity' | 'skill' | 'fairplay' | 'organizer' | 'special';
  badgeColor: string;
  textColor: string;
  borderColor: string;
  bgGlow: string;
  isEarned: boolean;
  earnedDate?: string;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  rewardXp: number;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  image?: string;
  governorate: SyrianGovernorate;
  joinDate?: string;
  isAdmin?: boolean;
  position?: string;
  favoritePlaygrounds?: string[];
  isBanned?: boolean;
  banReason?: string;
  earnedBadgeIds?: string[];
  badges?: UserBadge[];
  activityCount?: {
    bookings: number;
    matches: number;
    rating: number;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type?: 'booking' | 'match' | 'challenge' | 'league' | 'academy' | 'admin' | 'system';
  date?: string;
  timestamp?: string;
  isRead: boolean;
  targetId?: string;
}

export type NotificationItem = AppNotification;

export interface AdBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge: string;
  linkTab?: string;
  isActive: boolean;
}
