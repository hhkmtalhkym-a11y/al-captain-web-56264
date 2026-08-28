import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, CheckCircle2, UserCheck, X } from 'lucide-react';
import { UserProfile } from '../types';
import { getUserRoleBadge } from '../utils/permissions';

interface PermissionDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType?: 'playground' | 'league' | 'academy' | 'edit_delete' | 'general';
  currentUser?: UserProfile;
  onOpenLogin: () => void;
}

export default function PermissionDeniedModal({
  isOpen,
  onClose,
  actionType = 'general',
  currentUser,
  onOpenLogin
}: PermissionDeniedModalProps) {
  if (!isOpen) return null;

  const roleInfo = getUserRoleBadge(currentUser);

  let title = 'الصلاحية مخصصة للمعلنين وإدارة المنصة';
  let subtitle = 'المستخدمون العاديون لا يمكنهم إنشاء ملاعب أو أكاديميات أو دوريات.';

  if (actionType === 'playground') {
    title = 'خاص بالمعلنين وأصحاب الملاعب';
    subtitle = 'إضافة ونشر الملاعب محصورة بحسابات المعلنين المعتمدين وإدارة المنصة.';
  } else if (actionType === 'league') {
    title = 'خاص بالمعلنين ومنظمي البطولات';
    subtitle = 'إنشاء وتنظيم الدوريات والبطولات متاح فقط للمعلنين ومنظمي الدوريات وإدارة المنصة.';
  } else if (actionType === 'academy') {
    title = 'خاص بالمعلنين والأكاديميات الرياضية';
    subtitle = 'تسجيل وإضافة الأكاديميات الكروية متاح للمعلنين المعتمدين وإدارة المنصة.';
  } else if (actionType === 'edit_delete') {
    title = 'خاص بالإدارة العليا (Admin)';
    subtitle = 'تعديل وحذف وكتابة البيانات المرجعية مقفل ومحمٍ للمدير العام فقط.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0d1211] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white font-['Cairo']">
              {title}
            </h3>
            <p className="text-xs text-amber-300/90 font-medium">
              تحديد أدوار وصلاحيات المنصة
            </p>
          </div>
        </div>

        {/* Current Role Box */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">حسابك الحالي:</span>
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${roleInfo.colorClass}`}>
              {roleInfo.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Rules Summary */}
        <div className="space-y-2 text-xs text-gray-300 bg-[#050707] p-3.5 rounded-2xl border border-white/5">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>المعلن:</strong> يمكنه إنشاء الملاعب والدوريات والأكاديميات.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#ff2a5f] shrink-0 mt-0.5" />
            <span><strong>المدير العام (Admin):</strong> يملك كافة الصلاحيات بالإضافة إلى التعديل والحذف والكتابة.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FFD2] shrink-0 mt-0.5" />
            <span><strong>المستخدم العادي:</strong> حجز الملاعب، المشاركة بالبطولات، والتسجيل بالأكاديميات.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>تسجيل دخول معلن / أدمن</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
