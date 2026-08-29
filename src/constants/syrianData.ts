import {
  SyrianGovernorate,
  Playground,
  League,
  Academy,
  FriendlyMatch,
  PlayerCv,
  UserProfile,
  NotificationItem,
  AdBanner,
  DaySchedule
} from '../types';

export const SYRIAN_GOVERNORATES: SyrianGovernorate[] = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'إدلب',
  'الحسكة',
  'دير الزور',
  'الرقة',
  'درعا',
  'السويداء',
  'القنيطرة'
];

export const GOVERNORATE_COORDINATES: Record<SyrianGovernorate, { lat: number; lng: number }> = {
  'دمشق': { lat: 33.5138, lng: 36.2765 },
  'ريف دمشق': { lat: 33.5350, lng: 36.3500 },
  'حلب': { lat: 36.2021, lng: 37.1343 },
  'حمص': { lat: 34.7324, lng: 36.7137 },
  'حماة': { lat: 35.1318, lng: 36.7578 },
  'اللاذقية': { lat: 35.5317, lng: 35.7901 },
  'طرطوس': { lat: 34.8959, lng: 35.8866 },
  'إدلب': { lat: 35.9306, lng: 36.6339 },
  'الحسكة': { lat: 36.5056, lng: 40.7428 },
  'دير الزور': { lat: 35.3359, lng: 40.1408 },
  'الرقة': { lat: 35.9594, lng: 39.0089 },
  'درعا': { lat: 32.6256, lng: 36.1053 },
  'السويداء': { lat: 32.7089, lng: 36.5695 },
  'القنيطرة': { lat: 33.1261, lng: 35.8239 }
};

export const TIME_SLOTS_90_MIN = [
  '08:00 - 09:30',
  '09:30 - 11:00',
  '11:00 - 12:30',
  '12:30 - 14:00',
  '14:00 - 15:30',
  '15:30 - 17:00',
  '17:00 - 18:30',
  '18:30 - 20:00',
  '20:00 - 21:30',
  '21:30 - 23:00',
  '23:00 - 00:30'
];

export const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function generate7DaySchedule(pricePerHour: number = 85000): DaySchedule[] {
  const result: DaySchedule[] = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = ARABIC_DAYS[d.getDay()];

    const slots = TIME_SLOTS_90_MIN.map((time, idx) => {
      // Simulate varied real booking statuses
      let status: 'available' | 'booked' | 'closed' = 'available';
      if (i === 0 && (idx === 6 || idx === 7)) {
        status = 'booked';
      } else if (i === 1 && (idx === 7 || idx === 8)) {
        status = 'booked';
      } else if (idx === 0 && i % 3 === 0) {
        status = 'closed';
      }

      return {
        id: `slot-${dateStr}-${idx}`,
        time,
        status,
        price: pricePerHour
      };
    });

    result.push({
      date: dateStr,
      dayName,
      slots
    });
  }

  return result;
}

