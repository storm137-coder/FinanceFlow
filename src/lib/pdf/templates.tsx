import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

// 1. Define Styles
const styles = StyleSheet.create({
  page: {
    paddingTop: '24mm',
    paddingBottom: '24mm',
    paddingLeft: '20mm',
    paddingRight: '20mm',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
  },
  // Typography
  pdfTitle: {
    fontFamily: 'Times-Roman',
    fontWeight: 'bold',
    fontSize: 20,
    color: '#14171F',
  },
  pdfSubtitle: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: '#14171F',
    marginTop: 4,
  },
  pdfSection: {
    fontFamily: 'Times-Roman',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#14171F',
    marginTop: 20,
    marginBottom: 8,
  },
  pdfBody: {
    fontFamily: 'Inter',
    fontSize: 9.5,
    color: '#14171F',
  },
  pdfCaption: {
    fontFamily: 'Inter',
    fontSize: 8,
    color: '#14171F',
  },
  pdfFigure: {
    fontFamily: 'JetBrains Mono',
    fontSize: 9.5,
    color: '#14171F',
  },
  pdfFigureTotal: {
    fontFamily: 'JetBrains Mono',
    fontWeight: 500,
    fontSize: 10.5,
    color: '#14171F',
  },
  
  // Layout Components
  headerBand: {
    position: 'absolute',
    top: '12mm',
    left: '20mm',
    right: '20mm',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#14171F',
    paddingBottom: 4,
  },
  footerBand: {
    position: 'absolute',
    bottom: '12mm',
    left: '20mm',
    right: '20mm',
    borderTopWidth: 0.5,
    borderTopColor: '#14171F',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  coverBlock: {
    marginBottom: 20,
  },
  accentRule: {
    marginTop: 8,
    height: 1,
    backgroundColor: '#B8860F',
    width: '100%',
  },
  
  // Summary Block
  summaryBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 20,
  },
  summaryItem: {
    flexDirection: 'column',
    minWidth: '40%',
  },
  
  // Table
  table: {
    width: '100%',
    flexDirection: 'column',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F1F3',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#14171F',
  },
  tableHeaderCell: {
    fontFamily: 'Inter',
    fontSize: 9.5,
    color: '#14171F',
    textTransform: 'uppercase',
    letterSpacing: 0.04,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E5EA',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 22,
  },
  tableSubtotalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#14171F',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 22,
  },
  tableGrandTotalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#14171F',
    borderBottomWidth: 1,
    borderBottomColor: '#14171F',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 22,
    marginTop: 2,
  },
  colLeft: { flex: 1, textAlign: 'left' },
  colRight: { flex: 1, textAlign: 'right' },
  
  // Specific columns for Transactions
  colDate: { width: '20%', textAlign: 'left' },
  colDesc: { width: '40%', textAlign: 'left' },
  colCat: { width: '20%', textAlign: 'left' },
  colAmount: { width: '20%', textAlign: 'right' },
});

// 2. Components
interface ReportProps {
  title: string;
  subtitle: string;
  summary: { label: string; value: string }[];
  transactions: any[];
}

export const ReportDocument = ({ title, subtitle, summary, transactions }: ReportProps) => {
  const generatedDate = format(new Date(), 'MMM d, yyyy');
  
  return (
    <Document title={`${title} - ${subtitle}`} author="FinanceFlow">
      <Page size="A4" style={styles.page}>
        
        {/* Header Band (appears on all pages, we hide it visually on page 1 by overriding or letting cover block be top) */}
        <View style={styles.headerBand} fixed>
          <Text style={styles.pdfCaption}>FinanceFlow</Text>
          <Text style={styles.pdfCaption} render={({ pageNumber, totalPages }) => `[Page ${pageNumber}/${totalPages}]`} />
        </View>

        {/* Cover Block (Page 1) */}
        <View style={styles.coverBlock}>
          <Text style={styles.pdfTitle}>{title}</Text>
          <Text style={styles.pdfSubtitle}>{subtitle}</Text>
          <View style={styles.accentRule} />
        </View>

        {/* Summary Block */}
        {summary && summary.length > 0 && (
          <View style={styles.summaryBlock}>
            {summary.map((item, i) => (
              <View key={i} style={styles.summaryItem}>
                <Text style={styles.pdfBody}>{item.label}</Text>
                <Text style={styles.pdfFigureTotal}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Transactions Table */}
        <Text style={styles.pdfSection}>Transactions</Text>
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>DATE</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>DESCRIPTION</Text>
            <Text style={[styles.tableHeaderCell, styles.colCat]}>CATEGORY</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>AMOUNT</Text>
          </View>

          {/* Body */}
          {transactions.map((tx, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={[styles.pdfFigure, styles.colDate]}>{format(new Date(tx.date), 'yyyy-MM-dd')}</Text>
              <Text style={[styles.pdfBody, styles.colDesc]}>{tx.merchant || tx.type}</Text>
              <Text style={[styles.pdfBody, styles.colCat]}>{tx.categoryId}</Text>
              <Text style={[styles.pdfFigure, styles.colAmount]}>
                {tx.type === 'expense' ? '-' : '+'}{(tx.amountMinorUnits / 100).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footerBand} fixed>
          <Text style={styles.pdfCaption}>Generated {generatedDate} · FinanceFlow Statement</Text>
        </View>

      </Page>
    </Document>
  );
};

