import { describe, it, expect } from 'vitest';
import { getTransactionDateComponents, formatBudgetPeriod, calculateBudgetsForPeriod } from '../utils';

describe('getTransactionDateComponents', () => {
  it('correctly extracts year, month (0-indexed), and day from YYYY-MM-DD string without timezone drift', () => {
    const firstOfMonth = getTransactionDateComponents('2026-09-01');
    expect(firstOfMonth).toEqual({ year: 2026, month: 8, day: 1 });

    const endOfMonth = getTransactionDateComponents('2026-09-30');
    expect(endOfMonth).toEqual({ year: 2026, month: 8, day: 30 });

    const leapDay = getTransactionDateComponents('2024-02-29');
    expect(leapDay).toEqual({ year: 2024, month: 1, day: 29 });

    const janFirst = getTransactionDateComponents('2026-01-01');
    expect(janFirst).toEqual({ year: 2026, month: 0, day: 1 });

    const decThirtyOne = getTransactionDateComponents('2026-12-31');
    expect(decThirtyOne).toEqual({ year: 2026, month: 11, day: 31 });
  });

  it('handles Date instances and timestamp objects', () => {
    const d = new Date(2026, 4, 15); // May 15, 2026
    const res = getTransactionDateComponents(d);
    expect(res).toEqual({ year: 2026, month: 4, day: 15 });

    // Mock Firestore timestamp
    const timestampMock = {
      toDate: () => new Date(2026, 7, 20), // August 20, 2026
    };
    const resTimestamp = getTransactionDateComponents(timestampMock);
    expect(resTimestamp).toEqual({ year: 2026, month: 7, day: 20 });
  });

  it('returns null for null, undefined, or invalid inputs', () => {
    expect(getTransactionDateComponents(null)).toBeNull();
    expect(getTransactionDateComponents(undefined)).toBeNull();
    expect(getTransactionDateComponents('invalid-date')).toBeNull();
  });
});

describe('formatBudgetPeriod', () => {
  it('formats month and year nicely', () => {
    expect(formatBudgetPeriod(8, 2026, 'short')).toBe('Sep 2026');
    expect(formatBudgetPeriod(8, 2026, 'long')).toBe('September 2026');
    expect(formatBudgetPeriod(0, 2026, 'short')).toBe('Jan 2026');
    expect(formatBudgetPeriod(11, 2026, 'long')).toBe('December 2026');
  });
});

describe('Budget spent calculation logic', () => {
  const transactions = [
    {
      id: '1',
      type: 'expense',
      categoryId: 'Food',
      amountMinorUnits: 5000, // $50.00
      date: '2026-09-01',
    },
    {
      id: '2',
      type: 'expense',
      categoryId: 'food ', // lowercase with space
      amountMinorUnits: 2500, // $25.00
      date: '2026-09-15',
    },
    {
      id: '3',
      type: 'income',
      categoryId: 'Food', // income should be excluded!
      amountMinorUnits: 10000,
      date: '2026-09-10',
    },
    {
      id: '4',
      type: 'expense',
      categoryId: 'Food',
      amountMinorUnits: 4000, // August transaction should be excluded for Sep budget!
      date: '2026-08-31',
    },
    {
      id: '5',
      type: 'expense',
      categoryId: 'Entertainment',
      amountMinorUnits: 3000,
      date: '2026-09-05',
    },
  ];

  function calculateBudgetSpend(budget: { category: string; month: number; year: number }) {
    const budgetCat = budget.category.trim().toLowerCase();
    let spent = 0;

    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      if ((tx.categoryId || '').trim().toLowerCase() !== budgetCat) return;

      const dateComp = getTransactionDateComponents(tx.date);
      if (!dateComp) return;

      if (dateComp.year === budget.year && dateComp.month === budget.month) {
        spent += tx.amountMinorUnits;
      }
    });

    return spent;
  }

  it('calculates September 2026 Food budget spend accurately including case/trim matching', () => {
    const sepFoodSpend = calculateBudgetSpend({
      category: ' FOOD ',
      month: 8, // September (0-indexed)
      year: 2026,
    });

    // tx1 ($50.00) + tx2 ($25.00) = $75.00 (7500 minor units)
    expect(sepFoodSpend).toBe(7500);
  });

  it('calculates August 2026 Food budget spend independently', () => {
    const augFoodSpend = calculateBudgetSpend({
      category: 'Food',
      month: 7, // August (0-indexed)
      year: 2026,
    });

    // tx4 ($40.00 = 4000 minor units)
    expect(augFoodSpend).toBe(4000);
  });

  it('handles zero spend when no transactions match', () => {
    const travelSpend = calculateBudgetSpend({
      category: 'Travel',
      month: 8,
      year: 2026,
    });

    expect(travelSpend).toBe(0);
  });
});

