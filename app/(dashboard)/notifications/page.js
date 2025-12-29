'use client';

import NotificationPanel from '@/components/notifications/NotificationPanel';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-gray-600 mt-1">Stay updated with your learning activities</p>
      </div>

      <NotificationPanel fullPage={true} />
    </div>
  );
}