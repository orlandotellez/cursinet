import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Cargando datos...</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <SkeletonBase width={20} height={20} borderRadius={6} />
              <SkeletonBase width={50} height={14} />
            </div>
            <SkeletonBase width={80} height={28} style={{ marginTop: 8 }} />
            <SkeletonBase width={60} height={14} style={{ marginTop: 4 }} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <SkeletonBase width={140} height={18} />
            <SkeletonBase width={200} height={32} borderRadius={6} />
          </div>
          <div className={styles.chartBody}>
            <SkeletonBase width="100%" height={200} borderRadius={8} />
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <SkeletonBase width={160} height={18} />
            <SkeletonBase width={200} height={32} borderRadius={6} />
          </div>
          <div className={styles.chartBody}>
            <SkeletonBase width="100%" height={200} borderRadius={8} />
          </div>
        </div>
      </div>

      {/* Recent users table */}
      <div className={styles.section}>
        <SkeletonBase width={140} height={18} style={{ marginBottom: 16 }} />
        <div className={styles.tableCard}>
          <SkeletonBase width="100%" height={240} borderRadius={8} />
        </div>
      </div>
    </div>
  );
}
