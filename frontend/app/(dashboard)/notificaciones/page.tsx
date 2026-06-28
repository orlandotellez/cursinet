'use client'

import { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { SkeletonBase } from '@/src/shared/skeleton';
import type { Notification } from '@/src/shared/types';
import { NotificationCard } from '@/src/features/notifications/components/NotificationCard';
import styles from './page.module.css';

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    // TODO: Reemplazar con llamada real a API de notificaciones cuando exista
    // const notifications = await getMyNotifications();
    // setNotifications(notifications);
    setIsLoading(false);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {isLoading ? (
          <SkeletonBase width={200} height={28} />
        ) : (
          <>
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
          </>
        )}
      </div>

      {isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <NotificationCard key={i} loading />
          ))}
        </div>
      ) : notifications.length === 0 ? (
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