export const INITIAL_PLAYGROUNDS: Playground[] = [
  {
    id: 'pg-1',
    name: 'ملعب الفيحاء الدولي 1',
    governorate: 'دمشق',
    detailedArea: 'المزرعة - مدينة الفيحاء الرياضية',
    latitude: 33.5285,
    longitude: 36.2995,
    surface: 'عشب صناعي',
    capacity: '7v7',
    lighting: 'موجودة',
    pricePerHour: 120000,
    managerName: 'أبو أحمد الساعاتي',
    managerPhone: '0944123456',
    images: [
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      lengthMeters: 65,
      widthMeters: 45,
      standsCapacity: 350,
      coveredStands: 200,
      openStands: 150,
      changingRoomsCount: 4,
      parkingSpotsCount: 45,
      hasRunningTrack: true,
      hasRetractableRoof: false,
      hasHVAC: true,
      builtYear: 2021,
      lastRenovated: 2025
    },
    amenities: {
      changingRooms: true,
      cafeteria: true,
      parking: true,
      medicalCenter: true,
      swimmingPool: false,
      clubShop: true,
      water: true,
      ballsEquipment: true,
      buffet: true,
      spectatorSeats: true,
      publicTransportNearby: true,
      nightLighting: true
    },
    schedules: generate7DaySchedule(120000),
    reviews: [
      {
        id: 'rev-1',
        userName: 'سامر الحلبي',
        rating: 5,
        comment: 'أرضية ممتازة جداً وإنارة ليلية ولا أروع، والمرافق نظيفة دائماً.',
        date: '2026-08-18'
      },
      {
        id: 'rev-2',
        userName: 'مجد الخطيب',
        rating: 4.8,
        comment: 'المسؤول محترم والمواعيد دقيقة 100%.',
        date: '2026-08-20'
      }
    ],
    rating: 4.9,
    reviewsCount: 38,
    paymentOptions: {
      allowCash: true,
      allowShamCash: true,
      shamCashAccount: 'SHAM-7729-1940'
    },
    extraServices: [
      { id: 'srv-1', name: 'حكم مباراة اتحادي معتمد', price: 40000 },
      { id: 'srv-2', name: 'كرات إضافية أصلية (طقم 3 كرات)', price: 15000 },
      { id: 'srv-3', name: 'مياه معدنية مثلجة (كرتونة 12 عبوة)', price: 25000 },
      { id: 'srv-4', name: 'شيالات ملونة مميزة للفريقين', price: 10000 }
    ],
    status: 'نشط',
    createdAt: '2026-01-10'
  },
  {
    id: 'pg-2',
    name: 'مجمع الشهباء الرياضي',
    governorate: 'حلب',
    detailedArea: 'حلب الجديدة - قرب دوار شفا',
    latitude: 36.2150,
    longitude: 37.1150,
    surface: 'عشب طبيعي',
    capacity: '8v8',
    lighting: 'موجودة',
    pricePerHour: 110000,
    managerName: 'عمر القطان',
    managerPhone: '0933987654',
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      lengthMeters: 75,
      widthMeters: 50,
      standsCapacity: 500,
      coveredStands: 300,
      openStands: 200,
      changingRoomsCount: 6,
      parkingSpotsCount: 60,
      hasRunningTrack: false,
      hasRetractableRoof: false,
      hasHVAC: true,
      builtYear: 2023,
      lastRenovated: 2026
    },
    amenities: {
      changingRooms: true,
      cafeteria: true,
      parking: true,
      medicalCenter: true,
      swimmingPool: true,
      clubShop: false,
      water: true,
      ballsEquipment: true,
      buffet: true,
      spectatorSeats: true,
      publicTransportNearby: true,
      nightLighting: true
    },
    schedules: generate7DaySchedule(110000),
    reviews: [
      {
        id: 'rev-3',
        userName: 'محمد عثمان',
        rating: 5,
        comment: 'أفضل عشب طبيعي في حلب بدون منازع، تجربة لعب احترافية.',
        date: '2026-08-15'
      }
    ],
    rating: 5.0,
    reviewsCount: 24,
    paymentOptions: {
      allowCash: true,
      allowShamCash: true,
      shamCashAccount: 'SHAM-5531-9021'
    },
    extraServices: [
      { id: 'srv-1', name: 'حكم مباراة اتحادي معتمد', price: 35000 },
      { id: 'srv-2', name: 'كرات إضافية أصلية (طقم 3 كرات)', price: 15000 },
      { id: 'srv-3', name: 'مياه معدنية مثلجة', price: 20000 },
      { id: 'srv-4', name: 'شيالات ملونة', price: 10000 }
    ],
    status: 'نشط',
    createdAt: '2026-02-01'
  },
  {
    id: 'pg-3',
    name: 'أرينا الساحل - الصالة المغلقة',
    governorate: 'اللاذقية',
    detailedArea: 'الكورنيش الجنوبي - مقابل المدينة الرياضية',
    latitude: 35.5180,
    longitude: 35.7820,
    surface: 'صالة مغلقة',
    capacity: '6v6',
    lighting: 'موجودة',
    pricePerHour: 95000,
    managerName: 'الكابتن باسل يوسف',
    managerPhone: '0955332211',
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      lengthMeters: 42,
      widthMeters: 24,
      standsCapacity: 250,
      coveredStands: 250,
      openStands: 0,
      changingRoomsCount: 2,
      parkingSpotsCount: 30,
      hasRunningTrack: false,
      hasRetractableRoof: true,
      hasHVAC: true,
      builtYear: 2024,
      lastRenovated: 2026
    },
    amenities: {
      changingRooms: true,
      cafeteria: true,
      parking: true,
      medicalCenter: false,
      swimmingPool: false,
      clubShop: false,
      water: true,
      ballsEquipment: true,
      buffet: true,
      spectatorSeats: true,
      publicTransportNearby: true,
      nightLighting: true
    },
    schedules: generate7DaySchedule(95000),
    reviews: [
      {
        id: 'rev-4',
        userName: 'كريم ناصر',
        rating: 4.7,
        comment: 'التكييف شغال بشكل ممتاز والأرضية باركيه خشبية مريحة جداً للأرجل.',
        date: '2026-08-22'
      }
    ],
    rating: 4.7,
    reviewsCount: 19,
    paymentOptions: {
      allowCash: true,
      allowShamCash: true,
      shamCashAccount: 'SHAM-1188-4420'
    },
    extraServices: [
      { id: 'srv-1', name: 'حكم معتمد لكرة الصالات', price: 30000 },
      { id: 'srv-2', name: 'كرات فوتسال خاصة', price: 12000 },
      { id: 'srv-3', name: 'مياه معدنية وعصائر طبيعية', price: 20000 },
      { id: 'srv-4', name: 'شيالات ملونة مميزة', price: 8000 }
    ],
    status: 'نشط',
    createdAt: '2026-03-12'
  },
  {
    id: 'pg-4',
    name: 'ملعب العاصي النجمي',
    governorate: 'حماة',
    detailedArea: 'حي الأندلس - طريق حلب',
    latitude: 35.1420,
    longitude: 36.7450,
    surface: 'عشب صناعي',
    capacity: '7v7',
    lighting: 'موجودة',
    pricePerHour: 85000,
    managerName: 'أنس السباعي',
    managerPhone: '0966445566',
    images: [
      'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      lengthMeters: 60,
      widthMeters: 40,
      standsCapacity: 200,
      coveredStands: 100,
      openStands: 100,
      changingRoomsCount: 2,
      parkingSpotsCount: 25,
      builtYear: 2022,
      lastRenovated: 2025
    },
    amenities: {
      changingRooms: true,
      cafeteria: true,
      parking: true,
      water: true,
      ballsEquipment: true,
      buffet: false,
      spectatorSeats: true,
      publicTransportNearby: true,
      nightLighting: true
    },
    schedules: generate7DaySchedule(85000),
    reviews: [
      {
        id: 'rev-5',
        userName: 'طارق الدالاتي',
        rating: 4.9,
        comment: 'ملعب راقي وموقع هادئ جداً.',
        date: '2026-08-19'
      }
    ],
    rating: 4.9,
    reviewsCount: 15,
    paymentOptions: {
      allowCash: true,
      allowShamCash: true,
      shamCashAccount: 'SHAM-9081-3321'
    },
    extraServices: [
      { id: 'srv-1', name: 'حكم مباراة', price: 30000 },
      { id: 'srv-2', name: 'كرات إضافية', price: 10000 },
      { id: 'srv-3', name: 'مياه باردة', price: 15000 }
    ],
    status: 'نشط',
    createdAt: '2026-04-05'
  },
  {
    id: 'pg-5',
    name: 'ملعب خالد بن الوليد الرياضي',
    governorate: 'حمص',
    detailedArea: 'الوعر - بجانب المدينة الرياضية',
    latitude: 34.7450,
    longitude: 36.6850,
    surface: 'عشب صناعي',
    capacity: '11v11',
    lighting: 'موجودة',
    pricePerHour: 160000,
    managerName: 'أبو فراس الحمصي',
    managerPhone: '0988776655',
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      lengthMeters: 105,
      widthMeters: 68,
      standsCapacity: 1200,
      coveredStands: 600,
      openStands: 600,
      changingRoomsCount: 6,
      parkingSpotsCount: 100,
      hasRunningTrack: true,
      hasRetractableRoof: false,
      hasHVAC: true,
      builtYear: 2020,
      lastRenovated: 2026
    },
    amenities: {
      changingRooms: true,
      cafeteria: true,
      parking: true,
      medicalCenter: true,
      swimmingPool: false,
      clubShop: true,
      water: true,
      ballsEquipment: true,
      buffet: true,
      spectatorSeats: true,
      publicTransportNearby: true,
      nightLighting: true
    },
    schedules: generate7DaySchedule(160000),
    reviews: [
      {
        id: 'rev-6',
        userName: 'عدنان الصالح',
        rating: 5,
        comment: 'ملعب قانوني 11 ضد 11 بأعلى المعايير، مثالي للدوريات الرسمية.',
        date: '2026-08-21'
      }
    ],
    rating: 5.0,
    reviewsCount: 42,
    paymentOptions: {
      allowCash: true,
      allowShamCash: true,
      shamCashAccount: 'SHAM-4412-8877'
    },
    extraServices: [
      { id: 'srv-1', name: 'طاقم تحكيم ثلاثي معتمد', price: 75000 },
      { id: 'srv-2', name: 'طقم كرات رسمية للمباراة', price: 20000 },
      { id: 'srv-3', name: 'مياه معدنية ومشروبات طاقة', price: 30000 },
      { id: 'srv-4', name: 'شيالات مميزة', price: 15000 }
    ],
    status: 'نشط',
    createdAt: '2026-01-20'
  }
];

