import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Users,
  Bus,
  ArrowLeft,
  Star,
  Phone,
  Trash2,
  Edit3,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import { Academy, AcademyRegistration } from '../types';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';

interface AcademyCardProps {
  key?: React.Key;
  academy: Academy;
  currentUser?: any;
  isAdmin?: boolean;
  academyRegistrations?: AcademyRegistration[];
  onViewDetails: (aca: Academy) => void;
  onRegister?: (aca: Academy) => void;
  onEditAcademy?: (aca: Academy) => void;
  onDeleteAcademy?: (id: string) => void;
  onRateAcademy?: (academyId: string, rating: number, comment?: string) => void;
}

export default function AcademyCard({
  academy,
  currentUser,
  isAdmin = false,
  academyRegistrations = [],
  onViewDetails,
  onRegister,
  onEditAcademy,
  onDeleteAcademy,
  onRateAcademy
}: AcademyCardProps) {
  // Check if user is system admin
  const isSystemAdmin = Boolean(
    isAdmin ||
    currentUser?.isAdmin === true ||
    currentUser?.role === 'admin'
  );

  // Check if current user is a registered parent in this academy
  const isRegisteredParent = useMemo(() => {
    if (!currentUser) return false;
    return academyRegistrations.some(
      (reg) =>
        reg.academyId === academy.id &&
        (reg.userId === currentUser.id ||
          (currentUser.phone && reg.parentPhone === currentUser.phone) ||
          (currentUser.name && reg.parentName === currentUser.name))
    );
  }, [academyRegistrations, currentUser, academy.id]);

  // Star Rating Interactive State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [hasRatedRecently, setHasRatedRecently] = useState(false);

  const reviewsCount = academy.reviews?.length || 12;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditAcademy) onEditAcademy(academy);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من حذف أكاديمية "${academy.name}" بشكل نهائي؟`)) {
      if (onDeleteAcademy) onDeleteAcademy(academy.id);
    }
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRateAcademy) {
      onRateAcademy(academy.id, selectedRating, ratingComment);
    }
    setHasRatedRecently(true);
    setTimeout(() => {
      setShowRatingModal(false);
    }, 1200);
  };

  return (
    <div
      id={`academy-card-${academy.id}`}
      className="bg-[#0d1211] border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/60 transition-all duration-300 flex flex-col group hover:shadow-xl hover:shadow-purple-500/5 font-['Cairo'] relative"
    >
      {/* Admin Action Badge (Exclusively rendered for Admins) */}
      {isSystemAdmin && (
        <div className="absolute top-3 right-1/2 translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/90 px-2.5 py-1 rounded-full border border-purple-500/40 shadow-xl backdrop-blur-md">
          <span className="text-[10px] font-bold text-purple-300">
            لوحة الإدارة
          </span>
          {onEditAcademy && (
            <button
              onClick={handleEdit}
              className="p-1 rounded-full bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white transition-colors cursor-pointer"
              title="تعديل بيانات الأكاديمية"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteAcademy && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white transition-colors cursor-pointer"
              title="حذف الأكاديمية"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Banner */}
      <div className="relative h-48 w-full bg-[#050707] overflow-hidden">
        <img
          src={academy.image}
          alt={academy.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1211] via-black/40 to-transparent"></div>

        <div className="absolute top-3 right-3 z-10">
          <span className="bg-black/80 backdrop-blur-md text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1 shadow-lg">
            <MapPin className="w-3 h-3" />
            {academy.governorate}
          </span>
        </div>

        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-end">
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg ${
              academy.transportStatus === 'مؤمنة'
                ? 'bg-emerald-500 text-black'
                : academy.transportStatus === 'بحاجة مواصلات'
                ? 'bg-amber-400 text-black'
                : 'bg-gray-700 text-white'
            }`}
          >
            <Bus className="w-3 h-3" />
            المواصلات: {academy.transportStatus}
          </span>

          {/* Registered Parent Badge */}
          {isRegisteredParent && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500 text-white border border-purple-300/40 flex items-center gap-1 shadow-md animate-pulse">
              <Award className="w-3 h-3" />
              أنت مسجل كـ ولي أمر
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-purple-400 transition-colors line-clamp-1">
              {academy.name}
            </h3>
            
            {/* Star Rating Badge */}
            <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-lg text-amber-400 text-xs font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-mono">{academy.rating?.toFixed(1) || '4.9'}</span>
              <span className="text-[10px] text-gray-400">({reviewsCount})</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            {academy.locationDetails}
          </p>

          <p className="text-xs text-gray-300 line-clamp-2 mb-3 leading-relaxed">
            {academy.description}
          </p>

          {/* Star Rating Interaction Bar */}
          <div className="bg-[#050707] p-2.5 rounded-xl border border-white/5 space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                تقييم أولياء الأمور:
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRatingModal(!showRatingModal);
                }}
                className="text-[11px] text-purple-300 hover:text-purple-200 font-bold underline transition-colors cursor-pointer"
              >
                {isRegisteredParent ? '⭐ أضف تقييمك كـ ولي أمر' : '⭐ تقييم الأكاديمية'}
              </button>
            </div>

            {/* Quick Interactive 5-Star Row */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || Math.round(academy.rating || 5)) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRating(star);
                        setShowRatingModal(true);
                      }}
                      className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                      title={`تقييم ${star} نجوم`}
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-600 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                {hoverRating > 0 ? `${hoverRating} من 5` : `${academy.rating?.toFixed(1) || '4.9'} / 5`}
              </span>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-[#050707] p-2.5 rounded-xl border border-white/5 space-y-1 text-xs mb-3">
            <div className="flex items-center justify-between text-gray-300">
              <span className="text-gray-400 text-[11px]">المدرب الرئيسي:</span>
              <span className="font-semibold text-white truncate max-w-[65%]">{academy.mainCoach}</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span className="text-gray-400 text-[11px]">الفئات المستهدفة:</span>
              <span className="font-semibold text-purple-300 truncate max-w-[65%]">{academy.targetAgeGroups}</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">الاشتراك الشهري:</span>
            <span className="text-sm sm:text-base font-bold text-purple-400 font-mono">
              {formatSYP(academy.monthlyFee)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewDetails(academy)}
              className="py-2 px-3 rounded-xl bg-[#050707] hover:bg-purple-950/40 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>البرامج والتقييم</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
            {onRegister && (
              <button
                onClick={() => onRegister(academy)}
                className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-lg cursor-pointer"
              >
                <span>تسجيل طالب</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Parent Star Rating Modal / Form */}
      {showRatingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            e.stopPropagation();
            setShowRatingModal(false);
          }}
        >
          <div
            className="bg-[#0d1211] border-2 border-purple-500/40 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl relative font-['Cairo'] text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                تقييم أولياء الأمور للأكاديمية
              </h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="bg-purple-950/20 border border-purple-500/20 p-3 rounded-xl">
              <h4 className="font-bold text-purple-300 text-xs">{academy.name}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isRegisteredParent
                  ? '✨ نرحب برأيك كـ ولي أمر مسجل لمساعدتنا في تحسين التدريب والخدمات.'
                  : 'شاركنا تقييمك ورأيك حول جودة التدريب والاهتمام باللاعبين.'}
              </p>
            </div>

            {hasRatedRecently ? (
              <div className="py-6 text-center space-y-2 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-sm">تم تسجيل تقييمك بنجاح! ⭐</h4>
                <p className="text-xs text-gray-400">شكراً لمشاركتك القيّمة في تطوير الأكاديمية.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRating} className="space-y-4">
                {/* 5-Star Selection */}
                <div className="text-center py-2 bg-[#050707] rounded-2xl border border-white/5">
                  <span className="text-xs text-gray-300 font-bold block mb-2">اختر عدد النجوم:</span>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            selectedRating >= star
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-400 mt-2 block font-mono">
                    {selectedRating === 5 && '🌟 ممتاز جداً - تدريب عالي المستوى'}
                    {selectedRating === 4 && '⭐ جيد جداً - كادر ممتاز'}
                    {selectedRating === 3 && '👍 جيد - تجربة مقبولة'}
                    {selectedRating === 2 && '😐 متوسط - يحتاج تحسين'}
                    {selectedRating === 1 && '👎 ضعيف'}
                  </span>
                </div>

                {/* Optional Comment */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    ملاحظات أو تعليق إضافي (اختياري):
                  </label>
                  <textarea
                    rows={3}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="اكتب انطباعك عن تعامل المدربين، مواعيد التمارين، أو انضباط الأكاديمية..."
                    className="w-full bg-[#050707] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-white" />
                    <span>تأكيد وإرسال التقييم</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

