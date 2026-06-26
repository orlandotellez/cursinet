'use client'

import Link from 'next/link';
import { Play, Heart } from 'lucide-react';
import type { Enrollment } from '@/src/shared/types';
import { useBookmarkStore } from '@/src/shared/store/useBookmarkStore';
import styles from './EnrolledCard.module.css';

interface EnrolledCardProps {
  enrollment: Enrollment;
}

const levelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function EnrolledCard({ enrollment }: EnrolledCardProps) {
  const isCompleted = enrollment.progress === 100;
  const isBookmarked = useBookmarkStore((s) => s.isBookmarked(enrollment.courseId));
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(enrollment.courseId);
  };

  return (
    <article className={styles.card}>
      <div className={styles.thumbnail}>
        <span className={styles.letter}>
          {enrollment.course.title.charAt(0)}
        </span>
        <button
          className={`${styles.favBtn} ${isBookmarked ? styles.favActive : ''}`}
          onClick={handleToggleFav}
          aria-label={isBookmarked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart
            size={16}
            fill={isBookmarked ? 'currentColor' : 'none'}
          />
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>
            {enrollment.course.category.name}
          </span>
          <span className={`${styles.levelBadge} ${styles[enrollment.course.level]}`}>
            {levelLabels[enrollment.course.level] || enrollment.course.level}
          </span>
        </div>
        <h3 className={styles.title}>{enrollment.course.title}</h3>
        <p className={styles.instructor}>{enrollment.course.instructor.name}</p>
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${isCompleted ? styles.progressDone : ''}`}
              style={{ width: `${enrollment.progress}%` }}
            />
          </div>
          <span className={styles.progressLabel}>
            {enrollment.completedLessons}/{enrollment.totalLessons} lecciones
          </span>
        </div>
        <Link
          href={
            isCompleted
              ? '/certificados'
              : `/aprender/${enrollment.courseId}`
          }
          className={styles.continueBtn}
        >
          <Play size={14} />
          {isCompleted ? 'Ver certificado' : 'Continuar'}
        </Link>
      </div>
    </article>
  );
}
