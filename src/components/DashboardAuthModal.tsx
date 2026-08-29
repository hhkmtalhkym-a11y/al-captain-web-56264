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
  Smartphone,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SYRIAN_GOVERNORATES } from '../constants/syrianData';

interface DashboardAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  promptTitle?: string;
  promptMessage?: string;
}

type AuthMode = 'phone' | 'email' | 'register' | 'forgot' | 'whatsappOtp';

export default function DashboardAuthModal({
  isOpen,
  onClose,
  onSuccess,
  promptTitle,
  promptMessage
}: DashboardAuthModalProps) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithPhonePassword,
    resetUserPassword,
    authError,
    clearAuthError,
    updateCurrentUser
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

  // Hidden admin secret unlock counter
  const [secretAdminClicks, setSecretAdminClicks] = useState(0);
  const [showSecretAdminPrompt, setShowSecretAdminPrompt] = useState(false);
  const [secretAdminKey, setSecretAdminKey] = useState('');

  if (!isOpen) return null;

  const resetState = () => {
    clearAuthError();
    setLocalError('');
    setSuccessMsg('');
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!phone.trim() || !password) {
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
        }, 500);
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
    if (!email.trim() || !password) {
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
      }, 500);
    } catch (err: any) {
      setLocalError(err?.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!email.trim() || !password || !fullName.trim() || !phone.trim()) {
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
      }, 600);
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
      }, 500);
    } catch (err: any) {
      setLocalError(err?.message || 'تعذر تسجيل الدخول عبر Google');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!email.trim()) {
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
      }, 500);
      setLoading(false);
    }, 400);
  };

  // Secret admin unlock: 5 taps on shield icon
  const handleSecretShieldClick = () => {
    const next = secretAdminClicks + 1;
    setSecretAdminClicks(next);
    if (next >= 5) {
      setShowSecretAdminPrompt(true);
      setSecretAdminClicks(0);
    }
  };

  const handleSecretAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretAdminKey === 'A123@123A') {
      updateCurrentUser({
        id: 'usr-admin-sy',
        name: 'المدير العام (الإدارة العليا)',
        email: 'admin@kaptan-app.sy',
        phone: '0988000111',
        governorate: 'دمشق',
        role: 'admin',
        isAdmin: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      });
      setSuccessMsg('تم تفعيل صلاحيات المدير العام بنجاح!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 500);
    } else {
      setLocalError('رمز التفويض الإداري غير صحيح');
    }
  };

  return (
    <div
      id="modal-dashboard-auth"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#00FFD2]/30 rounded-3xl w-full max-w-md p-5 sm:p-6 relative shadow-2xl font-['Cairo'] my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
          <div
            onClick={handleSecretShieldClick}
            className="w-11 h-11 rounded-2xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex items-center justify-center text-[#00FFD2] shrink-0 cursor-pointer select-none"
            title="تسجيل الدخول الآمن"
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {promptTitle || 'تسجيل الدخول وحساب الكابتن'}
            </h2>
            <p className="text-[11px] text-gray-400">المنصة الكروية السورية الموحدة • 0% عمولة</p>
          </div>
        </div>

        {/* Action Prompt Banner */}
        {promptMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 text-white text-xs flex items-center gap-2.5 animate-fadeIn">
            <Sparkles className="w-5 h-5 text-[#00FFD2] shrink-0" />
            <span className="font-semibold leading-relaxed text-[#00FFD2]">{promptMessage}</span>
          </div>
        )}

        {/* Secret Admin Prompt (Only visible if 5 clicks triggered) */}
        {showSecretAdminPrompt && (
          <form onSubmit={handleSecretAdminLogin} className="mb-4 p-3 rounded-2xl bg-black/90 border border-purple-500/50 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>الوصول الإداري السري</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSecretAdminPrompt(false)}
                className="text-gray-400 hover:text-white text-[10px]"
              >
                إلغاء
              </button>
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gray-500" />
              <input
                type="password"
                value={secretAdminKey}
                onChange={(e) => setSecretAdminKey(e.target.value)}
                placeholder="أدخل مفتاح التحقق الإداري..."
                className="w-full bg-[#050707] border border-purple-500/40 rounded-xl py-2 pr-9 pl-3 text-xs text-white focus:outline-none focus:border-purple-400"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              تفعيل وضع المدير العام
            </button>
          </form>
        )}

        {/* Mode Tabs (Clean, user-facing tabs only - No Admin Tab) */}
        <div className="flex bg-[#050707] p-1 rounded-2xl border border-white/10 mb-4 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('phone');
              resetState();
            }}
            className={`flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
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
            className={`flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
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
            className={`flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
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
            className={`flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
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
          <div className="mb-3 p-2.5 rounded-xl bg-[#ff2a5f]/15 border border-[#ff2a5f]/40 text-xs text-[#ff2a5f] space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ff2a5f]" />
              <span className="leading-relaxed">{localError || authError}</span>
            </div>
            {((localError || authError || '').includes('منبثقة') || (localError || authError || '').includes('popup')) && (
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="px-3 py-1.5 rounded-lg bg-[#00FFD2] text-black font-bold text-[11px] hover:bg-[#00e6bd] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح التطبيق في نافذة مستقلة</span>
                </button>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-start gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Phone + Password Login (Primary) */}
        {mode === 'phone' && (
          <form onSubmit={handlePhoneLogin} className="space-y-3.5 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                رقم الهاتف الجوال
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXX"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00FFD2] font-mono transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-300">كلمة المرور</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#00FFD2] hover:underline cursor-pointer"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-11 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00FFD2] transition-colors font-sans"
                  required
                />
                {/* Clear Eye Icon to toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-2 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور بوضوح'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#00FFD2]" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs sm:text-sm transition-all shadow-lg glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول برقم الهاتف'}
            </button>
          </form>
        )}

        {/* Tab 2: Email + Password Login */}
        {mode === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-3.5 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00FFD2] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-300">كلمة المرور</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#00FFD2] hover:underline cursor-pointer"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-11 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00FFD2] transition-colors font-sans"
                  required
                />
                {/* Clear Eye Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-2 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور بوضوح'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#00FFD2]" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs sm:text-sm transition-all shadow-lg glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول بالبريد'}
            </button>
          </form>
        )}

        {/* Tab 3: WhatsApp OTP */}
        {mode === 'whatsappOtp' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                رقم الجوال لتلقي رمز الواتساب
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXX"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendWhatsAppOtp}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>إرسال رمز OTP عبر الواتساب</span>
              </button>
            ) : (
              <form onSubmit={handleVerifyWhatsAppOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    أدخل رمز التحقق (OTP)
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#050707] border border-emerald-400 rounded-xl py-2 px-4 text-center text-base tracking-widest font-mono text-white focus:outline-none"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
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
          <form onSubmit={handleRegister} className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-0.5">الاسم الكامل</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="الكابتن أحمد"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-0.5">رقم الهاتف</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXX"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-0.5">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="captain@example.com"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-0.5">المحافظة</label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full bg-[#050707] border border-white/15 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {SYRIAN_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-0.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 pr-8 pl-9 text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-2 text-gray-400 hover:text-white p-0.5"
                  title={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
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
          <form onSubmit={handleForgotPassword} className="space-y-3.5">
            <p className="text-xs text-gray-300 leading-relaxed">
              أدخل بريدك الإلكتروني المسجل وسنقوم بإرسال رابط آمن لإعادة تعيين كلمة المرور فوراً.
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3.5 top-3 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="captain@example.com"
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2.5 pr-10 pl-4 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00FFD2]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <KeyRound className="w-4 h-4" />
              <span>إرسال رابط الاستعادة</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('phone')}
              className="w-full text-center text-xs text-gray-400 hover:text-white py-1 cursor-pointer"
            >
              العودة لتسجيل الدخول
            </button>
          </form>
        )}

        {/* Divider & Google Login Button */}
        {mode !== 'register' && mode !== 'forgot' && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2 sm:py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-md disabled:opacity-50 cursor-pointer"
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
        <div className="mt-3 pt-1 text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>حماية وتشفير البيانات عبر Firebase Security SSL</span>
        </div>
      </div>
    </div>
  );
}
