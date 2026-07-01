# FinanceFlow - Complete Application Specification

This document contains every technical and functional detail required to perfectly replicate the FinanceFlow application.

---

## 1. Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom CSS variables for light/dark theming
- **UI Components:** `shadcn/ui` customized components, `lucide-react` icons
- **State Management & Data Fetching:** `@tanstack/react-query` (TanStack Query)
- **Backend & Database:** Firebase (Auth, Firestore)
- **Form Handling:** `react-hook-form`
- **Validation:** `zod`
- **Charts:** `recharts`
- **Notifications:** `sonner`

---

## 2. Core Architecture & Business Logic

### Currency Handling
To prevent floating-point precision errors (e.g., `0.1 + 0.2 = 0.30000000000000004`), **all financial data is stored in the database in minor units** (e.g., cents, paise). 
- Values are converted `toMinorUnits` on form submission.
- Values are converted `fromMinorUnits` when rendering or editing in the UI.

### Real-Time Synchronization
The app relies on Firebase Firestore real-time listeners (`onSnapshot`) wrapped inside TanStack Query hooks (e.g., `useCollection.ts`). 
- **Effect:** When a user inputs data, it is instantly updated on the UI across all tabs/windows without needing a page refresh.

### Authentication Flow
- Handled globally via `AuthContext.tsx`.
- Users must be verified. If they register, a verification email is sent, and access is blocked until they verify their email.
- The `useAuth` hook exposes `user`, `loading`, `login`, `logout`, `register`, and `resendVerification`.

---

## 3. Application Structure & Navigation

### Authentication Routes `(auth)`
- `/login`: Email & Password sign-in form. Link to registration and reset password.
- `/register`: Name, Email, Password, Confirm Password, and Base Currency selection.
- `/reset-password`: Form to send password reset email.

### Dashboard Routes `(dashboard)`
Protected routes wrapped by a Sidebar Navigation Layout (`LayoutDashboard`).
- **`/dashboard`**: Summary cards (Total Balance, Income, Expenses), Recent Transactions widget, Account list, Category spend pie chart. Includes ability to Reconcile (edit) Total Balance.
- **`/transactions`**: List of all income, expenses, and transfers. Form includes a typable native `datalist` dropdown for Categories (including "Salary").
- **`/budgets`**: Monthly budget limits vs. actual spend tracking.
- **`/bills`**: Recurring or one-time bill tracking with due dates and statuses.
- **`/goals`**: Savings goals with target amounts, current progress, priority, and deadlines.
- **`/loans`**: EMI trackers for borrowed amounts, interest rates, and remaining balances.
- **`/investments`**: Tracking portfolio across stocks, crypto, mutual funds, etc.
- **`/wishlist`**: Planned purchases with priority and price tags.
- **`/analytics`**: Detailed charts and breakdowns of financial health.
- **`/reports`**: PDF and CSV export generation.
- **`/settings`**: Profile, theme, language, and default currency configurations.

---

## 4. UI / UX Design System

### Theming
The application supports Light and Dark modes utilizing CSS variables injected into Tailwind.

- **Background:** Light `hsl(220, 20%, 97%)` | Dark `hsl(218, 22%, 7%)`
- **Surface (Cards, Modals):** Light `hsl(0, 0%, 100%)` | Dark `hsl(218, 20%, 11%)`
- **Surface Sunken (Inputs):** Light `hsl(216, 16%, 94%)` | Dark `hsl(217, 19%, 14%)`
- **Accent (Brand Color):** Light `hsl(42, 85%, 39%)` | Dark `hsl(39, 67%, 55%)`
- **Positive (Income):** Light `hsl(160, 59%, 30%)` | Dark `hsl(159, 52%, 42%)`
- **Negative (Expense):** Light `hsl(6, 64%, 46%)` | Dark `hsl(6, 71%, 58%)`

### Typography
- **Sans (Default):** Inter
- **Display (Headings):** Archivo
- **Mono (Numbers & Code):** JetBrains Mono
- **Crucial Rule:** All numeric displays use `font-mono` class with `font-feature-settings: "tnum"` to ensure tabular figures, keeping financial tables perfectly aligned vertically.

### Border Radius
- Base (Cards/Dialogs): `8px`
- Medium: `6px`
- Small (Inputs/Buttons): `4px`

---

## 5. Security & Form Validation (Zod)

Every form is protected by strict Zod schemas to ensure absolute data integrity and prevent injection attacks.

- **Transaction Schema:** `amount` must be positive, `type` restricted to enum `['income', 'expense', 'transfer']`. Categories are validated strings (min 1, max 100).
- **Goal Schema:** `targetAmount` and `currentAmount` must be >= 0. `priority` restricted to enum `['low', 'medium', 'high']`. Status restricted to `['active', 'completed', 'paused', 'cancelled']`.
- **Bill Schema:** `amount` > 0. `status` is `['pending', 'paid', 'overdue']`. `recurringType` is `['weekly', 'monthly', 'quarterly', 'yearly']`.
- **Loan Schema:** `interestRate` must be between `0` and `100`. Duration is auto-calculated.
- **All String Inputs:** Strongly trimmed, max lengths enforced (e.g., `notes` max 500 chars, `merchant` max 100 chars). URLs in wishlist are validated using `.url()`.

---

## 6. Firestore Database Models

Data is scoped globally under `/users/{uid}/` ensuring multi-tenant isolation via Firestore Rules. 
Every document automatically receives `createdAt` and `updatedAt` timestamps.

### 1. Account
```typescript
{
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  currency: string;
  balanceMinorUnits: number;
}
```

### 2. Transaction
```typescript
{
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amountMinorUnits: number;
  currency: string;
  categoryId: string;
  merchant?: string;
  date: string; // YYYY-MM-DD
  tags?: string[];
  notes?: string;
}
```

### 3. Goal
```typescript
{
  id: string;
  name: string;
  targetMinorUnits: number;
  currentMinorUnits: number;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
}
```

### 4. Budget
```typescript
{
  id: string;
  category: string;
  amountMinorUnits: number;
  spentMinorUnits: number;
  month: number;
  year: number;
}
```

### 5. Bill
```typescript
{
  id: string;
  name: string;
  amount: number; // Stored in major units (special case) or minor units depending on hook parsing
  category: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  recurring: boolean;
  autopay: boolean;
}
```

### 6. Investment
```typescript
{
  id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'mutual_funds' | 'etf' | 'crypto' | 'real_estate' | 'gold' | 'other';
  investedAmountMinorUnits: number;
  currentValueMinorUnits: number;
  purchaseDate: string;
}
```

### 7. Loan
```typescript
{
  id: string;
  name: string;
  borrowedAmountMinorUnits: number;
  remainingAmountMinorUnits: number;
  interestRate: number;
  monthlyEmiMinorUnits: number;
  startDate: string;
  endDate: string;
  paidInstallments: number;
  totalInstallments: number;
}
```

### 8. WishlistItem
```typescript
{
  id: string;
  name: string;
  priceMinorUnits: number;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'saving' | 'purchased' | 'cancelled';
  storeUrl?: string;
}
```

### 9. UserProfile
```typescript
{
  uid: string;
  displayName: string;
  email: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
}
```
