import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

function PlanCardSkeleton() {
  return (
    <div className={styles.planCard}>
      <SkeletonBase width={100} height={22} style={{ marginBottom: 16 }} />
      <div className={styles.planPrice}>
        <SkeletonBase width={80} height={36} />
      </div>
      <ul className={styles.featureList}>
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className={styles.featureItem}>
            <SkeletonBase width={16} height={16} borderRadius={4} style={{ flexShrink: 0 }} />
            <SkeletonBase width="80%" height={14} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Loading() {
  return (
    <div className={styles.page}>
      <SkeletonBase width={200} height={28} style={{ marginBottom: 32 }} />
      <div className={styles.currentPlan}>
        <SkeletonBase width={160} height={28} borderRadius={100} style={{ marginBottom: 12 }} />
        <SkeletonBase width="80%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonBase width="50%" height={16} />
      </div>
      <div className={styles.plansGrid}>
        <PlanCardSkeleton />
        <PlanCardSkeleton />
      </div>
    </div>
  );
}
