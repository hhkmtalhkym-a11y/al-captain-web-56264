import React, { useState } from 'react';
import {
  X,
  MapPin,
  Star,
  Users,
  Bus,
  CheckCircle2,
  Phone,
  Calendar,
  Sparkles,
  ShieldCheck,
  Send,
  MessageSquare,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { Academy, Review, AcademyRegistration } from '../types';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';
import AcademyMembersRoster from './AcademyMembersRoster';

interface AcademyModalProps {
  academy: Academy | null;
  isOpen: boolean;
  currentUser?: any;
  onClose: () => void;
  onRegister?: (academy: Academy) => void;
  onRateAcademy?: (academyId: string, rating: number, comment?: string) => void;
  onUpdateAcademy?: (updated: Academy) => void;
  academyRegistrations?: AcademyRegistration[];
}

export default function AcademyModal({
  academy,
  isOpen,
  currentUser,
  onClose,
  onRegister,
  onRateAcademy,
  onUpdateAcademy,
  academyRegistrations = []
}: AcademyModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'roster'>('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  if (!isOpen || !academy) return null;

  const canManage = Boolean(
    currentUser && (
      currentUser.isAdmin ||
      currentUser.role === 'admin' ||
      currentUser.role === 'أدمن' ||
      currentUser.name === academy.mainCoach ||
      currentUser.phone === academy.contactPhone ||
      currentUser.id === academy.ownerId
    )
  );

  const imagesList = academy.images?.length > 0 ? academy.images : [academy.image];
  const reviewsList = academy.reviews && academy.reviews.length > 0
    ? academy.reviews
    : [
        {
          id: 'rev-1',
          userName: 'أبو أحمد (ولي أمر)',
          rating: 5,
          comment: 'أكاديمية ممتازة ومدربون مخلصون، ابني تطور مستواه البدني والمهاري بشكل ملحوظ خلال 3 أشهر.',
          date: '2026-08-15'
        },
        {
          id: 'rev-2',
          userName: 'كابتن وسيم (ولي أمر)',
          rating: 5,
          comment: 'التزام بالمواعيد، ملاعب نظيفة ومجهزة، وخدمة باصات آمنة جداً.',
          date: '2026-08-20'
        }
      ];

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRateAcademy) {
      onRateAcademy(academy.id, userRating, userComment);
    }
    setRatingSubmitted(true);
  };

  return (
    <div
      id="modal-academy-details"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-purple-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto font-['Cairo']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner & Gallery */}
        <div className="relative h-36 sm:h-44 w-full bg-[#050707] shrink-0">
          <img
            src={imagesList[selectedImageIndex] || academy.image}
            alt={academy.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1211] via-black/40 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-purple-500 hover:text-white text-white flex items-center justify-center transition-colors border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-12 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === selectedImageIndex
                      ? 'border-purple-400 scale-105'
                      : 'border-white/20 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="absolute bottom-3 right-4 z-20 max-w-[70%]">
            <span className="bg-purple-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-1 inline-block">
              {academy.governorate} • {academy.locationDetails}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {academy.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-purple-200 mt-0.5">
              <span>المدرب: {academy.mainCoach}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {academy.rating?.toFixed(1) || '4.9'} ({reviewsList.length} تقييم)
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Header (Details vs Roster) */}
        <div className="bg-[#050707] border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'details'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>تفاصيل وبرامج الأكاديمية</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>جدول المنتسبين والطلاب</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                {academy.members?.length || 0}
              </span>
            </button>
          </div>

          {canManage && (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>لوحة الإدارة والمعلن</span>
            </span>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'roster' ? (
            <AcademyMembersRoster
              academy={academy}
              academyRegistrations={academyRegistrations}
              canManage={canManage}
              onUpdateAcademy={onUpdateAcademy || (() => {})}
            />
          ) : (
            <>
              {/* Quick Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#050707] border border-white/5 text-center">
                  <span className="text-[11px] text-gray-400 block">الاشتراك الشهري</span>
                  <strong className="text-purple-400 text-sm font-mono">{formatSYP(academy.monthlyFee)}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#050707] border border-white/5 text-center">
                  <span className="text-[11px] text-gray-400 block">خدمة المواصلات</span>
                  <strong className="text-emerald-400 text-sm">{academy.transportStatus}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#050707] border border-white/5 text-center">
                  <span className="text-[11px] text-gray-400 block">الفئات العمرية</span>
                  <strong className="text-white text-xs">{academy.targetAgeGroups}</strong>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#050707] p-4 rounded-2xl border border-white/5 space-y-2">
                <h3 className="font-bold text-white text-sm">عن الأكاديمية ورؤيتها:</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{academy.description}</p>
              </div>

              {/* Star Ratings & Reviews Section */}
              <div className="bg-[#050707] p-4 sm:p-5 rounded-2xl border border-purple-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    تقييمات أولياء الأمور والطلاب
                  </h3>
                  <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-xl text-amber-400 text-xs font-bold font-mono">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{academy.rating?.toFixed(1) || '4.9'} / 5.0</span>
                  </div>
                </div>

                {/* Submit Rating Form */}
                {ratingSubmitted ? (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300 font-bold">
                    ✓ شكراً لك! تم حفظ تقييمك للأكاديمية بنجاح.
                  </div>
                ) : (
                  <form onSubmit={handleRatingSubmit} className="bg-[#0d1211] p-3.5 rounded-xl border border-white/5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs text-gray-300 font-bold">تقييمك كـ ولي أمر / مسجل:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                userRating >= star
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-amber-400 mr-2 font-mono">({userRating} نجوم)</span>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="أضف رأيك في التدريب، المعاملة، أو الانضباط..."
                      className="w-full bg-[#050707] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>إرسال التقييم</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Reviews */}
                <div className="space-y-2.5 pt-2">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl bg-[#0d1211] border border-white/5 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{rev.userName}</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed text-[11px]">{rev.comment}</p>
                      <span className="text-[10px] text-gray-500 font-mono block">{rev.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Programs */}
              <div className="bg-[#050707] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  البرامج التدريبية المعتمدة
                </h3>

                <div className="space-y-3">
                  {academy.programs?.map((prog) => (
                    <div key={prog.id} className="p-3 rounded-xl bg-[#0d1211] border border-purple-500/20 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-white font-bold text-sm">{prog.title}</strong>
                        <span className="text-purple-300 font-mono">المدة: {prog.durationMonths} أشهر</span>
                      </div>
                      <p className="text-gray-400">📅 المواعيد: {prog.daysSchedule} • الفئة: {prog.targetAge}</p>
                      <p className="text-gray-300 leading-relaxed">🎯 أهداف البرنامج: {prog.objectives}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trainers */}
              <div className="bg-[#050707] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  الكادر التدريبي المعتمد
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {academy.trainers?.map((tr) => (
                    <div key={tr.id} className="p-3 rounded-xl bg-[#0d1211] border border-white/5 flex items-center gap-3">
                      <img
                        src={tr.image}
                        alt={tr.name}
                        className="w-12 h-12 rounded-full object-cover border border-purple-400/30"
                      />
                      <div>
                        <h5 className="font-bold text-white text-xs">{tr.name}</h5>
                        <p className="text-[11px] text-purple-300">{tr.specialization}</p>
                        <span className="text-[10px] text-gray-400 font-mono">خبرة: {tr.experienceYears} سنوات</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div className="bg-[#050707] p-4 rounded-2xl border border-white/5">
                <h3 className="font-bold text-white text-sm mb-3">المرافق والتجهيزات المتوفرة:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                  {academy.facilities?.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#0d1211] border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Contact */}
        <div className="bg-[#050707] p-4 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Phone className="w-4 h-4 text-purple-400" />
            <span>للتسجيل والاستفسار: {academy.contactPhone}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() =>
                openWhatsAppShare(
                  `مرحباً كابتن، أود الاستفسار والتسجيل في ${academy.name}`,
                  academy.contactPhone
                )
              }
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>واتساب</span>
            </button>

            {onRegister && (
              <button
                onClick={() => {
                  onClose();
                  onRegister(academy);
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-500/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>سجل الآن في الأكاديمية</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

