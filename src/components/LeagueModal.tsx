import React, { useState, useMemo } from 'react';
import {
  X,
  Trophy,
  Calendar,
  Medal,
  Award,
  AlertCircle,
  FileText,
  Phone,
  ShieldCheck,
  Send,
  CheckCircle2,
  Users,
  Plus,
  Edit,
  Trash2,
  Lock,
  Download,
  Share2,
  Shield,
  Clock,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Zap,
  MapPin
} from 'lucide-react';
import {
  League,
  LeagueFixture,
  Objection,
  UserProfile,
  PlayerDisciplinaryRecord,
  QualifiedTeam,
  LeagueAwards
} from '../types';
import {
  formatSYP,
  exportLeaguePdf,
  exportMatchSheetPdf,
  exportDisciplinaryReportPdf,
  exportLeagueExcelComprehensive,
  exportToExcel,
  openWhatsAppShare,
  recalculateLeagueStandings,
  extractLeagueDisciplinaryRecords,
  extractLeagueTopScorers,
  generateRoundRobinSchedule,
  calculateQualifiedTeams
} from '../utils/helpers';
import RecordMatchResultModal from './RecordMatchResultModal';
import AddLeagueMatchModal from './AddLeagueMatchModal';

interface LeagueModalProps {
  league: League | null;
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onUpdateLeague: (updatedLeague: League) => void;
  onAddObjection: (leagueId: string, objection: Omit<Objection, 'id' | 'date'>) => void;
  onAdminDecideObjection?: (
    leagueId: string,
    objectionId: string,
    decision: 'مقبول ومعدل' | 'مرفوض' | 'إعادة مباراة',
    notes: string
  ) => void;
  onDeleteMatch?: (leagueId: string, fixtureId: string) => void;
}

type TabType = 'standings' | 'fixtures' | 'cards' | 'qualifiers' | 'objections' | 'awards' | 'rules';

