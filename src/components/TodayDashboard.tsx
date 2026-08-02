import React from 'react';
import { Plus, Trash2, Edit2, TrendingUp, Award, Layers, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Expense, Category, UserBudgetConfig } from '../types';
import { DEFAULT_PRESETS } from '../constants/categories';
import { formatRupiah, formatIndonesianFullDate, getTodayIso } from '../utils/formatters';
import mascotImg from '../assets/images/catatyuk_mascot_1785672580598.jpg';

interface TodayDashboardProps {
  todayExpenses: Expense[];
  todayTotal: number;
  todayTopExpense: Expense | null;
  todayMostUsedCategory: Category | null;
  budgetConfig: UserBudgetConfig;
  getCategoryDetails: (catIdOrName: string) => Category;
  onOpenAddModal: (prefill?: Partial<Expense>) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onNavigateToHistory: () => void;
  onNavigateToReport: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  todayExpenses,
  todayTotal,
  todayTopExpense,
  todayMostUsedCategory,
  budgetConfig,
  getCategoryDetails,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
  onNavigateToHistory,
  onNavigateToReport,
}) => {
  const todayIso = getTodayIso();
  const formattedToday = formatIndonesianFullDate(todayIso);

  // Daily budget percentage
  const dailyLimit = budgetConfig.dailyLimit || 100000;
  const budgetPercent = Math.min(Math.round((todayTotal / dailyLimit) * 100), 100);

  const getBudgetStatus = () => {
    if (todayTotal === 0) {
      return {
        message: 'Belum ada pengeluaran hari ini. Dompetmu masih utuh! 💚',
        color: 'text-[#5a5a40] bg-[#f5f5f0] border-[#e5e5d1]',
        barColor: 'bg-[#7d8c77]',
        icon: <CheckCircle2 className="w-4 h-4 text-[#7d8c77]" />,
      };
    }
    if (todayTotal <= dailyLimit * 0.7) {
      return {
        message: 'Pengeluaran masih dalam batas aman! Hemat terus ya 😊',
        color: 'text-[#5a5a40] bg-[#f5f5f0] border-[#e5e5d1]',
        barColor: 'bg-[#7d8c77]',
        icon: <CheckCircle2 className="w-4 h-4 text-[#7d8c77]" />,
      };
    }
    if (todayTotal <= dailyLimit) {
      return {
        message: 'Mendekati batas target harian. Tetap bijak jajannya! 💛',
        color: 'text-amber-900 bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500',
        icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
      };
    }
    return {
      message: 'Melebihi target harian. Yuk rem dikit jajan hari ini! 🔴',
      color: 'text-rose-900 bg-rose-50 border-rose-200',
      barColor: 'bg-rose-500',
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
    };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="space-y-6">
      {/* Date Header & Friendly Greeting */}
      <div className="bg-[#f5f5f0] p-5 rounded-[28px] border border-[#e5e5d1] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <img
            src={mascotImg}
            alt="CatatYuk Buddy"
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#7d8c77]/80 shadow-xs shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="text-xs font-bold text-[#7d8c77] tracking-wider uppercase">
              {formattedToday}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#5a5a40] font-serif flex items-center gap-1.5 justify-center sm:justify-start">
              Yuk catat pengeluaranmu hari ini 😊
            </h2>
            <p className="text-xs text-[#4a4a40]/80 mt-0.5">
              Catat setiap pengeluaran kecil agar dompetmu tetap terkontrol.
            </p>
          </div>
        </div>

        {/* Big Prominent Action Button */}
        <button
          id="btn-catat-pengeluaran-hero"
          onClick={() => onOpenAddModal()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#5a5a40] hover:bg-[#4a4a30] text-white font-bold text-base shadow-xs active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          + Catat Pengeluaran
        </button>
      </div>

      {/* Main Today Spending Card (Sage Green #7d8c77 in Natural Tones theme) */}
      <div className="relative overflow-hidden bg-[#7d8c77] text-white p-7 rounded-[32px] shadow-sm">
        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-white/80 font-semibold">
              Total Hari Ini
            </span>
            <span className="text-xs font-medium text-white/90 bg-white/15 px-3 py-1 rounded-full border border-white/20">
              {todayExpenses.length} Transaksi
            </span>
          </div>

          <div>
            <div className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              {formatRupiah(todayTotal)}
            </div>
            <p className="text-xs text-white/80 mt-1">
              Total pengeluaran yang telah dicatat hari ini
            </p>
          </div>

          {/* Budget Limit Tracker */}
          <div className="border-t border-white/20 pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-white/90">
              <span>Target Limit Harian: {formatRupiah(dailyLimit)}</span>
              <span className="font-bold">{budgetPercent}% Terpakai</span>
            </div>
            <div className="w-full h-2 bg-black/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
      </div>

      {/* Underneath Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Jumlah Transaksi */}
        <div className="bg-white p-5 rounded-[24px] border border-[#e5e5d1] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f5f5f0] flex items-center justify-center text-[#5a5a40] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#7d8c77] uppercase tracking-wider">
              Jumlah Transaksi
            </span>
            <div className="text-base font-bold text-[#4a4a40] font-serif">
              {todayExpenses.length} Transaksi
            </div>
          </div>
        </div>

        {/* 2. Pengeluaran Terbesar */}
        <div className="bg-white p-5 rounded-[24px] border border-[#e5e5d1] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f5f5f0] flex items-center justify-center text-[#5a5a40] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-[#7d8c77] uppercase tracking-wider">
              Terbesar
            </span>
            {todayTopExpense ? (
              <div className="text-sm font-bold text-[#4a4a40] truncate font-serif">
                {getCategoryDetails(todayTopExpense.category).icon}{' '}
                {todayTopExpense.note || getCategoryDetails(todayTopExpense.category).name} (
                {formatRupiah(todayTopExpense.amount)})
              </div>
            ) : (
              <div className="text-xs text-[#4a4a40]/60 font-medium">Belum ada</div>
            )}
          </div>
        </div>

        {/* 3. Kategori Paling Banyak */}
        <div className="bg-white p-5 rounded-[24px] border border-[#e5e5d1] shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f5f5f0] flex items-center justify-center text-[#5a5a40] shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-[#7d8c77] uppercase tracking-wider">
              Dominan
            </span>
            {todayMostUsedCategory ? (
              <div className="text-sm font-bold text-[#4a4a40] truncate font-serif">
                {todayMostUsedCategory.icon} {todayMostUsedCategory.name}
              </div>
            ) : (
              <div className="text-xs text-[#4a4a40]/60 font-medium">Belum ada</div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Status Banner */}
      <div className={`p-4 rounded-2xl border ${budgetStatus.color} flex items-center gap-2.5 text-xs font-semibold`}>
        {budgetStatus.icon}
        <span>{budgetStatus.message}</span>
      </div>

      {/* Quick 1-Tap Presets Bar */}
      <div className="bg-[#f5f5f0] p-5 rounded-[28px] border border-[#e5e5d1] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#5a5a40] flex items-center gap-1.5 font-serif">
            <Zap className="w-4 h-4 text-[#7d8c77]" />
            Catat Cepat 1-Tap
          </span>
          <span className="text-[11px] text-[#4a4a40]/70 font-medium">Tap untuk langsung pilih</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DEFAULT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                onOpenAddModal({
                  category: preset.category,
                  amount: preset.amount,
                  note: preset.label.replace(/^[\p{Emoji}\s]+/u, ''),
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#e5e5d1] text-xs font-bold text-[#4a4a40] shadow-2xs hover:bg-[#e5e5d1]/50 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
              <span className="text-[11px] font-normal text-[#7d8c77]">
                ({formatRupiah(preset.amount)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Transactions List */}
      <div className="bg-white rounded-[32px] border border-[#e5e5d1] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#5a5a40] font-serif">
              Rincian Hari Ini
            </h3>
            <p className="text-xs text-[#4a4a40]/70">
              Transaksi pada {formattedToday}
            </p>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs font-bold text-[#7d8c77] hover:underline cursor-pointer"
          >
            Lihat Semua →
          </button>
        </div>

        {todayExpenses.length === 0 ? (
          <div className="text-center py-10 px-4 bg-[#fdfbf7] rounded-2xl border border-dashed border-[#e5e5d1] space-y-3">
            <div className="text-4xl">🍃</div>
            <p className="text-sm font-bold text-[#5a5a40] font-serif">
              Belum ada pengeluaran dicatat hari ini!
            </p>
            <p className="text-xs text-[#4a4a40]/80 max-w-xs mx-auto">
              Klik tombol di bawah setiap kali kamu jajan, makan, minum kopi, atau bayar transaksi.
            </p>
            <button
              onClick={() => onOpenAddModal()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#5a5a40] text-white font-bold text-xs shadow-xs hover:bg-[#4a4a30] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Catat Pengeluaran Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayExpenses.map((expense) => {
              const catDetails = getCategoryDetails(expense.category);
              return (
                <div
                  key={expense.id}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-[#fdfbf7] border border-[#e5e5d1] border-l-4 border-l-[#7d8c77] hover:bg-[#f5f5f0] transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#e5e5d1] text-[#5a5a40] flex items-center justify-center text-xl shrink-0">
                      {catDetails.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#4a4a40] truncate">
                          {expense.note || catDetails.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e5e5d1] text-[#5a5a40]">
                          {catDetails.name}
                        </span>
                      </div>
                      <p className="text-xs text-[#4a4a40]/60 truncate mt-0.5">
                        {expense.time || '12:00'} • {expense.note ? catDetails.name : 'Pengeluaran harian'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base font-bold text-[#4a4a40] font-serif">
                      {formatRupiah(expense.amount)}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditExpense(expense)}
                        title="Edit pengeluaran"
                        className="p-1.5 rounded-lg text-[#5a5a40] hover:bg-[#e5e5d1] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        title="Hapus pengeluaran"
                        className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 30-Day Auto Report Teaser */}
      <div className="bg-[#5a5a40] text-white p-6 rounded-[32px] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
            📊
          </div>
          <div>
            <h4 className="text-base font-bold font-serif text-white">
              Laporan & Kesimpulan Otomatis 30 Hari
            </h4>
            <p className="text-xs text-white/80 mt-0.5">
              Lihat grafik tren, persentase kategori, dan kesimpulan hemathu secara otomatis.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToReport}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#7d8c77] hover:bg-[#6c7b66] font-bold text-xs text-white transition-all cursor-pointer shrink-0 text-center"
        >
          Buka Laporan 30 Hari →
        </button>
      </div>
    </div>
  );
};
