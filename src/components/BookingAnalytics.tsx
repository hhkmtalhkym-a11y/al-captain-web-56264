import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Activity
} from 'lucide-react';
import { Booking } from '../types';
import { formatSYP } from '../utils/helpers';

interface BookingAnalyticsProps {
  bookings: Booking[];
  title?: string;
  subtitle?: string;
  isOwnerView?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  'مؤكد': '#10b981', // emerald
  'بانتظار الدفع': '#f59e0b', // amber
  'قيد الانتظار': '#eab308', // yellow
  'ملغي': '#ff2a5f', // pink/red
  'مكتمل': '#00FFD2', // cyan
  'منتهي': '#6b7280' // gray
};

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default function BookingAnalytics({
  bookings,
  title = 'تحليلات وإحصائيات الحجوزات 📊',
  subtitle = 'تقرير بياني مفصل لعدد الحجوزات وتوزيع الحالات والمبالغ الإجمالية',
  isOwnerView = false
}: BookingAnalyticsProps) {
  // 1. Calculate Summary Metrics
  const metrics = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === 'مؤكد' || b.status === 'مكتمل').length;
    const pending = bookings.filter((b) => (b.status as string) === 'بانتظار الدفع' || b.status === 'قيد الانتظار').length;
    const cancelled = bookings.filter((b) => b.status === 'ملغي').length;
    const totalRevenue = bookings
      .filter((b) => b.status !== 'ملغي')
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    const confirmedRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

    return {
      total,
      confirmed,
      pending,
      cancelled,
      totalRevenue,
      confirmedRate
    };
  }, [bookings]);

  // 2. Calculate Monthly Trends Data
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthsMap: Record<number, { monthName: string; bookingsCount: number; revenue: number; confirmedCount: number }> = {};

    // Initialize last 6 months or full year
    for (let i = 0; i < 12; i++) {
      monthsMap[i] = {
        monthName: MONTH_NAMES[i],
        bookingsCount: 0,
        revenue: 0,
        confirmedCount: 0
      };
    }

    bookings.forEach((b) => {
      const dateStr = b.selectedDates?.[0] || b.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const m = d.getMonth();
        if (monthsMap[m]) {
          monthsMap[m].bookingsCount += 1;
          if (b.status !== 'ملغي') {
            monthsMap[m].revenue += Number(b.totalPrice) || 0;
          }
          if (b.status === 'مؤكد' || b.status === 'مكتمل') {
            monthsMap[m].confirmedCount += 1;
          }
        }
      }
    });

    return Object.values(monthsMap).slice(0, new Date().getMonth() + 3);
  }, [bookings]);

  // 3. Status Distribution Data for Pie Chart
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};

    bookings.forEach((b) => {
      const s = b.status || 'قيد الانتظار';
      counts[s] = (counts[s] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#9ca3af'
    }));
  }, [bookings]);

  // 4. Source Distribution (Online vs Offline for Owners)
  const sourceData = useMemo(() => {
    let online = 0;
    let offline = 0;

    bookings.forEach((b) => {
      if (b.source === 'offline' || b.paymentMethod?.includes('كاش') && !b.shamCashAccountNumber) {
        offline += 1;
      } else {
        online += 1;
      }
    });

    return [
      { name: 'حجز مباشر من التطبيق', value: online, color: '#00FFD2' },
      { name: 'حجز يدوي خارجي (هاتف/واتساب)', value: offline, color: '#f59e0b' }
    ];
  }, [bookings]);

  return (
    <div className="space-y-6 animate-fadeIn font-['Cairo']">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1211] p-5 rounded-3xl border border-[#00FFD2]/20">
        <div>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00FFD2]" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#00FFD2]/10 text-[#00FFD2] border border-[#00FFD2]/30 text-xs font-bold font-mono">
            {metrics.total} حجز مسجل
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Total Bookings */}
        <div className="bg-[#0d1211] p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>إجمالي الحجوزات</span>
            <Calendar className="w-4 h-4 text-[#00FFD2]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">{metrics.total}</p>
          <span className="text-[10px] text-gray-400 mt-1">كافة الحالات المسجلة</span>
        </div>

        {/* Metric 2: Confirmed Rate */}
        <div className="bg-[#0d1211] p-4 rounded-2xl border border-emerald-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span>نسبة التأكيد</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {metrics.confirmedRate}%
          </p>
          <span className="text-[10px] text-emerald-300/70 mt-1">{metrics.confirmed} حجز مؤكد ومكتمل</span>
        </div>

        {/* Metric 3: Pending */}
        <div className="bg-[#0d1211] p-4 rounded-2xl border border-amber-400/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
            <span>بانتظار الدفع</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono">{metrics.pending}</p>
          <span className="text-[10px] text-amber-300/70 mt-1">بانتظار الإشعار أو التأكيد</span>
        </div>

        {/* Metric 4: Total Revenue */}
        <div className="bg-[#0d1211] p-4 rounded-2xl border border-[#00FFD2]/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#00FFD2] text-xs mb-1">
            <span>{isOwnerView ? 'إجمالي الإيرادات' : 'إجمالي المبالغ'}</span>
            <DollarSign className="w-4 h-4 text-[#00FFD2]" />
          </div>
          <p className="text-sm sm:text-base font-black text-white font-mono break-words">
            {formatSYP(metrics.totalRevenue)}
          </p>
          <span className="text-[10px] text-gray-400 mt-1">للحجوزات الفعالة</span>
        </div>
      </div>

      {/* Graphical Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Monthly Bookings Bar Chart */}
        <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00FFD2]" />
              <span>عدد الحجوزات الشهرية</span>
            </h4>
            <span className="text-[11px] text-gray-400">توزيع شهري</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="monthName" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050707',
                    borderColor: '#00FFD2',
                    borderRadius: '12px',
                    color: '#fff',
                    fontFamily: 'Cairo',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`${value} حجز`, 'الحجوزات']}
                />
                <Bar dataKey="bookingsCount" name="عدد الحجوزات" fill="#00FFD2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution Donut Chart */}
        <div className="bg-[#0d1211] border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-400" />
              <span>توزيع الحجوزات حسب الحالة</span>
            </h4>
            <span className="text-[11px] text-gray-400">النسب المئوية</span>
          </div>

          {statusData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
              لا توجد بيانات كافية للرسم البياني
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0d1211" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#050707',
                      borderColor: '#ffffff30',
                      borderRadius: '12px',
                      color: '#fff',
                      fontFamily: 'Cairo',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: any) => [`${value} حجز`, name]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'Cairo', color: '#d1d5db' }}
                    formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
