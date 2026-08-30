import React, { useState, useEffect } from 'react';
import {
  Shield,
  BarChart3,
  Calendar,
  Trophy,
  Users,
  Swords,
  DollarSign,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  FileSpreadsheet,
  FileText,
  FileDown,
  Award,
  Archive,
  AlertTriangle,
  Settings,
  Lock,
  Unlock,
  Eye,
  PieChart,
  TrendingUp,
  Activity,
  ArrowRight,
  Edit2,
  Sliders,
  Sparkles,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  UserPlus,
  X
} from 'lucide-react';
import {
  Playground,
  Booking,
  League,
  Academy,
  AcademyRegistration,
  RegistrationStatus,
  PaymentStatus,
  FriendlyMatch,
  MatchStatus,
  PlayerCv,
  BookingStatus,
  SyrianGovernorate,
  ObjectionCase,
  UserProfile
} from '../types';

import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import {
  formatSYP,
  exportBookingsCsv,
  exportLeaguePdf,
  exportToExcel,
  exportMasterAdminReportPdf,
  exportMasterAdminReportExcel,
  openWhatsAppShare,
  loadFromLocalStorage,
  saveToLocalStorage,
  readImageAsBase64
} from '../utils/helpers';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import InteractiveCalendar from './InteractiveCalendar';
import { SlideItem, INITIAL_SLIDES } from './HeroBannerSlider';