describe('calculateBudgetsForPeriod with recurring monthly budgets', () => {
  // Exactly modeling the user scenario:
  // Budget created in August 2026 for category 'gugaagag' with limit ₹134,545.00 (13454500 minor units)
  const rawBudgets = [
    {
      id: 'budget-gugaagag',
      uid: 'user1',
      category: 'gugaagag',
      amountMinorUnits: 13454500,
      spentMinorUnits: 0,
      month: 7, // August 2026
      year: 2026,
      createdAt: '2026-08-25T10:00:00Z',
      updatedAt: '2026-08-25T10:00:00Z',
    },
  ];

  const transactions = [
    {
      id: 'tx-1',
      accountId: 'acc1',
      type: 'expense' as const,
      categoryId: 'gugaagag',
      amountMinorUnits: 8888800, // ₹88,888.00
      currency: 'INR',
      date: '2026-09-03',
      createdAt: '2026-09-03T10:00:00Z',
      updatedAt: '2026-09-03T10:00:00Z',
    },
    {
      id: 'tx-2',
      accountId: 'acc1',
      type: 'expense' as const,
      categoryId: 'gugaagag',
      amountMinorUnits: 9900, // ₹99.00
      currency: 'INR',
      date: '2026-09-03',
      createdAt: '2026-09-03T11:00:00Z',
      updatedAt: '2026-09-03T11:00:00Z',
    },
    {
      id: 'tx-3',
      accountId: 'acc1',
      type: 'expense' as const,
      categoryId: 'gugaagag',
      amountMinorUnits: 50000, // ₹500.00
      currency: 'INR',
      date: '2026-08-25',
      createdAt: '2026-08-25T10:00:00Z',
      updatedAt: '2026-08-25T10:00:00Z',
    },
    {
      id: 'tx-4',
      accountId: 'acc1',
      type: 'expense' as const,
      categoryId: 'gugaagag',
      amountMinorUnits: 5400, // ₹54.00
      currency: 'INR',
      date: '2026-08-25',
      createdAt: '2026-08-25T11:00:00Z',
      updatedAt: '2026-08-25T11:00:00Z',
    },
  ];

  it('correctly aggregates September 2026 transactions for August-created recurring budget', () => {
    // Calling for September 2026 ('2026-8')
    const result = calculateBudgetsForPeriod(rawBudgets, transactions, '2026-8');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('gugaagag');
    expect(result[0].amountMinorUnits).toBe(13454500); // ₹134,545.00
    // Sep 3 transactions: 88,888.00 + 99.00 = 88,987.00 (8898700 minor units)
    expect(result[0].spentMinorUnits).toBe(8898700);
    expect(result[0].month).toBe(8);
    expect(result[0].year).toBe(2026);
  });

  it('correctly isolates August 2026 transactions when viewing August 2026', () => {
    // Calling for August 2026 ('2026-7')
    const result = calculateBudgetsForPeriod(rawBudgets, transactions, '2026-7');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('gugaagag');
    // Aug 25 transactions: 500.00 + 54.00 = 554.00 (55400 minor units)
    expect(result[0].spentMinorUnits).toBe(55400);
    expect(result[0].month).toBe(7);
    expect(result[0].year).toBe(2026);
  });

  it('correctly calculates all-time total spend when viewing all periods', () => {
    // Calling for All Periods ('all')
    const result = calculateBudgetsForPeriod(rawBudgets, transactions, 'all');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('gugaagag');
    // All 4 transactions: 88,888 + 99 + 500 + 54 = 89,541.00 (8954100 minor units)
    expect(result[0].spentMinorUnits).toBe(8954100);
  });

  it('respects month-specific budget override when defined', () => {
    const rawBudgetsWithOverride = [
      ...rawBudgets,
      {
        id: 'budget-gugaagag-sep',
        uid: 'user1',
        category: 'gugaagag',
        amountMinorUnits: 20000000, // ₹200,000.00 specifically for September
        spentMinorUnits: 0,
        month: 8, // September 2026
        year: 2026,
        createdAt: '2026-09-01T10:00:00Z',
        updatedAt: '2026-09-01T10:00:00Z',
      },
    ];

    const resultSep = calculateBudgetsForPeriod(rawBudgetsWithOverride, transactions, '2026-8');
    expect(resultSep[0].amountMinorUnits).toBe(20000000);
    expect(resultSep[0].spentMinorUnits).toBe(8898700);

    const resultAug = calculateBudgetsForPeriod(rawBudgetsWithOverride, transactions, '2026-7');
    expect(resultAug[0].amountMinorUnits).toBe(13454500);
    expect(resultAug[0].spentMinorUnits).toBe(55400);
  });
});
