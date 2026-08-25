import React, { useState } from 'react';
import {
  X,
  MapPin,
  Star,
  Users,
  SunMedium,
  Calendar,
  CheckCircle2,
  Phone,
  Navigation,
  Sparkles,
  Zap,
  Info,
  Clock,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Playground, Review } from '../types';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';

interface PlaygroundModalProps {
  playground: Playground | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking?: (playground: Playground, selectedDate: string, selectedSlot: string) => void;
  onBookNow?: (playground: Playground) => void;
  onAddReview?: (playgroundId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

export default function PlaygroundModal({
  playground,
  isOpen,
  onClose,
  onProceedToBooking,
  onBookNow,
  onAddReview
}: PlaygroundModalProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!isOpen || !playground) return null;

  const currentSchedule = playground.schedules[selectedDayIndex] || playground.schedules[0];

  const handleSlotClick = (slot: { time: string; status: string }) => {
    if (slot.status === 'available') {
      setSelectedSlotTime(slot.time);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddReview(playground.id, {
      userName: reviewerName.trim() || 'لاعب كابتن',
      rating: newRating,
      comment: newComment.trim()
    });

    setNewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${playground.latitude},${playground.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div
      id="modal-playground-details"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-[#00FFD2]/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl glow-primary my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-64 sm:h-80 w-full bg-[#050707] shrink-0">
          <img
            src={playground.images[activePhotoIndex] || playground.images[0]}
            alt={playground.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1211] via-black/40 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-[#00FFD2] hover:text-black text-white flex items-center justify-center transition-colors border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Thumbnail strip */}
          {playground.images.length > 1 && (
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
              {playground.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activePhotoIndex
                      ? 'border-[#00FFD2] scale-105 glow-primary'
                      : 'border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Badges on banner */}
          <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2">
            <span className="bg-black/80 backdrop-blur-md text-[#00FFD2] text-xs font-bold px-3 py-1.5 rounded-full border border-[#00FFD2]/30 flex items-center gap-1 shadow-lg">
              <MapPin className="w-3.5 h-3.5" />
              {playground.governorate} - {playground.detailedArea}
            </span>
            <span className="bg-[#00FFD2] text-black text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-black" />
              بدون أي عمولة 0%
            </span>
          </div>

          <div className="absolute bottom-4 right-4 z-20 max-w-[60%]">
            <h2 className="text-xl sm:text-3xl font-black text-white font-['Cairo'] drop-shadow-md">
              {playground.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-amber-400 bg-black/60 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-400/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{playground.rating.toFixed(1)}</span>
                <span className="text-gray-400 font-normal">({playground.reviewsCount} تقييم)</span>
              </div>
              <span className="text-gray-300 text-xs bg-black/60 px-2 py-0.5 rounded-md border border-white/10">
                المسؤول: {playground.managerName}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#050707] p-3 rounded-2xl border border-white/5 flex flex-col items-center text-center">
              <Users className="w-5 h-5 text-[#00FFD2] mb-1" />
              <span className="text-[11px] text-gray-400">سعة الملعب</span>
              <strong className="text-white text-sm">{playground.capacity}</strong>
            </div>
            <div className="bg-[#050707] p-3 rounded-2xl border border-white/5 flex flex-col items-center text-center">
              <Sparkles className="w-5 h-5 text-[#00FFD2] mb-1" />
              <span className="text-[11px] text-gray-400">نوع الأرضية</span>
              <strong className="text-white text-sm">{playground.surface}</strong>
            </div>
            <div className="bg-[#050707] p-3 rounded-2xl border border-white/5 flex flex-col items-center text-center">
              <SunMedium className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-[11px] text-gray-400">الإنارة الليلية</span>
              <strong className="text-white text-sm">{playground.lighting}</strong>
            </div>
            <div className="bg-[#050707] p-3 rounded-2xl border border-white/5 flex flex-col items-center text-center">
              <Zap className="w-5 h-5 text-[#00FFD2] mb-1" />
              <span className="text-[11px] text-gray-400">سعر الساعة</span>
              <strong className="text-[#00FFD2] text-sm font-mono font-bold">
                {formatSYP(playground.pricePerHour)}
              </strong>
            </div>
          </div>

          {/* Contact & Google Maps Directions */}
          <div className="bg-gradient-to-r from-[#071a16] to-[#0d1211] p-4 rounded-2xl border border-[#00FFD2]/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex items-center justify-center text-[#00FFD2]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">المسؤول عن الحجوزات: {playground.managerName}</h4>
                <p className="text-xs text-[#00FFD2] font-mono">{playground.managerPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  openWhatsAppShare(
                    `مرحباً كابتن ${playground.managerName}، أود الاستفسار بخصوص حجز ${playground.name}`,
                    playground.managerPhone
                  )
                }
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                تواصل واتساب
              </button>
              <button
                onClick={openGoogleMaps}
                className="px-3 py-2 rounded-xl bg-[#050707] hover:bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-4 h-4 text-[#00FFD2]" /> الاتجاهات (Maps)
              </button>
            </div>
          </div>

          {/* Interactive 7-Day Schedule with 90-min Slots */}
          <div className="bg-[#050707] p-4 sm:p-5 rounded-2xl border border-[#00FFD2]/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2 font-['Cairo']">
                  <Calendar className="w-4 h-4 text-[#00FFD2]" />
                  جدول الحجوزات والمواعيد المتاحة (90 دقيقة لكل حجز)
                </h3>
                <p className="text-xs text-gray-400">
                  اختر اليوم ثم انقر على الوقت المناسب لك للحجز المباشر
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> متاح
                </span>
                <span className="flex items-center gap-1 text-[#ff2a5f]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a5f]"></span> محجوز
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-600"></span> مغلق
                </span>
              </div>
            </div>

            {/* Days Horizontal Tab List */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4">
              {playground.schedules.map((schedule, idx) => {
                const isSelected = idx === selectedDayIndex;
                return (
                  <button
                    key={schedule.date}
                    onClick={() => {
                      setSelectedDayIndex(idx);
                      setSelectedSlotTime(null);
                    }}
                    className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#00FFD2] text-black font-bold border-[#00FFD2] glow-primary'
                        : 'bg-[#0d1211] text-gray-300 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="block text-xs font-bold">{schedule.dayName}</span>
                    <span className="block text-[10px] opacity-80 font-mono">{schedule.date}</span>
                  </button>
                );
              })}
            </div>

            {/* 90-Min Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {currentSchedule.slots.map((slot) => {
                const isAvailable = slot.status === 'available';
                const isBooked = slot.status === 'booked';
                const isSelected = selectedSlotTime === slot.time;

                let btnStyles = 'bg-gray-800/40 text-gray-500 border-gray-700/40 cursor-not-allowed';
                if (isBooked) {
                  btnStyles = 'bg-[#ff2a5f]/10 text-[#ff2a5f] border-[#ff2a5f]/30 cursor-not-allowed';
                } else if (isAvailable) {
                  btnStyles = isSelected
                    ? 'bg-[#00FFD2] text-black font-bold border-[#00FFD2] glow-primary shadow-lg'
                    : 'bg-[#0d1211] text-emerald-300 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 cursor-pointer';
                }

                return (
                  <button
                    key={slot.id}
                    disabled={!isAvailable}
                    onClick={() => handleSlotClick(slot)}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col items-center justify-center transition-all ${btnStyles}`}
                  >
                    <div className="flex items-center gap-1 font-mono font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{slot.time}</span>
                    </div>
                    <span className="text-[10px] mt-0.5">
                      {isBooked ? 'محجوز' : isAvailable ? `${formatSYP(slot.price)}` : 'مغلق'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected slot action helper */}
            {selectedSlotTime && (
              <div className="mt-4 p-3 rounded-xl bg-[#00FFD2]/10 border border-[#00FFD2]/30 flex items-center justify-between">
                <span className="text-xs text-white">
                  الموعد المختار: <strong className="text-[#00FFD2]">{currentSchedule.dayName} ({currentSchedule.date})</strong> - <strong className="text-[#00FFD2]">{selectedSlotTime}</strong>
                </span>
                <button
                  onClick={() =>
                    onProceedToBooking(playground, currentSchedule.date, selectedSlotTime)
                  }
                  className="px-4 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black text-xs font-bold glow-primary transition-all"
                >
                  متابعة الحجز والدفع ←
                </button>
              </div>
            )}
          </div>

          {/* Full Pitch Specs & Dimensions */}
          <div className="bg-[#050707] p-4 sm:p-5 rounded-2xl border border-white/5">
            <h3 className="font-bold text-white text-sm sm:text-base mb-3 flex items-center gap-2 font-['Cairo']">
              <Info className="w-4 h-4 text-[#00FFD2]" />
              المواصفات الفنية والهندسية للملعب
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0d1211] border border-white/5">
                <span className="text-gray-400 block mb-0.5">الأبعاد (طول × عرض):</span>
                <strong className="text-white font-mono">{playground.specs.lengthMeters}م × {playground.specs.widthMeters}م</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1211] border border-white/5">
                <span className="text-gray-400 block mb-0.5">سعة المدرجات الإجمالية:</span>
                <strong className="text-white">{playground.specs.standsCapacity} متفرج</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1211] border border-white/5">
                <span className="text-gray-400 block mb-0.5">مدرجات مغطاة / مكشوفة:</span>
                <strong className="text-white">{playground.specs.coveredStands} مغطى / {playground.specs.openStands} مكشوف</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1211] border border-white/5">
                <span className="text-gray-400 block mb-0.5">غرف تبديل الملابس:</span>
                <strong className="text-white">{playground.specs.changingRoomsCount} غرف مجهزة</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1211] border border-white/5">
                <span className="text-gray-400 block mb-0.5">مواقف السيارات:</span>
                <strong className="text-white">{playground.specs.parkingSpotsCount} سيارة</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1211] border border-white/5">
                <span className="text-gray-400 block mb-0.5">سنة الإنشاء والتحديث:</span>
                <strong className="text-white">{playground.specs.builtYear || 2022} (تجديد {playground.specs.lastRenovated || 2026})</strong>
              </div>
            </div>
          </div>

          {/* Amenities checklist */}
          <div className="bg-[#050707] p-4 sm:p-5 rounded-2xl border border-white/5">
            <h3 className="font-bold text-white text-sm sm:text-base mb-3 flex items-center gap-2 font-['Cairo']">
              <ShieldCheck className="w-4 h-4 text-[#00FFD2]" />
              الخدمات والمرافق المتوفرة
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-gray-300">
              {Object.entries(playground.amenities).map(([key, val]) => {
                if (!val) return null;
                const labels: Record<string, string> = {
                  changingRooms: 'غرف تبديل ملابس ومستحمات',
                  cafeteria: 'كافتيريا ومشروبات ساخنة',
                  parking: 'مواقف سيارات مجانية',
                  medicalCenter: 'نقطة إسعاف وعيادة طبية',
                  swimmingPool: 'مسبح ملحق بالمنشأة',
                  clubShop: 'متجر تجهيزات رياضية',
                  water: 'مياه شرب مجانية',
                  ballsEquipment: 'كرات وشياكات تدريب',
                  buffet: 'بوفيه واستراحة لاعبين',
                  spectatorSeats: 'مقاعد مريحة للجماهير',
                  publicTransportNearby: 'قريب من المواصلات العامة',
                  nightLighting: 'إنارة ليلية LED كاشفة'
                };
                return (
                  <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-[#0d1211] border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-[#00FFD2] shrink-0" />
                    <span>{labels[key] || key}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews & Star Rating Input */}
          <div className="bg-[#050707] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2 font-['Cairo']">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                آراء وتقييمات اللاعبين ({playground.reviews.length})
              </h3>
            </div>

            {/* List existing reviews */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {playground.reviews.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">كن أول من يقيم هذا الملعب الرائع!</p>
              ) : (
                playground.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-[#0d1211] border border-white/5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-white">{rev.userName}</strong>
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{rev.rating}</span>
                        <span className="text-[10px] text-gray-500 font-mono mr-2">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="pt-3 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white">أضف تقييمك ورأيك بالملعب:</h4>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="اسمك أو لقبك الكروي..."
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="flex-1 min-w-[160px] bg-[#0d1211] border border-[#00FFD2]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                />
                <div className="flex items-center gap-1 bg-[#0d1211] px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-xs text-gray-400 ml-1">التقييم:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اكتب تعليقك وتجربتك في الملعب (الأرضية، الإنارة، المرافق)..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-[#0d1211] border border-[#00FFD2]/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black text-xs font-bold transition-all glow-primary flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> إرسال
                </button>
              </div>
              {reviewSubmitted && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> شكراً لتقييمك! تم نشر تقييمك بنجاح.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Footer sticky bar */}
        <div className="bg-[#050707] p-4 border-t border-[#00FFD2]/20 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs text-gray-400 block">التكلفة (بدون عمولة 0%):</span>
            <span className="text-lg sm:text-xl font-black text-[#00FFD2] font-mono">
              {formatSYP(playground.pricePerHour)}
            </span>
          </div>

          <button
            id="btn-modal-book-now"
            onClick={() => {
              if (onProceedToBooking) {
                onProceedToBooking(
                  playground,
                  currentSchedule.date,
                  selectedSlotTime || currentSchedule.slots.find((s) => s.status === 'available')?.time || '18:30 - 20:00'
                );
              } else if (onBookNow) {
                onBookNow(playground);
              }
            }}
            className="px-6 py-3 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-bold text-sm transition-all glow-primary shadow-xl flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            حجز الملعب وتأكيد الموعد
          </button>
        </div>
      </div>
    </div>
  );
}