interface AdminDashboardProps {
  playgrounds: Playground[];
  bookings: Booking[];
  leagues: League[];
  academies: Academy[];
  academyRegistrations?: AcademyRegistration[];
  friendlyMatches: FriendlyMatch[];
  playerCvs: PlayerCv[];
  users?: UserProfile[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;

  onUpdateAcademyRegistrationStatus?: (regId: string, status: RegistrationStatus, rejectionReason?: string) => void;
  onUpdateAcademyRegistrationPaymentStatus?: (regId: string, paymentStatus: PaymentStatus) => void;
  onUpdateFriendlyMatchStatus?: (matchId: string, status: MatchStatus, rejectionReason?: string) => void;
  onAddBooking?: (newBooking: Booking) => void;
  onDeletePlayground: (id: string) => void;
  onDeleteLeague: (id: string) => void;
  onDeleteMatch: (id: string) => void;
  onOpenCreatePlayground: () => void;
  onOpenCreateLeague: () => void;
  onOpenCreateAcademy: () => void;
  onOpenCreateMatch: () => void;
  onGoBack?: () => void;
}

export type AdminUserRole =
  | 'user'
  | 'announcer'
  | 'announcer_pitch'
  | 'announcer_academy'
  | 'league_manager'
  | 'admin';

export interface AuditLogItem {
  id: string;
  type: 'creation' | 'deletion' | 'update' | 'booking' | 'user_role' | 'security' | 'slider';
  title: string;
  description: string;
  performedBy: string;
  targetId?: string;
  timestamp: string;
}

type AdminTab =
  | 'overview'
  | 'slider'
  | 'global_management'
  | 'users'
  | 'charts'
  | 'calendar'
  | 'bookings'
  | 'playgrounds'
  | 'leagues'
  | 'matches'
  | 'academies'
  | 'scouting'
  | 'objections'
  | 'settings';

export default function AdminDashboard({
  playgrounds,
  bookings,
  leagues,
  academies,
  academyRegistrations = [],
  friendlyMatches,
  playerCvs,
  users = [],
  onUpdateBookingStatus,
  onUpdateAcademyRegistrationStatus,
  onUpdateAcademyRegistrationPaymentStatus,
  onUpdateFriendlyMatchStatus,
  onAddBooking,
  onDeletePlayground,
  onDeleteLeague,
  onDeleteMatch,
  onOpenCreatePlayground,
  onOpenCreateLeague,
  onOpenCreateAcademy,
  onOpenCreateMatch,
  onGoBack
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedGov, setSelectedGov] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditFilter, setAuditFilter] = useState<string>('الكل');
  const [shamCashAdminAccount, setShamCashAdminAccount] = useState('SHAM-8800-0111');
  const [isSavedSettings, setIsSavedSettings] = useState(false);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  const [rejectionModalData, setRejectionModalData] = useState<{
    id: string;
    type: 'academy_registration' | 'friendly_match';
    name: string;
    phone: string;
  } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Academy sub-tab: 'academies_list' | 'registrations_list'
  const [academySubTab, setAcademySubTab] = useState<'registrations' | 'academies'>('registrations');
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState<string>('الكل');
  const [matchStatusFilter, setMatchStatusFilter] = useState<string>('الكل');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'log-1',
      type: 'security',
      title: 'تهيئة النظام وقاعدة البيانات',
      description: 'تم التحقق من تشغيل مجموعات Firestore وتثبيت حساب المدير العام المعتمد.',
      performedBy: 'نظام الكابتن الآلي',
      timestamp: 'اليوم، 12:00 م'
    },
    {
      id: 'log-2',
      type: 'creation',
      title: 'إنشاء ملعب جديد: الفيحاء الكروي',
      description: 'إضافة ملعب بمحافظة دمشق مع تحديد الإحداثيات الجغرافية وساعات العمل.',
      performedBy: 'كابتن عامر (Admin)',
      targetId: 'pg-1',
      timestamp: 'اليوم، 11:30 ص'
    },
    {
      id: 'log-3',
      type: 'booking',
      title: 'حجز مؤكد: KAP-2026-94812',
      description: 'تم تسجيل حجز جديد في ملعب الفيحاء الكروي بقيمة 165,000 ل.س نقداً.',
      performedBy: 'كابتن وسيم الرفاعي',
      targetId: 'book-seed-1',
      timestamp: 'اليوم، 10:15 ص'
    },
    {
      id: 'log-4',
      type: 'creation',
      title: 'إطلاق بطولة دمشق الكبرى للصالات 2026',
      description: 'فتح باب التسجيل لـ 16 فريقاً برسم اشتراك 250,000 ل.س وجوائز مالية.',
      performedBy: 'كابتن عامر (Admin)',
      targetId: 'lg-1',
      timestamp: 'أمس، 08:40 م'
    },
    {
      id: 'log-5',
      type: 'user_role',
      title: 'ترقية صلاحيات مستخدم',
      description: 'تم تعيين كابتن المنظم كـ منظم دوريات معتمد (league_manager).',
      performedBy: 'كابتن عامر (Admin)',
      targetId: 'u-2',
      timestamp: 'منذ يومين'
    }
  ]);

  // Users management list with roles - synchronized with Firestore users & LocalStorage
  const [usersList, setUsersList] = useState<Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    governorate: string;
    role: AdminUserRole;
    isBanned: boolean;
    bookingsCount: number;
  }>>(() => {
    const baseInitial = [
      {
        id: 'u-1',
        name: 'كابتن عامر (المدير العام)',
        phone: '0988000111',
        email: 'admin@kaptan-app.sy',
        governorate: 'دمشق',
        role: 'admin' as AdminUserRole,
        isBanned: false,
        bookingsCount: 28
      },
      {
        id: 'u-2',
        name: 'كابتن حسام (منظم بطولات)',
        phone: '0933112233',
        email: 'organizer@kaptan.sy',
        governorate: 'دمشق',
        role: 'league_manager' as AdminUserRole,
        isBanned: false,
        bookingsCount: 14
      },
      {
        id: 'u-3',
        name: 'كابتن مجد الشامي',
        phone: '0988776655',
        email: 'majd@kaptan.sy',
        governorate: 'حلب',
        role: 'announcer' as AdminUserRole,
        isBanned: false,
        bookingsCount: 9
      },
      {
        id: 'u-4',
        name: 'كابتن وسيم حمصي',
        phone: '0955443322',
        email: 'waseem@kaptan.sy',
        governorate: 'حمص',
        role: 'user' as AdminUserRole,
        isBanned: false,
        bookingsCount: 6
      },
      {
        id: 'u-5',
        name: 'كابتن تيم اللاذقية',
        phone: '0944118833',
        email: 'taym@kaptan.sy',
        governorate: 'اللاذقية',
        role: 'user' as AdminUserRole,
        isBanned: false,
        bookingsCount: 11
      }
    ];

    if (users && users.length > 0) {
      const mergedMap = new Map<string, any>();
      baseInitial.forEach((u) => mergedMap.set(u.id, u));
      users.forEach((u) => {
        mergedMap.set(u.id, {
          id: u.id,
          name: u.name || 'كابتن المنصة',
          phone: u.phone || '—',
          email: u.email || '—',
          governorate: u.governorate || 'دمشق',
          role: (u.isAdmin ? 'admin' : (u.role as AdminUserRole) || 'user') as AdminUserRole,
          isBanned: !!(u as any).isBanned,
          bookingsCount: bookings.filter((b) => b.userId === u.id).length
        });
      });
      return Array.from(mergedMap.values());
    }

    return baseInitial;
  });

  // Sync usersList whenever Firestore users array changes
  useEffect(() => {
    if (users && users.length > 0) {
      setUsersList((prev) => {
        const mergedMap = new Map<string, any>();
        prev.forEach((u) => mergedMap.set(u.id, u));
        users.forEach((u) => {
          mergedMap.set(u.id, {
            id: u.id,
            name: u.name || 'كابتن المنصة',
            phone: u.phone || '—',
            email: u.email || '—',
            governorate: u.governorate || 'دمشق',
            role: (u.isAdmin ? 'admin' : (u.role as AdminUserRole) || 'user') as AdminUserRole,
            isBanned: !!(u as any).isBanned,
            bookingsCount: bookings.filter((b) => b.userId === u.id).length
          });
        });
        return Array.from(mergedMap.values());
      });
    }
  }, [users, bookings]);


  // Role filter in users tab
  const [userRoleFilter, setUserRoleFilter] = useState<string>('الكل');

  // New User Creation Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserGov, setNewUserGov] = useState('دمشق');
  const [newUserRole, setNewUserRole] = useState<AdminUserRole>('user');

  // Slider Management State
  const [slidesList, setSlidesList] = useState<SlideItem[]>(() => {
    const saved = loadFromLocalStorage('kaptan_hero_slides', null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return INITIAL_SLIDES;
  });

  const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [isAddingNewSlide, setIsAddingNewSlide] = useState(false);
  const [slideFormData, setSlideFormData] = useState<Partial<SlideItem>>({
    badge: '🔥 عرض مميز',
    badgeColor: 'bg-[#00FFD2] text-black border-[#00FFD2]',
    title: '',
    subtitle: '',
    actionText: 'استكشف الآن',
    image: '',
    tabTarget: 'playgrounds',
    highlightText: ''
  });

  const saveSlides = (updated: SlideItem[]) => {
    setSlidesList(updated);
    saveToLocalStorage('kaptan_hero_slides', updated);
  };

  const handleOpenAddSlide = () => {
    setIsAddingNewSlide(true);
    setEditingSlide(null);
    setSlideFormData({
      badge: '🔥 عرض مميز',
      badgeColor: 'bg-[#00FFD2] text-black border-[#00FFD2]',
      title: '',
      subtitle: '',
      actionText: 'استكشف الآن',
      image: '',
      tabTarget: 'playgrounds',
      highlightText: ''
    });
    setIsSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: SlideItem) => {
    setIsAddingNewSlide(false);
    setEditingSlide(slide);
    setSlideFormData({ ...slide });
    setIsSlideModalOpen(true);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (slidesList.length <= 1) {
      alert('يجب أن يحتوي السلايدر على شريحة واحدة على الأقل.');
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذه الشريحة من السلايدر الإعلاني؟')) {
      const updated = slidesList.filter((s) => s.id !== slideId);
      saveSlides(updated);

      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        type: 'slider',
        title: 'حذف شريحة من السلايدر الإعلاني',
        description: `تم حذف الشريحة ID: ${slideId} بواسطة الأدمن.`,
        performedBy: 'كابتن عامر (Admin)',
        timestamp: 'الآن'
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slidesList.length) return;
    const updated = [...slidesList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    saveSlides(updated);
  };

  const handleSaveSlideForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideFormData.title || !slideFormData.image) {
      alert('يرجى كتابة العنوان وإرفاق صورة أو رابط صورة.');
      return;
    }

    if (isAddingNewSlide) {
      const newSlide: SlideItem = {
        id: `slide-${Date.now()}`,
        badge: slideFormData.badge || '⭐ إعلان جديد',
        badgeColor: slideFormData.badgeColor || 'bg-[#00FFD2] text-black border-[#00FFD2]',
        title: slideFormData.title,
        subtitle: slideFormData.subtitle || '',
        actionText: slideFormData.actionText || 'استكشف الآن',
        image: slideFormData.image,
        tabTarget: slideFormData.tabTarget || 'playgrounds',
        highlightText: slideFormData.highlightText || ''
      };
      const updated = [newSlide, ...slidesList];
      saveSlides(updated);

      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        type: 'slider',
        title: `إضافة شريحة جديدة للسلايدر: ${newSlide.title}`,
        description: 'تمت إضافة شريحة إعلانية جديدة للسلايدر وحفظها بنجاح.',
        performedBy: 'كابتن عامر (Admin)',
        timestamp: 'الآن'
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    } else if (editingSlide) {
      const updated = slidesList.map((s) =>
        s.id === editingSlide.id
          ? {
              ...s,
              badge: slideFormData.badge || s.badge,
              badgeColor: slideFormData.badgeColor || s.badgeColor,
              title: slideFormData.title || s.title,
              subtitle: slideFormData.subtitle || s.subtitle,
              actionText: slideFormData.actionText || s.actionText,
              image: slideFormData.image || s.image,
              tabTarget: slideFormData.tabTarget || s.tabTarget,
              highlightText: slideFormData.highlightText
            }
          : s
      );
      saveSlides(updated);

      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        type: 'slider',
        title: `تعديل شريحة في السلايدر: ${slideFormData.title}`,
        description: `تم تحديث بيانات وصورة الشريحة ID: ${editingSlide.id}`,
        performedBy: 'كابتن عامر (Admin)',
        timestamp: 'الآن'
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }

    setIsSlideModalOpen(false);
  };

  const handleResetSlides = () => {
    if (confirm('هل أنت متأكد من استعادة الشرائح الافتراضية للسلايدر؟')) {
      saveSlides(INITIAL_SLIDES);
      alert('تمت استعادة الشرائح الافتراضية بنجاح.');
    }
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim()) {
      alert('يرجى إدخال اسم المستخدم ورقم الجوال.');
      return;
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: newUserName.trim(),
      phone: newUserPhone.trim(),
      email: newUserEmail.trim() || `${newUserPhone.trim()}@kaptan.sy`,
      governorate: newUserGov,
      role: newUserRole,
      isBanned: false,
      bookingsCount: 0
    };

    setUsersList((prev) => [newUser, ...prev]);
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserPhone('');
    setNewUserEmail('');

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      type: 'user_role',
      title: `إضافة مستخدم وتعيين رتبته: ${newUser.name}`,
      description: `تم تسجيل المستخدم برقم ${newUser.phone} وتعيين دوره كـ [${newUser.role}].`,
      performedBy: 'كابتن عامر (Admin)',
      targetId: newUser.id,
      timestamp: 'الآن'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    alert(`تمت إضافة المستخدم "${newUser.name}" وتعيين دوره بنجاح.`);
  };

  const handleChangeUserRole = (userId: string, newRole: AdminUserRole) => {
    const targetUser = usersList.find((u) => u.id === userId);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    const roleNameMap: Record<AdminUserRole, string> = {
      user: 'مستخدم عادي / لاعب (User)',
      announcer: 'معلن ملاعب / منشآت رياضية (Announcer)',
      announcer_pitch: 'معلن ملاعب كرة قدم (Pitch Advertiser)',
      announcer_academy: 'معلن أكاديميات ومدربين (Academy Advertiser)',
      league_manager: 'منظم دوريات وبطولات (League Manager)',
      admin: 'مدير نظام عام (Super Admin)'
    };

    // Log audit
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      type: 'user_role',
      title: `تعديل رتبة المستخدم: ${targetUser?.name || userId}`,
      description: `تم تغيير الصلاحية إلى [${roleNameMap[newRole] || newRole}] بنجاح.`,
      performedBy: 'كابتن عامر (Admin)',
      targetId: userId,
      timestamp: 'الآن'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteUserAccount = (userId: string) => {
    const targetUser = usersList.find((u) => u.id === userId);
    if (targetUser?.role === 'admin' && (targetUser.id === 'u-1' || targetUser.role === 'admin')) {
      alert('لا يمكن حذف حساب المدير العام الأساسي للنظام.');
      return;
    }

    if (!confirm(`هل أنت متأكد من رغبتك في حذف حساب "${targetUser?.name}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }

    setUsersList((prev) => prev.filter((u) => u.id !== userId));

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      type: 'deletion',
      title: `حذف حساب مستخدم: ${targetUser?.name}`,
      description: `تم حذف حساب ${targetUser?.phone} ومسح كافة ارتباطاته من قبل الإدارة.`,
      performedBy: 'كابتن عامر (Admin)',
      targetId: userId,
      timestamp: 'الآن'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Mock Objections list
  const [objectionsList, setObjectionsList] = useState<ObjectionCase[]>([
    {
      id: 'obj-1',
      leagueId: 'lg-1',
      leagueName: 'بطولة دمشق الكبرى للصالات 2026',
      matchId: 'm-1',
      submittingTeam: 'فريق الفرسان',
      targetTeam: 'فريق النسور',
      reason: 'مشاركة لاعب غير مقيد في كشوفات الفريق الرسمية خلال الشوط الثاني.',
      evidenceDetails: 'صورة هوية اللاعب ومطابقتها مع كشف الاتحاد المحلي.',
      depositFeePaid: 50000,
      status: 'قيد المراجعة',
      createdAt: '2026-06-18'
    },
    {
      id: 'obj-2',
      leagueId: 'lg-2',
      leagueName: 'دوري أبطال حلب الصيفي',
      matchId: 'm-2',
      submittingTeam: 'فريق الشهباء',
      targetTeam: 'فريق القلعة',
      reason: 'خطأ تحكيمي فادح في احتساب ركلة جزاء في الدقيقة 94 بعد انتهاء الوقت بدل الضائع.',
      evidenceDetails: 'تسجيل الفيديو المعتمد للمباراة.',
      depositFeePaid: 50000,
      status: 'قيد المراجعة',
      createdAt: '2026-06-20'
    }
  ]);

  // Statistics
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.status !== 'ملغي' ? b.totalPrice : 0),
    0
  );
  const confirmedBookingsCount = bookings.filter((b) => b.status === 'مؤكد').length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'قيد الانتظار').length;

  const handleResolveObjection = (
    id: string,
    decision: 'قبول وتعديل النتيجة' | 'رفض الاعتراض' | 'إعادة جدولة المباراة',
    notes: string
  ) => {
    setObjectionsList((prev) =>
      prev.map((obj) =>
        obj.id === id
          ? {
              ...obj,
              status: decision === 'رفض الاعتراض' ? 'مرفوض' : 'مقبول',
              adminDecisionNotes: notes
            }
          : obj
      )
    );
  };

  const handleToggleBanUser = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: !u.isBanned } : u))
    );
  };

  const handleExportAllData = () => {
    exportMasterAdminReportExcel(bookings, leagues, auditLogs, usersList, playgrounds);
  };

  return (
    <div id="admin-dashboard-view" className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="bg-[#0d1211] border-2 border-[#ff2a5f]/40 rounded-3xl p-6 sm:p-8 glow-pink relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff2a5f]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {onGoBack && (
                <button
                  id="btn-admin-top-back"
                  onClick={onGoBack}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-[#00FFD2]/20 text-white hover:text-[#00FFD2] border border-white/20 hover:border-[#00FFD2]/40 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="العودة للخلف"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#00FFD2]" />
                  <span>رجوع</span>
                </button>
              )}
              <span className="px-3 py-1 rounded-full bg-[#ff2a5f] text-white font-black text-xs">
                لوحة الإدارة المركزية
              </span>
              <span className="text-xs text-gray-400 font-mono">
                صلاحيات الإدارة العليا والتحكم الشامل
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Cairo']">
              لوحة التحكم والسيطرة الشاملة - تطبيق الكابتن
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              إدارة الملاعب والحجوزات والدوريات والسلايدر والاعتراضات وتعيين أدوار المستخدمين في كافة المحافظات (0% عمولة)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportMasterAdminReportPdf(bookings, leagues, auditLogs, usersList, 'bilingual')}
              className="px-4 py-2.5 rounded-xl bg-[#ff2a5f]/15 hover:bg-[#ff2a5f]/25 text-[#ff2a5f] border border-[#ff2a5f]/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              title="تصدير تقرير إداري شامل بصيغة PDF باللغتين العربية والإنجليزية"
            >
              <FileDown className="w-4 h-4" />
              تصدير التقرير PDF (عربي/EN)
            </button>

            <button
              onClick={handleExportAllData}
              className="px-4 py-2.5 rounded-xl bg-[#050707] hover:bg-white/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تصدير بيانات المنصة كملف Excel شامل ومتعدد الجداول"
            >
              <FileSpreadsheet className="w-4 h-4" />
              تصدير التقرير Excel
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">إجمالي الملاعب</span>
          <strong className="text-xl font-bold text-[#00FFD2] font-mono">{playgrounds.length}</strong>
        </div>

        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">الحجوزات المؤكدة</span>
          <strong className="text-xl font-bold text-emerald-400 font-mono">{confirmedBookingsCount}</strong>
        </div>

        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">طلبات بالانتظار</span>
          <strong className="text-xl font-bold text-amber-400 font-mono">{pendingBookingsCount}</strong>
        </div>

        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">البطولات والدوريات</span>
          <strong className="text-xl font-bold text-amber-300 font-mono">{leagues.length}</strong>
        </div>

        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">شرائح السلايدر</span>
          <strong className="text-xl font-bold text-[#00FFD2] font-mono">{slidesList.length}</strong>
        </div>

        <div className="bg-[#0d1211] border border-white/10 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 block mb-1">كشاف المواهب</span>
          <strong className="text-xl font-bold text-blue-400 font-mono">{playerCvs.length}</strong>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#0d1211] p-2 rounded-2xl border border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {[
          { id: 'overview', label: 'نظرة عامة والتقارير', icon: BarChart3 },
          { id: 'slider', label: `لوحة تحكم السلايدر (${slidesList.length})`, icon: Sliders },
          { id: 'users', label: `إدارة وتعيين الأدوار (${usersList.length})`, icon: Users },
          { id: 'global_management', label: `الإدارة الشاملة والتدقيق (${auditLogs.length})`, icon: Activity },
          { id: 'charts', label: 'الرسوم البيانية والإحصائيات', icon: PieChart },
          { id: 'calendar', label: 'التقويم التفاعلي للحجوزات', icon: Calendar },
          { id: 'bookings', label: `إدارة الحجوزات (${bookings.length})`, icon: Calendar },
          { id: 'playgrounds', label: `الملاعب (${playgrounds.length})`, icon: Shield },
          { id: 'leagues', label: `الدوريات (${leagues.length})`, icon: Trophy },
          { id: 'matches', label: `المباريات (${friendlyMatches.length})`, icon: Swords },
          { id: 'academies', label: `الأكاديميات (${academies.length})`, icon: Users },
          { id: 'scouting', label: `كشاف المواهب (${playerCvs.length})`, icon: Award },
          { id: 'objections', label: `الاعتراضات (${objectionsList.length})`, icon: AlertTriangle },
          { id: 'settings', label: 'إعدادات النظام وشام كاش', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#ff2a5f] text-white shadow-lg glow-pink'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Revenue Breakdown */}
          <div className="bg-[#0d1211] p-6 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-gray-400">إجمالي قيمة التداولات والحجوزات المسجلة:</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">{formatSYP(totalRevenue)}</h3>
              <p className="text-xs text-emerald-400 font-semibold">0% عمولة للمنصة - دفع كاش أو شام كاش مباشر</p>
            </div>

            <div className="space-y-1 md:border-r md:border-white/10 md:pr-6">
              <span className="text-xs text-gray-400">تغطية المحافظات السورية:</span>
              <h3 className="text-xl font-bold text-white">14 محافظة كاملة</h3>
              <p className="text-xs text-gray-400">دمشق، ريف دمشق، حلب، حمص، حماة، اللاذقية، طرطوس، إدلب، الحسكة، دير الزور، الرقة، درعا، السويداء، القنيطرة.</p>
            </div>

            <div className="space-y-1 md:border-r md:border-white/10 md:pr-6 flex flex-col justify-center">
              <span className="text-xs text-gray-400">حساب شام كاش المعتمد للمنصة:</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  {shamCashAdminAccount}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">0988000111</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#050707] p-5 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-white font-['Cairo']">إضافة سريعة عبر لوحة الإدارة:</h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenCreatePlayground}
                className="px-4 py-2 rounded-xl bg-[#00FFD2] text-black text-xs font-bold flex items-center gap-1 glow-primary"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة ملعب
              </button>
              <button
                onClick={onOpenCreateLeague}
                className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة دوري
              </button>
              <button
                onClick={onOpenCreateAcademy}
                className="px-4 py-2 rounded-xl bg-purple-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة أكاديمية
              </button>
              <button
                onClick={onOpenCreateMatch}
                className="px-4 py-2 rounded-xl bg-[#ff2a5f] text-white text-xs font-bold flex items-center gap-1 glow-pink"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة مباراة ودية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Slider Management (Super Admin Only) */}
      {activeTab === 'slider' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Admin Slider Header Banner */}
          <div className="bg-[#0d1211] border-2 border-[#00FFD2]/40 rounded-3xl p-6 glow-primary relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-1 rounded-full bg-[#00FFD2] text-black font-black text-xs">
                    خاص بالأدمن فقط
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    لوحة السلايدر الإعلاني الرئيسي
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Cairo'] flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-[#00FFD2]" />
                  لوحة تحكم السلايدر (أدمن)
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
                  يمكنك إضافة وتعديل وحذف أي شريحة وصورة. لا يمكن للمستخدمين أو منظمي الدوريات أو المعلنين عن ملاعب أو أكاديميات التحكم بها.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleResetSlides}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  استعادة الافتراضي
                </button>
                <button
                  onClick={handleOpenAddSlide}
                  className="px-4 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-[#00FFD2]/20 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  إضافة شريحة جديدة
                </button>
              </div>
            </div>
          </div>

          {/* Slides List Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-['Cairo'] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#00FFD2]" />
                الشرائح الإعلانية الحالية في السلايدر ({slidesList.length}):
              </h4>
              <span className="text-xs text-gray-400">يمكنك ترتيب الشرائح بالأسهم أو التعديل والحذف مباشرة</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slidesList.map((slide, index) => (
                <div
                  key={slide.id}
                  className="bg-[#0d1211] border border-white/10 hover:border-[#00FFD2]/30 rounded-3xl p-5 transition-all space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Thumbnail & Badges */}
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-md ${slide.badgeColor || 'bg-[#00FFD2] text-black'}`}>
                          {slide.badge}
                        </span>
                        {slide.highlightText && (
                          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                            {slide.highlightText}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 left-3">
                        <span className="text-[10px] text-gray-300 bg-black/60 px-2 py-0.5 rounded font-mono">
                          القسم الهدف: {slide.tabTarget || 'playgrounds'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="font-bold text-white text-base font-['Cairo'] line-clamp-1">
                        {slide.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Reordering */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSlide(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-colors cursor-pointer"
                        title="تحريك لأعلى"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSlide(index, 'down')}
                        disabled={index === slidesList.length - 1}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-colors cursor-pointer"
                        title="تحريك لأسفل"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] text-gray-500 font-mono mr-1">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditSlide(slide)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Global Management & Audit Log */}
      {activeTab === 'global_management' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Audit Stats & Security Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0d1211] border border-blue-500/30 rounded-3xl p-5 space-y-1">
              <span className="text-xs text-blue-300 font-bold block flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-400" />
                إجمالي السجلات المسجلة (Audit Logs)
              </span>
              <h3 className="text-2xl font-black text-white font-mono">{auditLogs.length} حركة مسجلة</h3>
              <p className="text-[11px] text-gray-400">تتبع لحظي دقيق لكافة عمليات الإنشاء والحذف والتعديل والحجوزات</p>
            </div>

            <div className="bg-[#0d1211] border border-[#00FFD2]/30 rounded-3xl p-5 space-y-1">
              <span className="text-xs text-[#00FFD2] font-bold block flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#00FFD2]" />
                إجمالي المستخدمين والصلاحيات
              </span>
              <h3 className="text-2xl font-black text-white font-mono">{usersList.length} حسابات نشطة</h3>
              <p className="text-[11px] text-gray-400">
                1 مدير عام • {usersList.filter(u => u.role === 'league_manager').length} منظم دوري • {usersList.filter(u => u.role === 'announcer').length} معلن ملعب
              </p>
            </div>

            <div className="bg-[#0d1211] border border-emerald-500/30 rounded-3xl p-5 space-y-1">
              <span className="text-xs text-emerald-300 font-bold block flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                حالة الحماية وقاعدة البيانات
              </span>
              <h3 className="text-2xl font-black text-emerald-400 font-mono">100% مشفرة ومؤمنة</h3>
              <p className="text-[11px] text-gray-400">حجب كامل لكافة عناصر الأدمن عن غير المصرح لهم</p>
            </div>
          </div>

          {/* User Role Management Panel */}
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Cairo']">
                  <Users className="w-5 h-5 text-[#00FFD2]" />
                  التحكم الإداري بصلاحيات ورتب المستخدمين (User Role Management)
                </h3>
                <p className="text-xs text-gray-400">
                  تغيير رتبة المستخدم (لاعب، معلن منشأة، منظم بطولات، مدير نظام) أو حذف الحساب فورياً
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#050707] text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">اسم المستخدم</th>
                    <th className="p-3">رقم الهاتف / البريد</th>
                    <th className="p-3">المحافظة</th>
                    <th className="p-3">الرتبة والصلاحية الحالية</th>
                    <th className="p-3">تغيير الصلاحية</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white">
                        {u.name}
                        {u.role === 'admin' && (
                          <span className="mr-2 px-2 py-0.5 rounded-full bg-[#ff2a5f]/20 text-[#ff2a5f] text-[10px] font-bold">
                            المدير العام
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        {u.phone}
                        <span className="block text-[10px] text-gray-400">{u.email}</span>
                      </td>
                      <td className="p-3">{u.governorate}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-[#ff2a5f]/20 text-[#ff2a5f] border border-[#ff2a5f]/40'
                              : u.role === 'league_manager'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : u.role === 'announcer_pitch' || u.role === 'announcer'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : u.role === 'announcer_academy'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/40'
                          }`}
                        >
                          {u.role === 'admin'
                            ? 'مدير عام (Admin)'
                            : u.role === 'league_manager'
                            ? 'منظم دوريات'
                            : u.role === 'announcer_pitch' || u.role === 'announcer'
                            ? 'معلن ملاعب'
                            : u.role === 'announcer_academy'
                            ? 'معلن أكاديميات'
                            : 'لاعب / كابتن'}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeUserRole(u.id, e.target.value as AdminUserRole)}
                          disabled={u.role === 'admin' && (u.id === 'u-1' || u.role === 'admin')}
                          className="bg-[#050707] border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00FFD2] cursor-pointer disabled:opacity-50"
                        >
                          <option value="user">لاعب / مستخدم عادي (User)</option>
                          <option value="announcer_pitch">معلن ملاعب كرة قدم (Pitch Advertiser)</option>
                          <option value="announcer_academy">معلن أكاديميات ومدربين (Academy Advertiser)</option>
                          <option value="league_manager">منظم دوريات وبطولات (League Manager)</option>
                          <option value="admin">مدير نظام عام (Admin)</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleDeleteUserAccount(u.id)}
                            disabled={u.role === 'admin' && (u.id === 'u-1' || u.role === 'admin')}
                            className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-colors disabled:opacity-30 cursor-pointer"
                            title="حذف الحساب نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs Section */}
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Cairo']">
                  <Activity className="w-5 h-5 text-blue-400" />
                  سجل تدقيق نشاطات النظام (System Audit Trail)
                </h3>
                <p className="text-xs text-gray-400">
                  سجل موثق لكافة الإجراءات والحركات مع إمكانية التصفية السريعة
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'الكل', label: 'كافة الحركات' },
                  { id: 'creation', label: 'إنشاء' },
                  { id: 'deletion', label: 'حذف' },
                  { id: 'booking', label: 'حجوزات' },
                  { id: 'user_role', label: 'صلاحيات' },
                  { id: 'security', label: 'أمان' }
                ].map((flt) => (
                  <button
                    key={flt.id}
                    onClick={() => setAuditFilter(flt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      auditFilter === flt.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {auditLogs
                .filter((log) => auditFilter === 'الكل' || log.type === auditFilter)
                .map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-[#050707] border border-white/5 hover:border-white/15 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                          log.type === 'creation'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.type === 'deletion'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : log.type === 'booking'
                            ? 'bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/30'
                            : log.type === 'user_role'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {log.type === 'creation' ? (
                          <Plus className="w-4 h-4" />
                        ) : log.type === 'deletion' ? (
                          <Trash2 className="w-4 h-4" />
                        ) : log.type === 'booking' ? (
                          <Calendar className="w-4 h-4" />
                        ) : log.type === 'user_role' ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-bold text-sm">{log.title}</strong>
                          <span className="text-[10px] text-gray-400 font-mono">({log.performedBy})</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{log.description}</p>
                      </div>
                    </div>

                    <span className="text-[11px] text-gray-500 font-mono shrink-0 self-end sm:self-center">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Visual Charts & Analytics */}
      {activeTab === 'charts' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Live Statistics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recharts Area Chart: Daily Bookings & Growth */}
            <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Cairo'] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#00FFD2]" />
                    إحصائيات الحجوزات اليومية والنمو الحي (Recharts)
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    متابعة التدفق الحي لحجوزات الملاعب على مدار الأيام الماضية
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#00FFD2]/10 border border-[#00FFD2]/30 text-[#00FFD2] text-[10px] font-bold font-mono">
                  +34% نمو إيجابي
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { day: 'السبت', bookings: 12, revenue: 1650 },
                      { day: 'الأحد', bookings: 18, revenue: 2400 },
                      { day: 'الإثنين', bookings: 15, revenue: 1950 },
                      { day: 'الثلاثاء', bookings: 22, revenue: 3100 },
                      { day: 'الأربعاء', bookings: 28, revenue: 4200 },
                      { day: 'الخميس', bookings: 45, revenue: 6800 },
                      { day: 'الجمعة', bookings: 52, revenue: 7900 }
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FFD2" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00FFD2" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="day" stroke="#888888" tick={{ fill: '#888888', fontSize: 11 }} />
                    <YAxis stroke="#888888" tick={{ fill: '#888888', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d1211',
                        borderColor: '#00FFD230',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any, name: string) => [
                        name === 'bookings' ? `${val} حجز رياضي` : `${val} ألف ل.س`,
                        name === 'bookings' ? 'عدد الحجوزات' : 'الحجم المالي'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#00FFD2"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorBookings)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts Bar Chart: User & Captain Distribution by Governorate */}
            <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Cairo'] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    توزيع المستخدمين واللاعبين حسب المحافظة (Recharts)
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    كثافة اللاعبين والفرق الرياضية المسجلة عبر المحافظات السورية
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  14 محافظة نشطة
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={[
                      { gov: 'دمشق', users: usersList.filter(u => u.governorate === 'دمشق').length || 18, pitches: playgrounds.filter(p => p.governorate === 'دمشق').length || 4 },
                      { gov: 'ريف دمشق', users: usersList.filter(u => u.governorate === 'ريف دمشق').length || 12, pitches: playgrounds.filter(p => p.governorate === 'ريف دمشق').length || 3 },
                      { gov: 'حلب', users: usersList.filter(u => u.governorate === 'حلب').length || 14, pitches: playgrounds.filter(p => p.governorate === 'حلب').length || 3 },
                      { gov: 'حمص', users: usersList.filter(u => u.governorate === 'حمص').length || 9, pitches: playgrounds.filter(p => p.governorate === 'حمص').length || 2 },
                      { gov: 'اللاذقية', users: usersList.filter(u => u.governorate === 'اللاذقية').length || 8, pitches: playgrounds.filter(p => p.governorate === 'اللاذقية').length || 2 },
                      { gov: 'طرطوس', users: usersList.filter(u => u.governorate === 'طرطوس').length || 7, pitches: playgrounds.filter(p => p.governorate === 'طرطوس').length || 2 },
                      { gov: 'حماة', users: usersList.filter(u => u.governorate === 'حماة').length || 6, pitches: playgrounds.filter(p => p.governorate === 'حماة').length || 1 }
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="gov" stroke="#888888" tick={{ fill: '#888888', fontSize: 11 }} />
                    <YAxis stroke="#888888" tick={{ fill: '#888888', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d1211',
                        borderColor: '#22c55e30',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any, name: string) => [
                        `${val} ${name === 'users' ? 'مستخدم مسجل' : 'ملعب معتمد'}`,
                        name === 'users' ? 'المستخدمين' : 'الملاعب'
                      ]}
                    />
                    <Bar dataKey="users" fill="#00FFD2" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="pitches" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row: Pie Breakdown & Monthly Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recharts Pie Chart: Activity Breakdown */}
            <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-['Cairo'] flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#00FFD2]" />
                  توزيع مصادر النشاط الرياضي (Recharts Donut)
                </h3>
                <span className="text-xs text-gray-400">نسبة الإشغال الإجمالية: 86%</span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'حجوزات الملاعب', value: bookings.length || 45, color: '#00FFD2' },
                        { name: 'اشتراكات الدوريات', value: leagues.length * 8 || 25, color: '#fbbf24' },
                        { name: 'المباريات الودية', value: friendlyMatches.length || 20, color: '#ff2a5f' },
                        { name: 'الأكاديميات', value: academies.length * 4 || 10, color: '#a855f7' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'حجوزات الملاعب', color: '#00FFD2' },
                        { name: 'اشتراكات الدوريات', color: '#fbbf24' },
                        { name: 'المباريات الودية', color: '#ff2a5f' },
                        { name: 'الأكاديميات', color: '#a855f7' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d1211',
                        borderColor: '#ffffff20',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any) => [`${val} نشاط`, 'الحجم']}
                    />
                    <Legend
                      formatter={(val) => <span className="text-xs text-gray-300 mr-2">{val}</span>}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Activity Breakdown */}
            <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-['Cairo'] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  النشاط الشهري التراكمي للحجوزات
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-bold">+42% نمو تراكمي</span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={[
                      { month: 'يناير', bookings: 45 },
                      { month: 'فبراير', bookings: 62 },
                      { month: 'مارس', bookings: 78 },
                      { month: 'أبريل', bookings: 95 },
                      { month: 'مايو', bookings: 110 },
                      { month: 'يونيو', bookings: 130 }
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="month" stroke="#888888" tick={{ fill: '#888888', fontSize: 11 }} />
                    <YAxis stroke="#888888" tick={{ fill: '#888888', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d1211',
                        borderColor: '#00FFD230',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any) => [`${val} حجز معتمد`, 'الحجوزات']}
                    />
                    <Bar dataKey="bookings" fill="#00FFD2" radius={[6, 6, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Interactive Calendar */}
      {activeTab === 'calendar' && (
        <InteractiveCalendar
          bookings={bookings}
          playgrounds={playgrounds}
          currentUser={{ isAdmin: true, role: 'admin' }}
          onAddBooking={onAddBooking}
          onUpdateBookingStatus={onUpdateBookingStatus}
        />
      )}

      {/* Tab 3: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <h3 className="font-bold text-white text-sm font-['Cairo']">
              سجل كافة الحجوزات وإدارتها ({bookings.length}):
            </h3>
            <button
              onClick={() => exportBookingsCsv(bookings)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> تحميل تقرير الحجوزات Excel
            </button>
          </div>

          <div className="bg-[#0d1211] border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#050707] text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">الرقم المرجعي</th>
                    <th className="p-3">الملعب</th>
                    <th className="p-3">الكابتن</th>
                    <th className="p-3">التاريخ والوقت</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">طريقة الدفع</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-[#00FFD2] font-bold">{b.referenceNumber}</td>
                      <td className="p-3 font-bold text-white">
                        {b.playgroundName}
                        <span className="block text-[10px] text-gray-400 font-normal">{b.governorate}</span>
                      </td>
                      <td className="p-3">
                        {b.userName}
                        <span className="block text-[10px] text-gray-400 font-mono">{b.userPhone}</span>
                      </td>
                      <td className="p-3 font-mono">
                        {b.selectedDates.join(', ')}
                        <span className="block text-[10px] text-gray-400">{b.timeSlot}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">{formatSYP(b.totalPrice)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px]">
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'مؤكد'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                              : b.status === 'ملغي'
                              ? 'bg-red-950/80 text-red-400 border border-red-500/30'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {b.status !== 'مؤكد' && (
                            <button
                              onClick={() => onUpdateBookingStatus(b.id, 'مؤكد')}
                              title="تأكيد الحجز"
                              className="p-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {b.status !== 'ملغي' && (
                            <button
                              onClick={() => onUpdateBookingStatus(b.id, 'ملغي')}
                              title="إلغاء الحجز"
                              className="p-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Playgrounds Management */}
      {activeTab === 'playgrounds' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-['Cairo']">
              الملاعب المسجلة ({playgrounds.length})
            </h3>
            <button
              onClick={onOpenCreatePlayground}
              className="px-4 py-2 rounded-xl bg-[#00FFD2] text-black font-bold text-xs glow-primary flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> إضافة ملعب جديد
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playgrounds.map((pg) => (
              <div key={pg.id} className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-white text-xs">{pg.name}</strong>
                    <span className="text-[10px] text-[#00FFD2] font-bold">{pg.governorate}</span>
                  </div>
                  <p className="text-xs text-gray-400">{pg.detailedArea}</p>
                  <p className="text-xs text-gray-300 font-mono mt-1">{formatSYP(pg.pricePerHour)} / 90 دقيقة</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-3">
                  <span className="text-gray-400 font-mono">{pg.managerPhone}</span>
                  <button
                    onClick={() => onDeletePlayground(pg.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-[#ff2a5f] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Leagues Management */}
      {activeTab === 'leagues' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-['Cairo']">
              البطولات والدوريات ({leagues.length})
            </h3>
            <button
              onClick={onOpenCreateLeague}
              className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> إنشاء بطولة دوري جديدة
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {leagues.map((l) => (
              <div key={l.id} className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-white text-xs">{l.name}</strong>
                    <span className="text-[10px] text-amber-400 font-bold">{l.status}</span>
                  </div>
                  <p className="text-xs text-gray-400">{l.hostingVenue} ({l.governorate})</p>
                  <p className="text-xs text-gray-300 font-mono mt-1">الفرق: {l.teamsCount} • الجائزة: {formatSYP(l.prizes.cashPrize || 0)}</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-3">
                  <button
                    onClick={() => exportLeaguePdf(l)}
                    className="text-xs text-[#00FFD2] hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> تقرير PDF
                  </button>
                  <button
                    onClick={() => onDeleteLeague(l.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-[#ff2a5f] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Matches Management */}
      {activeTab === 'matches' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d1211] p-4 rounded-2xl border border-white/10">
            <div>
              <h3 className="font-bold text-white text-sm font-['Cairo'] flex items-center gap-2">
                <Swords className="w-5 h-5 text-[#ff2a5f]" />
                إدارة المباريات الودية والتحديات ({friendlyMatches.length})
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">مراجعة وتأكيد طلبات التحديات وإدارتها وإرسال التنبيهات للفرق</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={matchStatusFilter}
                onChange={(e) => setMatchStatusFilter(e.target.value)}
                className="bg-[#050707] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white"
              >
                <option value="الكل">كل الحالات ({friendlyMatches.length})</option>
                <option value="مفتوح">مفتوح</option>
                <option value="مؤكد">مؤكد</option>
                <option value="منتهي">منتهي</option>
                <option value="ملغي">ملغي</option>
              </select>

              <button
                onClick={onOpenCreateMatch}
                className="px-4 py-2 rounded-xl bg-[#ff2a5f] hover:bg-[#e02050] text-white font-bold text-xs glow-pink flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> نشر تحدي جديد
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friendlyMatches
              .filter((m) => matchStatusFilter === 'الكل' || m.status === matchStatusFilter)
              .map((m) => (
                <div key={m.id} className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-white text-sm font-bold">{m.hostTeamName}</strong>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          m.status === 'مؤكد' || m.status === 'مقبولة'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : m.status === 'قيد الانتظار'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse'
                            : m.status === 'مفتوح'
                            ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                            : m.status === 'ملغي'
                            ? 'bg-red-950 text-red-400 border border-red-500/40'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-300">
                      <p className="text-gray-400">🏟️ {m.venueName} • <span className="text-white">{m.governorate}</span></p>
                      <p className="font-mono text-gray-300">📅 {m.date} | ⏰ {m.time} | 👥 {m.ageGroup}</p>
                      <p className="text-[#00FFD2]">المنافس: {m.opponentTeamName || 'بانتظار منافس للانضمام'}</p>
                      <p className="text-gray-400">طريقة الدفع: {m.costSplitMethod}</p>
                      <p className="font-mono text-white">التكلفة: {formatSYP(m.pitchPrice)} + حكم {formatSYP(m.refereePrice || 0)}</p>
                      <p className="text-gray-400">المنظم: {m.organizerName} ({m.organizerPhone})</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-1">
                      {m.status !== 'مؤكد' && m.status !== 'مقبولة' && (
                        <button
                          onClick={() => {
                            if (onUpdateFriendlyMatchStatus) {
                              onUpdateFriendlyMatchStatus(m.id, 'مقبولة');
                            }
                            openWhatsAppShare(
                              `⚽ *تم قبول وتأكيد مباراتكم عبر تطبيق الكابتن!*\n📌 المباراة: ${m.hostTeamName} ضد ${m.opponentTeamName || 'المتحدي'}\n📍 الملعب: ${m.venueName}\n📅 الموعد: ${m.date} (${m.time})\nنتمنى لكم مباراة ممتعة!`,
                              m.organizerPhone
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold flex items-center gap-1 border border-emerald-500/40 shadow-sm cursor-pointer"
                          title="قبول وتأكيد المباراة وإرسال إشعار فوري"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> قبول المباراة
                        </button>
                      )}

                      {m.status !== 'ملغي' && (
                        <button
                          onClick={() => {
                            setRejectionModalData({
                              id: m.id,
                              type: 'friendly_match',
                              name: `${m.hostTeamName} - ${m.venueName}`,
                              phone: m.organizerPhone
                            });
                          }}
                          className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 text-[11px] font-bold flex items-center gap-1 border border-red-500/30"
                          title="إلغاء التحدي"
                        >
                          <XCircle className="w-3.5 h-3.5" /> إلغاء
                        </button>
                      )}

                      <button
                        onClick={() =>
                          openWhatsAppShare(
                            `مرحباً كابتن ${m.organizerName} بخصوص مباراة ${m.hostTeamName} في ${m.venueName}`,
                            m.organizerPhone
                          )
                        }
                        className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[11px] font-bold flex items-center gap-1"
                        title="محادثة واتساب"
                      >
                        واتساب
                      </button>
                    </div>

                    <button
                      onClick={() => onDeleteMatch(m.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-[#ff2a5f] transition-colors"
                      title="حذف نهائي"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 7: Academies & Registration Requests Management */}
      {activeTab === 'academies' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-tabs toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d1211] p-4 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAcademySubTab('registrations')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                  academySubTab === 'registrations'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-[#050707] text-gray-300 hover:text-white border border-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>طلبات تسجيل الطلاب ({academyRegistrations.length})</span>
              </button>

              <button
                onClick={() => setAcademySubTab('academies')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                  academySubTab === 'academies'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-[#050707] text-gray-300 hover:text-white border border-white/10'
                }`}
              >
                <span>الأكاديميات المعتمدة ({academies.length})</span>
              </button>
            </div>

            {academySubTab === 'academies' && (
              <button
                onClick={onOpenCreateAcademy}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1 shadow-lg cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة أكاديمية جديدة
              </button>
            )}

            {academySubTab === 'registrations' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">تصفية الحالة:</label>
                <select
                  value={registrationStatusFilter}
                  onChange={(e) => setRegistrationStatusFilter(e.target.value)}
                  className="bg-[#050707] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white"
                >
                  <option value="الكل">كل الحالات ({academyRegistrations.length})</option>
                  <option value="قيد الانتظار">قيد الانتظار</option>
                  <option value="مؤكد">مؤكد ومقبول</option>
                  <option value="مرفوض">مرفوض</option>
                </select>
              </div>
            )}
          </div>

          {/* Sub-tab 1: Student Registrations Table & Cards */}
          {academySubTab === 'registrations' && (
            <div className="space-y-4">
              {academyRegistrations.length === 0 ? (
                <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-12 text-center space-y-3">
                  <Users className="w-12 h-12 text-gray-600 mx-auto" />
                  <h3 className="text-base font-bold text-gray-300">لا توجد طلبات تسجيل طلاب بعد</h3>
                  <p className="text-xs text-gray-400">
                    عندما يقوم أولياء الأمور بتسجيل أبنائهم في الأكاديميات الكروية ستظهر كافة الطلبات وإيصالات الدفع هنا للمراجعة والاعتماد.
                  </p>
                </div>
              ) : (
                <div className="bg-[#0d1211] border border-white/10 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#050707] text-gray-400 border-b border-white/10">
                        <tr>
                          <th className="p-3">الطالب والصورة</th>
                          <th className="p-3">الأكاديمية والمحافظة</th>
                          <th className="p-3">العمر والفئة والمركز</th>
                          <th className="p-3">ولي الأمر والتواصل</th>
                          <th className="p-3">المواصلات</th>
                          <th className="p-3">إيصال الدفع</th>
                          <th className="p-3">حالة الدفع</th>
                          <th className="p-3">حالة التسجيل</th>
                          <th className="p-3 text-center">إجراءات المدير</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300">
                        {academyRegistrations
                          .filter((r) => registrationStatusFilter === 'الكل' || r.status === registrationStatusFilter)
                          .map((r) => (
                            <tr key={r.id} className="hover:bg-white/5 transition-colors">
                              {/* Student info */}
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={r.studentPhoto}
                                    alt={r.studentName}
                                    className="w-10 h-10 rounded-xl object-cover border border-purple-400/40 shrink-0"
                                  />
                                  <div>
                                    <strong className="text-white block">{r.studentName}</strong>
                                    <span className="text-[10px] text-purple-300 font-mono">مواليد {r.birthDate}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Academy */}
                              <td className="p-3">
                                <span className="font-bold text-white block">{r.academyName}</span>
                                <span className="text-[10px] text-gray-400">{r.governorate} - {r.city}</span>
                              </td>

                              {/* Age & Position */}
                              <td className="p-3">
                                <span className="text-white font-bold block">{r.age} سنة • {r.preferredPosition}</span>
                                <span className="text-[10px] text-purple-300">{r.ageGroup}</span>
                              </td>

                              {/* Parent Contact */}
                              <td className="p-3">
                                <span className="text-white block">{r.parentName}</span>
                                <span className="text-[10px] text-gray-400 font-mono">{r.parentPhone}</span>
                              </td>

                              {/* Transport */}
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    r.transportOption === 'مؤمنة'
                                      ? 'bg-emerald-950 text-emerald-400'
                                      : r.transportOption === 'بحاجة مواصلات'
                                      ? 'bg-amber-950 text-amber-400'
                                      : 'bg-gray-800 text-gray-400'
                                  }`}
                                >
                                  {r.transportOption}
                                </span>
                              </td>

                              {/* Payment Receipt Image */}
                              <td className="p-3">
                                {r.paymentReceiptPhoto ? (
                                  <button
                                    onClick={() => setSelectedReceiptImage(r.paymentReceiptPhoto)}
                                    className="p-1 rounded-lg border border-purple-500/30 hover:border-purple-400 transition-colors flex items-center gap-1 text-[10px] text-purple-300 bg-[#050707]"
                                    title="معاينة إشعار الدفع"
                                  >
                                    <img
                                      src={r.paymentReceiptPhoto}
                                      alt="الإشعار"
                                      className="w-7 h-7 rounded object-cover"
                                    />
                                    <span>معاينة</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-500">لا يوجد إشعار</span>
                                )}
                              </td>

                              {/* Payment Status with Quick Change */}
                              <td className="p-3">
                                <div className="space-y-1">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold block text-center ${
                                      r.paymentStatus === 'مدفوع'
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                        : r.paymentStatus === 'غير مدفوع'
                                        ? 'bg-red-950 text-red-400 border border-red-500/30'
                                        : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                    }`}
                                  >
                                    {r.paymentStatus}
                                  </span>

                                  {/* Quick Toggle Button */}
                                  {onUpdateAcademyRegistrationPaymentStatus && (
                                    <button
                                      onClick={() => {
                                        const nextStatus: PaymentStatus =
                                          r.paymentStatus === 'مدفوع' ? 'غير مدفوع' : 'مدفوع';
                                        onUpdateAcademyRegistrationPaymentStatus(r.id, nextStatus);
                                      }}
                                      className="text-[9px] text-[#00FFD2] hover:underline block text-center"
                                    >
                                      تبديل حالة الدفع
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Registration Status */}
                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold block text-center ${
                                    r.status === 'مؤكد'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                      : r.status === 'مرفوض'
                                      ? 'bg-red-950 text-red-400 border border-red-500/40'
                                      : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                                  }`}
                                >
                                  {r.status}
                                </span>
                                {r.rejectionReason && (
                                  <span className="text-[9px] text-red-300 block text-center mt-0.5">
                                    سبب: {r.rejectionReason}
                                  </span>
                                )}
                              </td>

                              {/* Admin Actions */}
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Approve Button */}
                                  {r.status !== 'مؤكد' && (
                                    <button
                                      onClick={() => {
                                        if (onUpdateAcademyRegistrationStatus) {
                                          onUpdateAcademyRegistrationStatus(r.id, 'مؤكد');
                                        }
                                        openWhatsAppShare(
                                          `🎉 *تهانينا! تم قبول وتأكيد تسجيل الطالب ${r.studentName} في ${r.academyName}!*\n👤 الفئة: ${r.ageGroup}\n📞 للاستفسار وتحديد مواعيد التدريب يرجى التواصل مع إدارة الأكاديمية.\nنتمنى له مسيرة كروية حافلة بالنجاح! ⚽`,
                                          r.parentPhone
                                        );
                                      }}
                                      className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-500/30"
                                      title="قبول وتأكيد التسجيل وإرسال إشعار واتساب"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>قبول</span>
                                    </button>
                                  )}

                                  {/* Reject Button with Reason Modal */}
                                  {r.status !== 'مرفوض' && (
                                    <button
                                      onClick={() => {
                                        setRejectionModalData({
                                          id: r.id,
                                          type: 'academy_registration',
                                          name: `${r.studentName} (${r.academyName})`,
                                          phone: r.parentPhone
                                        });
                                      }}
                                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 text-xs font-bold flex items-center gap-1 border border-red-500/30"
                                      title="رفض الطلب مع ذكر السبب"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      <span>رفض</span>
                                    </button>
                                  )}

                                  {/* WhatsApp Direct Contact */}
                                  <button
                                    onClick={() =>
                                      openWhatsAppShare(
                                        `مرحباً السيد/ة ${r.parentName} بخصوص طلب تسجيل الطالب ${r.studentName} في ${r.academyName}`,
                                        r.parentPhone
                                      )
                                    }
                                    className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold"
                                    title="تواصل واتساب مع ولي الأمر"
                                  >
                                    واتساب
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2: Academies List */}
          {academySubTab === 'academies' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {academies.map((a) => (
                <div key={a.id} className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-white text-sm">{a.name}</h4>
                      <span className="text-xs text-purple-400 font-bold">{a.governorate}</span>
                    </div>
                    <p className="text-xs text-gray-400">{a.locationDetails}</p>
                    <p className="text-xs text-purple-300 font-mono mt-2">الاشتراك الشهري: {formatSYP(a.monthlyFee)}</p>
                    <p className="text-xs text-gray-400 mt-1">المدرب: {a.mainCoach} ({a.contactPhone})</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-3">
                    <span className="text-gray-400 font-mono">مواصلات: {a.transportStatus}</span>
                    <button
                      onClick={() =>
                        openWhatsAppShare(
                          `مرحباً كابتن ${a.mainCoach} بإدارة ${a.name}`,
                          a.contactPhone
                        )
                      }
                      className="text-xs text-purple-300 hover:underline flex items-center gap-1"
                    >
                      تواصل مع الأكاديمية
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Scouting Management */}
      {activeTab === 'scouting' && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="font-bold text-white text-sm font-['Cairo']">
            بطاقات اللاعبين وكشاف المواهب ({playerCvs.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playerCvs.map((pl) => (
              <div key={pl.id} className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <img src={pl.image} alt={pl.fullName} className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-white text-sm">{pl.fullName}</h4>
                  <p className="text-xs text-blue-400">{pl.position} • {pl.governorate}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{pl.phoneNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: User Management & Role Assignment */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Bar for User Management */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d1211] p-4 rounded-3xl border border-white/10">
            <div>
              <h3 className="font-bold text-white text-base font-['Cairo'] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00FFD2]" />
                إدارة وتحديد أدوار المستخدمين والمعلنين والمنظمين ({usersList.length}):
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                تحديد رتبة كل مستخدم (لاعب، معلن ملعب، معلن أكاديمية، منظم دوري، مدير نظام) بدقة تامة
              </p>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-[#00FFD2]/20 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مستخدم وتحديد دوره</span>
            </button>
          </div>

          {/* Role Filter Chips & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'الكل', label: 'كافة الحسابات' },
                { id: 'user', label: 'اللاعبين والمستخدمين' },
                { id: 'announcer_pitch', label: 'معلني الملاعب' },
                { id: 'announcer_academy', label: 'معلني الأكاديميات' },
                { id: 'league_manager', label: 'منظمي الدوريات' },
                { id: 'admin', label: 'الإدارة العليا' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setUserRoleFilter(filter.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    userRoleFilter === filter.id
                      ? 'bg-[#00FFD2] text-black font-black shadow-md'
                      : 'bg-[#0d1211] text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الهاتف..."
                className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2]"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#050707] text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">اسم المستخدم</th>
                    <th className="p-3">رقم الجوال / البريد</th>
                    <th className="p-3">المحافظة</th>
                    <th className="p-3">الرتبة الحالية</th>
                    <th className="p-3">تعديل الدور والصلاحية</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {usersList
                    .filter((u) => {
                      if (userRoleFilter === 'user') return u.role === 'user';
                      if (userRoleFilter === 'announcer_pitch') return u.role === 'announcer_pitch' || u.role === 'announcer';
                      if (userRoleFilter === 'announcer_academy') return u.role === 'announcer_academy';
                      if (userRoleFilter === 'league_manager') return u.role === 'league_manager';
                      if (userRoleFilter === 'admin') return u.role === 'admin';
                      return true;
                    })
                    .filter((u) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      return u.name.toLowerCase().includes(q) || u.phone.includes(q) || u.email.toLowerCase().includes(q);
                    })
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.role === 'admin' && (
                              <span className="px-2 py-0.5 rounded-full bg-[#ff2a5f]/20 text-[#ff2a5f] text-[10px] font-bold border border-[#ff2a5f]/30">
                                مدير عام
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-mono">
                          <span className="text-white font-bold">{u.phone}</span>
                          <span className="block text-[10px] text-gray-400">{u.email}</span>
                        </td>
                        <td className="p-3">{u.governorate}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-[#ff2a5f]/20 text-[#ff2a5f] border border-[#ff2a5f]/40'
                                : u.role === 'league_manager'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : u.role === 'announcer_pitch' || u.role === 'announcer'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                : u.role === 'announcer_academy'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/40'
                            }`}
                          >
                            {u.role === 'admin'
                              ? 'مدير عام (Admin)'
                              : u.role === 'league_manager'
                              ? 'منظم دوريات وبطولات'
                              : u.role === 'announcer_pitch' || u.role === 'announcer'
                              ? 'معلن ملاعب كرة قدم'
                              : u.role === 'announcer_academy'
                              ? 'معلن أكاديميات ومدربين'
                              : 'لاعب / مستخدم عادي'}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value as AdminUserRole)}
                            disabled={u.role === 'admin' && (u.id === 'u-1' || u.role === 'admin')}
                            className="bg-[#050707] border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00FFD2] cursor-pointer disabled:opacity-50"
                          >
                            <option value="user">لاعب / مستخدم عادي (User)</option>
                            <option value="announcer_pitch">معلن ملاعب كرة قدم (Pitch Advertiser)</option>
                            <option value="announcer_academy">معلن أكاديميات ومدربين (Academy Advertiser)</option>
                            <option value="league_manager">منظم دوريات وبطولات (League Manager)</option>
                            <option value="admin">مدير نظام عام (Admin)</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isBanned
                                ? 'bg-red-950 text-red-400 border border-red-500/30'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {u.isBanned ? 'محظور' : 'نشط'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleToggleBanUser(u.id)}
                              disabled={u.role === 'admin' && (u.id === 'u-1' || u.role === 'admin')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-30 cursor-pointer ${
                                u.isBanned
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-amber-600 hover:bg-amber-500 text-white'
                              }`}
                            >
                              {u.isBanned ? 'إلغاء الحظر' : 'حظر'}
                            </button>
                            <button
                              onClick={() => handleDeleteUserAccount(u.id)}
                              disabled={u.role === 'admin' && (u.id === 'u-1' || u.role === 'admin')}
                              className="p-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-colors disabled:opacity-30 cursor-pointer"
                              title="حذف الحساب نهائياً"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 10: Objections System */}
      {activeTab === 'objections' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm font-['Cairo'] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              نظام الاعتراضات والتحكيم الرياضي ({objectionsList.length}):
            </h3>
          </div>

          <div className="space-y-4">
            {objectionsList.map((obj) => (
              <div key={obj.id} className="bg-[#0d1211] border border-amber-400/30 rounded-3xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm font-['Cairo']">{obj.leagueName}</h4>
                    <p className="text-xs text-amber-400 mt-0.5">
                      المعترض: {obj.submittingTeam} ضد {obj.targetTeam}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      obj.status === 'قيد المراجعة'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        : obj.status === 'مقبول'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-950 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {obj.status}
                  </span>
                </div>

                <div className="bg-[#050707] p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                  <div className="text-gray-300">
                    <strong>سبب الاعتراض:</strong> {obj.reason}
                  </div>
                  <div className="text-gray-400">
                    <strong>الأدلة المرفقة:</strong> {obj.evidenceDetails}
                  </div>
                  <div className="text-emerald-400 font-mono">
                    <strong>رسم الاعتراض المدفوع:</strong> {formatSYP(obj.depositFeePaid)} (يُسترد في حال قبول الاعتراض)
                  </div>
                </div>

                {obj.status === 'قيد المراجعة' && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() =>
                        handleResolveObjection(
                          obj.id,
                          'قبول وتعديل النتيجة',
                          'تم قبول الاعتراض واعتماد فوز الفريق المعترض 3-0 قانونياً واسترداد رسم التأمين.'
                        )
                      }
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      قبول الاعتراض وتعديل النتيجة
                    </button>
                    <button
                      onClick={() =>
                        handleResolveObjection(
                          obj.id,
                          'إعادة جدولة المباراة',
                          'تمت الموافقة على إعادة المباراة في موعد لاحق تحت إشراف طاقم تحكيم دولي.'
                        )
                      }
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs"
                    >
                      إعادة جدولة المباراة
                    </button>
                    <button
                      onClick={() =>
                        handleResolveObjection(
                          obj.id,
                          'رفض الاعتراض',
                          'تم رفض الاعتراض بعد مراجعة تقرير الحكم المعتمد ومصادرة رسم التأمين.'
                        )
                      }
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                    >
                      رفض الاعتراض
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 11: Settings & Sham Cash */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fadeIn max-w-2xl">
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Cairo']">
              <Settings className="w-5 h-5 text-[#00FFD2]" />
              إعدادات منصة الكابتن وإدارة محفظة شام كاش
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  رقم حساب شام كاش المعتمد للمنصة:
                </label>
                <input
                  type="text"
                  value={shamCashAdminAccount}
                  onChange={(e) => setShamCashAdminAccount(e.target.value)}
                  placeholder="SHAM-9456-8809"
                  className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00FFD2]"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  هذا الرقم يظهر للمستخدمين عند اختيار الدفع عبر شام كاش لدفع الحجوزات أو رسوم الدوريات
                </span>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  رقم الواتساب الموحد للدعم الفني والشكاوى:
                </label>
                <input
                  type="text"
                  value="+963 945688090"
                  disabled
                  className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-gray-400 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    setIsSavedSettings(true);
                    setTimeout(() => setIsSavedSettings(false), 2500);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs glow-primary transition-all"
                >
                  {isSavedSettings ? 'تم حفظ الإعدادات بنجاح ✓' : 'حفظ الإعدادات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Preview Modal */}
      {selectedReceiptImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedReceiptImage(null)}
        >
          <div
            className="bg-[#0d1211] border border-white/20 rounded-3xl p-4 max-w-lg w-full shadow-2xl relative space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-['Cairo']">صورة إشعار / إيصال الدفع</h4>
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/60 border border-white/10 max-h-[65vh] flex items-center justify-center">
              <img
                src={selectedReceiptImage}
                alt="إيصال الدفع"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setRejectionModalData(null);
            setRejectionReasonInput('');
          }}
        >
          <div
            className="bg-[#0d1211] border border-red-500/40 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-red-400 font-['Cairo'] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>رفض الطلب: {rejectionModalData.name}</span>
              </h4>
              <button
                onClick={() => {
                  setRejectionModalData(null);
                  setRejectionReasonInput('');
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              يرجى كتابة سبب الرفض لتوضيحه للمستخدم وإرساله في إشعار الواتساب التلقائي:
            </p>

            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="مثال: اكتمال العدد المطلوب في الفئة العمرية / بيانات الدفع غير مطابقة..."
              rows={3}
              className="w-full bg-[#050707] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectionModalData(null);
                  setRejectionReasonInput('');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-bold transition-colors"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={() => {
                  const reason = rejectionReasonInput.trim() || 'عدم استيفاء الشروط المطلوبة';
                  if (rejectionModalData.type === 'academy_registration') {
                    if (onUpdateAcademyRegistrationStatus) {
                      onUpdateAcademyRegistrationStatus(rejectionModalData.id, 'مرفوض', reason);
                    }
                    openWhatsAppShare(
                      `❌ *نعتذر، تم رفض طلب تسجيل الطالب ${rejectionModalData.name}*\nالسبب: ${reason}\nللاستفسار يرجى مراجعة إدارة المنصة.`,
                      rejectionModalData.phone
                    );
                  } else if (rejectionModalData.type === 'friendly_match') {
                    if (onUpdateFriendlyMatchStatus) {
                      onUpdateFriendlyMatchStatus(rejectionModalData.id, 'ملغي', reason);
                    }
                    openWhatsAppShare(
                      `❌ *تم إلغاء التحدي الكروي ${rejectionModalData.name}*\nالسبب: ${reason}\nيمكنك إنشاء تحدٍ جديد في أي وقت.`,
                      rejectionModalData.phone
                    );
                  }
                  setRejectionModalData(null);
                  setRejectionReasonInput('');
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-lg shadow-red-600/30"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>تأكيد الرفض وإشعار واتساب</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add / Edit Slide Modal (Super Admin Only) */}
      {isSlideModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsSlideModalOpen(false)}
        >
          <div
            className="bg-[#0d1211] border-2 border-[#00FFD2]/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#00FFD2]" />
                <h4 className="text-base font-bold text-white font-['Cairo']">
                  {editingSlide ? 'تعديل شريحة السلايدر' : 'إضافة شريحة جديدة للسلايدر'}
                </h4>
              </div>
              <button
                onClick={() => setIsSlideModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  عنوان الشريحة الرئيسي *
                </label>
                <input
                  type="text"
                  value={slideFormData.title}
                  onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                  placeholder="مثال: بطولة دمشق الكبرى 2025"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00FFD2]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  الوصف الفرعي للشريحة *
                </label>
                <textarea
                  rows={2}
                  value={slideFormData.subtitle}
                  onChange={(e) => setSlideFormData({ ...slideFormData, subtitle: e.target.value })}
                  placeholder="مثال: سجّل فريقك الآن وتنافس على جوائز بقيمة 10 مليون ليرة سورية مع تغطية إعلامية كاملة"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00FFD2] resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  رابط الصورة (Image URL) *
                </label>
                <input
                  type="text"
                  value={slideFormData.image}
                  onChange={(e) => setSlideFormData({ ...slideFormData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-[#00FFD2]"
                />
                {slideFormData.image && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={slideFormData.image}
                      alt="معاينة الصورة"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    الشارة / البادج (Badge Text) *
                  </label>
                  <input
                    type="text"
                    value={slideFormData.badge}
                    onChange={(e) => setSlideFormData({ ...slideFormData, badge: e.target.value })}
                    placeholder="مثال: دوري مميز / عرض خاص"
                    className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00FFD2]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    نص الإبراز الذهبي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={slideFormData.highlightText}
                    onChange={(e) => setSlideFormData({ ...slideFormData, highlightText: e.target.value })}
                    placeholder="مثال: خصم 20% / الجائزة 5 مليون"
                    className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00FFD2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    نص زر الإجراء (Action Button Text)
                  </label>
                  <input
                    type="text"
                    value={slideFormData.actionText}
                    onChange={(e) => setSlideFormData({ ...slideFormData, actionText: e.target.value })}
                    placeholder="مثال: احجز الآن / استكشف البطولة"
                    className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00FFD2]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    القسم الهدف عند النقر
                  </label>
                  <select
                    value={slideFormData.tabTarget}
                    onChange={(e) => setSlideFormData({ ...slideFormData, tabTarget: e.target.value })}
                    className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00FFD2] cursor-pointer"
                  >
                    <option value="playgrounds">الملاعب وحجز الساعات</option>
                    <option value="leagues">البطولات والدوريات</option>
                    <option value="academies">الأكاديميات والمدربين</option>
                    <option value="matches">المباريات الودية والتحديات</option>
                    <option value="scouting">كشاف المواهب وبطاقات اللاعبين</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveSlideForm}
                className="px-6 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs transition-all shadow-lg shadow-[#00FFD2]/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ الشريحة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New User Modal (Super Admin Only) */}
      {isAddUserModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsAddUserModalOpen(false)}
        >
          <div
            className="bg-[#0d1211] border-2 border-[#00FFD2]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#00FFD2]" />
                <h4 className="text-base font-bold text-white font-['Cairo']">
                  إضافة مستخدم جديد وتحديد الصلاحية
                </h4>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  الاسم الثلاثي *
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="مثال: أحمد خليل"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00FFD2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    رقم الجوال *
                  </label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="09XXXXXXXX"
                    className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00FFD2]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00FFD2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    المحافظة *
                  </label>
                  <select
                    value={newUserGov}
                    onChange={(e) => setNewUserGov(e.target.value)}
                    className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00FFD2] cursor-pointer"
                  >
                    {[
                      'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
                      'إدلب', 'درعا', 'السويداء', 'القنيطرة', 'دير الزور', 'الحسكة', 'الرقة'
                    ].map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    الرتبة والصلاحية الممنوحة *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as AdminUserRole)}
                    className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00FFD2] cursor-pointer font-bold"
                  >
                    <option value="user">لاعب / مستخدم عادي (User)</option>
                    <option value="announcer_pitch">معلن ملاعب كرة قدم (Pitch Advertiser)</option>
                    <option value="announcer_academy">معلن أكاديميات ومدربين (Academy Advertiser)</option>
                    <option value="league_manager">منظم دوريات وبطولات (League Manager)</option>
                    <option value="admin">مدير نظام عام (Admin)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleCreateNewUser}
                className="px-6 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs transition-all shadow-lg shadow-[#00FFD2]/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إضافة المستخدم فوراً</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
