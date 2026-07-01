'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCIES } from '@/lib/constants';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { User, Settings, Palette, Globe } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUserSettings, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    try {
      setLoading(true);
      await updateUserSettings({ displayName });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateUserSettings({ currency });
      toast.success('Preferences saved. Currency updated globally.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    try {
      await updateUserSettings({ theme: newTheme as any });
    } catch (error) {
      // It's okay if this fails quietly
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-h2 font-display text-foreground">Settings</h1>
        <p className="text-body text-muted-foreground">Manage your profile and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation/Sidebar-ish for Settings */}
        <div className="space-y-2 md:col-span-1">
          <Card className="p-2 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-md font-medium text-left">
              <User className="w-5 h-5" />
              Profile
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-surface-sunken hover:text-foreground rounded-md font-medium text-left pointer-events-none opacity-50">
              <Settings className="w-5 h-5" />
              Security (Coming Soon)
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-surface-sunken hover:text-foreground rounded-md font-medium text-left pointer-events-none opacity-50">
              <Globe className="w-5 h-5" />
              Integrations (Coming Soon)
            </button>
          </Card>
        </div>

        {/* Main Forms */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Profile Section */}
          <Card className="p-6">
            <h2 className="text-h3 font-display text-foreground mb-4">Profile Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-body font-medium text-foreground">Email</label>
                <Input type="email" value={user.email || ''} disabled className="bg-surface-sunken text-muted-foreground" />
                <p className="text-caption text-muted-foreground">Your email address cannot be changed here.</p>
              </div>
              <div className="space-y-2">
                <label className="text-body font-medium text-foreground">Display Name</label>
                <Input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  placeholder="Enter your name"
                />
              </div>
              <Button type="submit" disabled={loading || displayName === user.displayName}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </Card>

          {/* Preferences Section */}
          <Card className="p-6">
            <h2 className="text-h3 font-display text-foreground mb-4">Application Preferences</h2>
            <form onSubmit={handleSavePreferences} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-body font-medium text-foreground">Base Currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-caption text-muted-foreground">This currency will be used across all your dashboard widgets and reports.</p>
              </div>

              <div className="space-y-2">
                <label className="text-body font-medium text-foreground">Theme</label>
                <Select value={theme || 'system'} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading || currency === user.currency}>
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 relative overflow-hidden border-negative/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-negative" />
            <h2 className="text-h3 font-display text-negative mb-4">Danger Zone</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sign Out</p>
                <p className="text-caption text-muted-foreground">Sign out of your current session on this device.</p>
              </div>
              <Button variant="outline" className="text-negative hover:bg-negative-soft border-negative/20 shrink-0" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

