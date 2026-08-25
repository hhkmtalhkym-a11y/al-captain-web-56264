import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, MapPin, Flag, Trophy, Users } from 'lucide-react';
import { League, LeagueFixture, LeagueFixtureStatus } from '../types';

interface AddLeagueMatchModalProps {
  isOpen: boolean;
  league: League;
  onClose: () => void;
  onAddFixture: (fixture: LeagueFixture) => void;
}

export default function AddLeagueMatchModal({
  isOpen,
  league,
  onClose,
  onAddFixture
}: AddLeagueMatchModalProps) {
  const existingTeams = league.standings.map((s) => s.teamName);

  const [round, setRound] = useState(`الجولة ${league.fixtures.length + 1}`);
  const [teamA, setTeamA] = useState(existingTeams[0] || 'فريق 1');
  const [teamB, setTeamB] = useState(existingTeams[1] || 'فريق 2');
  const [customTeamA, setCustomTeamA] = useState('');
  const [customTeamB, setCustomTeamB] = useState('');
  const [useCustomTeamA, setUseCustomTeamA] = useState(false);
  const [useCustomTeamB, setUseCustomTeamB] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [venue, setVenue] = useState(league.hostingVenue);
  const [mainReferee, setMainReferee] = useState('');
  const [status, setStatus] = useState<LeagueFixtureStatus>('قادمة');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTeamA = useCustomTeamA ? customTeamA.trim() : teamA;
    const finalTeamB = useCustomTeamB ? customTeamB.trim() : teamB;

    if (!finalTeamA || !finalTeamB) {
      alert('يرجى تحديد أسماء الفريقين بشكل صحيح');
      return;
    }

    if (finalTeamA === finalTeamB) {
      alert('لا يمكن أن يلعب الفريق ضد نفسه!');
      return;
    }

    const newFixture: LeagueFixture = {
      id: `fix-${Date.now()}`,
      leagueId: league.id,
      round,
      teamA: finalTeamA,
      teamB: finalTeamB,
      date,
      time,
      venue,
      status,
      isFinished: false,
      mainReferee: mainReferee.trim() || undefined,
      notes: notes.trim() || undefined,
      goals: [],
      cards: [],
      sendOffs: [],
      substitutions: []
    };

    onAddFixture(newFixture);
    onClose();
  };

  return (
    <div
      id="add-league-match-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-amber-400/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121c18] via-[#0d1211] to-[#121c18] border-b border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">إضافة مباراة جديدة في الدوري</h2>
              <p className="text-xs text-gray-400">{league.name}</p>
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Round */}
          <div>
            <label className="block font-bold text-white mb-1">اسم الجولة أو الدور *</label>
            <input
              type="text"
              required
              placeholder="مثال: الجولة 6، ربع النهائي، مباراة القمة"
              value={round}
              onChange={(e) => setRound(e.target.value)}
              className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Teams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Team A */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-white">الفريق الأول (المضيف) *</label>
                <button
                  type="button"
                  onClick={() => setUseCustomTeamA(!useCustomTeamA)}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  {useCustomTeamA ? 'اختر من القائمة' : 'كتابة اسم مخصص'}
                </button>
              </div>
              {useCustomTeamA ? (
                <input
                  type="text"
                  required
                  placeholder="اسم الفريق الأول"
                  value={customTeamA}
                  onChange={(e) => setCustomTeamA(e.target.value)}
                  className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                />
              ) : (
                <select
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                >
                  {existingTeams.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Team B */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-white">الفريق الثاني (الضيف) *</label>
                <button
                  type="button"
                  onClick={() => setUseCustomTeamB(!useCustomTeamB)}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  {useCustomTeamB ? 'اختر من القائمة' : 'كتابة اسم مخصص'}
                </button>
              </div>
              {useCustomTeamB ? (
                <input
                  type="text"
                  required
                  placeholder="اسم الفريق الثاني"
                  value={customTeamB}
                  onChange={(e) => setCustomTeamB(e.target.value)}
                  className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                />
              ) : (
                <select
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                >
                  {existingTeams.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-white mb-1">تاريخ المباراة *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-white mb-1">توقيت الانطلاق *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Venue & Referee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-white mb-1">الملعب المستضيف *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-white mb-1">حكم الساحة (اختياري)</label>
              <input
                type="text"
                placeholder="اسم الحكم المعتمد"
                value={mainReferee}
                onChange={(e) => setMainReferee(e.target.value)}
                className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-white mb-1">ملاحظات أو تعليمات خاصة (اختياري)</label>
            <input
              type="text"
              placeholder="مثال: الحضور بالزي الأساسي للفريقين"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> حفظ وإضافة المباراة إلى جدول الدوري
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
