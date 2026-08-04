import React, { useState, useMemo } from 'react';
import { Search, Calendar, Filter, Trash2, Edit2, ArrowUpDown, Plus, FileSpreadsheet, FileText } from 'lucide-react';
import { Expense, Category } from '../types';
import { formatRupiah, formatIndonesianFullDate, getRelativeDayLabel } from '../utils/formatters';
import { exportExpensesToExcel } from '../utils/excelExporter';
import { exportExpensesToPdf } from '../utils/pdfExporter';

interface HistoryViewProps {
  expenses: Expense[];
  categories: Category[];
  getCategoryDetails: (catIdOrName: string) => Category;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenAddModal: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  expenses,
  categories,
  getCategoryDetails,
  onEditExpense,
  onDeleteExpense,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest'>('newest');

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catName = getCategoryDetails(exp.category).name.toLowerCase();
        const noteText = (exp.note || '').toLowerCase();
        if (!catName.includes(q) && !noteText.includes(q)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
        return false;
      }

      // Date filter
      if (selectedDateFilter && exp.date !== selectedDateFilter) {
        return false;
      }

      return true;
    });
  }, [expenses, searchQuery, selectedCategory, selectedDateFilter, getCategoryDetails]);

  // Sorted expenses
  const sortedExpenses = useMemo(() => {
    const copy = [...filteredExpenses];
    if (sortOrder === 'oldest') {
      return copy.sort((a, b) => a.date.localeCompare(b.date));
    }
    if (sortOrder === 'highest') {
      return copy.sort((a, b) => b.amount - a.amount);
    }
    // newest default
    return copy.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [filteredExpenses, sortOrder]);

  // Group expenses by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    sortedExpenses.forEach((exp) => {
      if (!groups[exp.date]) {
        groups[exp.date] = [];
      }
      groups[exp.date].push(exp);
    });
    return groups;
  }, [sortedExpenses]);

  // Total amount in current view
  const totalInFilter = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleExportExcel = () => {
    exportExpensesToExcel(filteredExpenses, categories, 'Pengeluaran-Azni.xlsx');
  };

  const handleExportPdf = () => {
    exportExpensesToPdf(filteredExpenses, categories, 'Pengeluaran-Azni.pdf');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-[#f5f5f0] p-6 rounded-[28px] border border-[#e5e5d1] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#5a5a40] font-serif flex items-center gap-2">
            <span>📖</span>
            Riwayat Catatan Pengeluaran
          </h2>
          <p className="text-xs text-[#4a4a40]/80 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Semua transaksi harianmu tersimpan rapi di memori browser dan dapat diunduh ke Excel / PDF.</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Auto-Tersimpan
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-4 py-2 bg-white rounded-2xl border border-[#e5e5d1] text-right">
            <span className="text-[10px] font-bold uppercase text-[#7d8c77] block">
              Total Ditemukan
            </span>
            <span className="text-base font-bold text-[#4a4a40] font-serif">
              {formatRupiah(totalInFilter)}
            </span>
          </div>

          <button
            id="btn-export-pdf-history"
            onClick={handleExportPdf}
            className="px-4 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a30] text-white font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-[#e5e5d1]" />
            Unduh PDF
          </button>

          <button
            id="btn-export-excel-history"
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-[#7d8c77] hover:bg-[#6c7b66] text-white font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Unduh Excel
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a30] text-white font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Tambah
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="bg-[#f5f5f0] p-5 rounded-[28px] border border-[#e5e5d1] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#7d8c77] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari catatan (makan, bensin, kopi...)"
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-[#e5e5d1] bg-white text-xs font-semibold text-[#4a4a40] focus:outline-none focus:ring-2 focus:ring-[#7d8c77]"
            />
          </div>

          {/* Date Picker Filter */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-[#7d8c77] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-[#e5e5d1] bg-white text-xs font-semibold text-[#4a4a40] focus:outline-none focus:ring-2 focus:ring-[#7d8c77]"
            />
          </div>

          {/* Sort Order */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-[#7d8c77] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-[#e5e5d1] bg-white text-xs font-semibold text-[#4a4a40] focus:outline-none focus:ring-2 focus:ring-[#7d8c77] cursor-pointer"
            >
              <option value="newest">Terbaru Dulu</option>
              <option value="oldest">Terlama Dulu</option>
              <option value="highest">Nominal Terbesar</option>
            </select>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-[11px] font-bold text-[#5a5a40] flex items-center gap-1 shrink-0 mr-1 font-serif">
            <Filter className="w-3.5 h-3.5 text-[#7d8c77]" />
            Kategori:
          </span>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#5a5a40] text-white shadow-2xs'
                : 'bg-white text-[#4a4a40] border border-[#e5e5d1] hover:bg-[#e5e5d1]/50'
            }`}
          >
            Semua ({expenses.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#5a5a40] text-white shadow-2xs'
                  : 'bg-white text-[#4a4a40] border border-[#e5e5d1] hover:bg-[#e5e5d1]/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}

          {(selectedCategory !== 'all' || selectedDateFilter || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDateFilter('');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-rose-700 underline px-2 shrink-0 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* History Items Grouped By Date */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[32px] border border-dashed border-[#e5e5d1] space-y-3">
          <div className="text-4xl">🔍</div>
          <p className="text-sm font-bold text-[#5a5a40] font-serif">
            Tidak ada riwayat pengeluaran yang cocok dengan pencarian.
          </p>
          <p className="text-xs text-[#4a4a40]/70 max-w-xs mx-auto">
            Coba ubah kata kunci pencarian atau reset filter tanggal untuk melihat transaksi lainnya.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedByDate) as [string, Expense[]][]).map(([dateIso, dateExpenses]) => {
            const dayTotal = dateExpenses.reduce((sum, e) => sum + e.amount, 0);
            const fullFormatted = formatIndonesianFullDate(dateIso);
            const relativeDay = getRelativeDayLabel(dateIso);

            return (
              <div
                key={dateIso}
                className="bg-white rounded-[32px] border border-[#e5e5d1] p-5 sm:p-6 shadow-xs space-y-4"
              >
                {/* Date Header Row */}
                <div className="flex items-center justify-between pb-3 border-b border-[#e5e5d1]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full bg-[#7d8c77] text-white font-bold text-xs">
                      {relativeDay}
                    </span>
                    <span className="text-xs font-bold text-[#5a5a40]">
                      {fullFormatted}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-[#4a4a40] font-serif">
                    Total: {formatRupiah(dayTotal)}
                  </div>
                </div>

                {/* Date Expenses List */}
                <div className="space-y-3">
                  {dateExpenses.map((expense) => {
                    const catDetails = getCategoryDetails(expense.category);
                    return (
                      <div
                        key={expense.id}
                        className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#e5e5d1] border-l-4 border-l-[#7d8c77] hover:bg-[#f5f5f0] transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#e5e5d1] text-[#5a5a40] flex items-center justify-center text-lg shrink-0">
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
                              {expense.note ? catDetails.name : 'Pengeluaran harian'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-bold text-[#4a4a40] font-serif">
                            {formatRupiah(expense.amount)}
                          </span>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditExpense(expense)}
                              title="Edit"
                              className="p-1.5 rounded-lg text-[#5a5a40] hover:bg-[#e5e5d1] transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteExpense(expense.id)}
                              title="Hapus"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
