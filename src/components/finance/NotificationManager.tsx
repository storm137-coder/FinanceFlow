'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellRing, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';

export function NotificationManager() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support desktop notifications');
      return;
    }

    try {
      setLoading(true);
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        if (!messaging) {
          toast.error('Firebase Messaging is not initialized properly.');
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey || vapidKey.includes('your_vapid_key')) {
          toast.error('Please configure your VAPID key in .env.local first!');
          return;
        }

        const token = await getToken(messaging, { vapidKey });
        
        if (token) {
          setFcmToken(token);
          toast.success('Notifications enabled! Token generated.');
        } else {
          toast.error('No registration token available.');
        }
      } else {
        toast.error('Notification permission was denied.');
      }
    } catch (error: any) {
      toast.error('Error enabling notifications: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!fcmToken) return;

    try {
      setLoading(true);
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: fcmToken }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Test notification sent successfully!');
      } else {
        toast.error(data.error || 'Failed to send test notification');
      }
    } catch (error) {
      toast.error('Error sending test notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Push Notifications</CardTitle>
        </div>
        <CardDescription>
          Receive alerts on your iPhone by adding this app to your Home Screen and enabling notifications below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission !== 'granted' ? (
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <p>Turn on notifications to get real-time updates.</p>
            </div>
            <Button onClick={requestPermission} disabled={loading} className="w-full sm:w-auto">
              Enable Notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-success/10 text-success rounded-lg border border-success/20">
              <BellRing className="h-5 w-5" />
              <div>
                <p className="font-medium">Notifications are Enabled!</p>
                <p className="text-sm opacity-90">You will receive alerts on this device.</p>
              </div>
            </div>
            
            {fcmToken && (
              <Button onClick={sendTestNotification} disabled={loading} variant="outline" className="w-full sm:w-auto">
                Send Test Notification
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
