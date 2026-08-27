import React, { useState, useEffect } from 'react';
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
  Scale
} from 'lucide-react';
import { UserProfile, SyrianGovernorate, Booking } from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { openWhatsAppShare, readImageAsBase64, formatSYP, loadFromLocalStorage, saveToLocalStorage } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import AppOfficialLogo from './AppOfficialLogo';
import LegalDocumentsModal from './LegalDocumentsModal';

interface ProfileViewProps {
  currentUser: UserProfile;
  bookings?: Booking[];
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenAdminLogin: () => void;
  onOpenSupportModal: () => void;
  onCancelBooking?: (bookingId: string) => void;
}

export default function ProfileView({
  currentUser,
  bookings = [],
  onUpdateProfile,
  onOpenAdminLogin,
  onOpenSupportModal,
  onCancelBooking
}: ProfileViewProps) {
  const {
    firebaseUser,
    signInWithGoogle,
    signOutUser,
    deleteUserAccount,
    authError,
    clearAuthError
  } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'bookings' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [governorate, setGovernorate] = useState<SyrianGovernorate>(currentUser.governorate);
  const [position, setPosition] = useState(currentUser.position || 'مهاجم صريح (ST)');
  const [image, setImage] = useState(currentUser.image || '');
  const [isSigningIn, setIsSigningIn] = useState(false);

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
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in with Google error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleConfirmLogout = async () => {
    try {
      await signOutUser();
      setIsLogoutModalOpen(false);
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
  };

  const isGoogleSignedIn = !!firebaseUser || (!!currentUser.email && currentUser.email.includes('@'));

  return (
    <div id="view-profile" className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto font-['Cairo']">
      {/* Profile Navigation Tabs (Profile / My Bookings / Security) */}
      <div className="flex bg-[#0d1211] p-1.5 rounded-2xl border border-white/10 gap-1.5">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'profile'
              ? 'bg-[#00FFD2] text-black shadow-lg glow-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>الملف الشخصي والبيانات</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative ${
            activeSubTab === 'bookings'
              ? 'bg-[#00FFD2] text-black shadow-lg glow-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>حجوزاتي المباشرة</span>
          {bookings.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeSubTab === 'bookings' ? 'bg-black text-[#00FFD2]' : 'bg-[#00FFD2] text-black'
            }`}>
              {bookings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'security'
              ? 'bg-[#00FFD2] text-black shadow-lg glow-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>الأمان وتسجيل الدخول</span>
        </button>
      </div>

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
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {currentUser.name}
                    </h2>
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
                    {currentUser.isAdmin ? (
                      <span className="px-3 py-1 rounded-full bg-[#ff2a5f]/20 border border-[#ff2a5f]/40 text-[#ff2a5f] text-xs font-bold flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> المدير العام (Admin)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-[#00FFD2]/15 border border-[#00FFD2]/30 text-[#00FFD2] text-xs font-bold flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> كابتن معتمد
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-gray-300">
                  <span className="bg-[#050707] px-3 py-1.5 rounded-xl border border-white/5">
                    ⚽ المركز: {currentUser.position || 'مهاجم صريح (ST)'}
                  </span>
                  <span className="bg-[#050707] px-3 py-1.5 rounded-xl border border-white/5 text-emerald-400">
                    ✨ عمولة المنصة: 0% مجاني
                  </span>
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
                className="text-xs text-[#00FFD2] hover:underline flex items-center gap-1 font-bold"
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
                <div className={`p-2.5 rounded-2xl ${pushEnabled ? 'bg-[#00FFD2]/20 text-[#00FFD2]' : 'bg-gray-800 text-gray-400'}`}>
                  {pushEnabled ? <BellRing className="w-5 h-5 animate-pulse" /> : <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">إشعارات وتنبيهات الحجوزات والمباريات (Push Notifications)</h4>
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
                  <Lock className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <strong className="text-white text-xs block">سياسة الخصوصية وحماية البيانات</strong>
                    <span className="text-[11px] text-gray-400">سرية أرقام الهواتف والمواقع</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setLegalModalTab('security');
                  setIsLegalModalOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-[#050707] hover:bg-white/5 border border-white/10 text-right transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#ff2a5f] group-hover:scale-110 transition-transform" />
                  <div>
                    <strong className="text-white text-xs block">سياسة الأمان وصلاحيات الأدمن</strong>
                    <span className="text-[11px] text-gray-400">حماية الصلاحيات وسجلات التدقيق</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setLegalModalTab('version');
                  setIsLegalModalOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-[#050707] hover:bg-white/5 border border-white/10 text-right transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <strong className="text-white text-xs block">عن التطبيق ومعلومات الإصدار</strong>
                    <span className="text-[11px] text-[#00FFD2]">الإصدار 2.5.0 Gold Release</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Quick Support and Logout Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0d1211] border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={onOpenSupportModal}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Headphones className="w-4 h-4 text-[#00FFD2]" />
              <span>الدعم الفني المباشر</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 2: My Bookings ("حجوزاتي") with 24H Cash Payment Policy */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4">
          {/* Mandatory 24H Payment Policy Notice */}
          <div className="bg-[#0d1211] border-2 border-amber-400/40 rounded-3xl p-5 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>سياسة الدفع وتأكيد الحجز قبل 24 ساعة:</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              ⚠️ يجب تسديد الدفعة نقداً لصاحب الملعب أو تأكيد الحجز قبل <strong>24 ساعة على الأقل</strong> من موعد المباراة، وإلا سيتم إلغاء الحجز تلقائياً لإتاحة الساعة لفرق أخرى.
            </p>
          </div>

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-[#0d1211] rounded-3xl border border-white/10 space-y-3">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto" />
              <h4 className="text-sm font-bold text-gray-300">لا توجد حجوزات مسجلة حالياً</h4>
              <p className="text-xs text-gray-500">احجز ملعبك المفضل في ثوانٍ من قسم الملاعب.</p>
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
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
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

      {/* SUBTAB 3: Security, Google Auth & Admin Controls */}
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
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="px-3 py-1.5 rounded-xl bg-[#00FFD2] text-black font-bold text-xs hover:bg-[#00e6bd] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح بنافذة مستقلة</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearAuthError}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="إغلاق التنبيه"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Admin Access & Support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0d1211] border border-[#ff2a5f]/20 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#ff2a5f]/20 flex items-center justify-center text-[#ff2a5f]">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">لوحة تحكم الإدارة العليا</h4>
              </div>
              <p className="text-xs text-gray-400">
                تسجيل دخول الإدارة المركزية والمنظمين للتحكم في المنظومة بالكامل.
              </p>
              <button
                onClick={onOpenAdminLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-[#ff2a5f] hover:bg-[#e02050] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 glow-pink cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>لوحة التحكم والدخول</span>
              </button>
            </div>

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="bg-[#0d1211] border-2 border-white/20 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">هل ترغب في تسجيل الخروج؟</h3>
            <p className="text-xs text-gray-400">
              سيتم إنهاء جلستك الحالية والعودة لوضع الزائر.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                تأكيد الخروج
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-[#0d1211] border-2 border-red-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl font-['Cairo']"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-red-500/20 pb-3">
              <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">تأكيد حذف الحساب نهائياً</h3>
                <p className="text-xs text-red-400">إجراء لا يمكن التراجع عنه</p>
              </div>
            </div>

            <form onSubmit={handleConfirmDeleteAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">سبب حذف الحساب (اختياري):</label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="أخبرنا عن سبب رغبتك في المغادرة..."
                  rows={2}
                  className="w-full bg-[#050707] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  يرجى كتابة <span className="text-red-400 font-mono">حذف حسابي</span> للتأكيد:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="حذف حسابي"
                  className="w-full bg-[#050707] border border-red-500/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500 text-center"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isDeleting || deleteConfirmText !== 'حذف حسابي'}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? 'جاري الحذف...' : 'حذف الحساب نهائياً'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal Documents Modal */}
      <LegalDocumentsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        defaultTab={legalModalTab}
      />
    </div>
  );
}