export const INITIAL_LEAGUES: League[] = [
  {
    id: 'lg-1',
    name: 'دوري أبطال الشام الكبرى 2026',
    season: 'الموسم الصيفي 2026',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
    governorate: 'دمشق',
    city: 'دمشق',
    ownerId: 'user-organizer-1',
    hostingVenue: 'ملعب الفيحاء الدولي 1',
    capacity: '7v7',
    surface: 'عشب صناعي',
    system: 'دوري نقاط',
    organizerName: 'الكابتن نزار محروس',
    organizerPhone: '0944112233',
    entryFee: 350000,
    mainPlayersCount: 7,
    substitutePlayersCount: 5,
    teamsCount: 8,
    termsAndConditions: '1. الالتزام بالروح الرياضية واللباس الموحد.\n2. التواجد قبل 20 دقيقة من موعد المباراة.\n3. القرارات التحكيمية ملزمة للجميع والاعتراض خلال 24 ساعة عبر المنصة.',
    prizes: {
      cup: true,
      medals: 'ميداليات ذهبية للمركز الأول وفضية للمركز الثاني وبرونزية للثالث',
      cashPrize: 5000000
    },
    standings: [
      { position: 1, teamName: 'نسور قاسيون', played: 5, won: 4, drawn: 1, lost: 0, goalsFor: 16, goalsAgainst: 5, goalDifference: 11, points: 13 },
      { position: 2, teamName: 'فرسان بردى', played: 5, won: 4, drawn: 0, lost: 1, goalsFor: 14, goalsAgainst: 7, goalDifference: 7, points: 12 },
      { position: 3, teamName: 'أمل دمشق', played: 5, won: 3, drawn: 1, lost: 1, goalsFor: 11, goalsAgainst: 6, goalDifference: 5, points: 10 },
      { position: 4, teamName: 'نجوم الميدان', played: 5, won: 2, drawn: 1, lost: 2, goalsFor: 9, goalsAgainst: 10, goalDifference: -1, points: 7 },
      { position: 5, teamName: 'شباب الفيحاء', played: 5, won: 2, drawn: 0, lost: 3, goalsFor: 8, goalsAgainst: 11, goalDifference: -3, points: 6 },
      { position: 6, teamName: 'صقور الشام', played: 5, won: 1, drawn: 1, lost: 3, goalsFor: 6, goalsAgainst: 12, goalDifference: -6, points: 4 },
      { position: 7, teamName: 'أولمبيك دمشق', played: 5, won: 1, drawn: 0, lost: 4, goalsFor: 5, goalsAgainst: 13, goalDifference: -8, points: 3 },
      { position: 8, teamName: 'اتحاد الربوة', played: 5, won: 0, drawn: 2, lost: 3, goalsFor: 4, goalsAgainst: 9, goalDifference: -5, points: 2 }
    ],
    fixtures: [
      { id: 'fix-1', round: 'الجولة 6', teamA: 'نسور قاسيون', teamB: 'فرسان بردى', date: '2026-08-28', time: '19:00', venue: 'ملعب الفيحاء 1', isFinished: false, status: 'قادمة' },
      { id: 'fix-2', round: 'الجولة 6', teamA: 'أمل دمشق', teamB: 'نجوم الميدان', date: '2026-08-28', time: '20:30', venue: 'ملعب الفيحاء 1', isFinished: false, status: 'قادمة' },
      {
        id: 'fix-3',
        round: 'الجولة 5',
        teamA: 'نسور قاسيون',
        teamB: 'شباب الفيحاء',
        scoreA: 3,
        scoreB: 1,
        date: '2026-08-21',
        time: '19:00',
        venue: 'ملعب الفيحاء 1',
        status: 'انتهت',
        isFinished: true,
        isLocked: true,
        mainReferee: 'الكابتن فراس معلا',
        manOfTheMatch: 'عمر خربين (نسور قاسيون)',
        matchRating: 5,
        summaryNotes: 'مباراة قوية هجومياً تألق فيها هداف الدوري عمر خربين وسجل ثنائية حاسمة.',
        goals: [
          { id: 'g-1', team: 'نسور قاسيون', player: 'عمر خربين', minute: '14', goalType: 'تسديدة', assistPlayer: 'محمود المواس' },
          { id: 'g-2', team: 'شباب الفيحاء', player: 'مؤيد العجان', minute: '38', goalType: 'ركلة حرة' },
          { id: 'g-3', team: 'نسور قاسيون', player: 'عمر خربين', minute: '62', goalType: 'ركلة جزاء' },
          { id: 'g-4', team: 'نسور قاسيون', player: 'مارديك مردكيان', minute: '85', goalType: 'رأسية' }
        ],
        cards: [
          { id: 'c-1', team: 'شباب الفيحاء', player: 'أحمد الصالح', cardType: 'صفراء', minute: '22', reason: 'تدخل عنيف' },
          { id: 'c-2', team: 'نسور قاسيون', player: 'عمرو ميداني', cardType: 'صفراء', minute: '55', reason: 'اعتراض' },
          { id: 'c-3', team: 'شباب الفيحاء', player: 'أحمد الصالح', cardType: 'صفراء', minute: '79', reason: 'البطاقة الصفراء الثانية', isSecondYellow: true }
        ],
        sendOffs: [
          { id: 'so-1', team: 'شباب الفيحاء', player: 'أحمد الصالح', minute: '79', sendOffType: 'إنذار ثاني (صفراء ثانية)', reason: 'الحصول على بطاقة صفراء ثانية', suspensionMatches: 1 }
        ],
        substitutions: [
          { id: 'sub-1', team: 'نسور قاسيون', playerOut: 'فهد اليوسف', playerIn: 'محمد الحلاق', minute: '65', reason: 'تغيير تكتيكي' },
          { id: 'sub-2', team: 'شباب الفيحاء', playerOut: 'علاء الدالي', playerIn: 'ياسين سامية', minute: '70', reason: 'تغيير تكتيكي' }
        ]
      }
    ],
    awards: {
      topScorer: { name: 'عمر خربين (نسور قاسيون)', team: 'نسور قاسيون', goals: 8 },
      bestPlayer: { name: 'وسام الرفاعي', team: 'فرسان بردى' },
      bestGoalkeeper: { name: 'إبراهيم عالمة الصغير', team: 'نسور قاسيون' },
      bestCoach: { name: 'الكابتن هيثم كرم', team: 'أمل دمشق' },
      fairPlayTeam: 'اتحاد الربوة'
    },
    objections: [
      {
        id: 'obj-1',
        teamName: 'نجوم الميدان',
        fixtureId: 'fix-3',
        reason: 'اعتراض على صحة الهدف الثاني بسبب لمسة يد واضحة',
        status: 'مقبول ومعدل',
        adminDecision: 'بعد مراجعة الفيديو تم تعديل نتيجة الهدف وتثبيت النتيجة 2-1.',
        date: '2026-08-22'
      }
    ],
    reviews: [
      { id: 'r-1', userName: 'حسان اليماني', rating: 5, comment: 'تنظيم مبهر وملاعب على أعلى مستوى وجوائز مشجعة جداً!', date: '2026-08-20' }
    ],
    rating: 4.9,
    status: 'نشط',
    isArchived: false,
    paymentOptions: {
      allowCash: true,
      allowShamCash: true,
      shamCashAccount: 'SHAM-7729-1940'
    },
    createdAt: '2026-07-01'
  },
  {
    id: 'lg-2',
    name: 'بطولة قلعة حلب الرمضانية والصيفية',
    season: '2026',
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1000&q=80',
    governorate: 'حلب',
    city: 'حلب',
    hostingVenue: 'مجمع الشهباء الرياضي',
    capacity: '8v8',
    surface: 'عشب طبيعي',
    system: 'مجموعات',
    organizerName: 'الكابتن حسام السيد',
    organizerPhone: '0933776655',
    entryFee: 400000,
    mainPlayersCount: 8,
    substitutePlayersCount: 6,
    teamsCount: 12,
    termsAndConditions: 'بطولة النخبة لأقوى الفرق في حلب، الالتزام بالروح الرياضية التامة.',
    prizes: {
      cup: true,
      medals: 'كؤوس وميداليات ذهبية ومكافأة مالية',
      cashPrize: 6500000
    },
    standings: [
      { position: 1, teamName: 'أهلي حلب الصيفي', played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 10, goalsAgainst: 2, goalDifference: 8, points: 9 },
      { position: 2, teamName: 'صقور الشهباء', played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 7, goalsAgainst: 4, goalDifference: 3, points: 6 },
      { position: 3, teamName: 'شباب الحمدانية', played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 4, goalsAgainst: 6, goalDifference: -2, points: 3 },
      { position: 4, teamName: 'نجوم سيف الدولة', played: 3, won: 0, drawn: 0, lost: 3, goalsFor: 1, goalsAgainst: 10, goalDifference: -9, points: 0 }
    ],
    fixtures: [
      { id: 'fix-201', round: 'نصف النهائي', teamA: 'أهلي حلب الصيفي', teamB: 'صقور الشهباء', date: '2026-08-30', time: '20:00', venue: 'مجمع الشهباء', isFinished: false }
    ],
    objections: [],
    reviews: [],
    rating: 5.0,
    status: 'نشط',
    isArchived: false,
    paymentOptions: {
      allowCash: true,
      allowShamCash: true,
      shamCashAccount: 'SHAM-5531-9021'
    },
    createdAt: '2026-07-15'
  }
];

