'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  PieChart,
  Landmark,
  TrendingUp,
  Heart,
  Settings,
  FileText,
  Menu,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { GlobalSearch } from '@/components/ui/GlobalSearch';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Budgets', href: '/budgets', icon: PieChart },
  { label: 'Bills', href: '/bills', icon: FileText },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Loans', href: '/loans', icon: Landmark },
  { label: 'Investments', href: '/investments', icon: TrendingUp },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Analytics', href: '/analytics', icon: PieChart },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-surface-sunken text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout, resendVerification } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!user.emailVerified) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md w-full space-y-6 bg-surface p-8 rounded-xl border border-border shadow-sm animate-in">
          <div className="w-16 h-16 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-h2 font-display text-foreground">Verify your email</h2>
          <p className="text-body text-muted-foreground">
            We sent a verification email to <strong>{user.email}</strong>. Please verify your email to access the dashboard.
          </p>
          <div className="pt-4 space-y-3">
            <button
              onClick={async () => {
                try {
                  await resendVerification();
                  alert('Verification email resent!');
                } catch (e: any) {
                  alert(e.message || 'Failed to resend email');
                }
              }}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Resend verification email
            </button>
            <button
              onClick={logout}
              className="w-full bg-surface-sunken text-foreground py-2 rounded-lg font-medium border border-border hover:bg-surface transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const NavLinks = ({ onClick, inSheet = false }: { onClick?: () => void; inSheet?: boolean }) => (
    <ul className="space-y-0.5 px-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onClick}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-body transition-all duration-200",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-sunken"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary shadow-sm" />
              )}

              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
              )} />
              <span>{item.label}</span>

              {/* Subtle shimmer for active item */}
              {isActive && (
                <span className="absolute inset-0 rounded-lg bg-gradient-accent-soft pointer-events-none" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface">
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-accent flex items-center justify-center text-primary-foreground font-display font-bold text-sm shadow-sm">
            FF
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className="text-h3 text-foreground font-display leading-tight">FinanceFlow</span>
            <span className="text-[11px] text-muted-foreground font-medium tracking-wide">Wealth OS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <NavLinks />
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 px-1">
            <div className="h-9 w-9 rounded-full bg-gradient-accent flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0 shadow-sm">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-muted-foreground hover:text-negative hover:bg-negative-soft transition-all duration-200"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-md px-4 lg:px-6 z-10">
          <div className="flex items-center gap-4 flex-1">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface-sunken transition-all duration-200">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 pt-14">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex h-14 items-center gap-3 border-b border-border px-6 fixed top-0 w-full bg-surface z-10">
                  <div className="h-7 w-7 rounded-lg bg-gradient-accent flex items-center justify-center text-primary-foreground font-display font-bold text-xs">
                    FF
                  </div>
                  <span className="text-h3 text-foreground font-display">FinanceFlow</span>
                </div>
                <nav className="h-full overflow-y-auto py-4">
                  <NavLinks onClick={() => setMobileMenuOpen(false)} inSheet />
                </nav>
              </SheetContent>
            </Sheet>

            {/* Mobile brand */}
            <span className="lg:hidden text-h3 font-display text-foreground">FinanceFlow</span>

            {/* Search */}
            <div className="hidden md:flex ml-2 flex-1 max-w-md">
              <GlobalSearch />
            </div>
          </div>

          {/* Topbar Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-gradient-accent flex items-center justify-center text-primary-foreground text-xs font-semibold shadow-sm">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background bg-noise">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

