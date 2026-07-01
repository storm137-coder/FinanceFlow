'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export default function ResetPasswordPage() {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof resetSchema>) => {
    try {
      setIsLoading(true);
      await forgotPassword(data.email);
      setIsSent(true);
      toast.success('Password reset email sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-lg shadow-accent/5">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-2xl font-display">Reset password</CardTitle>
        <CardDescription>
          Enter your email address and we will send you a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="text-success font-medium">Check your email</div>
            <p className="text-sm text-muted-foreground">
              We have sent a password reset link to {form.getValues().email}.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

