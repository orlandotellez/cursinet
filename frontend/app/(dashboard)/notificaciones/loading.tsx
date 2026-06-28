import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

function NotificationSkeleton() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
    }}>
      <SkeletonBase width={40} height={40} borderRadius={9999} />
      <div style={{ flex: 1 }}>
        <SkeletonBase width="60%" height={16} style={{ marginBottom: 4 }} />
        <SkeletonBase width="40%" height={13} />
      </div>
      <SkeletonBase width={50} height={12} />
    </div>
  );
}

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <SkeletonBase width={200} height={28} />
      </div>
      <div className={styles.list}>
        {Array.from({ length: 5 }).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
