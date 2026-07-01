export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 sm:p-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-accent-subtle pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-accent flex items-center justify-center text-primary-foreground font-display font-bold text-xl shadow-lg shadow-accent/20 mb-5 ring-1 ring-accent/20">
            FF
          </div>
          <h1 className="text-h2 font-display text-foreground">FinanceFlow</h1>
          <p className="text-body text-muted-foreground mt-2 text-center">
            Your personal wealth operating system.
          </p>
        </div>
        <div className="animate-in">
          {children}
        </div>
      </div>
    </div>
  );
}

