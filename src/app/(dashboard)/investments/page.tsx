"use client";

import { useState } from "react";
import { useInvestments } from "@/hooks/useInvestments";
import { Investment } from "@/types";
import { InvestmentForm } from "@/components/finance/InvestmentForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";
import {
  PlusCircle,
  Edit2,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { formatDateSafe } from '@/lib/utils';

export default function InvestmentsPage() {
  const { data: investments, isLoading } = useInvestments();
  const { data: accounts } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<
    Investment | undefined
  >(undefined);

  const defaultCurrency = accounts?.[0]?.currency || "USD";

  // Calculate Portfolio Totals
  const totalInvested =
    investments?.reduce((sum, inv) => sum + inv.investedAmountMinorUnits, 0) ||
    0;
  const totalCurrentValue =
    investments?.reduce((sum, inv) => sum + inv.currentValueMinorUnits, 0) || 0;
  const totalProfit = totalCurrentValue - totalInvested;
  const totalROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  const isPositiveROI = totalProfit >= 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display font-display text-foreground">
            Investments
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your portfolio and asset growth.
          </p>
        </div>
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setSelectedInvestment(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedInvestment(undefined)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedInvestment ? "Edit Asset" : "Add New Asset"}
              </DialogTitle>
            </DialogHeader>
            <InvestmentForm
              initialData={selectedInvestment}
              defaultCurrency={defaultCurrency}
              onSuccess={() => {
                setIsModalOpen(false);
                setSelectedInvestment(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="p-12 text-center animate-pulse">
          Loading portfolio...
        </div>
      ) : !investments || investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-border border-dashed rounded-xl text-center">
          <div className="mb-4 h-14 w-14 mx-auto rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No investments yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Start tracking your stocks, crypto, or real estate to see your net
            worth grow.
          </p>
          <Button onClick={() => setIsModalOpen(true)} size="sm">Add an asset</Button>
        </div>
      ) : (
        <>
          {/* Portfolio Overview Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden card-hover-effect">
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent/60" />
              <p className="text-caption text-muted-foreground mb-1.5">Total Invested</p>
              <p className="text-figure-lg font-display font-bold text-foreground truncate">{formatCurrency(totalInvested, defaultCurrency)}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden card-hover-effect">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              <p className="text-caption text-muted-foreground mb-1.5">Current Value</p>
              <p className="text-figure-lg font-display font-bold text-foreground truncate">{formatCurrency(totalCurrentValue, defaultCurrency)}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden card-hover-effect">
              <div className={`absolute top-0 left-0 right-0 h-1 ${isPositiveROI ? 'bg-positive' : 'bg-negative'}`} />
              <p className="text-caption text-muted-foreground mb-1.5">Total Return</p>
              <div className="flex items-center gap-3">
                <p
                  className={`text-3xl font-display font-semibold ${isPositiveROI ? "text-positive" : "text-negative"}`}
                >
                  {isPositiveROI ? "+" : ""}
                  {formatCurrency(totalProfit, defaultCurrency)}
                </p>
                <div
                  className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${isPositiveROI ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"}`}
                >
                  {isPositiveROI ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
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
                    <th className="px-6 py-4 font-semibold text-right">
                      Invested
                    </th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Current Value
                    </th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Return
                    </th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {investments.map((inv) => {
                    const profit =
                      inv.currentValueMinorUnits - inv.investedAmountMinorUnits;
                    const roi =
                      inv.investedAmountMinorUnits > 0
                        ? (profit / inv.investedAmountMinorUnits) * 100
                        : 0;
                    const isPositive = profit >= 0;

                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-surface-sunken/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium">{inv.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {inv.broker ||
                              formatDateSafe(inv.purchaseDate, "MMM d, yyyy")}
                          </p>
                        </td>
                        <td className="px-6 py-4 capitalize text-muted-foreground">
                          {inv.type.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {formatCurrency(
                            inv.investedAmountMinorUnits,
                            defaultCurrency,
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {formatCurrency(
                            inv.currentValueMinorUnits,
                            defaultCurrency,
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`inline-flex flex-col items-end`}>
                            <span
                              className={`font-medium ${isPositive ? "text-positive" : "text-negative"}`}
                            >
                              {isPositive ? "+" : ""}
                              {formatCurrency(profit, defaultCurrency)}
                            </span>
                            <span
                              className={`text-xs ${isPositive ? "text-positive" : "text-negative"}`}
                            >
                              {isPositive ? "+" : ""}
                              {roi.toFixed(2)}%
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
