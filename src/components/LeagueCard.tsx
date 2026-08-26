import React from 'react';
import { Trophy, Users, MapPin, Calendar, FileText, ArrowLeft, Zap, Trash2 } from 'lucide-react';
import { League } from '../types';
import { formatSYP, exportLeaguePdf } from '../utils/helpers';

interface LeagueCardProps {
  key?: React.Key;
  league: League;
  currentUser?: any;
  isAdmin?: boolean;
  onViewDetails: (l: League) => void;
  onDeleteLeague?: (id: string) => void;
}

export default function LeagueCard({
  league,
  currentUser,
  isAdmin = false,
  onViewDetails,
  onDeleteLeague
}: LeagueCardProps) {
  const isOwner = Boolean(
    currentUser && (
      league.ownerId === currentUser.id ||
      league.organizerPhone === currentUser.phone ||
      league.organizerName === currentUser.name
    )
  );
  const hasManagementPermission = isAdmin || (currentUser && currentUser.isAdmin) || isOwner;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من حذف بطولة "${league.name}" بشكل نهائي؟`)) {
      if (onDeleteLeague) onDeleteLeague(league.id);
    }
  };

  return (
    <div
      id={`league-card-${league.id}`}
      className="bg-[#0d1211] border border-[#00FFD2]/20 rounded-2xl overflow-hidden hover:border-amber-400/50 transition-all duration-300 flex flex-col group hover:shadow-xl hover:shadow-amber-400/5 font-['Cairo'] relative"
    >
      {/* Admin / Organizer Action Badge */}
      {hasManagementPermission && (
        <div className="absolute top-3 right-1/2 translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/90 px-2.5 py-1 rounded-full border border-red-500/40 shadow-xl">
          <span className="text-[10px] font-bold text-amber-400">
            {isAdmin || (currentUser && currentUser.isAdmin) ? 'لوحة الإدارة' : 'منظم الدوري'}
          </span>
          {onDeleteLeague && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white transition-colors"
              title="حذف البطولة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Banner */}
      <div className="relative h-48 w-full bg-[#050707] overflow-hidden">
        <img
          src={league.image}
          alt={league.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1211] via-black/40 to-transparent"></div>

        {/* Badges */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <span className="bg-black/80 backdrop-blur-md text-[#00FFD2] text-xs font-bold px-3 py-1 rounded-full border border-[#00FFD2]/30 flex items-center gap-1 shadow-lg">
            <MapPin className="w-3 h-3" />
            {league.governorate}
          </span>
        </div>

        <div className="absolute top-3 left-3 z-10">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 ${
              league.status === 'نشط'
                ? 'bg-amber-400 text-black'
                : league.status === 'مقبل'
                ? 'bg-[#00FFD2] text-black'
                : 'bg-gray-600 text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {league.status === 'نشط' ? 'دوري جارٍ' : league.status === 'مقبل' ? 'تسجيل مفتوح' : 'مكتمل'}
          </span>
        </div>

        {/* Prizes info banner */}
        <div className="absolute bottom-3 right-3 left-3 z-10 flex items-center justify-between text-xs">
          <span className="text-amber-300 font-bold bg-black/70 px-2.5 py-1 rounded-lg border border-amber-400/30 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            الجوائز: {formatSYP(league.prizes.cashPrize)} + كأس البطولة
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
            {league.name}
          </h3>
          <p className="text-xs text-gray-400 mb-3">{league.season} • {league.hostingVenue}</p>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-4">
            <div className="p-2 rounded-lg bg-[#050707] border border-white/5">
              <span className="text-gray-400 block text-[10px]">نظام البطولة:</span>
              <strong className="text-white">{league.system}</strong>
            </div>
            <div className="p-2 rounded-lg bg-[#050707] border border-white/5">
              <span className="text-gray-400 block text-[10px]">عدد الفرق:</span>
              <strong className="text-white">{league.teamsCount} فرق مشاركة</strong>
            </div>
          </div>

          {/* Quick Standings Leader */}
          {league.standings.length > 0 && (
            <div className="bg-[#050707] p-2.5 rounded-xl border border-white/5 mb-3 text-xs">
              <span className="text-[10px] text-gray-400 block mb-1">المتصدر الحالي:</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  🥇 {league.standings[0].teamName}
                </span>
                <span className="text-gray-300 font-mono text-[11px]">
                  {league.standings[0].points} نقطة ({league.standings[0].played} مباريات)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-white/5 flex items-center gap-2">
          <button
            onClick={() => exportLeaguePdf(league)}
            className="p-2.5 rounded-xl bg-[#050707] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
            title="تحميل تقرير الدوري PDF"
          >
            <FileText className="w-4 h-4 text-amber-400" />
          </button>
          <button
            onClick={() => onViewDetails(league)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg"
          >
            <span>جدول المباريات والترتيب</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
