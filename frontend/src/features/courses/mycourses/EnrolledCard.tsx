'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Play, Heart } from 'lucide-react';
import { SkeletonBase } from '@/src/shared/skeleton';
import { CourseLevelBadge } from '@/src/features/courses/components/CourseLevelBadge';
import type { Enrollment } from '@/src/shared/types';
import type { CurriculumResponse } from '@/src/shared/api/courses';
import { useBookmarkStore } from '@/src/shared/store/useBookmarkStore';
import { getCurriculum } from '@/src/shared/api/courses';
import styles from './EnrolledCard.module.css';

interface EnrolledCardProps {
  enrollment?: Enrollment;
  loading?: boolean;
}

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

  const target = allLessons[completedLessons] ?? allLessons[0] ?? null;
  if (!target) return null;

  return `/aprender/${courseId}/${target.id}`;
}

export function EnrolledCard({ enrollment, loading }: EnrolledCardProps) {
  // ── Hooks unconditionales (React Rules of Hooks) ──
  const isBookmarked = useBookmarkStore((s) =>
    enrollment ? s.isBookmarked(enrollment.courseId) : false,
  );
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);

  const [lessonUrl, setLessonUrl] = useState<string | null>(null);
  const [urlReady, setUrlReady] = useState(false);

  const isCompleted = enrollment ? enrollment.progress === 100 : false;

  useEffect(() => {
    if (loading || !enrollment) return;
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
  }, [loading, enrollment?.courseId, enrollment?.completedLessons, isCompleted]);

  // ── Early returns (solo después de los hooks) ──
  if (loading) {
    return (
      <article className={styles.card}>
        <div className={styles.thumbnail}>
          <SkeletonBase width="100%" height="100%" />
        </div>
        <div className={styles.body}>
          <div className={styles.meta}>
            <SkeletonBase width={60} height={14} />
            <SkeletonBase width={50} height={14} />
          </div>
          <SkeletonBase width="80%" height={18} />
          <SkeletonBase width="50%" height={14} />
          <div className={styles.progressWrap}>
            <SkeletonBase width="100%" height={6} borderRadius={5} />
            <SkeletonBase width={80} height={14} />
          </div>
          <SkeletonBase width="100%" height={38} borderRadius={8} />
        </div>
      </article>
    );
  }

  if (!enrollment) return null;

  // ── Handlers & derived values ──
  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(enrollment.courseId);
  };

  const courseUrl = lessonUrl ?? `/aprender/${enrollment.courseId}`;

  return (
    <article className={styles.card}>
      <div className={styles.thumbnail}>
        {enrollment.course.thumbnail ? (
          <Image
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className={styles.thumbImg}
          />
        ) : (
          <span className={styles.letter}>
            {enrollment.course.title.charAt(0)}
          </span>
        )}
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
          <CourseLevelBadge level={enrollment.course.level} />
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
        {isCompleted ? (
          <div className={styles.completedActions}>
            <Link href={courseUrl} className={styles.secondaryBtn}>
              <Play size={14} />
              Ver curso
            </Link>
            <Link href="/certificados" className={styles.continueBtn}>
              Ver certificado
            </Link>
          </div>
        ) : (
          <Link href={courseUrl} className={styles.continueBtn}>
            <Play size={14} />
            Continuar
          </Link>
        )}
      </div>
    </article>
  );
}
