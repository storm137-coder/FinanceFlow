export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 text-primary-foreground font-display font-bold text-xl">
            FF
          </div>
          <h1 className="text-h2 font-display text-foreground">FinanceFlow</h1>
          <p className="text-body text-muted-foreground mt-2 text-center">
            Your personal wealth operating system.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

