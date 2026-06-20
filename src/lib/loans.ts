export interface AmortizationScheduleItem {
  month: number;
  paymentMinorUnits: number;
  principalPaymentMinorUnits: number;
  interestPaymentMinorUnits: number;
  remainingBalanceMinorUnits: number;
}

export interface AmortizationSummary {
  monthlyPaymentMinorUnits: number;
  totalInterestMinorUnits: number;
  totalPaymentMinorUnits: number;
  schedule: AmortizationScheduleItem[];
}

/**
 * Generates an amortization schedule for a standard fixed-rate loan.
 * 
 * @param principalMinorUnits The total amount borrowed (in minor units, e.g., cents)
 * @param annualInterestRate The annual interest rate as a percentage (e.g., 5 for 5%)
 * @param termMonths The total number of months for the loan
 * @returns An object containing the monthly payment, totals, and the full schedule
 */
export function generateAmortizationSchedule(
  principalMinorUnits: number,
  annualInterestRate: number,
  termMonths: number
): AmortizationSummary {
  if (principalMinorUnits <= 0) {
    throw new Error('Principal must be greater than zero');
  }
  if (termMonths <= 0) {
    throw new Error('Term must be greater than zero');
  }

  // Handle 0% interest case
  if (annualInterestRate === 0) {
    const monthlyPayment = Math.round(principalMinorUnits / termMonths);
    const schedule: AmortizationScheduleItem[] = [];
    let remainingBalance = principalMinorUnits;

    for (let month = 1; month <= termMonths; month++) {
      let principalPayment = monthlyPayment;
      
      // Adjust last payment for rounding errors
      if (month === termMonths || remainingBalance < monthlyPayment) {
        principalPayment = remainingBalance;
      }

      remainingBalance -= principalPayment;

      schedule.push({
        month,
        paymentMinorUnits: principalPayment,
        principalPaymentMinorUnits: principalPayment,
        interestPaymentMinorUnits: 0,
        remainingBalanceMinorUnits: remainingBalance,
      });
    }

    return {
      monthlyPaymentMinorUnits: monthlyPayment,
      totalInterestMinorUnits: 0,
      totalPaymentMinorUnits: principalMinorUnits,
      schedule,
    };
  }

  const monthlyInterestRate = annualInterestRate / 100 / 12;
  
  // Standard Amortization Formula: P * (r(1+r)^n) / ((1+r)^n - 1)
  const mathPow = Math.pow(1 + monthlyInterestRate, termMonths);
  const rawMonthlyPayment = principalMinorUnits * (monthlyInterestRate * mathPow) / (mathPow - 1);
  const monthlyPaymentMinorUnits = Math.round(rawMonthlyPayment);

  let remainingBalance = principalMinorUnits;
  let totalInterest = 0;
  const schedule: AmortizationScheduleItem[] = [];

  for (let month = 1; month <= termMonths; month++) {
    // Calculate interest for this month based on remaining balance
    const interestPayment = Math.round(remainingBalance * monthlyInterestRate);
    
    // Principal is whatever is left from the fixed monthly payment
    let principalPayment = monthlyPaymentMinorUnits - interestPayment;
    let actualPayment = monthlyPaymentMinorUnits;

    // Handle the final month to clear any rounding discrepancies
    if (month === termMonths) {
      principalPayment = remainingBalance;
      actualPayment = principalPayment + interestPayment;
    } else if (remainingBalance < principalPayment) {
      // Edge case if rounding somehow causes early payoff
      principalPayment = remainingBalance;
      actualPayment = principalPayment + interestPayment;
    }

    remainingBalance -= principalPayment;
    totalInterest += interestPayment;

    schedule.push({
      month,
      paymentMinorUnits: actualPayment,
      principalPaymentMinorUnits: principalPayment,
      interestPaymentMinorUnits: interestPayment,
      remainingBalanceMinorUnits: Math.max(0, remainingBalance), // Prevent -0
    });
    
    if (remainingBalance <= 0) break;
  }

  return {
    monthlyPaymentMinorUnits,
    totalInterestMinorUnits: totalInterest,
    totalPaymentMinorUnits: principalMinorUnits + totalInterest,
    schedule,
  };
}
