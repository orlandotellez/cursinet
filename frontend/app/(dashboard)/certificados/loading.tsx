import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

function CertCardSkeleton() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <SkeletonBase width={48} height={48} borderRadius={8} />
        <div>
          <SkeletonBase width={220} height={18} style={{ marginBottom: 4 }} />
          <SkeletonBase width={180} height={14} />
        </div>
      </div>
      <SkeletonBase width={120} height={36} borderRadius={8} />
    </div>
  );
}

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <SkeletonBase width={140} height={28} />
        <SkeletonBase width={100} height={16} />
      </div>
      <div className={styles.list}>
        {Array.from({ length: 3 }).map((_, i) => (
          <CertCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
