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
  Heart,
  Award,
  BookOpen,
  Copy,
  Check,
  Printer,
  Compass,
  Building2,
  Calendar,
  Share2
} from 'lucide-react';
import AppOfficialLogo from './AppOfficialLogo';
import { openWhatsAppShare } from '../utils/helpers';

export type LegalTabType = 'terms' | 'privacy' | 'security' | 'fairplay' | 'version';

interface LegalDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: LegalTabType;
}

export default function LegalDocumentsModal({
  isOpen,
  onClose,
  defaultTab = 'terms'
}: LegalDocumentsModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTabType>(defaultTab);
  const [copiedSection, setCopiedSection] = useState(false);

  if (!isOpen) return null;

  const handleCopyLegalSummary = () => {
    const text = `📄 المستندات الرسمية والسياسات القانونية - تطبيق الكابتن الرياضي ⚽
━━━━━━━━━━━━━━━━━━━━━
✅ عمولة المنصة: 0% مجاناً بالكامل لكافة الملاعب في الجمهورية العربية السورية.
✅ قاعدة تثبيت الحجز: تأكيد الموعد قبل 24 ساعة لضمان الجاهزية.
✅ الخصوصية والأمان: تشفير كامل للبيانات، عدم بيع أو مشاركة أرقام الهواتف لأطراف إعلانية، ورقابة أمنية صارمة.
✅ ميثاق اللعب النظيف: التزام تام بالروح الرياضية، واحترام الحكام والمنشآت.
📲 رابط مراجعة المستندات الكاملة: ${window.location.origin}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSection(true);
      setTimeout(() => setCopiedSection(false), 2500);
    }
  };

  const handleShareWhatsAppDoc = () => {
    const docMsg = `📋 *المستندات والسياسات الرسمية لتطبيق الكابتن الرياضي* ⚽
━━━━━━━━━━━━━━━━━━━━━
تعرّف على الشروط المنظمة لحجز الملاعب والبطولات وسياسة حماية البيانات والخصوصية المعتمدة في سوريا بـ 0% عمولة:
🔗 ${window.location.origin}`;
    openWhatsAppShare(docMsg);
  };

  return (
    <div
      id="modal-legal-documents"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#00FFD2]/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl glow-primary my-auto text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#050707] shrink-0">
          <div className="flex items-center gap-3">
            <AppOfficialLogo size="md" />
            <div>
              <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <span>المستندات الرسمية، الخصوصية ومعلومات التطبيق</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/30 font-mono font-bold">
                  وثيقة معتمدة 2026
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                المرجع القانوني والتنظيمي الشامل لحجز الملاعب والبطولات والأمان الرياضي في سوريا
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLegalSummary}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5 hidden sm:flex items-center gap-1 text-xs"
              title="نسخ ملخص المستندات الرسمية"
            >
              {copiedSection ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الملخص</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsAppDoc}
              className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition-colors cursor-pointer border border-emerald-500/30 hidden sm:flex items-center gap-1 text-xs font-bold"
              title="مشاركة المستندات عبر واتساب"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-3 bg-[#080c0b] border-b border-white/10 overflow-x-auto scrollbar-thin shrink-0">
          {[
            { id: 'terms', label: 'شروط الاستخدام والخدمة', icon: Scale },
            { id: 'privacy', label: 'سياسة الخصوصية والبيانات', icon: FileText },
            { id: 'security', label: 'سياسة الأمان والتحكم', icon: Lock },
            { id: 'fairplay', label: 'ميثاق اللعب النظيف', icon: Award },
            { id: 'version', label: 'معلومات التطبيق والدعم', icon: Info }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LegalTabType)}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-sm text-gray-300 leading-relaxed scrollbar-thin">
          {/* TAB 1: Terms of Use */}
          {activeTab === 'terms' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-emerald-300 text-sm sm:text-base">
                    ميثاق الاستخدام الوطني بدون عمولة (0% Commission Platform)
                  </h4>
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                    تطبيق الكابتن هو منصة رياضية رقمية وطنية غير ربحية تهدف لتسهيل الوصول لمنشآت وملاعب كرة القدم في جميع المحافظات السورية الـ 14. لا تتقاضى المنصة أي نسبة أو عمولة خفية من اللاعبين أو أصحاب الملاعب على الإطلاق، وجميع التعاملات المالية المباشرة تتم بشفافية تامة.
                  </p>
                </div>
              </div>

              {/* Core Articles */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                    <span>المادة الأولى: أهلية التسجيل وحسابات المستخدمين</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pr-2">
                    يحق لكافة الرياضيين والهواة والمنظمين في سوريا إنشاء حساب شخصي مجاني عبر الاسم ورقم الهاتف الفعّال. يلتزم المستخدم بتقديم بيانات صحيحة، ويكون مسؤولاً مسؤولية كاملة عن الحجوزات والمباريات التي يثبتها عبر حسابه.
                  </p>
                </div>

                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                    <span>المادة الثانية: قواعد حجز الملاعب وتأكيد الدفع (قاعدة الـ 24 ساعة)</span>
                  </h4>
                  <div className="text-gray-400 space-y-1.5 leading-relaxed pr-2">
                    <p>
                      • يتم تثبيت الحجز عند سداد العربون أو كامل الأجرة نقداً في المنشأة أو عبر القنوات المعتمدة (مثل محفظة شام كاش، الهرم، الفؤاد أو الدفع عند الحضور).
                    </p>
                    <p>
                      • <strong>قاعدة الإلغاء والتعديل:</strong> يحق للمستأجر إلغاء الحجز أو تعديل الموعد قبل <strong>24 ساعة على الأقل</strong> من موعد المباراة دون أي غرامة. في حال الإلغاء قبل أقل من 24 ساعة، يحق لإدارة الملعب مصادرة العربون لتعويض حجز الموعد.
                    </p>
                    <p>
                      • في حال حدوث ظروف قاهرة (انقطاع مفاجئ بالكهرباء، أمطار طوفانية، أو صيانة طارئة للأرضية)، يلتزم الملعب بتأمين موعد بديل مكافئ أو إعادة الدفعة بالكامل فوراً.
                    </p>
                  </div>
                </div>

                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                    <span>المادة الثالثة: التزامات أصحاب المنشآت الرياضية والملاعب</span>
                  </h4>
                  <div className="text-gray-400 space-y-1 leading-relaxed pr-2">
                    <p>• ضمان سلامة العشب (طبيعي أو صناعي) وتوفير شبكات مرمى سليمة وتخطيط قانوني للأرضية.</p>
                    <p>• تأمين إنارة كافية ومستقرة خلال الفترات المسائية والليلية وغرف تبديل ملابس ومياه نظيفة.</p>
                    <p>• الالتزام الصارم بالأسعار المعلنة في التطبيق دون فرض أي رسوم إضافية غير معتمدة على الفرق.</p>
                  </div>
                </div>

                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                    <span>المادة الرابعة: لوائح البطولات والدوريات الكروية</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pr-2">
                    تنظم كافة البطولات المعلنة في التطبيق وفق لوائح تنظيمية محددة تشمل عدد اللاعبين (5v5، 7v7، 11v11)، مدة الشوطين، جوائز المركز الأول والثاني، وتعيين حكام معتمدين لضمان النزاهة والحياد.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Privacy Policy */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
                <Lock className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-blue-300 text-sm sm:text-base">
                    سياسة الخصوصية وحماية البيانات الشخصية المشفرة
                  </h4>
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                    نحن نلتزم بأقصى المعايير الأخلاقية والتقنية لحماية خصوصية بيانات اللاعبين والمدربين وأصحاب الملاعب، ونؤكد التزامنا التام بعدم بيع أو استغلال أي معلومة شخصية لأي جهة إعلانية أو تجارية.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                    <span>1. البيانات التي يتم جمعها والغرض منها:</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-400 pr-2 leading-relaxed">
                    <li>
                      <strong>بيانات الهوية والتواصل:</strong> الاسم، رقم الهاتف، والمحافظة لإنشاء الحساب وتنسيق مواعيد الحجوزات بين كابتن الفريق وإدارة الملعب.
                    </li>
                    <li>
                      <strong>الموقع الجغرافي:</strong> يُستخدم فقط لحساب المسافة وخط السير إلى الملاعب عبر خرائط Google التفاعلية داخل التطبيق.
                    </li>
                    <li>
                      <strong>سجل الحجوزات والتحديات:</strong> لأرشفة تاريخ المباريات وإتاحة تكرار الحجز وإصدار الفواتير الرسمية.
                    </li>
                    <li>
                      <strong>بطاقة كشاف المواهب:</strong> الطول، الوزن، القدم المفضلة، والموقع فقط إذا رغب اللاعب في نشر بطاقته للكشافين والأكاديميات.
                    </li>
                  </ul>
                </div>

                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                    <span>2. مشاركة البيانات مع أطراف ثالثة:</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pr-2">
                    لا يتم تزويد أي شركة أو جهة دعائية خارجية بأي بيانات تخص المستخدمين. يتم عرض رقم الهاتف فقط بين طرفي الحجز (المستأجر وصاحب الملعب) لغرض تأكيد المباراة والتنسيق عبر واتساب أو الاتصال الهاتفي المباشر.
                  </p>
                </div>

                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                    <span>3. حق الحذف والنسيان الرقمي (Right to be Forgotten):</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pr-2">
                    يحق لأي مستخدم في أي وقت طلب حذف حسابه بالكامل وجميع سجلاته وحجوزاته من قاعدة البيانات عبر التواصل مع إدارة المنصة أو الدعم الفني، وسيتم الحذف النهائي فوراً دون أي استبقاء.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Security Policy */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-[#ff2a5f]/10 border border-[#ff2a5f]/30 rounded-2xl p-4 flex items-start gap-3">
                <Lock className="w-6 h-6 text-[#ff2a5f] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-red-300 text-sm sm:text-base">
                    سياسة الأمان والتحكم بالصلاحيات وحماية المنظومة
                  </h4>
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                    يعتمد تطبيق الكابتن على بنية تحتية سحابية مشفرة ونظام تدقيق صارم يضمن فصل الصلاحيات ومنع التلاعب بالحجوزات أو البيانات الحساسة.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                    <span>1. نظام الأدوار والصلاحيات الصارم (RBAC Matrix):</span>
                  </h4>
                  <div className="space-y-1.5 text-gray-400 pr-2">
                    <p>• <strong>المستخدم العادي (Player/User):</strong> حجز الملاعب، نشر تحديات المباريات، المشاركة بالبطولات، ومتابعة حجوزاته الخاصة فقط.</p>
                    <p>• <strong>المعلن المعتمد (Pitch Owner / Advertiser):</strong> إدارة ملعبه الخاص، تعديل الأسعار وساعات العمل، وتأكيد الحجوزات الواردة لملعبه حصراً.</p>
                    <p>• <strong>المدير العام (Super Admin):</strong> التحكم المركزي بكافة الملاعب والبطولات والمستخدمين ومراجعة سجلات التدقيق وسجل الحظر.</p>
                  </div>
                </div>

                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                    <span>2. منع التضارب والحجوزات المزدوجة (Double Booking Prevention):</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pr-2">
                    تمت برمجة خوارزمية الحجز للتحقق الفوري من توافر الفترة الزمنية (Time Slot) وقفل الساعة لمنع قيام أكثر من فريق بحجز نفس الساعة في نفس الملعب بالتوازي، مما يضمن دقة بنسبة 100%.
                  </p>
                </div>

                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2]" />
                    <span>3. سجل التدقيق الإداري (Audit Trail & Logging):</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pr-2">
                    يتم تدوين كافة العمليات الحساسة (إنشاء ملاعب، تعديل فئات أو أسعار، حذف بطولات، حظر مستخدمين) في سجل عمليات مشفر لا يمكن التلاعب به، مع تسجيل التوقيت وهوية الحساب المنفّذ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Fair Play Charter */}
          {activeTab === 'fairplay' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                <Award className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-amber-300 text-sm sm:text-base">
                    ميثاق اللعب النظيف والأخلاق الرياضية والانضباط
                  </h4>
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                    الرياضة رسالة سامية وأخلاق قبل أن تكون فوزاً وخسارة. تلتزم منصة الكابتن بتطبيق ميثاق أخلاقي صارم لكافة المباريات والتحديات الودية والبطولات الرسمية في سوريا.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>1. بنود الروح الرياضية الإلزامية:</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-400 pr-2 leading-relaxed">
                    <li>احترام قرارات الحكام والمنظمين حتى في حال الاختلاف في وجهات النظر.</li>
                    <li>المصافحة الودية بين الفريقين قبل انطلاق اللقاء وبعد إطلاق صافرة النهاية.</li>
                    <li>المحافظة على منشآت ومرافق الملعب (الشباك، الإنارة، المقاعد، غرف التبديل).</li>
                    <li>الالتزام بالحضور بالزي الرياضي المناسب وتفادي تشابه ألوان الأطقم بين المتنافسين.</li>
                  </ul>
                </div>

                <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>2. لائحة العقوبات والانضباط:</span>
                  </h4>
                  <div className="text-gray-400 space-y-1.5 leading-relaxed pr-2">
                    <p>• <strong>المخالفات البسيطة:</strong> تأخر غير مبرر عن موعد المباراة ينتج عنه إنذار رسمي مسجل في الملف الشخصي.</p>
                    <p>• <strong>السلوك غير الرياضي:</strong> الألفاظ النابية أو التدخلات العنيفة المتعمدة تعرض اللاعب للإيقاف لمباراتين وحرمانه من البطولات.</p>
                    <p>• <strong>الشغب أو الاعتداء:</strong> يؤدي إلى حظر رقم الهاتف والحساب نهائياً من المنصة، وإدراج الفريق في القائمة السوداء لجميع ملاعب المحافظة.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Version & App Information */}
          {activeTab === 'version' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-[#050707] border border-white/10 text-center space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#00FFD2]/5 rounded-full blur-3xl pointer-events-none"></div>
                <AppOfficialLogo size="xl" className="mx-auto relative z-10" />
                <div className="relative z-10">
                  <h4 className="text-xl font-black text-white">تطبيق الكابتن الرياضي - Al-Captain</h4>
                  <p className="text-xs text-[#00FFD2] font-mono font-bold mt-1">
                    الإصدار الرسمي v2.6.0 (Golden Syrian Release 2026)
                  </p>
                </div>
                <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed relative z-10">
                  المنظومة الوطنية الرائدة لإدارة وحجز ملاعب كرة القدم، دوريات الهواة والشركات، الأكاديميات الكروية، ونظام كشاف المواهب الشاب في كافة أرجاء الجمهورية العربية السورية.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[11px]">الإدارة المركزية المعتمدة:</span>
                  <strong className="text-white font-bold text-sm">كابتن عامر (إدارة منصة الكابتن)</strong>
                  <p className="text-[11px] text-gray-400">إشراف رياضي معتمد لكافة المحافظات السورية</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[11px]">خط الدعم الفني وواتساب:</span>
                  <strong className="text-emerald-400 font-bold font-mono text-sm" dir="ltr">
                    +963 933 000 000
                  </strong>
                  <p className="text-[11px] text-gray-400">خدمة عملاء ودعم حجوزات على مدار الساعة 24/7</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[11px]">المحافظات المشمولة بالخدمة:</span>
                  <strong className="text-white font-bold text-sm">جميع المحافظات السورية الـ 14</strong>
                  <p className="text-[11px] text-gray-400">دمشق، ريف دمشق، حلب، حمص، حماة، اللاذقية، طرطوس، درعا، السويداء، القنيطرة، دير الزور، الرقة، الحسكة، وإدلب.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-gray-400 block text-[11px]">عمولة المنصة على الحجوزات:</span>
                  <strong className="text-emerald-400 font-bold text-sm">0% بدون أي عمولة أو استقطاع</strong>
                  <p className="text-[11px] text-gray-400">التعامل مباشر تماماً بين اللاعب وصاحب الملعب</p>
                </div>
              </div>

              {/* Direct Support Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const supportMsg = `مرحباً إدارة تطبيق الكابتن، أود الاستفسار بخصوص الدعم الفني والحجوزات ⚽`;
                    openWhatsAppShare(supportMsg);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-900/40"
                >
                  <Phone className="w-4 h-4" />
                  <span>مراسلة الدعم الفني عبر واتساب</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsAppDoc}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-white/10 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#00FFD2]" />
                  <span>مشاركة بيانات التطبيق مع الأصدقاء</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050707] border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-400">
            جميع الحقوق محفوظة © 2026 تطبيق الكابتن الرياضي في سوريا
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#00FFD2] text-black font-black text-xs hover:bg-[#00e6bd] transition-colors cursor-pointer shadow-md glow-primary"
          >
            إغلاق ومتابعة
          </button>
        </div>
      </div>
    </div>
  );
}

