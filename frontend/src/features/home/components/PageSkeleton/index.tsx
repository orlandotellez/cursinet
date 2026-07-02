import styles from './Skeleton.module.css';

export function PageSkeleton() {
  return (
    <div className={styles.pageSkeleton} aria-hidden="true">
      {/* ============================================
           Hero Section
      ============================================ */}
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={`${styles.skeleton} ${styles.badge}`} />

            <div className={`${styles.skeleton} ${styles.titleLine1}`} />
            <div className={`${styles.skeleton} ${styles.titleLine2}`} />

            <div className={`${styles.skeleton} ${styles.subtitleLine1}`} />
            <div className={`${styles.skeleton} ${styles.subtitleLine2}`} />

            <div className={styles.ctaRow}>
              <div className={`${styles.skeleton} ${styles.ctaPrimary}`} />
              <div className={`${styles.skeleton} ${styles.ctaGhost}`} />
            </div>

            <div className={styles.socialRow}>
              <div className={styles.avatarRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`${styles.skeleton} ${styles.avatar}`} />
                ))}
              </div>
              <div className={`${styles.skeleton} ${styles.socialText}`} />
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.catCard}>
              <div className={`${styles.skeleton} ${styles.catBadge}`} />
              <div className={`${styles.skeleton} ${styles.catGridTitle}`} />
              <div className={styles.catGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={styles.catItem}>
                    <div className={`${styles.skeleton} ${styles.catIconBox}`} />
                    <div className={styles.catInfo}>
                      <div className={`${styles.skeleton} ${styles.catNameLine}`} />
                      <div className={`${styles.skeleton} ${styles.catCountLine}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
           StatsBar
      ============================================ */}
      <section className={styles.statsSection}>
        <div className={styles.statsInner}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.statItem}>
              <div className={`${styles.skeleton} ${styles.statValue}`} />
              <div className={`${styles.skeleton} ${styles.statLabel}`} />
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
           Featured Courses
      ============================================ */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.skeleton} ${styles.sectionTitle}`} />
            <div className={`${styles.skeleton} ${styles.sectionSubtitle}`} />
          </div>

          <div className={styles.coursesGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.courseCard}>
                <div className={`${styles.skeleton} ${styles.thumbnail}`} />
                <div className={styles.cardContent}>
                  <div className={styles.cardMeta}>
                    <div className={`${styles.skeleton} ${styles.metaCategory}`} />
                    <div className={`${styles.skeleton} ${styles.metaLevel}`} />
                  </div>
                  <div className={`${styles.skeleton} ${styles.cardTitle}`} />
                  <div className={`${styles.skeleton} ${styles.cardTitleShort}`} />
                  <div className={`${styles.skeleton} ${styles.cardDesc1}`} />
                  <div className={`${styles.skeleton} ${styles.cardDesc2}`} />
                  <div className={styles.instructorRow}>
                    <div className={`${styles.skeleton} ${styles.instructorAvatarCircle}`} />
                    <div className={`${styles.skeleton} ${styles.instructorNameLine}`} />
                  </div>
                  <div className={styles.cardStats}>
                    <div className={`${styles.skeleton} ${styles.cardStat}`} />
                    <div className={`${styles.skeleton} ${styles.cardStat}`} />
                    <div className={`${styles.skeleton} ${styles.cardStat}`} />
                    <div className={`${styles.skeleton} ${styles.cardStat}`} />
                  </div>
                  <div className={`${styles.skeleton} ${styles.priceLine}`} />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.sectionFooter}>
            <div className={`${styles.skeleton} ${styles.viewAllBtn}`} />
          </div>
        </div>
      </section>

      {/* ============================================
           Categories Grid
      ============================================ */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.skeleton} ${styles.sectionTitle}`} />
            <div className={`${styles.skeleton} ${styles.sectionSubtitle}`} />
          </div>

          <div className={styles.categoriesGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.categoryCard}>
                <div className={`${styles.skeleton} ${styles.categoryIconBox}`} />
                <div className={styles.categoryInfo}>
                  <div className={`${styles.skeleton} ${styles.categoryNameLine}`} />
                  <div className={`${styles.skeleton} ${styles.categoryCountLine}`} />
                </div>
                <div className={`${styles.skeleton} ${styles.categoryArrowBox}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
           Final CTA
      ============================================ */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={`${styles.skeleton} ${styles.ctaTitleLine}`} />
          <div className={`${styles.skeleton} ${styles.ctaTextLine}`} />
          <div className={`${styles.skeleton} ${styles.ctaBtnLine}`} />
        </div>
      </section>
    </div>
  );
}
