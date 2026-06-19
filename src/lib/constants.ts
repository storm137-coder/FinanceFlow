export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: '🍔', color: '#F59E0B' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#3B82F6' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { value: 'health', label: 'Health', icon: '🏥', color: '#10B981' },
  { value: 'education', label: 'Education', icon: '📚', color: '#6366F1' },
  { value: 'bills', label: 'Bills & Utilities', icon: '💡', color: '#F97316' },
  { value: 'rent', label: 'Rent', icon: '🏠', color: '#EF4444' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️', color: '#14B8A6' },
  { value: 'groceries', label: 'Groceries', icon: '🛒', color: '#22C55E' },
  { value: 'personal', label: 'Personal Care', icon: '💈', color: '#E879F9' },
  { value: 'travel', label: 'Travel', icon: '✈️', color: '#06B6D4' },
  { value: 'gifts', label: 'Gifts & Donations', icon: '🎁', color: '#F43F5E' },
  { value: 'subscriptions', label: 'Subscriptions', icon: '📱', color: '#A855F7' },
  { value: 'other', label: 'Other', icon: '📦', color: '#6B7280' },
] as const;

export const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salary', icon: '💰', color: '#10B981' },
  { value: 'freelance', label: 'Freelance', icon: '💻', color: '#3B82F6' },
  { value: 'business', label: 'Business', icon: '🏢', color: '#8B5CF6' },
  { value: 'investments', label: 'Investments', icon: '📈', color: '#F59E0B' },
  { value: 'rental', label: 'Rental Income', icon: '🏠', color: '#EC4899' },
  { value: 'dividends', label: 'Dividends', icon: '💵', color: '#14B8A6' },
  { value: 'interest', label: 'Interest', icon: '🏦', color: '#6366F1' },
  { value: 'gifts', label: 'Gifts', icon: '🎁', color: '#F43F5E' },
  { value: 'refunds', label: 'Refunds', icon: '🔄', color: '#06B6D4' },
  { value: 'other', label: 'Other', icon: '📦', color: '#6B7280' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'debit_card', label: 'Debit Card', icon: '💳' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'wallet', label: 'Digital Wallet', icon: '👛' },
  { value: 'cheque', label: 'Cheque', icon: '📝' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const;

export const INVESTMENT_TYPES = [
  { value: 'stocks', label: 'Stocks', icon: '📈', color: '#3B82F6' },
  { value: 'bonds', label: 'Bonds', icon: '📜', color: '#10B981' },
  { value: 'mutual_funds', label: 'Mutual Funds', icon: '📊', color: '#8B5CF6' },
  { value: 'etf', label: 'ETF', icon: '📉', color: '#F59E0B' },
  { value: 'crypto', label: 'Crypto', icon: '₿', color: '#F97316' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠', color: '#EC4899' },
  { value: 'gold', label: 'Gold', icon: '🥇', color: '#EAB308' },
  { value: 'other', label: 'Other', icon: '📦', color: '#6B7280' },
] as const;

export const BILL_CATEGORIES = [
  { value: 'electricity', label: 'Electricity', icon: '⚡' },
  { value: 'water', label: 'Water', icon: '💧' },
  { value: 'internet', label: 'Internet', icon: '🌐' },
  { value: 'phone', label: 'Phone', icon: '📱' },
  { value: 'rent', label: 'Rent', icon: '🏠' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'subscription', label: 'Subscription', icon: '📺' },
  { value: 'loan', label: 'Loan EMI', icon: '🏦' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const;

export const GOAL_CATEGORIES = [
  { value: 'emergency', label: 'Emergency Fund', icon: '🚨', color: '#EF4444' },
  { value: 'vacation', label: 'Vacation', icon: '✈️', color: '#3B82F6' },
  { value: 'home', label: 'Home', icon: '🏠', color: '#10B981' },
  { value: 'car', label: 'Car', icon: '🚗', color: '#F59E0B' },
  { value: 'education', label: 'Education', icon: '📚', color: '#8B5CF6' },
  { value: 'retirement', label: 'Retirement', icon: '🏖️', color: '#EC4899' },
  { value: 'wedding', label: 'Wedding', icon: '💒', color: '#F43F5E' },
  { value: 'gadget', label: 'Gadget', icon: '📱', color: '#06B6D4' },
  { value: 'investment', label: 'Investment', icon: '📈', color: '#14B8A6' },
  { value: 'other', label: 'Other', icon: '📦', color: '#6B7280' },
] as const;

export const WISHLIST_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#6B7280' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
] as const;

export const WISHLIST_STATUSES = [
  { value: 'planned', label: 'Planned', color: '#6B7280' },
  { value: 'saving', label: 'Saving', color: '#3B82F6' },
  { value: 'purchased', label: 'Purchased', color: '#10B981' },
  { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
] as const;

export const RECURRING_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export const CURRENCIES = [
  { value: 'INR', label: '₹ Indian Rupee', symbol: '₹' },
  { value: 'USD', label: '$ US Dollar', symbol: '$' },
  { value: 'EUR', label: '€ Euro', symbol: '€' },
  { value: 'GBP', label: '£ British Pound', symbol: '£' },
  { value: 'JPY', label: '¥ Japanese Yen', symbol: '¥' },
  { value: 'AUD', label: 'A$ Australian Dollar', symbol: 'A$' },
  { value: 'CAD', label: 'C$ Canadian Dollar', symbol: 'C$' },
] as const;

export const CHART_COLORS = [
  '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
  '#8B5CF6', '#EF4444', '#14B8A6', '#F97316', '#06B6D4',
  '#A855F7', '#22C55E', '#E879F9', '#F43F5E', '#6B7280',
] as const;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
