import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cursos</h1>
          <p className={styles.subtitle}>Cargando cursos...</p>
        </div>
        <SkeletonBase width={140} height={38} borderRadius={8} />
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <SkeletonBase width={280} height={38} borderRadius={6} />
        </div>
        <SkeletonBase width={160} height={38} borderRadius={6} />
      </div>

      {/* Filter tabs */}
      <div className={styles.tabBar}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBase key={i} width={100} height={34} borderRadius={6} />
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <SkeletonBase width="100%" height={320} borderRadius={8} />
      </div>
    </div>
  );
}
