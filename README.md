# FinanceFlow

**FinanceFlow** is a modern, secure, and production-ready personal finance management web application. It is designed to help users track their income, expenses, budgets, loans, investments, and financial goals in one unified dashboard.

## 🚀 Tech Stack

FinanceFlow is built with a cutting-edge, highly optimized stack:
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) with Turbopack for lightning-fast builds and rendering.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for robust, type-safe development.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a fully responsive, modern glassmorphism design with automatic Dark/Light mode.
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage) configured efficiently for the Spark (Free) plan.
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/) for strict frontend data validation.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth UI micro-interactions.
- **Charts**: [Recharts](https://recharts.org/) for beautiful, responsive data visualization.

## ✨ Key Features

- **Authentication System**: Secure email/password login, registration, and password recovery.
- **Comprehensive Dashboard**: Real-time overview of your balances, recent transactions, active budgets, and upcoming bills.
- **Multi-currency Support**: Automatically displays balances in your chosen currency (USD, EUR, INR, GBP, etc.).
- **Transaction Tracking**: Log income and expenses with detailed categorizations, dates, merchants, and custom tags.
- **Goal Management**: Set financial goals (e.g., buying a car, emergency fund) and track your savings progress with dynamic progress bars.
- **Budgeting**: Create monthly budgets per category and receive visual alerts as you near your limits.
- **Investments & Loans**: Track your investment portfolio performance and manage loan EMI payments and schedules.
- **Wishlist**: Save items you want to buy, complete with expected dates and priority levels.

## 🛠️ Getting Started

### Prerequisites
Make sure you have Node.js installed (v18+ recommended).

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗄️ Database Indexes
FinanceFlow uses complex queries in Firestore. When navigating the app for the first time, you may see a console error providing a direct link to generate a Firestore Index. Click the link provided by Firebase to automatically build the required composite indexes.
