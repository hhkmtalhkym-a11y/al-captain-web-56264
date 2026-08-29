import React, { useState } from 'react';
import {
  User,
  Shield,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle2,
  Lock,
  Headphones,
  Info,
  RefreshCw,
  Edit2,
  LogOut,
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  Trash2,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
  X,
  Check,
  ExternalLink,
  Bell,
  BellRing,
  FileText,
  Scale,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Mail,
  Zap,
  Award,
  Crown,
  Building
} from 'lucide-react';
import { UserProfile, SyrianGovernorate, Booking, UserRole, Playground, BookingStatus } from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { openWhatsAppShare, readImageAsBase64, formatSYP, loadFromLocalStorage, saveToLocalStorage } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { isUserAdmin, isUserAdvertiser, getUserRoleBadge } from '../utils/permissions';
import AppOfficialLogo from './AppOfficialLogo';
import LegalDocumentsModal from './LegalDocumentsModal';
import BookingAnalytics from './BookingAnalytics';
import OwnerDashboard from './OwnerDashboard';

interface ProfileViewProps {
  currentUser: UserProfile;
  bookings?: Booking[];
  playgrounds?: Playground[];
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenAdminLogin: () => void;
  onOpenSupportModal: () => void;
  onCancelBooking?: (bookingId: string) => void;
  onAddBooking?: (newBooking: Booking) => void;
  onUpdateBookingStatus?: (
    bookingId: string,
    status: BookingStatus,
    paymentStatus?: 'مدفوع' | 'غير مدفوع' | 'قيد الانتظار'
  ) => void;
  onDeleteBooking?: (bookingId: string) => void;
  onEditBooking?: (booking: Booking) => void;
}

