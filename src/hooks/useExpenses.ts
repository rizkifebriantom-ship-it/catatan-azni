import { useState, useEffect, useMemo } from 'react';
import { Expense, Category, UserBudgetConfig, CategorySummary } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { getInitialExpenses } from '../constants/sampleData';
import { getTodayIso, getPastDateIso, formatIndonesianFullDate } from '../utils/formatters';

const STORAGE_KEY_EXPENSES = 'catatyuk_expenses_v1';
const STORAGE_KEY_CATEGORIES = 'catatyuk_categories_v1';
const STORAGE_KEY_CONFIG = 'catatyuk_config_v1';

export function useExpenses() {
  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading expenses from storage:', e);
    }
    return getInitialExpenses();
  });

  // Custom + Default categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading categories:', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // User budget configuration
  const [budgetConfig, setBudgetConfig] = useState<UserBudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading config:', e);
    }
    return {
      dailyLimit: 100000, // Default 100k daily target limit
      monthlyTarget: 2500000,
      showAiBuddyPrompt: true,
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses:', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(budgetConfig));
    } catch (e) {
      console.error('Failed to save budgetConfig:', e);
    }
  }, [budgetConfig]);

  // Map category helper
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => {
      map.set(cat.id, cat);
      map.set(cat.name.toLowerCase(), cat);
    });
    return map;
  }, [categories]);

  const getCategoryDetails = (catIdOrName: string): Category => {
    if (!catIdOrName) return DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
    const found = categoryMap.get(catIdOrName) || categoryMap.get(catIdOrName.toLowerCase());
    if (found) return found;

    return {
      id: catIdOrName,
      name: catIdOrName,
      icon: '🏷️',
      colorBg: 'bg-slate-100',
      colorText: 'text-slate-800',
    };
  };

  // Add new expense
  const addExpense = (newExp: Omit<Expense, 'id' | 'createdAt'>) => {
    const created: Expense = {
      ...newExp,
      id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  // Edit existing expense
  const updateExpense = (id: string, updated: Omit<Expense, 'id' | 'createdAt'>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  // Delete expense
  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // Add custom category
  const addCategory = (name: string, icon: string = '🏷️') => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (categories.some((c) => c.id === id)) return id;

    const colors = [
      { bg: 'bg-violet-100', text: 'text-violet-800' },
      { bg: 'bg-cyan-100', text: 'text-cyan-800' },
      { bg: 'bg-emerald-100', text: 'text-emerald-800' },
      { bg: 'bg-rose-100', text: 'text-rose-800' },
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newCat: Category = {
      id,
      name,
      icon,
      colorBg: color.bg,
      colorText: color.text,
      isCustom: true,
    };

    setCategories((prev) => [...prev, newCat]);
    return id;
  };

  // Reset data to initial sample
  const resetToSampleData = () => {
    setExpenses(getInitialExpenses());
    setCategories(DEFAULT_CATEGORIES);
  };

  // Clear all data completely
  const clearAllExpenses = () => {
    setExpenses([]);
  };

  // Today calculations
  const todayIso = getTodayIso();

  const todayExpenses = useMemo(() => {
    return expenses.filter((e) => e.date === todayIso);
  }, [expenses, todayIso]);

  const todayTotal = useMemo(() => {
    return todayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [todayExpenses]);

  // Today's top expense
  const todayTopExpense = useMemo(() => {
    if (todayExpenses.length === 0) return null;
    return [...todayExpenses].sort((a, b) => b.amount - a.amount)[0];
  }, [todayExpenses]);

  // Today's most used category
  const todayMostUsedCategory = useMemo(() => {
    if (todayExpenses.length === 0) return null;
    const countMap: Record<string, { count: number; total: number; catId: string }> = {};

    todayExpenses.forEach((exp) => {
      const cat = exp.category;
      if (!countMap[cat]) {
        countMap[cat] = { count: 0, total: 0, catId: cat };
      }
      countMap[cat].count += 1;
      countMap[cat].total += exp.amount;
    });

    const sorted = Object.values(countMap).sort((a, b) => b.count - a.count || b.total - a.total);
    return sorted[0] ? getCategoryDetails(sorted[0].catId) : null;
  }, [todayExpenses, getCategoryDetails]);

  // Period expenses (last 30 days)
  const getPeriodExpenses = (days: number = 30) => {
    const startDate = getPastDateIso(days - 1); // inclusive
    return expenses.filter((e) => e.date >= startDate);
  };

  // Category breakdown for period
  const getCategoryBreakdown = (days: number = 30): CategorySummary[] => {
    const periodData = getPeriodExpenses(days);
    const totalSpent = periodData.reduce((sum, e) => sum + e.amount, 0);

    const map: Record<string, { total: number; count: number; catId: string }> = {};

    periodData.forEach((exp) => {
      const catKey = exp.category;
      if (!map[catKey]) {
        map[catKey] = { total: 0, count: 0, catId: catKey };
      }
      map[catKey].total += exp.amount;
      map[catKey].count += 1;
    });

    return Object.values(map)
      .map((item) => {
        const catDetails = getCategoryDetails(item.catId);
        return {
          category: catDetails.name,
          icon: catDetails.icon,
          total: item.total,
          count: item.count,
          percentage: totalSpent > 0 ? Math.round((item.total / totalSpent) * 100) : 0,
          colorBg: catDetails.colorBg,
          colorText: catDetails.colorText,
        };
      })
      .sort((a, b) => b.total - a.total);
  };

  return {
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
    todayIso,
    todayExpenses,
    todayTotal,
    todayTopExpense,
    todayMostUsedCategory,
    getPeriodExpenses,
    getCategoryBreakdown,
  };
}
