import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Trophy,
  Sparkles,
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  X,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { League } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/helpers';

import heroSlide1Img from '../assets/images/hero_slide_captain_neon_1787731059148.jpg';
import heroSlide2Img from '../assets/images/hero_slide_striker_green_1787731076928.jpg';
import heroSlide3Img from '../assets/images/hero_slide_galaxy_stadium_1787731092572.jpg';
import heroSlide4Img from '../assets/images/hero_slide_player_shot_1787731106312.jpg';
import heroSlide5Img from '../assets/images/hero_slide_coach_manager_1787731121314.jpg';
import heroSlide6Img from '../assets/images/hero_slide_captain_action_1787731139084.jpg';

export interface SlideItem {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  actionText: string;
  image: string;
  tabTarget: string;
  highlightText?: string;
}

interface HeroBannerSliderProps {
  onNavigateTab: (tabId: any) => void;
  featuredLeagues?: League[];
  isAdmin?: boolean;
}

const INITIAL_SLIDES: SlideItem[] = [
  {
    id: 'slide-1',
    badge: '🏆 دوريات وبطولات كروية',
    badgeColor: 'bg-amber-400 text-black border-amber-300',
    title: 'أقوى الدوريات السورية والمنافسات الرسمية',
    subtitle: 'جوائز نقدية كبرى، كؤوس، ميداليات ذهبية، وتوثيق مباشر لجدول الترتيب والبطاقات والهدافين.',
    actionText: 'استكشف بطولات الدوري',
    image: heroSlide1Img,
    tabTarget: 'leagues',
    highlightText: 'جوائز حتى 4,000,000 ل.س'
  },
  {
    id: 'slide-2',
    badge: '⚽ حجز الملاعب في سوريا',
    badgeColor: 'bg-[#00FFD2] text-black border-[#00FFD2]',
    title: 'احجز أفضل ملاعب العشب الصناعي والطبيعي فوراً',
    subtitle: 'ملاعب معتمدة في دمشق، حلب، حمص، اللاذقية وجميع المحافظات مع إضاءة ليلية وخدمات متكاملة.',
    actionText: 'تصفح واحجز ملعبك',
    image: heroSlide2Img,
    tabTarget: 'playgrounds',
    highlightText: 'تأكيد حجز فوري ومباشر 0% عمولة'
  },
  {
    id: 'slide-3',
    badge: '🏟️ ملاعب ليلية وبطولات كبرى',
    badgeColor: 'bg-emerald-400 text-black border-emerald-300',
    title: 'أجواء كروية استثنائية تحت الأضواء الكاشفة',
    subtitle: 'ملاعب مجهزة بأحدث معايير الفيفا، غرف تبديل ملابس، ومدرجات جماهيرية وتغطية إعلامية.',
    actionText: 'استكشف الملاعب والبطولات',
    image: heroSlide3Img,
    tabTarget: 'playgrounds',
    highlightText: 'ملاعب مجهزة بالكامل'
  },
  {
    id: 'slide-4',
    badge: '⚔️ تحديات ومباريات ودية',
    badgeColor: 'bg-[#ff2a5f] text-white border-[#ff2a5f]',
    title: 'أنشئ مباراة وتحدَّ أقوى الفرق في منطقتك',
    subtitle: 'نظام حجز ملاعب مشترك، تثبيت مواعيد اللعب، وتوثيق نتائج المباريات والتشكيلات الرياضية.',
    actionText: 'شاهد التحديات المتاحة',
    image: heroSlide4Img,
    tabTarget: 'matches',
    highlightText: 'مباريات يومية نشطة'
  },
  {
    id: 'slide-5',
    badge: '🌟 أكاديميات كرة القدم والمدربون',
    badgeColor: 'bg-purple-500 text-white border-purple-400',
    title: 'سجّل في أفضل الأكاديميات الكروية لتطوير مهاراتك',
    subtitle: 'إشراف مدربين معتمدين من الاتحاد الآسيوي، دورات تدريبية للناشئين والشباب، وتجهيزات احترافية.',
    actionText: 'استكشف الأكاديميات الرياضية',
    image: heroSlide5Img,
    tabTarget: 'academies',
    highlightText: 'تدريب احترافي معتمد'
  },
  {
    id: 'slide-6',
    badge: '⚡ كشاف المواهب وبطاقات اللاعبين (CV)',
    badgeColor: 'bg-cyan-400 text-black border-cyan-300',
    title: 'أبرز مهاراتك وانضم إلى أفضل الأندية والأكاديميات',
    subtitle: 'أنشئ بطاقة الـ CV الكروية، فعّل إشارة كشاف المواهب، وتواصل مباشرة مع الأندية الرياضية.',
    actionText: 'إنشاء بطاقة لاعب الآن',
    image: heroSlide6Img,
    tabTarget: 'scouting',
    highlightText: 'فرصتك للاحتراف'
  }
];

