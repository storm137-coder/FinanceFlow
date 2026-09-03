import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isValid,
  parseISO,
  differenceInDays,
} from 'date-fns';
import type { Budget, Transaction } from '@/types';

/* -------------------------------------------------------------------------- */
/*                              CLASS NAMES                                   */
/* -------------------------------------------------------------------------- */

/**
 * Merges CSS class names, filtering out falsy values.
 * Lightweight alternative to `clsx` / `classnames` packages.
 *
 * @example
 * cn('btn', isActive && 'btn-active', undefined, 'btn-lg')
 * // => 'btn btn-active btn-lg'
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/* -------------------------------------------------------------------------- */
/*                           CURRENCY FORMATTING                              */
/* -------------------------------------------------------------------------- */

/**
 * Formats a number as a currency string using the browser's Intl API.
 *
 * @param amount   - Numeric amount to format
 * @param currency - ISO 4217 currency code (default: 'INR')
 * @returns Formatted currency string (e.g. '₹1,23,456.00')
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unsupported currency codes
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/* -------------------------------------------------------------------------- */
/*                            DATE FORMATTING                                 */
/* -------------------------------------------------------------------------- */

/**
 * Formats a date string or Date object into a human-readable string.
 *
 * @param date       - ISO date string or Date object
 * @param formatStr  - date-fns format pattern (default: 'dd MMM yyyy')
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'dd MMM yyyy'
): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, formatStr);
}

/**
 * Formats a date as a relative string:
 * - 'Today' / 'Yesterday' for recent dates
 * - '3 days ago', '2 months ago', etc. for older dates
 *
 * @param date - ISO date string or Date object
 * @returns Human-friendly relative date string
 */
export function formatRelativeDate(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(parsed)) return 'Today';
  if (isYesterday(parsed)) return 'Yesterday';

  return formatDistanceToNow(parsed, { addSuffix: true });
}

/* -------------------------------------------------------------------------- */
/*                        SAFE DATE FORMATTING                                */
/* -------------------------------------------------------------------------- */

/**
 * Converts a value to a Date, handling Firestore Timestamps (objects with a
 * `toDate()` method), ISO strings, numbers, and existing Date instances.
 * Returns `null` for invalid/null/undefined input.
 */
export function safeParseDate(value: unknown): Date | null {
  if (value == null) return null;
  // Firestore Timestamp or similar (has toDate method)
  if (typeof (value as any).toDate === 'function') return (value as any).toDate();
  // Already a Date
  if (value instanceof Date) return value;
  // String or number
  const d = new Date(value as any);
  return isValid(d) ? d : null;
}

/**
 * Formats a date safely, returning `fallback` when the input is invalid.
 * Handles Firestore Timestamps, ISO strings, numbers, and Date objects.
 */
export function formatDateSafe(
  value: unknown,
  fmt: string,
  fallback = '—',
): string {
  const d = safeParseDate(value);
  if (!d) return fallback;
  return format(d, fmt);
}

/* -------------------------------------------------------------------------- */
/*                              GREETINGS                                     */
/* -------------------------------------------------------------------------- */

/**
 * Returns a time-of-day greeting.
 *
 * - 05:00–11:59 → Good Morning
 * - 12:00–16:59 → Good Afternoon
 * - 17:00–20:59 → Good Evening
 * - 21:00–04:59 → Good Night
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

/* -------------------------------------------------------------------------- */
/*                         FINANCIAL CALCULATORS                              */
/* -------------------------------------------------------------------------- */

/**
 * Calculates how much a user needs to save per day/week/month
 * to reach a target amount by a deadline.
 *
 * @param targetAmount  - Total goal amount
 * @param currentSaved  - Amount already saved
 * @param deadline      - Target date as ISO string or Date
 * @returns Object with daily, weekly, and monthly savings needed
 */
export function calculateSavingsNeeded(
  targetAmount: number,
  currentSaved: number,
  deadline: string | Date
): { daily: number; weekly: number; monthly: number } {
  const remaining = Math.max(0, targetAmount - currentSaved);
  const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  const daysLeft = Math.max(1, differenceInDays(deadlineDate, new Date()));

  const daily = remaining / daysLeft;
  const weekly = daily * 7;
  const monthly = daily * 30;

  return {
    daily: Math.ceil(daily * 100) / 100,
    weekly: Math.ceil(weekly * 100) / 100,
    monthly: Math.ceil(monthly * 100) / 100,
  };
}

