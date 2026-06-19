import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { HiOutlineShieldCheck, HiOutlineChartBar, HiOutlineBanknotes } from 'react-icons/hi2';

export const metadata = {
  title: 'Login | FinanceFlow',
  description: 'Sign in to your FinanceFlow account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                F
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight">FinanceFlow</span>
          </div>
          
          <div className="mt-24 max-w-lg">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Master your money, <br />
              <span className="text-indigo-200">shape your future.</span>
            </h1>
            <p className="text-lg text-indigo-100 mb-12">
              Join thousands of users who are already taking control of their financial destiny with our intelligent tracking and budgeting tools.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <HiOutlineChartBar className="w-6 h-6 text-indigo-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Smart Analytics</h3>
                  <p className="text-indigo-100/80">Get deep insights into your spending habits.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <HiOutlineBanknotes className="w-6 h-6 text-indigo-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Budgeting Made Easy</h3>
                  <p className="text-indigo-100/80">Set budgets and achieve your financial goals.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <HiOutlineShieldCheck className="w-6 h-6 text-indigo-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Bank-level Security</h3>
                  <p className="text-indigo-100/80">Your financial data is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                F
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">FinanceFlow</span>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
