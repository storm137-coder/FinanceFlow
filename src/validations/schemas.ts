import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(100, 'Password is too long.'),
});

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().email('Please enter a valid email address.').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(100, 'Password is too long.'),
  confirmPassword: z.string().max(100),
  currency: z.string().trim().min(3, 'Currency is required.').max(10),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const accountSchema = z.object({
  name: z.string().trim().min(1, 'Account name is required').max(100),
  type: z.enum(['checking', 'savings', 'credit', 'cash']),
  currency: z.string().trim().min(3, 'Currency code is required').max(10),
  initialBalance: z.coerce.number({ message: 'Initial balance is required' }).max(100000000000, 'Balance cannot exceed 100 billion'),
});

export const transactionSchema = z.object({
  accountId: z.string().trim().min(1, 'Account is required').max(100),
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number({ message: 'Amount is required' }).positive('Amount must be positive').max(100000000000, 'Amount cannot exceed 100 billion'),
  categoryId: z.string().trim().min(1, 'Category is required').max(100),
  merchant: z.string().trim().max(100).optional(),
  date: z.string().trim().min(1, 'Date is required').max(50),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const goalSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  description: z.string().trim().max(500).optional(),
  targetAmount: z.coerce.number({ message: 'Target amount is required' }).positive().max(100000000000, 'Amount cannot exceed 100 billion'),
  currentAmount: z.coerce.number().min(0).max(100000000000, 'Amount cannot exceed 100 billion').default(0),
  category: z.string().trim().min(1, 'Category is required').max(100),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.string().trim().min(1, 'Deadline is required').max(50),
  imageUrl: z.string().trim().url('Must be a valid URL').max(1000).optional().or(z.literal('')),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
});

export const budgetSchema = z.object({
  category: z.string().trim().min(1, 'Category is required').max(100),
  amount: z.coerce.number({ message: 'Budget amount is required' }).positive().max(100000000000, 'Amount cannot exceed 100 billion'),
  spent: z.coerce.number().min(0).max(100000000000).default(0),
  month: z.coerce.number().min(0).max(11),
  year: z.coerce.number().min(2020).max(2100),
});

export const billSchema = z.object({
  name: z.string().trim().min(1, 'Bill name is required').max(100),
  amount: z.coerce.number({ message: 'Amount is required' }).positive().max(100000000000, 'Amount cannot exceed 100 billion'),
  category: z.string().trim().min(1, 'Category is required').max(100),
  dueDate: z.string().trim().min(1, 'Due date is required').max(50),
  status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
  recurring: z.boolean().default(false),
  recurringType: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  notes: z.string().trim().max(500).optional(),
  autopay: z.boolean().default(false),
});

export const investmentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  type: z.enum(['stocks', 'bonds', 'mutual_funds', 'etf', 'crypto', 'real_estate', 'gold', 'other']),
  investedAmount: z.coerce.number({ message: 'Invested amount is required' }).positive().max(100000000000, 'Amount cannot exceed 100 billion'),
  currentValue: z.coerce.number({ message: 'Current value is required' }).min(0).max(100000000000, 'Amount cannot exceed 100 billion'),
  purchaseDate: z.string().trim().min(1, 'Purchase date is required').max(50),
  broker: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const loanSchema = z.object({
  name: z.string().trim().min(1, 'Loan name is required').max(100),
  borrowedAmount: z.coerce.number({ message: 'Borrowed amount is required' }).positive().max(100000000000, 'Amount cannot exceed 100 billion'),
  remainingAmount: z.coerce.number({ message: 'Remaining amount is required' }).min(0).max(100000000000, 'Amount cannot exceed 100 billion'),
  interestRate: z.coerce.number({ message: 'Interest rate is required' }).min(0).max(100),
  durationYears: z.coerce.number().min(0).default(0),
  durationMonths: z.coerce.number().min(0).max(11).default(0),
  monthlyEmi: z.coerce.number().optional(), // Auto-calculated
  startDate: z.string().trim().min(1, 'Start date is required').max(50),
  endDate: z.string().trim().max(50).optional(), // Auto-calculated
  paidInstallments: z.coerce.number().min(0).default(0),
  totalInstallments: z.coerce.number().optional(), // Auto-calculated
  lender: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
}).refine(data => data.durationYears > 0 || data.durationMonths > 0, {
  message: "Duration must be greater than 0",
  path: ["durationMonths"]
});

export const wishlistSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(100),
  price: z.coerce.number({ message: 'Price is required' }).positive().max(100000000000, 'Amount cannot exceed 100 billion'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['planned', 'saving', 'purchased', 'cancelled']).default('planned'),
  imageUrl: z.string().trim().url('Must be a valid URL').max(1000).optional().or(z.literal('')),
  storeUrl: z.string().trim().url('Must be a valid URL').max(1000).optional().or(z.literal('')),
  expectedDate: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(500).optional(),
  category: z.string().trim().max(100).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type BillFormData = z.infer<typeof billSchema>;
export type InvestmentFormData = z.infer<typeof investmentSchema>;
export type LoanFormData = z.infer<typeof loanSchema>;
export type WishlistFormData = z.infer<typeof wishlistSchema>;
