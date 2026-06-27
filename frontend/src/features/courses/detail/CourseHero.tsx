'use client';

import { Star, Users, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Course } from '@/src/shared/types';
import styles from './CourseHero.module.css';

interface CourseHeroProps {
  course: Course;
  enrolled: boolean;
  firstLessonHref: string;
  onEnroll: () => void;
}

function levelLabel(level: string) {
  if (level === 'beginner') return 'Principiante';
  if (level === 'intermediate') return 'Intermedio';
  return 'Avanzado';
}

export function CourseHero({ course, enrolled, firstLessonHref, onEnroll }: CourseHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBody}>
        <div className={styles.heroBadge}>{levelLabel(course.level)}</div>

        <h1 className={styles.heroTitle}>{course.title}</h1>
        <p className={styles.heroDesc}>{course.shortDescription}</p>

        <div className={styles.heroMeta}>
          <div className={styles.heroRating}>
            <Star size={16} className={styles.starFilled} />
            <span>{course.rating}</span>
            <span className={styles.heroMetaMuted}>({course.reviewsCount} reseñas)</span>
          </div>
          <div className={styles.heroStat}>
            <Users size={16} />
            <span>{course.studentsCount.toLocaleString()} estudiantes</span>
          </div>
          <div className={styles.heroStat}>
            <Clock size={16} />
            <span>{course.duration}h</span>
          </div>
        </div>

        <div className={styles.heroInstructor}>
          <Link
            href={`/instructores/${course.instructor.username}`}
            className={styles.heroInstructorLink}
          >
            <div className={styles.heroInstructorAvatar}>
              {course.instructor.name.charAt(0)}
            </div>
            <div className={styles.heroInstructorInfo}>
              <span className={styles.heroInstructorName}>{course.instructor.name}</span>
              <span className={styles.heroInstructorRole}>{course.instructor.role}</span>
            </div>
          </Link>
        </div>

        <div className={styles.heroCta}>
          <div className={styles.heroPrice}>${course.price.toFixed(2)}</div>
          {enrolled ? (
            <Link href={firstLessonHref} className={styles.enrollBtn}>
              Comenzar curso
              <ArrowRight size={18} />
            </Link>
          ) : (
            <button className={styles.enrollBtn} onClick={onEnroll}>
              Inscribirse ahora
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {enrolled && (
          <div className={styles.enrolledBadge}>
            <CheckCircle2 size={16} />
            <span>Inscripto — accedé a todas las lecciones</span>
          </div>
        )}
      </div>

      <div className={styles.heroVisual}>
        <div className={styles.heroThumb}>
          <span className={styles.heroThumbText}>{course.title.charAt(0)}</span>
        </div>
      </div>
    </section>
  );
}
