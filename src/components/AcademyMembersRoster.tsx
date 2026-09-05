import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Calendar,
  MapPin,
  Sparkles,
  Download,
  Trash2,
  Edit2,
  FileText,
  Activity,
  Heart,
  DollarSign,
  UserCheck,
  Send,
  X,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { Academy, AcademyMember, AcademyRegistration, PlayerPosition, PreferredFoot } from '../types';
import { formatSYP, openWhatsAppShare, exportAcademyReportExcel } from '../utils/helpers';

interface AcademyMembersRosterProps {
  academy: Academy;
  academyRegistrations?: AcademyRegistration[];
  canManage: boolean;
  onUpdateAcademy: (updated: Academy) => void;
}

export default function AcademyMembersRoster({
  academy,
  academyRegistrations = [],
  canManage,
  onUpdateAcademy
}: AcademyMembersRosterProps) {
  const members = academy.members || [];

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AcademyMember | null>(null);
  const [activeDetailsMember, setActiveDetailsMember] = useState<AcademyMember | null>(null);

  // Form State for Add / Edit Member
  const [formData, setFormData] = useState<Partial<AcademyMember>>({
    fullName: '',
    birthDate: '',
    ageGroupMin: 8,
    ageGroupMax: 12,
    ageGroupLabel: 'أشبال (8 - 12 سنة)',
    installmentStatus: 'غير مدفوع',
    installmentAmount: academy.monthlyFee || 75000,
    residence: `${academy.governorate} - `,
    phone: '',
    position: 'وسط',
    preferredFoot: 'اليمنى',
    height: 145,
    weight: 42,
    bloodType: 'O+',
    medicalNotes: 'سليم، لا توجد أمراض مزمنة',
    emergencyContact: '',
    personalNotes: ''
  });

  // Calculate summary metrics
  const totalCount = members.length;
  const paidCount = members.filter((m) => m.installmentStatus === 'مدفوع').length;
  const unpaidCount = members.filter((m) => m.installmentStatus === 'غير مدفوع').length;
  const partialCount = members.filter((m) => m.installmentStatus === 'مسدد جزئياً').length;
  const totalRevenue = members.reduce(
    (acc, m) => acc + (m.installmentStatus === 'مدفوع' ? (m.installmentAmount || academy.monthlyFee || 0) : 0),
    0
  );

  // Filter pending registrations from students for this academy
  const matchingRegistrations = academyRegistrations.filter(
    (r) => r.academyId === academy.id || r.academyName === academy.name
  );

  // Find registrations that haven't been added yet
  const existingRegistrationIds = new Set(members.map((m) => m.registrationId).filter(Boolean));
  const newImportableRegistrations = matchingRegistrations.filter(
    (r) => !existingRegistrationIds.has(r.id)
  );

  // Open Add modal with fresh data
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      fullName: '',
      birthDate: '',
      ageGroupMin: 8,
      ageGroupMax: 12,
      ageGroupLabel: 'أشبال (8 - 12 سنة)',
      installmentStatus: 'غير مدفوع',
      installmentAmount: academy.monthlyFee || 75000,
      residence: `${academy.governorate} - `,
      phone: '',
      position: 'وسط',
      preferredFoot: 'اليمنى',
      height: 145,
      weight: 42,
      bloodType: 'O+',
      medicalNotes: 'سليم، لا توجد أمراض مزمنة',
      emergencyContact: '',
      personalNotes: '',
      joinedDate: new Date().toISOString().split('T')[0]
    });
    setIsAddModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (member: AcademyMember) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsAddModalOpen(true);
  };

  // Save Member (Add or Update)
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim() || !formData.phone?.trim()) {
      alert('يرجى كتابة الاسم الثلاثي ورقم الجوال للمنتسب');
      return;
    }

    const birthYear = formData.birthDate ? new Date(formData.birthDate).getFullYear() : undefined;
    const currentYear = new Date().getFullYear();
    const age = birthYear ? currentYear - birthYear : formData.age || 10;

    let updatedList: AcademyMember[];

    if (editingMember) {
      // Update existing
      updatedList = members.map((m) =>
        m.id === editingMember.id
          ? ({
              ...m,
              ...formData,
              fullName: formData.fullName!.trim(),
              birthYear,
              age,
              installmentAmount: Number(formData.installmentAmount) || academy.monthlyFee || 0
            } as AcademyMember)
          : m
      );
    } else {
      // Create new
      const newMember: AcademyMember = {
        id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        fullName: formData.fullName!.trim(),
        birthDate: formData.birthDate || `${currentYear - 10}-01-01`,
        birthYear,
        age,
        ageGroupMin: Number(formData.ageGroupMin) || 8,
        ageGroupMax: Number(formData.ageGroupMax) || 12,
        ageGroupLabel: formData.ageGroupLabel || `${formData.ageGroupMin} - ${formData.ageGroupMax} سنة`,
        installmentStatus: formData.installmentStatus || 'غير مدفوع',
        installmentAmount: Number(formData.installmentAmount) || academy.monthlyFee || 0,
        installmentDate:
          formData.installmentStatus === 'مدفوع' ? new Date().toISOString().split('T')[0] : undefined,
        paymentMethod: formData.paymentMethod || 'كاش',
        residence: formData.residence || academy.governorate,
        phone: formData.phone!.trim(),
        position: formData.position || 'وسط',
        preferredFoot: formData.preferredFoot || 'اليمنى',
        height: Number(formData.height) || 145,
        weight: Number(formData.weight) || 40,
        bloodType: formData.bloodType || 'O+',
        medicalNotes: formData.medicalNotes || 'لا توجد ملاحظات طبية',
        emergencyContact: formData.emergencyContact || formData.phone!.trim(),
        personalNotes: formData.personalNotes || '',
        joinedDate: formData.joinedDate || new Date().toISOString().split('T')[0]
      };
      updatedList = [newMember, ...members];
    }

    onUpdateAcademy({
      ...academy,
      members: updatedList
    });

    setIsAddModalOpen(false);
    setEditingMember(null);
  };

  // Quick Toggle Installment Status
  const handleQuickToggleInstallment = (memberId: string) => {
    if (!canManage) return;
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    let nextStatus: 'مدفوع' | 'غير مدفوع' | 'مسدد جزئياً' = 'مدفوع';
    if (target.installmentStatus === 'مدفوع') nextStatus = 'غير مدفوع';
    else if (target.installmentStatus === 'غير مدفوع') nextStatus = 'مسدد جزئياً';
    else nextStatus = 'مدفوع';

    const updatedList = members.map((m) =>
      m.id === memberId
        ? {
            ...m,
            installmentStatus: nextStatus,
            installmentDate: nextStatus === 'مدفوع' ? new Date().toISOString().split('T')[0] : m.installmentDate
          }
        : m
    );

    onUpdateAcademy({
      ...academy,
      members: updatedList
    });
  };

  // Delete Member
  const handleDeleteMember = (memberId: string, name: string) => {
    if (!canManage) return;
    if (window.confirm(`هل أنت متأكد من حذف المنتسب "${name}" من سجل الأكاديمية نهائياً؟`)) {
      const updatedList = members.filter((m) => m.id !== memberId);
      onUpdateAcademy({
        ...academy,
        members: updatedList
      });
    }
  };

  // Auto-Import all student registrations into academy members roster
  const handleAutoImportRegistrations = () => {
    if (!canManage) return;
    if (newImportableRegistrations.length === 0) {
      alert('جميع طلبات تسجيل الطلاب الحالية مضافة بالفعل إلى جدول المنتسبين.');
      return;
    }

    if (
      !window.confirm(
        `هل تريد استيراد (${newImportableRegistrations.length}) طالب مسجل تلقائياً إلى جدول المنتسبين مع بياناتهم الشخصية وأقساطهم؟`
      )
    ) {
      return;
    }

    const currentYear = new Date().getFullYear();
    const importedMembers: AcademyMember[] = newImportableRegistrations.map((reg) => {
      const bYear = reg.birthDate ? new Date(reg.birthDate).getFullYear() : undefined;
      const age = reg.age || (bYear ? currentYear - bYear : 10);

      let minAge = 8;
      let maxAge = 12;
      if (reg.ageGroup.includes('براعم')) {
        minAge = 6;
        maxAge = 9;
      } else if (reg.ageGroup.includes('أشبال')) {
        minAge = 9;
        maxAge = 12;
      } else if (reg.ageGroup.includes('ناشئين')) {
        minAge = 13;
        maxAge = 15;
      } else if (reg.ageGroup.includes('شباب')) {
        minAge = 16;
        maxAge = 18;
      }

      return {
        id: `mem-import-${reg.id}`,
        fullName: reg.studentName,
        birthDate: reg.birthDate || '',
        birthYear: bYear,
        age,
        ageGroupMin: minAge,
        ageGroupMax: maxAge,
        ageGroupLabel: reg.ageGroup || `${minAge} - ${maxAge} سنة`,
        installmentStatus: reg.paymentStatus === 'مدفوع' ? 'مدفوع' : 'غير مدفوع',
        installmentAmount: academy.monthlyFee || 75000,
        installmentDate: reg.paymentStatus === 'مدفوع' ? reg.createdAt.split('T')[0] : undefined,
        paymentMethod: reg.paymentMethod || 'كاش',
        residence: `${reg.governorate} - ${reg.city || ''}`,
        phone: reg.parentPhone || '',
        position: reg.preferredPosition || 'وسط',
        preferredFoot: 'اليمنى',
        medicalNotes: 'طلب تسجيل إلكتروني عبر المنصة',
        emergencyContact: reg.parentPhone,
        personalNotes: reg.notes || `ولي الأمر: ${reg.parentName}`,
        joinedDate: reg.createdAt ? reg.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        registrationId: reg.id,
        photo: reg.studentPhoto
      };
    });

    const updatedList = [...importedMembers, ...members];
    onUpdateAcademy({
      ...academy,
      members: updatedList
    });

    alert(`تم بنجاح استيراد ${importedMembers.length} طالب وإضافتهم إلى جدول المنتسبين!`);
  };

  // Export roster to printable report
  const handlePrintRoster = () => {
    window.print();
  };

  // Filtered members
  const filteredMembers = members.filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchPhone = m.phone.toLowerCase().includes(q);
      const matchResidence = m.residence.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchResidence) return false;
    }
    if (filterPayment !== 'all' && m.installmentStatus !== filterPayment) {
      return false;
    }
    if (filterAgeGroup !== 'all') {
      if (filterAgeGroup === 'براعم' && !(m.ageGroupMax <= 9 || m.ageGroupLabel?.includes('براعم'))) return false;
      if (filterAgeGroup === 'أشبال' && !(m.ageGroupMin >= 8 && m.ageGroupMax <= 12 || m.ageGroupLabel?.includes('أشبال'))) return false;
      if (filterAgeGroup === 'ناشئين' && !(m.ageGroupMin >= 12 && m.ageGroupMax <= 16 || m.ageGroupLabel?.includes('ناشئين'))) return false;
      if (filterAgeGroup === 'شباب' && !(m.ageGroupMin >= 15 || m.ageGroupLabel?.includes('شباب'))) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn font-['Cairo']">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#070b0a] border border-white/10 text-center flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>إجمالي المنتسبين</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-white font-mono">{totalCount}</strong>
          <span className="text-[10px] text-gray-500 mt-1">طالب مسجل</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span>الأقساط المسددة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{paidCount}</strong>
          <span className="text-[10px] text-emerald-300/80 mt-1">{formatSYP(totalRevenue)}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/30 text-center flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-400 text-xs mb-1">
            <span>غير مسددين</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-red-400 font-mono">{unpaidCount}</strong>
          <span className="text-[10px] text-red-300/80 mt-1">بحاجة متابعة</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-center flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
            <span>مسدد جزئياً</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{partialCount}</strong>
          <span className="text-[10px] text-amber-300/80 mt-1">دفعة أولى</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#070b0a] p-3.5 rounded-2xl border border-white/10">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم الثلاثي، الجوال، السكن..."
              className="w-full bg-[#0d1211] border border-white/10 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-[#0d1211] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-purple-400"
          >
            <option value="all">كل حالات القسط</option>
            <option value="مدفوع">مسدد (مدفوع)</option>
            <option value="غير مدفوع">غير مدفوع (مطلوب)</option>
            <option value="مسدد جزئياً">مسدد جزئياً</option>
          </select>

          <select
            value={filterAgeGroup}
            onChange={(e) => setFilterAgeGroup(e.target.value)}
            className="bg-[#0d1211] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-purple-400"
          >
            <option value="all">كافة الفئات العمرية</option>
            <option value="براعم">براعم (6 - 9 سنوات)</option>
            <option value="أشبال">أشبال (9 - 12 سنة)</option>
            <option value="ناشئين">ناشئين (13 - 15 سنة)</option>
            <option value="شباب">شباب (16 - 18 سنة)</option>
          </select>
        </div>

        {/* Management Buttons */}
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            {newImportableRegistrations.length > 0 && (
              <button
                type="button"
                onClick={handleAutoImportRegistrations}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                title="استيراد الطلاب المسجلين إلكترونياً تلقائياً"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>استيراد تلقائي ({newImportableRegistrations.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => exportAcademyReportExcel(academy, academyRegistrations)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              title="تصدير كشف المنتسبين والبيانات المالية للأكاديمية إلى ملف إكسل XLSX"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير إكسل Excel</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتسب جديد</span>
            </button>

            <button
              type="button"
              onClick={handlePrintRoster}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold transition-colors flex items-center gap-1.5"
              title="طباعة كشف المنتسبين"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طباعة الكشف</span>
            </button>
          </div>
        )}
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#070b0a]">
        <table className="w-full text-xs text-right">
          <thead>
            <tr className="bg-[#121c18] border-b border-white/10 text-gray-300 font-bold">
              <th className="py-3 px-3">الاسم الثلاثي</th>
              <th className="py-3 px-2 text-center">المواليد / العمر</th>
              <th className="py-3 px-2 text-center">الفئة العمرية (من - إلى)</th>
              <th className="py-3 px-3 text-center">تسديد القسط</th>
              <th className="py-3 px-2">السكن والمنطقة</th>
              <th className="py-3 px-2">رقم الجوال</th>
              <th className="py-3 px-2 text-center">المركز والمعلومات</th>
              {canManage && <th className="py-3 px-3 text-center">الإجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 8 : 7} className="py-12 text-center text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p>لا يوجد منتسبون مطابقون لخيارات البحث حالياً</p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="mt-3 px-4 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-500/30 inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> إضافة أول منتسب في الأكاديمية
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                  {/* Name & Photo */}
                  <td className="py-3 px-3 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0 overflow-hidden">
                        {member.photo ? (
                          <img src={member.photo} alt={member.fullName} className="w-full h-full object-cover" />
                        ) : (
                          member.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{member.fullName}</span>
                          {member.registrationId && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono" title="مسجل إلكترونياً">
                              تلقائي
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          انتسب: {member.joinedDate || '2026-08'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Birth Date & Age */}
                  <td className="py-3 px-2 text-center text-gray-300 font-mono">
                    <div>
                      <strong className="text-white text-xs">{member.birthDate || `${member.birthYear || 2014}`}</strong>
                      <span className="block text-[10px] text-purple-300">({member.age || 11} سنة)</span>
                    </div>
                  </td>

                  {/* Age Group From - To */}
                  <td className="py-3 px-2 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 text-[11px] font-bold inline-block">
                      {member.ageGroupMin} - {member.ageGroupMax} سنة
                    </span>
                    <span className="block text-[9px] text-gray-400 mt-0.5">{member.ageGroupLabel}</span>
                  </td>

                  {/* Installment Status */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickToggleInstallment(member.id)}
                        disabled={!canManage}
                        title={canManage ? 'انقر لتغيير حالة القسط سريعاً' : ''}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 ${
                          member.installmentStatus === 'مدفوع'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                            : member.installmentStatus === 'مسدد جزئياً'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                        } ${canManage ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {member.installmentStatus === 'مدفوع' && <CheckCircle2 className="w-3 h-3" />}
                        {member.installmentStatus === 'مسدد جزئياً' && <Clock className="w-3 h-3" />}
                        {member.installmentStatus === 'غير مدفوع' && <XCircle className="w-3 h-3" />}
                        <span>{member.installmentStatus}</span>
                      </button>

                      <span className="text-[10px] text-gray-400 font-mono">
                        {formatSYP(member.installmentAmount || academy.monthlyFee || 0)}
                      </span>
                    </div>
                  </td>

                  {/* Residence */}
                  <td className="py-3 px-2 text-gray-300 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="truncate max-w-[130px]">{member.residence}</span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3 px-2 text-xs font-mono text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <span>{member.phone}</span>
                      <button
                        type="button"
                        onClick={() =>
                          openWhatsAppShare(
                            `السلام عليكم، بخصوص الأكاديمية والمنتسب ${member.fullName}:`,
                            member.phone
                          )
                        }
                        className="p-1 rounded-md bg-emerald-900/30 hover:bg-emerald-900/60 text-emerald-400 transition-colors"
                        title="مراسلة واتساب"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Personal & Special Player Info */}
                  <td className="py-3 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveDetailsMember(member)}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <Activity className="w-3 h-3 text-[#00FFD2]" />
                      <span>{member.position || 'لاعب'}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  {canManage && (
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(member)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-600/30 text-gray-300 hover:text-purple-300 transition-colors"
                          title="تعديل بيانات المنتسب"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id, member.fullName)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 transition-colors"
                          title="حذف المنتسب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Member Details Drawer / Modal */}
      {activeDetailsMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveDetailsMember(null)}
        >
          <div
            className="bg-[#0d1211] border border-purple-500/30 rounded-3xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center">
                  {activeDetailsMember.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{activeDetailsMember.fullName}</h4>
                  <span className="text-xs text-purple-300 font-mono">
                    {activeDetailsMember.birthDate} ({activeDetailsMember.age} سنة)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailsMember(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#070b0a] border border-white/5">
                <span className="text-gray-400 block text-[10px]">مركز اللعب:</span>
                <strong className="text-white">{activeDetailsMember.position || 'خط وسط'}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070b0a] border border-white/5">
                <span className="text-gray-400 block text-[10px]">القدم المفضلة:</span>
                <strong className="text-white">{activeDetailsMember.preferredFoot || 'اليمنى'}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070b0a] border border-white/5">
                <span className="text-gray-400 block text-[10px]">الطول والوزن:</span>
                <strong className="text-white font-mono">
                  {activeDetailsMember.height || '--'} سم • {activeDetailsMember.weight || '--'} كغ
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070b0a] border border-white/5">
                <span className="text-gray-400 block text-[10px]">زمرة الدم:</span>
                <strong className="text-red-400 font-mono">{activeDetailsMember.bloodType || 'O+'}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#070b0a] border border-white/5 space-y-1 text-xs">
              <span className="text-gray-400 text-[10px] block">السكن والعنوان:</span>
              <p className="text-white">{activeDetailsMember.residence}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#070b0a] border border-white/5 space-y-1 text-xs">
              <span className="text-gray-400 text-[10px] block">الملاحظات الطبية والصحية:</span>
              <p className="text-gray-300">{activeDetailsMember.medicalNotes || 'سليم تماماً، لا توجد حساسية أو إصابات'}</p>
            </div>

            {activeDetailsMember.personalNotes && (
              <div className="p-3 rounded-xl bg-[#070b0a] border border-white/5 space-y-1 text-xs">
                <span className="text-gray-400 text-[10px] block">ملاحظات الكابتن والمدرب:</span>
                <p className="text-gray-300">{activeDetailsMember.personalNotes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-gray-400 font-mono">طوارئ: {activeDetailsMember.emergencyContact || activeDetailsMember.phone}</span>
              <button
                type="button"
                onClick={() =>
                  openWhatsAppShare(
                    `مرحباً، إشعار من أكاديمية ${academy.name} بخصوص المنتسب ${activeDetailsMember.fullName}:`,
                    activeDetailsMember.phone
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>واتساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-[#0d1211] border-2 border-purple-500/40 rounded-3xl p-5 sm:p-7 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                <span>{editingMember ? 'تعديل بيانات المنتسب' : 'إضافة منتسب جديد للأكاديمية'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold block">الاسم الثلاثي للطالب / اللاعب *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="مثال: يزن أحمد المحمد"
                    className="w-full bg-[#070b0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold block">رقم الجوال (أو ولي الأمر) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09xxxxxxxx"
                    className="w-full bg-[#070b0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
              </div>

              {/* Birth & Age Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold block">المواليد (تاريخ الميلاد) *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-[#070b0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold block">الفئة العمرية (من سنة)</label>
                  <input
                    type="number"
                    min="4"
                    max="20"
                    value={formData.ageGroupMin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ageGroupMin: Number(e.target.value),
                        ageGroupLabel: `${e.target.value} - ${formData.ageGroupMax} سنة`
                      })
                    }
                    className="w-full bg-[#070b0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold block">الفئة العمرية (إلى سنة)</label>
                  <input
                    type="number"
                    min="4"
                    max="25"
                    value={formData.ageGroupMax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ageGroupMax: Number(e.target.value),
                        ageGroupLabel: `${formData.ageGroupMin} - ${e.target.value} سنة`
                      })
                    }
                    className="w-full bg-[#070b0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Residence */}
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold block">السكن والمنطقة السكنية *</label>
                <input
                  type="text"
                  required
                  value={formData.residence}
                  onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                  placeholder="المحافظة، الحي، الشارع، أقرب نقطة دالة..."
                  className="w-full bg-[#070b0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Installment Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#070b0a] border border-purple-500/20">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold block">حالة تسديد القسط</label>
                  <select
                    value={formData.installmentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        installmentStatus: e.target.value as any,
                        installmentDate:
                          e.target.value === 'مدفوع' ? new Date().toISOString().split('T')[0] : formData.installmentDate
                      })
                    }
                    className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="غير مدفوع">غير مدفوع (مطلوب)</option>
                    <option value="مدفوع">مدفوع بالكامل</option>
                    <option value="مسدد جزئياً">مسدد جزئياً</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold block">قيمة القسط الشهري (ل.س)</label>
                  <input
                    type="number"
                    value={formData.installmentAmount}
                    onChange={(e) => setFormData({ ...formData, installmentAmount: Number(e.target.value) })}
                    className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold block">طريقة التسديد</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="كاش">كاش نقدي في مقر الأكاديمية</option>
                    <option value="شام كاش">شام كاش Sham Cash</option>
                    <option value="تحويل بنكي">تحويل أو إيداع</option>
                  </select>
                </div>
              </div>

              {/* Special Player Info */}
              <div className="border border-white/10 p-3.5 rounded-2xl bg-[#070b0a] space-y-3">
                <h5 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>معلومات شخصية وفنية خاصة باللاعب:</span>
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 block">مركز اللعب</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="حارس مرمى">حارس مرمى</option>
                      <option value="مدافع">قلب دفاع</option>
                      <option value="ظهير أيمن">ظهير أيمن</option>
                      <option value="ظهير أيسر">ظهير أيسر</option>
                      <option value="وسط">خط وسط</option>
                      <option value="جناح">جناح هجومي</option>
                      <option value="مهاجم">رأس حربة</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 block">القدم المفضلة</label>
                    <select
                      value={formData.preferredFoot}
                      onChange={(e) => setFormData({ ...formData, preferredFoot: e.target.value as any })}
                      className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="اليمنى">اليمنى</option>
                      <option value="اليسرى">اليسرى</option>
                      <option value="كلتا القدمين">كلتا القدمين</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 block">الطول (سم)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                      className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 block">الوزن (كغ)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 block">زمرة الدم ورقم هاتف الطوارئ</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formData.bloodType}
                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        className="bg-[#0d1211] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="AB-">AB-</option>
                      </select>

                      <input
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        placeholder="هاتف الطوارئ"
                        className="bg-[#0d1211] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 block">الملاحظات الصحية / الحساسية</label>
                    <input
                      type="text"
                      value={formData.medicalNotes}
                      onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                      placeholder="أمراض، حساسية، أو إصابات سابقة..."
                      className="w-full bg-[#0d1211] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingMember ? 'حفظ التعديلات' : 'إضافة المنتسب وحفظه'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
