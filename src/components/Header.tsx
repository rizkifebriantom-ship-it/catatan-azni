import React from 'react';
import { Sparkles, Calendar, PieChart, History, Settings, Plus, FileSpreadsheet } from 'lucide-react';
import mascotImg from '../assets/images/catatyuk_mascot_1785672580598.jpg';
import { formatIndonesianFullDate, getTodayIso, formatRupiah } from '../utils/formatters';

interface HeaderProps {
  activeTab: 'today' | 'history' | 'report' | 'settings';
  setActiveTab: (tab: 'today' | 'history' | 'report' | 'settings') => void;
  todayTotal: number;
  onOpenAddModal: () => void;
  onExportExcel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  todayTotal,
  onOpenAddModal,
  onExportExcel,
}) => {
  const todayIso = getTodayIso();
  const formattedToday = formatIndonesianFullDate(todayIso);

  return (
    <header className="sticky top-0 z-30 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-[#e5e5d1] shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="relative">
              <img
                src={mascotImg}
                alt="CatatYuk Mascot"
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#7d8c77]/80 shadow-xs transform group-hover:scale-105 transition-all duration-200"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7d8c77] ring-2 ring-white text-[9px] text-white font-bold">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-[#5a5a40] font-serif">
                  CatatYuk
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e5e5d1] text-[#5a5a40] border border-[#d1d1bc]">
                  Harian 🐱
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200" title="Semua catatan pengeluaran tersimpan otomatis di browser web kamu">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Auto-Simpan Web
                </span>
              </div>
              <p className="text-xs font-medium text-[#4a4a40]/80 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-[#7d8c77]" />
                {formattedToday}
              </p>
            </div>
          </div>

          {/* Quick Header Stat + Excel + Add Expense Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-white rounded-2xl border border-[#e5e5d1] shadow-xs">
              <span className="text-[10px] font-bold text-[#7d8c77] uppercase tracking-wider">
                Hari Ini
              </span>
              <span className="text-sm font-bold text-[#4a4a40] font-serif">
                {formatRupiah(todayTotal)}
              </span>
            </div>

            {onExportExcel && (
              <button
                id="header-btn-export-excel"
                onClick={onExportExcel}
                title="Download Data ke Excel (.xlsx)"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#7d8c77] hover:bg-[#6c7b66] text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden md:inline">Excel</span>
              </button>
            )}

            <button
              id="header-btn-add-expense"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#5a5a40] hover:bg-[#4a4a30] text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Catat Pengeluaran</span>
              <span className="xs:hidden">+ Catat</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center justify-around sm:justify-center gap-1 sm:gap-2 mt-3 pt-2 border-t border-[#e5e5d1]">
          <button
            id="tab-btn-today"
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-[#5a5a40] text-white shadow-xs font-bold'
                : 'text-[#4a4a40] hover:bg-[#f5f5f0] hover:text-[#5a5a40]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Hari Ini
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#5a5a40] text-white shadow-xs font-bold'
                : 'text-[#4a4a40] hover:bg-[#f5f5f0] hover:text-[#5a5a40]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Riwayat
          </button>

          <button
            id="tab-btn-report"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'report'
                ? 'bg-[#5a5a40] text-white shadow-xs font-bold'
                : 'text-[#4a4a40] hover:bg-[#f5f5f0] hover:text-[#5a5a40]'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Laporan 30 Hari
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#5a5a40] text-white shadow-xs font-bold'
                : 'text-[#4a4a40] hover:bg-[#f5f5f0] hover:text-[#5a5a40]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Pengaturan
          </button>
        </nav>
      </div>
    </header>
  );
};
