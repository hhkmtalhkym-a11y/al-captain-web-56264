import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Trophy, Calendar, MapPin, Swords, Users, Sparkles, ArrowLeft } from 'lucide-react';
import { League, Playground, FriendlyMatch } from '../types';

interface SlideItem {
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
}

export default function HeroBannerSlider({ onNavigateTab, featuredLeagues }: HeroBannerSliderProps) {
  const defaultSlides: SlideItem[] = [
    {
      id: 'slide-1',
      badge: '🏆 دوريات وبطولات حصرية',
      badgeColor: 'bg-amber-400 text-black border-amber-300',
      title: 'أقوى الدوريات السورية والمنافسات الرسمية',
      subtitle: 'جوائز نقدية كبرى، كؤوس، ميداليات ذهبية، وتوثيق مباشر لجدول الترتيب والبطاقات والهدافين.',
      actionText: 'استكشف بطولات الدوري',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80',
      tabTarget: 'leagues',
      highlightText: 'جوائز حتى 4,000,000 ل.س'
    },
    {
      id: 'slide-2',
      badge: '⚽ حجز الملاعب في سوريا',
      badgeColor: 'bg-[#00FFD2] text-black border-[#00FFD2]',
      title: 'احجز أفضل ملاعب العشب الصناعي والطبيعي فوراً',
      subtitle: 'ملاعب معتمدة في دمشق، ريف دمشق، حلب، حمص، اللاذقية وجميع المحافظات مع إضاءة ليلية وخدمات متكاملة.',
      actionText: 'تصفح واحجز ملعبك',
      image: 'https://images.unsplash.com/photo-1529900244920-535ec395abe0?auto=format&fit=crop&w=1400&q=80',
      tabTarget: 'playgrounds',
      highlightText: 'تأكيد حجز فوري ومباشر'
    },
    {
      id: 'slide-3',
      badge: '⚔️ تحديات ومباريات ودية',
      badgeColor: 'bg-[#ff2a5f] text-white border-[#ff2a5f]',
      title: 'أنشئ مباراة وتحدَّ أقوى الفرق في منطقتك',
      subtitle: 'نظام حجز ملاعب مشترك، تثبيت مواعيد اللعب، وتوثيق نتائج المباريات والتشكيلات الرياضية.',
      actionText: 'شاهد التحديات المتاحة',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80',
      tabTarget: 'challenges',
      highlightText: 'مباريات يومية نشطة'
    },
    {
      id: 'slide-4',
      badge: '🌟 أكاديميات كرة القدم والمدربون',
      badgeColor: 'bg-purple-500 text-white border-purple-400',
      title: 'سجّل في أفضل الأكاديميات الكروية لتطوير مهاراتك',
      subtitle: 'إشراف مدربين معتمدين من الاتحاد الآسيوي، دورات تدريبية للناشئين والشباب، وتجهيزات احترافية.',
      actionText: 'استكشف الأكاديميات الرياضية',
      image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1400&q=80',
      tabTarget: 'academies',
      highlightText: 'تدريب احترافي معتمد'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % defaultSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, defaultSlides.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % defaultSlides.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + defaultSlides.length) % defaultSlides.length);
  };

  const currentSlide = defaultSlides[currentIndex];

  return (
    <div
      id="hero-banner-slider"
      className="relative rounded-3xl overflow-hidden border-2 border-[#00FFD2]/30 shadow-2xl bg-[#071310] font-['Cairo'] group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image with smooth fade */}
      <div className="relative h-72 sm:h-80 md:h-96 w-full overflow-hidden">
        {defaultSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071310] via-[#071310]/85 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#071310] via-transparent to-black/40"></div>
          </div>
        ))}

        {/* Slide Content */}
        <div className="absolute inset-0 z-20 p-6 sm:p-10 flex flex-col justify-between text-right">
          {/* Top badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black border shadow-md ${currentSlide.badgeColor}`}
              >
                {currentSlide.badge}
              </span>
              {currentSlide.highlightText && (
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 text-amber-300 text-xs font-bold border border-amber-400/30">
                  <Sparkles className="w-3 h-3" />
                  {currentSlide.highlightText}
                </span>
              )}
            </div>

            {/* Slide Index Counter */}
            <div className="px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-white font-mono text-xs font-bold">
              {currentIndex + 1} / {defaultSlides.length}
            </div>
          </div>

          {/* Middle Headings */}
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-lg">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Bottom Action & Navigation */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab(currentSlide.tabTarget)}
              className="px-6 py-3 rounded-2xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black font-black text-xs sm:text-sm transition-all transform active:scale-95 shadow-lg shadow-[#00FFD2]/25 flex items-center gap-2"
            >
              <span>{currentSlide.actionText}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {defaultSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex ? 'w-8 bg-[#00FFD2]' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={goToPrev}
          className="absolute top-1/2 -translate-y-1/2 left-3 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-[#00FFD2] text-white hover:text-black border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="absolute top-1/2 -translate-y-1/2 right-3 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-[#00FFD2] text-white hover:text-black border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
