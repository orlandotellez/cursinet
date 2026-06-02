'use client'

import Link from 'next/link';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { Notification as NotificationType } from '@/src/shared/types';
import styles from './NotificationCard.module.css';

interface NotificationCardProps {
  notification: NotificationType;
  onMarkRead: (id: string) => void;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: XCircle,
};

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

export function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  const Icon = iconMap[notification.type];
  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <div
      className={`${styles.card} ${!notification.read ? styles.unread : ''}`}
      onClick={() => onMarkRead(notification.id)}
    >
      <div className={`${styles.icon} ${styles[notification.type]}`}>
        <Icon size={18} />
      </div>
      <div className={styles.body}>
        <h4 className={styles.title}>{notification.title}</h4>
        <p className={styles.message}>{notification.message}</p>
        <span className={styles.time}>{timeAgo}</span>
      </div>
      {notification.link && (
        <Link
          href={notification.link}
          className={styles.link}
          onClick={(e) => e.stopPropagation()}
        >
          Ver
        </Link>
      )}
    </div>
  );
}
