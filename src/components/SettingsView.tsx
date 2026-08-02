import React, { useState } from 'react';
import { Target, RotateCcw, Download, Upload, Trash2, Plus, Check, ShieldAlert, FileSpreadsheet, FileText } from 'lucide-react';
import { Category, UserBudgetConfig, Expense } from '../types';
import { formatRupiah } from '../utils/formatters';
import { exportExpensesToExcel } from '../utils/excelExporter';
import { exportExpensesToPdf } from '../utils/pdfExporter';

interface SettingsViewProps {
  budgetConfig: UserBudgetConfig;
  setBudgetConfig: React.Dispatch<React.SetStateAction<UserBudgetConfig>>;
  categories: Category[];
  onAddCustomCategory: (name: string, icon: string) => string;
  onResetSampleData: () => void;
  onClearAllExpenses: () => void;
  expensesCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  budgetConfig,
  setBudgetConfig,
  categories,
  onAddCustomCategory,
  onResetSampleData,
  onClearAllExpenses,
  expensesCount,
}) => {
  const [dailyLimitInput, setDailyLimitInput] = useState<string>(
    budgetConfig.dailyLimit ? budgetConfig.dailyLimit.toString() : '100000'
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Custom Category State
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🎁');

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(dailyLimitInput.replace(/[^0-9]/g, '')) || 0;
    setBudgetConfig((prev) => ({
      ...prev,
      dailyLimit: val,
    }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    onAddCustomCategory(catName.trim(), catIcon.trim() || '🏷️');
    setCatName('');
    alert(`Kategori "${catName.trim()}" berhasil ditambahkan!`);
  };

  // Export Excel file
  const handleExportExcel = () => {
    try {
      const savedExpensesStr = localStorage.getItem('catatyuk_expenses_v1') || '[]';
      const expenses: Expense[] = JSON.parse(savedExpensesStr);
      exportExpensesToExcel(expenses, categories, 'Pengeluaran-Azni.xlsx');
    } catch (e) {
      alert('Gagal mengekspor data ke Excel.');
    }
  };

  // Export PDF file
  const handleExportPdf = () => {
    try {
      const savedExpensesStr = localStorage.getItem('catatyuk_expenses_v1') || '[]';
      const expenses: Expense[] = JSON.parse(savedExpensesStr);
      exportExpensesToPdf(expenses, categories, 'Pengeluaran-Azni.pdf');
    } catch (e) {
      alert('Gagal mengekspor data ke PDF.');
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    try {
      const savedExpenses = localStorage.getItem('catatyuk_expenses_v1') || '[]';
      const blob = new Blob([savedExpenses], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CatatYuk-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Gagal mengekspor data.');
    }
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          localStorage.setItem('catatyuk_expenses_v1', JSON.stringify(parsed));
          window.location.reload();
        } else {
          alert('Format file JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-[#f5f5f0] p-6 rounded-[28px] border border-[#e5e5d1]">
        <h2 className="text-xl font-bold text-[#5a5a40] font-serif flex items-center gap-2">
          <span>⚙️</span>
          Pengaturan Aplikasi
        </h2>
        <p className="text-xs text-[#4a4a40]/80 mt-1">
          Atur batas target pengeluaran harian, tambah kategori khusus, dan unduh data ke Excel.
        </p>
      </div>

      {/* 1. Daily Target Limit Form */}
      <div className="bg-white p-6 rounded-[32px] border border-[#e5e5d1] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#7d8c77]" />
          <h3 className="text-base font-bold text-[#5a5a40] font-serif">
            Target Batas Pengeluaran Harian
          </h3>
        </div>

        <p className="text-xs text-[#4a4a40]/80">
          CatatYuk akan memberitahu status warna jika pengeluaran harianmu sudah mendekati atau melebihi angka ini.
        </p>

        <form onSubmit={handleSaveBudget} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#7d8c77] text-sm font-serif">
                Rp
              </span>
              <input
                type="number"
                value={dailyLimitInput}
                onChange={(e) => setDailyLimitInput(e.target.value)}
                placeholder="100000"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-[#e5e5d1] font-bold text-[#4a4a40] text-base focus:ring-2 focus:ring-[#7d8c77] font-serif"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a30] text-white font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {isSaved ? <Check className="w-4 h-4" /> : null}
              {isSaved ? 'Tersimpan!' : 'Simpan Target'}
            </button>
          </div>

          <p className="text-[11px] font-semibold text-[#7d8c77]">
            Target saat ini: {formatRupiah(budgetConfig.dailyLimit || 0)} / hari
          </p>
        </form>
      </div>

      {/* 2. Custom Category Manager */}
      <div className="bg-white p-6 rounded-[32px] border border-[#e5e5d1] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#5a5a40] font-serif flex items-center gap-2">
          <span>🏷️</span>
          Tambah Kategori Khusus Baru
        </h3>

        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            value={catIcon}
            onChange={(e) => setCatIcon(e.target.value)}
            placeholder="Emoji 🎁"
            className="w-16 px-2 py-2 rounded-2xl border border-[#e5e5d1] text-center text-base"
            maxLength={3}
          />
          <input
            type="text"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Nama Kategori (misal: Sedekah, Skincare, Zakat)"
            className="flex-1 px-3 py-2 rounded-2xl border border-[#e5e5d1] text-xs text-[#4a4a40] font-semibold"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#5a5a40] text-white font-bold text-xs rounded-2xl hover:bg-[#4a4a30] cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-[#e5e5d1] text-[#5a5a40]"
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. Backup & Data Management */}
      <div className="bg-white p-6 rounded-[32px] border border-[#e5e5d1] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#5a5a40] font-serif flex items-center gap-2">
          <span>💾</span>
          Cadangkan & Kelola Data
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Export PDF */}
          <button
            id="btn-export-pdf-settings"
            onClick={handleExportPdf}
            className="p-4 rounded-2xl bg-[#f5f5f0] hover:bg-[#e5e5d1]/50 border border-[#e5e5d1] text-left transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center gap-2 font-bold text-[#5a5a40] text-xs">
              <FileText className="w-4 h-4 text-[#7d8c77]" />
              Download PDF (.pdf)
            </div>
            <p className="text-[11px] text-[#4a4a40]/70">
              Cetak laporan rapi "Pengeluaran Azni" dengan garis tipis.
            </p>
          </button>

          {/* Export Excel */}
          <button
            id="btn-export-excel-settings"
            onClick={handleExportExcel}
            className="p-4 rounded-2xl bg-[#f5f5f0] hover:bg-[#e5e5d1]/50 border border-[#e5e5d1] text-left transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center gap-2 font-bold text-[#5a5a40] text-xs">
              <FileSpreadsheet className="w-4 h-4 text-[#7d8c77]" />
              Download Excel (.xlsx)
            </div>
            <p className="text-[11px] text-[#4a4a40]/70">
              Unduh seluruh {expensesCount} catatan ke spreadsheet Excel.
            </p>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="p-4 rounded-2xl bg-[#f5f5f0] hover:bg-[#e5e5d1]/50 border border-[#e5e5d1] text-left transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center gap-2 font-bold text-[#5a5a40] text-xs">
              <Download className="w-4 h-4 text-[#7d8c77]" />
              Backup JSON
            </div>
            <p className="text-[11px] text-[#4a4a40]/70">
              Ekspor seluruh data dalam format JSON untuk cadangan aman.
            </p>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-2xl bg-[#f5f5f0] hover:bg-[#e5e5d1]/50 border border-[#e5e5d1] text-left transition-all cursor-pointer space-y-1 block">
            <div className="flex items-center gap-2 font-bold text-[#5a5a40] text-xs">
              <Upload className="w-4 h-4 text-[#7d8c77]" />
              Restore JSON
            </div>
            <p className="text-[11px] text-[#4a4a40]/70">
              Pulihkan catatan pengeluaran dari file backup JSON.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>

        {/* Danger zone: Reset & Clear */}
        <div className="pt-4 border-t border-[#e5e5d1] space-y-3">
          <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Area Riset Data
          </span>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => {
                if (confirm('Atur ulang ke data contoh awal?')) {
                  onResetSampleData();
                }
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#f5f5f0] text-[#5a5a40] font-bold text-xs hover:bg-[#e5e5d1] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Isi Data Contoh Awal
            </button>

            <button
              onClick={() => {
                if (confirm('Yakin ingin menghapus SELURUH catatan pengeluaran? Data tidak dapat dikembalikan.')) {
                  onClearAllExpenses();
                }
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-100 text-rose-800 font-bold text-xs hover:bg-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Seluruh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