/**
 * Calculates loan repayment progress as a percentage.
 *
 * @param paidInstallments  - Number of installments already paid
 * @param totalInstallments - Total number of installments
 * @returns Progress percentage (0–100)
 */
export function calculateLoanProgress(
  paidInstallments: number,
  totalInstallments: number
): number {
  if (totalInstallments <= 0) return 0;
  return Math.min(100, Math.round((paidInstallments / totalInstallments) * 100));
}

/**
 * Calculates investment returns.
 *
 * @param investedAmount - Original investment amount
 * @param currentValue   - Current market value
 * @returns Object with absolute profit and percentage return
 */
export function calculateReturns(
  investedAmount: number,
  currentValue: number
): { profit: number; percentage: number } {
  const profit = currentValue - investedAmount;
  const percentage = investedAmount > 0
    ? Math.round((profit / investedAmount) * 10000) / 100
    : 0;

  return { profit, percentage };
}

/* -------------------------------------------------------------------------- */
/*                              ID GENERATION                                 */
/* -------------------------------------------------------------------------- */

/**
 * Generates a random alphanumeric ID string.
 * Uses crypto.getRandomValues when available, falls back to Math.random.
 *
 * @param length - Desired ID length (default: 20)
 * @returns Random string ID
 */
export function generateId(length: number = 20): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    return Array.from(values, (v) => chars[v % chars.length]).join('');
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/* -------------------------------------------------------------------------- */
/*                               DEBOUNCE                                     */
/* -------------------------------------------------------------------------- */

/**
 * Creates a debounced version of the provided function.
 * The function will only execute after `ms` milliseconds of inactivity.
 *
 * @param fn  - Function to debounce
 * @param ms  - Delay in milliseconds (default: 300)
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/* -------------------------------------------------------------------------- */
/*                             DATE HELPERS                                   */
/* -------------------------------------------------------------------------- */

/**
 * Returns the full month name for a 1-indexed month number.
 *
 * @param month - Month number (1 = January, 12 = December)
 * @returns Full month name
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[(month - 1) % 12] ?? 'Unknown';
}

/**
 * Returns the current month (1-indexed) and year.
 *
 * @returns Object with current month and year
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

/**
 * Accurately extracts year, month (0-indexed: 0=Jan, 11=Dec), and day from any date input.
 * Prioritizes parsing YYYY-MM-DD directly without timezone offsets.
 */
export function getTransactionDateComponents(dateVal: unknown): { year: number; month: number; day: number } | null {
  if (!dateVal) return null;
  if (typeof dateVal === 'string') {
    const ymdMatch = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      return {
        year: parseInt(ymdMatch[1], 10),
        month: parseInt(ymdMatch[2], 10) - 1, // 0-indexed
        day: parseInt(ymdMatch[3], 10),
      };
    }
  }
  const d = safeParseDate(dateVal);
  if (!d) return null;
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
  };
}

/**
 * Formats a budget period (month 0-11, full year) into a human readable string like 'Sep 2026' or 'September 2026'.
 */
export function formatBudgetPeriod(month?: number, year?: number, formatType: 'short' | 'long' = 'short'): string {
  const now = new Date();
  const m = typeof month === 'number' ? month : now.getMonth();
  const y = typeof year === 'number' ? year : now.getFullYear();
  return `${new Date(y, m).toLocaleString('en-US', { month: formatType })} ${y}`;
}

/**
 * Resolves active budgets and calculates dynamic spending for a given period ('all' or 'YYYY-M').
 * Supports recurring monthly budgets where a budget set for a category carries forward into future months.
 */
