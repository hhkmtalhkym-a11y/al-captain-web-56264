import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Save,
  Lock,
  FileText,
  Share2,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  User,
  Activity,
  Award,
  Star,
  Users,
  Flag,
  Calendar,
  MapPin,
  ChevronDown
} from 'lucide-react';
import {
  League,
  LeagueFixture,
  GoalEvent,
  CardEvent,
  SendOffEvent,
  SubstitutionEvent,
  TeamMatchStats,
  GoalType,
  CardReason,
  SubstitutionReason,
  LeagueFixtureStatus
} from '../types';
import { exportMatchSheetPdf, openWhatsAppShare } from '../utils/helpers';

interface RecordMatchResultModalProps {
  isOpen: boolean;
  fixture: LeagueFixture | null;
  league: League;
  isAdmin: boolean;
  isOrganizer: boolean;
  onClose: () => void;
  onSaveFixture: (updatedFixture: LeagueFixture, shouldLock?: boolean) => void;
}

const GOAL_TYPES: GoalType[] = [
  'تسديدة',
  'ركلة جزاء',
  'ركلة حرة',
  'رأسية',
  'هدف عكسي',
  'ركلة زاوية',
  'هجمة مرتدة',
  'كرة ثابتة',
  'أخرى'
];

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

const SUB_REASONS: SubstitutionReason[] = [
  'تغيير تكتيكي',
  'إصابة',
  'إرهاق',
  'طرد',
  'أخرى'
];

