import Link from 'next/link';
import s from '@/src/shared/styles/skeleton.module.css';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb — always visible */}
        <nav className={styles.breadcrumb}>
          <Link href="/cursos">Cursos</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={s.base} style={{ width: 220, height: 15, display: 'inline-block', borderRadius: 4 }} />
        </nav>

        {/* Hero skeleton */}
        <div className={styles.heroSkeleton}>
          <div className={styles.heroSkeletonBody}>
            <div className={s.base} style={{ width: 80, height: 22, borderRadius: 100 }} />
            <div className={s.base} style={{ width: '90%', height: 34, marginTop: 4 }} />
            <div className={s.base} style={{ width: '70%', height: 34 }} />
            <div className={s.base} style={{ width: '100%', height: 16, marginTop: 8 }} />
            <div className={s.base} style={{ width: '60%', height: 16 }} />
            <div className={styles.heroSkeletonMeta}>
              <div className={s.base} style={{ width: 120, height: 16 }} />
              <div className={s.base} style={{ width: 100, height: 16 }} />
              <div className={s.base} style={{ width: 60, height: 16 }} />
            </div>
            <div className={styles.heroSkeletonMeta}>
              <div className={s.base} style={{ width: 160, height: 40, borderRadius: 8 }} />
              <div className={s.base} style={{ width: 140, height: 48, borderRadius: 8 }} />
            </div>
          </div>
          <div className={styles.heroSkeletonThumb}>
            <div className={s.base} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
          </div>
        </div>

        {/* Description section skeleton */}
        <section className={styles.section}>
          <div className={s.base} style={{ width: 120, height: 22, marginBottom: 20 }} />
          <div className={s.base} style={{ width: '100%', height: 14, marginBottom: 10 }} />
          <div className={s.base} style={{ width: '100%', height: 14, marginBottom: 10 }} />
          <div className={s.base} style={{ width: '70%', height: 14 }} />
        </section>

        {/* What you'll learn skeleton */}
        <section className={styles.section}>
          <div className={s.base} style={{ width: 180, height: 22, marginBottom: 20 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={s.base} style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0 }} />
                <div className={s.base} style={{ flex: 1, height: 14 }} />
              </div>
            ))}
          </div>
        </section>

        {/* Curriculum skeleton */}
        <section className={styles.section}>
          <div className={s.base} style={{ width: 200, height: 22, marginBottom: 20 }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={s.base}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
          ))}
        </section>

        {/* Instructor skeleton */}
        <section className={styles.section}>
          <div className={s.base} style={{ width: 120, height: 22, marginBottom: 20 }} />
          <div
            className={s.base}
            style={{
              width: '100%',
              height: 120,
              borderRadius: 12,
            }}
          />
        </section>
      </div>
    </div>
  );
}
