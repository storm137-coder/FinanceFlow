export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  currency: string;
  balanceMinorUnits: number;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amountMinorUnits: number;
  currency: string;
  categoryId: string;
  merchant?: string;
  date: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: 'income' | 'expense';
  isSystemDefault: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  uid: string;
  name: string;
  description?: string;
  targetMinorUnits: number;
  currentMinorUnits: number;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  imageUrl?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  uid: string;
  category: string;
  amountMinorUnits: number;
  spentMinorUnits: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  uid: string;
  name: string;
  amount: number;
  category: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  recurring: boolean;
  recurringType?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
  autopay: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  uid: string;
  name: string;
  type: 'stocks' | 'bonds' | 'mutual_funds' | 'etf' | 'crypto' | 'real_estate' | 'gold' | 'other';
  investedAmountMinorUnits: number;
  currentValueMinorUnits: number;
  purchaseDate: string;
  broker?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  uid: string;
  name: string;
  borrowedAmountMinorUnits: number;
  remainingAmountMinorUnits: number;
  interestRate: number;
  monthlyEmiMinorUnits: number;
  startDate: string;
  endDate: string;
  paidInstallments: number;
  totalInstallments: number;
  lender?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  uid: string;
  name: string;
  priceMinorUnits: number;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'saving' | 'purchased' | 'cancelled';
  imageUrl?: string;
  storeUrl?: string;
  expectedDate?: string;
  notes?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  uid: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'bill_due' | 'goal_reached' | 'budget_exceeded';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  createdAt: string;
  updatedAt: string;
}
