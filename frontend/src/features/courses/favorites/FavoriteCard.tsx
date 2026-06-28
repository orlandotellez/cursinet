'use client'

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { SkeletonBase } from '@/src/shared/skeleton';
import { CourseThumbnail } from '@/src/features/courses/components/CourseThumbnail';
import { CourseLevelBadge } from '@/src/features/courses/components/CourseLevelBadge';
import { CourseStats } from '@/src/features/courses/components/CourseStats';
import type { CourseCardData } from '@/src/shared/types';
import styles from './FavoriteCard.module.css';

interface FavoriteCardProps {
  course?: CourseCardData;
  onRemove?: (id: string) => void;
  loading?: boolean;
}

export function FavoriteCard({ course, onRemove, loading }: FavoriteCardProps) {
  if (loading) {
    return (
      <article className={styles.card}>
        <div className={styles.link}>
          <div style={{ aspectRatio: '16 / 9', background: 'var(--bg-elevated)' }}>
            <SkeletonBase width="100%" height="100%" />
          </div>
          <div className={styles.body}>
            <div className={styles.meta}>
              <SkeletonBase width={60} height={14} />
              <SkeletonBase width={50} height={14} />
            </div>
            <SkeletonBase width="85%" height={18} />
            <SkeletonBase width="100%" height={14} />
            <SkeletonBase width="60%" height={14} />
          </div>
        </div>
      </article>
    );
  }

  if (!course) return null;

  return (
    <article className={styles.card}>
      <button
        className={styles.heartBtn}
        onClick={() => onRemove?.(course.id)}
        aria-label="Quitar de favoritos"
      >
        <Heart size={18} className={styles.heartFilled} />
      </button>
      <Link href={`/cursos/${course.slug}`} className={styles.link}>
        <CourseThumbnail title={course.title} />

        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={styles.category}>{course.category.name}</span>
            <CourseLevelBadge level={course.level} />
          </div>

          <h3 className={styles.title}>{course.title}</h3>
          <p className={styles.description}>{course.shortDescription}</p>

          <CourseStats
            duration={course.duration}
            lessonsCount={course.lessonsCount}
            rating={course.rating}
            studentsCount={course.studentsCount}
          />
        </div>
      </Link>
    </article>
  );
}
