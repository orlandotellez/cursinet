'use client'

import Link from 'next/link';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { SkeletonBase } from '@/src/shared/skeleton';
import type { Notification as NotificationType } from '@/src/shared/types';
import styles from './NotificationCard.module.css';

interface NotificationCardProps {
  notification?: NotificationType;
  onMarkRead?: (id: string) => void;
  loading?: boolean;
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

export function NotificationCard({ notification, onMarkRead, loading }: NotificationCardProps) {
  if (loading) {
    return (
      <div className={styles.card}>
        <SkeletonBase width={36} height={36} borderRadius={9999} />
        <div className={styles.body}>
          <SkeletonBase width="60%" height={16} style={{ marginBottom: 4 }} />
          <SkeletonBase width="90%" height={14} style={{ marginBottom: 6 }} />
          <SkeletonBase width={60} height={12} />
        </div>
      </div>
    );
  }

  if (!notification) return null;

  const Icon = iconMap[notification.type];
  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <div
      className={`${styles.card} ${!notification.read ? styles.unread : ''}`}
      onClick={() => onMarkRead!(notification.id)}
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
