import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  Info,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  ExternalLink,
  Phone,
  Mail,
  Heart
} from 'lucide-react';
import AppOfficialLogo from './AppOfficialLogo';

interface LegalDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'security' | 'terms' | 'version';
}

export default function LegalDocumentsModal({
  isOpen,
  onClose,
  defaultTab = 'terms'
}: LegalDocumentsModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'security' | 'terms' | 'version'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div
      id="modal-legal-documents"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#00FFD2]/30 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl glow-primary my-auto font-['Cairo'] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#050707]">
          <div className="flex items-center gap-3">
            <AppOfficialLogo size="md" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>المستندات الرسمية والسياسات القانونية</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/30">
                  منصة الكابتن
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                الوثائق المنظمة لاستخدام الملاعب والبطولات والأمان في سوريا
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-3 bg-[#080c0b] border-b border-white/10 overflow-x-auto scrollbar-thin">
          {[
            { id: 'terms', label: 'شروط الاستخدام (Terms of Use)', icon: Scale },
            { id: 'privacy', label: 'سياسة الخصوصية (Privacy Policy)', icon: FileText },
            { id: 'security', label: 'سياسة الأمان (Security Policy)', icon: Lock },
            { id: 'version', label: 'معلومات الإصدار (Version & Info)', icon: Info }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#00FFD2] text-black shadow-lg shadow-[#00FFD2]/20 font-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-sm text-gray-300 leading-relaxed">
          {/* TAB 1: Terms of Use */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300 text-sm">ميثاق الاستخدام بدون عمولة (0% Commission)</h4>
                  <p className="text-xs text-gray-300 mt-1">
                    تطبيق الكابتن هو منصة رياضية وطنية غير ربحية تهدف لتشجيع الرياضة وتسهيل حجوزات الملاعب وإدارة البطولات لكافة اللاعبين والأكاديميات وأصحاب المنشآت في جميع المحافظات السورية.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                  <span>1. قواعد الحجز وتأكيد الدفع (قاعدة 24 ساعة):</span>
                </h4>
                <p className="text-gray-400 pl-4 border-r-2 border-[#00FFD2]/40 pr-3">
                  يجب على المستخدم تأكيد الحجز مع إدارة الملعب أو تسديد الدفعة نقداً أو عبر شام كاش قبل <strong>24 ساعة على الأقل</strong> من موعد الساعة، وإلا يحق لإدارة الملعب إلغاء الحجز وإتاحته لفرق أخرى.
                </p>

                <h4 className="font-bold text-white text-sm flex items-center gap-2 pt-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                  <span>2. التزامات أصحاب المنشآت والمعلنين:</span>
                </h4>
                <p className="text-gray-400 pl-4 border-r-2 border-[#00FFD2]/40 pr-3">
                  يلتزم صاحب الملعب بتجهيز أرضية الملعب والإضاءة وغرف تبديل الملابس والخدمات المتفق عليها عند تأكيد الحجز، وتحديث الأسعار والأوقات المتاحة بانتظام عبر لوحة التحكم.
                </p>

                <h4 className="font-bold text-white text-sm flex items-center gap-2 pt-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                  <span>3. الأخلاق الرياضية وقوانين المباريات:</span>
                </h4>
                <p className="text-gray-400 pl-4 border-r-2 border-[#00FFD2]/40 pr-3">
                  يحظر استخدام أي ألفاظ أو تصرفات غير رياضية، وفي حال حدوث مشاجرات أو مخالفات جسيمة، يحق لإدارة المنصة حظر حساب اللاعب أو الفريق نهائياً وتدوين ذلك في سجلات الانضباط.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Privacy Policy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-300 text-sm">حماية البيانات والخصوصية</h4>
                  <p className="text-xs text-gray-300 mt-1">
                    نحن نحرص بأعلى درجات الأمان على سرية بيانات اللاعبين وأرقام هواتفهم ومواقعهم الجغرافية.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                  <span>البيانات التي نقوم بجمعها:</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-400 pr-2">
                  <li>الاسم ورقم الهاتف والمحافظة لإنشاء الحساب وتأكيد الحجوزات الرياضية.</li>
                  <li>الموقع الجغرافي للملاعب لتسهيل ملاحة اللاعبين والوصول للمنشآت عبر الخرائط التفاعلية.</li>
                  <li>سجل المباريات وبطاقات اللاعبين في قسم كشاف المواهب بعد موافقة اللاعب الصريحة.</li>
                </ul>

                <h4 className="font-bold text-white text-sm flex items-center gap-2 pt-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                  <span>مشاركة البيانات والطرف الثالث:</span>
                </h4>
                <p className="text-gray-400 pr-3 border-r-2 border-[#00FFD2]/40">
                  لا نقوم ببيع أو مشاركة أي بيانات شخصية مع أطراف دعائية خارجية. يتم تداول رقم الهاتف فقط بين طرفي الحجز (اللاعب وصاحب الملعب) لغايات التنسيق المباشر.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Security Policy */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#ff2a5f]/10 border border-[#ff2a5f]/30 rounded-2xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#ff2a5f] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-300 text-sm">سياسة الأمان والتحكم بصلاحيات الأدمن</h4>
                  <p className="text-xs text-gray-300 mt-1">
                    منظومة أمنية صارمة تضمن حجب كافة وظائف الإدارة الحساسة عن غير المخولين.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                  <span>صلاحيات الوصول المقيدة (RBAC Security):</span>
                </h4>
                <p className="text-gray-400 pr-3 border-r-2 border-[#00FFD2]/40">
                  يتم حصر عمليات الحذف والتعديل المتقدم وإدارة المستخدمين واعتماد الحسابات لـ <strong>المدير العام (isAdmin)</strong> حصراً، مع تشفير جلسات الاتصال وربطها بقواعد حماية Firestore الأمنية.
                </p>

                <h4 className="font-bold text-white text-sm flex items-center gap-2 pt-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                  <span>سجل التدقيق الشامل (Audit Logs):</span>
                </h4>
                <p className="text-gray-400 pr-3 border-r-2 border-[#00FFD2]/40">
                  كافة الحركات الهامة بما فيها إنشاء أو حذف الملاعب والبطولات وتغيير رتب المستخدمين يتم تسجيلها في سجل مركزي مشفر للرجوع إليها في أي وقت.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Version Information */}
          {activeTab === 'version' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-[#050707] border border-white/10 text-center space-y-3">
                <AppOfficialLogo size="xl" className="mx-auto" />
                <div>
                  <h4 className="text-lg font-black text-white">تطبيق الكابتن - Al-Captain</h4>
                  <p className="text-xs text-[#00FFD2] font-mono">الإصدار 2.5.0 (Gold Release 2026)</p>
                </div>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  المنظومة الرياضية الشاملة لإدارة وحجز ملاعب كرة القدم، البطولات والدوريات، الأكاديميات التدريبية، وكشاف المواهب في الجمهورية العربية السورية.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[11px]">المدير العام المعتمد:</span>
                  <strong className="text-white font-bold">كابتن عامر (0945688090)</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[11px]">البريد الإلكتروني للإدارة:</span>
                  <strong className="text-[#00FFD2] font-mono">family2016amer@gmail.com</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[11px]">المحافظات المشمولة:</span>
                  <strong className="text-white">كافة المحافظات السورية الـ 14</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[11px]">نسبة عمولة المنصة:</span>
                  <strong className="text-emerald-400 font-bold">0% مجاناً بالكامل</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050707] border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            جميع الحقوق محفوظة © 2026 تطبيق الكابتن
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00FFD2] text-black font-black text-xs hover:bg-[#00e6bd] transition-colors cursor-pointer"
          >
            إغلاق ومتابعة
          </button>
        </div>
      </div>
    </div>
  );
}