export default function ProfileView({
  currentUser,
  bookings = [],
  playgrounds = [],
  onUpdateProfile,
  onOpenAdminLogin,
  onOpenSupportModal,
  onCancelBooking,
  onAddBooking = () => {},
  onUpdateBookingStatus = () => {},
  onDeleteBooking,
  onEditBooking
}: ProfileViewProps) {
  const {
    firebaseUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithPhonePassword,
    signOutUser,
    deleteUserAccount,
    authError,
    clearAuthError,
    updateCurrentUser
  } = useAuth();

  const isOwnerOrAdmin = isUserAdmin(currentUser) || isUserAdvertiser(currentUser);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'bookings' | 'owner_dashboard' | 'auth_panel' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [governorate, setGovernorate] = useState<SyrianGovernorate>(currentUser.governorate);
  const [position, setPosition] = useState(currentUser.position || 'مهاجم صريح (ST)');
  const [image, setImage] = useState(currentUser.image || '');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // In-Profile Auth Panel State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'quick_roles'>('login');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [inputIdentifier, setInputIdentifier] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regGov, setRegGov] = useState<SyrianGovernorate>('دمشق');
  const [regPassword, setRegPassword] = useState('');
  const [panelMessage, setPanelMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Push Notifications state with persistence
  const [pushEnabled, setPushEnabled] = useState<boolean>(() =>
    loadFromLocalStorage('kaptan_push_notifications_enabled', true)
  );
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

  // Modals
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'security' | 'terms' | 'version'>('terms');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const roleInfo = getUserRoleBadge(currentUser);

  const handleTogglePushNotifications = () => {
    const nextState = !pushEnabled;
    setPushEnabled(nextState);
    saveToLocalStorage('kaptan_push_notifications_enabled', nextState);
    setPushStatusMessage(nextState ? 'تم تفعيل الإشعارات الفورية والتنبيهات 🔔' : 'تم كتم الإشعارات والتنبيهات 🔕');
    setTimeout(() => setPushStatusMessage(null), 3000);
  };

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    clearAuthError();
    setPanelMessage(null);
    try {
      await signInWithGoogle();
      setPanelMessage({ type: 'success', text: 'تم تسجيل الدخول عبر Google بنجاح 🎉' });
    } catch (err: any) {
      console.error('Sign in with Google error:', err);
      setPanelMessage({ type: 'error', text: err?.message || 'تعذر تسجيل الدخول عبر Google' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handlePanelLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanelMessage(null);
    clearAuthError();

    if (!inputIdentifier.trim() || !inputPassword) {
      setPanelMessage({ type: 'error', text: 'يرجى إدخال المعرّف (الهاتف أو البريد) وكلمة المرور' });
      return;
    }

    setIsSigningIn(true);
    try {
      if (loginMethod === 'phone') {
        const ok = await signInWithPhonePassword(inputIdentifier.trim(), inputPassword);
        if (ok) {
          setPanelMessage({ type: 'success', text: 'تم تسجيل الدخول بنجاح! مرحباً بك يا كابتن ⚽' });
          setInputPassword('');
        } else {
          setPanelMessage({ type: 'error', text: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
        }
      } else {
        await signInWithEmail(inputIdentifier.trim(), inputPassword);
        setPanelMessage({ type: 'success', text: 'تم تسجيل الدخول بنجاح! مرحباً بك ⚽' });
        setInputPassword('');
      }
    } catch (err: any) {
      setPanelMessage({ type: 'error', text: err?.message || 'البيانات المدخلة غير صحيحة، يرجى المحاولة ثانية.' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handlePanelRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanelMessage(null);
    clearAuthError();

    if (!regName.trim() || !regPhone.trim() || !regPassword) {
      setPanelMessage({ type: 'error', text: 'يرجى ملء كافة الحقول الإلزامية' });
      return;
    }

    if (regPassword.length < 6) {
      setPanelMessage({ type: 'error', text: 'كلمة المرور يجب أن تكون 6 خانات على الأقل' });
      return;
    }

    setIsSigningIn(true);
    try {
      const emailToUse = regEmail.trim() || `captain_${regPhone.replace(/\D/g, '')}@alkaptan.sy`;
      await signUpWithEmail(emailToUse, regPassword, regName.trim(), regPhone.trim(), regGov);
      setPanelMessage({ type: 'success', text: 'تم إنشاء الحساب وتسجيل الدخول بنجاح! أهلاً بك 🎉' });
      setRegPassword('');
    } catch (err: any) {
      setPanelMessage({ type: 'error', text: err?.message || 'تعذر إنشاء الحساب، يرجى التحقق من البيانات.' });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Switch to Demo Advertiser or Demo Player
  const handleQuickSwitchRole = (role: UserRole) => {
    if (role === 'admin') {
      onOpenAdminLogin();
      return;
    }

    if (role === 'advertiser') {
      const advertiserProfile: UserProfile = {
        ...currentUser,
        role: 'advertiser',
        isAdmin: false,
        name: currentUser.name && currentUser.name !== 'كابتن المنصة' ? currentUser.name : 'معلن معتمد (الملاعب والبطولات)',
      };
      updateCurrentUser(advertiserProfile);
      setPanelMessage({
        type: 'success',
        text: 'تم تفعيل دور "معلن معتمد" ✅ يمكنك الآن إنشاء الملاعب والدوريات والأكاديميات!'
      });
    } else {
      const playerProfile: UserProfile = {
        ...currentUser,
        role: 'player',
        isAdmin: false
      };
      updateCurrentUser(playerProfile);
      setPanelMessage({
        type: 'success',
        text: 'تم تفعيل دور "لاعب / مستخدم عادي" ⚽'
      });
    }
  };

  const handleConfirmLogout = async () => {
    try {
      await signOutUser();
      setIsLogoutModalOpen(false);
      setPanelMessage({ type: 'success', text: 'تم تسجيل الخروج بنجاح.' });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleConfirmDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== 'حذف حسابي') {
      alert('يرجى كتابة "حذف حسابي" للتأكيد');
      return;
    }
    setIsDeleting(true);
    try {
      const ok = await deleteUserAccount(deleteReason);
      if (ok) {
        setIsDeleteModalOpen(false);
        alert('تم حذف الحساب نهائياً ومسح كافة البيانات.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await readImageAsBase64(file);
      setImage(base64);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      name,
      phone,
      governorate,
      position,
      image
    });
    setIsEditing(false);
    setPanelMessage({ type: 'success', text: 'تم حفظ تعديلات الملف الشخصي بنجاح.' });
  };

  const isGoogleSignedIn = !!firebaseUser || (!!currentUser.email && currentUser.email.includes('@'));

  return (
    <div id="view-profile" className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto font-['Cairo']">
      {/* Profile Navigation Tabs (Profile / My Bookings / Login & Roles / Security) */}
      <div className="flex bg-[#0d1211] p-1.5 rounded-2xl border border-white/10 gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-[#00FFD2] text-black shadow-lg glow-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>الملف والبيانات</span>
        </button>

        <button
          onClick={() => setActiveSubTab('auth_panel')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeSubTab === 'auth_panel'
              ? 'bg-gradient-to-r from-amber-400 to-[#00FFD2] text-black shadow-lg glow-primary font-black'
              : 'text-amber-300 hover:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>تسجيل الدخول والأدوار</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer relative ${
            activeSubTab === 'bookings'
              ? 'bg-[#00FFD2] text-black shadow-lg glow-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>حجوزاتي وتحليلاتي</span>
          {bookings.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'bookings' ? 'bg-black text-[#00FFD2]' : 'bg-[#00FFD2] text-black'
              }`}
            >
              {bookings.length}
            </span>
          )}
        </button>

        {isOwnerOrAdmin && (
          <button
            onClick={() => setActiveSubTab('owner_dashboard')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'owner_dashboard'
                ? 'bg-amber-400 text-black shadow-lg font-black'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>لوحة المعلن والملاعب</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-[#00FFD2] text-black shadow-lg glow-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>الأمان والإدارة</span>
        </button>
      </div>

      {/* Global Status Message */}
      {panelMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn ${
            panelMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/15 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {panelMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{panelMessage.text}</span>
          </div>
          <button onClick={() => setPanelMessage(null)} className="text-gray-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SUBTAB 1: Profile & Details */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6">
          {/* Header Profile Card */}
          <div className="bg-[#0d1211] border border-[#00FFD2]/20 rounded-3xl p-6 sm:p-8 glow-primary relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#00FFD2]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              <div className="relative group">
                <img
                  src={
                    currentUser.image ||
                    firebaseUser?.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={currentUser.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-[#00FFD2] shadow-xl"
                />
                {currentUser.isAdmin && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#ff2a5f] to-rose-600 text-white p-1.5 rounded-full shadow-lg">
                    <Shield className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-right space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {currentUser.phone} • محافظة {currentUser.governorate}
                      {currentUser.email && (
                        <span className="block text-[11px] text-blue-400 font-mono mt-0.5">
                          {currentUser.email}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 justify-center sm:justify-end">
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${roleInfo.colorClass}`}
                    >
                      {currentUser.isAdmin ? (
                        <Shield className="w-3.5 h-3.5" />
                      ) : isUserAdvertiser(currentUser) ? (
                        <Crown className="w-3.5 h-3.5" />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-300 bg-black/40 p-2 rounded-xl border border-white/5">
                  {roleInfo.description}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-xs text-gray-300">
                  <span className="bg-[#050707] px-3 py-1 rounded-xl border border-white/5">
                    ⚽ المركز: {currentUser.position || 'مهاجم صريح (ST)'}
                  </span>
                  <span className="bg-[#050707] px-3 py-1 rounded-xl border border-white/5 text-emerald-400">
                    ✨ عمولة المنصة: 0% مجاني
                  </span>
                  {/* Direct "إدارة ملعبي" button leading directly to OwnerDashboard */}
                  <button
                    onClick={() => setActiveSubTab('owner_dashboard')}
                    className="bg-amber-400 text-black hover:bg-amber-300 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shadow-md glow-amber cursor-pointer"
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>إدارة ملعبي 🏟️</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('auth_panel')}
                    className="bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-black px-3 py-1 rounded-xl border border-amber-400/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>تسجيل الدخول / تبديل الحساب</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#00FFD2]" />
                بيانات الملف الشخصي
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-[#00FFD2] hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-bold">الاسم الكامل:</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-bold">رقم الهاتف:</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FFD2] font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-bold">المحافظة السورية (الـ 14):</label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value as SyrianGovernorate)}
                      className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                    >
                      {SYRIAN_GOVERNORATES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-bold">مركزك الرياضي المفضل:</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-bold">تغيير الصورة الشخصية:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full bg-[#050707] border border-white/15 rounded-xl px-3 py-2 text-xs text-gray-300 file:bg-[#00FFD2] file:text-black file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:font-bold file:cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs glow-primary cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#050707] border border-white/5">
                  <span className="text-gray-400 block text-[11px]">الاسم:</span>
                  <strong className="text-white">{currentUser.name}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#050707] border border-white/5">
                  <span className="text-gray-400 block text-[11px]">رقم الهاتف:</span>
                  <strong className="text-white font-mono">{currentUser.phone}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#050707] border border-white/5">
                  <span className="text-gray-400 block text-[11px]">المحافظة:</span>
                  <strong className="text-white">{currentUser.governorate}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#050707] border border-white/5">
                  <span className="text-gray-400 block text-[11px]">المركز المفضل:</span>
                  <strong className="text-white">{currentUser.position || 'مهاجم صريح (ST)'}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Push Notifications & Preferences */}
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-2xl ${
                    pushEnabled ? 'bg-[#00FFD2]/20 text-[#00FFD2]' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {pushEnabled ? <BellRing className="w-5 h-5 animate-pulse" /> : <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">إشعارات وتنبيهات الحجوزات (Push Notifications)</h4>
                  <p className="text-xs text-gray-400">
                    تلقي إشعارات فورية عند تأكيد حجز ملعب، قبول تحدي، أو انطلاق بطولات جديدة.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleTogglePushNotifications}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                  pushEnabled ? 'bg-[#00FFD2]' : 'bg-gray-700'
                }`}
                title="تبديل الإشعارات الفورية"
              >
                <div
                  className={`bg-black w-6 h-6 rounded-full shadow-md transform transition-transform ${
                    pushEnabled ? 'translate-x-0' : '-translate-x-6 bg-gray-300'
                  }`}
                />
              </button>
            </div>

            {pushStatusMessage && (
              <div className="p-3 rounded-xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 text-[#00FFD2] text-xs font-bold animate-fadeIn flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{pushStatusMessage}</span>
              </div>
            )}
          </div>

          {/* Legal Documents, Privacy Policy & Version Info */}
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#00FFD2]" />
              <span>المستندات الرسمية، الخصوصية ومعلومات التطبيق</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setLegalModalTab('terms');
                  setIsLegalModalOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-[#050707] hover:bg-white/5 border border-white/10 text-right transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <strong className="text-white text-xs block">شروط الاستخدام والخدمة</strong>
                    <span className="text-[11px] text-gray-400">قواعد الحجوزات وعدم العمولة 0%</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setLegalModalTab('privacy');
                  setIsLegalModalOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-[#050707] hover:bg-white/5 border border-white/10 text-right transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <strong className="text-white text-xs block">سياسة الخصوصية وحماية البيانات</strong>
                    <span className="text-[11px] text-gray-400">تشفير البيانات وحماية أرقام الهواتف</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: AUTH PANEL (تسجيل الدخول وتبديل الحسابات داخل الملف الشخصي) */}
      {activeSubTab === 'auth_panel' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Role and Permissions Showcase Banner */}
          <div className="bg-[#0d1211] border border-amber-400/30 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">الدور النشط حالياً:</span>
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold ${roleInfo.colorClass}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  لوحة تسجيل الدخول وإدارة الصلاحيات
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {roleInfo.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentUser.isAdmin ? (
                  <button
                    onClick={onOpenAdminLogin}
                    className="px-4 py-2 rounded-xl bg-[#ff2a5f] hover:bg-[#ff2a5f]/80 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>لوحة الإدارة العليا</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج</span>
                  </button>
                )}
              </div>
            </div>

            {/* Permission Breakdown Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
              <div className="bg-black/50 p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-[#00FFD2] font-bold">
                  <User className="w-4 h-4" />
                  <span>المستخدم العادي (User)</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  حجز الملاعب، المشاركة بالبطولات والتسجيل بالأكاديميات. (لا يمكنه إنشاء ملاعب أو بطولات أو أكاديميات).
                </p>
              </div>

              <div className="bg-black/50 p-3 rounded-2xl border border-amber-400/20 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Crown className="w-4 h-4" />
                  <span>المعلن المعتمد (Advertiser)</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  مصرح له بإنشاء الملاعب، وتنظيم الدوريات، وتسجيل الأكاديميات الكروية والإعلان عنها.
                </p>
              </div>

              <div className="bg-black/50 p-3 rounded-2xl border border-[#ff2a5f]/30 space-y-1">
                <div className="flex items-center gap-1.5 text-[#ff2a5f] font-bold">
                  <Shield className="w-4 h-4" />
                  <span>المدير العام (Admin)</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  كافة الصلاحيات: إنشاء، تعديل، حذف، وكتابة شاملة لكافة البيانات واللوائح.
                </p>
              </div>
            </div>
          </div>

          {/* Auth Form Box */}
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            {/* Mode Switcher */}
            <div className="flex bg-[#050707] p-1 rounded-2xl border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setPanelMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#00FFD2] text-black shadow-md font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setPanelMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#00FFD2] text-black shadow-md font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>حساب لاعب جديد</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('quick_roles');
                  setPanelMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'quick_roles'
                    ? 'bg-gradient-to-r from-amber-400 to-[#00FFD2] text-black shadow-md font-black'
                    : 'text-amber-300 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>تبديل الدور السريع</span>
              </button>
            </div>

            {/* MODE 1: LOGIN */}
            {authMode === 'login' && (
              <form onSubmit={handlePanelLogin} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-300 font-bold">طريقة تسجيل الدخول:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('phone')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        loginMethod === 'phone'
                          ? 'bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/30'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      رقم الهاتف
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        loginMethod === 'email'
                          ? 'bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/30'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      البريد الإلكتروني
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-bold">
                    {loginMethod === 'phone' ? 'رقم الهاتف السوري:' : 'البريد الإلكتروني:'}
                  </label>
                  <div className="relative">
                    {loginMethod === 'phone' ? (
                      <Phone className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                    ) : (
                      <Mail className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                    )}
                    <input
                      type={loginMethod === 'phone' ? 'tel' : 'email'}
                      value={inputIdentifier}
                      onChange={(e) => setInputIdentifier(e.target.value)}
                      placeholder={loginMethod === 'phone' ? 'مثال: 0945688090' : 'name@example.com'}
                      className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2] font-mono text-left direction-ltr"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-bold">كلمة المرور:</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={inputPassword}
                      onChange={(e) => setInputPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2] font-mono text-left direction-ltr"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-2.5 text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-3 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs glow-primary transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSigningIn ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
                </button>

                {/* Google Sign-In Option */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-xs">أو المصادقة الفورية</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>تسجيل الدخول بحساب Google</span>
                </button>
              </form>
            )}

            {/* MODE 2: REGISTER */}
            {authMode === 'register' && (
              <form onSubmit={handlePanelRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-bold">الاسم الكامل (الكابتن):</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="مثال: أحمد العلي"
                        className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-bold">رقم الهاتف:</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="09xxxxxxxx"
                        className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white font-mono focus:outline-none focus:border-[#00FFD2]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-bold">المحافظة (الـ 14):</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute right-3.5 top-3 text-gray-500 pointer-events-none" />
                      <select
                        value={regGov}
                        onChange={(e) => setRegGov(e.target.value as SyrianGovernorate)}
                        className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                      >
                        {SYRIAN_GOVERNORATES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-bold">البريد الإلكتروني (اختياري):</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-bold">تعيين كلمة المرور:</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="6 خانات أو أكثر"
                      className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-10 text-xs text-white font-mono focus:outline-none focus:border-[#00FFD2]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-2.5 text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-[#00FFD2] hover:opacity-90 text-black font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSigningIn ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}</span>
                </button>
              </form>
            )}

            {/* MODE 3: QUICK ROLES & TEST ROLES */}
            {authMode === 'quick_roles' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-300">
                  اختر الدور لاختبار صلاحيات المنصة ومطابقة شروط النظام:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Player Button */}
                  <div
                    onClick={() => handleQuickSwitchRole('player')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      currentUser.role === 'player' && !currentUser.isAdmin
                        ? 'bg-[#00FFD2]/15 border-[#00FFD2] shadow-lg'
                        : 'bg-[#050707] border-white/10 hover:border-[#00FFD2]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-[#00FFD2]/20 text-[#00FFD2]">
                          <User className="w-5 h-5" />
                        </span>
                        {currentUser.role === 'player' && !currentUser.isAdmin && (
                          <span className="text-[10px] bg-[#00FFD2] text-black px-2 py-0.5 rounded-full font-bold">
                            نشط
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-xs">مستخدم عادي (User)</h4>
                      <p className="text-[11px] text-gray-400 mt-1">
                        صلاحية حجز الملاعب، المباريات، والاشتراك بالدوريات. (لا يمكنه إنشاء ملاعب أو أكاديميات).
                      </p>
                    </div>
                    <button className="mt-3 w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#00FFD2] text-xs font-bold">
                      تفعيل دور المستخدم
                    </button>
                  </div>

                  {/* Advertiser Button */}
                  <div
                    onClick={() => handleQuickSwitchRole('advertiser')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      currentUser.role === 'advertiser' && !currentUser.isAdmin
                        ? 'bg-amber-400/15 border-amber-400 shadow-lg'
                        : 'bg-[#050707] border-white/10 hover:border-amber-400/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                          <Crown className="w-5 h-5" />
                        </span>
                        {currentUser.role === 'advertiser' && !currentUser.isAdmin && (
                          <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-bold">
                            نشط
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-xs">معلن معتمد (Advertiser)</h4>
                      <p className="text-[11px] text-gray-400 mt-1">
                        يمكنه إنشاء ونشر الملاعب، البطولات الكروية، والأكاديميات الرياضية.
                      </p>
                    </div>
                    <button className="mt-3 w-full py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-black text-xs font-bold">
                      تفعيل دور المعلن
                    </button>
                  </div>

                  {/* Admin Button */}
                  <div
                    onClick={() => handleQuickSwitchRole('admin')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      currentUser.isAdmin
                        ? 'bg-[#ff2a5f]/15 border-[#ff2a5f] shadow-lg'
                        : 'bg-[#050707] border-white/10 hover:border-[#ff2a5f]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-[#ff2a5f]/20 text-[#ff2a5f]">
                          <Shield className="w-5 h-5" />
                        </span>
                        {currentUser.isAdmin && (
                          <span className="text-[10px] bg-[#ff2a5f] text-white px-2 py-0.5 rounded-full font-bold">
                            نشط
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-xs">المدير العام (Admin)</h4>
                      <p className="text-[11px] text-gray-400 mt-1">
                        صلاحية كاملة: إنشاء، تعديل، حذف، كتابة، وإدارة المنصة العليا. (يتطلب بيانات المرور الرسمية).
                      </p>
                    </div>
                    <button className="mt-3 w-full py-1.5 rounded-lg bg-[#ff2a5f]/20 hover:bg-[#ff2a5f] text-[#ff2a5f] hover:text-white text-xs font-bold">
                      دخول المدير العام
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: My Bookings & Analytics */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-6">
          {/* Visual Analytics Chart */}
          <BookingAnalytics
            bookings={bookings}
            isOwnerView={false}
            title="تحليلات وإحصائيات حجوزاتي 📊"
            subtitle="مخطط بياني لتوزيع عدد الحجوزات شهرياً، وتوزيع الحالات والمبالغ المدفوعة"
          />

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00FFD2]" />
              حجوزاتي المباشرة في ملاعب سوريا
            </h3>
            <span className="text-xs text-gray-400">إجمالي الحجوزات: {bookings.length}</span>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-12 text-center space-y-3">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto" />
              <h4 className="text-base font-bold text-white">لا توجد لديك حجوزات سابقة</h4>
              <p className="text-xs text-gray-400">استعرض الملاعب المتاحة واحجز حصتك الكروية فوراً بـ 0% عمولة.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#0d1211] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#00FFD2]/40 transition-colors shadow-lg"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm sm:text-base">{b.playgroundName}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          b.status === 'مؤكد'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : b.status === 'قيد الانتظار'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {b.status === 'مؤكد' ? 'مؤكد' : b.status === 'قيد الانتظار' ? 'بانتظار تأكيد الدفع نقداً' : 'ملغي'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#00FFD2]" />
                        {b.selectedDates?.[0] || 'اليوم'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#00FFD2]" />
                        {b.timeSlot}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-amber-300">
                        <DollarSign className="w-3.5 h-3.5" />
                        {formatSYP(b.totalPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {onCancelBooking && b.status !== 'ملغي' && (
                      <button
                        onClick={() => onCancelBooking(b.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-colors cursor-pointer"
                      >
                        إلغاء الحجز
                      </button>
                    )}
                    <button
                      onClick={() =>
                        openWhatsAppShare(
                          `مرحباً، أود تأكيد حجزي للملعب: ${b.playgroundName} بتاريخ ${b.selectedDates?.[0] || 'اليوم'} الساعة ${b.timeSlot}`
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      تواصل واتساب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB: OWNER / ADVERTISER DASHBOARD */}
      {activeSubTab === 'owner_dashboard' && (
        <OwnerDashboard
          currentUser={currentUser}
          playgrounds={playgrounds}
          bookings={bookings}
          onGoBack={() => setActiveSubTab('profile')}
          onAddBooking={onAddBooking}
          onUpdateBookingStatus={onUpdateBookingStatus}
          onDeleteBooking={onDeleteBooking}
          onEditBooking={onEditBooking}
        />
      )}

      {/* SUBTAB 4: Security, Google Auth & Admin Controls */}
      {activeSubTab === 'security' && (
        <div className="space-y-5">
          {/* Google Auth Integration Card */}
          <div className="bg-[#0d1211] border border-blue-500/30 rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white p-2.5 flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">المصادقة السحابية عبر Google</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isGoogleSignedIn
                      ? `مرتبط بحساب: ${firebaseUser?.email || currentUser.email}`
                      : 'سجل دخولك بنقرة واحدة لحفظ كافة بياناتك على السحابة'}
                  </p>
                </div>
              </div>

              <div>
                {isGoogleSignedIn ? (
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج</span>
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isSigningIn}
                    className="px-5 py-2.5 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSigningIn ? 'animate-spin' : ''}`} />
                    <span>دخول Google</span>
                  </button>
                )}
              </div>
            </div>

            {/* Auth Error Notification */}
            {authError && (
              <div className="pt-2 border-t border-red-500/20">
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{authError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAuthError}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer self-end sm:self-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Management Section - Strictly shown only for authorized Super Admin */}
          <div className={`grid grid-cols-1 ${currentUser.isAdmin ? 'sm:grid-cols-2' : ''} gap-4`}>
            {currentUser.isAdmin && (
              <div className="bg-[#0d1211] border border-[#ff2a5f]/30 rounded-3xl p-5 space-y-3 shadow-lg shadow-[#ff2a5f]/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ff2a5f]/20 flex items-center justify-center text-[#ff2a5f]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">لوحة تحكم الإدارة العليا (مجلس الإدارة)</h4>
                </div>
                <p className="text-xs text-gray-400">
                  لوحة الإدارة المركزية والتحكم في كافة الملاعب، الدوريات، الحجوزات والمستخدمين وتعديل وحذف كل عنصر.
                </p>
                <button
                  onClick={onOpenAdminLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 glow-pink cursor-pointer shadow-md"
                >
                  <Lock className="w-4 h-4" />
                  <span>فتح لوحة الإدارة العليا</span>
                </button>
              </div>
            )}

            <div className="bg-[#0d1211] border border-red-500/20 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">حذف الحساب نهائياً</h4>
              </div>
              <p className="text-xs text-gray-400">
                حذف حسابك ومسح كافة الحجوزات والسجلات الخاصة بك من Firebase.
              </p>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-white border border-red-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف حسابي من المنصة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0d1211] border border-white/10 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">هل تريد تسجيل الخروج؟</h4>
            <p className="text-xs text-gray-400">
              يمكنك تسجيل الدخول في أي وقت باستخدام رقم هاتفك أو بريدك الإلكتروني.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0d1211] border border-red-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">تأكيد حذف الحساب نهائياً</h4>
                <p className="text-xs text-red-300">هذا الإجراء دائم ولا يمكن التراجع عنه</p>
              </div>
            </div>

            <form onSubmit={handleConfirmDeleteAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">سبب الحذف (اختياري):</label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="أخبرنا عن سبب رغبتك في حذف الحساب لمساعدتنا على التحسين..."
                  className="w-full bg-[#050707] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500 h-16"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">
                  للتأكيد، يرجى كتابة عبارة <strong className="text-red-400">"حذف حسابي"</strong>:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="حذف حسابي"
                  className="w-full bg-[#050707] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmText !== 'حذف حسابي' || isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold shadow-lg"
                >
                  {isDeleting ? 'جاري الحذف...' : 'حذف الحساب نهائياً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal Documents Modal */}
      <LegalDocumentsModal
        isOpen={isLegalModalOpen}
        defaultTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}