export const INITIAL_ACADEMIES: Academy[] = [
  {
    id: 'aca-1',
    name: 'أكاديمية الكابتن للمواهب الكروية',
    image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=800&q=80'
    ],
    governorate: 'دمشق',
    locationDetails: 'المزة - بجانب مجمع الجلاء الرياضي',
    latitude: 33.5012,
    longitude: 36.2541,
    mainCoach: 'الكابتن رضوان الشيخ حسن (مدرب معتمد A)',
    contactPhone: '0944889900',
    monthlyFee: 180000,
    targetAgeGroups: 'من سن 6 إلى 17 سنة (فئات: براعم، أشبال، ناشئين)',
    description: 'الأكاديمية الأولى في دمشق لتطوير مهارات كرة القدم وفق أحدث المناهج الأوروبية، وبإشراف مدربين ولاعبين دوليين سابقين.',
    transportStatus: 'مؤمنة',
    facilities: [
      'ملاعب عشبية مجهزة بالكامل',
      'قاعة لياقة بدنية وتقوية عضلات خاصة بالناشئين',
      'غرف تبديل ملابس ومستحمات فاخرة',
      'باصات مواصلات تغطي جميع مناطق دمشق وريفها',
      'كافتيريا صحية وتغذية رياضية متخصصة',
      'عيادة طبية وفحص دوري للأداء البدني'
    ],
    trainers: [
      {
        id: 'tr-1',
        name: 'الكابتن فادي الحريري',
        specialization: 'تطوير المهارات الفردية والمراوغة',
        experienceYears: 12,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: 'tr-2',
        name: 'الكابتن عماد الشماط',
        specialization: 'مدرب حراس مرمى معتمد',
        experienceYears: 15,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
      }
    ],
    programs: [
      {
        id: 'pr-1',
        title: 'برنامج البراعم التأسيسي (6 - 10 سنوات)',
        durationMonths: 6,
        daysSchedule: 'السبت والإثنين والأربعاء (4:00 عصراً)',
        targetAge: '6-10 سنوات',
        objectives: 'إتقان التمرير، التحكم بالكرة، والتنسيق الحركي واللعب الجماعي.'
      },
      {
        id: 'pr-2',
        title: 'برنامج صناع المستقبل والاحتراف (11 - 16 سنة)',
        durationMonths: 12,
        daysSchedule: 'الأحد والثلاثاء والخميس (5:30 مساءً)',
        targetAge: '11-16 سنة',
        objectives: 'التكتيك العالي، صناعة اللعب، التسديد الدقيق، وتسويق المواهب للأندية السورية والخارجية.'
      }
    ],
    reviews: [
      {
        id: 'rev-a1',
        userName: 'المهندس رامي معلا',
        rating: 5,
        comment: 'ابني تحسن مستواه الرياضي وثقته بنفسه بشكل ملحوظ خلال 3 أشهر فقط.',
        date: '2026-08-10'
      }
    ],
    rating: 4.95,
    paymentOptions: {
      allowCash: true,
      allowShamCash: true,
      shamCashAccount: 'SHAM-7729-1940'
    },
    status: 'نشط',
    createdAt: '2026-01-05'
  },
  {
    id: 'aca-2',
    name: 'أكاديمية الفرسان - اللاذقية',
    image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80'
    ],
    governorate: 'اللاذقية',
    locationDetails: 'مشروع الزراعة - قرب جامعة تشرين',
    latitude: 35.5250,
    longitude: 35.7980,
    mainCoach: 'الكابتن أحمد الصالح',
    contactPhone: '0955667788',
    monthlyFee: 150000,
    targetAgeGroups: 'من 7 إلى 16 سنة',
    description: 'أكاديمية متخصصة في اكتشاف وصقل المواهب الساحلية وربطها بالأندية الممتازة.',
    transportStatus: 'بحاجة مواصلات',
    facilities: ['ملاعب معشبة', 'معدات لياقة حديثة', 'غرف تبديل ومواقف'],
    trainers: [
      {
        id: 'tr-3',
        name: 'الكابتن سامر عيسى',
        specialization: 'اللياقة البدنية والسرعة',
        experienceYears: 8,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
      }
    ],
    programs: [
      {
        id: 'pr-3',
        title: 'الدورة التدريبية الصيفية الشاملة',
        durationMonths: 3,
        daysSchedule: 'السبت والثلاثاء (5:00 عصراً)',
        targetAge: '8-14 سنة',
        objectives: 'تطوير السرعة والتسديد والتمركز الصحيح في الملعب.'
      }
    ],
    reviews: [],
    rating: 4.8,
    paymentOptions: {
      allowCash: true,
      allowShamCash: true,
      shamCashAccount: 'SHAM-1188-4420'
    },
    status: 'نشط',
    createdAt: '2026-03-01'
  }
];

