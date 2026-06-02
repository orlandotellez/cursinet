'use client'

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { mockNotifications } from '@/src/features/courses/data';
import type { Notification as NotificationType } from '@/src/shared/types';
import { NotificationCard } from '@/src/features/notifications/components/NotificationCard';
import styles from './page.module.css';

export default function NotificacionesPage() {
  const [notifications, setNotifications] =
    useState<NotificationType[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notificaciones</h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>
              {unreadCount} sin leer
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={markAllRead}>
            <CheckCheck size={16} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={styles.empty}>
          <Bell size={48} />
          <h3 className={styles.emptyTitle}>Sin notificaciones</h3>
          <p className={styles.emptyText}>
            No tienes notificaciones nuevas.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onMarkRead={markOneRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
