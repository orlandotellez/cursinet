import { SkeletonBase, SkeletonStatsGrid, SkeletonContinueCard, SkeletonCertCard } from '@/src/shared/skeleton';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <SkeletonBase width={260} height={28} style={{ marginBottom: 8 }} />
          <SkeletonBase width={200} height={14} />
        </div>
        <SkeletonBase width={140} height={40} borderRadius={8} />
      </div>

      {/* Stats Grid */}
      <div style={{ marginBottom: 32 }}>
        <SkeletonStatsGrid count={4} />
      </div>

      {/* Continue Learning */}
      <div style={{ marginBottom: 32 }}>
        <SkeletonBase width={200} height={18} style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonContinueCard key={i} />
          ))}
        </div>
      </div>

      {/* Recent Certificates */}
      <div>
        <SkeletonBase width={200} height={18} style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCertCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
