import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number({ message: 'Amount is required' }).positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  merchant: z.string().optional(),
  source: z.string().optional(),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  tags: z.array(z.string()).optional(),
  recurring: z.boolean().default(false),
  recurringType: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  receiptUrl: z.string().optional(),
});

export const goalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  targetAmount: z.number({ message: 'Target amount is required' }).positive(),
  currentAmount: z.number().min(0).default(0),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.string().min(1, 'Deadline is required'),
  imageUrl: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
});

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number({ message: 'Budget amount is required' }).positive(),
  spent: z.number().min(0).default(0),
  month: z.number().min(0).max(11),
  year: z.number().min(2020).max(2100),
});

export const billSchema = z.object({
  name: z.string().min(1, 'Bill name is required').max(100),
  amount: z.number({ message: 'Amount is required' }).positive(),
  category: z.string().min(1, 'Category is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
  recurring: z.boolean().default(false),
  recurringType: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  notes: z.string().optional(),
  autopay: z.boolean().default(false),
});

export const investmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['stocks', 'bonds', 'mutual_funds', 'etf', 'crypto', 'real_estate', 'gold', 'other']),
  investedAmount: z.number({ message: 'Invested amount is required' }).positive(),
  currentValue: z.number({ message: 'Current value is required' }).min(0),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  broker: z.string().optional(),
  notes: z.string().optional(),
});

export const loanSchema = z.object({
  name: z.string().min(1, 'Loan name is required').max(100),
  borrowedAmount: z.number({ message: 'Borrowed amount is required' }).positive(),
  remainingAmount: z.number({ message: 'Remaining amount is required' }).min(0),
  interestRate: z.number({ message: 'Interest rate is required' }).min(0).max(100),
  monthlyEmi: z.number({ message: 'Monthly EMI is required' }).positive(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  paidInstallments: z.number().min(0).default(0),
  totalInstallments: z.number({ message: 'Total installments is required' }).positive(),
  lender: z.string().optional(),
  notes: z.string().optional(),
});

export const wishlistSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100),
  price: z.number({ message: 'Price is required' }).positive(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['planned', 'saving', 'purchased', 'cancelled']).default('planned'),
  imageUrl: z.string().optional(),
  storeUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type BillFormData = z.infer<typeof billSchema>;
export type InvestmentFormData = z.infer<typeof investmentSchema>;
export type LoanFormData = z.infer<typeof loanSchema>;
export type WishlistFormData = z.infer<typeof wishlistSchema>;
