import { describe, it, expect } from 'vitest';
import { generateAmortizationSchedule } from '../loans';

describe('generateAmortizationSchedule', () => {
  it('correctly calculates a standard 5-year loan at 5%', () => {
    // $10,000 at 5% over 5 years (60 months)
    // Using standard formulas, monthly payment should be ~$188.71
    // Total interest should be ~$1,322.74
    // 10000 dollars = 1000000 minor units
    
    const summary = generateAmortizationSchedule(1000000, 5, 60);
    
    expect(summary.monthlyPaymentMinorUnits).toBe(18871); // $188.71
    // Total interest might have slight rounding differences across 60 months
    // Let's accept a range within a few cents.
    expect(Math.abs(summary.totalInterestMinorUnits - 132274)).toBeLessThan(100); 
    
    expect(summary.schedule.length).toBe(60);
    
    // Check first month
    const month1 = summary.schedule[0];
    expect(month1.paymentMinorUnits).toBe(18871);
    // Interest for month 1 = 10000 * 0.05 / 12 = 41.666... -> 4167 minor units
    expect(month1.interestPaymentMinorUnits).toBe(4167);
    expect(month1.principalPaymentMinorUnits).toBe(14704); // 18871 - 4167
    expect(month1.remainingBalanceMinorUnits).toBe(1000000 - 14704);
    
    // Check last month (should clear balance to 0)
    const month60 = summary.schedule[59];
    expect(month60.remainingBalanceMinorUnits).toBe(0);
  });

  it('handles a 0% interest loan correctly', () => {
    // $6,000 at 0% over 12 months = exactly $500/month
    const summary = generateAmortizationSchedule(600000, 0, 12);
    
    expect(summary.monthlyPaymentMinorUnits).toBe(50000); // $500.00
    expect(summary.totalInterestMinorUnits).toBe(0);
    expect(summary.totalPaymentMinorUnits).toBe(600000);
    
    expect(summary.schedule.length).toBe(12);
    expect(summary.schedule[0].interestPaymentMinorUnits).toBe(0);
    expect(summary.schedule[0].principalPaymentMinorUnits).toBe(50000);
    
    expect(summary.schedule[11].remainingBalanceMinorUnits).toBe(0);
  });

  it('adjusts the final payment to handle rounding remainders', () => {
    // $1,000 at 3% over 3 months
    // Formula payment: 1000 * (0.0025 * 1.0025^3) / (1.0025^3 - 1) = 335.00
    // Actually: 335.00 * 3 = 1005.00. Wait, principal is 1000.
    const summary = generateAmortizationSchedule(100000, 3, 3);
    
    expect(summary.schedule.length).toBe(3);
    expect(summary.schedule[2].remainingBalanceMinorUnits).toBe(0);
    
    // The sum of principal payments must exactly equal the starting principal
    const totalPrincipalPaid = summary.schedule.reduce((sum, item) => sum + item.principalPaymentMinorUnits, 0);
    expect(totalPrincipalPaid).toBe(100000);
  });

  it('throws an error if principal or term are invalid', () => {
    expect(() => generateAmortizationSchedule(0, 5, 60)).toThrow('Principal must be greater than zero');
    expect(() => generateAmortizationSchedule(10000, 5, 0)).toThrow('Term must be greater than zero');
  });
});
