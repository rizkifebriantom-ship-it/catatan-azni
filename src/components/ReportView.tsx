import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  TrendingUp,
  Calendar,
  AlertCircle,
  Lightbulb,
  Loader2,
  RefreshCw,
  Award,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Expense, Category, CategorySummary } from '../types';
import { formatRupiah, formatCompactRupiah, formatShortDate, getPastDateIso } from '../utils/formatters';
import { exportExpensesToExcel } from '../utils/excelExporter';
import { exportExpensesToPdf } from '../utils/pdfExporter';
import mascotImg from '../assets/images/catatyuk_mascot_1785672580598.jpg';

interface ReportViewProps {
  expenses: Expense[];
  getCategoryBreakdown: (days: number) => CategorySummary[];
  getCategoryDetails: (catIdOrName: string) => Category;
}

const NATURAL_COLORS = [
  '#5a5a40', // dark olive
  '#7d8c77', // sage green
  '#9d8c70', // warm taupe
  '#b8a88a', // beige gold
  '#7a8288', // slate gray
  '#8a705a', // terracotta wood
  '#5c7a6e', // eucalyptus
  '#7d7d5a', // olive leaf
  '#a39b85', // warm stone
  '#6b7861', // deep forest sage
];

export const ReportView: React.FC<ReportViewProps> = ({
  expenses,
  getCategoryBreakdown,
  getCategoryDetails,
}) => {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Period breakdown
  const categoryBreakdown = getCategoryBreakdown(periodDays);
  const startDateIso = getPastDateIso(periodDays - 1);
  const periodExpenses = expenses.filter((e) => e.date >= startDateIso);

  const totalSpentInPeriod = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyAverage = periodDays > 0 ? Math.round(totalSpentInPeriod / periodDays) : 0;
  const topExpense = periodExpenses.length > 0 ? [...periodExpenses].sort((a, b) => b.amount - a.amount)[0] : null;

  // Daily trend data for bar chart
  const dailyTrendData = React.useMemo(() => {
    const map: Record<string, number> = {};

    // Initialize last periodDays dates with 0
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = getPastDateIso(i);
      map[d] = 0;
    }

    periodExpenses.forEach((exp) => {
      if (map[exp.date] !== undefined) {
        map[exp.date] += exp.amount;
      }
    });

    return Object.entries(map).map(([dateIso, amount]) => ({
      dateIso,
      label: formatShortDate(dateIso),
      amount,
    }));
  }, [periodExpenses, periodDays]);

  // Request AI Analysis from backend Express server
  const fetchAiAnalysis = async () => {
    setIsLoadingAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalExpenses: totalSpentInPeriod,
          transactionCount: periodExpenses.length,
          categoryBreakdown,
          topExpense,
          periodDays,
          dailyAverage,
        }),
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Gagal menerima analisis AI');
      }
    } catch (err: any) {
      console.error('Error fetching AI analysis:', err);
      setAiError('Gagal menghubungkan ke CatatYuk AI Buddy. Pastikan server aktif dan coba lagi ya!');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleExportExcel = () => {
    // Collect all categories
    const categoriesList = categoryBreakdown.map((c) => getCategoryDetails(c.category));
    exportExpensesToExcel(periodExpenses, categoriesList, 'Pengeluaran-Azni.xlsx');
  };

  const handleExportPdf = () => {
    const categoriesList = categoryBreakdown.map((c) => getCategoryDetails(c.category));
    exportExpensesToPdf(periodExpenses, categoriesList, 'Pengeluaran-Azni.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Header & Period Switcher */}
      <div className="bg-[#f5f5f0] p-6 rounded-[28px] border border-[#e5e5d1] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-bold text-[#5a5a40] font-serif">
              Laporan & Kesimpulan 30 Hari
            </h2>
          </div>
          <p className="text-xs text-[#4a4a40]/80 mt-1">
            Analisis otomatis pengeluaran harianmu untuk mengevaluasi keuangan secara simpel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export PDF Button */}
          <button
            id="btn-export-pdf-report"
            onClick={handleExportPdf}
            className="px-4 py-2 bg-[#5a5a40] hover:bg-[#4a4a30] text-white font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <FileText className="w-4 h-4 text-[#e5e5d1]" />
            Unduh PDF
          </button>

          {/* Export Excel Button */}
          <button
            id="btn-export-excel-report"
            onClick={handleExportExcel}
            className="px-4 py-2 bg-[#7d8c77] hover:bg-[#6c7b66] text-white font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Unduh Excel
          </button>

          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#e5e5d1] shrink-0">
            <button
              onClick={() => setPeriodDays(7)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodDays === 7 ? 'bg-[#5a5a40] text-white shadow-2xs' : 'text-[#4a4a40] hover:bg-[#f5f5f0]'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setPeriodDays(30)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodDays === 30 ? 'bg-[#5a5a40] text-white shadow-2xs' : 'text-[#4a4a40] hover:bg-[#f5f5f0]'
              }`}
            >
              30 Hari
            </button>
            <button
              onClick={() => setPeriodDays(60)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodDays === 60 ? 'bg-[#5a5a40] text-white shadow-2xs' : 'text-[#4a4a40] hover:bg-[#f5f5f0]'
              }`}
            >
              60 Hari
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Spent */}
        <div className="bg-[#7d8c77] text-white p-6 rounded-[28px] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
            Total Pengeluaran ({periodDays} Hari)
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif">
            {formatRupiah(totalSpentInPeriod)}
          </div>
          <p className="text-xs text-white/80 font-medium">
            Dari {periodExpenses.length} total transaksi
          </p>
        </div>

        {/* Daily Average */}
        <div className="bg-white p-6 rounded-[28px] border border-[#e5e5d1] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#7d8c77] uppercase tracking-wider">
            Rata-rata Per Hari
          </span>
          <div className="text-2xl font-bold text-[#4a4a40] font-serif">
            {formatRupiah(dailyAverage)}
          </div>
          <p className="text-xs text-[#4a4a40]/70">
            Estimasi pengeluaran rata-rata harian
          </p>
        </div>

        {/* Highest Expense */}
        <div className="bg-white p-6 rounded-[28px] border border-[#e5e5d1] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#7d8c77] uppercase tracking-wider">
            Pengeluaran Terbesar
          </span>
          {topExpense ? (
            <div>
              <div className="text-base font-bold text-[#4a4a40] truncate font-serif">
                {getCategoryDetails(topExpense.category).icon}{' '}
                {topExpense.note || getCategoryDetails(topExpense.category).name}
              </div>
              <p className="text-xs font-bold text-[#7d8c77] font-serif mt-0.5">
                {formatRupiah(topExpense.amount)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#4a4a40]/60 font-medium pt-1">Belum ada transaksi</p>
          )}
        </div>
      </div>

      {/* AI Buddy 30-Day Analysis Section */}
      <div className="bg-[#f5f5f0] p-6 rounded-[32px] border border-[#e5e5d1] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={mascotImg}
              alt="CatatYuk AI Buddy"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#7d8c77] shadow-2xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#5a5a40] font-serif">
                  CatatYuk AI Buddy Analysis 🐱✨
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e5e5d1] text-[#5a5a40]">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-[#4a4a40]/80 mt-0.5">
                Dapatkan kesimpulan ramah dan tips hemat otomatis dari AI untuk {periodDays} hari terakhir.
              </p>
            </div>
          </div>

          <button
            id="btn-get-ai-analysis"
            onClick={fetchAiAnalysis}
            disabled={isLoadingAi}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#5a5a40] hover:bg-[#4a4a30] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menganalisis Data...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {aiAnalysis ? 'Perbarui Analisis AI' : 'Hasilkan Kesimpulan AI'}
              </>
            )}
          </button>
        </div>

        {/* AI Analysis Result Display */}
        {aiError && (
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{aiError}</span>
          </div>
        )}

        {aiAnalysis ? (
          <div className="bg-white p-5 rounded-2xl border border-[#e5e5d1] text-[#4a4a40] text-xs sm:text-sm leading-relaxed space-y-3 font-medium whitespace-pre-line shadow-2xs">
            {aiAnalysis}
          </div>
        ) : (
          !isLoadingAi && (
            <div className="bg-white p-4 rounded-2xl border border-dashed border-[#e5e5d1] text-center text-xs text-[#5a5a40] space-y-1">
              <p className="font-bold font-serif">✨ Klik tombol di atas untuk melihat kesimpulan otomatis dari AI!</p>
              <p className="text-[11px] text-[#4a4a40]/70">
                AI akan menganalisis pola pengeluaranmu, kategori terbanyak, dan saran hemat secara otomatis.
              </p>
            </div>
          )
        )}
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Category Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-[32px] border border-[#e5e5d1] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#5a5a40] font-serif flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-[#7d8c77]" />
              Persentase Kategori Pengeluaran
            </h3>
            <span className="text-xs font-semibold text-[#7d8c77] bg-[#f5f5f0] px-3 py-1 rounded-full border border-[#e5e5d1]">
              {categoryBreakdown.length} Kategori
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#4a4a40]/70 font-medium">
              Belum ada data pengeluaran dalam {periodDays} hari terakhir.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="total"
                      nameKey="category"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={NATURAL_COLORS[index % NATURAL_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatRupiah(Number(value)), 'Total']}
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid #e5e5d1',
                        backgroundColor: '#fdfbf7',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#4a4a40',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown Progress Bars */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#4a4a40]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: NATURAL_COLORS[idx % NATURAL_COLORS.length] }}
                        />
                        <span>
                          {cat.icon} {cat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#5a5a40]">{formatRupiah(cat.total)}</span>
                        <span className="text-[11px] font-bold text-[#5a5a40] bg-[#e5e5d1] px-2 py-0.5 rounded-md">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[#f5f5f0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: NATURAL_COLORS[idx % NATURAL_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Daily Spending Trend Bar Chart */}
        <div className="bg-white p-6 rounded-[32px] border border-[#e5e5d1] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#5a5a40] font-serif flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#7d8c77]" />
              Tren Pengeluaran Harian
            </h3>
            <span className="text-xs font-semibold text-[#7d8c77] bg-[#f5f5f0] px-3 py-1 rounded-full border border-[#e5e5d1]">
              {periodDays} Hari Terakhir
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#5a5a40' }}
                  interval={periodDays > 14 ? 3 : 0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#5a5a40' }}
                  tickFormatter={(val) => formatCompactRupiah(val)}
                />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), 'Pengeluaran']}
                  labelFormatter={(label) => `Tanggal: ${label}`}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #e5e5d1',
                    backgroundColor: '#fdfbf7',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#4a4a40',
                  }}
                />
                <Bar dataKey="amount" fill="#7d8c77" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-[#4a4a40]/70 text-center">
            *Tinggi grafik menunjukkan total pengeluaranmu pada setiap tanggal.
          </p>
        </div>
      </div>
    </div>
  );
};
