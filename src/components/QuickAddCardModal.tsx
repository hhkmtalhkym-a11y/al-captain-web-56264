import React, { useState } from 'react';
import { X, Shield, Plus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { League, LeagueFixture, CardEvent, SendOffEvent, CardReason } from '../types';

interface QuickAddCardModalProps {
  isOpen: boolean;
  league: League;
  onClose: () => void;
  onAddCardToFixture: (
    fixtureId: string,
    newCard: CardEvent,
    sendOff?: SendOffEvent
  ) => void;
}

const CARD_REASONS: CardReason[] = [
  'تدخل عنيف',
  'اعتراض',
  'تأخير اللعب',
  'تصرف غير لائق',
  'الاحتفال المبالغ',
  'خلع القميص',
  'البطاقة الصفراء الثانية',
  'إعاقة هجمة واعدة',
  'أخرى'
];

export default function QuickAddCardModal({
  isOpen,
  league,
  onClose,
  onAddCardToFixture
}: QuickAddCardModalProps) {
  if (!isOpen) return null;

  const fixtures = league.fixtures;
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(
    fixtures[0]?.id || ''
  );

  const selectedFixture = fixtures.find((f) => f.id === selectedFixtureId) || fixtures[0];

  const [selectedTeam, setSelectedTeam] = useState<string>(
    selectedFixture?.teamA || ''
  );
  const [playerName, setPlayerName] = useState<string>('');
  const [cardType, setCardType] = useState<'صفراء' | 'حمراء'>('صفراء');
  const [minute, setMinute] = useState<string>('');
  const [reason, setReason] = useState<CardReason>('تدخل عنيف');
  const [customReason, setCustomReason] = useState<string>('');

  const handleFixtureChange = (fixtureId: string) => {
    setSelectedFixtureId(fixtureId);
    const fix = fixtures.find((f) => f.id === fixtureId);
    if (fix) {
      setSelectedTeam(fix.teamA);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixture || !playerName.trim() || !minute.trim()) return;

    // Check if second yellow for this player in this match
    const existingYellows = (selectedFixture.cards || []).filter(
      (c) =>
        c.player.trim().toLowerCase() === playerName.trim().toLowerCase() &&
        c.team === selectedTeam &&
        c.cardType === 'صفراء'
    );

    const isSecondYellow = cardType === 'صفراء' && existingYellows.length >= 1;

    const finalReason = reason === 'أخرى' && customReason.trim()
      ? (customReason.trim() as CardReason)
      : isSecondYellow
      ? 'البطاقة الصفراء الثانية'
      : reason;

    const newCard: CardEvent = {
      id: `card-${Date.now()}`,
      team: selectedTeam,
      player: playerName.trim(),
      cardType,
      minute: minute.trim(),
      reason: finalReason,
      isSecondYellow
    };

    let sendOff: SendOffEvent | undefined = undefined;
    if (cardType === 'حمراء' || isSecondYellow) {
      sendOff = {
        id: `so-${Date.now()}`,
        team: selectedTeam,
        player: playerName.trim(),
        sendOffType: isSecondYellow ? 'إنذار ثاني (صفراء ثانية)' : 'طرد مباشر (حمراء)',
        minute: minute.trim(),
        reason: isSecondYellow ? 'الحصول على إنذارين أصفرين' : finalReason,
        suspensionMatches: isSecondYellow ? 1 : 2
      };
    }

    onAddCardToFixture(selectedFixture.id, newCard, sendOff);
    onClose();
  };

  return (
    <div
      id="quick-add-card-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-amber-400/40 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121c18] via-[#0d1211] to-[#121c18] border-b border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">تسجيل بطاقة / إنذار رسمي</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Fixture Selector */}
          <div>
            <label className="block font-bold text-white mb-1">اختر المباراة المستهدفة *</label>
            <select
              value={selectedFixtureId}
              onChange={(e) => handleFixtureChange(e.target.value)}
              className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
            >
              {fixtures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.round}: {f.teamA} ضد {f.teamB} ({f.date})
                </option>
              ))}
            </select>
          </div>

          {/* Team Selector */}
          {selectedFixture && (
            <div>
              <label className="block font-bold text-white mb-1">الفريق *</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
              >
                <option value={selectedFixture.teamA}>{selectedFixture.teamA}</option>
                <option value={selectedFixture.teamB}>{selectedFixture.teamB}</option>
              </select>
            </div>
          )}

          {/* Player Name */}
          <div>
            <label className="block font-bold text-white mb-1">اسم اللاعب المنذر *</label>
            <input
              type="text"
              required
              placeholder="مثال: عمر السومة"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Card Type & Minute */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-white mb-1">نوع البطاقة *</label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value as 'صفراء' | 'حمراء')}
                className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="صفراء">🟨 بطاقة صفراء (إنذار)</option>
                <option value="حمراء">🟥 بطاقة حمراء (طرد مباشر)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-white mb-1">الدقيقة *</label>
              <input
                type="text"
                required
                placeholder="مثال: 65 أو 90+2"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Card Reason */}
          <div>
            <label className="block font-bold text-white mb-1">سبب المخالفة *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as CardReason)}
              className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
            >
              {CARD_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === 'أخرى' && (
            <div>
              <label className="block font-bold text-white mb-1">تفاصيل السبب</label>
              <input
                type="text"
                placeholder="اكتب سبب المخالفة"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {/* Notice box */}
          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-[11px] text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              سيتم تحديث سجل عقوبات اللاعبين ونقاط اللعب النظيف للفرق وتطبيق قواعد الإيقاف التلقائي فوراً.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> حفظ وإشهار البطاقة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
