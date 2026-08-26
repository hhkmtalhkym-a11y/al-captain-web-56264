import React from 'react';
import { MapPin, Users, Bus, ArrowLeft, Star, Phone, Trash2, Edit3 } from 'lucide-react';
import { Academy } from '../types';
import { formatSYP, openWhatsAppShare } from '../utils/helpers';

interface AcademyCardProps {
  key?: React.Key;
  academy: Academy;
  currentUser?: any;
  isAdmin?: boolean;
  onViewDetails: (aca: Academy) => void;
  onRegister?: (aca: Academy) => void;
  onEditAcademy?: (aca: Academy) => void;
  onDeleteAcademy?: (id: string) => void;
}

export default function AcademyCard({
  academy,
  currentUser,
  isAdmin = false,
  onViewDetails,
  onRegister,
  onEditAcademy,
  onDeleteAcademy
}: AcademyCardProps) {
  // Strictly check if the current user is an authorized Administrator
  const isSystemAdmin = Boolean(
    isAdmin ||
    currentUser?.isAdmin === true ||
    currentUser?.role === 'admin'
  );

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

        <div className="absolute top-3 left-3 z-10">
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
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-purple-400 transition-colors line-clamp-1">
              {academy.name}
            </h3>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{academy.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            {academy.locationDetails}
          </p>

          <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed">
            {academy.description}
          </p>

          <div className="bg-[#050707] p-2.5 rounded-xl border border-white/5 space-y-1 text-xs mb-4">
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
              className="py-2 px-3 rounded-xl bg-[#050707] hover:bg-purple-950/40 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1"
            >
              <span>البرامج</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
            {onRegister && (
              <button
                onClick={() => onRegister(academy)}
                className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-lg"
              >
                <span>تسجيل طالب</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
