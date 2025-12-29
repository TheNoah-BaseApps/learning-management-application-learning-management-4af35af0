'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NotificationBadgeProps {
  count?: number;
  onClick?: () => void;
}

export default function NotificationBadge({ count = 0, onClick }: NotificationBadgeProps) {
  const [notificationCount, setNotificationCount] = useState(count);

  useEffect(() => {
    setNotificationCount(count);
  }, [count]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
      aria-label="Notifications"
    >
      <Bell className="h-6 w-6" />
      {notificationCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {notificationCount > 99 ? '99+' : notificationCount}
        </span>
      )}
    </button>
  );
}