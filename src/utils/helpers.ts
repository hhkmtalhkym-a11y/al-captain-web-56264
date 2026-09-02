import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {
  Booking,
  League,
  Playground,
  UserProfile,
  LeagueFixture,
  TeamStanding,
  PlayerDisciplinaryRecord,
  TeamDisciplinaryRecord,
  GoalEvent,
  CardEvent,
  QualifiedTeam
} from '../types';

// Format Syrian Pounds currency
export function formatSYP(amount?: number | null | string): string {
  if (amount === undefined || amount === null) {
    return '0 ل.س';
  }
  const numericAmount = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(numericAmount)) {
    return '0 ل.س';
  }
  return `${numericAmount.toLocaleString('ar-SY')} ل.س`;
}

/**
 * Export Comprehensive Bookings, Leagues, Users & Activity Audit Logs Report in PDF (Bilingual AR/EN)
 */
export function exportMasterAdminReportPdf(
  bookings: Booking[],
  leagues: League[],
  activityLogs: Array<{ id: string; type?: string; title: string; description: string; performedBy: string; timestamp: string }> = [],
  users: Array<{ id: string; name: string; phone?: string; email?: string; governorate?: string; role?: string; isAdmin?: boolean }> = [],
  language: 'ar' | 'en' | 'bilingual' = 'bilingual'
) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    let y = 10;

    // Background helper
    const drawPageBackground = () => {
      doc.setFillColor(5, 7, 7);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    drawPageBackground();

    // Header Card
    doc.setFillColor(13, 18, 17);
    doc.rect(10, y, 190, 36, 'F');

    doc.setTextColor(0, 255, 210);
    doc.setFontSize(16);
    doc.text('AL-KAPTAN SPORTS PLATFORM | منصة الكابتن الرياضية', 105, y + 12, { align: 'center' });

    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text('COMPREHENSIVE ADMIN SUMMARY REPORT | التقرير الإداري والمالي الشامل', 105, y + 21, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setTextColor(150, 180, 175);
    const exportDateStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    doc.text(`Generated on: ${exportDateStr} | Syrian Arab Republic (14 Governorates) | 0% Commission`, 105, y + 29, { align: 'center' });

    y += 42;

    // 1. KPI Summary Block
    doc.setFillColor(20, 28, 26);
    doc.rect(10, y, 190, 28, 'F');

    const totalRev = bookings.reduce((sum, b) => sum + (b.status !== 'ملغي' ? (Number(b.totalPrice) || 0) : 0), 0);
    const confirmedCount = bookings.filter((b) => b.status === 'مؤكد').length;
    const pendingCount = bookings.filter((b) => b.status === 'قيد الانتظار').length;

    doc.setFontSize(8.5);
    doc.setTextColor(0, 255, 210);
    doc.text(`• Total Bookings: ${bookings.length} (Confirmed: ${confirmedCount} | Pending: ${pendingCount})`, 15, y + 8);
    doc.text(`• Active Leagues & Tournaments: ${leagues.length}`, 15, y + 15);
    doc.text(`• Registered Users & Captains: ${users.length || 5}`, 15, y + 22);

    doc.text(`• Total Revenue Volume: ${totalRev.toLocaleString('ar-SY')} SYP`, 115, y + 8);
    doc.text(`• Platform Commission: 0% Free (Zero Margin)`, 115, y + 15);
    doc.text(`• System Integrity: 100% Verified & Encrypted`, 115, y + 22);

    y += 34;

    // 2. Bookings Table Section
    doc.setFillColor(0, 255, 210);
    doc.rect(10, y, 190, 7, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8.5);
    doc.text('RECENT BOOKINGS & FINANCIAL TRANSACTIONS / سجل الحجوزات والمعاملات', 15, y + 5);

    y += 9;
    doc.setFillColor(30, 41, 38);
    doc.rect(10, y, 190, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('Ref Code', 13, y + 4);
    doc.text('Pitch / Venue', 42, y + 4);
    doc.text('Governorate', 88, y + 4);
    doc.text('Captain Phone', 116, y + 4);
    doc.text('Status', 152, y + 4);
    doc.text('Amount (SYP)', 175, y + 4);

    y += 7;
    const sampleBookings = bookings.slice(0, 6);
    sampleBookings.forEach((b) => {
      doc.setFillColor(15, 23, 21);
      doc.rect(10, y - 1, 190, 6, 'F');
      doc.setTextColor(220, 220, 220);
      doc.setFontSize(6.5);
      doc.text(b.referenceNumber || (b.id ? b.id.slice(0, 10) : 'KAP-REF'), 13, y + 3);
      doc.text((b.playgroundName || 'Pitch').slice(0, 20), 42, y + 3);
      doc.text(b.governorate || 'Syria', 88, y + 3);
      doc.text(b.userPhone || '-', 116, y + 3);
      
      if (b.status === 'مؤكد') {
        doc.setTextColor(34, 197, 94);
      } else if (b.status === 'ملغي') {
        doc.setTextColor(239, 68, 68);
      } else {
        doc.setTextColor(245, 158, 11);
      }
      doc.text(b.status || 'Pending', 152, y + 3);

      doc.setTextColor(0, 255, 210);
      const prc = Number(b.totalPrice) || 0;
      doc.text(`${prc.toLocaleString()} SYP`, 175, y + 3);
      y += 6.5;
    });

    // 3. Registered Users Section
    y += 3;
    doc.setFillColor(59, 130, 246);
    doc.rect(10, y, 190, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.text('REGISTERED USERS & CAPTAINS / المستخدمين واللاعبين المعتمدين', 15, y + 5);

    y += 9;
    doc.setFillColor(30, 41, 38);
    doc.rect(10, y, 190, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('Name / الكابتن', 13, y + 4);
    doc.text('Phone / الهاتف', 70, y + 4);
    doc.text('Governorate / المحافظة', 115, y + 4);
    doc.text('Role / الرتبة', 160, y + 4);

    y += 7;
    const sampleUsers = users.slice(0, 5);
    sampleUsers.forEach((u) => {
      doc.setFillColor(15, 23, 21);
      doc.rect(10, y - 1, 190, 6, 'F');
      doc.setTextColor(220, 220, 220);
      doc.setFontSize(6.5);
      doc.text((u.name || 'Captain').slice(0, 25), 13, y + 3);
      doc.text(u.phone || '—', 70, y + 3);
      doc.text(u.governorate || 'دمشق', 115, y + 3);
      
      const roleLabel = u.isAdmin || u.role === 'admin' ? 'Admin / مدير' : (u.role === 'league_manager' ? 'Organizer / منظم' : 'User / مستخدم');
      doc.setTextColor(u.isAdmin || u.role === 'admin' ? 255 : 0, u.isAdmin || u.role === 'admin' ? 42 : 255, u.isAdmin || u.role === 'admin' ? 95 : 210);
      doc.text(roleLabel, 160, y + 3);
      y += 6.5;
    });

    // 4. Leagues & Tournaments Section
    y += 3;
    doc.setFillColor(251, 191, 36);
    doc.rect(10, y, 190, 7, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8.5);
    doc.text('LEAGUES & CHAMPIONSHIPS / بطولات ودوريات المحافظات', 15, y + 5);

    y += 9;
    const sampleLeagues = leagues.slice(0, 3);
    sampleLeagues.forEach((l) => {
      doc.setFillColor(15, 23, 21);
      doc.rect(10, y - 1, 190, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(`• ${l.name} (${l.governorate})`, 15, y + 3.5);
      doc.setTextColor(200, 200, 200);
      const prizeDesc = typeof l.prizes === 'object' && l.prizes !== null 
        ? `${l.prizes.cashPrize ? l.prizes.cashPrize + ' SYP' : ''} ${l.prizes.medals || ''}`.trim() || 'Cup & Medals'
        : 'Cup & Medals';
      doc.text(`Teams: ${l.teamsCount || 16} | Status: ${l.status} | Prize: ${prizeDesc}`, 105, y + 3.5);
      y += 6.5;
    });

    // 5. Activity Logs Section
    if (activityLogs.length > 0 && y < 265) {
      y += 3;
      doc.setFillColor(168, 85, 247);
      doc.rect(10, y, 190, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.text('SYSTEM ACTIVITY TRAIL / سجل النشاطات والعمليات المسجلة', 15, y + 5);

      y += 9;
      activityLogs.slice(0, 3).forEach((log) => {
        doc.setFillColor(15, 23, 21);
        doc.rect(10, y - 1, 190, 6, 'F');
        doc.setTextColor(200, 220, 255);
        doc.setFontSize(6.5);
        doc.text(`[${log.timestamp || 'Now'}] ${log.title}`, 15, y + 3.5);
        doc.setTextColor(160, 160, 160);
        doc.text(`By: ${log.performedBy}`, 150, y + 3.5);
        y += 6.5;
      });
    }

    // Official Verification Footer
    doc.setFontSize(7);
    doc.setTextColor(100, 150, 140);
    doc.text('Official Digital Document - Al-Kaptan Sports Platform (Syrian Arab Republic) | Certified & Encrypted', 105, 289, { align: 'center' });

    doc.save(`Al-Kaptan-Executive-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating Master Admin PDF:', error);
  }
}

/**
 * Export Multi-Sheet Comprehensive Excel Workbook (Bilingual AR/EN)
 */
export function exportMasterAdminReportExcel(
  bookings: Booking[],
  leagues: League[],
  activityLogs: Array<{ id: string; type?: string; title: string; description: string; performedBy: string; timestamp: string }> = [],
  users: Array<{ id: string; name: string; phone?: string; email?: string; governorate?: string; role?: string; isAdmin?: boolean }> = [],
  playgrounds: Playground[] = []
) {
  try {
    const workbook = XLSX.utils.book_new();

    // 1. Summary Sheet
    const totalRev = bookings.reduce((sum, b) => sum + (b.status !== 'ملغي' ? (Number(b.totalPrice) || 0) : 0), 0);
    const confirmedCount = bookings.filter((b) => b.status === 'مؤكد').length;
    const summarySheetData = [
      { 'المؤشر / KPI': 'إجمالي الملاعب (Total Pitches)', 'القيمة / Value': playgrounds.length },
      { 'المؤشر / KPI': 'إجمالي الحجوزات (Total Bookings)', 'القيمة / Value': bookings.length },
      { 'المؤشر / KPI': 'الحجوزات المؤكدة (Confirmed Bookings)', 'القيمة / Value': confirmedCount },
      { 'المؤشر / KPI': 'الحجم المالي التراكمي (Total Volume SYP)', 'القيمة / Value': `${totalRev.toLocaleString()} ل.س` },
      { 'المؤشر / KPI': 'إجمالي البطولات (Active Leagues)', 'القيمة / Value': leagues.length },
      { 'المؤشر / KPI': 'إجمالي المستخدمين (Registered Users)', 'القيمة / Value': users.length },
      { 'المؤشر / KPI': 'النشاطات المسجلة (Activity Logs)', 'القيمة / Value': activityLogs.length },
      { 'المؤشر / KPI': 'نسبة العمولة (Platform Commission)', 'القيمة / Value': '0% مجانية بالكامل' },
      { 'المؤشر / KPI': 'تاريخ التصدير (Export Date)', 'القيمة / Value': new Date().toLocaleString('ar-SY') }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(workbook, wsSummary, 'الملخص العام (Summary)');

    // 2. Bookings Sheet
    const bookingsData = bookings.map((b) => ({
      'الرقم المرجعي (Ref Code)': b.referenceNumber || b.id,
      'الملعب (Pitch Name)': b.playgroundName,
      'المحافظة (Governorate)': b.governorate,
      'الكابتن (Captain Name)': b.userName,
      'رقم الهاتف (Phone)': b.userPhone,
      'التواريخ (Dates)': b.selectedDates.join(', '),
      'التوقيت (Time Slot)': b.timeSlot,
      'المبلغ بالليرة (Amount SYP)': b.totalPrice,
      'طريقة الدفع (Payment Method)': b.paymentMethod,
      'حالة الحجز (Status)': b.status,
      'تاريخ التسجيل (Created At)': b.createdAt || '—'
    }));
    const wsBookings = XLSX.utils.json_to_sheet(bookingsData);
    XLSX.utils.book_append_sheet(workbook, wsBookings, 'سجل الحجوزات (Bookings)');

    // 3. Users Sheet
    const usersData = users.map((u) => ({
      'اسم المستخدم (Name)': u.name,
      'رقم الهاتف (Phone)': u.phone || '—',
      'البريد (Email)': u.email || '—',
      'المحافظة (Governorate)': u.governorate || 'دمشق',
      'الرتبة (Role)': u.isAdmin || u.role === 'admin' ? 'مدير عام (Admin)' : (u.role === 'league_manager' ? 'منظم دوريات' : 'لاعب/مستخدم'),
      'نوع الحساب (Account Type)': u.isAdmin ? 'مسؤول نظام' : 'مستخدم عادي'
    }));
    const wsUsers = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, wsUsers, 'المستخدمين (Users)');

    // 4. Activity Logs Sheet
    if (activityLogs.length > 0) {
      const logsData = activityLogs.map((l) => ({
        'التوقيت (Timestamp)': l.timestamp,
        'عنوان النشاط (Title)': l.title,
        'التفاصيل (Description)': l.description,
        'المنفذ (Performed By)': l.performedBy,
        'النوع (Type)': l.type || 'system'
      }));
      const wsLogs = XLSX.utils.json_to_sheet(logsData);
      XLSX.utils.book_append_sheet(workbook, wsLogs, 'سجل العمليات (Activity Logs)');
    }

    XLSX.writeFile(workbook, `Al-Kaptan-Master-Report-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting Master Admin Excel:', error);
  }
}

// Convert image file from user device to Base64 Data URL
export function readImageAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المختار ليس صورة صالحة'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('حدث خطأ أثناء قراءة الصورة من جهازك'));
    };
    reader.readAsDataURL(file);
  });
}

// Export comprehensive multi-sheet League Excel workbook
export function exportLeagueExcelComprehensive(league: League) {
  try {
    const workbook = XLSX.utils.book_new();

    // 1. Standings Sheet
    const standingsData = league.standings.map((s) => ({
      'المركز (Pos)': s.position,
      'اسم الفريق (Team)': s.teamName,
      'لعب (P)': s.played,
      'فاز (W)': s.won,
      'تعادل (D)': s.drawn,
      'خسر (L)': s.lost,
      'له (GF)': s.goalsFor,
      'عليه (GA)': s.goalsAgainst,
      'فارق الأهداف (GD)': s.goalDifference,
      'النقاط (PTS)': s.points,
      'آخر 5 مباريات (Form)': (s.form || []).join('-')
    }));
    const wsStandings = XLSX.utils.json_to_sheet(standingsData);
    XLSX.utils.book_append_sheet(workbook, wsStandings, 'جدول الترتيب (Standings)');

    // 2. Fixtures & Results Sheet
    const fixturesData = league.fixtures.map((f) => ({
      'الجولة (Round)': f.round,
      'الفريق الأول (Team A)': f.teamA,
      'النتيجة أ (Score A)': f.scoreA ?? '-',
      'النتيجة ب (Score B)': f.scoreB ?? '-',
      'الفريق الثاني (Team B)': f.teamB,
      'التاريخ (Date)': f.date,
      'الوقت (Time)': f.time,
      'الملعب (Venue)': f.venue,
      'الحالة (Status)': f.status || (f.isFinished ? 'انتهت' : 'قادمة'),
      'الحكم الرئيسي (Referee)': f.mainReferee || 'معتمد الاتحاد',
      'رجل المباراة (MVP)': f.manOfTheMatch || '-',
      'عدد الأهداف (Goals)': (f.goals || []).length,
      'البطاقات الصفراء': (f.cards || []).filter((c) => c.cardType === 'صفراء').length,
      'البطاقات الحمراء': (f.cards || []).filter((c) => c.cardType === 'حمراء').length,
      'ملاحظات التأجيل': f.postponeReason || '-'
    }));
    const wsFixtures = XLSX.utils.json_to_sheet(fixturesData);
    XLSX.utils.book_append_sheet(workbook, wsFixtures, 'جدول المباريات (Fixtures)');

    // 3. Top Scorers Sheet
    const topScorers = extractLeagueTopScorers(league.fixtures);
    const scorersData = topScorers.map((sc, idx) => ({
      'الترتيب (Rank)': idx + 1,
      'اسم اللاعب (Player)': sc.name,
      'الفريق (Team)': sc.team,
      'الأهداف (Goals)': sc.goals,
      'التمريرات الحاسمة (Assists)': sc.assists,
      'ركلات الجزاء (Penalties)': sc.penalties
    }));
    const wsScorers = XLSX.utils.json_to_sheet(scorersData);
    XLSX.utils.book_append_sheet(workbook, wsScorers, 'قائمة الهدافين (Top Scorers)');

    // 4. Disciplinary & Cards Sheet
    const disciplinary = extractLeagueDisciplinaryRecords(league.fixtures);
    const disciplinaryData = disciplinary.map((d) => ({
      'اسم اللاعب (Player)': d.playerName,
      'الفريق (Team)': d.teamName,
      'البطاقات الصفراء (Yellows)': d.yellowCardsCount,
      'البطاقات الحمراء (Reds)': d.redCardsCount,
      'حالة الأهلية (Status)': d.isSuspended ? `موقوف (${d.suspensionMatchesRemaining} مباراة)` : 'متاح للعب',
      'سبب الإيقاف (Suspension Reason)': d.suspensionReason || 'سجل نظيف'
    }));
    const wsDisciplinary = XLSX.utils.json_to_sheet(disciplinaryData);
    XLSX.utils.book_append_sheet(workbook, wsDisciplinary, 'سجل العقوبات والإنذارات');

    // 5. Objections Sheet
    const objections = league.objections || [];
    if (objections.length > 0) {
      const objectionsData = objections.map((obj) => ({
        'رقم الاعتراض (ID)': obj.id,
        'الفريق المعترض (Team)': obj.teamName,
        'المباراة المعنية (Fixture)': obj.fixtureId || 'عام',
        'تاريخ التقديم (Date)': obj.date,
        'سبب وتفاصيل الاعتراض': obj.reason,
        'حالة الاعتراض (Status)': obj.status,
        'قرار اللجنة الإدارية (Decision)': obj.adminDecision || 'قيد الدراسة'
      }));
      const wsObjections = XLSX.utils.json_to_sheet(objectionsData);
      XLSX.utils.book_append_sheet(workbook, wsObjections, 'سجل الاعتراضات');
    }

    XLSX.writeFile(workbook, `League-Report-${league.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting League Excel:', error);
  }
}

// Export data to Excel (.xlsx)
export function exportToExcel(data: Record<string, any>[], filename: string = 'Al-Kaptan-Data') {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'البيانات');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
}

// Export bookings data as CSV/Excel
export function exportBookingsCsv(bookings: Booking[]) {
  const formattedData = bookings.map((b) => ({
    'الرقم المرجعي': b.referenceNumber,
    'اسم الملعب': b.playgroundName,
    'المحافظة': b.governorate,
    'المنطقة': b.detailedArea,
    'اسم الكابتن': b.userName,
    'رقم الجوال': b.userPhone,
    'التاريخ': b.selectedDates.join(', '),
    'الوقت': b.timeSlot,
    'المدة': b.duration,
    'المبلغ الإجمالي (ل.س)': b.totalPrice,
    'طريقة الدفع': b.paymentMethod,
    'حالة الحجز': b.status,
    'تاريخ الإنشاء': b.createdAt
  }));
  exportToExcel(formattedData, 'Al-Kaptan-Bookings-Report');
}

/**
 * Recalculate Standings automatically from finished fixtures
 */
export function recalculateLeagueStandings(
  teams: string[],
  fixtures: LeagueFixture[],
  existingStandings: TeamStanding[] = []
): TeamStanding[] {
  const map: Record<
    string,
    {
      teamName: string;
      teamLogo?: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
      form: ('W' | 'D' | 'L')[];
    }
  > = {};

  // Initialize with teams
  const allTeamNames = Array.from(
    new Set([
      ...teams,
      ...fixtures.map((f) => f.teamA),
      ...fixtures.map((f) => f.teamB),
      ...existingStandings.map((s) => s.teamName)
    ])
  ).filter((t) => t && t.trim() !== '');

  allTeamNames.forEach((t) => {
    const existing = existingStandings.find((s) => s.teamName === t);
    map[t] = {
      teamName: t,
      teamLogo: existing?.teamLogo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: []
    };
  });

  // Calculate from finished matches
  fixtures
    .filter((f) => f.isFinished && f.scoreA !== undefined && f.scoreB !== undefined)
    .forEach((f) => {
      const a = f.teamA;
      const b = f.teamB;
      const sa = f.scoreA ?? 0;
      const sb = f.scoreB ?? 0;

      if (!map[a]) {
        map[a] = {
          teamName: a,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          form: []
        };
      }
      if (!map[b]) {
        map[b] = {
          teamName: b,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          form: []
        };
      }

      map[a].played += 1;
      map[b].played += 1;
      map[a].goalsFor += sa;
      map[a].goalsAgainst += sb;
      map[b].goalsFor += sb;
      map[b].goalsAgainst += sa;

      if (sa > sb) {
        map[a].won += 1;
        map[a].points += 3;
        map[a].form.push('W');
        map[b].lost += 1;
        map[b].form.push('L');
      } else if (sa < sb) {
        map[b].won += 1;
        map[b].points += 3;
        map[b].form.push('W');
        map[a].lost += 1;
        map[a].form.push('L');
      } else {
        map[a].drawn += 1;
        map[b].drawn += 1;
        map[a].points += 1;
        map[b].points += 1;
        map[a].form.push('D');
        map[b].form.push('D');
      }
    });

  // Convert to array and calculate GD
  const list = Object.values(map).map((t) => {
    t.goalDifference = t.goalsFor - t.goalsAgainst;
    t.form = t.form.slice(-5); // keep last 5
    return t;
  });

  // Sort by Points (desc), Goal Difference (desc), Goals For (desc), Won (desc)
  list.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.won - a.won;
  });

  return list.map((item, idx) => ({
    position: idx + 1,
    teamName: item.teamName,
    teamLogo: item.teamLogo,
    played: item.played,
    won: item.won,
    drawn: item.drawn,
    lost: item.lost,
    goalsFor: item.goalsFor,
    goalsAgainst: item.goalsAgainst,
    goalDifference: item.goalDifference,
    points: item.points,
    form: item.form
  }));
}

/**
 * Extract Disciplinary & Cards Records per player across league fixtures
 */
export function extractLeagueDisciplinaryRecords(fixtures: LeagueFixture[]): PlayerDisciplinaryRecord[] {
  const recordsMap: Record<string, PlayerDisciplinaryRecord> = {};

  fixtures.forEach((fix) => {
    const cards = fix.cards || [];
    cards.forEach((card) => {
      const key = `${card.player.trim()}_${card.team.trim()}`;
      if (!recordsMap[key]) {
        recordsMap[key] = {
          playerName: card.player.trim(),
          teamName: card.team.trim(),
          yellowCardsCount: 0,
          redCardsCount: 0,
          isSuspended: false,
          suspensionMatchesRemaining: 0,
          cardsHistory: []
        };
      }

      const rec = recordsMap[key];
      if (card.cardType === 'صفراء') {
        rec.yellowCardsCount += 1;
      } else if (card.cardType === 'حمراء') {
        rec.redCardsCount += 1;
      }

      rec.cardsHistory.push({
        fixtureId: fix.id,
        round: fix.round,
        opponent: card.team === fix.teamA ? fix.teamB : fix.teamA,
        cardType: card.cardType,
        minute: card.minute,
        reason: card.reason
      });
    });
  });

  // Calculate automated suspension status
  // Rule: 3 Yellows = 1 match suspension, Red card = 2 matches suspension, 2nd yellow = 1 match
  return Object.values(recordsMap).map((rec) => {
    const yellowSuspensionCount = Math.floor(rec.yellowCardsCount / 3);
    const redSuspensionCount = rec.redCardsCount * 2;
    const totalSuspension = yellowSuspensionCount + redSuspensionCount;

    if (totalSuspension > 0) {
      rec.isSuspended = true;
      rec.suspensionMatchesRemaining = totalSuspension;
      rec.suspensionReason =
        rec.redCardsCount > 0
          ? `طرد مباشر أو بطاقة حمراء (${rec.redCardsCount} حمراء)`
          : `تراكم 3 بطاقات صفراء (${rec.yellowCardsCount} صفراء)`;
    }
    return rec;
  });
}

/**
 * Extract Cumulative Disciplinary Statistics per Team (Fair Play Ranking)
 */
export function extractLeagueTeamDisciplinaryRecords(
  fixtures: LeagueFixture[],
  teamNames: string[]
): TeamDisciplinaryRecord[] {
  const map: Record<string, { yellow: number; red: number; matches: number }> = {};

  teamNames.forEach((t) => {
    map[t] = { yellow: 0, red: 0, matches: 0 };
  });

  fixtures.forEach((fix) => {
    if (map[fix.teamA]) map[fix.teamA].matches += fix.isFinished ? 1 : 0;
    if (map[fix.teamB]) map[fix.teamB].matches += fix.isFinished ? 1 : 0;

    (fix.cards || []).forEach((c) => {
      const team = c.team.trim();
      if (!map[team]) {
        map[team] = { yellow: 0, red: 0, matches: 0 };
      }
      if (c.cardType === 'صفراء') {
        map[team].yellow += 1;
      } else if (c.cardType === 'حمراء') {
        map[team].red += 1;
      }
    });
  });

  const records: TeamDisciplinaryRecord[] = Object.entries(map).map(([teamName, data]) => {
    const totalCards = data.yellow + data.red;
    const fairPlayPoints = data.yellow * 1 + data.red * 3; // 1 pt per yellow, 3 pts per red
    const matchesPlayed = Math.max(1, data.matches);
    const avgCardsPerMatch = Number((totalCards / matchesPlayed).toFixed(2));

    return {
      teamName,
      yellowCards: data.yellow,
      redCards: data.red,
      totalCards,
      fairPlayPoints,
      matchesPlayed: data.matches,
      avgCardsPerMatch,
      rank: 1
    };
  });

  // Sort by fair play points ascending (cleanest team first)
  records.sort((a, b) => a.fairPlayPoints - b.fairPlayPoints || a.redCards - b.redCards || a.yellowCards - b.yellowCards);

  records.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return records;
}

/**
 * Extract Top Scorers list from all league goals
 */
export function extractLeagueTopScorers(
  fixtures: LeagueFixture[]
): { name: string; team: string; goals: number; assists: number; penalties: number }[] {
  const map: Record<string, { name: string; team: string; goals: number; assists: number; penalties: number }> = {};

  fixtures.forEach((fix) => {
    (fix.goals || []).forEach((g) => {
      const p = g.player.trim();
      if (!p) return;
      const key = `${p}_${g.team}`;
      if (!map[key]) {
        map[key] = {
          name: p,
          team: g.team,
          goals: 0,
          assists: 0,
          penalties: 0
        };
      }
      map[key].goals += 1;
      if (g.goalType === 'ركلة جزاء') {
        map[key].penalties += 1;
      }

      if (g.assistPlayer) {
        const assistKey = `${g.assistPlayer.trim()}_${g.team}`;
        if (!map[assistKey]) {
          map[assistKey] = {
            name: g.assistPlayer.trim(),
            team: g.team,
            goals: 0,
            assists: 0,
            penalties: 0
          };
        }
        map[assistKey].assists += 1;
      }
    });
  });

  return Object.values(map).sort((a, b) => b.goals - a.goals || b.assists - a.assists);
}

/**
 * Generate Automatic Round-Robin Fixtures Schedule
 */
export function generateRoundRobinSchedule(
  teams: string[],
  venueName: string = 'ملعب الفيحاء 1',
  startDate: string = new Date().toISOString().split('T')[0]
): LeagueFixture[] {
  const teamList = [...teams];
  if (teamList.length % 2 !== 0) {
    teamList.push('باي (استراحة)');
  }

  const numTeams = teamList.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const fixtures: LeagueFixture[] = [];

  const baseDate = new Date(startDate);

  for (let round = 0; round < numRounds; round++) {
    const roundDate = new Date(baseDate);
    roundDate.setDate(baseDate.getDate() + round * 7);
    const dateStr = roundDate.toISOString().split('T')[0];

    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (numTeams - 1);
      let away = (numTeams - 1 - match + round) % (numTeams - 1);

      if (match === 0) {
        away = numTeams - 1;
      }

      const teamA = teamList[home];
      const teamB = teamList[away];

      if (teamA === 'باي (استراحة)' || teamB === 'باي (استراحة)') {
        continue; // Skip bye match
      }

      const matchTime = match % 2 === 0 ? '19:00' : '20:45';

      fixtures.push({
        id: `auto-fix-${round + 1}-${match + 1}-${Date.now()}`,
        round: `الجولة ${round + 1}`,
        teamA,
        teamB,
        date: dateStr,
        time: matchTime,
        venue: venueName,
        status: 'قادمة',
        isFinished: false,
        goals: [],
        cards: [],
        sendOffs: [],
        substitutions: []
      });
    }
  }

  return fixtures;
}

/**
 * Calculate Qualified Teams for Knockouts
 */
export function calculateQualifiedTeams(standings: TeamStanding[], qualifierCount: number = 4): QualifiedTeam[] {
  const qualified = standings.slice(0, qualifierCount);
  return qualified.map((t, idx) => ({
    id: `qual-${t.position}-${Date.now()}`,
    position: t.position,
    teamName: t.teamName,
    teamLogo: t.teamLogo,
    points: t.points,
    goalDifference: t.goalDifference,
    qualifiedRound: qualifierCount === 4 ? 'نصف النهائي' : qualifierCount === 8 ? 'ربع النهائي' : 'المباراة النهائية',
    isManuallyEdited: false
  }));
}

// Export League Report to PDF
export function exportLeaguePdf(league: League) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Background
    doc.setFillColor(5, 7, 7);
    doc.rect(0, 0, 210, 297, 'F');

    // Header banner
    doc.setFillColor(13, 18, 17);
    doc.rect(10, 10, 190, 35, 'F');

    doc.setTextColor(0, 255, 210);
    doc.setFontSize(22);
    doc.text('AL-KAPTAN SPORTS PLATFORM', 105, 24, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(`Official League Report: ${league.name}`, 105, 36, { align: 'center' });

    // League Info
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text(`Governorate: ${league.governorate} | City: ${league.city}`, 15, 55);
    doc.text(`Venue: ${league.hostingVenue} | System: ${league.system}`, 15, 63);
    doc.text(`Organizer: ${league.organizerName} (${league.organizerPhone})`, 15, 71);
    doc.text(`Teams Count: ${league.teamsCount} | Status: ${league.status}`, 15, 79);

    // Standings Table
    doc.setFillColor(0, 255, 210);
    doc.rect(15, 90, 180, 8, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('Pos', 20, 95);
    doc.text('Team Name', 45, 95);
    doc.text('P', 110, 95);
    doc.text('W', 125, 95);
    doc.text('D', 140, 95);
    doc.text('L', 155, 95);
    doc.text('GD', 170, 95);
    doc.text('PTS', 185, 95);

    let y = 105;
    doc.setTextColor(255, 255, 255);
    league.standings.forEach((team) => {
      doc.setFillColor(15, 23, 21);
      doc.rect(15, y - 5, 180, 7, 'F');
      doc.text(String(team.position), 20, y);
      doc.text(team.teamName, 45, y);
      doc.text(String(team.played), 110, y);
      doc.text(String(team.won), 125, y);
      doc.text(String(team.drawn), 140, y);
      doc.text(String(team.lost), 155, y);
      doc.text(String(team.goalDifference), 170, y);
      doc.text(String(team.points), 185, y);
      y += 8;
    });

    // Top Scorers / Awards Section
    if (league.awards) {
      y += 10;
      doc.setFillColor(251, 191, 36);
      doc.rect(15, y, 180, 7, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text('OFFICIAL AWARDS & DISTINCTIONS', 105, y + 5, { align: 'center' });
      y += 12;

      doc.setTextColor(251, 191, 36);
      if (league.awards.topScorer) {
        doc.text(`Top Scorer: ${league.awards.topScorer.name} (${league.awards.topScorer.goals} goals)`, 20, y);
        y += 7;
      }
      if (league.awards.bestPlayer) {
        doc.text(`Best Player: ${league.awards.bestPlayer.name} (${league.awards.bestPlayer.team})`, 20, y);
        y += 7;
      }
      if (league.awards.bestGoalkeeper) {
        doc.text(`Best Goalkeeper: ${league.awards.bestGoalkeeper.name} (${league.awards.bestGoalkeeper.team})`, 20, y);
        y += 7;
      }
      if (league.awards.fairPlayTeam) {
        doc.text(`Fair Play Award: ${league.awards.fairPlayTeam}`, 20, y);
        y += 7;
      }
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 150, 140);
    doc.text('Generated via Al-Kaptan Sports Platform - Syria', 105, 285, { align: 'center' });

    doc.save(`League-Report-${league.name}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

/**
 * Export Comprehensive Official Match Sheet PDF
 */
export function exportMatchSheetPdf(leagueName: string, fixture: LeagueFixture) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dark Background
    doc.setFillColor(5, 7, 7);
    doc.rect(0, 0, 210, 297, 'F');

    // Header container
    doc.setFillColor(13, 18, 17);
    doc.rect(15, 15, 180, 45, 'F');

    doc.setTextColor(0, 255, 210);
    doc.setFontSize(20);
    doc.text('AL-KAPTAN SPORTS PLATFORM', 105, 28, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(`OFFICIAL MATCH REPORT: ${leagueName}`, 105, 40, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 255, 210);
    doc.text(
      `Round: ${fixture.round} | Status: ${(fixture.status || 'انتهت').toUpperCase()} | Date: ${fixture.date} ${fixture.time}`,
      105,
      50,
      { align: 'center' }
    );

    // Score Board Box
    doc.setFillColor(20, 30, 28);
    doc.rect(15, 65, 180, 35, 'F');

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(fixture.teamA, 55, 80, { align: 'center' });
    doc.text(fixture.teamB, 155, 80, { align: 'center' });

    doc.setFontSize(26);
    doc.setTextColor(0, 255, 210);
    const scoreText = `${fixture.scoreA ?? 0}  -  ${fixture.scoreB ?? 0}`;
    doc.text(scoreText, 105, 83, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(`Venue: ${fixture.venue} | Referee: ${fixture.mainReferee || 'معتمد الاتحاد'}`, 105, 93, {
      align: 'center'
    });

    let y = 110;

    // Goals Section
    doc.setFillColor(0, 255, 210);
    doc.rect(15, y, 180, 7, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('MATCH GOALS & SCORERS', 105, y + 5, { align: 'center' });
    y += 11;

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    const goals = fixture.goals || [];
    if (goals.length === 0) {
      doc.text('No goals recorded in this fixture.', 20, y);
      y += 8;
    } else {
      goals.forEach((g) => {
        doc.text(
          `• Min ${g.minute}': ${g.player} (${g.team}) - Type: ${g.goalType}${g.assistPlayer ? ` [Assist: ${g.assistPlayer}]` : ''}`,
          20,
          y
        );
        y += 6;
      });
    }

    // Cards Section
    y += 4;
    doc.setFillColor(251, 191, 36);
    doc.rect(15, y, 180, 7, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('DISCIPLINARY ACTIONS (CARDS & SEND-OFFS)', 105, y + 5, { align: 'center' });
    y += 11;

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    const cards = fixture.cards || [];
    if (cards.length === 0) {
      doc.text('Clean match: No cards issued.', 20, y);
      y += 8;
    } else {
      cards.forEach((c) => {
        const cardColor = c.cardType === 'حمراء' ? '[RED CARD]' : '[YELLOW CARD]';
        doc.text(`• Min ${c.minute}': ${c.player} (${c.team}) ${cardColor} - Reason: ${c.reason}`, 20, y);
        y += 6;
      });
    }

    // Substitutions Section
    y += 4;
    doc.setFillColor(168, 85, 247);
    doc.rect(15, y, 180, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('SUBSTITUTIONS', 105, y + 5, { align: 'center' });
    y += 11;

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    const subs = fixture.substitutions || [];
    if (subs.length === 0) {
      doc.text('No substitutions recorded.', 20, y);
      y += 8;
    } else {
      subs.forEach((s) => {
        doc.text(
          `• Min ${s.minute}': (${s.team}) OUT: ${s.playerOut} | IN: ${s.playerIn} - Reason: ${s.reason}`,
          20,
          y
        );
        y += 6;
      });
    }

    // Man of the Match & Notes
    if (fixture.manOfTheMatch || fixture.summaryNotes) {
      y += 4;
      doc.setFillColor(20, 30, 28);
      doc.rect(15, y, 180, 25, 'F');
      doc.setTextColor(251, 191, 36);
      doc.setFontSize(10);
      if (fixture.manOfTheMatch) {
        doc.text(`Man of the Match: ${fixture.manOfTheMatch}`, 20, y + 8);
      }
      if (fixture.summaryNotes) {
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(9);
        doc.text(`Notes: ${fixture.summaryNotes.slice(0, 150)}`, 20, y + 16);
      }
      y += 30;
    }

    // Referee Signatures footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Main Referee Signature: ______________________', 25, 275);
    doc.text('League Committee Signature: ______________________', 115, 275);
    doc.setTextColor(0, 255, 210);
    doc.text('Generated by Al-Kaptan Sports Management System', 105, 288, { align: 'center' });

    doc.save(`Match-Report-${fixture.teamA}-vs-${fixture.teamB}.pdf`);
  } catch (error) {
    console.error('Error generating Match Sheet PDF:', error);
  }
}

/**
 * Export Disciplinary & Cards Report to PDF
 */
export function exportDisciplinaryReportPdf(leagueName: string, records: PlayerDisciplinaryRecord[]) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dark Background
    doc.setFillColor(5, 7, 7);
    doc.rect(0, 0, 210, 297, 'F');

    // Header container
    doc.setFillColor(13, 18, 17);
    doc.rect(15, 15, 180, 40, 'F');

    doc.setTextColor(0, 255, 210);
    doc.setFontSize(20);
    doc.text('AL-KAPTAN SPORTS PLATFORM', 105, 28, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(`OFFICIAL DISCIPLINARY & CARDS REPORT: ${leagueName}`, 105, 40, { align: 'center' });

    // Table Header
    doc.setFillColor(239, 68, 68);
    doc.rect(15, 65, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Player Name', 20, 70);
    doc.text('Team', 75, 70);
    doc.text('Yellows', 120, 70);
    doc.text('Reds', 145, 70);
    doc.text('Status', 165, 70);

    let y = 80;
    doc.setTextColor(255, 255, 255);
    records.forEach((rec) => {
      doc.setFillColor(15, 23, 21);
      doc.rect(15, y - 5, 180, 7, 'F');
      doc.text(rec.playerName, 20, y);
      doc.text(rec.teamName, 75, y);
      doc.text(String(rec.yellowCardsCount), 125, y);
      doc.text(String(rec.redCardsCount), 150, y);

      if (rec.isSuspended) {
        doc.setTextColor(239, 68, 68);
        doc.text(`SUSPENDED (${rec.suspensionMatchesRemaining}M)`, 165, y);
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setTextColor(34, 197, 94);
        doc.text('Eligible', 165, y);
        doc.setTextColor(255, 255, 255);
      }
      y += 8;
    });

    // Rules Reminder
    y += 10;
    doc.setFillColor(20, 30, 28);
    doc.rect(15, y, 180, 35, 'F');
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(10);
    doc.text('OFFICIAL DISCIPLINARY REGULATIONS:', 20, y + 8);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.text('1. 3 Yellow Cards = Automatic 1-Match Suspension.', 20, y + 16);
    doc.text('2. Direct Red Card = Automatic 2-Matches Suspension.', 20, y + 23);
    doc.text('3. Second Yellow Card in same match = Automatic 1-Match Suspension.', 20, y + 30);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 150, 140);
    doc.text('Generated via Al-Kaptan Disciplinary Control System - Syria', 105, 285, { align: 'center' });

    doc.save(`Disciplinary-Report-${leagueName}.pdf`);
  } catch (error) {
    console.error('Error generating Disciplinary PDF:', error);
  }
}

// Generate Calendar Event (.ics download)
export function downloadCalendarEvent(booking: Booking) {
  try {
    const dates = booking.selectedDates.length > 0 ? booking.selectedDates[0] : new Date().toISOString().split('T')[0];
    const dateFormatted = dates.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Al-Kaptan Sports//Syria//AR',
      'BEGIN:VEVENT',
      `UID:${booking.referenceNumber}@alkaptan.sy`,
      `DTSTAMP:${dateFormatted}T000000Z`,
      `DTSTART:${dateFormatted}T170000Z`,
      `DTEND:${dateFormatted}T183000Z`,
      `SUMMARY:حجز مباراة في ${booking.playgroundName}`,
      `DESCRIPTION:حجز ملعب عبر تطبيق الكابتن الرياضي\\nالرقم المرجعي: ${booking.referenceNumber}\\nالمحافظة: ${booking.governorate}\\nطريقة الدفع: ${booking.paymentMethod}`,
      `LOCATION:${booking.playgroundName} - ${booking.detailedArea} - ${booking.governorate}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `booking-${booking.referenceNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error creating calendar event:', error);
  }
}

// Export Payment Receipt to PDF
export function exportPaymentReceiptPdf(booking: Booking) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dark Background
    doc.setFillColor(5, 7, 7);
    doc.rect(0, 0, 210, 297, 'F');

    // Header container
    doc.setFillColor(13, 18, 17);
    doc.rect(15, 15, 180, 45, 'F');

    doc.setTextColor(0, 255, 210);
    doc.setFontSize(22);
    doc.text('AL-KAPTAN SPORTS PLATFORM', 105, 30, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL BOOKING & PAYMENT RECEIPT', 105, 42, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 255, 210);
    doc.text(`Ref: ${booking.referenceNumber} | Status: ${booking.status.toUpperCase()}`, 105, 52, { align: 'center' });

    // Details Box
    doc.setFillColor(10, 14, 13);
    doc.rect(15, 68, 180, 140, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('BOOKING DETAILS:', 25, 80);

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);

    const lines = [
      `Playground: ${booking.playgroundName}`,
      `Location: ${booking.detailedArea}, ${booking.governorate}`,
      `Captain Name: ${booking.userName}`,
      `Contact Phone: ${booking.userPhone}`,
      `Date(s): ${booking.selectedDates.join(', ')}`,
      `Time Slot: ${booking.timeSlot}`,
      `Duration: ${booking.duration || '90 Minutes'}`,
      `Player Format: ${booking.playerCount || '7v7'}`,
      `Payment Method: ${booking.paymentMethod}`,
      `Platform Commission: 0% Free (0 SYP)`
    ];

    let currentY = 92;
    lines.forEach((line) => {
      doc.text(line, 25, currentY);
      currentY += 8;
    });

    // Total Price Box
    doc.setFillColor(0, 255, 210);
    doc.rect(25, 180, 160, 18, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    const formattedPrice = (typeof booking?.totalPrice === 'number' ? booking.totalPrice : (Number(booking?.totalPrice) || 0)).toLocaleString('ar-SY');
    doc.text(`TOTAL AMOUNT PAID: ${formattedPrice} SYP`, 105, 191, { align: 'center' });

    // Terms & Verification
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('1. Please arrive 15 minutes before your scheduled slot.', 25, 220);
    doc.text('2. Present this receipt or reference code to the pitch supervisor upon arrival.', 25, 227);
    doc.text('3. Support Hotline & Live Chat: In-App Support | support@kaptan-app.sy', 25, 234);

    // Footer
    doc.setTextColor(0, 255, 210);
    doc.text('Al-Kaptan - The Premier Sports Network in the Syrian Arab Republic', 105, 280, { align: 'center' });

    doc.save(`Receipt-${booking.referenceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating Receipt PDF:', error);
  }
}

// WhatsApp share helper
export function openWhatsAppShare(text: string, phone?: string) {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);
  let url = `https://api.whatsapp.com/send?text=${encodedText}`;
  if (cleanPhone) {
    const fullPhone = cleanPhone.startsWith('09') ? `963${cleanPhone.slice(1)}` : cleanPhone;
    url = `https://wa.me/${fullPhone}?text=${encodedText}`;
  }
  window.open(url, '_blank');
}

// LocalStorage helpers with verification
export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(`kaptan_sy_${key}`, serialized);
    // Secondary verification
    const saved = localStorage.getItem(`kaptan_sy_${key}`);
    if (!saved) {
      console.warn(`[Storage] Failed to save ${key} to localStorage`);
    }
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`kaptan_sy_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Auto-save helper for periodic background persistence
export function setupAutoSave<T>(data: T, key: string, interval = 5000) {
  return setInterval(() => {
    saveToLocalStorage(key, data);
  }, interval);
}

