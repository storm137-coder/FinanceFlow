import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
  currency: z.string().min(3, 'Currency is required.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100),
  type: z.enum(['checking', 'savings', 'credit', 'cash']),
  currency: z.string().min(3, 'Currency code is required'),
  initialBalance: z.coerce.number({ message: 'Initial balance is required' }),
});

export const transactionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number({ message: 'Amount is required' }).positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  merchant: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const goalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  targetAmount: z.coerce.number({ message: 'Target amount is required' }).positive(),
  currentAmount: z.coerce.number().min(0).default(0),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.string().min(1, 'Deadline is required'),
  imageUrl: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
});

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number({ message: 'Budget amount is required' }).positive(),
  spent: z.coerce.number().min(0).default(0),
  month: z.coerce.number().min(0).max(11),
  year: z.coerce.number().min(2020).max(2100),
});

export const billSchema = z.object({
  name: z.string().min(1, 'Bill name is required').max(100),
  amount: z.coerce.number({ message: 'Amount is required' }).positive(),
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
  investedAmount: z.coerce.number({ message: 'Invested amount is required' }).positive(),
  currentValue: z.coerce.number({ message: 'Current value is required' }).min(0),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  broker: z.string().optional(),
  notes: z.string().optional(),
});

export const loanSchema = z.object({
  name: z.string().min(1, 'Loan name is required').max(100),
  borrowedAmount: z.coerce.number({ message: 'Borrowed amount is required' }).positive(),
  remainingAmount: z.coerce.number({ message: 'Remaining amount is required' }).min(0),
  interestRate: z.coerce.number({ message: 'Interest rate is required' }).min(0).max(100),
  durationYears: z.coerce.number().min(0).default(0),
  durationMonths: z.coerce.number().min(0).max(11).default(0),
  monthlyEmi: z.coerce.number().optional(), // Auto-calculated
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(), // Auto-calculated
  paidInstallments: z.coerce.number().min(0).default(0),
  totalInstallments: z.coerce.number().optional(), // Auto-calculated
  lender: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => data.durationYears > 0 || data.durationMonths > 0, {
  message: "Duration must be greater than 0",
  path: ["durationMonths"]
});

export const wishlistSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100),
  price: z.coerce.number({ message: 'Price is required' }).positive(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['planned', 'saving', 'purchased', 'cancelled']).default('planned'),
  imageUrl: z.string().optional(),
  storeUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
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
