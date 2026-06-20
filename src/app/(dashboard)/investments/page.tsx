'use client';

import { useState } from 'react';
import { useInvestments } from '@/hooks/useInvestments';
import { InvestmentForm } from '@/components/finance/InvestmentForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/currency';
import { PlusCircle, Edit2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { format } from 'date-fns';

export default function InvestmentsPage() {
  const { data: investments, isLoading } = useInvestments();
  const { data: accounts } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  
  const defaultCurrency = accounts?.[0]?.currency || 'USD';

  // Calculate Portfolio Totals
  const totalInvested = investments?.reduce((sum, inv) => sum + inv.investedAmountMinorUnits, 0) || 0;
  const totalCurrentValue = investments?.reduce((sum, inv) => sum + inv.currentValueMinorUnits, 0) || 0;
  const totalProfit = totalCurrentValue - totalInvested;
  const totalROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  const isPositiveROI = totalProfit >= 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display font-display text-foreground">Investments</h1>
          <p className="text-muted-foreground mt-1">Track your portfolio and asset growth.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedInvestment(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedInvestment(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedInvestment ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            </DialogHeader>
            <InvestmentForm 
              initialData={selectedInvestment}
              defaultCurrency={defaultCurrency}
              onSuccess={() => {
                setIsModalOpen(false);
                setSelectedInvestment(null);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="p-12 text-center animate-pulse">Loading portfolio...</div>
      ) : !investments || investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-lg text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No investments yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start tracking your stocks, crypto, or real estate to see your net worth grow.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>Add an asset</Button>
        </div>
      ) : (
        <>
          {/* Portfolio Overview Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Total Invested</p>
              <p className="text-3xl font-display font-semibold">{formatCurrency(totalInvested, defaultCurrency)}</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Current Value</p>
              <p className="text-3xl font-display font-semibold">{formatCurrency(totalCurrentValue, defaultCurrency)}</p>
            </div>

            <div className={`border rounded-lg p-6 shadow-sm ${isPositiveROI ? 'bg-positive/5 border-positive/20' : 'bg-negative/5 border-negative/20'}`}>
              <p className="text-sm text-muted-foreground mb-2">Total Return</p>
              <div className="flex items-center gap-3">
                <p className={`text-3xl font-display font-semibold ${isPositiveROI ? 'text-positive' : 'text-negative'}`}>
                  {isPositiveROI ? '+' : ''}{formatCurrency(totalProfit, defaultCurrency)}
                </p>
                <div className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${isPositiveROI ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
                  {isPositiveROI ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {Math.abs(totalROI).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Assets List */}
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-lg">Your Assets</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-surface-sunken">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Asset Name</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold text-right">Invested</th>
                    <th className="px-6 py-4 font-semibold text-right">Current Value</th>
                    <th className="px-6 py-4 font-semibold text-right">Return</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {investments.map((inv) => {
                    const profit = inv.currentValueMinorUnits - inv.investedAmountMinorUnits;
                    const roi = inv.investedAmountMinorUnits > 0 ? (profit / inv.investedAmountMinorUnits) * 100 : 0;
                    const isPositive = profit >= 0;

                    return (
                      <tr key={inv.id} className="hover:bg-surface-sunken/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium">{inv.name}</p>
                          <p className="text-xs text-muted-foreground">{inv.broker || format(new Date(inv.purchaseDate), 'MMM d, yyyy')}</p>
                        </td>
                        <td className="px-6 py-4 capitalize text-muted-foreground">
                          {inv.type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {formatCurrency(inv.investedAmountMinorUnits, defaultCurrency)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {formatCurrency(inv.currentValueMinorUnits, defaultCurrency)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`inline-flex flex-col items-end`}>
                            <span className={`font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
                              {isPositive ? '+' : ''}{formatCurrency(profit, defaultCurrency)}
                            </span>
                            <span className={`text-xs ${isPositive ? 'text-positive' : 'text-negative'}`}>
                              {isPositive ? '+' : ''}{roi.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedInvestment(inv);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
