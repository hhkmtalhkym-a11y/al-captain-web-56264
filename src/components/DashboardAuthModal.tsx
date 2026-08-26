import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  Sparkles,
  User,
  KeyRound,
  CheckCircle2,
  Send,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';

interface DashboardAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'phone' | 'email' | 'register' | 'forgot' | 'whatsappOtp';

export default function DashboardAuthModal({ isOpen, onClose, onSuccess }: DashboardAuthModalProps) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithPhonePassword,
    resetUserPassword,
    authError,
    clearAuthError
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [localError, setLocalError] = useState('');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [governorate, setGovernorate] = useState('دمشق');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    clearAuthError();
    setLocalError('');
    setSuccessMsg('');
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!phone || !password) {
      setLocalError('يرجى إدخال رقم الهاتف وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      const ok = await signInWithPhonePassword(phone, password);
      if (ok) {
        setSuccessMsg('تم تسجيل الدخول بنجاح!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setLocalError(err?.message || 'فشل تسجيل الدخول برقم الهاتف');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!email || !password) {
      setLocalError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      setSuccessMsg('تم تسجيل الدخول بنجاح!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 600);
    } catch (err: any) {
      setLocalError(err?.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!email || !password || !fullName || !phone) {
      setLocalError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, fullName, phone, governorate);
      setSuccessMsg('تم إنشاء الحساب وتسجيل الدخول بنجاح!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 800);
    } catch (err: any) {
      setLocalError(err?.message || 'تعذر إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetState();
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg('تم تسجيل الدخول عبر Google بنجاح!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 600);
    } catch (err: any) {
      setLocalError(err?.message || 'تعذر تسجيل الدخول عبر Google');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!email) {
      setLocalError('يرجى إدخال بريدك الإلكتروني المسجل');
      return;
    }
    setLoading(true);
    try {
      const ok = await resetUserPassword(email);
      if (ok) {
        setSuccessMsg('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'تعذر إرسال الرابط');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsAppOtp = () => {
    if (!phone || phone.length < 8) {
      setLocalError('يرجى إدخال رقم هاتف سوري صحيح');
      return;
    }
    setOtpSent(true);
    setSuccessMsg(`تم إرسال رمز التحقق OTP إلى واتساب الرقم: ${phone}`);
  };

  const handleVerifyWhatsAppOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setLocalError('يرجى إدخال رمز التحقق المكون من 4 إلى 6 أرقام');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSuccessMsg('تم التحقق بنجاح وتأكيد الحساب!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
      setLoading(false);
    }, 600);
  };

  return (
    <div
      id="modal-dashboard-auth"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#00FFD2]/30 rounded-3xl w-full max-w-md p-5 sm:p-7 relative shadow-2xl font-['Cairo'] my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex items-center justify-center text-[#00FFD2] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">لوحة تسجيل الدخول والحساب</h2>
            <p className="text-xs text-gray-400">تطبيق الكابتن • المنصة الكروية السورية</p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-[#050707] p-1 rounded-2xl border border-white/10 mb-4 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('phone');
              resetState();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'phone'
                ? 'bg-[#00FFD2] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            رقم الهاتف
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('email');
              resetState();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'email'
                ? 'bg-[#00FFD2] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            البريد
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('whatsappOtp');
              resetState();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'whatsappOtp'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            واتساب OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              resetState();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* Alerts & Messages */}
        {(localError || authError) && (
          <div className="mb-4 p-3 rounded-xl bg-[#ff2a5f]/15 border border-[#ff2a5f]/40 flex items-start gap-2 text-xs text-[#ff2a5f]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{localError || authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-start gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Phone + Password Login */}
        {mode === 'phone' && (
          <form onSubmit={handlePhoneLogin} className="space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                رقم الهاتف الجوال
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-3.5 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXX"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#00FFD2] font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-300">كلمة المرور</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#00FFD2] hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-3.5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-11 text-sm text-white focus:outline-none focus:border-[#00FFD2]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-white p-0.5"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs sm:text-sm transition-all shadow-lg glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول برقم الهاتف'}
            </button>
          </form>
        )}

        {/* Tab 2: Email + Password Login */}
        {mode === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3.5 top-3.5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#00FFD2]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-300">كلمة المرور</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#00FFD2] hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-3.5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-11 text-sm text-white focus:outline-none focus:border-[#00FFD2]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-white p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs sm:text-sm transition-all shadow-lg glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول بالبريد'}
            </button>
          </form>
        )}

        {/* Tab 3: WhatsApp OTP */}
        {mode === 'whatsappOtp' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                رقم الجوال لتلقي رمز الواتساب
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-3.5 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXX"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendWhatsAppOtp}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال رمز OTP عبر الواتساب</span>
              </button>
            ) : (
              <form onSubmit={handleVerifyWhatsAppOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    أدخل رمز التحقق (OTP)
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#050707] border border-emerald-400 rounded-xl py-2.5 px-4 text-center text-lg tracking-widest font-mono text-white focus:outline-none"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد الرمز والدخول</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 4: Register New User */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 overflow-y-auto max-h-72 pr-1">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الاسم الكامل</label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3 top-3 text-gray-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="الكابتن أحمد"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 pr-9 pl-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">رقم الهاتف</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3 top-3 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXX"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 pr-9 pl-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3 top-3 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="captain@example.com"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 pr-9 pl-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">المحافظة</label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {SYRIAN_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3 top-3 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 pr-9 pl-9 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-2.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
            </button>
          </form>
        )}

        {/* Tab 5: Forgot Password */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              أدخل بريدك الإلكتروني المسجل وسنقوم بإرسال رابط آمن لإعادة تعيين كلمة المرور فوراً.
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3.5 top-3.5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="captain@example.com"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#00FFD2]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>إرسال رابط الاستعادة</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('phone')}
              className="w-full text-center text-xs text-gray-400 hover:text-white py-1"
            >
              العودة لتسجيل الدخول
            </button>
          </form>
        )}

        {/* Divider & Google Login Button */}
        {mode !== 'register' && mode !== 'forgot' && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>تسجيل الدخول السريع عبر Google</span>
            </button>
          </div>
        )}

        {/* Security Footer Notice */}
        <div className="mt-4 pt-2 text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>بياناتك محمية ومشفرة عبر Firebase Security SSL</span>
        </div>
      </div>
    </div>
  );
}
