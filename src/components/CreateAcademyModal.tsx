import React, { useState } from 'react';
import { X, Upload, Plus, Bus, Image as ImageIcon } from 'lucide-react';
import { Academy, SyrianGovernorate, TransportStatus } from '../types';
import { SYRIAN_GOVERNORATES, GOVERNORATE_COORDINATES } from '../constants/syrianData';
import { readImageAsBase64 } from '../utils/helpers';
import SportLogoPicker from './SportLogoPicker';

interface CreateAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newAcademy: Academy) => void;
}

export default function CreateAcademyModal({
  isOpen,
  onClose,
  onSave
}: CreateAcademyModalProps) {
  const [name, setName] = useState('');
  const [governorate, setGovernorate] = useState<SyrianGovernorate>('دمشق');
  const [locationDetails, setLocationDetails] = useState('');
  const [mainCoach, setMainCoach] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [monthlyFee, setMonthlyFee] = useState<number>(150000);
  const [targetAgeGroups, setTargetAgeGroups] = useState('من سن 6 إلى 16 سنة');
  const [description, setDescription] = useState('');
  const [transportStatus, setTransportStatus] = useState<TransportStatus>('مؤمنة');

  const [image, setImage] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await readImageAsBase64(file);
      setImage(base64);
      setUploadError('');
    } catch (err: any) {
      setUploadError(err.message || 'خطأ أثناء قراءة الصورة');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setUploadError('يرجى رفع صورة رئيسية للأكاديمية من المعرض (إجباري)');
      return;
    }

    setIsSubmitting(true);
    const coords = GOVERNORATE_COORDINATES[governorate] || { lat: 33.5138, lng: 36.2765 };

    const newAca: Academy = {
      id: `aca-${Date.now()}`,
      name,
      image,
      images: [image],
      governorate,
      locationDetails,
      latitude: coords.lat + (Math.random() * 0.02 - 0.01),
      longitude: coords.lng + (Math.random() * 0.02 - 0.01),
      mainCoach,
      contactPhone,
      monthlyFee: Number(monthlyFee),
      targetAgeGroups,
      description: description.trim() || 'أكاديمية رياضية متخصصة في تدريب وتطوير الناشئين في سوريا.',
      transportStatus,
      facilities: ['ملاعب معشبة', 'معدات تدريب حديثة', 'غرف تبديل ملابس ومواقف'],
      trainers: [
        {
          id: 'tr-new',
          name: mainCoach,
          specialization: 'المدرب العام ورئيس الجهاز الفني',
          experienceYears: 10,
          image: image
        }
      ],
      programs: [
        {
          id: 'pr-new',
          title: 'برنامج التطوير الكروي المتكامل',
          durationMonths: 6,
          daysSchedule: 'السبت والإثنين والأربعاء (4:30 عصراً)',
          targetAge: targetAgeGroups,
          objectives: 'تطوير الأساسيات التكتيكية والمهارية واللياقة البدنية.'
        }
      ],
      reviews: [],
      rating: 5.0,
      paymentOptions: {
        allowCash: true,
        allowShamCash: true,
        shamCashAccount: 'SHAM-7729-1940'
      },
      status: 'نشط',
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSave(newAca);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      id="modal-create-academy"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-purple-500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#050707] border-b border-purple-500/20 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-white font-['Cairo']">
            إضافة وإدراج أكاديمية رياضية جديدة
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Logo / Image Selection */}
          <SportLogoPicker
            value={image}
            onChange={(url) => {
              setImage(url);
              setUploadError('');
            }}
            label="شعار أو صورة الأكاديمية"
            helperText="اختر شعاراً رياضياً من المكتبة أو ارفع صورة الأكاديمية من الاستوديو"
            accentColor="purple"
          />
          {uploadError && <p className="text-xs text-[#ff2a5f] mt-1">{uploadError}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">اسم الأكاديمية *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أكاديمية الأبطال"
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">المحافظة السورية *</label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value as SyrianGovernorate)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                {SYRIAN_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">العنوان التفصيلي ومكان التدريب *</label>
            <input
              type="text"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              placeholder="مثال: دمشق - المزة بجانب الجلاء"
              className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#050707] p-3 rounded-2xl border border-white/5">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">المدرب الرئيسي *</label>
              <input
                type="text"
                value={mainCoach}
                onChange={(e) => setMainCoach(e.target.value)}
                placeholder="الكابتن..."
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">الاشتراك الشهري (ل.س)</label>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-purple-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">حالة المواصلات</label>
              <select
                value={transportStatus}
                onChange={(e) => setTransportStatus(e.target.value as TransportStatus)}
                className="w-full bg-[#0d1211] border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="مؤمنة">مؤمنة (باصات متوفرة)</option>
                <option value="بحاجة مواصلات">بحاجة مواصلات</option>
                <option value="غير مؤمنة">غير مؤمنة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">رقم هاتف التسجيل *</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="09XXXXXXXX"
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">الفئات العمرية المستهدفة</label>
              <input
                type="text"
                value={targetAgeGroups}
                onChange={(e) => setTargetAgeGroups(e.target.value)}
                className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">نبذة عن الأكاديمية</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف البرامج والتدريب..."
              className="w-full bg-[#050707] border border-white/10 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'جاري الإدراج...' : 'إدراج الأكاديمية في المنصة'}
          </button>
        </form>
      </div>
    </div>
  );
}
