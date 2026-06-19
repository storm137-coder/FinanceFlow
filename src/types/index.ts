export interface Transaction {
  id: string;
  uid: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  merchant?: string;
  source?: string;
  description?: string;
  date: string;
  time?: string;
  notes?: string;
  paymentMethod: string;
  tags?: string[];
  recurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  uid: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
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
  amount: number;
  spent: number;
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
  investedAmount: number;
  currentValue: number;
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
  borrowedAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyEmi: number;
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
  price: number;
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
