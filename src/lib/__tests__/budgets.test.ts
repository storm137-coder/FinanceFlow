import { describe, it, expect } from 'vitest';
import { getTransactionDateComponents, formatBudgetPeriod } from '../utils';

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
