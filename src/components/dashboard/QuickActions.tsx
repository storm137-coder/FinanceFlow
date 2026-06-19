import React from 'react';
import Link from 'next/link';
import { HiOutlinePlus, HiOutlineMinus, HiOutlineFlag, HiOutlineDocumentText } from 'react-icons/hi2';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      label: 'Add Income',
      icon: HiOutlinePlus,
      href: '/transactions?action=add-income',
      color: 'bg-emerald-500 hover:bg-emerald-600',
      shadow: 'shadow-emerald-500/20'
    },
    {
      label: 'Add Expense',
      icon: HiOutlineMinus,
      href: '/transactions?action=add-expense',
      color: 'bg-rose-500 hover:bg-rose-600',
      shadow: 'shadow-rose-500/20'
    },
    {
      label: 'Set Goal',
      icon: HiOutlineFlag,
      href: '/goals?action=add-goal',
      color: 'bg-purple-500 hover:bg-purple-600',
      shadow: 'shadow-purple-500/20'
    },
    {
      label: 'Pay Bill',
      icon: HiOutlineDocumentText,
      href: '/bills?action=add-bill',
      color: 'bg-blue-500 hover:bg-blue-600',
      shadow: 'shadow-blue-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {actions.map((action, i) => (
        <Link key={i} href={action.href} className="group outline-none">
          <div className={`flex flex-col items-center justify-center p-4 rounded-2xl ${action.color} text-white shadow-lg ${action.shadow} transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl`}>
            <action.icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{action.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};
