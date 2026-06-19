'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatRelativeDate } from '@/lib/utils';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  HiOutlineBell, 
  HiOutlineCheckCircle, 
  HiOutlineExclamationCircle, 
  HiOutlineInformationCircle,
  HiOutlineTrash
} from 'react-icons/hi2';

interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date | string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications, loading } = useCollection<AppNotification>('notifications', {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  });

  const filtered = notifications?.filter(n => filter === 'all' || !n.read) || [];

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (e) {
      console.error('Failed to delete notification', e);
    }
  };

  const markAllAsRead = async () => {
    if (!notifications) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <HiOutlineCheckCircle className="w-6 h-6 text-emerald-400" />;
      case 'warning': return <HiOutlineExclamationCircle className="w-6 h-6 text-amber-400" />;
      case 'error': return <HiOutlineExclamationCircle className="w-6 h-6 text-rose-400" />;
      default: return <HiOutlineInformationCircle className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-white/60 text-sm mt-1">Stay updated with your account activity</p>
        </div>
        
        {notifications && notifications.some(n => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'unread' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Unread
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20">
          <EmptyState
            icon={HiOutlineBell}
            title="All caught up!"
            description={filter === 'unread' ? "You have no unread notifications." : "You don't have any notifications yet."}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(notification => (
            <Card 
              key={notification.id} 
              className={`glass-panel border-white/10 p-4 transition-all duration-300 ${
                !notification.read ? 'bg-white/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/5 opacity-80'
              }`}
            >
              <div className="flex gap-4">
                <div className="mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-white/80'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-white/40 whitespace-nowrap ml-4">
                      {formatRelativeDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${!notification.read ? 'text-white/80' : 'text-white/60'}`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex gap-3 mt-3">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs text-white/40 hover:text-rose-400 font-medium transition-colors flex items-center gap-1"
                    >
                      <HiOutlineTrash className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
                
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
