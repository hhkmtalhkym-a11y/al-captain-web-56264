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
  AlertCircle
} from 'lucide-react';
import { UserProfile, SyrianGovernorate } from '../types';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';
import { openWhatsAppShare, readImageAsBase64 } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

interface ProfileViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenAdminLogin: () => void;
  onOpenSupportModal: () => void;
}

export default function ProfileView({
  currentUser,
  onUpdateProfile,
  onOpenAdminLogin,
  onOpenSupportModal
}: ProfileViewProps) {
  const { firebaseUser, signInWithGoogle, signOutUser, authError, clearAuthError } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [governorate, setGovernorate] = useState<SyrianGovernorate>(currentUser.governorate);
  const [position, setPosition] = useState(currentUser.position || 'مهاجم صريح (ST)');
  const [image, setImage] = useState(currentUser.image || '');
  const [isSigningIn, setIsSigningIn] = useState(false);

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

  const handleGoogleLogout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign out error:', err);
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
    <div id="view-profile" className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
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
                <h2 className="text-xl sm:text-2xl font-black text-white font-['Cairo']">
                  {currentUser.name}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {currentUser.phone} • {currentUser.governorate}
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

      {/* Edit Profile Section */}
      <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Cairo']">
            <User className="w-5 h-5 text-[#00FFD2]" />
            البيانات الشخصية والإعدادات
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#00FFD2]" />
            {isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs text-gray-300 mb-1">تحديث الصورة الشخصية:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#00FFD2] file:text-black hover:file:bg-[#00e6bd]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">رقم الجوال:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">المحافظة السورية (الـ 14):</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value as SyrianGovernorate)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {SYRIAN_GOVERNORATES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">مركزك الرياضي المفضل:</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#00FFD2] text-black font-bold text-xs glow-primary"
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

      {/* Google Authentication & Account Link Card */}
      <div className="bg-[#0d1211] border border-blue-500/30 rounded-3xl p-6 space-y-4 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {authError && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={clearAuthError}
              className="text-gray-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

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
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white font-['Cairo']">
                  المصادقة السحابية وربط الحساب عبر Firebase Google Auth
                </h4>
                {isGoogleSignedIn && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    نشط
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {isGoogleSignedIn
                  ? `مرتبط بحساب Google: ${firebaseUser?.email || currentUser.email}`
                  : 'سجل دخولك بنقرة واحدة لحفظ حجوزاتك، اشتراكات الدوريات، وبطاقتك الرياضية'}
              </p>
            </div>
          </div>

          <div>
            {isGoogleSignedIn ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تم ربط الحساب</span>
                </span>
                <button
                  onClick={handleGoogleLogout}
                  className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="تسجيل الخروج من الحساب"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-gray-100 active:scale-95 text-gray-900 font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSigningIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-700" />
                    <span>جاري الاتصال بـ Google...</span>
                  </>
                ) : (
                  <>
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
                    <span>تسجيل الدخول عبر Google</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin and Quick Access Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Admin Access Panel Card */}
        <div className="bg-[#0d1211] border border-[#ff2a5f]/20 rounded-3xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#ff2a5f]/20 flex items-center justify-center text-[#ff2a5f]">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white font-['Cairo']">
                لوحة تحكم المدير العام (Admin)
              </h4>
            </div>
            <p className="text-xs text-gray-400">
              الدخول بلوحة التحكم المركزية لإدارة الملاعب، الحجوزات، الدوريات، والتقارير.
            </p>
          </div>

          <button
            onClick={onOpenAdminLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-[#ff2a5f] hover:bg-[#e02050] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 glow-pink"
          >
            <Lock className="w-4 h-4" />
            {currentUser.isAdmin ? 'لوحة تحكم المدير العام (مفعلة)' : 'تسجيل دخول الإدارة (0945688090)'}
          </button>
        </div>

        {/* Customer Support Card */}
        <div className="bg-[#0d1211] border border-[#00FFD2]/20 rounded-3xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#00FFD2]/20 flex items-center justify-center text-[#00FFD2]">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white font-['Cairo']">
                الدعم الفني المباشر
              </h4>
            </div>
            <p className="text-xs text-gray-400">
              فريق كابتن متواجد 24/7 لمساعدتك في أي استفسار أو مشكلة في الحجز.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onOpenSupportModal}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#050707] hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors"
            >
              محادثة الدعم 💬
            </button>
            <button
              onClick={() =>
                openWhatsAppShare(
                  'مرحباً فريق دعم تطبيق الكابتن، أحتاج مساعدة بخصوص الحجز أو الدوري.'
                )
              }
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              واتساب 📲
            </button>
          </div>
        </div>
      </div>

      {/* App Version & Terms */}
      <div className="bg-[#050707] border border-white/5 rounded-2xl p-4 text-center text-xs text-gray-500 space-y-1">
        <p className="font-bold text-gray-400">تطبيق الكابتن الرياضي المتكامل - Al-Kaptan Syria v2.6</p>
        <p>بدون أي عمولة إضافية 0% • مرخص ومخصص لجميع المحافظات السورية الـ 14</p>
      </div>
    </div>
  );
}
