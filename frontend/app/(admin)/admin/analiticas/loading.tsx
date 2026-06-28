import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Analíticas</h1>
      <p className={styles.subtitle}>Cargando datos...</p>

      {/* Stats cards */}
      <div className={styles.statsGrid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.statCard}>
            <SkeletonBase width={24} height={24} borderRadius={6} />
            <div className={styles.statInfo}>
              <SkeletonBase width={60} height={24} />
              <SkeletonBase width={80} height={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart grid */}
      <div className={styles.grid}>
        {/* Revenue chart */}
        <div className={styles.card}>
          <div className={styles.chartHeader}>
            <SkeletonBase width={160} height={18} />
            <SkeletonBase width={200} height={32} borderRadius={6} />
          </div>
          <div className={styles.chartBody}>
            <SkeletonBase width="100%" height={240} borderRadius={8} />
          </div>
        </div>

        {/* Categories */}
        <div className={styles.card}>
          <SkeletonBase width={120} height={18} style={{ marginBottom: 20 }} />
          <div className={styles.catChart}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.catRow}>
                <div className={styles.catLabel}>
                  <SkeletonBase width={16} height={16} borderRadius={4} style={{ flexShrink: 0 }} />
                  <SkeletonBase width={100} height={14} />
                </div>
                <div className={styles.catBarWrap}>
                  <SkeletonBase width={`${60 + Math.random() * 30}%`} height={20} borderRadius={4} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User breakdown */}
        <div className={`${styles.card} ${styles.cardFull}`}>
          <SkeletonBase width={140} height={18} style={{ marginBottom: 16 }} />
          <div className={styles.userList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.userRow}>
                <div className={styles.userRowInfo}>
                  <SkeletonBase width={16} height={16} borderRadius={4} />
                  <SkeletonBase width={100} height={14} />
                </div>
                <SkeletonBase width={40} height={14} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
