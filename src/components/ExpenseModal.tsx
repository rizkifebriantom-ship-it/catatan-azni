import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Check, Sparkles } from 'lucide-react';
import { Expense, Category } from '../types';
import { QUICK_NOMINALS } from '../constants/categories';
import { getTodayIso, formatRupiah } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt'>) => void;
  categories: Category[];
  editingExpense?: Expense | null;
  onAddCustomCategory: (name: string, icon: string) => string;
  prefill?: Partial<Expense>;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingExpense,
  onAddCustomCategory,
  prefill,
}) => {
  const [date, setDate] = useState<string>(getTodayIso());
  const [category, setCategory] = useState<string>('makan');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // State for inline add custom category
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatIcon, setNewCatIcon] = useState<string>('🏷️');

  useEffect(() => {
    if (editingExpense) {
      setDate(editingExpense.date || getTodayIso());
      setCategory(editingExpense.category || 'makan');
      setAmount(editingExpense.amount ? editingExpense.amount.toString() : '');
      setNote(editingExpense.note || '');
    } else if (prefill) {
      setDate(prefill.date || getTodayIso());
      setCategory(prefill.category || 'makan');
      setAmount(prefill.amount ? prefill.amount.toString() : '');
      setNote(prefill.note || '');
    } else {
      setDate(getTodayIso());
      setCategory('makan');
      setAmount('');
      setNote('');
    }
  }, [editingExpense, prefill, isOpen]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;

  const handleQuickAddNominal = (valueToAdd: number) => {
    setAmount((prev) => {
      const current = parseFloat(prev.replace(/[^0-9]/g, '')) || 0;
      return (current + valueToAdd).toString();
    });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catId = onAddCustomCategory(newCatName.trim(), newCatIcon.trim() || '🏷️');
    setCategory(catId);
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      alert('Silakan masukkan nominal pengeluaran lebih dari 0 ya!');
      return;
    }

    onSave({
      date: date || getTodayIso(),
      category: category || 'makan',
      amount: numericAmount,
      note: note.trim(),
    });

    // Fire cute confetti on save
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#5a5a40', '#7d8c77', '#9d8c70', '#e5e5d1'],
      });
    } catch (e) {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-[#fdfbf7] rounded-[32px] max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#e5e5d1] shadow-2xl p-6 sm:p-7 space-y-5 scrollbar-thin">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <h3 className="text-lg font-bold text-[#5a5a40] font-serif">
              {editingExpense ? 'Edit Catatan Pengeluaran' : 'Tambah Pengeluaran Hari Ini'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#5a5a40] hover:bg-[#e5e5d1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Date Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5a5a40] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#7d8c77]" />
              Tanggal Pengeluaran
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e5e5d1] bg-white text-[#4a4a40] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7d8c77]"
                required
              />
            </div>
            <p className="text-[11px] text-[#4a4a40]/70">
              *Otomatis tanggal hari ini. Kamu bisa pilih tanggal kemarin jika terlupa.
            </p>
          </div>

          {/* 2. Amount Input & Quick Nominal Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5a5a40] flex items-center justify-between">
              <span>Nominal Pengeluaran (Rp)</span>
              <span className="text-[#7d8c77] font-bold text-sm font-serif">
                {formatRupiah(numericAmount)}
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#7d8c77] font-serif">
                Rp
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-[#e5e5d1] bg-white text-[#4a4a40] text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#7d8c77] font-serif shadow-2xs"
                min="1"
                required
                autoFocus
              />
            </div>

            {/* Quick Nominal Tap Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-[#4a4a40]/80 font-medium mr-1">Tambah Cepat:</span>
              {QUICK_NOMINALS.map((nom) => (
                <button
                  type="button"
                  key={nom}
                  onClick={() => handleQuickAddNominal(nom)}
                  className="px-2.5 py-1 rounded-xl bg-[#f5f5f0] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs border border-[#e5e5d1] transition-all cursor-pointer"
                >
                  +{nom >= 1000 ? `${nom / 1000}k` : nom}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 rounded-xl bg-rose-100 text-rose-800 font-bold text-xs hover:bg-rose-200 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* 3. Category Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5a5a40]">
                Pilih Kategori Pengeluaran
              </label>
              <button
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-xs font-bold text-[#7d8c77] hover:text-[#5a5a40] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Kategori
              </button>
            </div>

            {/* Form to add custom category */}
            {isAddingCategory && (
              <div className="p-3 bg-white rounded-2xl border border-[#e5e5d1] space-y-2">
                <span className="text-xs font-bold text-[#5a5a40]">Buat Kategori Baru:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    placeholder="Emoji 🎁"
                    className="w-16 px-2 py-1.5 rounded-xl border border-[#e5e5d1] text-center text-sm"
                    maxLength={3}
                  />
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nama Kategori (misal: Sedekah)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#e5e5d1] text-xs text-[#4a4a40] font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-3 py-1.5 bg-[#5a5a40] text-white font-bold text-xs rounded-xl hover:bg-[#4a4a30]"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            )}

            {/* Grid of Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#7d8c77] bg-[#e5e5d1]/80 text-[#5a5a40] font-bold shadow-2xs'
                        : 'border-[#e5e5d1] bg-white hover:bg-[#f5f5f0] text-[#4a4a40]'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs font-semibold truncate">{cat.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#5a5a40] ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5a5a40]">
              Catatan / Detail (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Misal: Kopi susu gula aren 2 gelas, Beli es teh..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e5e5d1] bg-white text-[#4a4a40] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7d8c77]"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#e5e5d1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-[#5a5a40] hover:bg-[#e5e5d1] text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#5a5a40] hover:bg-[#4a4a30] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Simpan Pengeluaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
