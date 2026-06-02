'use client'

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Enrollment } from '@/src/shared/types';
import styles from './ContinueLearning.module.css';

interface ContinueLearningProps {
  enrollments: Enrollment[];
}

export function ContinueLearning({ enrollments }: ContinueLearningProps) {
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