export default function LeagueModal({
  league,
  isOpen,
  currentUser,
  onClose,
  onUpdateLeague,
  onAddObjection,
  onAdminDecideObjection,
  onDeleteMatch
}: LeagueModalProps) {
  if (!isOpen || !league) return null;

  const isAdmin = currentUser.role === 'أدمن' || (currentUser as any).isAdmin === true;
  const isOrganizer =
    league.ownerId === currentUser.id ||
    league.organizerPhone === currentUser.phone ||
    league.organizerName === currentUser.name;
  const canManageMatches = isAdmin || isOrganizer;

  const [activeTab, setActiveTab] = useState<TabType>('standings');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<string>('الكل');

  // Modals
  const [activeFixtureForEdit, setActiveFixtureForEdit] = useState<LeagueFixture | null>(null);
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);
  const [selectedPlayerForCardHistory, setSelectedPlayerForCardHistory] = useState<PlayerDisciplinaryRecord | null>(null);

  // Objections State
  const [objectionTeamName, setObjectionTeamName] = useState('');
  const [objectionReason, setObjectionReason] = useState('');
  const [objectionFixtureId, setObjectionFixtureId] = useState('');
  const [submittedObjection, setSubmittedObjection] = useState(false);

  // Admin Decisions Modal State
  const [selectedObjectionForDecision, setSelectedObjectionForDecision] = useState<Objection | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  // Awards Edit Modal State
  const [isAwardsEditOpen, setIsAwardsEditOpen] = useState(false);
  const [editedAwards, setEditedAwards] = useState<LeagueAwards>(league.awards || {});

  // Standings recalculation
  const standings = useMemo(() => {
    return recalculateLeagueStandings(
      league.standings.map((s) => s.teamName),
      league.fixtures,
      league.standings
    );
  }, [league.fixtures, league.standings]);

  // Disciplinary records
  const disciplinaryRecords = useMemo(() => {
    return extractLeagueDisciplinaryRecords(league.fixtures);
  }, [league.fixtures]);

  // Top scorers
  const topScorers = useMemo(() => {
    return extractLeagueTopScorers(league.fixtures);
  }, [league.fixtures]);

  // Qualified teams
  const qualifiedTeams = useMemo(() => {
    if (league.qualifiedTeams && league.qualifiedTeams.length > 0) {
      return league.qualifiedTeams;
    }
    return calculateQualifiedTeams(standings, 4);
  }, [league.qualifiedTeams, standings]);

  // Unique rounds
  const allRounds = useMemo(() => {
    const rounds = Array.from(new Set(league.fixtures.map((f) => f.round)));
    return ['الكل', ...rounds];
  }, [league.fixtures]);

  const filteredFixtures = useMemo(() => {
    if (selectedRoundFilter === 'الكل') return league.fixtures;
    return league.fixtures.filter((f) => f.round === selectedRoundFilter);
  }, [league.fixtures, selectedRoundFilter]);

  // Handle Save Fixture Result
  const handleSaveFixture = (updatedFixture: LeagueFixture, shouldLock?: boolean) => {
    const updatedFixtures = league.fixtures.map((f) => (f.id === updatedFixture.id ? updatedFixture : f));

    // Recalculate standings
    const newStandings = recalculateLeagueStandings(
      standings.map((s) => s.teamName),
      updatedFixtures,
      league.standings
    );

    // Recalculate qualified teams
    const newQualifiers = calculateQualifiedTeams(newStandings, 4);

    // Auto update top scorer award if not manually locked
    const calculatedTopScorers = extractLeagueTopScorers(updatedFixtures);
    const topScorerAward = calculatedTopScorers[0]
      ? {
          name: calculatedTopScorers[0].name,
          team: calculatedTopScorers[0].team,
          goals: calculatedTopScorers[0].goals
        }
      : league.awards?.topScorer;

    const updatedLeague: League = {
      ...league,
      fixtures: updatedFixtures,
      standings: newStandings,
      qualifiedTeams: newQualifiers,
      awards: {
        ...league.awards,
        topScorer: topScorerAward
      }
    };

    onUpdateLeague(updatedLeague);
    setActiveFixtureForEdit(null);
  };

  // Handle Add New Fixture
  const handleAddFixture = (newFixture: LeagueFixture) => {
    const updatedFixtures = [...league.fixtures, newFixture];
    const updatedLeague: League = {
      ...league,
      fixtures: updatedFixtures
    };
    onUpdateLeague(updatedLeague);
    setIsAddMatchOpen(false);
  };

  // Handle Generate Round-Robin Schedule
  const handleGenerateSchedule = () => {
    if (!isAdmin) return;
    const teamNames = league.standings.map((s) => s.teamName);
    if (teamNames.length < 2) {
      alert('يجب وجود فريقين على الأقل لإنشاء جدول المباريات التلقائي');
      return;
    }

    if (
      window.confirm(
        `هل أنت متأكد من إنشاء جدول دوري تلقائي لجميع الفرق (${teamNames.length} فرق)؟ سيتم إضافة مباريات لجميع الجولات.`
      )
    ) {
      const generated = generateRoundRobinSchedule(teamNames, league.hostingVenue);
      const updatedLeague: League = {
        ...league,
        fixtures: [...league.fixtures, ...generated]
      };
      onUpdateLeague(updatedLeague);
    }
  };

  // Handle Delete Fixture
  const handleDeleteFixture = (fixtureId: string) => {
    if (!isAdmin) {
      alert('صلاحية حذف المباريات محصورة بالأدمن فقط');
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف هذه المباراة بشكل نهائي؟')) {
      if (onDeleteMatch) {
        onDeleteMatch(league.id, fixtureId);
      } else {
        const updatedFixtures = league.fixtures.filter((f) => f.id !== fixtureId);
        const newStandings = recalculateLeagueStandings(
          standings.map((s) => s.teamName),
          updatedFixtures
        );
        onUpdateLeague({
          ...league,
          fixtures: updatedFixtures,
          standings: newStandings
        });
      }
    }
  };

  // Handle Objection Submit
  const handleObjectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectionTeamName.trim() || !objectionReason.trim()) return;

    onAddObjection(league.id, {
      teamName: objectionTeamName.trim(),
      fixtureId: objectionFixtureId || 'عام',
      reason: objectionReason.trim(),
      status: 'معلق'
    });

    setObjectionTeamName('');
    setObjectionReason('');
    setObjectionFixtureId('');
    setSubmittedObjection(true);
    setTimeout(() => setSubmittedObjection(false), 4000);
  };

  // Handle Admin Decide Objection
  const handleAdminDecision = (decision: 'مقبول ومعدل' | 'مرفوض' | 'إعادة مباراة') => {
    if (!selectedObjectionForDecision || !isAdmin) return;

    if (onAdminDecideObjection) {
      onAdminDecideObjection(league.id, selectedObjectionForDecision.id, decision, decisionNotes);
    } else {
      const updatedObjections = league.objections.map((obj) =>
        obj.id === selectedObjectionForDecision.id
          ? {
              ...obj,
              status: decision,
              adminDecision: decisionNotes || `تم ${decision} من قبل إدارة البطولة.`
            }
          : obj
      );
      onUpdateLeague({
        ...league,
        objections: updatedObjections
      });
    }

    setSelectedObjectionForDecision(null);
    setDecisionNotes('');
  };

  // Save Awards
  const handleSaveAwards = () => {
    onUpdateLeague({
      ...league,
      awards: {
        ...editedAwards,
        isFinalized: true
      }
    });
    setIsAwardsEditOpen(false);
  };

  // Export Standings & League Multi-Sheet Excel
  const handleExportStandingsExcel = () => {
    exportLeagueExcelComprehensive(league);
  };

  return (
    <div
      id="modal-league-details"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1211] border-2 border-amber-400/40 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl my-auto text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Header */}
        <div className="relative h-36 sm:h-44 w-full bg-[#050707] shrink-0 overflow-hidden">
          <img src={league.image} alt={league.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1211] via-black/60 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-amber-400 hover:text-black text-white flex items-center justify-center transition-colors border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Organizer / Admin badge */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {isAdmin && (
              <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> لوحة تحكم الأدمن الكاملة
              </span>
            )}
            {isOrganizer && !isAdmin && (
              <span className="bg-amber-400 text-black text-[11px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> منظم الدوري (منشئ البطولة)
              </span>
            )}
          </div>

          {/* League Titles */}
          <div className="absolute bottom-4 right-4 left-4 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400 text-black text-xs font-black px-2.5 py-0.5 rounded-full">
                  {league.status === 'نشط' ? 'دوري جارٍ' : league.status}
                </span>
                <span className="bg-black/70 text-white text-xs px-2.5 py-0.5 rounded-full border border-white/10">
                  {league.governorate} • {league.hostingVenue}
                </span>
                <span className="bg-[#00FFD2]/20 text-[#00FFD2] text-xs px-2.5 py-0.5 rounded-full border border-[#00FFD2]/40 font-bold">
                  {league.system} • {league.capacity}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow-md">{league.name}</h2>
              <p className="text-xs text-amber-200">
                المنظم: {league.organizerName} ({league.organizerPhone}) • الجوائز: {formatSYP(league.prizes.cashPrize)}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => exportLeaguePdf(league)}
                className="px-3 py-1.5 rounded-xl bg-[#00FFD2]/15 hover:bg-[#00FFD2]/25 text-[#00FFD2] border border-[#00FFD2]/40 text-xs font-bold transition-all flex items-center gap-1.5"
                title="تصدير تقرير رسمي PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>تقرير PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportStandingsExcel}
                className="px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-400 border border-amber-400/40 text-xs font-bold transition-all flex items-center gap-1.5"
                title="تصدير ملف Excel شامل لجميع الجداول والبيانات"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Excel</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openWhatsAppShare(
                    `🏆 تابعوا نتائج وترتيب بطولة "${league.name}" عبر منصة الكابتن الرياضية الأولى في سوريا! ⚽`
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة</span>
              </button>
            </div>
          </div>
        </div>

        {/* 7 Tabs Bar */}
        <div className="flex items-center gap-1 px-4 pt-3 bg-[#090d0c] border-b border-white/10 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('standings')}
            className={`pb-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'standings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>جدول الترتيب</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fixtures')}
            className={`pb-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fixtures'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>جدول المباريات ({league.fixtures.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`pb-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cards'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>البطاقات والإنذارات ({disciplinaryRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qualifiers')}
            className={`pb-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'qualifiers'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>المتأهلون والتصفيات ({qualifiedTeams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('objections')}
            className={`pb-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'objections'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>الاعتراضات ({league.objections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('awards')}
            className={`pb-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'awards'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Medal className="w-4 h-4" />
            <span>الجوائز والتتويج</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`pb-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الشروط واللوائح</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: STANDINGS */}
          {activeTab === 'standings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#070b0a] p-3 rounded-2xl border border-white/5">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>جدول الترتيب الرسمي (محدث تلقائياً)</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    يتم احتساب الترتيب تلقائياً وفق معايير: النقاط، فارق الأهداف، الأهداف المسجلة، والمواجهات المباشرة.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportStandingsExcel}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير Excel</span>
                  </button>
                </div>
              </div>

              {/* Standings Table */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#070b0a]">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="bg-[#121c18] border-b border-white/10 text-gray-300 font-bold">
                      <th className="py-3 px-3 text-center">المركز</th>
                      <th className="py-3 px-3">اسم الفريق</th>
                      <th className="py-3 px-2 text-center">لعب</th>
                      <th className="py-3 px-2 text-center">فاز</th>
                      <th className="py-3 px-2 text-center">تعادل</th>
                      <th className="py-3 px-2 text-center">خسر</th>
                      <th className="py-3 px-2 text-center hidden sm:table-cell">له</th>
                      <th className="py-3 px-2 text-center hidden sm:table-cell">عليه</th>
                      <th className="py-3 px-2 text-center font-mono">الفارق</th>
                      <th className="py-3 px-3 text-center text-amber-400 font-mono font-black">النقاط</th>
                      <th className="py-3 px-3 text-center hidden md:table-cell">آخر 5</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {standings.map((team, idx) => (
                      <tr
                        key={team.teamName}
                        className={`hover:bg-white/5 transition-colors ${
                          idx < 2 ? 'bg-amber-400/5' : idx < 4 ? 'bg-[#00FFD2]/5' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-mono font-bold text-xs ${
                              idx === 0
                                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                                : idx === 1
                                ? 'bg-gray-300 text-black'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : idx < 4
                                ? 'bg-[#00FFD2]/20 text-[#00FFD2]'
                                : 'text-gray-400'
                            }`}
                          >
                            {team.position}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          <span>{team.teamName}</span>
                          {idx === 0 && <CrownBadge />}
                        </td>
                        <td className="py-3 px-2 text-center text-gray-300">{team.played}</td>
                        <td className="py-3 px-2 text-center text-emerald-400 font-bold">{team.won}</td>
                        <td className="py-3 px-2 text-center text-gray-400">{team.drawn}</td>
                        <td className="py-3 px-2 text-center text-red-400">{team.lost}</td>
                        <td className="py-3 px-2 text-center text-gray-300 hidden sm:table-cell">{team.goalsFor}</td>
                        <td className="py-3 px-2 text-center text-gray-400 hidden sm:table-cell">{team.goalsAgainst}</td>
                        <td
                          className={`py-3 px-2 text-center font-mono font-bold ${
                            team.goalDifference > 0
                              ? 'text-emerald-400'
                              : team.goalDifference < 0
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-amber-300 text-sm">
                          {team.points}
                        </td>
                        <td className="py-3 px-3 text-center hidden md:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            {(team.form && team.form.length > 0 ? team.form : ['W', 'D', 'W']).map((f, i) => (
                              <span
                                key={i}
                                className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                                  f === 'W' ? 'bg-emerald-500 text-white' : f === 'D' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white'
                                }`}
                              >
                                {f === 'W' ? 'ف' : f === 'D' ? 'ت' : 'خ'}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tie-breaking Legend */}
              <div className="p-3 rounded-xl bg-[#070b0a] border border-white/5 text-[11px] text-gray-400 space-y-1">
                <strong className="text-amber-400 block font-bold">معايير حسم الترتيب عند تعادل النقاط:</strong>
                <p>1. المواجهات المباشرة بين الفرق المتعادلة • 2. فارق الأهداف الكلي • 3. عدد الأهداف المسجلة • 4. نقاط اللعب النظيف (البطاقات).</p>
              </div>
            </div>
          )}

          {/* TAB 2: FIXTURES */}
          {activeTab === 'fixtures' && (
            <div className="space-y-4">
              {/* Fixture Controls Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#070b0a] p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-300">فلترة الجولة:</span>
                  <select
                    value={selectedRoundFilter}
                    onChange={(e) => setSelectedRoundFilter(e.target.value)}
                    className="bg-[#0d1211] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {allRounds.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {canManageMatches && (
                    <button
                      type="button"
                      onClick={() => setIsAddMatchOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-amber-400/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة مباراة جديدة</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handleGenerateSchedule}
                      className="px-3 py-1.5 rounded-xl bg-[#00FFD2]/15 hover:bg-[#00FFD2]/25 text-[#00FFD2] border border-[#00FFD2]/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">إنشاء جدول تلقائي</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Fixtures List */}
              <div className="grid grid-cols-1 gap-3">
                {filteredFixtures.length === 0 ? (
                  <p className="text-xs text-gray-500 py-8 text-center bg-[#070b0a] rounded-2xl border border-white/5">
                    لا توجد مباريات مسجلة في هذا الدور حالياً
                  </p>
                ) : (
                  filteredFixtures.map((fix) => (
                    <div
                      key={fix.id}
                      className="p-4 rounded-2xl bg-[#070b0a] border border-white/10 hover:border-amber-400/40 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold text-[10px]">
                            {fix.round}
                          </span>
                          <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3" /> {fix.date} • {fix.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              fix.status === 'مباشر'
                                ? 'bg-red-500 text-white animate-pulse'
                                : fix.isFinished || fix.status === 'انتهت'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : fix.status === 'مؤجلة'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            {fix.status || (fix.isFinished ? 'انتهت' : 'قادمة')}
                          </span>

                          {fix.isLocked && (
                            <span className="p-1 rounded-full bg-red-500/20 text-red-400" title="مباراة مقفلة ومثبتة">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Teams & Score Box */}
                      <div className="flex items-center justify-between gap-4 py-1">
                        <div className="flex-1 text-right">
                          <strong className="text-white text-sm font-bold block">{fix.teamA}</strong>
                          <span className="text-[10px] text-gray-500">المضيف</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10">
                          <span className="text-lg font-black text-amber-300 font-mono">
                            {fix.scoreA !== undefined ? fix.scoreA : '-'}
                          </span>
                          <span className="text-gray-600">:</span>
                          <span className="text-lg font-black text-amber-300 font-mono">
                            {fix.scoreB !== undefined ? fix.scoreB : '-'}
                          </span>
                        </div>

                        <div className="flex-1 text-left">
                          <strong className="text-white text-sm font-bold block">{fix.teamB}</strong>
                          <span className="text-[10px] text-gray-500">الضيف</span>
                        </div>
                      </div>

                      {/* Footer match details & actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#00FFD2]" /> {fix.venue}
                          </span>
                          {fix.mainReferee && <span>• الحكم: {fix.mainReferee}</span>}
                          {fix.manOfTheMatch && (
                            <span className="text-amber-300 font-bold hidden md:inline">
                              • رجل المباراة: {fix.manOfTheMatch}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => exportMatchSheetPdf(league.name, fix)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                            title="طباعة تقرير المباراة PDF"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {canManageMatches && (
                            <button
                              type="button"
                              onClick={() => setActiveFixtureForEdit(fix)}
                              className="px-3 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-black font-bold text-[11px] transition-all flex items-center gap-1 border border-amber-400/30"
                            >
                              <Edit className="w-3 h-3" />
                              <span>تحديث وتسجيل النتيجة</span>
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteFixture(fix.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="حذف المباراة (أدمن فقط)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CARDS & DISCIPLINARY */}
          {activeTab === 'cards' && (
            <div className="space-y-5">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 block">إجمالي البطاقات الصفراء</span>
                    <strong className="text-xl font-bold text-amber-300 font-mono">
                      {disciplinaryRecords.reduce((acc, r) => acc + r.yellowCardsCount, 0)}
                    </strong>
                  </div>
                  <div className="w-8 h-10 rounded bg-amber-400 text-black font-bold flex items-center justify-center">
                    🟨
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 block">إجمالي البطاقات الحمراء (طرد)</span>
                    <strong className="text-xl font-bold text-red-400 font-mono">
                      {disciplinaryRecords.reduce((acc, r) => acc + r.redCardsCount, 0)}
                    </strong>
                  </div>
                  <div className="w-8 h-10 rounded bg-red-600 text-white font-bold flex items-center justify-center">
                    🟥
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 block">اللاعبون الموقوفون حالياً</span>
                    <strong className="text-xl font-bold text-purple-300 font-mono">
                      {disciplinaryRecords.filter((r) => r.isSuspended).length}
                    </strong>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Disciplinary Table Header */}
              <div className="flex items-center justify-between bg-[#070b0a] p-3 rounded-2xl border border-white/5">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-400" />
                    <span>سجل عقوبات وبطاقات اللاعبين (نظام تلقائي)</span>
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    القاعدة: 3 بطاقات صفراء = إيقاف مباراة واحدة تلقائياً • بطاقة حمراء مباشرة = إيقاف مباراتين.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => exportDisciplinaryReportPdf(league.name, disciplinaryRecords)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>طباعة تقرير الانضباط PDF</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#070b0a]">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="bg-[#121c18] border-b border-white/10 text-gray-300 font-bold">
                      <th className="py-3 px-3">اسم اللاعب</th>
                      <th className="py-3 px-3">الفريق</th>
                      <th className="py-3 px-3 text-center">🟨 إنذارات</th>
                      <th className="py-3 px-3 text-center">🟥 طرد</th>
                      <th className="py-3 px-3 text-center">حالة الأهلية والمشاركة</th>
                      <th className="py-3 px-3 text-center">تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {disciplinaryRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          سجل نظيف! لم يتم تسجيل أية بطاقات في البطولة حتى الآن.
                        </td>
                      </tr>
                    ) : (
                      disciplinaryRecords.map((rec) => (
                        <tr key={`${rec.playerName}_${rec.teamName}`} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 font-bold text-white">{rec.playerName}</td>
                          <td className="py-3 px-3 text-gray-300">{rec.teamName}</td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-amber-300">
                            {rec.yellowCardsCount}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-red-400">
                            {rec.redCardsCount}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {rec.isSuspended ? (
                              <span className="px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> موقوف ({rec.suspensionMatchesRemaining} مباراة)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> متاح للمشاركة
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedPlayerForCardHistory(rec)}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-[11px]"
                            >
                              عرض السجل
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Player Card History Modal */}
              {selectedPlayerForCardHistory && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn"
                  onClick={() => setSelectedPlayerForCardHistory(null)}
                >
                  <div
                    className="bg-[#0d1211] border border-amber-400/40 rounded-3xl p-5 w-full max-w-md space-y-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-base">{selectedPlayerForCardHistory.playerName}</h4>
                        <p className="text-xs text-gray-400">{selectedPlayerForCardHistory.teamName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPlayerForCardHistory(null)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedPlayerForCardHistory.cardsHistory.map((h, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#070b0a] border border-white/5 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className={h.cardType === 'حمراء' ? 'text-red-400' : 'text-amber-400'}>
                              {h.cardType === 'حمراء' ? '🟥 بطاقة حمراء' : '🟨 بطاقة صفراء'} (د {h.minute}')
                            </span>
                            <span className="text-gray-400">{h.round}</span>
                          </div>
                          <p className="text-[11px] text-gray-300">ضد: {h.opponent}</p>
                          <p className="text-[10px] text-gray-400">السبب: {h.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QUALIFIERS & KNOCKOUT BRACKETS */}
          {activeTab === 'qualifiers' && (
            <div className="space-y-6">
              <div className="bg-[#070b0a] p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>الفرق المتأهلة إلى الأدوار الإقصائية (حسب الترتيب)</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    يتأهل أصحاب المراكز الأربعة الأولى إلى الدور نصف النهائي للمنافسة على كأس البطولة.
                  </p>
                </div>
              </div>

              {/* Qualifiers Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {qualifiedTeams.map((team, idx) => (
                  <div
                    key={team.teamName}
                    className="p-4 rounded-2xl bg-gradient-to-br from-[#121c18] to-[#070b0a] border-2 border-amber-400/30 hover:border-amber-400 transition-all space-y-2 relative overflow-hidden group shadow-lg"
                  >
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 font-mono font-black text-xs flex items-center justify-center">
                      #{team.position}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center">
                        {team.teamName.slice(0, 2)}
                      </div>
                      <div>
                        <strong className="text-white font-bold text-sm block">{team.teamName}</strong>
                        <span className="text-[10px] text-amber-400 font-bold">{team.qualifiedRound}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-300 font-mono">
                      <span>النقاط: {team.points}</span>
                      <span>الفارق: {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Knockout Bracket Tree View */}
              <div className="p-5 rounded-3xl bg-[#070b0a] border border-amber-400/20 space-y-4">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> شجرة الأدوار الإقصائية (Knockout Bracket)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Semi Final 1 */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-gray-400 block text-center">نصف النهائي (1)</span>
                    <div className="p-3 rounded-2xl bg-[#0d1211] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{qualifiedTeams[0]?.teamName || 'المتصدر (الأول)'}</span>
                        <span className="text-amber-400 font-mono">-</span>
                      </div>
                      <div className="border-t border-white/5 pt-1 flex items-center justify-between text-xs font-bold text-white">
                        <span>{qualifiedTeams[3]?.teamName || 'المركز الرابع'}</span>
                        <span className="text-amber-400 font-mono">-</span>
                      </div>
                    </div>
                  </div>

                  {/* Final & Trophy */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-amber-400 block text-center">🏆 المباراة النهائية الكبرى</span>
                    <div className="p-4 rounded-2xl bg-amber-400/10 border-2 border-amber-400 space-y-2 text-center shadow-xl shadow-amber-400/10">
                      <div className="text-xs font-bold text-white">الفائز من نصف النهائي (1)</div>
                      <div className="text-amber-400 font-black text-sm">VS</div>
                      <div className="text-xs font-bold text-white">الفائز من نصف النهائي (2)</div>
                    </div>
                  </div>

                  {/* Semi Final 2 */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-gray-400 block text-center">نصف النهائي (2)</span>
                    <div className="p-3 rounded-2xl bg-[#0d1211] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{qualifiedTeams[1]?.teamName || 'الوصيف (الثاني)'}</span>
                        <span className="text-amber-400 font-mono">-</span>
                      </div>
                      <div className="border-t border-white/5 pt-1 flex items-center justify-between text-xs font-bold text-white">
                        <span>{qualifiedTeams[2]?.teamName || 'المركز الثالث'}</span>
                        <span className="text-amber-400 font-mono">-</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OBJECTIONS */}
          {activeTab === 'objections' && (
            <div className="space-y-6">
              {/* Submit Objection Form */}
              <div className="bg-[#070b0a] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>تقديم اعتراض رسمي على نتيجة أو واقعة مباراة</span>
                </h3>
                <p className="text-xs text-gray-400">
                  يتاح لجميع الفرق تقديم اعتراض خلال 24 ساعة من انتهاء اللقاء، وتتم مراجعته وإصدار القرار الرسمي من قبل إدارة البطولة.
                </p>

                {submittedObjection && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم تسجيل اعتراضك وإرساله إلى لجنة الحكام والمسابقات لمراجعته.</span>
                  </div>
                )}

                <form onSubmit={handleObjectionSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">اسم الفريق المعترض *</label>
                      <input
                        type="text"
                        required
                        placeholder="اسم فريقك"
                        value={objectionTeamName}
                        onChange={(e) => setObjectionTeamName(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1">المباراة المعترض عليها (اختياري)</label>
                      <select
                        value={objectionFixtureId}
                        onChange={(e) => setObjectionFixtureId(e.target.value)}
                        className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="">اعتراض تنظيمي عام</option>
                        {league.fixtures.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.round}: {f.teamA} ضد {f.teamB} ({f.date})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-300 mb-1">تفاصيل وسبب الاعتراض والأدلة *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="اشرح الواقعة بالتفصيل مع ذكر دقيقة الحادثة أو المخالفة القانونية..."
                      value={objectionReason}
                      onChange={(e) => setObjectionReason(e.target.value)}
                      className="w-full bg-[#0d1211] border border-white/10 rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال الاعتراض الرسمي</span>
                  </button>
                </form>
              </div>

              {/* Objections Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white">سجل الاعتراضات والقرارات الصادرة ({league.objections.length})</h4>
                {league.objections.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center bg-[#070b0a] rounded-xl border border-white/5">
                    لا توجد اعتراضات مسجلة في هذا الدوري
                  </p>
                ) : (
                  league.objections.map((obj) => (
                    <div
                      key={obj.id}
                      className="p-4 rounded-2xl bg-[#070b0a] border border-white/10 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-bold text-sm">{obj.teamName}</strong>
                          <span className="text-[10px] text-gray-400">• {obj.date}</span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            obj.status === 'مقبول ومعدل'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : obj.status === 'مرفوض'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                          }`}
                        >
                          {obj.status}
                        </span>
                      </div>

                      <p className="text-gray-300 bg-[#0d1211] p-2.5 rounded-xl border border-white/5">
                        {obj.reason}
                      </p>

                      {obj.adminDecision && (
                        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-200">
                          <strong className="block text-purple-400 font-bold mb-0.5">قرار إدارة البطولة:</strong>
                          <span>{obj.adminDecision}</span>
                        </div>
                      )}

                      {isAdmin && obj.status === 'معلق' && (
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedObjectionForDecision(obj)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition-colors"
                          >
                            اتخاذ قرار وحسم الاعتراض (أدمن)
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Admin Decision Modal */}
              {selectedObjectionForDecision && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn"
                  onClick={() => setSelectedObjectionForDecision(null)}
                >
                  <div
                    className="bg-[#0d1211] border border-amber-400/40 rounded-3xl p-5 w-full max-w-lg space-y-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">حسم اعتراض فريق {selectedObjectionForDecision.teamName}</h4>
                        <p className="text-xs text-gray-400">{selectedObjectionForDecision.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedObjectionForDecision(null)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <label className="block font-bold text-white">نص القرار وملاحظات اللجنة *</label>
                      <textarea
                        rows={3}
                        placeholder="أدخل الحيثيات والتعديل الذي سيتم اعتماده في النتيجة أو الجدول..."
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleAdminDecision('مقبول ومعدل')}
                        className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        قبول وتعديل
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdminDecision('إعادة مباراة')}
                        className="py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                      >
                        إعادة المباراة
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdminDecision('مرفوض')}
                        className="py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                      >
                        رفض الاعتراض
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AWARDS & HONORS */}
          {activeTab === 'awards' && (
            <div className="space-y-6">
              <div className="bg-[#070b0a] p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Medal className="w-4 h-4 text-amber-400" />
                    <span>لوحة الشرف وتتويج أبطال الموسم</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    الجوائز الرسمية والهدايا النقدية والميداليات المقدمة من إدارة البطولة.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditedAwards(league.awards || {});
                      setIsAwardsEditOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل وتثبيت الجوائز</span>
                  </button>
                )}
              </div>

              {/* Awards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Champion Cup */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1c1809] to-[#070b0a] border-2 border-amber-400/40 text-center space-y-2 shadow-xl shadow-amber-400/5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 mx-auto flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-amber-400 block">🏆 بطل البطولة وكأس المركز الأول</span>
                  <strong className="text-base font-black text-white block">
                    {standings[0]?.teamName || 'بطل الموسم'}
                  </strong>
                  <p className="text-[11px] text-gray-400">كأس البطولة الذهبي + {formatSYP(league.prizes.cashPrize)}</p>
                </div>

                {/* 2. Top Scorer */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#09151c] to-[#070b0a] border-2 border-[#00FFD2]/40 text-center space-y-2 shadow-xl shadow-[#00FFD2]/5">
                  <div className="w-12 h-12 rounded-2xl bg-[#00FFD2]/20 text-[#00FFD2] mx-auto flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#00FFD2] block">⚽ الحذاء الذهبي (هداف البطولة)</span>
                  <strong className="text-base font-black text-white block">
                    {league.awards?.topScorer?.name || topScorers[0]?.name || 'عمر خربين'}
                  </strong>
                  <p className="text-[11px] text-gray-400">
                    {league.awards?.topScorer?.goals || topScorers[0]?.goals || 8} أهداف مسجلة
                  </p>
                </div>

                {/* 3. Best Player */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#18091c] to-[#070b0a] border-2 border-purple-500/40 text-center space-y-2 shadow-xl shadow-purple-500/5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-purple-300 block">🌟 أفضل لاعب في الدوري (MVP)</span>
                  <strong className="text-base font-black text-white block">
                    {league.awards?.bestPlayer?.name || 'وسام الرفاعي'}
                  </strong>
                  <p className="text-[11px] text-gray-400">
                    {league.awards?.bestPlayer?.team || standings[1]?.teamName || 'فرسان بردى'}
                  </p>
                </div>

                {/* 4. Best Goalkeeper */}
                <div className="p-5 rounded-3xl bg-[#070b0a] border border-white/10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white mx-auto flex items-center justify-center">
                    🧤
                  </div>
                  <span className="text-xs font-bold text-gray-300 block">القفاز الذهبي (أفضل حارس)</span>
                  <strong className="text-sm font-bold text-white block">
                    {league.awards?.bestGoalkeeper?.name || 'إبراهيم عالمة الصغير'}
                  </strong>
                  <p className="text-[10px] text-gray-400">{league.awards?.bestGoalkeeper?.team || standings[0]?.teamName}</p>
                </div>

                {/* 5. Best Coach */}
                <div className="p-5 rounded-3xl bg-[#070b0a] border border-white/10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white mx-auto flex items-center justify-center">
                    👨‍🏫
                  </div>
                  <span className="text-xs font-bold text-gray-300 block">أفضل مدير فني (مدرب)</span>
                  <strong className="text-sm font-bold text-white block">
                    {league.awards?.bestCoach?.name || 'الكابتن هيثم كرم'}
                  </strong>
                  <p className="text-[10px] text-gray-400">{league.awards?.bestCoach?.team || standings[2]?.teamName}</p>
                </div>

                {/* 6. Fair Play Team */}
                <div className="p-5 rounded-3xl bg-[#070b0a] border border-white/10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    🟩
                  </div>
                  <span className="text-xs font-bold text-emerald-400 block">درع اللعب النظيف (Fair Play)</span>
                  <strong className="text-sm font-bold text-white block">
                    {league.awards?.fairPlayTeam || standings[standings.length - 1]?.teamName || 'فريق الروح الرياضية'}
                  </strong>
                  <p className="text-[10px] text-gray-400">أقل فريق حصولاً على البطاقات والإنذارات</p>
                </div>
              </div>

              {/* Awards Edit Modal */}
              {isAwardsEditOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn"
                  onClick={() => setIsAwardsEditOpen(false)}
                >
                  <div
                    className="bg-[#0d1211] border border-amber-400/40 rounded-3xl p-5 w-full max-w-md space-y-4 text-right text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="font-bold text-white text-sm">تعديل وتحديد جوائز البطولة</h4>
                      <button
                        type="button"
                        onClick={() => setIsAwardsEditOpen(false)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-white mb-1">أفضل هداف في البطولة</label>
                        <input
                          type="text"
                          value={editedAwards.topScorer?.name || ''}
                          onChange={(e) =>
                            setEditedAwards({
                              ...editedAwards,
                              topScorer: {
                                name: e.target.value,
                                team: editedAwards.topScorer?.team || '',
                                goals: editedAwards.topScorer?.goals || 0
                              }
                            })
                          }
                          className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-white mb-1">أفضل لاعب في البطولة (MVP)</label>
                        <input
                          type="text"
                          value={editedAwards.bestPlayer?.name || ''}
                          onChange={(e) =>
                            setEditedAwards({
                              ...editedAwards,
                              bestPlayer: {
                                name: e.target.value,
                                team: editedAwards.bestPlayer?.team || ''
                              }
                            })
                          }
                          className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-white mb-1">أفضل حارس مرمى</label>
                        <input
                          type="text"
                          value={editedAwards.bestGoalkeeper?.name || ''}
                          onChange={(e) =>
                            setEditedAwards({
                              ...editedAwards,
                              bestGoalkeeper: {
                                name: e.target.value,
                                team: editedAwards.bestGoalkeeper?.team || ''
                              }
                            })
                          }
                          className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-white mb-1">فريق اللعب النظيف</label>
                        <input
                          type="text"
                          value={editedAwards.fairPlayTeam || ''}
                          onChange={(e) =>
                            setEditedAwards({
                              ...editedAwards,
                              fairPlayTeam: e.target.value
                            })
                          }
                          className="w-full bg-[#070b0a] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAwards}
                      className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors"
                    >
                      حفظ وتتويج الجوائز
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: RULES & CONDITIONS */}
          {activeTab === 'rules' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#070b0a] border border-white/10 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>اللائحة التنظيمية والشروط الرسمية للدوري</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-[#0d1211] border border-white/5">
                    <span className="text-gray-400 text-[10px] block">نظام البطولة</span>
                    <strong className="text-white">{league.system}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0d1211] border border-white/5">
                    <span className="text-gray-400 text-[10px] block">سعة الملعب</span>
                    <strong className="text-white">{league.capacity}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0d1211] border border-white/5">
                    <span className="text-gray-400 text-[10px] block">رسوم الاشتراك</span>
                    <strong className="text-amber-400">{formatSYP(league.entryFee)}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0d1211] border border-white/5">
                    <span className="text-gray-400 text-[10px] block">عدد الفرق</span>
                    <strong className="text-white">{league.teamsCount} فرق</strong>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <h4 className="font-bold text-amber-400">بنود اللائحة:</h4>
                  <div className="p-3.5 rounded-xl bg-[#0d1211] border border-white/5 text-gray-300 leading-relaxed whitespace-pre-line">
                    {league.termsAndConditions}
                  </div>
                </div>
              </div>

              {/* Organizer contact banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#121c18] to-[#070b0a] border border-amber-400/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">للتواصل مع منظم الدوري:</h4>
                  <p className="text-gray-400 text-[11px]">
                    {league.organizerName} • {league.organizerPhone}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openWhatsAppShare(`مرحباً كابتن ${league.organizerName}، أتواصل معك بخصوص بطولة ${league.name}.`, league.organizerPhone)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>محادثة واتساب</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Match Modal */}
      {activeFixtureForEdit && (
        <RecordMatchResultModal
          isOpen={!!activeFixtureForEdit}
          fixture={activeFixtureForEdit}
          league={league}
          isAdmin={isAdmin}
          isOrganizer={isOrganizer}
          onClose={() => setActiveFixtureForEdit(null)}
          onSaveFixture={handleSaveFixture}
        />
      )}

      {/* Add Match Modal */}
      {isAddMatchOpen && (
        <AddLeagueMatchModal
          isOpen={isAddMatchOpen}
          league={league}
          onClose={() => setIsAddMatchOpen(false)}
          onAddFixture={handleAddFixture}
        />
      )}
    </div>
  );
}

function CrownBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
      👑 المتصدر
    </span>
  );
}
