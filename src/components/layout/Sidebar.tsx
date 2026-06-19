'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  HiOutlineHome,
  HiOutlineBanknotes,
  HiOutlineFlag,
  HiOutlineCalculator,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineBuildingLibrary,
  HiOutlineHeart,
  HiOutlineChartPie,
  HiOutlineCalendar,
  HiOutlineClipboardDocument,
  HiOutlineUser,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineMoon,
  HiOutlineSun,
} from 'react-icons/hi2';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: HiOutlineHome, path: '/dashboard' },
  { label: 'Transactions', icon: HiOutlineBanknotes, path: '/transactions' },
  { label: 'Goals', icon: HiOutlineFlag, path: '/goals' },
  { label: 'Budgets', icon: HiOutlineCalculator, path: '/budgets' },
  { label: 'Bills', icon: HiOutlineDocumentText, path: '/bills' },
  { label: 'Analytics', icon: HiOutlineChartBar, path: '/analytics' },
  { label: 'Investments', icon: HiOutlineBuildingLibrary, path: '/investments' },
  { label: 'Wishlist', icon: HiOutlineHeart, path: '/wishlist' },
  { label: 'Reports', icon: HiOutlineChartPie, path: '/reports' },
  { label: 'Calendar', icon: HiOutlineCalendar, path: '/calendar' },
  { label: 'Loans', icon: HiOutlineClipboardDocument, path: '/loans' },
  { label: 'Profile', icon: HiOutlineUser, path: '/profile' },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                FinanceFlow
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors hidden md:block"
        >
          <HiOutlineBars3 className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center px-3 py-3 mb-1 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'}`} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className={`flex items-center w-full px-3 py-3 mb-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {theme === 'dark' ? <HiOutlineSun className="w-6 h-6 shrink-0" /> : <HiOutlineMoon className="w-6 h-6 shrink-0" />}
          {!collapsed && <span className="ml-3 font-medium">Theme</span>}
        </button>

        <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-3 py-2'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
            {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3 overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className="hidden md:block h-screen sticky top-0 z-40 shrink-0"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Drawer Trigger (if needed globally, but usually triggered from Navbar) */}
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 md:hidden"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-white/10 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  <HiOutlineXMark className="w-6 h-6" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* Expose method to open mobile menu for Navbar */}
      <div id="mobile-menu-trigger" onClick={() => setIsMobileMenuOpen(true)} className="hidden" />
    </>
  );
}
