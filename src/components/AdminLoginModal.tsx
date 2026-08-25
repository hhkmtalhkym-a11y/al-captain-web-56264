import React, { useState } from 'react';
import { ShieldCheck, Lock, Phone, X, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [identifier, setIdentifier] = useState('family2016amer@gmail.com');
  const [password, setPassword] = useState('A123@123A');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      // Validate credentials specified: family2016amer@gmail.com or 0945688090 & password A123@123A
      const cleanId = identifier.trim().toLowerCase();
      if (
        (cleanId === 'family2016amer@gmail.com' || cleanId === '0945688090' || cleanId === '+963945688090' || cleanId === '963945688090') &&
        password === 'A123@123A'
      ) {
        onSuccess();
        onClose();
      } else {
        setError('بيانات الدخول غير صحيحة! يرجى التحقق من البريد أو الجوال (family2016amer@gmail.com / 0945688090) وكلمة المرور.');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleFillDemo = () => {
    setIdentifier('family2016amer@gmail.com');
    setPassword('A123@123A');
  };

  return (
    <div
      id="modal-admin-login"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#00FFD2]/40 rounded-2xl w-full max-w-md p-6 relative glow-primary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-admin-login"
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-[#00FFD2]/20 pb-4">
          <div className="w-12 h-12 rounded-xl bg-[#00FFD2]/10 border border-[#00FFD2]/40 flex items-center justify-center text-[#00FFD2]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-['Cairo']">تسجيل دخول الإدارة العليا</h2>
            <p className="text-xs text-gray-400">لوحة التحكم والسيطرة الشاملة لتطبيق الكابتن</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#ff2a5f]/10 border border-[#ff2a5f]/40 flex items-center gap-2 text-xs text-[#ff2a5f]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              البريد الإلكتروني أو رقم جوال الأدمن
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute right-3 top-3 text-gray-500" />
              <input
                id="input-admin-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="family2016amer@gmail.com أو 0945688090"
                className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#00FFD2] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              كلمة المرور السرية
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute right-3 top-3 text-gray-500" />
              <input
                id="input-admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050707] border border-[#00FFD2]/20 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#00FFD2] transition-colors"
                required
              />
            </div>
          </div>

          <div className="bg-[#050707] p-2.5 rounded-lg border border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span>الحساب الإداري الثابت مهيأ:</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[#00FFD2] hover:underline flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3 h-3" /> تعبئة تلقائية
            </button>
          </div>

          <div className="pt-2">
            <button
              id="btn-submit-admin-login"
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold py-3 px-4 rounded-xl transition-all glow-primary flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'جاري التحقق...' : 'دخول لوحة التحكم الإدارية'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
