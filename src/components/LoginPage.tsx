import React, { useState } from 'react';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  MapPin,
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserPlus,
  Shield
} from 'lucide-react';
import { useAuth, normalizeInputString, isAdminCredential } from '../context/AuthContext';
import AppOfficialLogo from './AppOfficialLogo';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';

export default function LoginPage() {
  const {
    signInWithPhonePassword,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    loginAsAdminDirect,
    authError,
    clearAuthError
  } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [governorate, setGovernorate] = useState('دمشق');

  const resetFormState = () => {
    clearAuthError();
    setLocalError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    const cleanPass = password.trim();

    if (loginMethod === 'phone') {
      const cleanPhone = normalizeInputString(phone);
      if (!cleanPhone || !cleanPass) {
        setLocalError('يرجى إدخال رقم الهاتف وكلمة المرور');
        return;
      }

      // Check if Admin
      if (isAdminCredential(phone, cleanPass) || isAdminCredential(cleanPhone, cleanPass)) {
        loginAsAdminDirect();
        return;
      }

      setLoading(true);
      try {
        const success = await signInWithPhonePassword(cleanPhone, cleanPass);
        if (!success) {
          setLocalError('رقم الهاتف أو كلمة المرور غير صحيحة');
        }
      } catch (err: any) {
        setLocalError('رقم الهاتف أو كلمة المرور غير صحيحة');
      } finally {
        setLoading(false);
      }
    } else {
      const cleanEmail = email.trim();
      if (!cleanEmail || !cleanPass) {
        setLocalError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
      }

      // Check if Admin
      if (isAdminCredential(cleanEmail, cleanPass)) {
        loginAsAdminDirect();
        return;
      }

      setLoading(true);
      try {
        await signInWithEmail(cleanEmail, cleanPass);
      } catch (err: any) {
        setLocalError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    const cleanPhone = normalizeInputString(phone);
    const cleanPass = password.trim();

    if (!fullName.trim() || !cleanPhone || !cleanPass) {
      setLocalError('يرجى إدخال كافة البيانات المطلوبة');
      return;
    }

    if (cleanPass.length < 4) {
      setLocalError('كلمة المرور يجب أن تتكون من 4 خانات على الأقل');
      return;
    }

    setLoading(true);
    try {
      const generatedEmail = email.trim() || `captain_${cleanPhone}@kaptan.sy`;
      await signUpWithEmail(generatedEmail, cleanPass, fullName.trim(), cleanPhone, governorate);
    } catch (err: any) {
      setLocalError(err?.message || 'تعذر إنشاء الحساب، يرجى التحقق من البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    resetFormState();
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminFill = () => {
    if (loginMethod === 'phone') {
      setPhone('0945688090');
    } else {
      setEmail('family2016amer@gmail.com');
    }
    setPassword('A123@123A');
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-screen bg-[#050707] text-white flex flex-col items-center justify-center p-4 font-['Cairo'] relative overflow-hidden selection:bg-[#00FFD2] selection:text-black">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00FFD2]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#0d1211]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand & App Official Logo Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AppOfficialLogo size="xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              تطبيق <span className="text-[#00FFD2]">الكابتن</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              المنصة الرياضية الأولى لحجز الملاعب والبطولات في سوريا
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs (Login / Register) */}
        <div className="flex bg-[#050707] p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              resetFormState();
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-[#00FFD2] text-black shadow-md shadow-[#00FFD2]/20 font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              resetFormState();
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-[#00FFD2] text-black shadow-md shadow-[#00FFD2]/20 font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* Error Notification Banner */}
        {activeError && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="leading-tight">{activeError}</span>
          </div>
        )}

        {/* --- LOGIN FORM --- */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Method switch: Phone or Email */}
            <div className="flex items-center justify-between text-xs pb-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('phone');
                    resetFormState();
                  }}
                  className={`pb-1 border-b-2 transition-colors font-bold cursor-pointer ${
                    loginMethod === 'phone'
                      ? 'border-[#00FFD2] text-[#00FFD2]'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  برقم الهاتف
                </button>
                <span className="text-gray-600">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    resetFormState();
                  }}
                  className={`pb-1 border-b-2 transition-colors font-bold cursor-pointer ${
                    loginMethod === 'email'
                      ? 'border-[#00FFD2] text-[#00FFD2]'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  بالبريد الإلكتروني
                </button>
              </div>

              {/* Quick Admin fill button */}
              <button
                type="button"
                onClick={handleQuickAdminFill}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-bold"
                title="تعبئة بيانات حساب الإدارة العليا"
              >
                <Shield className="w-3 h-3" />
                <span>حساب الأدمن</span>
              </button>
            </div>

            {loginMethod === 'phone' ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">رقم الهاتف:</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4 text-[#00FFD2]" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0945688090"
                    dir="ltr"
                    className="w-full bg-[#050707] border border-white/15 rounded-2xl pr-10 pl-3.5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2] font-mono text-left"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">البريد الإلكتروني:</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4 text-[#00FFD2]" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="family2016amer@gmail.com"
                    dir="ltr"
                    className="w-full bg-[#050707] border border-white/15 rounded-2xl pr-10 pl-3.5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2] font-mono text-left"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">كلمة المرور:</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4 text-[#00FFD2]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050707] border border-white/15 rounded-2xl pr-10 pl-11 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2] font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-white cursor-pointer"
                  title={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-[#00FFD2]" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00FFD2] to-[#00b293] text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FFD2]/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* --- REGISTER FORM --- */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-300">الاسم الكامل / اسم الكابتن:</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4 text-[#00FFD2]" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: كابتن أحمد السوري"
                  className="w-full bg-[#050707] border border-white/15 rounded-2xl pr-10 pl-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-300">رقم الهاتف (الأساسي للتواصل):</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4 text-[#00FFD2]" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  dir="ltr"
                  className="w-full bg-[#050707] border border-white/15 rounded-2xl pr-10 pl-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2] font-mono text-left"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-300">المحافظة:</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="w-4 h-4 text-[#00FFD2]" />
                </div>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full bg-[#050707] border border-white/15 rounded-2xl pr-10 pl-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FFD2] cursor-pointer"
                >
                  {SYRIAN_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-300">كلمة المرور:</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4 text-[#00FFD2]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="4 خانات على الأقل"
                  className="w-full bg-[#050707] border border-white/15 rounded-2xl pr-10 pl-11 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFD2] font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-white cursor-pointer"
                  title={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-[#00FFD2]" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00FFD2] to-[#00b293] text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FFD2]/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء الحساب والبدء</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider and Google One-Click Option */}
        <div className="relative pt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-[#0d1211] px-3 text-gray-500">أو عبر</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          <span>المتابعة باستخدام حساب Google</span>
        </button>

        {/* Security & Zero Commission Guarantee Footer */}
        <div className="text-center pt-1 border-t border-white/5">
          <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FFD2]" />
            <span>بياناتك محمية ومشفرة وفق أعلى معايير الخصوصية</span>
          </p>
        </div>
      </div>
    </div>
  );
}