export function calculateBudgetsForPeriod(
  rawBudgets: Budget[] = [],
  transactions: Transaction[] = [],
  period: string = 'current'
): Budget[] {
  if (!rawBudgets || rawBudgets.length === 0) return [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const effectivePeriod = (!period || period === 'current') 
    ? `${currentYear}-${currentMonth}` 
    : period;

  // Handle 'all' periods: calculate all-time spent for each budget document
  if (effectivePeriod === 'all') {
    return rawBudgets.map((budget) => {
      const budgetCat = (budget.category || '').trim().toLowerCase();
      let totalSpent = 0;

      transactions.forEach((tx) => {
        if (tx.type !== 'expense') return;
        const txCat = (tx.categoryId || '').trim().toLowerCase();
        if (txCat !== budgetCat) return;

        const amount = tx.amountMinorUnits !== undefined
          ? tx.amountMinorUnits
          : Math.round(((tx as any).amount || 0) * 100);
        totalSpent += amount;
      });

      return {
        ...budget,
        spentMinorUnits: totalSpent,
      };
    });
  }

  // Handle specific month: 'YYYY-M'
  const [pYearStr, pMonthStr] = effectivePeriod.split('-');
  const targetYear = parseInt(pYearStr, 10);
  const targetMonth = parseInt(pMonthStr, 10);
  const targetIndex = targetYear * 12 + targetMonth;

  // Group raw budgets by normalized category
  const categoryBudgetsMap = new Map<string, Budget[]>();
  rawBudgets.forEach((b) => {
    const cat = (b.category || '').trim().toLowerCase();
    if (!categoryBudgetsMap.has(cat)) {
      categoryBudgetsMap.set(cat, []);
    }
    categoryBudgetsMap.get(cat)!.push(b);
  });

  const resolvedBudgets: Budget[] = [];

  categoryBudgetsMap.forEach((list, cat) => {
    // 1. Check for exact year and month match
    let activeBudget = list.find((b) => b.year === targetYear && b.month === targetMonth);

    // 2. If no exact match, find the most recent budget defined at or before target period (recurring forward)
    if (!activeBudget) {
      const pastBudgets = list
        .filter((b) => {
          const y = typeof b.year === 'number' ? b.year : currentYear;
          const m = typeof b.month === 'number' ? b.month : currentMonth;
          return (y * 12 + m) <= targetIndex;
        })
        .sort((a, b) => {
          const yA = typeof a.year === 'number' ? a.year : currentYear;
          const mA = typeof a.month === 'number' ? a.month : currentMonth;
          const yB = typeof b.year === 'number' ? b.year : currentYear;
          const mB = typeof b.month === 'number' ? b.month : currentMonth;
          return (yB * 12 + mB) - (yA * 12 + mA);
        });

      if (pastBudgets.length > 0) {
        activeBudget = pastBudgets[0];
      }
    }

    // 3. If all budgets were defined in the future, fallback to the earliest one
    if (!activeBudget) {
      const sorted = [...list].sort((a, b) => {
        const yA = typeof a.year === 'number' ? a.year : currentYear;
        const mA = typeof a.month === 'number' ? a.month : currentMonth;
        const yB = typeof b.year === 'number' ? b.year : currentYear;
        const mB = typeof b.month === 'number' ? b.month : currentMonth;
        return (yA * 12 + mA) - (yB * 12 + mB);
      });
      activeBudget = sorted[0];
    }

    // Calculate spent in this target month and year
    let spent = 0;
    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      const txCat = (tx.categoryId || '').trim().toLowerCase();
      if (txCat !== cat) return;

      const dateComp = getTransactionDateComponents(tx.date);
      if (!dateComp) return;

      if (dateComp.year === targetYear && dateComp.month === targetMonth) {
        const amount = tx.amountMinorUnits !== undefined
          ? tx.amountMinorUnits
          : Math.round(((tx as any).amount || 0) * 100);
        spent += amount;
      }
    });

    resolvedBudgets.push({
      ...activeBudget,
      month: targetMonth,
      year: targetYear,
      spentMinorUnits: spent,
    });
  });

  return resolvedBudgets;
}

/* -------------------------------------------------------------------------- */
/*                            TEXT HELPERS                                     */
/* -------------------------------------------------------------------------- */

/**
 * Truncates text to a maximum length, appending '…' if truncated.
 *
 * @param text      - Original text
 * @param maxLength - Maximum allowed length (default: 50)
 * @returns Truncated text with ellipsis or original text if short enough
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