export const INITIAL_FRIENDLY_MATCHES: FriendlyMatch[] = [
  {
    id: 'fm-1',
    hostTeamName: 'فريق صقور دمشق',
    hostTeamImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80',
    opponentTeamName: 'فريق شباب قاسيون',
    opponentTeamImage: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=80',
    venueName: 'ملعب الفيحاء الدولي 1',
    venueLocation: 'دمشق - المزرعة',
    governorate: 'دمشق',
    date: '2026-08-27',
    time: '20:00 - 21:30',
    ageGroup: 'شباب',
    costSplitMethod: 'مناصفة بين الفريقين (50-50)',
    pitchPrice: 120000,
    refereePrice: 35000,
    refereeName: 'الحكم أيهم الباشا',
    organizerName: 'مهند البردان',
    organizerPhone: '0944556677',
    guestJerseyColor: 'أحمر كامل',
    notesAndChallengeRules: 'تحدي ناري قوي 7 ضد 7، نطلب فريق ملتزم بالوقت والأخلاق الرياضية العالية.',
    paymentMethod: 'شام كاش',
    shamCashAccountNumber: 'SHAM-7729-1940',
    status: 'مؤكد',
    statusApprovedByAdmin: true,
    createdAt: '2026-08-23'
  },
  {
    id: 'fm-2',
    hostTeamName: 'كتيبة الشهباء',
    hostTeamImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    venueName: 'مجمع الشهباء الرياضي',
    venueLocation: 'حلب - حلب الجديدة',
    governorate: 'حلب',
    date: '2026-08-29',
    time: '18:30 - 20:00',
    ageGroup: 'رجال',
    costSplitMethod: 'الخاسر يدفع بالكامل',
    pitchPrice: 110000,
    refereePrice: 30000,
    refereeName: 'الحكم عمار كالو',
    organizerName: 'بلال الحلبي',
    organizerPhone: '0933221100',
    notesAndChallengeRules: 'مباراة حماسية 8 ضد 8، الخاسر يدفع كامل أجرة الملعب والحكم!',
    paymentMethod: 'نقداً عند الحضور (كاش)',
    status: 'مفتوح',
    statusApprovedByAdmin: true,
    createdAt: '2026-08-24'
  },
  {
    id: 'fm-3',
    hostTeamName: 'أبطال حمص القديمة',
    hostTeamImage: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=600&q=80',
    venueName: 'ملعب خالد بن الوليد',
    venueLocation: 'حمص - الوعر',
    governorate: 'حمص',
    date: '2026-08-30',
    time: '17:00 - 18:30',
    ageGroup: 'ناشئين',
    costSplitMethod: 'مناصفة بين الفريقين (50-50)',
    pitchPrice: 160000,
    refereePrice: 40000,
    organizerName: 'ياسر السباعي',
    organizerPhone: '0988112233',
    notesAndChallengeRules: 'مباراة ودية تحضيرية لدوري المحافظة، 11 ضد 11.',
    paymentMethod: 'نقداً عند الحضور (كاش)',
    status: 'مفتوح',
    statusApprovedByAdmin: true,
    createdAt: '2026-08-24'
  }
];

