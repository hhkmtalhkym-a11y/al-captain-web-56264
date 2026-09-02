import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Save,
  RotateCcw,
  Sparkles,
  Filter
} from 'lucide-react';
import { League, LeagueFixture, LeagueFixtureStatus } from '../types';

interface BatchScheduleModalProps {
  isOpen: boolean;
  league: League;
  onClose: () => void;
  onUpdateFixtures: (updatedFixtures: LeagueFixture[]) => void;
}

export default function BatchScheduleModal({
  isOpen,
  league,
  onClose,
  onUpdateFixtures
}: BatchScheduleModalProps) {
  if (!isOpen) return null;

  // Local copy of fixtures for bulk editing
  const [fixtures, setFixtures] = useState<LeagueFixture[]>(league.fixtures);
  const [selectedRound, setSelectedRound] = useState<string>('all');

  // Batch Tool State
  const [batchRound, setBatchRound] = useState<string>(
    league.fixtures[0]?.round || 'الجولة 1'
  );
  const [batchStartDate, setBatchStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [batchStartTime, setBatchStartTime] = useState<string>('18:00');
  const [batchIntervalMinutes, setBatchIntervalMinutes] = useState<number>(90);
  const [batchVenue, setBatchVenue] = useState<string>(league.hostingVenue);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string>('');

  const allRounds = Array.from(new Set(fixtures.map((f) => f.round)));

  // Filtered fixtures to display
  const displayedFixtures = selectedRound === 'all'
    ? fixtures
    : fixtures.filter((f) => f.round === selectedRound);

  // Apply Batch Rescheduling to a round
  const handleApplyBatchSchedule = () => {
    if (!batchRound) return;

    let currentDateTime = new Date(`${batchStartDate}T${batchStartTime}`);
    if (isNaN(currentDateTime.getTime())) {
      currentDateTime = new Date();
    }

    const updated = fixtures.map((fix) => {
      if (fix.round === batchRound) {
        const dateStr = currentDateTime.toISOString().split('T')[0];
        const hours = String(currentDateTime.getHours()).padStart(2, '0');
        const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        // Increment time for next match
        currentDateTime = new Date(currentDateTime.getTime() + batchIntervalMinutes * 60000);

        return {
          ...fix,
          date: dateStr,
          time: timeStr,
          venue: batchVenue || fix.venue
        };
      }
      return fix;
    });

    setFixtures(updated);
    setBatchSuccessMsg(`تم تحديث توقيت وتاريخ جميع مباريات (${batchRound}) بنجاح! لا تنسَ الضغط على "حفظ التعديلات".`);
    setTimeout(() => setBatchSuccessMsg(''), 4000);
  };

  // Quick field updates for a specific fixture
  const handleUpdateField = (fixtureId: string, field: keyof LeagueFixture, value: any) => {
    setFixtures((prev) =>
      prev.map((f) => (f.id === fixtureId ? { ...f, [field]: value } : f))
    );
  };

  // Save All Changes
  const handleSaveAll = () => {
    onUpdateFixtures(fixtures);
    onClose();
  };

  return (
    <div
      id="batch-schedule-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-amber-400/40 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121c18] via-[#0d1211] to-[#121c18] border-b border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">جدولة وتعديل مواعيد مباريات الدوري</h2>
              <p className="text-xs text-gray-400">
                {league.name} • تعديل سريع لمواعيد الجولات والملاعب
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Batch Rescheduling Tool Box */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#070b0a] border border-amber-400/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>أداة الجدولة الجماعية للجولات (Batch Auto-Scheduler)</span>
              </h3>
              <span className="text-[11px] text-gray-400">
                حدد الجولة والتاريخ وسيقوم النظام بتوزيع مواعيد المباريات تلقائياً
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-gray-300 font-bold mb-1">الجولة المستهدفة</label>
                <select
                  value={batchRound}
                  onChange={(e) => setBatchRound(e.target.value)}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {allRounds.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-300 font-bold mb-1">تاريخ انطلاق الجولة</label>
                <input
                  type="date"
                  value={batchStartDate}
                  onChange={(e) => setBatchStartDate(e.target.value)}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-300 font-bold mb-1">وقت أول مباراة</label>
                <input
                  type="time"
                  value={batchStartTime}
                  onChange={(e) => setBatchStartTime(e.target.value)}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-300 font-bold mb-1">الفارق بين المباريات</label>
                <select
                  value={batchIntervalMinutes}
                  onChange={(e) => setBatchIntervalMinutes(Number(e.target.value))}
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value={0}>نفس التوقيت (ملاعب متوازية)</option>
                  <option value={60}>كل ساعة (60 دقيقة)</option>
                  <option value={90}>كل ساعة ونصف (90 دقيقة)</option>
                  <option value={120}>كل ساعتين (120 دقيقة)</option>
                  <option value={1440}>كل يوم مباراة (فارق 24 ساعة)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-300 font-bold mb-1">الملعب المعتمد</label>
                <input
                  type="text"
                  value={batchVenue}
                  onChange={(e) => setBatchVenue(e.target.value)}
                  placeholder="ملعب المباريات"
                  className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleApplyBatchSchedule}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-amber-400/20"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>تطبيق الجدولة الآلية على ({batchRound})</span>
              </button>

              {batchSuccessMsg && (
                <span className="text-xs text-emerald-400 font-bold animate-fadeIn flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {batchSuccessMsg}
                </span>
              )}
            </div>
          </div>

          {/* Quick Filter & Fixtures Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#070b0a] p-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-white">تصفية حسب الجولة:</span>
                <select
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                  className="bg-[#0d1211] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="all">جميع الجولات ({fixtures.length} مباراة)</option>
                  {allRounds.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[11px] text-gray-400">
                يمكنك تعديل أي حقل مباشرة وسينعكس فور حفظ التغييرات
              </span>
            </div>

            {/* Editable Fixtures List */}
            <div className="space-y-2.5">
              {displayedFixtures.map((fix) => (
                <div
                  key={fix.id}
                  className="p-3.5 rounded-2xl bg-[#070b0a] border border-white/10 hover:border-amber-400/30 transition-all space-y-3"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                    {/* Round & Match Title */}
                    <div className="flex items-center gap-2 min-w-[240px]">
                      <input
                        type="text"
                        value={fix.round}
                        onChange={(e) => handleUpdateField(fix.id, 'round', e.target.value)}
                        className="w-24 bg-[#0d1211] border border-amber-400/30 rounded-lg py-1 px-2 text-[11px] text-amber-300 font-bold focus:outline-none"
                      />
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <span>{fix.teamA}</span>
                        <span className="text-gray-500 font-normal">ضد</span>
                        <span>{fix.teamB}</span>
                      </div>
                    </div>

                    {/* Date, Time, Venue, Status Inputs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto flex-1">
                      {/* Date */}
                      <div>
                        <input
                          type="date"
                          value={fix.date}
                          onChange={(e) => handleUpdateField(fix.id, 'date', e.target.value)}
                          className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Time */}
                      <div>
                        <input
                          type="time"
                          value={fix.time}
                          onChange={(e) => handleUpdateField(fix.id, 'time', e.target.value)}
                          className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Venue */}
                      <div>
                        <input
                          type="text"
                          value={fix.venue}
                          placeholder="الملعب"
                          onChange={(e) => handleUpdateField(fix.id, 'venue', e.target.value)}
                          className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <select
                          value={fix.status || (fix.isFinished ? 'انتهت' : 'قادمة')}
                          onChange={(e) =>
                            handleUpdateField(
                              fix.id,
                              'status',
                              e.target.value as LeagueFixtureStatus
                            )
                          }
                          className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="قادمة">قادمة</option>
                          <option value="مباشر">مباشر</option>
                          <option value="انتهت">انتهت</option>
                          <option value="مؤجلة">مؤجلة</option>
                          <option value="ملغية">ملغية</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#090d0c] border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>حفظ جميع التعديلات والجدولة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
