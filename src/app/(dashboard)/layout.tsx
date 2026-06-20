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
  Sun
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
      className="p-2 rounded-full hover:bg-surface-sunken text-muted-foreground transition-colors"
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
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  if (!user.emailVerified) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md space-y-6 bg-surface p-8 rounded-xl border border-border shadow-sm">
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
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Resend verification email
            </button>
            <button
              onClick={logout}
              className="w-full bg-surface-sunken text-foreground py-2 rounded-md font-medium border border-border hover:bg-surface transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <ul className="space-y-1 px-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-body transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-surface z-10">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-h3 text-foreground font-display">FinanceFlow</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <NavLinks />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-surface px-4 lg:px-6 z-10">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-md">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 pt-10">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex h-16 items-center border-b px-6 absolute top-0 w-full bg-surface">
                  <span className="text-h3 text-foreground font-display">FinanceFlow</span>
                </div>
                <nav className="h-full overflow-y-auto py-4 mt-6">
                  <NavLinks onClick={() => setMobileMenuOpen(false)} />
                </nav>
              </SheetContent>
            </Sheet>
            <span className="lg:hidden text-h3 font-display">FinanceFlow</span>
            <div className="hidden md:flex gap-4 ml-4 flex-1">
              <GlobalSearch />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-surface-sunken flex items-center justify-center text-caption font-medium border">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

