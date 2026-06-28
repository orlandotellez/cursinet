'use client'

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SkeletonBase } from '@/src/shared/skeleton';
import type { Enrollment } from '@/src/shared/types';
import styles from './ContinueLearning.module.css';

interface ContinueLearningProps {
  enrollments: Enrollment[];
  loading?: boolean;
}

export function ContinueLearning({ enrollments, loading }: ContinueLearningProps) {
  if (loading) {
    return (
      <section>
        <SkeletonBase width={200} height={18} style={{ marginBottom: 16 }} />
        <div className={styles.grid}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <SkeletonBase width={48} height={48} borderRadius={8} className={styles.thumb} />
              <div className={styles.info}>
                <SkeletonBase width="70%" height={16} style={{ marginBottom: 8 }} />
                <div className={styles.progressWrap}>
                  <SkeletonBase width="100%" height={6} borderRadius={5} />
                  <SkeletonBase width={36} height={14} />
                </div>
              </div>
              <SkeletonBase width={18} height={18} borderRadius={9999} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const continueCourses = enrollments.filter(
    (e) => e.progress > 0 && e.progress < 100
  );

  return (
    <section>
      <h2 className={styles.sectionTitle}>Continúa aprendiendo</h2>
      <div className={styles.grid}>
        {continueCourses.length === 0 && (
          <p className={styles.emptyText}>No tienes cursos en progreso.</p>
        )}
        {continueCourses.map((enr) => (
          <Link
            key={enr.id}
            href="/mis-cursos"
            className={styles.card}
          >
            <div className={styles.thumb}>
              <span className={styles.letter}>
                {enr.course.title.charAt(0)}
              </span>
            </div>
            <div className={styles.info}>
              <h3 className={styles.title}>{enr.course.title}</h3>
              <div className={styles.progressWrap}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${enr.progress}%` }}
                  />
                </div>
                <span className={styles.progressText}>{enr.progress}%</span>
              </div>
            </div>
            <ChevronRight size={18} className={styles.chevron} />
          </Link>
        ))}
      </div>
    </section>
  );
}
