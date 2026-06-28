import Link from 'next/link';
import { SkeletonBase, SkeletonTextLines } from '@/src/shared/skeleton';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/cursos">Cursos</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <SkeletonBase width={220} height={15} style={{ display: 'inline-block' }} />
        </nav>

        {/* Hero */}
        <div className={styles.heroSkeleton}>
          <div className={styles.heroSkeletonBody}>
            <SkeletonBase width={80} height={22} borderRadius={100} />
            <SkeletonBase width="90%" height={34} style={{ marginTop: 4 }} />
            <SkeletonBase width="70%" height={34} />
            <SkeletonTextLines lines={2} widths={['100%', '60%']} lineHeight={16} gap={8} />
            <div className={styles.heroSkeletonMeta}>
              <SkeletonBase width={120} height={16} />
              <SkeletonBase width={100} height={16} />
              <SkeletonBase width={60} height={16} />
            </div>
            <div className={styles.heroSkeletonMeta}>
              <SkeletonBase width={160} height={40} borderRadius={8} />
              <SkeletonBase width={140} height={48} borderRadius={8} />
            </div>
          </div>
          <div className={styles.heroSkeletonThumb}>
            <SkeletonBase width="100%" height="100%" borderRadius={12} />
          </div>
        </div>

        {/* Description */}
        <section className={styles.section}>
          <SkeletonBase width={120} height={22} style={{ marginBottom: 20 }} />
          <SkeletonTextLines lines={3} widths={['100%', '100%', '70%']} lineHeight={14} gap={10} />
        </section>

        {/* What you'll learn */}
        <section className={styles.section}>
          <SkeletonBase width={180} height={22} style={{ marginBottom: 20 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <SkeletonBase width={18} height={18} borderRadius={4} style={{ flexShrink: 0 }} />
                <SkeletonBase style={{ flex: 1, height: 14 }} />
              </div>
            ))}
          </div>
        </section>

        {/* Curriculum */}
        <section className={styles.section}>
          <SkeletonBase width={200} height={22} style={{ marginBottom: 20 }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBase key={i} width="100%" height={48} borderRadius={8} style={{ marginBottom: 8 }} />
          ))}
        </section>

        {/* Instructor */}
        <section className={styles.section}>
          <SkeletonBase width={120} height={22} style={{ marginBottom: 20 }} />
          <SkeletonBase width="100%" height={120} borderRadius={12} />
        </section>
      </div>
    </div>
  );
}
