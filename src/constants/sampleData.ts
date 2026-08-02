import { Expense } from '../types';
import { getTodayIso, getPastDateIso } from '../utils/formatters';

export function getInitialExpenses(): Expense[] {
  const today = getTodayIso();
  const d1 = getPastDateIso(1);
  const d2 = getPastDateIso(2);
  const d3 = getPastDateIso(3);
  const d5 = getPastDateIso(5);
  const d8 = getPastDateIso(8);
  const d12 = getPastDateIso(12);
  const d18 = getPastDateIso(18);
  const d24 = getPastDateIso(24);

  return [
    {
      id: 'e-today-1',
      date: today,
      category: 'makan',
      amount: 35000,
      note: 'Nasi Goreng Ayam + Es Teh Manis',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'e-today-2',
      date: today,
      category: 'kopi',
      amount: 22000,
      note: 'Kopi Susu Gula Aren ☕',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'e-today-3',
      date: today,
      category: 'jajan',
      amount: 18000,
      note: 'Cilok & Boba Brown Sugar',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'e-d1-1',
      date: d1,
      category: 'bensin',
      amount: 35000,
      note: 'Isi Pertalite Full Tank ⛽',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'e-d1-2',
      date: d1,
      category: 'makan',
      amount: 45000,
      note: 'Ayam Bakar Sambal Terasi + Nasi Extra',
      createdAt: new Date(Date.now() - 86400000 - 3600000).toISOString(),
    },
    {
      id: 'e-d2-1',
      date: d2,
      category: 'belanja',
      amount: 85000,
      note: 'Sabun, Sampo, & Tisu Bulanan 🛒',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'e-d2-2',
      date: d2,
      category: 'kopi',
      amount: 25000,
      note: 'Iced Americano Single Shot',
      createdAt: new Date(Date.now() - 86400000 * 2 - 7200000).toISOString(),
    },
    {
      id: 'e-d3-1',
      date: d3,
      category: 'pulsa',
      amount: 50000,
      note: 'Paket Data Internet 25GB 📱',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'e-d5-1',
      date: d5,
      category: 'transportasi',
      amount: 28000,
      note: 'Ojol PP Kantor',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'e-d8-1',
      date: d8,
      category: 'tagihan',
      amount: 150000,
      note: 'Tagihan Listrik PLN 🧾',
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 'e-d12-1',
      date: d12,
      category: 'hiburan',
      amount: 65000,
      note: 'Tiket Nonton XXI + Popcorn',
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      id: 'e-d18-1',
      date: d18,
      category: 'kesehatan',
      amount: 42000,
      note: 'Beli Vitamin C & Obat Flu 🏥',
      createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    },
    {
      id: 'e-d24-1',
      date: d24,
      category: 'makan',
      amount: 60000,
      note: 'Makan Bareng Teman All-You-Can-Eat Paket Promo',
      createdAt: new Date(Date.now() - 86400000 * 24).toISOString(),
    },
  ];
}
