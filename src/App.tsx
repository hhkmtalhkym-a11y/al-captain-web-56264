import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Compass,
  Swords,
  Users,
  MapPin,
  Sparkles,
  Phone,
  Bell,
  MessageSquare,
  Shield,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  Home,
  LogOut,
  Sliders,
  DollarSign,
  User,
  LogIn
} from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './lib/firebase';

import {
  Playground,
  League,
  Academy,
  AcademyRegistration,
  RegistrationStatus,
  PaymentStatus,
  FriendlyMatch,
  MatchStatus,
  PlayerCv,
  Booking,
  AppNotification,
  SyrianGovernorate,
  BookingStatus,
  Objection
} from './types';

import {
  INITIAL_PLAYGROUNDS,
  INITIAL_LEAGUES,
  INITIAL_ACADEMIES,
  INITIAL_FRIENDLY_MATCHES,
  INITIAL_PLAYER_CVS,
  SYRIAN_GOVERNORATES
} from './constants/syrianData';

import {
  loadFromLocalStorage,
  saveToLocalStorage,
  formatSYP,
  openWhatsAppShare
} from './utils/helpers';

// Components
import SplashScreen from './components/SplashScreen';
import AppOfficialLogo from './components/AppOfficialLogo';
import DashboardAuthModal from './components/DashboardAuthModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import LiveChatSupportModal from './components/LiveChatSupportModal';
import HomeView from './components/HomeView';
import PlaygroundsView from './components/PlaygroundsView';
import PlaygroundModal from './components/PlaygroundModal';
import CreatePlaygroundModal from './components/CreatePlaygroundModal';
import BookingWizardModal from './components/BookingWizardModal';
import InteractiveMap from './components/InteractiveMap';
import MatchesView from './components/MatchesView';
import LeagueCard from './components/LeagueCard';
import LeagueModal from './components/LeagueModal';
import CreateLeagueModal from './components/CreateLeagueModal';
import AcademyCard from './components/AcademyCard';
import AcademyModal from './components/AcademyModal';
import CreateAcademyModal from './components/CreateAcademyModal';
import RegisterAcademyModal from './components/RegisterAcademyModal';
import JoinMatchModal from './components/JoinMatchModal';
import PlayerCvCard from './components/PlayerCvCard';
import CreatePlayerCvModal from './components/CreatePlayerCvModal';
import CreateMatchModal from './components/CreateMatchModal';
import ChallengeBookingModal from './components/ChallengeBookingModal';
import MyBookingsView from './components/MyBookingsView';
import ProfileView from './components/ProfileView';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import PermissionDeniedModal from './components/PermissionDeniedModal';
import { canUserCreatePlayground, canUserCreateLeague, canUserCreateAcademy } from './utils/permissions';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initializeDatabase } from './utils/db-initializer';

export type NavigationTab =
  | 'home'
  | 'playgrounds'
  | 'leagues'
  | 'matches'
  | 'academies'
  | 'scouting'
  | 'map'
  | 'bookings'
  | 'profile'
  | 'admin';