export default function HeroBannerSlider({
  onNavigateTab,
  featuredLeagues,
  isAdmin = false
}: HeroBannerSliderProps) {
  const [slides, setSlides] = useState<SlideItem[]>(() => {
    const saved = loadFromLocalStorage('kaptan_hero_slides', null);
    if (saved && Array.isArray(saved) && saved.length >= 6) {
      return saved;
    }
    return INITIAL_SLIDES;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Admin Slide Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    saveToLocalStorage('kaptan_hero_slides', slides);
  }, [slides]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleDeleteSlide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) {
      alert('يجب الإبقاء على شريحة واحدة على الأقل!');
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذه الشريحة؟')) {
      const updated = slides.filter((s) => s.id !== id);
      setSlides(updated);
      setCurrentIndex(0);
    }
  };

  const handleOpenEdit = (slide: SlideItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSlide({ ...slide });
    setIsAddingNew(false);
    setIsEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingSlide({
      id: `slide-${Date.now()}`,
      badge: '🔥 مميز وجديد',
      badgeColor: 'bg-[#00FFD2] text-black border-[#00FFD2]',
      title: 'عنوان الشريحة الجديد',
      subtitle: 'وصف توضيحي مختصر للشريحة وما تقدمه من خدمات.',
      actionText: 'عرض التفاصيل',
      image: 'https://images.unsplash.com/photo-1529900244920-535ec395abe0?auto=format&fit=crop&w=1400&q=80',
      tabTarget: 'playgrounds',
      highlightText: 'عرض حصري'
    });
    setIsAddingNew(true);
    setIsEditModalOpen(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (isAddingNew) {
      setSlides((prev) => [...prev, editingSlide]);
      setCurrentIndex(slides.length);
    } else {
      setSlides((prev) =>
        prev.map((s) => (s.id === editingSlide.id ? editingSlide : s))
      );
    }
    setIsEditModalOpen(false);
    setEditingSlide(null);
  };

  if (slides.length === 0) return null;
  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div className="space-y-2">
      {/* Admin Slide Management Bar */}
      {isAdmin && (
        <div className="flex items-center justify-between bg-[#0d1211] p-2.5 px-4 rounded-2xl border border-[#ff2a5f]/40 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-[#ff2a5f] font-bold">
            <Sparkles className="w-4 h-4" />
            <span>لوحة تحكم السلايدر (أدمن): يمكنك إضافة وتعديل وحذف أي شريحة وصورة</span>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs flex items-center gap-1 shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة شريحة جديدة</span>
          </button>
        </div>
      )}

      {/* Hero Banner Slider Container */}
      <div
        id="hero-banner-slider"
        className="relative rounded-3xl overflow-hidden border-2 border-[#00FFD2]/30 shadow-2xl bg-[#071310] font-['Cairo'] group"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background Image without heavy gradient obscuring - natural colors as requested */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {/* Subtle scrim for typography readability only */}
              <div className="absolute inset-0 bg-black/35 pointer-events-none"></div>
            </div>
          ))}

          {/* Slide Content Overlay */}
          <div className="absolute inset-0 z-20 p-5 sm:p-8 flex flex-col justify-between text-right">
            {/* Top badges & Admin buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border shadow-lg ${currentSlide.badgeColor}`}
                >
                  {currentSlide.badge}
                </span>
                {currentSlide.highlightText && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/75 text-amber-300 text-xs font-bold border border-amber-400/40 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    {currentSlide.highlightText}
                  </span>
                )}
              </div>

              {/* Admin Actions or Counter */}
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <div className="flex items-center gap-1 bg-black/80 p-1 rounded-xl border border-white/20">
                    <button
                      onClick={(e) => handleOpenEdit(currentSlide, e)}
                      className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition-colors"
                      title="تعديل الشريحة والصورة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSlide(currentSlide.id, e)}
                      className="p-1.5 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white transition-colors"
                      title="حذف الشريحة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="px-2.5 py-1 rounded-full bg-black/75 border border-white/20 text-white font-mono text-xs font-bold shadow-lg">
                  {currentIndex + 1} / {slides.length}
                </div>
              </div>
            </div>

              {/* Bottom Action & Arrow Nav */}
            <div className="flex items-center justify-between gap-3 pt-2 mt-auto">
              <button
                type="button"
                onClick={() => onNavigateTab(currentSlide.tabTarget)}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs sm:text-sm transition-all transform active:scale-95 shadow-xl shadow-[#00FFD2]/25 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <span>{currentSlide.actionText}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              {/* Slider Arrows & Dots */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrev}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-105 cursor-pointer"
                  title="السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNext}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-105 cursor-pointer"
                  title="التالي"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-[#00FFD2]' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              title={`شريحة ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Admin Slide Edit / Add Modal */}
      {isEditModalOpen && editingSlide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-[#0d1211] border-2 border-[#00FFD2]/40 rounded-3xl w-full max-w-lg p-6 relative shadow-2xl font-['Cairo'] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles className="w-5 h-5 text-[#00FFD2]" />
              {isAddingNew ? 'إضافة شريحة جديدة' : 'تعديل الشريحة والصورة'}
            </h3>

            <form onSubmit={handleSaveSlide} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">رابط الصورة (URL)</label>
                <input
                  type="url"
                  value={editingSlide.image}
                  onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">العنوان الرئيسي</label>
                <input
                  type="text"
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الوصف الفرعي</label>
                <textarea
                  value={editingSlide.subtitle}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  rows={2}
                  className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">نص الشارة العلوية</label>
                  <input
                    type="text"
                    value={editingSlide.badge}
                    onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                    className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">نص الزر</label>
                  <input
                    type="text"
                    value={editingSlide.actionText}
                    onChange={(e) => setEditingSlide({ ...editingSlide, actionText: e.target.value })}
                    className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">القسم المستهدف</label>
                  <select
                    value={editingSlide.tabTarget}
                    onChange={(e) => setEditingSlide({ ...editingSlide, tabTarget: e.target.value })}
                    className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#00FFD2] cursor-pointer"
                  >
                    <option value="playgrounds">الملاعب وحجز الساعات</option>
                    <option value="leagues">الدوريات والبطولات</option>
                    <option value="matches">المباريات الودية</option>
                    <option value="academies">الأكاديميات</option>
                    <option value="scouting">كشاف المواهب (CV)</option>
                    <option value="map">الخريطة التفاعلية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">نص التمييز الإضافي</label>
                  <input
                    type="text"
                    value={editingSlide.highlightText || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, highlightText: e.target.value })}
                    placeholder="مثال: خصم 20%"
                    className="w-full bg-[#050707] border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#00FFD2]"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ الشريحة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
