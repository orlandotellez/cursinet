'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Play, Heart } from 'lucide-react';
import type { Enrollment } from '@/src/shared/types';
import type { CurriculumResponse } from '@/src/shared/api/curriculum';
import { useBookmarkStore } from '@/src/shared/store/useBookmarkStore';
import { getCurriculum } from '@/src/shared/api/curriculum';
import styles from './EnrolledCard.module.css';

interface EnrolledCardProps {
  enrollment: Enrollment;
}

const levelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

// ─── Module-level curriculum cache ──────────────────────────────────────────
const curriculumCache = new Map<string, CurriculumResponse>();

async function fetchCurriculum(courseId: string): Promise<CurriculumResponse> {
  if (!curriculumCache.has(courseId)) {
    const data = await getCurriculum(courseId);
    curriculumCache.set(courseId, data);
  }
  return curriculumCache.get(courseId)!;
}

function getNextLessonUrl(
  courseId: string,
  completedLessons: number,
  curriculum: CurriculumResponse,
): string | null {
  const allLessons = curriculum.modules
    .flatMap((m) => m.lessons)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Si completedLessons es 3, la próxima lección es la del índice 3 (0-based)
  const target = allLessons[completedLessons] ?? allLessons[0] ?? null;
  if (!target) return null;

  return `/aprender/${courseId}/${target.id}`;
}

export function EnrolledCard({ enrollment }: EnrolledCardProps) {
  const isCompleted = enrollment.progress === 100;
  const isBookmarked = useBookmarkStore((s) => s.isBookmarked(enrollment.courseId));
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);

  const [lessonUrl, setLessonUrl] = useState<string | null>(null);
  const [urlReady, setUrlReady] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      setUrlReady(true);
      return;
    }

    let cancelled = false;

    fetchCurriculum(enrollment.courseId)
      .then((curriculum) => {
        if (cancelled) return;
        const url = getNextLessonUrl(
          enrollment.courseId,
          enrollment.completedLessons,
          curriculum,
        );
        if (url) setLessonUrl(url);
      })
      .catch(() => {
        // Silently fail — fall back to course redirect below
      })
      .finally(() => {
        if (!cancelled) setUrlReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [enrollment.courseId, enrollment.completedLessons, isCompleted]);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(enrollment.courseId);
  };

  const href = isCompleted
    ? '/certificados'
    : (lessonUrl ?? `/aprender/${enrollment.courseId}`);

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
        <Link href={href} className={styles.continueBtn}>
          <Play size={14} />
          {isCompleted ? 'Ver certificado' : 'Continuar'}
        </Link>
      </div>
    </article>
  );
}
