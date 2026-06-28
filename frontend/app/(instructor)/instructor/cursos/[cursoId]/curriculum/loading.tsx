import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <SkeletonBase width={36} height={36} borderRadius={8} />
          <div>
            <SkeletonBase width={200} height={24} />
            <SkeletonBase width={140} height={14} style={{ marginTop: 4 }} />
          </div>
        </div>
        <SkeletonBase width={140} height={38} borderRadius={8} />
      </div>

      {/* Modules list */}
      <div className={styles.modulesList}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            marginBottom: 12,
          }}>
            <div style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SkeletonBase width={18} height={18} borderRadius={4} />
                <SkeletonBase width={180} height={16} />
              </div>
              <SkeletonBase width={16} height={16} borderRadius={4} />
            </div>
            {/* Lessons inside module */}
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} style={{
                padding: '10px 16px 10px 46px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderTop: '1px solid var(--border)',
              }}>
                <SkeletonBase width={14} height={14} borderRadius={3} />
                <SkeletonBase width={160} height={14} />
                <SkeletonBase width={60} height={14} />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <SkeletonBase width={28} height={28} borderRadius={4} />
                  <SkeletonBase width={28} height={28} borderRadius={4} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
