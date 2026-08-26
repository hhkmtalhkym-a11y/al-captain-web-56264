import React, { useState } from 'react';
import {
  MapPin,
  Users,
  SunMedium,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Calendar,
  Trash2,
  Edit3
} from 'lucide-react';
import { Playground } from '../types';
import { formatSYP } from '../utils/helpers';

interface PlaygroundCardProps {
  key?: React.Key;
  playground: Playground;
  currentUser?: any;
  isAdmin?: boolean;
  onViewDetails: (pg: Playground) => void;
  onBookNow: (pg: Playground) => void;
  onDelete?: (id: string) => void;
  onDeletePlayground?: (id: string) => void;
}

export default function PlaygroundCard({
  playground,
  currentUser,
  isAdmin = false,
  onViewDetails,
  onBookNow,
  onDelete,
  onDeletePlayground
}: PlaygroundCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isOwner =
    Boolean(currentUser && (
      (playground as any).ownerId === currentUser.id ||
      playground.managerPhone === currentUser.phone
    ));
  const hasManagementPermission = isAdmin || (currentUser && currentUser.isAdmin) || isOwner;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % playground.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + playground.images.length) % playground.images.length);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من حذف ملعب "${playground.name}" بشكل نهائي؟`)) {
      if (onDeletePlayground) onDeletePlayground(playground.id);
      else if (onDelete) onDelete(playground.id);
    }
  };

  return (
    <div
      id={`playground-card-${playground.id}`}
      className="bg-[#0d1211] border border-[#00FFD2]/20 rounded-2xl overflow-hidden hover:border-[#00FFD2]/60 transition-all duration-300 flex flex-col group hover:shadow-xl hover:shadow-[#00FFD2]/5 font-['Cairo'] relative"
    >
      {/* Admin / Owner Action Badge */}
      {hasManagementPermission && (
        <div className="absolute top-3 right-1/2 translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/90 px-2.5 py-1 rounded-full border border-red-500/40 shadow-xl">
          <span className="text-[10px] font-bold text-red-400">
            {isAdmin || (currentUser && currentUser.isAdmin) ? 'لوحة الإدارة' : 'صاحب الملعب'}
          </span>
          {(onDelete || onDeletePlayground) && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white transition-colors"
              title="حذف الملعب"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Image Carousel */}
      <div className="relative h-48 sm:h-52 w-full bg-[#050707] overflow-hidden">
        <img
          src={playground.images[currentImageIndex] || playground.images[0]}
          alt={playground.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1211] via-transparent to-black/40"></div>

        {/* Governorate Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-black/80 backdrop-blur-md text-[#00FFD2] text-xs font-bold px-3 py-1 rounded-full border border-[#00FFD2]/30 flex items-center gap-1 shadow-lg">
            <MapPin className="w-3 h-3" />
            {playground.governorate}
          </span>
        </div>

        {/* Zero Commission Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-[#00FFD2] text-black text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
            <Zap className="w-3 h-3 fill-black" />
            بدون عمولة 0%
          </span>
        </div>

        {/* Carousel Arrows if multiple images */}
        {playground.images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-[#00FFD2] hover:text-black text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-[#00FFD2] hover:text-black text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dots */}
        {playground.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
            {playground.images.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? 'bg-[#00FFD2] w-3' : 'bg-white/50'
                }`}
              ></span>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-[#00FFD2] transition-colors line-clamp-1">
              {playground.name}
            </h3>
            <div className="flex items-center gap-1 bg-[#050707] px-2 py-0.5 rounded-lg border border-amber-400/20 text-amber-400 text-xs font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{playground.rating.toFixed(1)}</span>
              <span className="text-[10px] text-gray-500 font-normal">({playground.reviewsCount})</span>
            </div>
          </div>

          {/* Location details */}
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-[#00FFD2] shrink-0" />
            {playground.detailedArea}
          </p>

          {/* Specs tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-[#050707] text-gray-300 border border-white/5 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#00FFD2]" />
              {playground.capacity}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#050707] text-gray-300 border border-white/5">
              {playground.surface}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#050707] text-gray-300 border border-white/5 flex items-center gap-1">
              <SunMedium className="w-3 h-3 text-amber-400" />
              إنارة {playground.lighting}
            </span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] text-gray-400 block">أجرة الملعب (للساعة):</span>
              <span className="text-base font-black text-[#00FFD2] font-mono">
                {formatSYP(playground.pricePerHour)}
              </span>
            </div>
            <div className="text-left text-[11px] text-gray-400">
              <span>الدفع: كاش أو شام كاش</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id={`btn-details-${playground.id}`}
              onClick={() => onViewDetails(playground)}
              className="py-2.5 px-3 rounded-xl bg-[#050707] hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors flex items-center justify-center gap-1"
            >
              عرض التفاصيل
            </button>
            <button
              id={`btn-book-${playground.id}`}
              onClick={() => onBookNow(playground)}
              className="py-2.5 px-3 rounded-xl bg-[#00FFD2] hover:bg-[#00e6bd] text-black text-xs font-bold transition-all glow-primary flex items-center justify-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              احجز الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
