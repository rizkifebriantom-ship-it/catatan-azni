import { Category, PresetTemplate } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'makan', name: 'Makan', icon: '🍜', colorBg: 'bg-amber-100', colorText: 'text-amber-800' },
  { id: 'jajan', name: 'Jajan', icon: '🍭', colorBg: 'bg-pink-100', colorText: 'text-pink-800' },
  { id: 'kopi', name: 'Kopi', icon: '☕', colorBg: 'bg-amber-200', colorText: 'text-amber-900' },
  { id: 'minuman', name: 'Minuman', icon: '🥤', colorBg: 'bg-sky-100', colorText: 'text-sky-800' },
  { id: 'bensin', name: 'Bensin', icon: '⛽', colorBg: 'bg-red-100', colorText: 'text-red-800' },
  { id: 'transportasi', name: 'Transportasi', icon: '🚌', colorBg: 'bg-blue-100', colorText: 'text-blue-800' },
  { id: 'belanja', name: 'Belanja', icon: '🛒', colorBg: 'bg-emerald-100', colorText: 'text-emerald-800' },
  { id: 'kesehatan', name: 'Kesehatan', icon: '🏥', colorBg: 'bg-teal-100', colorText: 'text-teal-800' },
  { id: 'rokok', name: 'Rokok', icon: '🚬', colorBg: 'bg-stone-200', colorText: 'text-stone-800' },
  { id: 'hiburan', name: 'Hiburan', icon: '🎮', colorBg: 'bg-purple-100', colorText: 'text-purple-800' },
  { id: 'pulsa', name: 'Pulsa & Kuota', icon: '📱', colorBg: 'bg-indigo-100', colorText: 'text-indigo-800' },
  { id: 'tagihan', name: 'Tagihan', icon: '🧾', colorBg: 'bg-orange-100', colorText: 'text-orange-800' },
  { id: 'rumah', name: 'Kebutuhan Rumah', icon: '🏠', colorBg: 'bg-lime-100', colorText: 'text-lime-800' },
  { id: 'lainnya', name: 'Lain-lain', icon: '📦', colorBg: 'bg-slate-100', colorText: 'text-slate-800' },
];

export const DEFAULT_PRESETS: PresetTemplate[] = [
  { id: 'p1', label: '☕ Kopi Pagi', category: 'kopi', amount: 18000, icon: '☕' },
  { id: 'p2', label: '🍱 Makan Siang', category: 'makan', amount: 25000, icon: '🍜' },
  { id: 'p3', label: '⛽ Isi Bensin', category: 'bensin', amount: 30000, icon: '⛽' },
  { id: 'p4', label: '🥤 Es Teh / Boba', category: 'jajan', amount: 12000, icon: '🍭' },
  { id: 'p5', label: '🛵 Ojol / Transport', category: 'transportasi', amount: 15000, icon: '🚌' },
];

export const QUICK_NOMINALS = [5000, 10000, 20000, 50000, 100000];
