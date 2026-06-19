import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Column definition for the PDF data table.
 */
export interface PDFColumn {
  /** Column header text */
  header: string;
  /** Object key to pull data from each row */
  dataKey: string;
}

/**
 * Summary line item displayed above the data table.
 */
export interface PDFSummaryItem {
  /** Label (e.g. 'Total Income') */
  label: string;
  /** Value (e.g. '₹1,23,456.00') */
  value: string;
}

/**
 * Configuration options for PDF report generation.
 */
export interface GenerateReportOptions {
  /** Report title displayed at the top */
  title: string;
  /** Array of row data objects */
  data: Record<string, unknown>[];
  /** Column definitions for the table */
  columns: PDFColumn[];
  /** Optional summary items displayed before the table */
  summary?: PDFSummaryItem[];
  /** Optional subtitle (e.g. 'June 2026') */
  subtitle?: string;
}

/**
 * Generates a formatted PDF report with:
 * 1. Title and generation date
 * 2. Optional subtitle
 * 3. Summary section (key-value pairs)
 * 4. Data table with alternating row colors
 *
 * @param options - Report configuration
 * @returns Blob containing the generated PDF
 *
 * @example
 * const blob = generateReport({
 *   title: 'Monthly Expense Report',
 *   subtitle: 'June 2026',
 *   data: transactions,
 *   columns: [
 *     { header: 'Date', dataKey: 'date' },
 *     { header: 'Category', dataKey: 'category' },
 *     { header: 'Amount', dataKey: 'amount' },
 *   ],
 *   summary: [
 *     { label: 'Total Expenses', value: '₹45,000.00' },
 *     { label: 'Total Transactions', value: '42' },
 *   ],
 * });
 *
 * // Trigger download
 * const url = URL.createObjectURL(blob);
 * window.open(url);
 */
export function generateReport(options: GenerateReportOptions): Blob {
  const { title, data, columns, summary, subtitle } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let yPos = 20;

  // ─── Title ────────────────────────────────────────────────────────
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55); // gray-800
  doc.text(title, margin, yPos);
  yPos += 8;

  // ─── Subtitle ─────────────────────────────────────────────────────
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(subtitle, margin, yPos);
    yPos += 6;
  }

  // ─── Generation Date ─────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175); // gray-400
  const generatedDate = `Generated on ${new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  doc.text(generatedDate, margin, yPos);
  yPos += 4;

  // ─── Divider ──────────────────────────────────────────────────────
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // ─── Summary Section ─────────────────────────────────────────────
  if (summary && summary.length > 0) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Summary', margin, yPos);
    yPos += 7;

    // Draw summary in a light background box
    const summaryBoxHeight = summary.length * 7 + 4;
    doc.setFillColor(249, 250, 251); // gray-50
    doc.roundedRect(margin, yPos - 4, pageWidth - margin * 2, summaryBoxHeight, 2, 2, 'F');

    doc.setFontSize(10);
    summary.forEach((item) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(item.label + ':', margin + 4, yPos);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(item.value, margin + 70, yPos);

      yPos += 7;
    });

    yPos += 6;
  }

  // ─── Data Table ───────────────────────────────────────────────────
  if (data.length > 0) {
    const tableHeaders = columns.map((col) => col.header);
    const tableBody = data.map((row) =>
      columns.map((col) => {
        const value = row[col.dataKey];
        return value != null ? String(value) : '';
      })
    );

    autoTable(doc, {
      startY: yPos,
      head: [tableHeaders],
      body: tableBody,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [55, 65, 81], // gray-700
        lineColor: [229, 231, 235], // gray-200
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [79, 70, 229], // indigo-600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // gray-50
      },
      didDrawPage: (hookData) => {
        // Footer on each page
        const pageCount = doc.getNumberOfPages();
        const pageNum = hookData.pageNumber;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(156, 163, 175);
        doc.text(
          `Page ${pageNum} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        doc.text(
          'FinanceFlow Report',
          margin,
          doc.internal.pageSize.getHeight() - 10
        );
      },
    });
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(156, 163, 175);
    doc.text('No data available for this report.', margin, yPos);
  }

  return doc.output('blob');
}

/**
 * Generates a PDF report and immediately triggers a browser download.
 *
 * @param options  - Report configuration (same as generateReport)
 * @param filename - Desired filename without extension
 */
export function downloadReport(
  options: GenerateReportOptions,
  filename: string = 'financeflow-report'
): void {
  const blob = generateReport(options);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
