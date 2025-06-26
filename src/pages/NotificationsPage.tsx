
import React, { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { BellAlertIcon, CheckCircleIcon, EyeIcon, TagIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const NotificationItem: React.FC<{ notification: Notification; onMarkRead: (id: string) => void }> = ({ notification, onMarkRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'new_route': return <TagIcon className="h-6 w-6 text-blue-500" />;
      case 'event': return <BellAlertIcon className="h-6 w-6 text-yellow-500" />;
      case 'gym_update': return <BellAlertIcon className="h-6 w-6 text-indigo-500" />;
      case 'mention': return <EyeIcon className="h-6 w-6 text-green-500" />;
      case 'store_new_item': return <ShoppingBagIcon className="h-6 w-6 text-purple-500" />;
      default: return <BellAlertIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow transition-all duration-300 flex items-start space-x-4 ${notification.read ? 'bg-slate-100 opacity-70' : 'bg-white hover:shadow-md'}`}>
      <div className="flex-shrink-0 mt-1">
        {notification.relatedGym?.logoUrl ? (
          <img src={notification.relatedGym.logoUrl} alt={notification.relatedGym.name} className="h-10 w-10 rounded-full object-cover"/>
        ) : (
          getIcon()
        )}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-semibold text-slate-800">{notification.title}</h3>
          <span className="text-xs text-neutral">{new Date(notification.date).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
        {notification.link && (
          <Link to={notification.link} className="text-sm text-primary hover:underline mt-1 inline-block">
            View Details
          </Link>
        )}
      </div>
      {!notification.read && (
        <button 
          onClick={() => onMarkRead(notification.id)} 
          title="Mark as read"
          className="text-secondary hover:text-green-700 transition-colors p-1 rounded-full"
          aria-label="Mark as read"
        >
          <CheckCircleIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  const fetchApi = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api${url}`, { ...options, headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API request failed: ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchApi('/notifications');
        setNotifications(response?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
        console.error("Error fetching notifications:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [fetchApi]);


  const handleMarkRead = async (id: string) => {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
        alert(`Error marking notification as read: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
        await fetchApi('/notifications/mark-all-read', { method: 'POST' });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
        alert(`Error marking all as read: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const filteredNotifications = notifications.filter(n => filter === 'all' || !n.read)
                                          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return <LoadingSpinner message="Loading notifications..." />;
  }
  if (error) {
    return <div className="max-w-3xl mx-auto text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-primary hover:underline"
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div className="mb-6 flex space-x-2 border-b border-slate-200">
        <button 
          onClick={() => setFilter('unread')}
          className={`py-2 px-4 text-sm font-medium ${filter === 'unread' ? 'border-b-2 border-primary text-primary' : 'text-neutral hover:text-slate-700'}`}
        >
          Unread
        </button>
        <button 
          onClick={() => setFilter('all')}
          className={`py-2 px-4 text-sm font-medium ${filter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-neutral hover:text-slate-700'}`}
        >
          All
        </button>
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} onMarkRead={handleMarkRead} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <BellAlertIcon className="h-16 w-16 text-slate-300 mx-auto mb-4"/>
          <p className="text-slate-500">
            {filter === 'unread' ? "You're all caught up!" : "No notifications yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
