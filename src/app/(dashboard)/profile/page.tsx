'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { HiOutlineUserCircle, HiOutlineKey, HiOutlineCog6Tooth } from 'react-icons/hi2';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name is too short'),
  currency: z.string().min(1, 'Required'),
  theme: z.string().min(1, 'Required'),
  language: z.string().min(1, 'Required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      currency: user?.currency || 'USD',
      theme: user?.theme || 'dark',
      language: user?.language || 'en',
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: data.displayName,
        currency: data.currency,
        theme: data.theme,
        language: data.language,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-white/60 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <nav className="flex flex-col gap-1">
            <button className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-medium transition-colors">
              <HiOutlineUserCircle className="w-5 h-5 text-primary-400" />
              General
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors">
              <HiOutlineKey className="w-5 h-5 text-purple-400" />
              Security
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors">
              <HiOutlineCog6Tooth className="w-5 h-5 text-slate-400" />
              Advanced
            </button>
          </nav>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="glass-panel border-white/10 p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                <div className="w-20 h-20 rounded-full bg-primary-500/20 border-2 border-primary-500 flex items-center justify-center overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <HiOutlineUserCircle className="w-10 h-10 text-primary-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Profile Picture</h3>
                  <Button type="button" variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-xs">
                    Change Avatar
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Personal Information</h3>
                
                <Input
                  label="Display Name"
                  {...register('displayName')}
                  error={errors.displayName?.message}
                  placeholder="John Doe"
                />

                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  readOnly
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-lg font-medium text-white">Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Currency</label>
                    <select
                      {...register('currency')}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    >
                      <option value="USD" className="bg-slate-900">USD ($)</option>
                      <option value="EUR" className="bg-slate-900">EUR (€)</option>
                      <option value="GBP" className="bg-slate-900">GBP (£)</option>
                      <option value="JPY" className="bg-slate-900">JPY (¥)</option>
                      <option value="INR" className="bg-slate-900">INR (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Theme</label>
                    <select
                      {...register('theme')}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    >
                      <option value="dark" className="bg-slate-900">Dark</option>
                      <option value="light" className="bg-slate-900">Light</option>
                      <option value="system" className="bg-slate-900">System</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Language</label>
                    <select
                      {...register('language')}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    >
                      <option value="en" className="bg-slate-900">English</option>
                      <option value="es" className="bg-slate-900">Spanish</option>
                      <option value="fr" className="bg-slate-900">French</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
