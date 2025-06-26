
import React, { useState } from 'react';
import { Notification, Gym } from '../types';
import { mockNotifications, mockGyms } from '../utils/mockData';
import { BellAlertIcon, CheckCircleIcon, EyeIcon, TagIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const NotificationItem: React.FC<{ notification: Notification; onMarkRead: (id: string) => void }> = ({ notification, onMarkRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'new_route': return <TagIcon className="h-6 w-6 text-blue-500" />;
      case 'event': return <BellAlertIcon className="h-6 w-6 text-yellow-500" />;
      case 'gym_update': return <BellAlertIcon className="h-6 w-6 text-indigo-500" />;
      case 'mention': return <EyeIcon className="h-6 w-6 text-green-500" />;
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
        >
          <CheckCircleIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(n => filter === 'all' || !n.read)
                                          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const unreadCount = notifications.filter(n => !n.read).length;

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
    