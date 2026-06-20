import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { renderToStream } from '@react-pdf/renderer';
import { ReportDocument } from '@/lib/pdf/templates';
import { registerFonts } from '@/lib/pdf/fonts';
import { subDays, startOfYear, isAfter } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    const uid = decodedClaims.sub;

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30days';
    const reportType = searchParams.get('reportType') || 'transactions';

    // Calculate start date
    const now = new Date();
    let startDate = new Date(0);
    switch (dateRange) {
      case '7days': startDate = subDays(now, 7); break;
      case '30days': startDate = subDays(now, 30); break;
      case '90days': startDate = subDays(now, 90); break;
      case 'thisYear': startDate = startOfYear(now); break;
      case 'allTime': default: startDate = new Date(0);
    }

    // Fetch user profile for default currency
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const defaultCurrency = userDoc.data()?.currency || 'USD';

    // Fetch transactions
    const txSnapshot = await adminDb.collection('users').doc(uid).collection('transactions').get();
    let transactions = txSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    // Filter and sort
    transactions = transactions
      .filter(t => isAfter(new Date(t.date), startDate))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate Summary
    const summaryData = transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.totalIncome += t.amountMinorUnits;
        if (t.type === 'expense') acc.totalExpense += t.amountMinorUnits;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    const formatCurrencyStr = (minorUnits: number) => {
      return (minorUnits / 100).toLocaleString('en-US', { style: 'currency', currency: defaultCurrency });
    };

    const summary = [
      { label: 'Total Income', value: formatCurrencyStr(summaryData.totalIncome) },
      { label: 'Total Expenses', value: formatCurrencyStr(summaryData.totalExpense) },
      { label: 'Net Flow', value: formatCurrencyStr(summaryData.totalIncome - summaryData.totalExpense) },
      { label: 'Records', value: transactions.length.toString() },
    ];

    // Register custom fonts before rendering
    registerFonts();

    const title = 'Transaction History';
    const subtitle = `Date Range: ${dateRange === 'allTime' ? 'All Time' : `Since ${startDate.toLocaleDateString()}`}`;

    const stream = await renderToStream(
      require('react').createElement(ReportDocument, {
        title,
        subtitle,
        summary,
        transactions,
      })
    );

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="financeflow_statement_${dateRange}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}