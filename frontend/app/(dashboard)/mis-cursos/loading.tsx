import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <SkeletonBase width={140} height={28} />
        <SkeletonBase width={80} height={16} />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
            <SkeletonBase width="100%" style={{ aspectRatio: '16 / 9' }} borderRadius={0} />
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <SkeletonBase width={60} height={20} borderRadius={4} />
                <SkeletonBase width={50} height={20} borderRadius={4} />
              </div>
              <SkeletonBase width="85%" height={18} />
              <SkeletonBase width="50%" height={14} />
              <SkeletonBase width="100%" height={6} borderRadius={5} />
              <SkeletonBase width={80} height={14} />
              <SkeletonBase width="100%" height={38} borderRadius={8} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
