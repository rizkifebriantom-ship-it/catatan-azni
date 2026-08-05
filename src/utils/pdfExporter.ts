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

  // Group expenses by date (sorted newest date first)
  const expensesByDateMap: Record<
    string,
    { date: string; formattedDate: string; items: Expense[]; dailyTotal: number }
  > = {};

  sorted.forEach((exp) => {
    if (!expensesByDateMap[exp.date]) {
      expensesByDateMap[exp.date] = {
        date: exp.date,
        formattedDate: formatIndonesianFullDate(exp.date),
        items: [],
        dailyTotal: 0,
      };
    }
    expensesByDateMap[exp.date].items.push(exp);
    expensesByDateMap[exp.date].dailyTotal += exp.amount;
  });

  const datesGrouped = Object.values(expensesByDateMap).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

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
  doc.setLineWidth(0.1);
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

  let currentY = 52;

  // ----------------------------------------------------
  // RINCIAN PENGELUARAN PER HARI (KLOM MASING-MASING HARI)
  // ----------------------------------------------------
  datesGrouped.forEach((group, dateIdx) => {
    // Check page remaining space; if less than 40mm, add a page
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    // Day Header Banner Box
    doc.setFillColor(90, 90, 64); // Dark olive background `#5a5a40`
    doc.roundedRect(14, currentY, 182, 8, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(` HARI & TANGGAL: ${group.formattedDate.toUpperCase()}`, 17, currentY + 5.5);

    doc.text(
      `Total Hari Ini: ${formatRupiah(group.dailyTotal)} (${group.items.length} transaksi)`,
      192,
      currentY + 5.5,
      { align: 'right' }
    );

    // Rows for this day
    const dayRows = group.items.map((exp, idx) => {
      const cat = getCategoryDetails(exp.category);
      return [
        (idx + 1).toString(),
        cat.name,
        formatRupiah(exp.amount),
        exp.note || '-',
      ];
    });

    // Subtotal Row for this day
    dayRows.push([
      '',
      'TOTAL PENGELUARAN HARI INI',
      formatRupiah(group.dailyTotal),
      `${group.items.length} transaksi pada ${group.date}`,
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [['No', 'Kategori', 'Nominal Pengeluaran', 'Catatan / Keterangan']],
      body: dayRows,
      theme: 'grid',
      tableLineWidth: 0.25,
      tableLineColor: [180, 180, 160],
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        textColor: [50, 50, 40],
        cellPadding: 2.5,
        lineWidth: 0.2,
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
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 45 },
        2: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
        3: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.row.index === dayRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 243, 235]; // Light subtle green highlight
          data.cell.styles.textColor = [60, 75, 55];
        }
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  });

  // ----------------------------------------------------
  // GRAND TOTAL SUMMARY BANNER AT THE BOTTOM
  // ----------------------------------------------------
  if (currentY > 245) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(90, 90, 64);
  doc.setDrawColor(70, 70, 50);
  doc.roundedRect(14, currentY, 182, 12, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`TOTAL KESELURUHAN PENGELUARAN (${sorted.length} Transaksi)`, 18, currentY + 7.5);

  doc.setFontSize(12);
  doc.text(formatRupiah(grandTotal), 192, currentY + 7.5, { align: 'right' });

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

