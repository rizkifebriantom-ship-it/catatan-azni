import React, { useState } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { Header } from './components/Header';
import { TodayDashboard } from './components/TodayDashboard';
import { HistoryView } from './components/HistoryView';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';
import { ExpenseModal } from './components/ExpenseModal';
import { Footer } from './components/Footer';
import { Expense } from './types';

export default function App() {
  const {
    expenses,
    categories,
    budgetConfig,
    setBudgetConfig,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    resetToSampleData,
    clearAllExpenses,
    getCategoryDetails,
    todayExpenses,
    todayTotal,
    todayTopExpense,
    todayMostUsedCategory,
    getCategoryBreakdown,
  } = useExpenses();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'report' | 'settings'>('today');

  // Expense modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [modalPrefill, setModalPrefill] = useState<Partial<Expense> | undefined>(undefined);

  // Handlers for modal
  const handleOpenAddModal = (prefill?: Partial<Expense>) => {
    setEditingExpense(null);
    setModalPrefill(prefill);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setModalPrefill(undefined);
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Hapus catatan pengeluaran ini?')) {
      deleteExpense(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#4a4a40] font-sans antialiased selection:bg-[#e5e5d1] selection:text-[#5a5a40] flex flex-col">
      {/* Top Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        todayTotal={todayTotal}
        onOpenAddModal={() => handleOpenAddModal()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {activeTab === 'today' && (
          <TodayDashboard
            todayExpenses={todayExpenses}
            todayTotal={todayTotal}
            todayTopExpense={todayTopExpense}
            todayMostUsedCategory={todayMostUsedCategory}
            budgetConfig={budgetConfig}
            getCategoryDetails={getCategoryDetails}
            onOpenAddModal={handleOpenAddModal}
            onEditExpense={handleOpenEditModal}
            onDeleteExpense={handleDeleteExpense}
            onNavigateToHistory={() => setActiveTab('history')}
            onNavigateToReport={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            expenses={expenses}
            categories={categories}
            getCategoryDetails={getCategoryDetails}
            onEditExpense={handleOpenEditModal}
            onDeleteExpense={handleDeleteExpense}
            onOpenAddModal={() => handleOpenAddModal()}
          />
        )}

        {activeTab === 'report' && (
          <ReportView
            expenses={expenses}
            getCategoryBreakdown={getCategoryBreakdown}
            getCategoryDetails={getCategoryDetails}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            budgetConfig={budgetConfig}
            setBudgetConfig={setBudgetConfig}
            categories={categories}
            onAddCustomCategory={addCategory}
            onResetSampleData={resetToSampleData}
            onClearAllExpenses={clearAllExpenses}
            expensesCount={expenses.length}
          />
        )}
      </main>

      {/* Add / Edit Expense Modal Dialog */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        categories={categories}
        editingExpense={editingExpense}
        onAddCustomCategory={addCategory}
        prefill={modalPrefill}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
