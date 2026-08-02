import * as XLSX from 'xlsx';
import { Expense, Category } from '../types';
import { formatIndonesianFullDate, formatRupiah, getTodayIso } from './formatters';

export const exportExpensesToExcel = (
  expenses: Expense[],
  categories: Category[],
  filename = 'Pengeluaran-Azni.xlsx'
) => {
  const getCategoryDetails = (catIdOrName: string) => {
    const c = categories.find((cat) => cat.id === catIdOrName || cat.name === catIdOrName);
    return {
      name: c ? c.name : catIdOrName,
      icon: c ? c.icon : '🏷️',
      fullName: c ? `${c.icon} ${c.name}` : `🏷️ ${catIdOrName}`,
    };
  };

  // Sort expenses newest date first
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const grandTotal = sorted.reduce((sum, e) => sum + e.amount, 0);
  const todayFormatted = formatIndonesianFullDate(getTodayIso());

  // Determine date range in dataset
  const dateList = sorted.map((e) => e.date).sort();
  const startDateStr = dateList.length > 0 ? formatIndonesianFullDate(dateList[0]) : '-';
  const endDateStr = dateList.length > 0 ? formatIndonesianFullDate(dateList[dateList.length - 1]) : '-';

  // ==========================================
  // SHEET 1: RINGKASAN & STATISTIK (SUMMARY)
  // ==========================================
  const summaryAoa: any[][] = [
    ['PENGELUARAN AZNI - RINGKASAN LAPORAN'],
    ['Tanggal Ekspor', todayFormatted],
    ['Rentang Tanggal', `${startDateStr} s/d ${endDateStr}`],
    ['Total Transaksi', sorted.length],
    ['Total Pengeluaran', grandTotal],
    [], // Blank spacing
    ['RINGKASAN PER KATEGORI'],
    ['NO', 'KATEGORI', 'JUMLAH TRANSAKSI', 'TOTAL PENGELUARAN (RP)'],
  ];

  // Group by category
  const categoryTotals: Record<string, { count: number; total: number; icon: string; name: string }> = {};

  categories.forEach((cat) => {
    categoryTotals[cat.id] = { count: 0, total: 0, icon: cat.icon, name: cat.name };
  });

  sorted.forEach((exp) => {
    const catKey = exp.category;
    if (!categoryTotals[catKey]) {
      const c = getCategoryDetails(catKey);
      categoryTotals[catKey] = {
        count: 0,
        total: 0,
        icon: c.icon,
        name: c.name,
      };
    }
    categoryTotals[catKey].count += 1;
    categoryTotals[catKey].total += exp.amount;
  });

  const activeCategories = Object.values(categoryTotals)
    .filter((cat) => cat.count > 0)
    .sort((a, b) => b.total - a.total);

  activeCategories.forEach((cat, idx) => {
    summaryAoa.push([
      idx + 1,
      `${cat.icon} ${cat.name}`,
      cat.count,
      cat.total,
    ]);
  });

  // Grand Total row for summary
  summaryAoa.push([
    '',
    'TOTAL KESELURUHAN',
    sorted.length,
    grandTotal,
  ]);

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryAoa);

  // FORCE SHOW GRIDLINES in Excel view
  summarySheet['!views'] = [{ showGridLines: true }];

  // Set number format for currency cells in Summary
  if (summarySheet['B5']) {
    summarySheet['B5'].z = '"Rp "#,##0';
    summarySheet['B5'].t = 'n';
  }

  // Format category total cells
  activeCategories.forEach((_, idx) => {
    const rowNum = 9 + idx; // 1-indexed row in sheet
    const cellRef = `D${rowNum}`;
    if (summarySheet[cellRef]) {
      summarySheet[cellRef].z = '"Rp "#,##0';
      summarySheet[cellRef].t = 'n';
    }
  });

  // Total row cell format
  const summaryTotalCellRef = `D${9 + activeCategories.length}`;
  if (summarySheet[summaryTotalCellRef]) {
    summarySheet[summaryTotalCellRef].z = '"Rp "#,##0';
    summaryTotalCellRef && (summarySheet[summaryTotalCellRef].t = 'n');
  }

  // Set column widths for summary sheet
  summarySheet['!cols'] = [
    { wch: 8 },   // NO
    { wch: 32 },  // KATEGORI
    { wch: 22 },  // JUMLAH TRANSAKSI
    { wch: 28 },  // TOTAL PENGELUARAN
  ];

  // ==========================================
  // SHEET 2: RINCIAN TRANSAKSI (DETAILS)
  // ==========================================
  const detailAoa: any[][] = [
    ['PENGELUARAN AZNI - RINCIAN PENGELUARAN TRANSAKSI'],
    ['Dicetak Pada', todayFormatted],
    ['Total Records', `${sorted.length} Transaksi`],
    [], // Blank spacing
    ['NO', 'TANGGAL', 'HARI & TANGGAL', 'KATEGORI', 'NOMINAL (RP)', 'CATATAN / KETERANGAN'],
  ];

  sorted.forEach((exp, idx) => {
    const cat = getCategoryDetails(exp.category);
    detailAoa.push([
      idx + 1,
      exp.date,
      formatIndonesianFullDate(exp.date),
      `${cat.icon} ${cat.name}`,
      exp.amount,
      exp.note || '-',
    ]);
  });

  // Add Bottom Total Row
  detailAoa.push([
    '',
    '',
    '',
    'TOTAL PENGELUARAN',
    grandTotal,
    `${sorted.length} Transaksi`,
  ]);

  const detailSheet = XLSX.utils.aoa_to_sheet(detailAoa);

  // FORCE SHOW GRIDLINES in Excel view
  detailSheet['!views'] = [{ showGridLines: true }];

  // Format cells in detail sheet
  sorted.forEach((_, idx) => {
    const rowNum = 6 + idx; // 1-indexed row number (data starts at row 6)
    const amountCell = `E${rowNum}`;
    if (detailSheet[amountCell]) {
      detailSheet[amountCell].z = '"Rp "#,##0';
      detailSheet[amountCell].t = 'n';
    }
  });

  // Grand total row cell in detail sheet
  const grandTotalDetailCell = `E${6 + sorted.length}`;
  if (detailSheet[grandTotalDetailCell]) {
    detailSheet[grandTotalDetailCell].z = '"Rp "#,##0';
    detailSheet[grandTotalDetailCell].t = 'n';
  }

  // Set column widths for detail sheet based on max contents
  detailSheet['!cols'] = [
    { wch: 8 },   // NO
    { wch: 16 },  // TANGGAL
    { wch: 30 },  // HARI & TANGGAL
    { wch: 28 },  // KATEGORI
    { wch: 24 },  // NOMINAL (RP)
    { wch: 45 },  // CATATAN / KETERANGAN
  ];

  // ==========================================
  // CREATE WORKBOOK & DOWNLOAD
  // ==========================================
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan & Statistik');
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Rincian Transaksi');

  // Trigger Excel file download
  XLSX.writeFile(workbook, filename);
};