export default function RecordMatchResultModal({
  isOpen,
  fixture,
  league,
  isAdmin,
  isOrganizer,
  onClose,
  onSaveFixture
}: RecordMatchResultModalProps) {
  if (!isOpen || !fixture) return null;

  const canEdit = isAdmin || isOrganizer;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'cards' | 'subs' | 'stats' | 'summary'>('overview');

  // Match Basic Info State
  const [status, setStatus] = useState<LeagueFixtureStatus>(fixture.status || (fixture.isFinished ? 'انتهت' : 'قادمة'));
  const [scoreA, setScoreA] = useState<number>(fixture.scoreA ?? 0);
  const [scoreB, setScoreB] = useState<number>(fixture.scoreB ?? 0);
  const [date, setDate] = useState(fixture.date || '');
  const [time, setTime] = useState(fixture.time || '19:00');
  const [venue, setVenue] = useState(fixture.venue || league.hostingVenue);
  const [mainReferee, setMainReferee] = useState(fixture.mainReferee || '');
  const [assistantReferees, setAssistantReferees] = useState<string>(
    (fixture.assistantReferees || []).join('، ')
  );
  const [postponeReason, setPostponeReason] = useState(fixture.postponeReason || '');

  // Goals
  const [goals, setGoals] = useState<GoalEvent[]>(fixture.goals || []);

  // Cards & Send-Offs
  const [cards, setCards] = useState<CardEvent[]>(fixture.cards || []);
  const [sendOffs, setSendOffs] = useState<SendOffEvent[]>(fixture.sendOffs || []);

  // Substitutions
  const [substitutions, setSubstitutions] = useState<SubstitutionEvent[]>(fixture.substitutions || []);

  // Team Stats
  const [statsA, setStatsA] = useState<TeamMatchStats>(
    fixture.statsA || {
      possessionPercentage: 50,
      shotsOnTarget: 4,
      shotsOffTarget: 3,
      corners: 3,
      offsides: 1,
      fouls: 5,
      successfulPasses: 180,
      unsuccessfulPasses: 40,
      goalkeeperSaves: 3,
      interceptions: 8,
      tackles: 10
    }
  );

  const [statsB, setStatsB] = useState<TeamMatchStats>(
    fixture.statsB || {
      possessionPercentage: 50,
      shotsOnTarget: 3,
      shotsOffTarget: 4,
      corners: 2,
      offsides: 2,
      fouls: 6,
      successfulPasses: 175,
      unsuccessfulPasses: 45,
      goalkeeperSaves: 4,
      interceptions: 7,
      tackles: 12
    }
  );

  // Summary & MVP
  const [summaryNotes, setSummaryNotes] = useState(fixture.summaryNotes || '');
  const [manOfTheMatch, setManOfTheMatch] = useState(fixture.manOfTheMatch || '');
  const [matchRating, setMatchRating] = useState<number>(fixture.matchRating || 5);

  // New item inputs
  // 1. Goal Input
  const [newGoalTeam, setNewGoalTeam] = useState<string>(fixture.teamA);
  const [newGoalPlayer, setNewGoalPlayer] = useState('');
  const [newGoalMinute, setNewGoalMinute] = useState('');
  const [newGoalType, setNewGoalType] = useState<GoalType>('تسديدة');
  const [newGoalAssist, setNewGoalAssist] = useState('');

  // 2. Card Input
  const [newCardTeam, setNewCardTeam] = useState<string>(fixture.teamA);
  const [newCardPlayer, setNewCardPlayer] = useState('');
  const [newCardType, setNewCardType] = useState<'صفراء' | 'حمراء'>('صفراء');
  const [newCardMinute, setNewCardMinute] = useState('');
  const [newCardReason, setNewCardReason] = useState<CardReason>('تدخل عنيف');

  // 3. Sub Input
  const [newSubTeam, setNewSubTeam] = useState<string>(fixture.teamA);
  const [newSubPlayerOut, setNewSubPlayerOut] = useState('');
  const [newSubPlayerIn, setNewSubPlayerIn] = useState('');
  const [newSubMinute, setNewSubMinute] = useState('');
  const [newSubReason, setNewSubReason] = useState<SubstitutionReason>('تغيير تكتيكي');

  // Sync scores with goals list if changed
  const handleAddGoal = () => {
    if (!newGoalPlayer.trim() || !newGoalMinute.trim()) return;

    const newGoal: GoalEvent = {
      id: `g-${Date.now()}`,
      team: newGoalTeam,
      player: newGoalPlayer.trim(),
      minute: newGoalMinute.trim(),
      goalType: newGoalType,
      assistPlayer: newGoalAssist.trim() || undefined
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);

    // Auto increment score
    if (newGoalTeam === fixture.teamA) {
      setScoreA((prev) => prev + 1);
    } else {
      setScoreB((prev) => prev + 1);
    }

    setNewGoalPlayer('');
    setNewGoalMinute('');
    setNewGoalAssist('');
  };

  const handleDeleteGoal = (goalId: string) => {
    const goalToRemove = goals.find((g) => g.id === goalId);
    if (!goalToRemove) return;

    setGoals(goals.filter((g) => g.id !== goalId));
    if (goalToRemove.team === fixture.teamA) {
      setScoreA((prev) => Math.max(0, prev - 1));
    } else {
      setScoreB((prev) => Math.max(0, prev - 1));
    }
  };

  // Add Card & Auto Detect 2nd Yellow
  const handleAddCard = () => {
    if (!newCardPlayer.trim() || !newCardMinute.trim()) return;

    const existingYellowsForPlayer = cards.filter(
      (c) =>
        c.player.toLowerCase() === newCardPlayer.trim().toLowerCase() &&
        c.team === newCardTeam &&
        c.cardType === 'صفراء'
    );

    const isSecondYellow = newCardType === 'صفراء' && existingYellowsForPlayer.length >= 1;

    const newCard: CardEvent = {
      id: `card-${Date.now()}`,
      team: newCardTeam,
      player: newCardPlayer.trim(),
      cardType: newCardType,
      minute: newCardMinute.trim(),
      reason: isSecondYellow ? 'البطاقة الصفراء الثانية' : newCardReason,
      isSecondYellow
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);

    // If Red or 2nd Yellow, auto add to send-offs
    if (newCardType === 'حمراء' || isSecondYellow) {
      const sendOff: SendOffEvent = {
        id: `so-${Date.now()}`,
        team: newCardTeam,
        player: newCardPlayer.trim(),
        sendOffType: isSecondYellow ? 'إنذار ثاني (صفراء ثانية)' : 'طرد مباشر (حمراء)',
        minute: newCardMinute.trim(),
        reason: isSecondYellow ? 'الحصول على بطاقة صفراء ثانية' : newCardReason,
        suspensionMatches: isSecondYellow ? 1 : 2
      };
      setSendOffs([...sendOffs, sendOff]);
    }

    setNewCardPlayer('');
    setNewCardMinute('');
  };

  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter((c) => c.id !== cardId));
  };

  // Add Sub
  const handleAddSub = () => {
    if (!newSubPlayerOut.trim() || !newSubPlayerIn.trim() || !newSubMinute.trim()) return;

    const currentSubsForTeam = substitutions.filter((s) => s.team === newSubTeam).length;
    if (currentSubsForTeam >= 5) {
      if (!window.confirm(`الفريق (${newSubTeam}) أجرى بالفعل 5 تبديلات (الحد الأقصى القانوني). هل تود إضافة تبديل إضافي؟`)) {
        return;
      }
    }

    const newSub: SubstitutionEvent = {
      id: `sub-${Date.now()}`,
      team: newSubTeam,
      playerOut: newSubPlayerOut.trim(),
      playerIn: newSubPlayerIn.trim(),
      minute: newSubMinute.trim(),
      reason: newSubReason
    };

    setSubstitutions([...substitutions, newSub]);
    setNewSubPlayerOut('');
    setNewSubPlayerIn('');
    setNewSubMinute('');
  };

  const handleDeleteSub = (subId: string) => {
    setSubstitutions(substitutions.filter((s) => s.id !== subId));
  };

  // Handle Save
  const handleSave = (lockFinal: boolean = false) => {
    const assistants = assistantReferees
      .split('،')
      .map((r) => r.trim())
      .filter(Boolean);

    const updatedFixture: LeagueFixture = {
      ...fixture,
      scoreA: Number(scoreA),
      scoreB: Number(scoreB),
      date,
      time,
      venue,
      status: lockFinal ? 'انتهت' : status,
      isFinished: lockFinal ? true : status === 'انتهت',
      isLocked: lockFinal ? true : fixture.isLocked,
      mainReferee,
      assistantReferees: assistants,
      postponeReason: status === 'مؤجلة' || status === 'ملغية' ? postponeReason : undefined,
      goals,
      cards,
      sendOffs,
      substitutions,
      statsA,
      statsB,
      summaryNotes,
      manOfTheMatch,
      matchRating
    };

    onSaveFixture(updatedFixture, lockFinal);
  };

  const handleShareWhatsApp = () => {
    const text = `⚽ نتيجة مباراة رسمية في ${league.name} ⚽\n` +
      `🏆 ${fixture.round}\n` +
      `⚔️ ${fixture.teamA} [ ${scoreA} - ${scoreB} ] ${fixture.teamB}\n` +
      `🏟️ الملعب: ${venue}\n` +
      `📅 التاريخ: ${date} ${time}\n` +
      (manOfTheMatch ? `🌟 أفضل لاعب: ${manOfTheMatch}\n` : '') +
      `📱 تم التوثيق عبر منصة الكابتن الرياضية - سوريا`;

    openWhatsAppShare(text);
  };

  return (
    <div
      id="record-match-result-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-amber-400/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121c18] via-[#0d1211] to-[#121c18] border-b border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">تسجيل وتوثيق نتيجة المباراة</h2>
                {fixture.isLocked && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> مغلقة نهائياً
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {league.name} • {fixture.round}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportMatchSheetPdf(league.name, { ...fixture, scoreA, scoreB, goals, cards, substitutions, manOfTheMatch, summaryNotes })}
              className="p-2 rounded-xl bg-[#00FFD2]/10 hover:bg-[#00FFD2]/20 text-[#00FFD2] border border-[#00FFD2]/30 transition-all text-xs font-bold flex items-center gap-1.5"
              title="طباعة تقرير المباراة PDF"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">تقرير PDF</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all text-xs font-bold flex items-center gap-1.5"
              title="مشاركة النتيجة"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">واتساب</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Score Board Header Banner */}
        <div className="p-4 sm:p-6 bg-[#070b0a] border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Team A */}
          <div className="flex-1 flex items-center justify-end gap-3 text-right">
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">{fixture.teamA}</h3>
              <span className="text-[11px] text-amber-400/80">الفريق الأول (المضيف)</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center font-bold text-amber-300 text-lg">
              {fixture.teamA.slice(0, 2)}
            </div>
          </div>

          {/* Live Score Input */}
          <div className="flex items-center gap-3 bg-[#0d1211] p-2.5 rounded-2xl border border-amber-400/30 shadow-inner">
            <input
              type="number"
              min="0"
              disabled={!canEdit}
              value={scoreA}
              onChange={(e) => setScoreA(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-14 sm:w-16 h-12 sm:h-14 bg-black/60 border border-amber-400/50 rounded-xl text-center text-2xl sm:text-3xl font-black text-amber-300 focus:outline-none focus:border-[#00FFD2]"
            />
            <span className="text-xl font-bold text-gray-500">:</span>
            <input
              type="number"
              min="0"
              disabled={!canEdit}
              value={scoreB}
              onChange={(e) => setScoreB(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-14 sm:w-16 h-12 sm:h-14 bg-black/60 border border-amber-400/50 rounded-xl text-center text-2xl sm:text-3xl font-black text-amber-300 focus:outline-none focus:border-[#00FFD2]"
            />
          </div>

          {/* Team B */}
          <div className="flex-1 flex items-center justify-start gap-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#00FFD2]/15 border border-[#00FFD2]/30 flex items-center justify-center font-bold text-[#00FFD2] text-lg">
              {fixture.teamB.slice(0, 2)}
            </div>
            <div className="text-right">
              <h3 className="font-bold text-white text-base sm:text-lg">{fixture.teamB}</h3>
              <span className="text-[11px] text-[#00FFD2]/80">الفريق الثاني (الضيف)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 pt-3 bg-[#090d0c] border-b border-white/5 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>بيانات المباراة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'goals'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>الأهداف ({goals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cards'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>البطاقات والإنذارات ({cards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subs')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'subs'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>التبديلات ({substitutions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>الإحصائيات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>رجل المباراة والتقرير</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & STATUS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">حالة المباراة *</label>
                  <select
                    disabled={!canEdit}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LeagueFixtureStatus)}
                    className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="قادمة">قادمة (مجدولة)</option>
                    <option value="مباشر">مباشر (جارية الآن)</option>
                    <option value="انتهت">انتهت (تم لعبها)</option>
                    <option value="مؤجلة">مؤجلة لموعد لاحق</option>
                    <option value="ملغية">ملغية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">الملعب المستضيف *</label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {(status === 'مؤجلة' || status === 'ملغية') && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1.5">
                  <label className="block text-xs font-bold text-red-400">سبب التأجيل أو الإلغاء *</label>
                  <input
                    type="text"
                    placeholder="مثال: سوء الأحوال الجوية، انقطاع الكهرباء..."
                    value={postponeReason}
                    onChange={(e) => setPostponeReason(e.target.value)}
                    className="w-full bg-black/60 border border-red-500/40 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">تاريخ المباراة *</label>
                  <input
                    type="date"
                    disabled={!canEdit}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">وقت انطلاق المباراة *</label>
                  <input
                    type="time"
                    disabled={!canEdit}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Referees */}
              <div className="p-4 rounded-2xl bg-[#070b0a] border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Flag className="w-4 h-4" /> طاقم التحكيم المعتمد
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">حكم الساحة الرئيسي</label>
                    <input
                      type="text"
                      placeholder="الكابتن فراس معلا"
                      disabled={!canEdit}
                      value={mainReferee}
                      onChange={(e) => setMainReferee(e.target.value)}
                      className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">الحكام المساعدون (افصل بينهم بفاصلة)</label>
                    <input
                      type="text"
                      placeholder="مساعد 1، مساعد 2، حكم رابع"
                      disabled={!canEdit}
                      value={assistantReferees}
                      onChange={(e) => setAssistantReferees(e.target.value)}
                      className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-5">
              {/* Add Goal Form */}
              {canEdit && (
                <div className="p-4 rounded-2xl bg-[#070b0a] border border-amber-400/30 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> إضافة هدف جديد
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">الفريق المسجل *</label>
                      <select
                        value={newGoalTeam}
                        onChange={(e) => setNewGoalTeam(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value={fixture.teamA}>{fixture.teamA}</option>
                        <option value={fixture.teamB}>{fixture.teamB}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">اسم اللاعب الهداف *</label>
                      <input
                        type="text"
                        placeholder="مثال: عمر خربين"
                        value={newGoalPlayer}
                        onChange={(e) => setNewGoalPlayer(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">الدقيقة *</label>
                      <input
                        type="text"
                        placeholder="مثال: 34 أو 45+2"
                        value={newGoalMinute}
                        onChange={(e) => setNewGoalMinute(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">طريقة تسجيل الهدف *</label>
                      <select
                        value={newGoalType}
                        onChange={(e) => setNewGoalType(e.target.value as GoalType)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {GOAL_TYPES.map((gt) => (
                          <option key={gt} value={gt}>
                            {gt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">صانع الهدف (أسيست - اختياري)</label>
                      <input
                        type="text"
                        placeholder="مثال: محمود المواس"
                        value={newGoalAssist}
                        onChange={(e) => setNewGoalAssist(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> حفظ وإضافة الهدف
                  </button>
                </div>
              )}

              {/* Goals List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">سجل أهداف المباراة ({goals.length})</h4>
                {goals.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center bg-[#070b0a] rounded-xl border border-white/5">
                    لم يتم تسجيل أهداف حتى الآن
                  </p>
                ) : (
                  goals.map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded-xl bg-[#070b0a] border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                          {g.minute}'
                        </span>
                        <div>
                          <strong className="text-white text-xs block">{g.player}</strong>
                          <span className="text-[10px] text-gray-400">
                            {g.team} • {g.goalType}
                            {g.assistPlayer && ` • صناعة: ${g.assistPlayer}`}
                          </span>
                        </div>
                      </div>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteGoal(g.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CARDS & DISCIPLINARY */}
          {activeTab === 'cards' && (
            <div className="space-y-5">
              {/* Add Card Form */}
              {canEdit && (
                <div className="p-4 rounded-2xl bg-[#070b0a] border border-amber-400/30 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> إشهار بطاقة أو إنذار
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">الفريق *</label>
                      <select
                        value={newCardTeam}
                        onChange={(e) => setNewCardTeam(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value={fixture.teamA}>{fixture.teamA}</option>
                        <option value={fixture.teamB}>{fixture.teamB}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">اسم اللاعب *</label>
                      <input
                        type="text"
                        placeholder="اسم اللاعب المنذر"
                        value={newCardPlayer}
                        onChange={(e) => setNewCardPlayer(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">نوع البطاقة *</label>
                      <select
                        value={newCardType}
                        onChange={(e) => setNewCardType(e.target.value as 'صفراء' | 'حمراء')}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="صفراء">🟨 بطاقة صفراء (إنذار)</option>
                        <option value="حمراء">🟥 بطاقة حمراء (طرد مباشر)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">الدقيقة *</label>
                      <input
                        type="text"
                        placeholder="مثال: 58 أو 90+1"
                        value={newCardMinute}
                        onChange={(e) => setNewCardMinute(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">سبب المخالفة *</label>
                      <select
                        value={newCardReason}
                        onChange={(e) => setNewCardReason(e.target.value as CardReason)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {CARD_REASONS.map((cr) => (
                          <option key={cr} value={cr}>
                            {cr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCard}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Shield className="w-4 h-4" /> توثيق البطاقة في تقرير الحكم
                  </button>
                </div>
              )}

              {/* Cards List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">البطاقات المشهرة في اللقاء ({cards.length})</h4>
                {cards.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center bg-[#070b0a] rounded-xl border border-white/5">
                    مباراة نظيفة، لم تُشهر أي بطاقة
                  </p>
                ) : (
                  cards.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[#070b0a] border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-8 rounded flex items-center justify-center font-bold text-[10px] shadow-lg ${
                            c.cardType === 'حمراء' ? 'bg-red-600 text-white' : 'bg-amber-400 text-black'
                          }`}
                        >
                          {c.cardType === 'حمراء' ? '🟥' : '🟨'}
                        </span>
                        <div>
                          <strong className="text-white text-xs block">
                            {c.player} ({c.team})
                          </strong>
                          <span className="text-[10px] text-gray-400">
                            الدقيقة {c.minute}' • {c.reason}
                            {c.isSecondYellow && (
                              <span className="text-red-400 font-bold mr-2">(طرد إثر إنذار ثانٍ)</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(c.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Send-Offs & Suspensions */}
              {sendOffs.length > 0 && (
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> سجل حالات الطرد والإيقاف التلقائي
                  </h4>
                  {sendOffs.map((so) => (
                    <div key={so.id} className="p-2.5 rounded-xl bg-black/50 text-xs text-white flex items-center justify-between">
                      <div>
                        <strong>{so.player} ({so.team})</strong> - {so.sendOffType} في الدقيقة {so.minute}'
                        <p className="text-[10px] text-red-400">السبب: {so.reason}</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold">
                        إيقاف {so.suspensionMatches} مباريات
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUBSTITUTIONS */}
          {activeTab === 'subs' && (
            <div className="space-y-5">
              {/* Add Sub Form */}
              {canEdit && (
                <div className="p-4 rounded-2xl bg-[#070b0a] border border-amber-400/30 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> إجراء تبديل
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">الفريق *</label>
                      <select
                        value={newSubTeam}
                        onChange={(e) => setNewSubTeam(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value={fixture.teamA}>{fixture.teamA}</option>
                        <option value={fixture.teamB}>{fixture.teamB}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">اللاعب المغادر (خروج) *</label>
                      <input
                        type="text"
                        placeholder="اللاعب الخارج"
                        value={newSubPlayerOut}
                        onChange={(e) => setNewSubPlayerOut(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">اللاعب البديل (دخول) *</label>
                      <input
                        type="text"
                        placeholder="اللاعب البديل"
                        value={newSubPlayerIn}
                        onChange={(e) => setNewSubPlayerIn(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">دقيقة التبديل *</label>
                      <input
                        type="text"
                        placeholder="مثال: 65"
                        value={newSubMinute}
                        onChange={(e) => setNewSubMinute(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">سبب التبديل *</label>
                      <select
                        value={newSubReason}
                        onChange={(e) => setNewSubReason(e.target.value as SubstitutionReason)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {SUB_REASONS.map((sr) => (
                          <option key={sr} value={sr}>
                            {sr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSub}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-4 h-4" /> حفظ التبديل
                  </button>
                </div>
              )}

              {/* Subs List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">التبديلات المسجلة ({substitutions.length})</h4>
                {substitutions.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center bg-[#070b0a] rounded-xl border border-white/5">
                    لم تجر أية تبديلات في اللقاء
                  </p>
                ) : (
                  substitutions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-[#070b0a] border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-mono font-bold flex items-center justify-center">
                          {s.minute}'
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 font-bold">🔴 خروج: {s.playerOut}</span>
                            <span className="text-gray-500">|</span>
                            <span className="text-emerald-400 font-bold">🟢 دخول: {s.playerIn}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {s.team} • {s.reason}
                          </span>
                        </div>
                      </div>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSub(s.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#070b0a] border border-white/10 text-xs flex items-center justify-between text-gray-300 font-bold">
                <span className="text-amber-400">{fixture.teamA}</span>
                <span>المؤشر الإحصائي</span>
                <span className="text-[#00FFD2]">{fixture.teamB}</span>
              </div>

              {/* Stat rows */}
              <div className="space-y-3">
                {/* 1. Possession */}
                <div className="p-3 rounded-xl bg-[#070b0a] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-400">{statsA.possessionPercentage}%</span>
                    <span className="text-gray-300">الاستحواذ على الكرة</span>
                    <span className="text-[#00FFD2]">{100 - statsA.possessionPercentage}%</span>
                  </div>
                  {canEdit && (
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={statsA.possessionPercentage}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setStatsA({ ...statsA, possessionPercentage: val });
                        setStatsB({ ...statsB, possessionPercentage: 100 - val });
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  )}
                </div>

                {/* 2. Shots on Target */}
                <div className="p-3 rounded-xl bg-[#070b0a] border border-white/5 flex items-center justify-between text-xs">
                  <input
                    type="number"
                    min="0"
                    disabled={!canEdit}
                    value={statsA.shotsOnTarget}
                    onChange={(e) => setStatsA({ ...statsA, shotsOnTarget: parseInt(e.target.value) || 0 })}
                    className="w-14 bg-black/60 border border-amber-400/40 rounded-lg p-1.5 text-center text-amber-300 font-bold"
                  />
                  <span className="text-gray-300 font-bold">التسديدات على المرمى</span>
                  <input
                    type="number"
                    min="0"
                    disabled={!canEdit}
                    value={statsB.shotsOnTarget}
                    onChange={(e) => setStatsB({ ...statsB, shotsOnTarget: parseInt(e.target.value) || 0 })}
                    className="w-14 bg-black/60 border border-[#00FFD2]/40 rounded-lg p-1.5 text-center text-[#00FFD2] font-bold"
                  />
                </div>

                {/* 3. Corners */}
                <div className="p-3 rounded-xl bg-[#070b0a] border border-white/5 flex items-center justify-between text-xs">
                  <input
                    type="number"
                    min="0"
                    disabled={!canEdit}
                    value={statsA.corners}
                    onChange={(e) => setStatsA({ ...statsA, corners: parseInt(e.target.value) || 0 })}
                    className="w-14 bg-black/60 border border-amber-400/40 rounded-lg p-1.5 text-center text-amber-300 font-bold"
                  />
                  <span className="text-gray-300 font-bold">الركنيات</span>
                  <input
                    type="number"
                    min="0"
                    disabled={!canEdit}
                    value={statsB.corners}
                    onChange={(e) => setStatsB({ ...statsB, corners: parseInt(e.target.value) || 0 })}
                    className="w-14 bg-black/60 border border-[#00FFD2]/40 rounded-lg p-1.5 text-center text-[#00FFD2] font-bold"
                  />
                </div>

                {/* 4. Fouls */}
                <div className="p-3 rounded-xl bg-[#070b0a] border border-white/5 flex items-center justify-between text-xs">
                  <input
                    type="number"
                    min="0"
                    disabled={!canEdit}
                    value={statsA.fouls}
                    onChange={(e) => setStatsA({ ...statsA, fouls: parseInt(e.target.value) || 0 })}
                    className="w-14 bg-black/60 border border-amber-400/40 rounded-lg p-1.5 text-center text-amber-300 font-bold"
                  />
                  <span className="text-gray-300 font-bold">الأخطاء المرتكبة</span>
                  <input
                    type="number"
                    min="0"
                    disabled={!canEdit}
                    value={statsB.fouls}
                    onChange={(e) => setStatsB({ ...statsB, fouls: parseInt(e.target.value) || 0 })}
                    className="w-14 bg-black/60 border border-[#00FFD2]/40 rounded-lg p-1.5 text-center text-[#00FFD2] font-bold"
                  />
                </div>

                {/* 5. Goalkeeper Saves */}
                <div className="p-3 rounded-xl bg-[#070b0a] border border-white/5 flex items-center justify-between text-xs">
                  <input
                    type="number"
                    min="0"
                    disabled={!canEdit}
                    value={statsA.goalkeeperSaves}
                    onChange={(e) => setStatsA({ ...statsA, goalkeeperSaves: parseInt(e.target.value) || 0 })}
                    className="w-14 bg-black/60 border border-amber-400/40 rounded-lg p-1.5 text-center text-amber-300 font-bold"
                  />
                  <span className="text-gray-300 font-bold">تصديات حراس المرمى</span>
                  <input
                    type="number"
                    min="0"
                    disabled={!canEdit}
                    value={statsB.goalkeeperSaves}
                    onChange={(e) => setStatsB({ ...statsB, goalkeeperSaves: parseInt(e.target.value) || 0 })}
                    className="w-14 bg-black/60 border border-[#00FFD2]/40 rounded-lg p-1.5 text-center text-[#00FFD2] font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SUMMARY & MVP */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* Man of the match */}
              <div className="p-4 rounded-2xl bg-[#070b0a] border border-amber-400/30 space-y-2">
                <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> أفضل لاعب في المباراة (Man of the Match)
                </label>
                <input
                  type="text"
                  placeholder="مثال: وسام الرفاعي (فرسان بردى)"
                  disabled={!canEdit}
                  value={manOfTheMatch}
                  onChange={(e) => setManOfTheMatch(e.target.value)}
                  className="w-full bg-[#0d1211] border border-amber-400/40 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Match Rating */}
              <div className="p-4 rounded-2xl bg-[#070b0a] border border-white/10 space-y-2">
                <label className="block text-xs font-bold text-white">تقييم المستوى الفني للمباراة (1 - 5 نجوم)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => setMatchRating(star)}
                      className={`p-2 rounded-xl border transition-all ${
                        matchRating >= star
                          ? 'border-amber-400 bg-amber-400/20 text-amber-400'
                          : 'border-white/10 bg-[#0d1211] text-gray-600'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white">تقرير وملخص أحداث المباراة</label>
                <textarea
                  rows={4}
                  disabled={!canEdit}
                  placeholder="أدخل ملخصاً فنياً، ملاحظات التحكيم، أو أية وقائع هامة في المباراة..."
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none"
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#090d0c] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-400">
            {fixture.isLocked ? (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> المباراة مغلقة ومثبتة رسمياً في جدول الترتيب
              </span>
            ) : (
              <span>يمكنك حفظ المسودة أو إغلاق المباراة لتثبيت الترتيب تلقائياً</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> حفظ التغييرات
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من إغلاق المباراة نهائياً؟ سيتم تحديث جدول الترتيب والبطاقات وقائمة المتأهلين تلقائياً.')) {
                      handleSave(true);
                    }
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4" /> إغلاق المباراة نهائياً
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