function MainApp() {
  // Authentication & Current User from AuthContext
  const { currentUser, updateCurrentUser, isAuthenticated } = useAuth();

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Core Data States with LocalStorage fallback & Firestore sync
  const [playgrounds, setPlaygrounds] = useState<Playground[]>(() =>
    loadFromLocalStorage('kaptan_playgrounds', INITIAL_PLAYGROUNDS)
  );
  const [leagues, setLeagues] = useState<League[]>(() =>
    loadFromLocalStorage('kaptan_leagues', INITIAL_LEAGUES)
  );
  const [academies, setAcademies] = useState<Academy[]>(() =>
    loadFromLocalStorage('kaptan_academies', INITIAL_ACADEMIES)
  );
  const [friendlyMatches, setFriendlyMatches] = useState<FriendlyMatch[]>(() =>
    loadFromLocalStorage('kaptan_matches', INITIAL_FRIENDLY_MATCHES)
  );
  const [playerCvs, setPlayerCvs] = useState<PlayerCv[]>(() =>
    loadFromLocalStorage('kaptan_player_cvs', INITIAL_PLAYER_CVS)
  );
  const [academyRegistrations, setAcademyRegistrations] = useState<AcademyRegistration[]>(() =>
    loadFromLocalStorage('kaptan_academy_registrations', [])
  );
  const [bookings, setBookings] = useState<Booking[]>(() =>
    loadFromLocalStorage('kaptan_bookings', [
      {
        id: 'book-seed-1',
        referenceNumber: 'KAP-2026-94812',
        playgroundId: 'pg-1',
        playgroundName: 'ملعب الفيحاء الكروي',
        governorate: 'دمشق',
        detailedArea: 'الفيحاء - مجمع الملاعب الأولمبية',
        userId: 'usr-1',
        userName: 'كابتن وسيم الرفاعي',
        userPhone: '0945688090',
        selectedDates: ['2026-06-25'],
        timeSlot: '20:00 - 21:30',
        duration: 'ساعة ونصف',
        playerCount: '7v7',
        totalPrice: 165000,
        paymentMethod: 'نقداً عند الحضور (كاش)',
        status: 'مؤكد',
        createdAt: '2026-06-20T12:00:00Z',
        managerPhone: '0945688090'
      }
    ])
  );

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromLocalStorage('kaptan_notifications', [
      {
        id: 'notif-1',
        title: 'أهلاً بك في تطبيق الكابتن!',
        message: 'التطبيق الرياضي الأول لحجز الملاعب والبطولات في سوريا بدون أي عمولة إضافية 0%.',
        date: 'اليوم',
        isRead: false,
        type: 'booking'
      },
      {
        id: 'notif-2',
        title: 'افتتاح التسجيل في دوري صيف الشام 2026',
        message: 'جوائز نقدية وكأس البطولة بانتظاركم. سجل فريقك الآن!',
        date: 'منذ ساعتين',
        isRead: false,
        type: 'league'
      }
    ])
  );

  // Initialize Database Collections & Default Admin on App Boot
  useEffect(() => {
    initializeDatabase().catch((err) => {
      console.warn('Database initialization warning:', err);
    });
  }, []);

  // Firestore Real-time Subscriptions with Fallback
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'playgrounds'), (snapshot) => {
        if (!snapshot.empty) {
          const items: Playground[] = [];
          snapshot.forEach((d) => items.push({ ...d.data(), id: d.id } as Playground));
          setPlaygrounds(items);
          saveToLocalStorage('kaptan_playgrounds', items);
        }
      }, (err) => console.warn('Firestore playgrounds listener notice:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore playgrounds subscription error:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'bookings'), (snapshot) => {
        if (!snapshot.empty) {
          const items: Booking[] = [];
          snapshot.forEach((d) => items.push({ ...d.data(), id: d.id } as Booking));
          setBookings(items);
          saveToLocalStorage('kaptan_bookings', items);
        }
      }, (err) => console.warn('Firestore bookings listener notice:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore bookings subscription error:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'leagues'), (snapshot) => {
        if (!snapshot.empty) {
          const items: League[] = [];
          snapshot.forEach((d) => items.push({ ...d.data(), id: d.id } as League));
          setLeagues(items);
          saveToLocalStorage('kaptan_leagues', items);
        }
      }, (err) => console.warn('Firestore leagues listener notice:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore leagues subscription error:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'academies'), (snapshot) => {
        if (!snapshot.empty) {
          const items: Academy[] = [];
          snapshot.forEach((d) => items.push({ ...d.data(), id: d.id } as Academy));
          setAcademies(items);
          saveToLocalStorage('kaptan_academies', items);
        }
      }, (err) => console.warn('Firestore academies listener notice:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore academies subscription error:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'friendly_matches'), (snapshot) => {
        if (!snapshot.empty) {
          const items: FriendlyMatch[] = [];
          snapshot.forEach((d) => items.push({ ...d.data(), id: d.id } as FriendlyMatch));
          setFriendlyMatches(items);
          saveToLocalStorage('kaptan_matches', items);
        }
      }, (err) => console.warn('Firestore friendly_matches listener notice:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore friendly_matches subscription error:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'player_cards'), (snapshot) => {
        if (!snapshot.empty) {
          const items: PlayerCv[] = [];
          snapshot.forEach((d) => items.push({ ...d.data(), id: d.id } as PlayerCv));
          setPlayerCvs(items);
          saveToLocalStorage('kaptan_player_cvs', items);
        }
      }, (err) => console.warn('Firestore player_cards listener notice:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore player_cards subscription error:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'academy_registrations'), (snapshot) => {
        if (!snapshot.empty) {
          const items: AcademyRegistration[] = [];
          snapshot.forEach((d) => items.push({ ...d.data(), id: d.id } as AcademyRegistration));
          setAcademyRegistrations(items);
          saveToLocalStorage('kaptan_academy_registrations', items);
        }
      }, (err) => console.warn('Firestore academy_registrations listener notice:', err));
      return () => unsub();
    } catch (e) {
      console.warn('Firestore academy_registrations subscription error:', e);
    }
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('الكل');

  // Modals & Drawers States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Creation Modals
  const [isCreatePlaygroundOpen, setIsCreatePlaygroundOpen] = useState(false);
  const [isCreateLeagueOpen, setIsCreateLeagueOpen] = useState(false);
  const [isCreateAcademyOpen, setIsCreateAcademyOpen] = useState(false);
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);
  const [isCreatePlayerCvOpen, setIsCreatePlayerCvOpen] = useState(false);

  // Authentication Guard Modal for Guests
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    promptTitle?: string;
    promptMessage?: string;
    onSuccess?: () => void;
  }>({
    isOpen: false
  });

  const isGuest = !isAuthenticated || !currentUser || currentUser.id === 'guest-user';

  // Guarded action runner: requires login before executing interactive actions
  const requireAuth = (actionDescription: string, callback: () => void) => {
    if (!isGuest) {
      callback();
    } else {
      setAuthModal({
        isOpen: true,
        promptTitle: 'تسجيل الدخول مطلوب',
        promptMessage: `يرجى تسجيل الدخول أو إنشاء حساب كابتن لمتابعة ${actionDescription} والاستفادة من كافة الخدمات بدون عمولة.`,
        onSuccess: () => {
          setAuthModal({ isOpen: false });
          callback();
        }
      });
    }
  };

  // Role Restriction & Permission Modal
  const [permissionModal, setPermissionModal] = useState<{
    isOpen: boolean;
    actionType: 'playground' | 'league' | 'academy' | 'edit_delete' | 'general';
  }>({
    isOpen: false,
    actionType: 'general'
  });

  const handleTriggerCreatePlayground = () => {
    requireAuth('إضافة ملعب جديد', () => {
      if (canUserCreatePlayground(currentUser)) {
        setIsCreatePlaygroundOpen(true);
      } else {
        setPermissionModal({ isOpen: true, actionType: 'playground' });
      }
    });
  };

  const handleTriggerCreateLeague = () => {
    requireAuth('تنظيم بطولة ودوري جديد', () => {
      if (canUserCreateLeague(currentUser)) {
        setIsCreateLeagueOpen(true);
      } else {
        setPermissionModal({ isOpen: true, actionType: 'league' });
      }
    });
  };

  const handleTriggerCreateAcademy = () => {
    requireAuth('تسجيل وإضافة أكاديمية كروية', () => {
      if (canUserCreateAcademy(currentUser)) {
        setIsCreateAcademyOpen(true);
      } else {
        setPermissionModal({ isOpen: true, actionType: 'academy' });
      }
    });
  };

  const handleTriggerCreateMatch = () => {
    requireAuth('إنشاء مباراة وتحدي جديد', () => {
      setIsCreateMatchOpen(true);
    });
  };

  const handleTriggerCreatePlayerCv = () => {
    requireAuth('إنشاء ونشر بطاقة لاعب (CV)', () => {
      setIsCreatePlayerCvOpen(true);
    });
  };

  const handleTriggerBookPlayground = (pg: Playground, initialDate?: string, initialSlot?: string) => {
    requireAuth(`حجز ملعب "${pg.name}"`, () => {
      setBookingWizardInitialDate(initialDate);
      setBookingWizardInitialSlot(initialSlot);
      setBookingWizardPlayground(pg);
    });
  };

  const handleTriggerJoinChallenge = (match: FriendlyMatch) => {
    requireAuth(`الانضمام لمباراة وتحدي "${match.hostTeamName}"`, () => {
      setJoiningMatch(match);
    });
  };

  const handleTriggerRegisterAcademy = (academy: Academy) => {
    requireAuth(`التسجيل في أكاديمية "${academy.name}"`, () => {
      setRegisteringAcademy(academy);
    });
  };

  // Detail Modals
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  const [registeringAcademy, setRegisteringAcademy] = useState<Academy | null>(null);
  const [joiningMatch, setJoiningMatch] = useState<FriendlyMatch | null>(null);
  const [bookingWizardPlayground, setBookingWizardPlayground] = useState<Playground | null>(null);
  const [bookingWizardInitialDate, setBookingWizardInitialDate] = useState<string | undefined>(undefined);
  const [bookingWizardInitialSlot, setBookingWizardInitialSlot] = useState<string | undefined>(undefined);
  const [challengeBookingMatch, setChallengeBookingMatch] = useState<FriendlyMatch | null>(null);

  // Fallback Local Storage Backup
  useEffect(() => {
    saveToLocalStorage('kaptan_playgrounds', playgrounds);
  }, [playgrounds]);

  useEffect(() => {
    saveToLocalStorage('kaptan_leagues', leagues);
  }, [leagues]);

  useEffect(() => {
    saveToLocalStorage('kaptan_academies', academies);
  }, [academies]);

  useEffect(() => {
    saveToLocalStorage('kaptan_academy_registrations', academyRegistrations);
  }, [academyRegistrations]);

  useEffect(() => {
    saveToLocalStorage('kaptan_matches', friendlyMatches);
  }, [friendlyMatches]);

  useEffect(() => {
    saveToLocalStorage('kaptan_player_cvs', playerCvs);
  }, [playerCvs]);

  useEffect(() => {
    saveToLocalStorage('kaptan_bookings', bookings);
  }, [bookings]);

  useEffect(() => {
    saveToLocalStorage('kaptan_notifications', notifications);
  }, [notifications]);

  // Firestore CRUD Handlers for Playgrounds
  const handleCreatePlayground = async (newPg: Playground) => {
    setPlaygrounds((prev) => [newPg, ...prev]);
    try {
      await setDoc(doc(db, 'playgrounds', newPg.id), newPg, { merge: true });
    } catch (e) {
      console.warn('Firestore create playground error:', e);
    }
  };

  const handleDeletePlayground = async (id: string) => {
    setPlaygrounds((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'playgrounds', id));
    } catch (e) {
      console.warn('Firestore delete playground error:', e);
    }
  };

  // Firestore CRUD Handlers for Bookings
  const handleCreateBooking = async (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);

    try {
      await setDoc(doc(db, 'bookings', newBooking.id), newBooking, { merge: true });
    } catch (e) {
      console.warn('Firestore create booking error:', e);
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `تم تأكيد حجز جديد: ${newBooking.playgroundName} ⚽`,
      message: `الرقم المرجعي ${newBooking.referenceNumber} - التاريخ: ${newBooking.selectedDates.join(', ')}`,
      date: 'الآن',
      isRead: false,
      type: 'booking'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleCancelBooking = async (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'ملغي' as BookingStatus } : b))
    );
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'ملغي' });
    } catch (e) {
      console.warn('Firestore cancel booking error:', e);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status });
    } catch (e) {
      console.warn('Firestore update booking status error:', e);
    }
  };

  // Firestore CRUD Handlers for Leagues
  const handleCreateLeague = async (newLg: League) => {
    setLeagues((prev) => [newLg, ...prev]);
    try {
      await setDoc(doc(db, 'leagues', newLg.id), newLg, { merge: true });
    } catch (e) {
      console.warn('Firestore create league error:', e);
    }
  };

  const handleUpdateLeague = async (updatedLg: League) => {
    setLeagues((prev) => prev.map((l) => (l.id === updatedLg.id ? updatedLg : l)));
    if (selectedLeague && selectedLeague.id === updatedLg.id) {
      setSelectedLeague(updatedLg);
    }
    try {
      await setDoc(doc(db, 'leagues', updatedLg.id), updatedLg, { merge: true });
    } catch (e) {
      console.warn('Firestore update league error:', e);
    }
  };

  const handleDeleteLeague = async (id: string) => {
    setLeagues((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteDoc(doc(db, 'leagues', id));
    } catch (e) {
      console.warn('Firestore delete league error:', e);
    }
  };

  const handleDeleteLeagueMatch = async (leagueId: string, fixtureId: string) => {
    const target = leagues.find((l) => l.id === leagueId);
    if (!target) return;
    const updatedFixtures = target.fixtures.filter((f) => f.id !== fixtureId);
    const updatedLeague: League = {
      ...target,
      fixtures: updatedFixtures
    };
    handleUpdateLeague(updatedLeague);
  };

  const handleAdminDecideObjection = async (
    leagueId: string,
    objectionId: string,
    decision: 'مقبول ومعدل' | 'مرفوض' | 'إعادة مباراة',
    notes: string
  ) => {
    const target = leagues.find((l) => l.id === leagueId);
    if (!target) return;
    const updatedObjections = target.objections.map((o) =>
      o.id === objectionId
        ? { ...o, status: decision, adminDecision: notes || `تم ${decision} رسمياً.` }
        : o
    );
    const updatedLeague: League = {
      ...target,
      objections: updatedObjections
    };
    handleUpdateLeague(updatedLeague);
  };

  const handleAddObjection = async (leagueId: string, objectionData: Omit<Objection, 'id' | 'date'>) => {
    const newObjection: Objection = {
      id: `obj-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...objectionData
    };

    const targetLeague = leagues.find((l) => l.id === leagueId);
    const updatedObjections = [...(targetLeague?.objections || []), newObjection];

    setLeagues((prev) =>
      prev.map((l) =>
        l.id === leagueId ? { ...l, objections: updatedObjections } : l
      )
    );

    if (selectedLeague && selectedLeague.id === leagueId) {
      setSelectedLeague((prev) =>
        prev ? { ...prev, objections: updatedObjections } : null
      );
    }

    try {
      await updateDoc(doc(db, 'leagues', leagueId), { objections: updatedObjections });
    } catch (e) {
      console.warn('Firestore add objection error:', e);
    }
  };

  // Firestore CRUD Handlers for Academies
  const handleCreateAcademy = async (newAca: Academy) => {
    setAcademies((prev) => [newAca, ...prev]);
    try {
      await setDoc(doc(db, 'academies', newAca.id), newAca, { merge: true });
    } catch (e) {
      console.warn('Firestore create academy error:', e);
    }
  };

  const handleDeleteAcademy = async (id: string) => {
    setAcademies((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteDoc(doc(db, 'academies', id));
    } catch (e) {
      console.warn('Firestore delete academy error:', e);
    }
  };

  // Firestore CRUD Handlers for Academy Registrations
  const handleCreateAcademyRegistration = async (newReg: AcademyRegistration) => {
    setAcademyRegistrations((prev) => [newReg, ...prev]);
    try {
      await setDoc(doc(db, 'academy_registrations', newReg.id), newReg, { merge: true });
    } catch (e) {
      console.warn('Firestore create academy registration error:', e);
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `تم إرسال طلب تسجيل جديد: ${newReg.studentName} 🎓`,
      message: `تم تقديم طلب تسجيل في ${newReg.academyName} - الفئة: ${newReg.ageGroup}`,
      date: 'الآن',
      isRead: false,
      type: 'academy'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateAcademyRegistrationStatus = async (
    regId: string,
    status: RegistrationStatus,
    rejectionReason?: string
  ) => {
    setAcademyRegistrations((prev) =>
      prev.map((r) =>
        r.id === regId
          ? { ...r, status, rejectionReason: rejectionReason || r.rejectionReason }
          : r
      )
    );
    try {
      await updateDoc(doc(db, 'academy_registrations', regId), {
        status,
        rejectionReason: rejectionReason || null
      });
    } catch (e) {
      console.warn('Firestore update academy registration status error:', e);
    }
  };

  const handleUpdateAcademyRegistrationPaymentStatus = async (
    regId: string,
    paymentStatus: PaymentStatus
  ) => {
    setAcademyRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, paymentStatus } : r))
    );
    try {
      await updateDoc(doc(db, 'academy_registrations', regId), { paymentStatus });
    } catch (e) {
      console.warn('Firestore update academy registration payment status error:', e);
    }
  };

  // Firestore CRUD Handlers for Friendly Matches
  const handleCreateMatch = async (newMatch: FriendlyMatch) => {
    setFriendlyMatches((prev) => [newMatch, ...prev]);
    try {
      await setDoc(doc(db, 'friendly_matches', newMatch.id), newMatch, { merge: true });
    } catch (e) {
      console.warn('Firestore create friendly match error:', e);
    }
  };

  const handleUpdateFriendlyMatchStatus = async (
    matchId: string,
    status: MatchStatus,
    rejectionReason?: string
  ) => {
    setFriendlyMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, status, adminRejectionReason: rejectionReason || m.adminRejectionReason }
          : m
      )
    );
    try {
      await updateDoc(doc(db, 'friendly_matches', matchId), {
        status,
        adminRejectionReason: rejectionReason || null
      });
    } catch (e) {
      console.warn('Firestore update friendly match status error:', e);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    setFriendlyMatches((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteDoc(doc(db, 'friendly_matches', id));
    } catch (e) {
      console.warn('Firestore delete friendly match error:', e);
    }
  };

  const handleJoinChallenge = (match: FriendlyMatch) => {
    setJoiningMatch(match);
  };

  const handleJoinFriendlyMatch = async (
    matchId: string,
    joinData: {
      joinerTeamName: string;
      joinerTeamLogo: string;
      joinerLeaderName: string;
      joinerPhone: string;
      guestJerseyColor?: string;
      preferredPositions?: string;
      paymentMethod: any;
      shamCashAccountNumber?: string;
      notes?: string;
    }
  ) => {
    const targetMatch = friendlyMatches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const updatedMatches = friendlyMatches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            opponentTeamName: joinData.joinerTeamName,
            opponentTeamImage: joinData.joinerTeamLogo,
            guestJerseyColor: joinData.guestJerseyColor,
            notesAndChallengeRules: joinData.notes
              ? `${m.notesAndChallengeRules || ''}\nملاحظات المنضم: ${joinData.notes}`
              : m.notesAndChallengeRules,
            paymentMethod: joinData.paymentMethod,
            shamCashAccountNumber: joinData.shamCashAccountNumber || m.shamCashAccountNumber,
            status: 'مؤكد' as const
          }
        : m
    );
    setFriendlyMatches(updatedMatches);

    try {
      await updateDoc(doc(db, 'friendly_matches', matchId), {
        opponentTeamName: joinData.joinerTeamName,
        opponentTeamImage: joinData.joinerTeamLogo,
        guestJerseyColor: joinData.guestJerseyColor || null,
        notesAndChallengeRules: joinData.notes
          ? `${targetMatch.notesAndChallengeRules || ''}\nملاحظات المنضم: ${joinData.notes}`
          : targetMatch.notesAndChallengeRules || null,
        paymentMethod: joinData.paymentMethod,
        shamCashAccountNumber: joinData.shamCashAccountNumber || targetMatch.shamCashAccountNumber || null,
        status: 'مؤكد'
      });
    } catch (e) {
      console.warn('Firestore join friendly match error:', e);
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'تم الانضمام وتأكيد التحدي بنجاح! ⚔️',
      message: `تم تثبيت مشاركة فريق ${joinData.joinerTeamName} ضد ${targetMatch.hostTeamName} في ${targetMatch.venueName}`,
      date: 'الآن',
      isRead: false,
      type: 'challenge'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleConfirmChallengeBooking = async (challengeData: {
    matchId: string;
    challengerName: string;
    challengerPhone: string;
    challengerJerseyColor: string;
    additionalNotes?: string;
    costSplitMethod: any;
    paymentMethod: any;
    selectedExtras: string[];
    shamCashTxId?: string;
  }) => {
    const targetMatch = friendlyMatches.find((m) => m.id === challengeData.matchId);
    if (!targetMatch) return;

    const updatedMatches = friendlyMatches.map((m) =>
      m.id === challengeData.matchId
        ? {
            ...m,
            opponentTeamName: challengeData.challengerName,
            opponentTeamImage:
              currentUser.image ||
              'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80',
            guestJerseyColor: challengeData.challengerJerseyColor,
            notesAndChallengeRules: challengeData.additionalNotes || m.notesAndChallengeRules,
            costSplitMethod: challengeData.costSplitMethod,
            paymentMethod: challengeData.paymentMethod,
            shamCashAccountNumber: challengeData.shamCashTxId || m.shamCashAccountNumber,
            status: 'مؤكد' as const
          }
        : m
    );
    setFriendlyMatches(updatedMatches);

    try {
      await updateDoc(doc(db, 'friendly_matches', challengeData.matchId), {
        opponentTeamName: challengeData.challengerName,
        opponentTeamImage:
          currentUser.image ||
          'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80',
        guestJerseyColor: challengeData.challengerJerseyColor,
        notesAndChallengeRules: challengeData.additionalNotes || targetMatch.notesAndChallengeRules,
        costSplitMethod: challengeData.costSplitMethod,
        paymentMethod: challengeData.paymentMethod,
        shamCashAccountNumber: challengeData.shamCashTxId || targetMatch.shamCashAccountNumber,
        status: 'مؤكد'
      });
    } catch (e) {
      console.warn('Firestore confirm challenge booking error:', e);
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'تم تأكيد حجز وقبول التحدي بنجاح! ⚔️',
      message: `تم تثبيت مشاركة فريق ${challengeData.challengerName} لمباراة ضد ${targetMatch.hostTeamName} في ${targetMatch.venueName}`,
      date: 'الآن',
      isRead: false,
      type: 'challenge'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Firestore CRUD Handlers for Player Scouting CVs
  const handleCreatePlayerCv = async (newCv: PlayerCv) => {
    setPlayerCvs((prev) => [newCv, ...prev]);
    try {
      await setDoc(doc(db, 'player_cards', newCv.id), newCv, { merge: true });
    } catch (e) {
      console.warn('Firestore create player CV error:', e);
    }
  };

  const handleDeletePlayerCv = async (id: string) => {
    setPlayerCvs((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'player_cards', id));
    } catch (e) {
      console.warn('Firestore delete player CV error:', e);
    }
  };

  const handleTogglePlayerBeacon = async (playerId: string) => {
    const targetPlayer = playerCvs.find((p) => p.id === playerId);
    const newBeaconStatus = !targetPlayer?.isBeaconSent;

    setPlayerCvs((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, isBeaconSent: newBeaconStatus } : p))
    );

    try {
      await updateDoc(doc(db, 'player_cards', playerId), { isBeaconSent: newBeaconStatus });
    } catch (e) {
      console.warn('Firestore toggle beacon error:', e);
    }
  };

  // Admin Login Handler
  const handleAdminLoginSuccess = () => {
    updateCurrentUser({ ...currentUser, isAdmin: true, role: 'admin' });
    setIsAdminLoginOpen(false);
    setActiveTab('admin');

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'تم تسجيل دخول المدير العام بنجاح 🛡️',
      message: 'تم تفعيل صلاحيات الإدارة الكاملة لـ family2016amer@gmail.com',
      date: 'الآن',
      isRead: false,
      type: 'system'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Filtered lists for sub-views
  const filteredLeagues =
    selectedGovernorate === 'الكل'
      ? leagues
      : leagues.filter((l) => l.governorate === selectedGovernorate);

  const filteredAcademies =
    selectedGovernorate === 'الكل'
      ? academies
      : academies.filter((a) => a.governorate === selectedGovernorate);

  const filteredPlayerCvs =
    selectedGovernorate === 'الكل'
      ? playerCvs
      : playerCvs.filter((p) => p.governorate === selectedGovernorate);

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#050707] text-white flex flex-col font-['Cairo'] antialiased selection:bg-[#00FFD2] selection:text-black">

      {/* Top Navbar - Responsive Header: Right: Profile & Notifs | Center: Logo & Name | Left: Governorates & Google Maps */}
      <header className="sticky top-0 z-40 bg-[#050707]/95 backdrop-blur-md border-b border-[#00FFD2]/20">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-4">
          {/* RIGHT SIDE (الطرف اليميني): Profile / Login Button & Notifications Bell */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* User Profile or Guest Login Button */}
            {isGuest ? (
              <button
                id="header-btn-login"
                onClick={() =>
                  setAuthModal({
                    isOpen: true,
                    promptTitle: 'أهلاً بك في تطبيق الكابتن!',
                    promptMessage: 'سجل دخولك الآن لحجز الملاعب بدون عمولة والمشاركة في البطولات والتحديات الكروية.'
                  })
                }
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00FFD2] to-[#00b293] text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#00FFD2]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                title="تسجيل الدخول / إنشاء حساب"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
                <span className="sm:hidden text-[11px]">دخول</span>
              </button>
            ) : (
              <button
                id="header-btn-profile"
                onClick={() => setActiveTab('profile')}
                className={`p-1 sm:pl-2.5 rounded-xl border flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-[#00FFD2] bg-[#00FFD2]/15 shadow-sm'
                    : 'border-white/10 bg-[#0d1211] hover:border-white/20'
                }`}
                title="الملف الشخصي والحجوزات"
              >
                <img
                  src={currentUser.image || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#00FFD2]"
                />
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-white block leading-none">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-[#00FFD2] flex items-center gap-0.5 mt-0.5">
                    {currentUser.isAdmin ? (
                      <span className="text-[#ff2a5f] font-bold flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> المدير العام
                      </span>
                    ) : (
                      'كابتن'
                    )}
                  </span>
                </div>
              </button>
            )}

            {/* Notifications Bell */}
            <button
              id="header-btn-notifications"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl bg-[#0d1211] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="الإشعارات والتنبيهات"
            >
              <Bell className="w-4 h-4 text-[#ff2a5f]" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff2a5f] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse glow-pink">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          </div>

          {/* CENTER (في المنتصف): App Official Logo & App Name */}
          <div
            id="header-btn-logo-home"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer select-none group justify-center"
          >
            <AppOfficialLogo size="md" className="group-hover:scale-105 transition-transform" />
            <div className="text-center sm:text-right">
              <div className="flex items-center gap-1">
                <h1 className="text-sm sm:lg font-black tracking-tight text-white font-['Cairo']">
                  الكابتن <span className="text-[#00FFD2] text-[10px] sm:text-[11px] font-mono font-bold">AL-CAPTAIN</span>
                </h1>
                <span className="hidden lg:inline px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                  0% عمولة
                </span>
              </div>
            </div>
          </div>

          {/* LEFT SIDE (الجهة اليسارية): Google Maps & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Google Maps Interactive Button */}
            <button
              id="header-btn-map"
              onClick={() => setActiveTab('map')}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-[#0d1211] text-emerald-400 hover:text-white border border-emerald-500/30'
              }`}
              title="خرائط Google ومسار الاتجاهات"
            >
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs">الخريطة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6">
        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <HomeView
            playgrounds={playgrounds}
            leagues={leagues}
            academies={academies}
            friendlyMatches={friendlyMatches}
            playerCvs={playerCvs}
            currentUser={currentUser}
            selectedGovernorate={selectedGovernorate}
            onSelectGovernorate={setSelectedGovernorate}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onViewPlayground={(pg) => setSelectedPlayground(pg)}
            onBookPlayground={handleTriggerBookPlayground}
            onViewLeague={(lg) => setSelectedLeague(lg)}
            onJoinChallenge={handleTriggerJoinChallenge}
            onOpenCreatePlayground={handleTriggerCreatePlayground}
            onOpenCreateMatch={handleTriggerCreateMatch}
            onOpenCreateLeague={handleTriggerCreateLeague}
            onOpenCreatePlayerCv={handleTriggerCreatePlayerCv}
          />
        )}

        {/* TAB: PLAYGROUNDS */}
        {activeTab === 'playgrounds' && (
          <PlaygroundsView
            playgrounds={playgrounds}
            currentUser={currentUser}
            selectedGovernorate={selectedGovernorate}
            isAdmin={currentUser.isAdmin}
            onSelectGovernorate={setSelectedGovernorate}
            onViewPlayground={(pg) => setSelectedPlayground(pg)}
            onBookPlayground={handleTriggerBookPlayground}
            onOpenCreateModal={handleTriggerCreatePlayground}
            onDeletePlayground={handleDeletePlayground}
            onOpenProfile={() => setActiveTab('profile')}
          />
        )}

        {/* TAB: LEAGUES */}
        {activeTab === 'leagues' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1211] p-5 rounded-3xl border border-[#00FFD2]/20">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-['Cairo'] flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-[#00FFD2]" />
                  الدوريات والبطولات الكروية
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  شارك فريقك في أضخم بطولات كرة القدم السورية ونافس على الكؤوس والجوائز النقدية.
                </p>
              </div>
              <button
                onClick={handleTriggerCreateLeague}
                className="px-5 py-2.5 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs flex items-center gap-2 shadow-lg glow-primary cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                إنشاء دوري جديد
              </button>
            </div>

            {filteredLeagues.length === 0 ? (
              <div className="text-center py-16 bg-[#0d1211] rounded-3xl border border-white/5 space-y-3">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto" />
                <h3 className="text-base font-bold text-gray-300">لا توجد بطولات حالياً</h3>
                <p className="text-xs text-gray-400">لا توجد بطولات مسجلة في المحافظة المختارة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredLeagues.map((lg) => (
                  <LeagueCard
                    key={lg.id}
                    league={lg}
                    currentUser={currentUser}
                    isAdmin={currentUser.isAdmin}
                    onViewDetails={(l) => setSelectedLeague(l)}
                    onDeleteLeague={handleDeleteLeague}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: FRIENDLY MATCHES & CHALLENGES */}
        {activeTab === 'matches' && (
          <MatchesView
            matches={friendlyMatches}
            currentUser={currentUser}
            selectedGovernorate={selectedGovernorate}
            onSelectGovernorate={setSelectedGovernorate}
            onJoinChallenge={handleTriggerJoinChallenge}
            onOpenCreateMatch={handleTriggerCreateMatch}
            onDeleteMatch={handleDeleteMatch}
          />
        )}

        {/* TAB: ACADEMIES */}
        {activeTab === 'academies' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1211] p-5 rounded-3xl border border-[#00FFD2]/20">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-['Cairo'] flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#00FFD2]" />
                  الأكاديميات والمدارس الكروية
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  أفضل الأكاديميات الرياضية المرخصة لتدريب الفئات العمرية والناشئين في سوريا.
                </p>
              </div>
              <button
                onClick={handleTriggerCreateAcademy}
                className="px-5 py-2.5 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs flex items-center gap-2 shadow-lg glow-primary cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                تسجيل أكاديمية جديدة
              </button>
            </div>

            {filteredAcademies.length === 0 ? (
              <div className="text-center py-16 bg-[#0d1211] rounded-3xl border border-white/5 space-y-3">
                <Users className="w-12 h-12 text-gray-600 mx-auto" />
                <h3 className="text-base font-bold text-gray-300">لا توجد أكاديميات</h3>
                <p className="text-xs text-gray-400">لا توجد أكاديميات معتمدة في المحافظة المختارة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAcademies.map((aca) => (
                  <AcademyCard
                    key={aca.id}
                    academy={aca}
                    currentUser={currentUser}
                    isAdmin={currentUser.isAdmin}
                    onViewDetails={(a) => setSelectedAcademy(a)}
                    onRegister={handleTriggerRegisterAcademy}
                    onDeleteAcademy={handleDeleteAcademy}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: TALENT SCOUTING (PLAYER CV) */}
        {activeTab === 'scouting' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1211] p-5 rounded-3xl border border-[#00FFD2]/20">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-['Cairo'] flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#00FFD2]" />
                  كشاف المواهب وبطاقات اللاعبين (CV)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  سجل بطاقتك الرياضية، استعرض مهاراتك الفنية، ودع الأندية والكشافين يتواصلون معك مباشرة.
                </p>
              </div>
              <button
                onClick={handleTriggerCreatePlayerCv}
                className="px-5 py-2.5 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs flex items-center gap-2 shadow-lg glow-primary cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                إنشاء بطاقة لاعب (CV)
              </button>
            </div>

            {filteredPlayerCvs.length === 0 ? (
              <div className="text-center py-16 bg-[#0d1211] rounded-3xl border border-white/5 space-y-3">
                <Sparkles className="w-12 h-12 text-gray-600 mx-auto" />
                <h3 className="text-base font-bold text-gray-300">لا توجد بطاقات</h3>
                <p className="text-xs text-gray-400">لا توجد بطاقات لاعبين مسجلة في المحافظة المختارة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPlayerCvs.map((pl) => (
                  <PlayerCvCard
                    key={pl.id}
                    player={pl}
                    currentUser={currentUser}
                    isAdmin={currentUser.isAdmin}
                    onToggleBeacon={handleTogglePlayerBeacon}
                    onDeletePlayerCv={handleDeletePlayerCv}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: INTERACTIVE MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4 animate-fadeIn pb-16">
            <InteractiveMap
              playgrounds={playgrounds}
              academies={academies}
              matches={friendlyMatches}
              selectedGovernorate={selectedGovernorate}
              onSelectPlayground={(p) => setSelectedPlayground(p)}
              onSelectAcademy={(a) => setSelectedAcademy(a)}
              onSelectMatch={(m) => handleTriggerJoinChallenge(m)}
            />
          </div>
        )}

        {/* TAB: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <MyBookingsView
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onExplorePlaygrounds={() => setActiveTab('playgrounds')}
          />
        )}

        {/* TAB: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            bookings={bookings}
            onUpdateProfile={(u) => updateCurrentUser(u)}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onOpenSupportModal={() => setIsLiveChatOpen(true)}
            onCancelBooking={handleCancelBooking}
          />
        )}

        {/* TAB: ADMIN DASHBOARD */}
        {activeTab === 'admin' && currentUser.isAdmin && (
          <AdminDashboard
            playgrounds={playgrounds}
            bookings={bookings}
            leagues={leagues}
            academies={academies}
            academyRegistrations={academyRegistrations}
            friendlyMatches={friendlyMatches}
            playerCvs={playerCvs}
            onGoBack={() => setActiveTab('home')}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateAcademyRegistrationStatus={handleUpdateAcademyRegistrationStatus}
            onUpdateAcademyRegistrationPaymentStatus={handleUpdateAcademyRegistrationPaymentStatus}
            onUpdateFriendlyMatchStatus={handleUpdateFriendlyMatchStatus}
            onAddBooking={handleCreateBooking}
            onDeletePlayground={handleDeletePlayground}
            onDeleteLeague={handleDeleteLeague}
            onDeleteMatch={handleDeleteMatch}
            onOpenCreatePlayground={handleTriggerCreatePlayground}
            onOpenCreateLeague={handleTriggerCreateLeague}
            onOpenCreateAcademy={handleTriggerCreateAcademy}
            onOpenCreateMatch={handleTriggerCreateMatch}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050707]/95 backdrop-blur-lg border-t border-[#00FFD2]/20 py-2 px-2 flex items-center justify-around">
        {[
          { id: 'home', label: 'الرئيسية', icon: Home },
          { id: 'playgrounds', label: 'الملاعب', icon: Compass },
          { id: 'leagues', label: 'الدوريات', icon: Trophy },
          { id: 'academies', label: 'الأكاديميات', icon: Users },
          { id: 'profile', label: 'الملف الشخصي', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NavigationTab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-[#00FFD2] scale-105 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-['Cairo'] whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ALL MODALS & DRAWERS */}

      {/* Comprehensive Dashboard & Multi-Role Auth Modal */}
      <DashboardAuthModal
        isOpen={authModal.isOpen || isAdminLoginOpen}
        promptTitle={authModal.promptTitle}
        promptMessage={authModal.promptMessage}
        onClose={() => {
          setAuthModal({ isOpen: false });
          setIsAdminLoginOpen(false);
        }}
        onSuccess={() => {
          if (authModal.onSuccess) {
            authModal.onSuccess();
          }
          if (isAdminLoginOpen) {
            handleAdminLoginSuccess();
          }
          setAuthModal({ isOpen: false });
          setIsAdminLoginOpen(false);
        }}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        notifications={notifications}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllAsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        }
      />

      {/* Live Chat Support */}
      <LiveChatSupportModal
        isOpen={isLiveChatOpen}
        onClose={() => setIsLiveChatOpen(false)}
      />

      {/* Playground Detailed Modal */}
      <PlaygroundModal
        playground={selectedPlayground}
        isOpen={!!selectedPlayground}
        onClose={() => setSelectedPlayground(null)}
        onProceedToBooking={(pg, date, slot) => {
          setSelectedPlayground(null);
          handleTriggerBookPlayground(pg, date, slot);
        }}
        onBookNow={(pg) => {
          setSelectedPlayground(null);
          handleTriggerBookPlayground(pg);
        }}
      />

      {/* Create Playground Modal */}
      <CreatePlaygroundModal
        isOpen={isCreatePlaygroundOpen}
        onClose={() => setIsCreatePlaygroundOpen(false)}
        onSave={handleCreatePlayground}
      />

      {/* 4-Step Booking Wizard Modal */}
      <BookingWizardModal
        isOpen={!!bookingWizardPlayground}
        playground={bookingWizardPlayground}
        initialDate={bookingWizardInitialDate}
        initialSlot={bookingWizardInitialSlot}
        existingBookings={bookings}
        currentUser={currentUser}
        onClose={() => {
          setBookingWizardPlayground(null);
          setBookingWizardInitialDate(undefined);
          setBookingWizardInitialSlot(undefined);
        }}
        onConfirmBooking={handleCreateBooking}
      />

      {/* Challenge Booking & Acceptance Flow Modal */}
      <ChallengeBookingModal
        isOpen={!!challengeBookingMatch}
        match={challengeBookingMatch}
        currentUser={currentUser}
        onClose={() => setChallengeBookingMatch(null)}
        onConfirmChallenge={handleConfirmChallengeBooking}
      />

      {/* League Detailed Modal */}
      <LeagueModal
        league={selectedLeague}
        isOpen={!!selectedLeague}
        currentUser={currentUser}
        onClose={() => setSelectedLeague(null)}
        onUpdateLeague={handleUpdateLeague}
        onAddObjection={handleAddObjection}
        onAdminDecideObjection={handleAdminDecideObjection}
        onDeleteMatch={handleDeleteLeagueMatch}
      />

      {/* Create League Modal */}
      <CreateLeagueModal
        isOpen={isCreateLeagueOpen}
        currentUser={currentUser}
        onClose={() => setIsCreateLeagueOpen(false)}
        onSave={handleCreateLeague}
      />

      {/* Academy Detailed Modal */}
      <AcademyModal
        academy={selectedAcademy}
        isOpen={!!selectedAcademy}
        onClose={() => setSelectedAcademy(null)}
        onRegister={(aca) => {
          setSelectedAcademy(null);
          handleTriggerRegisterAcademy(aca);
        }}
      />

      {/* Register Student in Academy Modal */}
      <RegisterAcademyModal
        isOpen={!!registeringAcademy}
        academy={registeringAcademy}
        currentUser={currentUser}
        onClose={() => setRegisteringAcademy(null)}
        onConfirmRegistration={handleCreateAcademyRegistration}
      />

      {/* Join Friendly Match Modal */}
      <JoinMatchModal
        isOpen={!!joiningMatch}
        match={joiningMatch}
        currentUser={currentUser}
        onClose={() => setJoiningMatch(null)}
        onConfirmJoin={(joinData) =>
          handleJoinFriendlyMatch(joinData.matchId, {
            joinerTeamName: joinData.joinerName,
            joinerTeamLogo:
              joinData.joinerTeamLogo ||
              currentUser.image ||
              'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80',
            joinerLeaderName: joinData.joinerName,
            joinerPhone: joinData.joinerPhone,
            guestJerseyColor: joinData.guestJerseyColor,
            preferredPositions: joinData.preferredPosition,
            paymentMethod: joinData.paymentMethod,
            shamCashAccountNumber: joinData.shamCashAccountNumber,
            notes: joinData.additionalNotes
          })
        }
      />

      {/* Create Academy Modal */}
      <CreateAcademyModal
        isOpen={isCreateAcademyOpen}
        onClose={() => setIsCreateAcademyOpen(false)}
        onSave={handleCreateAcademy}
      />

      {/* Create Match Modal */}
      <CreateMatchModal
        isOpen={isCreateMatchOpen}
        onClose={() => setIsCreateMatchOpen(false)}
        onSave={handleCreateMatch}
      />

      {/* Create Player Scouting CV Modal */}
      <CreatePlayerCvModal
        isOpen={isCreatePlayerCvOpen}
        onClose={() => setIsCreatePlayerCvOpen(false)}
        onSave={handleCreatePlayerCv}
      />

      {/* Role-Based Access Control Modal */}
      <PermissionDeniedModal
        isOpen={permissionModal.isOpen}
        onClose={() => setPermissionModal({ ...permissionModal, isOpen: false })}
        actionType={permissionModal.actionType}
        currentUser={currentUser}
        onOpenLogin={() => {
          setPermissionModal({ ...permissionModal, isOpen: false });
          setActiveTab('profile');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
