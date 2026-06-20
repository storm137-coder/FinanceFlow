'use client';

import { useState } from 'react';
import { useLoans, useUpdateLoan } from '@/hooks/useLoans';
import { LoanForm } from '@/components/finance/LoanForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/currency';
import { generateAmortizationSchedule } from '@/lib/loans';
import { PlusCircle, Edit2, Landmark, Calculator, CheckCircle2, Undo2 } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { toast } from 'sonner';

export default function LoansPage() {
  const { data: loans, isLoading } = useLoans();
  const { mutateAsync: updateLoan } = useUpdateLoan();
  const { data: accounts } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  
  const defaultCurrency = accounts?.[0]?.currency || 'USD';

  const handleMarkPayment = async (loan: any, scheduleSummary: any) => {
    if (!scheduleSummary) return;
    const nextPaymentRow = scheduleSummary.schedule[loan.paidInstallments];
    if (!nextPaymentRow) {
      toast.error('Loan is already fully paid!');
      return;
    }

    try {
      await updateLoan({
        id: loan.id,
        remainingAmountMinorUnits: nextPaymentRow.remainingBalanceMinorUnits,
        paidInstallments: loan.paidInstallments + 1,
      });
      toast.success('Payment recorded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    }
  };

  const handleUndoPayment = async (loan: any, scheduleSummary: any) => {
    if (!scheduleSummary || loan.paidInstallments <= 0) return;

    const previousInstallmentIndex = loan.paidInstallments - 1;
    let newRemainingBalance;

    if (previousInstallmentIndex === 0) {
      // If undoing the very first payment, remaining balance goes back to borrowed amount
      newRemainingBalance = loan.borrowedAmountMinorUnits;
    } else {
      // Otherwise, it goes back to the balance after the (N-1)th payment
      newRemainingBalance = scheduleSummary.schedule[previousInstallmentIndex - 1].remainingBalanceMinorUnits;
    }

    try {
      await updateLoan({
        id: loan.id,
        remainingAmountMinorUnits: newRemainingBalance,
        paidInstallments: loan.paidInstallments - 1,
      });
      toast.success('Payment undone successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to undo payment');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display font-display text-foreground">Loans & Mortgages</h1>
          <p className="text-muted-foreground mt-1">Track your debt and view amortization schedules.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedLoan(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedLoan(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedLoan ? 'Edit Loan' : 'New Loan'}</DialogTitle>
            </DialogHeader>
            <LoanForm 
              initialData={selectedLoan}
              defaultCurrency={defaultCurrency}
              onSuccess={() => {
                setIsModalOpen(false);
                setSelectedLoan(null);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="p-12 text-center animate-pulse">Loading your loans...</div>
      ) : !loans || loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-lg text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Landmark className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No loans tracked</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Add your mortgage, auto loan, or student debt to see exactly how your payments break down between principal and interest.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>Add your first loan</Button>
        </div>
      ) : (
        <div className="space-y-12">
          {loans.map(loan => {
            const percentagePaid = Math.min(
              ((loan.borrowedAmountMinorUnits - loan.remainingAmountMinorUnits) / loan.borrowedAmountMinorUnits) * 100, 
              100
            );

            // Generate Amortization Schedule
            let scheduleSummary = null;
            try {
              scheduleSummary = generateAmortizationSchedule(
                loan.borrowedAmountMinorUnits,
                loan.interestRate,
                loan.totalInstallments
              );
            } catch (e) {
              console.error('Failed to generate schedule', e);
            }

            return (
              <div key={loan.id} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">{loan.name}</h2>
                    <p className="text-muted-foreground">{loan.lender}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setSelectedLoan(loan);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border">
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Total Borrowed</p>
                    <p className="text-xl font-medium">{formatCurrency(loan.borrowedAmountMinorUnits, defaultCurrency)}</p>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Remaining Balance</p>
                    <p className="text-xl font-medium text-negative">{formatCurrency(loan.remainingAmountMinorUnits, defaultCurrency)}</p>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                    <p className="text-xl font-medium">{loan.interestRate}%</p>
                  </div>
                  <div className="p-6 bg-surface-sunken">
                    <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
                    <p className="text-xl font-medium font-display">{formatCurrency(loan.monthlyEmiMinorUnits, defaultCurrency)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="p-6 border-b border-border bg-surface-sunken/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Payoff Progress</span>
                    <span className="text-sm text-muted-foreground">{percentagePaid.toFixed(1)}% paid</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${percentagePaid}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      Installments Paid: <span className="font-medium text-foreground">{loan.paidInstallments}</span> / {loan.totalInstallments}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUndoPayment(loan, scheduleSummary)}
                        disabled={loan.paidInstallments <= 0}
                      >
                        <Undo2 className="w-4 h-4 mr-2" />
                        Undo
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkPayment(loan, scheduleSummary)}
                        disabled={loan.paidInstallments >= loan.totalInstallments}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Monthly Payment
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Amortization Table */}
                {scheduleSummary && (
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calculator className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">Amortization Schedule</h3>
                    </div>
                    
                    <div className="bg-surface-sunken p-4 rounded-lg mb-6 flex gap-8">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Calculated Monthly</span>
                        <span className="font-medium">{formatCurrency(scheduleSummary.monthlyPaymentMinorUnits, defaultCurrency)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Total Interest Lifetime</span>
                        <span className="font-medium text-negative">{formatCurrency(scheduleSummary.totalInterestMinorUnits, defaultCurrency)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Total Cost of Loan</span>
                        <span className="font-medium">{formatCurrency(scheduleSummary.totalPaymentMinorUnits, defaultCurrency)}</span>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto border border-border rounded-lg relative">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-surface sticky top-0 shadow-sm z-10">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Month</th>
                            <th className="px-4 py-3 font-semibold text-right">Payment</th>
                            <th className="px-4 py-3 font-semibold text-right">Principal</th>
                            <th className="px-4 py-3 font-semibold text-right text-negative">Interest</th>
                            <th className="px-4 py-3 font-semibold text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {scheduleSummary.schedule.map((row) => (
                            <tr key={row.month} className={row.month <= loan.paidInstallments ? 'opacity-50 bg-secondary/50' : 'hover:bg-surface-sunken'}>
                              <td className="px-4 py-3 font-medium">
                                {row.month} {row.month <= loan.paidInstallments && '✓'}
                              </td>
                              <td className="px-4 py-3 text-right">{formatCurrency(row.paymentMinorUnits, defaultCurrency)}</td>
                              <td className="px-4 py-3 text-right text-positive">{formatCurrency(row.principalPaymentMinorUnits, defaultCurrency)}</td>
                              <td className="px-4 py-3 text-right text-negative">{formatCurrency(row.interestPaymentMinorUnits, defaultCurrency)}</td>
                              <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.remainingBalanceMinorUnits, defaultCurrency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
