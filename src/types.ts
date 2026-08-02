export interface Category {
  id: string;
  name: string;
  icon: string; // Emoji
  colorBg: string; // Tailwind bg class
  colorText: string; // Tailwind text class
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: string; // Category ID or Name
  amount: number;
  note?: string;
  createdAt: string; // ISO string timestamp
}

export interface PresetTemplate {
  id: string;
  label: string;
  category: string;
  amount: number;
  icon: string;
}

export interface UserBudgetConfig {
  dailyLimit: number; // 0 if no limit
  monthlyTarget: number;
  showAiBuddyPrompt: boolean;
}

export interface CategorySummary {
  category: string;
  icon: string;
  total: number;
  count: number;
  percentage: number;
  colorBg: string;
  colorText: string;
}

export interface DailySummary {
  date: string;
  formattedDate: string;
  total: number;
  count: number;
  expenses: Expense[];
}
