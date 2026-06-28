import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Cursos</h1>
          <p className={styles.subtitle}>Gestioná tus cursos.</p>
        </div>
        <SkeletonBase width={140} height={38} borderRadius={8} />
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <SkeletonBase width={280} height={38} borderRadius={6} />
        </div>
        <div className={styles.tabs}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBase key={i} width={100} height={34} borderRadius={6} />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <SkeletonBase width="100%" height={360} borderRadius={8} />
      </div>
    </div>
  );
}
