import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

function FormSectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <SkeletonBase width={18} height={18} />
        <SkeletonBase width={100} height={16} />
      </div>
      <div className={styles.fields}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={i === 1 ? styles.fieldRow : undefined}>
            <div className={styles.field}>
              <SkeletonBase width={80} height={14} style={{ marginBottom: 6 }} />
              <SkeletonBase width="100%" height={40} borderRadius={6} />
            </div>
            {i === 1 && (
              <div className={styles.field}>
                <SkeletonBase width={80} height={14} style={{ marginBottom: 6 }} />
                <SkeletonBase width="100%" height={40} borderRadius={6} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className={styles.page}>
      <SkeletonBase width={180} height={28} style={{ marginBottom: 28 }} />
      <FormSectionSkeleton rows={4} />
      <FormSectionSkeleton rows={3} />
      <FormSectionSkeleton rows={2} />
      <SkeletonBase width={150} height={40} borderRadius={8} />
    </div>
  );
}
