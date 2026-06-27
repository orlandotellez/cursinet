'use client'

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { CourseThumbnail } from '@/src/features/courses/components/CourseThumbnail';
import { CourseLevelBadge } from '@/src/features/courses/components/CourseLevelBadge';
import { CourseStats } from '@/src/features/courses/components/CourseStats';
import type { CourseCardData } from '@/src/shared/types';
import styles from './FavoriteCard.module.css';

interface FavoriteCardProps {
  course: CourseCardData;
  onRemove: (id: string) => void;
}

export function FavoriteCard({ course, onRemove }: FavoriteCardProps) {
  return (
    <article className={styles.card}>
      <button
        className={styles.heartBtn}
        onClick={() => onRemove(course.id)}
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
