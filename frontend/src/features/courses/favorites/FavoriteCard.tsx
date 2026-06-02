'use client'

import Link from 'next/link';
import { Heart, Clock, BookOpen, Star, Users } from 'lucide-react';
import type { CourseCardData } from '@/src/shared/types';
import styles from './FavoriteCard.module.css';

interface FavoriteCardProps {
  course: CourseCardData;
  onRemove: (id: string) => void;
}

const levelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

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
        <div className={styles.thumbnail}>
          <span className={styles.letter}>{course.title.charAt(0)}</span>
        </div>
        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={styles.category}>{course.category.name}</span>
            <span className={`${styles.levelBadge} ${styles[course.level]}`}>
              {levelLabels[course.level] || course.level}
            </span>
          </div>
          <h3 className={styles.title}>{course.title}</h3>
          <p className={styles.description}>{course.shortDescription}</p>
          <div className={styles.stats}>
            <span className={styles.stat}>
              <Clock size={12} />
              {course.duration}h
            </span>
            <span className={styles.stat}>
              <BookOpen size={12} />
              {course.lessonsCount} lec.
            </span>
            <span className={styles.stat}>
              <Star size={12} />
              {course.rating}
            </span>
            <span className={styles.stat}>
              <Users size={12} />
              {course.studentsCount.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
