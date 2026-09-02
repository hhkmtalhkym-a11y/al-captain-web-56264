import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { Trophy, Activity, Target, Shield, Flame, TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { TeamStanding, LeagueFixture, TeamDisciplinaryRecord } from '../types';

interface LeagueAnalyticsChartsProps {
  standings: TeamStanding[];
  fixtures: LeagueFixture[];
  teamDisciplinary: TeamDisciplinaryRecord[];
}

export default function LeagueAnalyticsCharts({
  standings,
  fixtures,
  teamDisciplinary
}: LeagueAnalyticsChartsProps) {
  const [activeChartTab, setActiveChartTab] = useState<'goals' | 'form' | 'cards'>('goals');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');

  // Goals Data for Recharts
  const goalsData = standings.map((team) => ({
    team: team.teamName,
    'أهداف مسجلة (له)': team.goalsFor,
    'أهداف مستقبلة (عليه)': team.goalsAgainst,
    'فارق الأهداف': team.goalDifference,
    'النقاط': team.points,
    'لعب': team.played
  }));

  // Match Form / Outcomes Data
  const outcomesData = standings.map((team) => {
    const total = Math.max(1, team.played);
    const winRate = Math.round((team.won / total) * 100);
    return {
      team: team.teamName,
      'فوز': team.won,
      'تعادل': team.drawn,
      'خسارة': team.lost,
      'نسبة الفوز %': winRate,
      'النقاط': team.points
    };
  });

  // Cards Distribution Data
  const cardsData = teamDisciplinary.map((t) => ({
    team: t.teamName,
    'بطاقات صفراء': t.yellowCards,
    'بطاقات حمراء': t.redCards,
    'نقاط اللعب النظيف': t.fairPlayPoints,
    'إجمالي البطاقات': t.totalCards
  }));

  // Summary Metrics
  const totalGoalsScored = standings.reduce((acc, t) => acc + t.goalsFor, 0);
  const finishedMatches = fixtures.filter((f) => f.isFinished).length;
  const avgGoalsPerMatch = finishedMatches > 0 ? (totalGoalsScored / finishedMatches).toFixed(1) : '0';
  const totalYellows = teamDisciplinary.reduce((acc, t) => acc + t.yellowCards, 0);
  const totalReds = teamDisciplinary.reduce((acc, t) => acc + t.redCards, 0);

  // Custom Recharts Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d1211]/95 border border-amber-400/40 p-3 rounded-2xl shadow-xl text-right font-['Cairo'] text-xs min-w-[170px] backdrop-blur-md">
          <strong className="text-white text-sm block border-b border-white/10 pb-1.5 mb-2 font-bold flex items-center justify-between">
            <span>{label}</span>
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </strong>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 font-bold" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-mono font-bold text-white text-xs">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 font-['Cairo']">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-[#070b0a] border border-emerald-500/30">
          <span className="text-[11px] text-gray-400 block mb-1">إجمالي الأهداف المسجلة</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-black text-emerald-400 font-mono">{totalGoalsScored}</strong>
            <span className="text-[10px] text-emerald-300 font-bold px-2 py-0.5 rounded-full bg-emerald-500/20">
              {avgGoalsPerMatch} هدف/مباراة
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-[#070b0a] border border-cyan-500/30">
          <span className="text-[11px] text-gray-400 block mb-1">المباريات المكتملة</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-black text-[#00FFD2] font-mono">{finishedMatches}</strong>
            <span className="text-[10px] text-gray-400">من أصل {fixtures.length}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-[#070b0a] border border-amber-500/30">
          <span className="text-[11px] text-gray-400 block mb-1">إجمالي البطاقات الصفراء</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-black text-amber-400 font-mono">{totalYellows}</strong>
            <span className="text-xs">🟨 إنذار</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-950/40 to-[#070b0a] border border-red-500/30">
          <span className="text-[11px] text-gray-400 block mb-1">إجمالي البطاقات الحمراء</span>
          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-black text-red-400 font-mono">{totalReds}</strong>
            <span className="text-xs">🟥 طرد</span>
          </div>
        </div>
      </div>

      {/* Chart Switcher Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#070b0a] p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1.5 p-1 bg-[#0d1211] rounded-xl border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveChartTab('goals')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeChartTab === 'goals'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>توزيع الأهداف (الهجوم والدفاع)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('form')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeChartTab === 'form'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>نتائج المباريات ونسب الفوز</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('cards')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeChartTab === 'cards'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>توزيع البطاقات والإنذارات</span>
          </button>
        </div>

        <span className="text-[11px] text-gray-400 hidden sm:inline">
          📊 رسوم بيانية تفاعلية مدعومة بـ Recharts
        </span>
      </div>

      {/* CHART 1: GOALS DISTRIBUTION */}
      {activeChartTab === 'goals' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#070b0a] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>مقارنة الأهداف المسجلة (له) والأهداف المستقبلة (عليه)</span>
              </h4>
              <p className="text-xs text-gray-400">
                يوضح الرسم القوة الهجومية والصلابة الدفاعية لكل فريق في بطولة الدوري.
              </p>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalsData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="team"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }}
                  formatter={(value) => <span className="text-gray-300 font-bold">{value}</span>}
                />
                <Bar dataKey="أهداف مسجلة (له)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="أهداف مستقبلة (عليه)" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="فارق الأهداف" fill="#fbbf24" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CHART 2: MATCH RESULTS & WIN RATES */}
      {activeChartTab === 'form' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#070b0a] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>توزيع نتائج المباريات (فوز / تعادل / خسارة) لكل فريق</span>
              </h4>
              <p className="text-xs text-gray-400">
                مخطط تراكمي يقارن عدد الانتصارات والتعادلات والهزائم المحققة حتى الآن.
              </p>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomesData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="team"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }}
                  formatter={(value) => <span className="text-gray-300 font-bold">{value}</span>}
                />
                <Bar dataKey="فوز" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={36} />
                <Bar dataKey="تعادل" stackId="a" fill="#64748b" radius={[0, 0, 0, 0]} maxBarSize={36} />
                <Bar dataKey="خسارة" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CHART 3: CARDS & FAIR PLAY DISTRIBUTION */}
      {activeChartTab === 'cards' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#070b0a] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>توزيع البطاقات والإنذارات ونقاط اللعب النظيف</span>
              </h4>
              <p className="text-xs text-gray-400">
                مقارنة البطاقات الصفراء والحمراء المحتسبة على كل فريق لاحتساب جائزة اللعب النظيف.
              </p>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cardsData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="team"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }}
                  formatter={(value) => <span className="text-gray-300 font-bold">{value}</span>}
                />
                <Bar dataKey="بطاقات صفراء" fill="#fbbf24" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="بطاقات حمراء" fill="#dc2626" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="نقاط اللعب النظيف" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