export const INITIAL_PLAYER_CVS: PlayerCv[] = [
  {
    id: 'cv-1',
    fullName: 'يوسف رامي الساعاتي',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    governorate: 'دمشق',
    area: 'الميدان - دمشق',
    phoneNumber: '0944001122',
    birthDate: '2006-05-14',
    heightCm: 181,
    weightKg: 73,
    preferredFoot: 'اليمنى',
    position: 'وسط مهاجم',
    seekingStatus: 'باحث عن نادي',
    previousClubs: 'أكاديمية الجيش، شباب الوحدة (فئة الناشئين)',
    achievements: 'هداف بطولة دمشق للناشئين 2024، جائزة أفضل صانع ألعاب في بطولة الشام الصيفية 2025.',
    stats: {
      matchesPlayed: 34,
      goals: 21,
      assists: 17,
      yellowCards: 2,
      redCards: 0,
      interceptions: 45,
      passAccuracyPercentage: 89
    },
    skills: {
      passing: 92,
      shooting: 88,
      stamina: 85,
      defending: 65,
      speed: 89,
      dribbling: 94,
      tacticalIQ: 91,
      leadership: 86
    },
    isBeaconSent: true,
    isPublic: true,
    createdAt: '2026-08-01'
  },
  {
    id: 'cv-2',
    fullName: 'حمزة خالد النجار',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    governorate: 'حلب',
    area: 'السبيل - حلب',
    phoneNumber: '0933554433',
    birthDate: '2004-11-20',
    heightCm: 188,
    weightKg: 82,
    preferredFoot: 'القدمين معاً',
    position: 'مدافع قلب',
    seekingStatus: 'باحث عن مستكشف لاعبين',
    previousClubs: 'أهلي حلب فئات عمرية، نادي الحرية',
    achievements: 'أفضل مدافع في دورة الشهباء 2025، قيادة خط الدفاع لـ 12 مباراة بشباك نظيفة.',
    stats: {
      matchesPlayed: 42,
      goals: 4,
      assists: 3,
      yellowCards: 4,
      redCards: 0,
      interceptions: 98,
      passAccuracyPercentage: 84
    },
    skills: {
      passing: 78,
      shooting: 60,
      stamina: 92,
      defending: 95,
      speed: 82,
      dribbling: 68,
      tacticalIQ: 90,
      leadership: 93
    },
    isBeaconSent: true,
    isPublic: true,
    createdAt: '2026-08-10'
  },
  {
    id: 'cv-3',
    fullName: 'ليث عمار الدرويش',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    governorate: 'اللاذقية',
    area: 'مشروع الصليبة',
    phoneNumber: '0955889911',
    birthDate: '2007-02-18',
    heightCm: 176,
    weightKg: 68,
    preferredFoot: 'اليسرى',
    position: 'جناح',
    seekingStatus: 'باحث عن أكاديمية',
    previousClubs: 'تشرين الصغار، أكاديمية الفرسان',
    achievements: 'سرعة فائقة ومهارة استثنائية في المراوغة الفردية 1 ضد 1 وعكس العرضيات الدقيقة.',
    stats: {
      matchesPlayed: 28,
      goals: 15,
      assists: 19,
      yellowCards: 1,
      redCards: 0,
      interceptions: 22,
      passAccuracyPercentage: 86
    },
    skills: {
      passing: 88,
      shooting: 84,
      stamina: 87,
      defending: 50,
      speed: 96,
      dribbling: 95,
      tacticalIQ: 85,
      leadership: 75
    },
    isBeaconSent: false,
    isPublic: true,
    createdAt: '2026-08-15'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'تأكيد الحجز بنجاح',
    message: 'تمت الموافقة على حجزك في ملعب الفيحاء الدولي 1 برقم مرجعي KAP-2026-98124.',
    type: 'booking',
    timestamp: 'منذ 15 دقيقة',
    isRead: false
  },
  {
    id: 'notif-2',
    title: 'طلب مباراة ودية جديد',
    message: 'فريق صقور دمشق يطلب خوض مباراة ودية وتحدي في دمشق.',
    type: 'match',
    timestamp: 'منذ ساعتين',
    isRead: false
  },
  {
    id: 'notif-3',
    title: 'انطلاق الجولة السادسة من دوري أبطال الشام',
    message: 'تم تحديث جدول المباريات وترتيب الفرق في دوري أبطال الشام الكبرى 2026.',
    type: 'league',
    timestamp: 'أمس',
    isRead: true
  },
  {
    id: 'notif-4',
    title: 'إشعار من إدارة الكابتن',
    message: 'أهلاً بكم في منصة الكابتن الرياضية الأولى في سوريا! استمتعوا بحجز ملاعبكم ومتابعة بطولاتكم بكل سهولة وبدون أي عمولة.',
    type: 'admin',
    timestamp: 'منذ يومين',
    isRead: true
  }
];

