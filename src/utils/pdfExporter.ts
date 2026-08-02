import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, Category } from '../types';
import { formatIndonesianFullDate, formatRupiah, getTodayIso } from './formatters';

export const exportExpensesToPdf = (
  expenses: Expense[],
  categories: Category[],
  filename = 'Pengeluaran-Azni.pdf'
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const getCategoryDetails = (catIdOrName: string) => {
    const c = categories.find((cat) => cat.id === catIdOrName || cat.name === catIdOrName);
    return {
      name: c ? c.name : catIdOrName,
      icon: c ? c.icon : '🏷️',
    };
  };

  // Sort expenses newest date first
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const grandTotal = sorted.reduce((sum, e) => sum + e.amount, 0);
  const todayFormatted = formatIndonesianFullDate(getTodayIso());

  // Date range
  const dateList = sorted.map((e) => e.date).sort();
  const startDateStr = dateList.length > 0 ? formatIndonesianFullDate(dateList[0]) : '-';
  const endDateStr = dateList.length > 0 ? formatIndonesianFullDate(dateList[dateList.length - 1]) : '-';

  // ----------------------------------------------------
  // HEADER BANNER
  // ----------------------------------------------------
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(90, 90, 64); // Dark olive `#5a5a40`
  doc.text('PENGELUARAN AZNI', 14, 18);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 100);
  doc.text('Laporan Catatan Pengeluaran Harian', 14, 24);

  // Meta Info Box (Thin frame)
  doc.setDrawColor(229, 229, 209); // #e5e5d1
  doc.setLineWidth(0.1); // THIN LINE
  doc.setFillColor(245, 245, 240); // #f5f5f0
  doc.roundedRect(14, 28, 182, 20, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(74, 74, 64);
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Cetak:', 18, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(todayFormatted, 46, 35);

  doc.setFont('helvetica', 'bold');
  doc.text('Periode Data:', 18, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`${startDateStr} s/d ${endDateStr}`, 46, 42);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Transaksi:', 115, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(`${sorted.length} transaksi`, 146, 35);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Pengeluaran:', 115, 42);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(125, 140, 119); // Sage green `#7d8c77`
  doc.text(formatRupiah(grandTotal), 146, 42);

  // ----------------------------------------------------
  // SECTION 1: RINGKASAN KATEGORI
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 64);
  doc.text('1. Ringkasan Pengeluaran per Kategori', 14, 55);

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

  const summaryBody = activeCategories.map((cat, idx) => {
    return [
      (idx + 1).toString(),
      `${cat.name}`,
      `${cat.count} transaksi`,
      formatRupiah(cat.total),
    ];
  });

  // Summary Total Row
  summaryBody.push([
    '',
    'TOTAL KESELURUHAN',
    `${sorted.length} transaksi`,
    formatRupiah(grandTotal),
  ]);

  autoTable(doc, {
    startY: 58,
    head: [['No', 'Kategori', 'Jumlah Transaksi', 'Total Pengeluaran']],
    body: summaryBody,
    theme: 'grid', // GRID lines clear
    tableLineWidth: 0.25,
    tableLineColor: [180, 180, 160],
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: [50, 50, 40],
      cellPadding: 3,
      lineWidth: 0.2, // Crisp clear gridlines
      lineColor: [200, 200, 180],
    },
    headStyles: {
      fillColor: [90, 90, 64], // Dark olive background
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      lineWidth: 0.25,
      lineColor: [90, 90, 64],
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 58, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      // Highlight last total row
      if (data.row.index === summaryBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 230];
      }
    },
  });

  // ----------------------------------------------------
  // SECTION 2: RINCIAN TRANSAKSI
  // ----------------------------------------------------
  const finalY = (doc as any).lastAutoTable.finalY || 100;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 64);
  doc.text('2. Rincian Catatan Transaksi', 14, finalY + 10);

  const detailBody = sorted.map((exp, idx) => {
    const cat = getCategoryDetails(exp.category);
    return [
      (idx + 1).toString(),
      exp.date,
      formatIndonesianFullDate(exp.date),
      cat.name,
      formatRupiah(exp.amount),
      exp.note || '-',
    ];
  });

  detailBody.push([
    '',
    '',
    'TOTAL PENGELUARAN',
    `${sorted.length} Transaksi`,
    formatRupiah(grandTotal),
    '-',
  ]);

  autoTable(doc, {
    startY: finalY + 13,
    head: [['No', 'Tanggal', 'Hari & Tanggal', 'Kategori', 'Nominal', 'Catatan']],
    body: detailBody,
    theme: 'grid', // GRID lines clear
    tableLineWidth: 0.25,
    tableLineColor: [180, 180, 160],
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      textColor: [50, 50, 40],
      cellPadding: 2.5,
      lineWidth: 0.2, // Crisp clear gridlines
      lineColor: [200, 200, 180],
    },
    headStyles: {
      fillColor: [125, 140, 119], // Sage green header
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      lineWidth: 0.25,
      lineColor: [125, 140, 119],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 42 },
      3: { cellWidth: 32 },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      // Highlight last total row
      if (data.row.index === detailBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 230];
      }
    },
  });

  // Footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 140);
    doc.text(
      `PENGELUARAN AZNI — Halaman ${i} dari ${totalPages}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 8,
      { align: 'center' }
    );
  }

  // Save PDF file
  doc.save(filename);
};