export const INITIAL_USER: UserProfile = {
  id: 'usr-current',
  name: 'الكابتن وسيم النوري',
  phone: '0988000111',
  role: 'أدمن',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  governorate: 'دمشق',
  joinDate: '2025-06-15',
  activityCount: {
    bookings: 14,
    matches: 8,
    rating: 4.9
  }
};

export const INITIAL_ADS: AdBanner[] = [
  {
    id: 'ad-1',
    title: 'دوري أبطال الشام الكبرى 2026',
    subtitle: 'جوائز نقدية وكؤوس وميداليات بقيمة 5,000,000 ل.س! سارع بتسجيل فريقك الآن.',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    badge: 'بطولة كبرى',
    linkTab: 'leagues',
    isActive: true
  },
  {
    id: 'ad-2',
    title: 'احجز أفضل ملاعب سوريا عبر الكابتن',
    subtitle: 'ملاعب معشبة وصالات مغلقة في 14 محافظة سورية مع خيارات دفع كاش وشام كاش.',
    imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80',
    badge: 'حجز فوري',
    linkTab: 'playgrounds',
    isActive: true
  },
  {
    id: 'ad-3',
    title: 'أكاديمية الكابتن للمواهب الكروية',
    subtitle: 'برامج تدريبية احترافية ومواصلات مؤمنة بإشراف مدربين دوليين معتمدين.',
    imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80',
    badge: 'تسجيل مفتوح',
    linkTab: 'academies',
    isActive: true
  }
];
